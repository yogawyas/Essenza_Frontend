import { AccountRepository } from '../backend/client/AccountRepository';
import { createInitialState } from '../src/domain/models';

const firstUser = { userId: 'first-user', name: 'Explorer' };
const createClient = () => {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    maybeSingle: jest.fn(async () => ({ data: null, error: null })),
  };
  return { query, from: jest.fn(() => query), rpc: jest.fn() };
};

test('initializes a new account without reading another account or demo data', async () => {
  const client = createClient();
  const repo = new AccountRepository(client, firstUser);
  const state = await repo.load();
  expect(client.query.eq).toHaveBeenCalledWith('user_id', 'first-user');
  expect(state.profile.name).toBe('Explorer');
  expect(state.profile.id).toBe('local-profile');
  expect(state.onboarded).toBe(false);
  expect(state.shelf).toEqual([]);
});

test('serializes changes with their account and expected revision', async () => {
  const client = createClient();
  const repo = new AccountRepository(client, firstUser);
  client.rpc
    .mockResolvedValueOnce({ data: 1 })
    .mockResolvedValueOnce({ data: 2 });
  await repo.load();
  const profile = {
    type: 'profile',
    profile: { ...repo.state.profile, name: 'First Account' },
    onboard: true,
  };
  const first = repo.dispatch(profile);
  const second = repo.dispatch({
    type: 'privacy',
    section: 'shelf',
    value: true,
  });
  await Promise.all([first, second]);
  expect(client.rpc).toHaveBeenNthCalledWith(2, 'save_essenza_account_state', {
    p_state: expect.objectContaining({
      onboarded: true,
      privacy: { shelf: true, saved: false },
    }),
    p_expected_revision: 1,
    p_expected_user_id: 'first-user',
  });
});

test('does not publish a failed change and reloads before retrying a stale revision', async () => {
  const client = createClient();
  const remoteState = createInitialState();
  remoteState.onboarded = true;
  remoteState.profile.name = 'Saved on another device';
  client.query.maybeSingle
    .mockResolvedValueOnce({ data: null })
    .mockResolvedValueOnce({
      data: { state: remoteState, revision: 3 },
    });
  const repo = new AccountRepository(client, firstUser);
  const initial = await repo.load();
  const action = { type: 'privacy', section: 'shelf', value: true };
  client.rpc
    .mockResolvedValueOnce({ error: { code: '42501' } })
    .mockResolvedValueOnce({ error: { code: '40001' } })
    .mockResolvedValueOnce({ data: 4 });

  await expect(repo.dispatch(action)).rejects.toThrow(
    'Could not save account data',
  );
  expect(repo.state).toBe(initial);
  await expect(repo.dispatch(action)).rejects.toThrow('another device');
  expect(repo.state.profile.name).toBe(remoteState.profile.name);
  expect(repo.state.privacy.shelf).toBe(false);
  const updated = await repo.dispatch(action);
  expect(updated.privacy.shelf).toBe(true);
  expect(client.rpc.mock.calls[2][1].p_expected_revision).toBe(3);
});
