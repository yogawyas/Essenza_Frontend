import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MAX_HISTORY } from '../domain/analysis';
import { readHistory, writeHistory } from './history';
const Context = createContext(null);
export function LabProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const current = useRef([]);
  const usable = useRef(false);
  const queue = useRef(Promise.resolve());
  const reload = useCallback(async () => {
    setReady(false);
    usable.current = false;
    try {
      const saved = await readHistory();
      current.current = saved;
      setRecords(saved);
      setError(null);
      usable.current = true;
    } catch {
      setError(
        'Riwayat belum dapat dibaca. Data lama tetap disimpan. Coba muat ulang sebelum menyimpan hasil baru.',
      );
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  const update = useCallback(change => {
    const operation = queue.current.then(async () => {
      if (!usable.current) {
        throw new Error('Muat ulang riwayat terlebih dahulu.');
      }
      const next = change(current.current);
      await writeHistory(next);
      current.current = next;
      setRecords(next);
    });
    queue.current = operation.catch(() => undefined);
    return operation;
  }, []);
  const save = useCallback(
    result =>
      update(items => {
        if (items.some(item => item.id === result.id)) {
          return items;
        }
        if (items.length >= MAX_HISTORY) {
          throw new Error(
            'Riwayat penuh (100 hasil). Hapus satu hasil sebelum menyimpan lagi.',
          );
        }
        return [result, ...items];
      }),
    [update],
  );
  const remove = useCallback(
    id => update(items => items.filter(item => item.id !== id)),
    [update],
  );
  return (
    <Context.Provider value={{ records, ready, error, reload, save, remove }}>
      {children}
    </Context.Provider>
  );
}
export function useLab() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('LabProvider diperlukan.');
  }
  return context;
}
