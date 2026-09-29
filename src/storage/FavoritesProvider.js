import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MAX_FAVORITES, readFavorites, writeFavorites } from './favorites';

const Context = createContext(null);

export function FavoritesProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const current = useRef([]);
  const usable = useRef(false);
  const queue = useRef(Promise.resolve());

  const reload = useCallback(async () => {
    setReady(false);
    usable.current = false;
    try {
      const saved = await readFavorites();
      current.current = saved;
      setItems(saved);
      setError(null);
      usable.current = true;
    } catch {
      setError('Koleksi belum bisa dibaca. Data lama tetap tersimpan; coba muat ulang.');
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const update = useCallback(change => {
    const operation = queue.current.then(async () => {
      if (!usable.current) {
        throw new Error('Muat ulang koleksi terlebih dahulu.');
      }
      const next = change(current.current);
      await writeFavorites(next);
      current.current = next;
      setItems(next);
    });
    queue.current = operation.catch(() => undefined);
    return operation;
  }, []);

  const create = useCallback(({ smiles, name, note = '' }) => update(previous => {
    const key = smiles.trim();
    if (previous.some(item => item.smiles === key)) {
      return previous;
    }
    if (previous.length >= MAX_FAVORITES) {
      throw new Error('Koleksi penuh (200 senyawa). Hapus satu sebelum menambah lagi.');
    }
    const now = new Date().toISOString();
    return [{ smiles: key, name: name.trim().slice(0, 80),
      note: note.trim().slice(0, 240), createdAt: now, updatedAt: now }, ...previous];
  }), [update]);

  const edit = useCallback((smiles, { name, note }) => update(previous => {
    if (!previous.some(item => item.smiles === smiles)) {
      throw new Error('Senyawa tidak ditemukan di koleksi.');
    }
    const nextName = name.trim();
    if (!nextName || nextName.length > 80 || note.length > 240) {
      throw new Error('Nama wajib diisi (maksimal 80 karakter); catatan maksimal 240 karakter.');
    }
    return previous.map(item => item.smiles === smiles
      ? { ...item, name: nextName, note: note.trim(), updatedAt: new Date().toISOString() }
      : item);
  }), [update]);

  const remove = useCallback(smiles => update(previous =>
    previous.filter(item => item.smiles !== smiles)), [update]);

  return <Context.Provider value={{ items, ready, error, reload, create, edit, remove }}>
    {children}
  </Context.Provider>;
}

export function useFavorites() {
  const value = useContext(Context);
  if (!value) {
    throw new Error('FavoritesProvider diperlukan.');
  }
  return value;
}
