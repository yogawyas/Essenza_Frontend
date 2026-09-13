import {
  createInitialState,
  LOCAL_USER_ID,
  Scentlist,
} from '../src/domain/models';
import { parseState, reduceState, visibleLists } from '../src/domain/state';
import { recommend } from '../src/domain/recommendations';
import { LocalRepository } from '../src/storage/repository';

const list: Scentlist = {
  id: 'mine',
  authorId: LOCAL_USER_ID,
  title: 'Campus',
  description: '',
  visibility: 'private',
  color: '#163B2C',
  items: [{ fragranceId: 'ck-one', note: 'Fresh' }],
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const profile = {
  ...createInitialState().profile,
  name: 'Tester',
  likes: ['citrus' as const],
  avoids: [],
};
const withProfile = () =>
  reduceState(createInitialState(), {
    type: 'profile',
    profile,
    onboard: true,
  });

test('shelf upsert changes status without duplicating or changing favorites', () => {
  let state = withProfile();
  state = reduceState(state, { type: 'favorite', fragranceId: 'ck-one' });
  state = reduceState(state, {
    type: 'shelf',
    item: { fragranceId: 'ck-one', status: 'want', format: 'Sample' },
  });
  state = reduceState(state, {
    type: 'shelf',
    item: { fragranceId: 'ck-one', status: 'have', format: 'Decant' },
  });
  expect(state.shelf).toEqual([
    { fragranceId: 'ck-one', status: 'have', format: 'Decant' },
  ]);
  expect(
    reduceState(state, { type: 'removeShelf', fragranceId: 'ck-one' })
      .favorites,
  ).toEqual(['ck-one']);
});
test('owned recommendations never recommend wishlist and respect avoided accords', () => {
  let state = withProfile();
  state = reduceState(state, {
    type: 'shelf',
    item: { fragranceId: 'ck-one', status: 'have', format: 'Sample' },
  });
  state = reduceState(state, {
    type: 'shelf',
    item: { fragranceId: 'santal-33', status: 'want', format: 'Sample' },
  });
  expect(
    recommend(state, 'owned', 'Kuliah', null).map(item => item.fragrance.id),
  ).toEqual(['ck-one']);
  state = reduceState(state, {
    type: 'profile',
    profile: { ...profile, avoids: ['green'] },
  });
  expect(recommend(state, 'owned', 'Kuliah', null)).toEqual([]);
});
test('discovery excludes owned fragrances and explains cold start', () => {
  let state = createInitialState();
  state = reduceState(state, {
    type: 'shelf',
    item: { fragranceId: 'ck-one', status: 'have', format: 'Sample' },
  });
  const picks = recommend(state, 'discovery', 'Kuliah', null);
  expect(
    picks.every(
      item => item.fragrance.id !== 'ck-one' && item.reasons.length > 0,
    ),
  ).toBe(true);
});
test('scentlist cannot impersonate a curator or contain duplicate fragrances', () => {
  expect(() =>
    reduceState(withProfile(), {
      type: 'saveList',
      list: { ...list, authorId: 'demo-nara' },
    }),
  ).toThrow();
  expect(() =>
    reduceState(withProfile(), {
      type: 'saveList',
      list: { ...list, items: [list.items[0], list.items[0]] },
    }),
  ).toThrow();
  expect(() =>
    reduceState(withProfile(), {
      type: 'saveList',
      list: { ...list, id: 'editorial-campus' },
    }),
  ).toThrow();
});
test('scentlist order, notes, and visibility survive persistence', () => {
  const saved = {
    ...list,
    visibility: 'public' as const,
    items: [
      { fragranceId: 'light-blue', note: 'Second thought' },
      list.items[0],
    ],
  };
  const state = reduceState(withProfile(), { type: 'saveList', list: saved });
  expect(parseState(JSON.stringify(state)).lists).toEqual([saved]);
});
test('multiple scentlists keep their order across repeated restarts', () => {
  let state = reduceState(withProfile(), { type: 'saveList', list });
  state = reduceState(state, {
    type: 'saveList',
    list: { ...list, id: 'second', title: 'After hours' },
  });
  const ids = state.lists.map(item => item.id);
  for (let restart = 0; restart < 3; restart++) {
    state = parseState(JSON.stringify(state));
    expect(state.lists.map(item => item.id)).toEqual(ids);
  }
});

test('blocking removes lists from discovery, bookmarks, and following', () => {
  let state = withProfile();
  state = reduceState(state, { type: 'bookmark', id: 'editorial-campus' });
  state = reduceState(state, { type: 'follow', authorId: 'demo-nara' });
  state = reduceState(state, { type: 'block', authorId: 'demo-nara' });
  expect(visibleLists(state).some(item => item.authorId === 'demo-nara')).toBe(
    false,
  );
  expect(state.savedListIds).toEqual([]);
  expect(state.following).toEqual([]);
  expect(() =>
    reduceState(state, { type: 'bookmark', id: 'editorial-campus' }),
  ).toThrow();
});
test('wear retries are idempotent and editing/deleting updates history', () => {
  const log = {
    id: 'wear-1',
    fragranceId: 'ck-one',
    wornAt: '2025-01-01T09:00:00.000Z',
    occasion: 'Kuliah' as const,
    note: 'First',
  };
  let state = reduceState(withProfile(), { type: 'wear', log });
  state = reduceState(state, { type: 'wear', log });
  expect(state.logs).toHaveLength(1);
  state = reduceState(state, { type: 'wear', log: { ...log, note: 'Edited' } });
  expect(state.logs[0].note).toBe('Edited');
  expect(reduceState(state, { type: 'deleteWear', id: log.id }).logs).toEqual(
    [],
  );
});
test('future wear dates and overlapping preferences are rejected', () => {
  expect(() =>
    reduceState(withProfile(), {
      type: 'wear',
      log: {
        id: 'future',
        fragranceId: 'ck-one',
        wornAt: new Date(Date.now() + 86400000).toISOString(),
        occasion: 'Kuliah',
        note: '',
      },
    }),
  ).toThrow();
  expect(() =>
    reduceState(withProfile(), {
      type: 'profile',
      profile: { ...profile, avoids: ['citrus'] },
    }),
  ).toThrow();
});
test('concurrent persistence preserves both writes and reload restores data', async () => {
  let raw: string | null = null;
  const storage = {
    getItem: async () => raw,
    setItem: async (_key: string, value: string) => {
      raw = value;
    },
  };
  const repository = new LocalRepository(storage);
  await repository.load();
  await repository.dispatch({ type: 'profile', profile, onboard: true });
  await Promise.all([
    repository.dispatch({ type: 'favorite', fragranceId: 'ck-one' }),
    repository.dispatch({ type: 'favorite', fragranceId: 'light-blue' }),
  ]);
  expect((await new LocalRepository(storage).load()).favorites).toEqual([
    'ck-one',
    'light-blue',
  ]);
});
test('failed disk write is not committed and the next write can recover', async () => {
  const storage = {
    getItem: async () => null,
    setItem: jest
      .fn()
      .mockRejectedValueOnce(new Error('disk full'))
      .mockResolvedValue(undefined),
  };
  const repository = new LocalRepository(storage);
  await repository.load();
  await expect(
    repository.dispatch({ type: 'favorite', fragranceId: 'ck-one' }),
  ).rejects.toThrow('disk full');
  const state = await repository.dispatch({
    type: 'favorite',
    fragranceId: 'light-blue',
  });
  expect(state.favorites).toEqual(['light-blue']);
});
test('corrupt or unknown-version state is not silently overwritten', async () => {
  const storage = { getItem: async () => '{broken', setItem: jest.fn() };
  await expect(new LocalRepository(storage).load()).rejects.toThrow();
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(() =>
    parseState(JSON.stringify({ ...createInitialState(), schemaVersion: 99 })),
  ).toThrow();
});
