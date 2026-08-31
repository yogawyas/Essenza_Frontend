import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import axios from 'axios';
import RNFS from 'react-native-fs';
import xgbMeta from '../assets/metadata/xgb_meta.json';

const API_URL = 'https://perfume-multilabel-classifier-production.up.railway.app';

// ── Interfaces ────────────────────────────────────────────────

export interface PredictionResult {
  label: string;
  probability: number;
  threshold: number;
}

export interface FingerprintResponse {
  fingerprint: number[];
  combined_smiles: string;
  molecular_formula: string | null;
  molecular_weight: number | null;
  iupac_name: string | null;
  warning: string | null;
}

export interface PerfumeResult {
  pid: number;
  brand: string;
  name: string;
  top_accords: string;
  similarityScore: number;
  rating: string;
  is_custom: 0 | 1;
}

// ── InferenceService ──────────────────────────────────────────

export class InferenceService {
  /**
   * Lazy session cache — sessions are created once per app lifecycle
   * and reused on subsequent predictions (110 XGBoost models).
   */
  private static sessionCache = new Map<string, InferenceSession>();

  /**
   * Release all cached ONNX sessions and clear the cache.
   * Call this when the app goes to background or the Chemist screen unmounts.
   */
  static async releaseAll(): Promise<void> {
    const releases = Array.from(InferenceService.sessionCache.values()).map(s =>
      s.release().catch(() => {/* ignore individual release errors */})
    );
    await Promise.all(releases);
    InferenceService.sessionCache.clear();
    console.log('[InferenceService] All ONNX sessions released.');
  }

  /**
   * Fetches the Morgan Fingerprint (2048-bit) + 5 RDKit physical descriptors
   * for a given SMILES string via the Railway API.
   * Also returns molecule metadata and a model-confidence warning if applicable.
   */
  static async getFingerprint(smilesStr: string): Promise<FingerprintResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/fingerprint`,
        { smiles: smilesStr },
        { timeout: 15000 }
      );
      const d = response.data;
      return {
        fingerprint: d.fingerprint,
        combined_smiles: d.smiles,
        molecular_formula: d.molecular_formula ?? null,
        molecular_weight: d.molecular_weight ?? null,
        iupac_name: d.iupac_name ?? null,
        warning: d.warning ?? null,
      };
    } catch (e: any) {
      // Timeout — Railway cold start
      if (axios.isAxiosError(e) && e.code === 'ECONNABORTED') {
        throw new Error(
          'Request timed out. The server may be waking up — please try again in a moment.'
        );
      }
      // Network unreachable
      if (axios.isAxiosError(e) && !e.response) {
        throw new Error(
          'No network connection. Please check your internet and try again.'
        );
      }
      // API returned an HTTP error with a detail message
      const detail: string | undefined = e?.response?.data?.detail;
      if (detail) {
        // Remap known Indonesian API error messages to English
        if (detail.includes('tidak valid') || detail.includes('tidak ditemukan')) {
          throw new Error(`Invalid SMILES or compound not found: ${detail}`);
        }
        if (detail.includes('terlalu berat')) {
          throw new Error(detail); // MW filter — keep as-is, App.js already handles it
        }
        throw new Error(detail);
      }
      throw new Error('Failed to get fingerprint from API. Please verify the SMILES and try again.');
    }
  }

  /**
   * Runs on-device ONNX inference across all 110 XGBoost Binary Relevance models.
   * Sessions are cached after first creation for performance.
   * Input tensor shape: [1, 2053] (2048 Morgan bits + 5 RDKit descriptors)
   */
  static async predict(fingerprint: number[]): Promise<PredictionResult[]> {
    const floatArray = new Float32Array(fingerprint);
    const resultsOut: PredictionResult[] = [];

    // Input tensor [1, 2053] — shape is independent of label count
    const inputTensor = new Tensor('float32', floatArray, [1, 2053]);

    for (const meta of xgbMeta) {
      const safeLabel = meta.label.replace(/ /g, '_').replace(/\//g, '-');
      const filename = `xgb_${safeLabel}.onnx`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

      try {
        // Copy asset to writable storage on first run
        const exists = await RNFS.exists(destPath);
        if (!exists) {
          console.log(`[InferenceService] Copying model ${filename} from assets...`);
          try {
            await RNFS.copyFileAssets(`models/${filename}`, destPath);
          } catch (copyErr: any) {
            throw new Error(
              `Failed to load model file "${filename}". The app may need to be reinstalled.`
            );
          }
        }

        // Retrieve cached session or create a new one
        let session = InferenceService.sessionCache.get(destPath);
        if (!session) {
          session = await InferenceSession.create(destPath);
          InferenceService.sessionCache.set(destPath, session);
        }

        const feeds: Record<string, Tensor> = {};
        feeds[session.inputNames[0]] = inputTensor;

        const results = await session.run(feeds);

        // Extract class-1 probability from skl2onnx Binary Classifier output
        const probOutput = results[session.outputNames[1]];
        let prob = 0;

        if (probOutput.type === 'tensor(float)' || probOutput.type === 'float32') {
          const data = probOutput.data as Float32Array;
          // Output layout: [prob_class_0, prob_class_1]
          prob = data[1] !== undefined ? data[1] : data[0];
        } else {
          // Fallback: sequence-of-maps output format
          const mapList = probOutput.data as any[];
          if (mapList && mapList.length > 0) {
            prob = mapList[0]['1'] ?? mapList[0][1n] ?? mapList[0][1] ?? 0;
          }
        }

        if (prob >= meta.threshold) {
          resultsOut.push({
            label: meta.label,
            probability: prob,
            threshold: meta.threshold,
          });
        }
      } catch (e: any) {
        // Surface asset/model errors; swallow transient inference errors per label
        if ((e.message as string)?.includes('Failed to load model file')) {
          throw e;
        }
        console.error(`[InferenceService] Skipping model ${filename}:`, e.message);
      }
    }

    // Sort by probability descending
    return resultsOut.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Busca perfumes no SQLite local baseado em probabilidades de labels.
   * 100% OFFLINE - sem necessidade de servidor Railway.
   */
  static async getRecommendations(
    labelProbabilities: Record<string, number>,
    topK = 10
  ): Promise<PerfumeResult[]> {
    const { DatabaseService } = await import('./DatabaseService');
    const targetLabels = Object.entries(labelProbabilities)
      .filter(([, prob]) => prob >= 0.3)
      .sort(([, a], [, b]) => b - a)
      .map(([label]) => label);
    if (targetLabels.length === 0) return [];
    const results = await DatabaseService.getPerfumesByLabels(targetLabels, 0.05, topK);
    return results.map(p => ({
      pid: p.pid,
      brand: p.brand,
      name: p.name,
      top_accords: p.top_accords,
      similarityScore: p.similarityScore,
      rating: p.rating,
      is_custom: p.is_custom,
    }));
  }
}
