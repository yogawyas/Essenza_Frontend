import AsyncStorage from '@react-native-async-storage/async-storage';
export const AUTH_SESSION_KEY = '@essenza/auth-session-v1';
export const INTRO_SEEN_KEY = '@essenza/intro-seen-v1';
export const DUMMY_ACCOUNT = {
  email: 'essenza@test.com',
  password: '12345678',
  name: 'Penjelajah',
};
// Development only. No password, OAuth token, or real account is stored here.
export class AuthRepository {
  storage;
  constructor(storage = AsyncStorage) {
    this.storage = storage;
  }
  async load() {
    const [seen, raw] = await Promise.all([
      this.storage.getItem(INTRO_SEEN_KEY),
      this.storage.getItem(AUTH_SESSION_KEY),
    ]);
    let session = null;
    if (raw) {
      try {
        const value = JSON.parse(raw);
        if (
          value?.mode === 'dummy' &&
          typeof value.email === 'string' &&
          typeof value.name === 'string' &&
          value.email.trim() &&
          value.name.trim()
        ) {
          session = { mode: 'dummy', email: value.email, name: value.name };
        }
      } catch {
        // A damaged session returns to login without changing collection data.
      }
    }
    return { introSeen: seen === 'true', session };
  }
  async finishIntro() {
    await this.storage.setItem(INTRO_SEEN_KEY, 'true');
  }
  signIn(email, password) {
    if (
      email.trim().toLowerCase() !== DUMMY_ACCOUNT.email ||
      password !== DUMMY_ACCOUNT.password
    ) {
      throw new Error('Email atau kata sandi salah.');
    }
    return {
      mode: 'dummy',
      email: DUMMY_ACCOUNT.email,
      name: DUMMY_ACCOUNT.name,
    };
  }
  // The registration design can be tried locally; this does not create an account.
  register(name, email, password, confirmation) {
    if (!name.trim() || name.trim().length > 40) {
      throw new Error('Isi nama pengguna 1–40 karakter.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error('Masukkan email yang valid.');
    }
    if (password.length < 8) {
      throw new Error('Kata sandi minimal 8 karakter.');
    }
    if (password !== confirmation) {
      throw new Error('Konfirmasi kata sandi belum sama.');
    }
    return {
      mode: 'dummy',
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };
  }
  async clearSession() {
    await this.storage.removeItem(AUTH_SESSION_KEY);
  }
  async saveSession(session) {
    await this.finishIntro();
    await this.storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  }
}
