import {InferenceSession, Tensor} from 'onnxruntime-react-native';
import axios from 'axios';
import RNFS from 'react-native-fs';
import manifestData from '../assets/metadata/model_manifest.json';

export class ServiceError extends Error {
  constructor(public code: string, message: string) { super(message); this.name = 'ServiceError'; }
}
export const MODEL_INFO = manifestData;
const API_URL = 'https://marvelkn-essenza-fingerprint-api.hf.space';
const ENDPOINT = '/gradio_api/call/predict';
export interface PredictionResult { label: string; probability: number; threshold: number; }
export interface FingerprintResponse {
  fingerprint: number[]; combined_smiles: string; molecular_formula: string | null;
  molecular_weight: number | null; iupac_name: string | null; warning: string | null;
}
const featureCount = manifestData.feature_spec.n_bits + (manifestData.feature_spec.use_descriptors ? 5 : 0);
function cancelled(signal?: AbortSignal) {
  if (signal?.aborted) { throw new ServiceError('CANCELLED', 'Analysis cancelled.'); }
}
export function validateFeatures(value: unknown): asserts value is number[] {
  if (!Array.isArray(value) || value.length !== featureCount ||
      value.some(v => typeof v !== 'number' || !Number.isFinite(v))) {
    throw new ServiceError('INVALID_FEATURES', 'The service returned invalid molecular features.');
  }
  if (value.slice(0, manifestData.feature_spec.n_bits).some(v => v !== 0 && v !== 1)) {
    throw new ServiceError('INVALID_FEATURES', 'The fingerprint is not binary.');
  }
}
export function parseGradioQueueResult(payload: unknown): any {
  if (typeof payload !== 'string') { throw new ServiceError('SERVICE_ERROR', 'Unexpected queue response.'); }
  for (const block of payload.split(/\r?\n\r?\n/)) {
    const lines = block.split(/\r?\n/);
    const kind = lines.find(line => line.startsWith('event:'))?.slice(6).trim();
    const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (kind === 'error') { throw new ServiceError('SERVICE_ERROR', 'The feature service could not complete the request.'); }
    if (kind === 'complete' && data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length) { return parsed[0]; }
      } catch { /* malformed response becomes an explicit service error */ }
      throw new ServiceError('SERVICE_ERROR', 'Invalid completed queue response.');
    }
  }
  throw new ServiceError('SERVICE_ERROR', 'No completed result was received.');
}

