import { Linking } from 'react-native';
import { ensurePkceCrypto } from './pkceCrypto';

export const GOOGLE_REDIRECT_URL = 'com.essenza.app://auth/callback';
const ATTEMPT_TTL = 10 * 60 * 1000;
const FLOW_ID = /^[A-Za-z0-9_-]{8,64}$/;
const AUTH_CODE = /^[A-Za-z0-9._~-]{1,512}$/;

export function isGoogleCallbackUrl(url) {
  return (
    typeof url === 'string' &&
    url.length <= 4096 &&
    (url === GOOGLE_REDIRECT_URL ||
      url.startsWith(GOOGLE_REDIRECT_URL + '?') ||
      url.startsWith(GOOGLE_REDIRECT_URL + '#'))
  );
}

function validAuthorizeUrl(value, projectUrl) {
  try {
    const url = new URL(value);
    return (
      url.origin === projectUrl &&
      url.protocol === 'https:' &&
      url.pathname === '/auth/v1/authorize' &&
      !url.username &&
      !url.password &&
      !url.hash &&
      url.searchParams.get('provider') === 'google' &&
      url.searchParams.get('redirect_to') === GOOGLE_REDIRECT_URL &&
      url.searchParams.get('code_challenge_method')?.toLowerCase() === 's256' &&
      /^[A-Za-z0-9_-]{43}$/.test(url.searchParams.get('code_challenge') || '')
    );
  } catch {
    return false;
  }
}

export class GoogleOAuth {
  constructor(auth, storage, { url, publishableKey }) {
    this.auth = auth;
    this.storage = storage;
    this.projectUrl = url;
    this.publishableKey = publishableKey;
    this.pendingKey = 'supabase.' + url + '.google-attempt';
  }

  async loadAttempt() {
    let raw;
    try {
      raw = await this.storage.getItem(this.pendingKey);
    } catch {
      throw new Error('Could not read the pending Google sign-in.');
    }
    if (!raw) {
      return null;
    }
    try {
      const attempt = JSON.parse(raw);
      if (
        typeof attempt.flowId === 'string' &&
        FLOW_ID.test(attempt.flowId) &&
        Number.isFinite(attempt.expiresAt) &&
        validAuthorizeUrl(attempt.url, this.projectUrl)
      ) {
        return attempt;
      }
    } catch {
      // Discard malformed local metadata without using it for code exchange.
    }
    return null;
  }

  async cancel() {
    try {
      await this.storage.removeItem(this.pendingKey);
    } catch {
      throw new Error('Could not clear the pending Google sign-in.');
    }
  }

  async hasSession() {
    try {
      const { data, error } = await this.auth.getSession();
      if (!error) {
        return Boolean(data?.session);
      }
    } catch {
      // Avoid passing native or SDK details to the login screen.
    }
    throw new Error('Could not check your sign-in status. Try again.');
  }

  async requireEnabledProvider() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let settings;
    try {
      const response = await fetch(this.projectUrl + '/auth/v1/settings', {
        headers: { apikey: this.publishableKey },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error('Could not read provider settings.');
      }
      settings = await response.json();
    } catch {
      throw new Error('Could not connect to Google sign-in. Try again.');
    } finally {
      clearTimeout(timeout);
    }
    if (settings?.external?.google !== true) {
      throw new Error(
        'Google sign-in is not enabled for this Essenza project yet.',
      );
    }
  }

  async start() {
    if (!this.projectUrl?.startsWith('https://')) {
      throw new Error('Google sign-in requires an HTTPS Supabase project.');
    }
    if (await this.hasSession()) {
      throw new Error('Google sign-in is unavailable while signed in.');
    }
    let attempt = await this.loadAttempt();
    if (!attempt || attempt.expiresAt <= Date.now()) {
      await this.requireEnabledProvider();
      try {
        ensurePkceCrypto();
        const result = await this.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: GOOGLE_REDIRECT_URL,
            skipBrowserRedirect: true,
          },
        });
        if (
          result.error ||
          typeof result.data?.flowId !== 'string' ||
          !FLOW_ID.test(result.data.flowId) ||
          !validAuthorizeUrl(result.data.url, this.projectUrl)
        ) {
          throw new Error('Secure Google authorization was not created.');
        }
        attempt = {
          flowId: result.data.flowId,
          url: result.data.url,
          expiresAt: Date.now() + ATTEMPT_TTL,
        };
        await this.storage.setItem(this.pendingKey, JSON.stringify(attempt));
      } catch {
        throw new Error('Could not start secure Google sign-in. Try again.');
      }
    }
    // Reuse the pending verifier if the browser was closed without a callback.
    try {
      await Linking.openURL(attempt.url);
    } catch {
      throw new Error('Could not open your browser for Google sign-in.');
    }
  }

  async complete(url) {
    if (!isGoogleCallbackUrl(url)) {
      return null;
    }
    if (await this.hasSession()) {
      return null;
    }
    const attempt = await this.loadAttempt();
    if (!attempt) {
      return null;
    }
    if (attempt.expiresAt <= Date.now()) {
      await this.cancel();
      throw new Error('Google sign-in expired. Start it again.');
    }

    let callback;
    try {
      callback = new URL(url);
    } catch {
      throw new Error('Could not verify the Google sign-in response.');
    }
    const query = callback.searchParams;
    const fragment = new URLSearchParams(callback.hash.slice(1));
    if (
      query.has('access_token') ||
      query.has('refresh_token') ||
      fragment.has('access_token') ||
      fragment.has('refresh_token') ||
      fragment.has('code')
    ) {
      throw new Error('Could not verify the Google sign-in response.');
    }
    const codes = query.getAll('code');
    if (!codes.length && (query.has('error') || fragment.has('error'))) {
      await this.cancel();
      throw new Error('Google sign-in was canceled or declined. Try again.');
    }
    if (
      codes.length !== 1 ||
      !AUTH_CODE.test(codes[0]) ||
      callback.hash ||
      query.has('error')
    ) {
      throw new Error('Could not verify the Google sign-in response.');
    }
    // Consume the local marker before the exchange to ignore duplicate intents.
    await this.cancel();
    try {
      const result = await this.auth.exchangeCodeForSession(codes[0], {
        flowId: attempt.flowId,
      });
      if (!result.error && result.data?.session) {
        return result.data.session;
      }
    } catch {
      // Do not expose codes or provider details in the error message.
    }
    throw new Error('Could not finish Google sign-in. Start it again.');
  }
}
