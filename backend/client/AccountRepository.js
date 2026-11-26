import { createInitialState } from '../../src/domain/models';
import { parseState, reduceState } from '../../src/domain/state';

export class AccountRepository {
  state = createInitialState();
  revision = 0;
  queue = Promise.resolve();

  constructor(client, session) {
    this.client = client;
    this.userId = session.userId;
    this.name = session.name;
  }

  async load() {
    const { data, error } = await this.client
      .from('essenza_account_state')
      .select('state,revision')
      .eq('user_id', this.userId)
      .maybeSingle();
    if (error) {
      throw new Error(
        'Could not load account data. Check your connection and try again.',
      );
    }
    if (data && (!Number.isInteger(data.revision) || data.revision < 1)) {
      throw new Error('Your saved collection could not be read.');
    }
    const state = data
      ? parseState(JSON.stringify(data.state))
      : createInitialState();
    if (!state.onboarded) {
      state.profile.name = this.name;
    }
    this.state = state;
    this.revision = data?.revision ?? 0;
    return state;
  }

  async dispatch(action) {
    const operation = this.queue
      .catch(() => undefined)
      .then(async () => {
        const next = reduceState(this.state, action);
        if (next === this.state) {
          return next;
        }
        const { data, error } = await this.client.rpc(
          'save_essenza_account_state',
          {
            p_state: next,
            p_expected_revision: this.revision,
            p_expected_user_id: this.userId,
          },
        );
        if (error?.code === '40001') {
          await this.load();
          throw new Error(
            'Your account changed on another device. The latest data is loaded. Please try again.',
          );
        }
        if (error?.code === '22023') {
          throw new Error(
            'This collection could not be saved. Check that your app is up to date.',
          );
        }
        if (error || data !== this.revision + 1) {
          throw new Error(
            'Could not save account data. Check your connection and try again.',
          );
        }
        this.state = next;
        this.revision = data;
        return next;
      });
    this.queue = operation;
    return operation;
  }
}
