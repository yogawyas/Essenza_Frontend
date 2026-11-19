import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { createInitialState } from '../domain/models';
import { LocalRepository } from './repository';
const Context = createContext(null);
export function AppProvider({ children }) {
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
  const dispatch = async action => {
    try {
      setState(await repository.dispatch(action));
      return true;
    } catch (cause) {
      Alert.alert(
        'Could Not Save',
        cause instanceof Error
          ? cause.message
          : 'Local storage is unavailable. Try again.',
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
              Could not open your local data. Your existing data is still saved.
            </Text>
            <Text accessibilityRole="button" onPress={load}>
              Try Again
            </Text>
            <Text
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  'Delete local data?',
                  'This removes your profile, collections, and entries from this device.',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        if (
                          await dispatch({
                            type: 'reset',
                          })
                        ) {
                          setReady(true);
                        }
                      },
                    },
                  ],
                )
              }
            >
              Reset Local Data
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator color="#163B2C" />
            <Text>Opening your collection…</Text>
          </>
        )}
      </View>
    );
  }
  return (
    <Context.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const store = useContext(Context);
  if (!store) {
    throw new Error('AppProvider required');
  }
  return store;
}
