import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { AppState, createInitialState } from '../domain/models';
import { Action } from '../domain/state';
import { LocalRepository } from './repository';

interface Store {
  state: AppState;
  dispatch(action: Action): Promise<boolean>;
}
const Context = createContext<Store | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const repository = useRef(new LocalRepository()).current;
  const [state, setState] = useState(createInitialState);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    repository
      .load()
      .then(value => {
        setState(value);
        setReady(true);
      })
      .catch(() => setError(true));
  };
  useEffect(load, [repository]);
  const dispatch = async (action: Action) => {
    try {
      setState(await repository.dispatch(action));
      return true;
    } catch (cause) {
      Alert.alert(
        'Belum tersimpan',
        cause instanceof Error
          ? cause.message
          : 'Penyimpanan lokal tidak tersedia. Coba lagi.',
      );
      return false;
    }
  };
  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F8F6EE',
          padding: 28,
          gap: 16,
        }}
      >
        {error ? (
          <>
            <Text>
              Data lokal belum bisa dibaca. Data lamamu tetap disimpan.
            </Text>
            <Text accessibilityRole="button" onPress={load}>
              Coba lagi
            </Text>
            <Text
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  'Hapus data lokal?',
                  'Semua profil, koleksi, dan catatan lokal akan dihapus.',
                  [
                    { text: 'Batal', style: 'cancel' },
                    {
                      text: 'Hapus',
                      style: 'destructive',
                      onPress: async () => {
                        if (await dispatch({ type: 'reset' })) {
                          setReady(true);
                        }
                      },
                    },
                  ],
                )
              }
            >
              Reset dengan konfirmasi
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator color="#163B2C" />
            <Text>Membuka koleksi wangimu…</Text>
          </>
        )}
      </View>
    );
  }
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
}

export function useApp() {
  const store = useContext(Context);
  if (!store) {
    throw new Error('AppProvider required');
  }
  return store;
}
