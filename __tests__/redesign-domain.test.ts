import {
  createInitialState,
  LayeringRecipe,
  StudioDraft,
} from '../src/domain/models';
import { parseState, reduceState } from '../src/domain/state';
import { ENGINE_VERSION, mockPredictor, simulate } from '../src/domain/studio';
import { todayLog, weeklyRecap } from '../src/domain/today';
import { LocalRepository } from '../src/storage/repository';
import { shelfDestination } from '../src/navigation/types';

const input = {
  fragranceA: 'light-blue',
  fragranceB: 'santal-33',
  dominance: 'balanced' as const,
};
const recipe: LayeringRecipe = {
  ...input,
  id: 'recipe-1',
  title: 'Morning duet',
  note: 'Demo only',
  engineVersion: ENGINE_VERSION,
  updatedAt: '2025-01-01T12:00:00.000Z',
};
const draft: StudioDraft = { ...input, id: 'draft-1', title: '', note: '' };
const now = new Date('2025-04-10T12:00:00');
const wear = (id: string, date: string, fragranceId = 'ck-one') => ({
  id,
  fragranceId,
  wornAt: new Date(date).toISOString(),
  occasion: 'Kerja' as const,
  note: '',
});

test('version 1 migrates without losing shelf, favorites, profile, lists or journal', () => {
  let state = reduceState(createInitialState(), {
    type: 'profile',
    profile: { ...createInitialState().profile, name: 'Local user' },
    onboard: true,
  });
  state = reduceState(state, {
    type: 'shelf',
    item: { fragranceId: 'ck-one', status: 'want', format: 'Sample' },
  });
  state = reduceState(state, { type: 'favorite', fragranceId: 'ck-one' });
  state = reduceState(state, {
    type: 'wear',
    log: wear('one', '2025-04-10T10:00:00'),
  });
  const legacy = { ...state, recipes: undefined, studioDraft: undefined };
  const migrated = parseState(JSON.stringify({ ...legacy, schemaVersion: 1 }));
  expect(migrated).toEqual({
    ...state,
    schemaVersion: 2,
    recipes: [],
    studioDraft: null,
  });
});

