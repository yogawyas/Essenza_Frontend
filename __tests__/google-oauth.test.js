import { createHash, randomFillSync } from 'node:crypto';
import { TextEncoder as NodeTextEncoder } from 'node:util';
import { Linking } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SupabaseAuthRepository } from '../backend/client/auth';
import { GOOGLE_REDIRECT_URL } from '../backend/client/googleOAuth';
import { ensurePkceCrypto } from '../backend/client/pkceCrypto';

const config = {
  url: 'https://essenza.example',
  publishableKey: 'sb_publishable_test',
};
const flowId = 'qa_flow_123';
const authCode = 'auth_code_1';
const callback = GOOGLE_REDIRECT_URL + '?code=' + authCode;
const authorize = new URL('/auth/v1/authorize', config.url);
authorize.search = new URLSearchParams({
  provider: 'google',
  redirect_to: GOOGLE_REDIRECT_URL,
  code_challenge_method: 's256',
  code_challenge: 'w'.repeat(43),
});
const account = {
  mode: 'supabase',
  userId: 'existing-user',
  email: 'jasmine@example.invalid',
  name: 'Jasmine',
};
const session = {
  access_token: 'not-for-the-ui',
  user: {
    id: account.userId,
    email: account.email,
    user_metadata: { full_name: account.name },
  },
};

let previousFetch;
let previousCrypto;
let previousTextEncoder;
let previousBtoa;
let entropy;
let openUrl;
let storage;
let records;
let auth;
let repository;

beforeEach(() => {
  previousFetch = global.fetch;
  previousCrypto = Object.getOwnPropertyDescriptor(global, 'crypto');
  previousTextEncoder = Object.getOwnPropertyDescriptor(global, 'TextEncoder');
  previousBtoa = Object.getOwnPropertyDescriptor(global, 'btoa');
  entropy = jest.fn(bytes => randomFillSync(bytes));
  Object.defineProperty(global, 'crypto', {
    configurable: true,
    value: { getRandomValues: entropy },
  });
  global.TextEncoder = NodeTextEncoder;
  delete global.btoa;
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => ({ external: { google: true } }),
  }));
  openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue();
  openUrl.mockClear();
  records = new Map();
  storage = {
    getItem: async key => records.get(key) ?? null,
    setItem: async (key, value) => records.set(key, value),
    removeItem: async key => records.delete(key),
  };
  auth = {
    getSession: jest.fn(async () => ({ data: { session: null } })),
    signInWithOAuth: jest.fn(async () => ({
      data: { url: authorize.href, flowId },
    })),
    exchangeCodeForSession: jest.fn(async () => ({ data: { session } })),
    signInWithPassword: jest.fn(async () => ({ data: { session } })),
  };
  repository = new SupabaseAuthRepository({ auth }, storage, config);
});

afterEach(() => {
  global.fetch = previousFetch;
  for (const [name, previous] of [
    ['crypto', previousCrypto],
    ['TextEncoder', previousTextEncoder],
    ['btoa', previousBtoa],
  ]) {
    if (previous) {
      Object.defineProperty(global, name, previous);
    } else {
      delete global[name];
    }
  }
  jest.restoreAllMocks();
});

test('creates a real Supabase S256 challenge with a persisted verifier', async () => {
  delete global.TextEncoder;
  const sdk = createClient(config.url, config.publishableKey, {
    auth: {
      storage,
      storageKey: 'test-auth',
      flowType: 'pkce',
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: { transport: jest.fn() },
  });
  const sdkRepository = new SupabaseAuthRepository(sdk, storage, config);
  await sdkRepository.startGoogleSignIn();
  const redirect = new URL(openUrl.mock.calls[0][0]);
  expect(redirect.searchParams.get('redirect_to')).toBe(GOOGLE_REDIRECT_URL);
  expect(redirect.searchParams.get('code_challenge_method')).toBe('s256');
  const attempt = JSON.parse(
    records.get('supabase.' + config.url + '.google-attempt'),
  );
  const verifier = JSON.parse(
    records.get('test-auth-flow-' + attempt.flowId + '-code-verifier'),
  );
  expect(redirect.searchParams.get('code_challenge')).toBe(
    createHash('sha256').update(verifier).digest('base64url'),
  );
  expect(entropy).toHaveBeenCalled();
});

test('rejects missing secure entropy rather than taking the SDK fallback', () => {
  Object.defineProperty(global, 'crypto', { configurable: true, value: {} });
  expect(ensurePkceCrypto).toThrow('Secure randomness is unavailable');
});

test('does not launch when Google provider is disabled or challenge is plain', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ external: { google: false } }),
  });
  await expect(repository.startGoogleSignIn()).rejects.toThrow('not enabled');
  auth.signInWithOAuth.mockResolvedValueOnce({
    data: {
      url: authorize.href.replace(
        'code_challenge_method=s256',
        'code_challenge_method=plain',
      ),
      flowId,
    },
  });
  await expect(repository.startGoogleSignIn()).rejects.toThrow(
    'Could not start secure',
  );
  expect(openUrl).not.toHaveBeenCalled();
  expect(records.size).toBe(0);
});

test('reuses a pending verifier and exchanges only one matching callback', async () => {
  await repository.startGoogleSignIn();
  await repository.startGoogleSignIn();
  expect(auth.signInWithOAuth).toHaveBeenCalledTimes(1);
  expect(openUrl).toHaveBeenCalledTimes(2);
  const restoredRepository = new SupabaseAuthRepository(
    { auth },
    storage,
    config,
  );
  expect(
    await restoredRepository.completeGoogleSignIn(
      'https://other.example?code=test',
    ),
  ).toBeNull();
  const result = await Promise.all([
    restoredRepository.completeGoogleSignIn(callback),
    restoredRepository.completeGoogleSignIn(callback),
  ]);
  expect(result).toEqual([account, null]);
  expect(auth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
  expect(auth.exchangeCodeForSession).toHaveBeenCalledWith(authCode, {
    flowId,
  });
});

test('rejects duplicate codes, token links and an expired attempt', async () => {
  await repository.startGoogleSignIn();
  for (const link of [
    callback + '&code=another',
    callback + '#access_token=forged',
    GOOGLE_REDIRECT_URL + '#code=wrong-place',
  ]) {
    await expect(repository.completeGoogleSignIn(link)).rejects.toThrow(
      'Could not verify',
    );
  }
  jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 11 * 60 * 1000);
  await expect(repository.completeGoogleSignIn(callback)).rejects.toThrow(
    'expired',
  );
  expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
});

test('handles a provider error without displaying its raw description', async () => {
  await repository.startGoogleSignIn();
  await expect(
    repository.completeGoogleSignIn(
      GOOGLE_REDIRECT_URL + '#error=access_denied&error_description=sensitive',
    ),
  ).rejects.toThrow('was canceled or declined');
  expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  expect(records.size).toBe(0);
});

test('manual sign-in fences late Google callbacks even if sent concurrently', async () => {
  await repository.startGoogleSignIn();
  const [signedIn, lateCallback] = await Promise.all([
    repository.signIn(' Jasmine@example.invalid ', 'email-password'),
    repository.completeGoogleSignIn(callback),
  ]);
  expect(signedIn).toEqual(account);
  expect(lateCallback).toBeNull();
  expect(auth.signInWithPassword).toHaveBeenCalledWith({
    email: account.email,
    password: 'email-password',
  });
  expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
});
