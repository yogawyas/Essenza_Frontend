import { useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      const update = () => setNow(new Date());
      update();
      const timer = setInterval(update, 60000);
      const subscription = AppState.addEventListener('change', status => {
        if (status === 'active') {
          update();
        }
      });
      return () => {
        clearInterval(timer);
        subscription.remove();
      };
    }, []),
  );
  return now;
}
