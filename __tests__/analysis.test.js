import { inputError, isAnalysis } from '../src/domain/analysis';
import { HISTORY_KEY, readHistory, writeHistory } from '../src/storage/history';
import AsyncStorage from '@react-native-async-storage/async-storage';

const scores = Array.from({ length: 109 }, (_, index) => ({
  label: `label-${index}`,
  score: index === 0 ? 0.82 : 0.1,
}));
function v7Result() {
  return {
    id: 'v7-test', sampleName: 'Sampel',
    inputSmiles: 'CCO', canonicalSmiles: 'CCO',
    createdAt: '2026-09-29T09:00:00.000Z',
    demo: false, structureValidated: true,
    modelId: 'perfume-five-grouped-v7-m2048-d8/lgbm_D',
    bundleId: 'a'.repeat(64),
    labels: [scores[0]], scores: scores.map(item => ({ ...item })),
  };
}
function oldDemoRecord() {
  return {
    id: 'demo-old', sampleName: 'Contoh lama',
    inputSmiles: 'CCO', canonicalSmiles: null,
    createdAt: '2026-09-25T09:00:00.000Z',
    demo: true, structureValidated: false,
    modelId: 'demo-fixtures-v1', labels: [],
  };
}
beforeEach(() => jest.clearAllMocks());

test('input hygiene rejects blank, whitespace, and oversized SMILES', () => {
  expect(inputError('  ')).toBeTruthy();
  expect(inputError('CC O')).toBeTruthy();
  expect(inputError('X'.repeat(2001))).toBeTruthy();
  expect(inputError('CCO')).toBeNull();
});

test('real v7 results require 109 scores and consistent thresholded labels', () => {
  const result = v7Result();
  expect(isAnalysis(result)).toBe(true);
  expect(isAnalysis({ ...result, labels: [] })).toBe(false);
  expect(isAnalysis({ ...result, scores: result.scores.slice(1) })).toBe(false);
  expect(isAnalysis({ ...result, canonicalSmiles: null })).toBe(false);
});

test('legacy demo history remains explicitly marked as demo', () => {
  const demo = oldDemoRecord();
  expect(isAnalysis(demo)).toBe(true);
  expect(isAnalysis({ ...demo, demo: false })).toBe(false);
});

test('history round-trips in its own namespace and rejects corrupt records', async () => {
  const result = v7Result();
  await writeHistory([result]);
  const raw = AsyncStorage.setItem.mock.calls[0][1];
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(HISTORY_KEY, raw);
  AsyncStorage.getItem.mockResolvedValueOnce(raw);
  expect(await readHistory()).toEqual([result]);
  AsyncStorage.getItem.mockResolvedValueOnce('{broken');
  await expect(readHistory()).rejects.toThrow();
  AsyncStorage.getItem.mockResolvedValueOnce(
    JSON.stringify({ version: 1, records: [{ ...result, scores: [] }] }),
  );
  await expect(readHistory()).rejects.toThrow('Format');
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
});
