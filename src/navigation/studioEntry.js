import { Alert } from 'react-native';
export function enterStudio(nav, state, dispatch, params) {
  if (!state.studioDraft || params?.resume) {
    nav.navigate('StudioEditor', params);
    return;
  }
  Alert.alert(
    'Saved Draft',
    'Resume Draft yang ada atau ganti dengan eksperimen ini?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Resume Draft',
        onPress: () =>
          nav.navigate('StudioEditor', {
            resume: true,
          }),
      },
      {
        text: 'Replace Draft',
        style: 'destructive',
        onPress: async () => {
          if (
            await dispatch({
              type: 'studioDraft',
              draft: null,
            })
          ) {
            nav.navigate('StudioEditor', params);
          }
        },
      },
    ],
  );
}
