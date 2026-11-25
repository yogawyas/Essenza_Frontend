import { AppState } from 'react-native';

function accountSession(session) {
  const user = session?.user;
  if (!user?.id || !user.email) {
    return null;
  }
  const name = user.user_metadata?.display_name;
  return {
    mode: 'supabase',
    userId: user.id,
    email: user.email,
    name:
      (typeof name === 'string' && name.trim().slice(0, 40)) ||
      user.email.split('@')[0].slice(0, 40) ||
      'Explorer',
  };
}

function authError(cause, message) {
  switch (cause?.code) {
    case 'invalid_credentials':
      return new Error('Incorrect email or password.');
    case 'email_not_confirmed':
      return new Error('Confirm your email before signing in.');
    case 'weak_password':
      return new Error('Choose a stronger password.');
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return new Error('Too many requests. Wait a moment and try again.');
    default:
      return new Error(message);
  }
}

async function request(operation, message) {
  try {
    const { data, error } = await operation();
    if (error) {
      throw error;
    }
    return data;
  } catch (cause) {
    throw authError(cause, message);
  }
}

export class SupabaseAuthRepository {
  constructor(client) {
    this.auth = client.auth;
  }

  async load() {
    const { session } = await request(
      () => this.auth.getSession(),
      'Could not restore your session. Check your connection and try again.',
    );
    return { session: accountSession(session) };
  }

  finishIntro() {}

  async signIn(email, password) {
    const { session } = await request(
      () =>
        this.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        }),
      'Could not sign in. Check your connection and try again.',
    );
    const account = accountSession(session);
    if (!account) {
      throw new Error('Could not open your account. Please sign in again.');
    }
    return account;
  }

  async register(name, email, password, confirmation) {
    const displayName = name.trim();
    const address = email.trim().toLowerCase();
    if (!displayName || displayName.length > 40) {
      throw new Error('Enter a username between 1 and 40 characters.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      throw new Error('Enter a valid email address.');
    }
    if (password.length < 8) {
      throw new Error('Use at least 8 characters.');
    }
    if (password !== confirmation) {
      throw new Error('Passwords do not match.');
    }
    const { session } = await request(
      () =>
        this.auth.signUp({
          email: address,
          password,
          options: { data: { display_name: displayName } },
        }),
      'Could not register. Check your connection and try again.',
    );
    return accountSession(session);
  }

  // Supabase persists the session through its secure storage adapter.
  saveSession() {}

  async signOut() {
    await request(
      () => this.auth.signOut({ scope: 'local' }),
      'Could not log out. Please try again.',
    );
  }

  subscribe(onSignedOut) {
    const refreshForState = state => {
      const update =
        state === 'active' || !state
          ? this.auth.startAutoRefresh()
          : this.auth.stopAutoRefresh();
      update.catch(() => {});
    };
    const lifecycle = AppState.addEventListener('change', refreshForState);
    const {
      data: { subscription },
    } = this.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') {
        onSignedOut();
      }
    });
    refreshForState(AppState.currentState);
    return () => {
      lifecycle.remove();
      subscription.unsubscribe();
      this.auth.stopAutoRefresh().catch(() => {});
    };
  }
}