export class InferenceService {
  private static sessions = new Map<string, InferenceSession>();
  private static operations: Promise<unknown> = Promise.resolve();
  private static enqueue<T>(work: () => Promise<T>): Promise<T> {
    const next = this.operations.then(work, work);
    this.operations = next.catch(() => undefined);
    return next;
  }
  static releaseAll(): Promise<void> {
    return this.enqueue(async () => {
      const sessions = [...this.sessions.values()];
      this.sessions.clear();
      await Promise.all(sessions.map(s => s.release()));
    });
  }
  static async getFingerprint(smiles: string, signal?: AbortSignal): Promise<FingerprintResponse> {
    try {
      cancelled(signal);
      const queue = await axios.post(API_URL + ENDPOINT, {data: [smiles, '']}, {timeout: 30000, signal});
      if (typeof queue.data?.event_id !== 'string') { throw new ServiceError('SERVICE_ERROR', 'Missing queue ID.'); }
      const result = await axios.get(API_URL + ENDPOINT + '/' + encodeURIComponent(queue.data.event_id),
        {timeout: 120000, signal, responseType: 'text', transformResponse: data => data});
      cancelled(signal);
      const data = parseGradioQueueResult(result.data);
      if (data?.error) {
        throw new ServiceError(data.error.code || 'SERVICE_ERROR', data.error.message || 'Feature service failed.');
      }
      if (data?.feature_schema_id !== manifestData.feature_schema_id) {
        throw new ServiceError('FEATURE_SCHEMA_MISMATCH', 'The app models and feature service use different versions. Update them together.');
      }
      validateFeatures(data.fingerprint);
      if (typeof data.smiles !== 'string' || !Number.isFinite(data.molecular_weight)) {
        throw new ServiceError('SERVICE_ERROR', 'Invalid molecule metadata.');
      }
      return {fingerprint: data.fingerprint, combined_smiles: data.smiles,
        molecular_formula: data.molecular_formula ?? null, molecular_weight: data.molecular_weight,
        iupac_name: data.iupac_name ?? null, warning: data.warning ?? null};
    } catch (error: any) {
      if (signal?.aborted || axios.isCancel(error)) { throw new ServiceError('CANCELLED', 'Analysis cancelled.'); }
      if (error instanceof ServiceError) { throw error; }
      if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
        throw new ServiceError('TIMEOUT', 'The feature service timed out. Please try again later.');
      }
      if (axios.isAxiosError(error) && !error.response) { throw new ServiceError('NETWORK', 'Cannot reach the feature service.'); }
      throw new ServiceError('SERVICE_ERROR', 'The feature service is unavailable.');
    }
  }
  static predict(fingerprint: number[], signal?: AbortSignal): Promise<PredictionResult[]> {
    validateFeatures(fingerprint);
    const copy = new Float32Array(fingerprint);
    return this.enqueue(async () => {
      cancelled(signal);
      const directory = RNFS.DocumentDirectoryPath + '/essenza-models/' + manifestData.bundle_id;
      await RNFS.mkdir(directory);
      const tensor = new Tensor('float32', copy, [1, featureCount]);
      const results: PredictionResult[] = [];
      for (const meta of manifestData.models) {
        cancelled(signal);
        if (!/^[a-zA-Z0-9_.-]+\.onnx$/.test(meta.filename) || meta.filename.includes('..')) {
          throw new ServiceError('MODEL_ERROR', 'Invalid model filename.');
        }
        const target = directory + '/' + meta.filename;
        let runtime = this.sessions.get(target);
        try {
          if (!runtime) {
            const exists = await RNFS.exists(target);
            const valid = exists && (await RNFS.hash(target, 'sha256')) === meta.sha256;
            if (!valid) {
              const temporary = target + '.tmp';
              const source = 'models/' + (manifestData.asset_subdir ? manifestData.asset_subdir + '/' : '') + meta.filename;
              await RNFS.copyFileAssets(source, temporary);
              if ((await RNFS.hash(temporary, 'sha256')) !== meta.sha256) {
                throw new ServiceError('MODEL_ERROR', 'A model asset failed its integrity check.');
              }
              if (exists) { await RNFS.unlink(target); }
              await RNFS.moveFile(temporary, target);
            }
            runtime = await InferenceSession.create(target);
            if (!runtime.inputNames.includes(meta.input_name) || !runtime.outputNames.includes(meta.probability_output)) {
              await runtime.release();
              throw new ServiceError('MODEL_ERROR', 'Model input/output schema does not match its manifest.');
            }
            this.sessions.set(target, runtime);
          }
          const output = await runtime.run({[meta.input_name]: tensor});
          cancelled(signal);
          const values = output[meta.probability_output]?.data;
          const probability = values ? Number(values[meta.positive_index]) : NaN;
          if (!values || values.length !== 2 || !Number.isFinite(probability) || probability < 0 || probability > 1) {
            throw new ServiceError('MODEL_ERROR', 'A model returned an invalid score.');
          }
          if (probability >= meta.threshold) {
            results.push({label: meta.label, probability, threshold: meta.threshold});
          }
        } catch (error) {
          if (error instanceof ServiceError) { throw error; }
          throw new ServiceError('MODEL_ERROR', 'Model inference failed. No incomplete result will be shown.');
        }
      }
      return results.sort((a, b) => b.probability - a.probability || a.label.localeCompare(b.label));
    });
  }
}
