import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAnalysis, MAX_HISTORY } from '../domain/analysis';
// Separate namespace: never read, migrate, or clear the B2C project's records.
export const HISTORY_KEY = '@essenza/b2b-lab-v1';
export async function readHistory() {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (raw === null) {
    return [];
  }
  const parsed = JSON.parse(raw);
  if (
    parsed?.version !== 1 ||
    !Array.isArray(parsed.records) ||
    parsed.records.length > MAX_HISTORY ||
    !parsed.records.every(isAnalysis) ||
    new Set(parsed.records.map(r => r.id)).size !== parsed.records.length
  ) {
    throw new Error('Format riwayat tidak dapat dibaca.');
  }
  return parsed.records;
}
export async function writeHistory(records) {
  if (records.length > MAX_HISTORY || !records.every(isAnalysis)) {
    throw new Error('Riwayat tidak dapat disimpan.');
  }
  await AsyncStorage.setItem(
    HISTORY_KEY,
    JSON.stringify({ version: 1, records }),
  );
}