test('mock predictions are deterministic, explicitly demo, and symmetric when balanced', async () => {
  const result = await mockPredictor.predict(input);
  expect(result).toEqual(await mockPredictor.predict(input));
  expect(result.profile).toEqual(
    simulate({
      ...input,
      fragranceA: input.fragranceB,
      fragranceB: input.fragranceA,
    }).profile,
  );
  expect(result.source).toBe('demo');
  expect(result.engineVersion).toBe(ENGINE_VERSION);
  expect(result).not.toHaveProperty('confidence');
  expect(
    result.profile.reduce((sum, value) => sum + value.intensity, 0),
  ).toBeCloseTo(1, 5);
});
test('changing dominance changes the relative profile without randomness', () => {
  const a = simulate({ ...input, dominance: 'a' });
  const b = simulate({ ...input, dominance: 'b' });
  expect(a.profile).not.toEqual(b.profile);
  expect(a).toEqual(simulate({ ...input, dominance: 'a' }));
});
test('identical, missing and invalid perfume inputs are rejected', async () => {
  await expect(
    mockPredictor.predict({ ...input, fragranceB: input.fragranceA }),
  ).rejects.toThrow();
  await expect(
    mockPredictor.predict({ ...input, fragranceA: 'not-a-fragrance' }),
  ).rejects.toThrow();
  await expect(
    mockPredictor.predict({ ...input, dominance: 'invalid' as never }),
  ).rejects.toThrow();
});
test('drafts can be partial and survive persistence; saving clears the draft', () => {
  let state = reduceState(createInitialState(), {
    type: 'studioDraft',
    draft: { ...draft, fragranceB: null },
  });
  expect(parseState(JSON.stringify(state)).studioDraft?.fragranceB).toBeNull();
  state = reduceState(state, { type: 'saveRecipe', recipe });
  expect(state.studioDraft).toBeNull();
  expect(parseState(JSON.stringify(state)).recipes).toEqual([recipe]);
});
test('recipe save retry is idempotent, editing updates, remix stays separate', () => {
  let state = reduceState(createInitialState(), { type: 'saveRecipe', recipe });
  state = reduceState(state, { type: 'saveRecipe', recipe });
  expect(state.recipes).toHaveLength(1);
  state = reduceState(state, {
    type: 'saveRecipe',
    recipe: { ...recipe, note: 'Edited' },
  });
  state = reduceState(state, {
    type: 'saveRecipe',
    recipe: { ...recipe, id: 'remix', title: 'Remix' },
  });
  expect(state.recipes).toHaveLength(2);
  expect(state.recipes[1].note).toBe('Edited');
  const ids = state.recipes.map(value => value.id);
  for (let i = 0; i < 3; i++) {
    state = parseState(JSON.stringify(state));
    expect(state.recipes.map(value => value.id)).toEqual(ids);
  }
  state = reduceState(state, { type: 'deleteRecipe', id: 'remix' });
  expect(state.recipes).toHaveLength(1);
  expect(state.recipes[0].id).toBe(recipe.id);
});
test('malformed version 2 and invalid stored recipes are not silently accepted', () => {
  expect(() =>
    parseState(JSON.stringify({ ...createInitialState(), recipes: null })),
  ).toThrow();
  expect(() =>
    parseState(JSON.stringify({ ...createInitialState(), studioDraft: {} })),
  ).toThrow();
  expect(() =>
    reduceState(createInitialState(), {
      type: 'saveRecipe',
      recipe: { ...recipe, title: ' ' },
    }),
  ).toThrow();
  expect(() =>
    reduceState(createInitialState(), {
      type: 'saveRecipe',
      recipe: { ...recipe, engineVersion: 'unknown' as never },
    }),
  ).toThrow();
});
test('failed recipe write preserves the saved draft and allows retry', async () => {
  let raw = JSON.stringify(
    reduceState(createInitialState(), { type: 'studioDraft', draft }),
  );
  const storage = {
    getItem: async () => raw,
    setItem: jest
      .fn()
      .mockRejectedValueOnce(new Error('disk full'))
      .mockImplementation(async (_key, value) => {
        raw = value;
      }),
  };
  const repo = new LocalRepository(storage);
  await repo.load();
  await expect(repo.dispatch({ type: 'saveRecipe', recipe })).rejects.toThrow(
    'disk full',
  );
  expect((await new LocalRepository(storage).load()).studioDraft).toEqual(
    draft,
  );
  await repo.dispatch({ type: 'saveRecipe', recipe });
  const reloaded = await new LocalRepository(storage).load();
  expect(reloaded.recipes).toEqual([recipe]);
  expect(reloaded.studioDraft).toBeNull();
});
test('weekly recap needs three different local days, not three logs', () => {
  let state = createInitialState();
  for (const hour of ['08', '09', '10']) {
    state = reduceState(state, {
      type: 'wear',
      log: wear(hour, '2025-04-10T' + hour + ':00:00'),
    });
  }
  expect(weeklyRecap(state, now)).toMatchObject({
    total: 3,
    days: 1,
    ready: false,
  });
  state = reduceState(state, {
    type: 'wear',
    log: wear('yesterday', '2025-04-09T10:00:00'),
  });
  state = reduceState(state, {
    type: 'wear',
    log: wear('earlier', '2025-04-08T10:00:00', 'light-blue'),
  });
  expect(weeklyRecap(state, now)).toMatchObject({
    total: 5,
    days: 3,
    unique: 2,
    ready: true,
    top: 'ck-one',
  });
});
test('recap respects local seven-day boundaries and does not include future or old logs', () => {
  const state = {
    ...createInitialState(),
    logs: [
      wear('old', '2025-04-03T23:59:59'),
      wear('start', '2025-04-04T00:00:00'),
      wear('future', '2025-04-10T13:00:00'),
    ],
  };
  expect(weeklyRecap(state, now)).toMatchObject({ total: 1, days: 1 });
});
test('Now Wearing uses latest valid log today and responds to edit/delete and midnight', () => {
  let state = reduceState(createInitialState(), {
    type: 'wear',
    log: wear('first', '2025-04-10T08:00:00'),
  });
  state = reduceState(state, {
    type: 'wear',
    log: wear('second', '2025-04-10T10:00:00', 'light-blue'),
  });
  expect(todayLog(state, now)?.fragranceId).toBe('light-blue');
  state = reduceState(state, { type: 'deleteWear', id: 'second' });
  expect(todayLog(state, now)?.fragranceId).toBe('ck-one');
  expect(todayLog(state, new Date('2025-04-11T00:00:00'))).toBeUndefined();
});
test.each(['have', 'want', 'had'] as const)(
  'shelf destination carries the selected %s filter and highlighted perfume',
  status => {
    expect(
      shelfDestination({ section: 'perfumes', status, highlightId: 'ck-one' }),
    ).toMatchObject({
      screen: 'Shelf',
      params: {
        screen: 'ShelfHome',
        pop: true,
        params: { section: 'perfumes', status, highlightId: 'ck-one' },
      },
    });
  },
);
