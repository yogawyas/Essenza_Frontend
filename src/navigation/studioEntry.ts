import { Alert } from 'react-native';
import { AppState } from '../domain/models';
import { Action } from '../domain/state';
import { AppNavigation, RootParams } from './types';

export function enterStudio(
  nav: AppNavigation,
  state: AppState,
  dispatch: (action: Action) => Promise<boolean>,
  params?: RootParams['StudioEditor'],
) {
  if (!state.studioDraft || params?.resume) {
    nav.navigate('StudioEditor', params);
    return;
  }
  Alert.alert(
    'Ada draft tersimpan',
    'Lanjutkan draft yang ada atau ganti dengan eksperimen ini?',
    [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Lanjutkan draft',
        onPress: () => nav.navigate('StudioEditor', { resume: true }),
      },
      {
        text: 'Ganti draft',
        style: 'destructive',
        onPress: async () => {
          if (await dispatch({ type: 'studioDraft', draft: null })) {
            nav.navigate('StudioEditor', params);
          }
        },
      },
    ],
  );
}
