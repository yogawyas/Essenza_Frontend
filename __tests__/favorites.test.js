import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAVORITES_KEY, readFavorites } from '../src/storage/favorites';
import { FavoritesProvider, useFavorites } from '../src/storage/FavoritesProvider';

let state;
let tree;
function Probe() {
  state = useFavorites();
  return null;
}

beforeEach(async () => {
  jest.clearAllMocks();
  AsyncStorage.getItem.mockResolvedValue(null);
  AsyncStorage.setItem.mockResolvedValue(undefined);
  await act(async () => {
    tree = TestRenderer.create(<FavoritesProvider><Probe /></FavoritesProvider>);
  });
});
afterEach(async () => {
  await act(async () => tree.unmount());
});

test('create, edit, delete and reload a saved compound', async () => {
  await act(async () => state.create({ smiles: 'COc1cc(C=O)ccc1O', name: 'Vanillin' }));
  expect(state.items).toHaveLength(1);
  expect(state.items[0].name).toBe('Vanillin');
  await act(async () => state.edit('COc1cc(C=O)ccc1O', {
    name: 'Vanillin stok A', note: 'Rak bahan utama',
  }));
  expect(state.items[0].note).toBe('Rak bahan utama');
  const persisted = AsyncStorage.setItem.mock.lastCall;
  expect(persisted[0]).toBe(FAVORITES_KEY);
  AsyncStorage.getItem.mockResolvedValue(persisted[1]);
  expect((await readFavorites())[0].name).toBe('Vanillin stok A');
  await act(async () => state.remove('COc1cc(C=O)ccc1O'));
  expect(state.items).toHaveLength(0);
});

test('failed storage write keeps the previous collection', async () => {
  await act(async () => state.create({ smiles: 'CCO', name: 'Bahan A' }));
  AsyncStorage.setItem.mockRejectedValueOnce(new Error('Penyimpanan penuh'));
  await act(async () => {
    await expect(state.edit('CCO', { name: 'Bahan B', note: '' }))
      .rejects.toThrow('Penyimpanan penuh');
  });
  expect(state.items[0].name).toBe('Bahan A');
});

test('unreadable collection blocks edits until reload succeeds', async () => {
  AsyncStorage.getItem.mockRejectedValueOnce(new Error('read error'));
  await act(async () => state.reload());
  expect(state.error).toContain('belum bisa dibaca');
  await expect(state.create({ smiles: 'CCO', name: 'Bahan A' }))
    .rejects.toThrow('Muat ulang koleksi');
  await act(async () => state.reload());
  expect(state.error).toBeNull();
  await act(async () => state.create({ smiles: 'CCO', name: 'Bahan A' }));
  expect(state.items).toHaveLength(1);
});
