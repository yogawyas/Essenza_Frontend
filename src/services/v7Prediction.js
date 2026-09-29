import { NativeModules } from 'react-native';
import manifest from '../assets/metadata/v7_model_manifest.json';
import { loadFeatureApiUrl } from './featureApiConfig';

let operation = Promise.resolve();
let sequence = 0;

export class PredictionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PredictionError';
    this.code = code;
  }
}

function cancelled(signal) {
  if (signal?.aborted) {
    throw new PredictionError('CANCELLED', 'Analisis dibatalkan.');
  }
}

function assertFeatures(payload) {
  const bits = manifest.feature_spec.n_bits;
  const values = payload?.fingerprint;
  if (
    payload?.status !== 'ok' ||
    payload?.model_id !== manifest.model_id ||
    payload?.bundle_id !== manifest.bundle_id ||
    payload?.feature_schema_id !== manifest.feature_schema_id ||
    !Array.isArray(values) ||
    values.length !== manifest.feature_spec.dimensions.input ||
    values.some(value => typeof value !== 'number' || !Number.isFinite(value)) ||
    values.slice(0, bits).some(value => value !== 0 && value !== 1) ||
    typeof payload.smiles !== 'string' ||
    !payload.smiles
  ) {
    throw new PredictionError(
      'FEATURE_SCHEMA_MISMATCH',
      'Layanan analisis belum cocok dengan aplikasi ini. Hubungi pengelola.',
    );
  }
  return values;
}

async function fetchFeatures(smiles, compoundName, signal) {
  const baseUrl = await loadFeatureApiUrl();
  if (!baseUrl) {
    throw new PredictionError('API_NOT_CONFIGURED', 'Koneksi analisis belum diatur. Buka Panduan atau hubungi pengelola.');
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  const timeout = setTimeout(abort, 20000);
  try {
    cancelled(signal);
    const response = await fetch(`${baseUrl}/fingerprint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        smiles: smiles || null,
        compound_name: compoundName || null,
        feature_schema_id: manifest.feature_schema_id,
      }),
      signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok) {
      const detail = payload?.detail;
      throw new PredictionError(
        detail?.code || 'FEATURE_API_ERROR',
        detail?.message || 'Senyawa ini belum bisa diproses. Coba pilihan lain.',
      );
    }
    assertFeatures(payload);
    return payload;
  } catch (error) {
    if (signal?.aborted) {
      throw new PredictionError('CANCELLED', 'Analisis dibatalkan.');
    }
    if (error instanceof PredictionError) {
      throw error;
    }
    throw new PredictionError(
      'NETWORK',
      controller.signal.aborted
        ? 'Layanan analisis terlalu lama merespons. Coba lagi.'
        : 'Layanan analisis tidak terhubung. Periksa koneksi atau hubungi pengelola.',
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

async function resolve({ query, signal }) {
  const baseUrl = await loadFeatureApiUrl();
  if (!baseUrl) {
    throw new PredictionError('API_NOT_CONFIGURED', 'Koneksi analisis belum diatur. Buka Panduan atau hubungi pengelola.');
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  const timeout = setTimeout(abort, 20000);
  try {
    cancelled(signal);
    const response = await fetch(`${baseUrl}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim() }),
      signal: controller.signal,
    });
    const payload = await response.json();
    if (!response.ok) {
      const detail = payload?.detail;
      throw new PredictionError(detail?.code || 'RESOLVE_ERROR',
        detail?.message || 'Senyawa belum ditemukan. Coba nama atau rumus lain.');
    }
    if (!Array.isArray(payload?.candidates) || !payload.candidates.length ||
      payload.candidates.some(item => typeof item?.name !== 'string' ||
        typeof item?.smiles !== 'string' || !item.smiles ||
        typeof item?.molecular_formula !== 'string' ||
        typeof item?.in_catalog !== 'boolean' || typeof item?.prediction_supported !== 'boolean')) {
      throw new PredictionError('RESOLVE_ERROR', 'Respons pencarian senyawa tidak valid.');
    }
    return payload.candidates;
  } catch (error) {
    if (signal?.aborted) {
      throw new PredictionError('CANCELLED', 'Pencarian dibatalkan.');
    }
    if (error instanceof PredictionError) {
      throw error;
    }
    throw new PredictionError('NETWORK', controller.signal.aborted
      ? 'Pencarian terlalu lama. Coba lagi.'
      : 'Layanan pencarian tidak terhubung. Periksa koneksi atau hubungi pengelola.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

async function runModels(features, signal, onProgress) {
  cancelled(signal);
  const native = NativeModules.EssenzaOnnxV7;
  if (!native?.predict) {
    throw new PredictionError('MODEL_ERROR', 'Paket analisis belum lengkap. Instal ulang aplikasi.');
  }
  onProgress?.(0, manifest.models.length);
  let output;
  try {
    output = await native.predict(features, manifest.models);
  } catch (error) {
    throw new PredictionError('MODEL_ERROR',
      'Analisis belum berhasil dijalankan. Coba lagi atau hubungi pengelola.');
  }
  cancelled(signal);
  if (!Array.isArray(output) || output.length !== manifest.models.length ||
      output.some(score => typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1)) {
    throw new PredictionError('MODEL_ERROR', 'Hasil analisis tidak valid. Coba lagi.');
  }
  onProgress?.(manifest.models.length, manifest.models.length);
  return output.map((score, index) => ({ label: manifest.models[index].label, score }));
}

async function predict({ smiles = '', compoundName = '', catalogName = '', sampleName = '', signal, onProgress }) {
  const payload = await fetchFeatures(smiles.trim(), compoundName.trim(), signal);
  const values = assertFeatures(payload);
  const scores = await runModels(values, signal, onProgress);
  const labels = scores.filter(item => item.score >= manifest.primary_threshold)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  sequence += 1;
  return {
    id: `v7-${Date.now()}-${sequence}`,
    sampleName: sampleName.trim().slice(0, 80) || payload.compound_name || 'Sampel molekul',
    inputName: catalogName.trim() || compoundName.trim() || null,
    inputSmiles: smiles.trim() || payload.smiles,
    canonicalSmiles: payload.smiles,
    createdAt: new Date().toISOString(),
    demo: false,
    modelId: manifest.model_id,
    bundleId: manifest.bundle_id,
    structureValidated: true,
    labels,
    scores,
  };
}

export const v7PredictionService = {
  resolve,
  predict(args) {
    const next = operation.then(() => predict(args), () => predict(args));
    operation = next.catch(() => undefined);
    return next;
  },
};
