import {
  demoPredictionService,
  EXAMPLES,
} from '../src/services/demoPrediction';
import { inputError, isAnalysis } from '../src/domain/analysis';
import { HISTORY_KEY, readHistory, writeHistory } from '../src/storage/history';
import AsyncStorage from '@react-native-async-storage/async-storage';
beforeEach(() => {
  jest.clearAllMocks();
});
test('empty and whitespace inputs are rejected without claiming chemical validation', async () => {
  expect(inputError('  ')).toBeTruthy();
  expect(inputError('CC O')).toBeTruthy();
  expect(inputError('X'.repeat(2001))).toBeTruthy();
  await expect(
    demoPredictionService.predict({ smiles: 'CCN', sampleName: '' }),
  ).rejects.toThrow('belum tersedia');
});
test('fixtures keep demo provenance, cannot claim RDKit validation, and do not leak mutations', async () => {
  const result = await demoPredictionService.predict({
    smiles: ` ${EXAMPLES[0].smiles} `,
    sampleName: ' LAB-01 ',
  });
  expect(result.sampleName).toBe('LAB-01');
  expect(result.demo).toBe(true);
  expect(result.structureValidated).toBe(false);
  expect(result.canonicalSmiles).toBeNull();
  expect(isAnalysis(result)).toBe(true);
  result.labels[0].score = 0;
  expect(EXAMPLES[0].labels[0].score).toBe(0.82);
  expect(isAnalysis({ ...result, demo: false })).toBe(false);
});
test('empty-label fixture is a valid result', async () => {
  const result = await demoPredictionService.predict({
    smiles: 'CCO',
    sampleName: '',
  });
  expect(result.labels).toEqual([]);
  expect(isAnalysis(result)).toBe(true);
});
test('history round-trips in its own namespace and rejects corrupt records', async () => {
  const result = await demoPredictionService.predict({
    smiles: 'CCO',
    sampleName: 'Test',
  });
  await writeHistory([result]);
  const raw = AsyncStorage.setItem.mock.calls[0][1];
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(HISTORY_KEY, raw);
  AsyncStorage.getItem.mockResolvedValueOnce(raw);
  expect(await readHistory()).toEqual([result]);
  AsyncStorage.getItem.mockResolvedValueOnce('{broken');
  await expect(readHistory()).rejects.toThrow();
  AsyncStorage.getItem.mockResolvedValueOnce(
    JSON.stringify({ version: 1, records: [{ ...result, demo: false }] }),
  );
  await expect(readHistory()).rejects.toThrow('Format');
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
});
