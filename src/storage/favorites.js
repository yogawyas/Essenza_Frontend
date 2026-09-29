import AsyncStorage from '@react-native-async-storage/async-storage';

export const FAVORITES_KEY = '@essenza/b2b-compounds-v1';
export const MAX_FAVORITES = 200;

export function isFavorite(item) {
  return item && typeof item.smiles === 'string' && item.smiles.length > 0 &&
    item.smiles.length <= 2000 && !/\s/.test(item.smiles) &&
    typeof item.name === 'string' && item.name.trim().length > 0 && item.name.length <= 80 &&
    typeof item.note === 'string' && item.note.length <= 240 &&
    Number.isFinite(Date.parse(item.createdAt)) &&
    Number.isFinite(Date.parse(item.updatedAt));
}

export async function readFavorites() {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (raw === null) {
    return [];
  }
  const parsed = JSON.parse(raw);
  if (parsed?.version !== 1 || !Array.isArray(parsed.items) ||
      parsed.items.length > MAX_FAVORITES || !parsed.items.every(isFavorite) ||
      new Set(parsed.items.map(item => item.smiles)).size !== parsed.items.length) {
    throw new Error('Data koleksi tidak dapat dibaca.');
  }
  return parsed.items;
}

export async function writeFavorites(items) {
  if (items.length > MAX_FAVORITES || !items.every(isFavorite) ||
      new Set(items.map(item => item.smiles)).size !== items.length) {
    throw new Error('Koleksi tidak dapat disimpan.');
  }
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify({ version: 1, items }));
}
