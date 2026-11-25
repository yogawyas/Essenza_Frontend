import publicConfig from './publicConfig';

let client;

export function getSupabase() {
  if (publicConfig.error) {
    throw new Error(publicConfig.error);
  }
  if (!publicConfig.url) {
    if (__DEV__) {
      return null;
    }
    throw new Error('Supabase configuration is required for this build.');
  }
  if (publicConfig.localHttp && !__DEV__) {
    throw new Error('Use an HTTPS Supabase project URL for this build.');
  }
  if (client) {
    return client;
  }

  require('react-native-url-polyfill/auto');
  const { createClient } = require('@supabase/supabase-js');
  const keychain = require('react-native-keychain');
  const options = key => ({
    service: 'com.essenza.app.' + key,
    accessible: keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  const storage = {
    async getItem(key) {
      const credentials = await keychain.getGenericPassword(options(key));
      return credentials ? credentials.password : null;
    },
    async setItem(key, value) {
      const saved = await keychain.setGenericPassword(
        'supabase-session',
        value,
        options(key),
      );
      if (!saved) {
        throw new Error('Could not save the session securely on this device.');
      }
    },
    async removeItem(key) {
      if (!(await keychain.resetGenericPassword(options(key)))) {
        throw new Error('Could not clear the saved session.');
      }
    },
  };

  client = createClient(publicConfig.url, publicConfig.publishableKey, {
    auth: {
      storage,
      storageKey: 'supabase.' + publicConfig.url,
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}
