import {
  PREFERENCE_SCENTS,
  LOCAL_USER_ID,
  OCCASIONS,
  createInitialState,
} from './models';
import { CATALOG, CURATORS, EDITORIAL_LISTS, fragranceById } from './catalog';
import { validateDraft, validateRecipe } from './studio';
function toggle(values, id) {
  return values.includes(id)
    ? values.filter(value => value !== id)
    : [...values, id];
}
function requireFragrance(id) {
  if (!fragranceById(id)) {
    throw new Error('Fragrance unavailable.');
  }
}
export function visibleLists(state) {
  return [...state.lists, ...EDITORIAL_LISTS].filter(
    list =>
      !state.blocked.includes(list.authorId) &&
      (list.authorId === state.profile.id || list.visibility === 'public'),
  );
}
export function reduceState(state, action) {
  switch (action.type) {
    case 'profile': {
      const profile = action.profile;
      if (
        profile.id !== LOCAL_USER_ID ||
        !profile.name.trim() ||
        profile.name.trim().length > 40 ||
        profile.bio.length > 160
      ) {
        throw new Error(
          'Use 1–40 characters for your name and up to 160 for your bio.',
        );
      }
      if (
        [...profile.likes, ...profile.avoids].some(
          a => !PREFERENCE_SCENTS.includes(a),
        ) ||
        profile.likes.some(a => profile.avoids.includes(a))
      ) {
        throw new Error('Choose different notes for likes and avoids.');
      }
      return {
        ...state,
        profile: {
          ...profile,
          name: profile.name.trim(),
        },
        onboarded: action.onboard || state.onboarded,
      };
    }
    case 'shelf':
      requireFragrance(action.item.fragranceId);
      if (
        !['have', 'want', 'had'].includes(action.item.status) ||
        !['Full bottle', 'Decant', 'Sample'].includes(action.item.format)
      ) {
        throw new Error('Invalid collection status.');
      }
      return {
        ...state,
        shelf: [
          ...state.shelf.filter(
            item => item.fragranceId !== action.item.fragranceId,
          ),
          action.item,
        ],
      };
    case 'removeShelf':
      return {
        ...state,
        shelf: state.shelf.filter(
          item => item.fragranceId !== action.fragranceId,
        ),
      };
    case 'favorite':
      requireFragrance(action.fragranceId);
      return {
        ...state,
        favorites: toggle(state.favorites, action.fragranceId),
      };
    case 'updateList':
    case 'addListPerfume':
    case 'removeListPerfume': {
      const current = state.lists.find(list => list.id === action.id);
      if (!current) {
        throw new Error('This scentlist is no longer available.');
      }
      let changes = action.changes;
      if (action.type === 'addListPerfume') {
        if (
          current.items.some(item => item.fragranceId === action.fragranceId)
        ) {
          return state;
        }
        changes = {
          items: [
            ...current.items,
            { fragranceId: action.fragranceId, note: '' },
          ],
        };
      } else if (action.type === 'removeListPerfume') {
        changes = {
          items: current.items.filter(
            item => item.fragranceId !== action.fragranceId,
          ),
        };
      }
      return reduceState(state, {
        type: 'saveList',
        list: { ...current, ...changes, updatedAt: action.updatedAt },
      });
    }
    case 'saveList': {
      const list = action.list;
      if (
        list.authorId !== state.profile.id ||
        EDITORIAL_LISTS.some(item => item.id === list.id)
      ) {
        throw new Error('You can edit your own scentlists.');
      }
      if (
        !list.title.trim() ||
        list.title.length > 60 ||
        list.description.length > 240 ||
        !['public', 'private'].includes(list.visibility)
      ) {
        throw new Error(
          'Check the scentlist name, description, and visibility.',
        );
      }
      if (
        new Set(list.items.map(item => item.fragranceId)).size !==
          list.items.length ||
        list.items.length > CATALOG.length
      ) {
        throw new Error('A fragrance can appear only once per scentlist.');
      }
      list.items.forEach(item => {
        requireFragrance(item.fragranceId);
        if (item.note.length > 160) {
          throw new Error('Use up to 160 characters for a note.');
        }
      });
      return {
        ...state,
        lists: [
          {
            ...list,
            title: list.title.trim(),
          },
          ...state.lists.filter(item => item.id !== list.id),
        ],
      };
    }
    case 'deleteList':
      return {
        ...state,
        lists: state.lists.filter(item => item.id !== action.id),
        savedListIds: state.savedListIds.filter(id => id !== action.id),
        likedListIds: state.likedListIds.filter(id => id !== action.id),
      };
    case 'privacy':
      if (action.section !== 'shelf' && action.section !== 'saved') {
        return state;
      }
      return {
        ...state,
        privacy: { ...state.privacy, [action.section]: Boolean(action.value) },
      };
    case 'likeList': {
      const list = visibleLists(state).find(item => item.id === action.id);
      if (
        !list ||
        list.authorId === state.profile.id ||
        list.visibility !== 'public'
      ) {
        return state;
      }
      return { ...state, likedListIds: toggle(state.likedListIds, action.id) };
    }
    case 'feedback': {
      const entry = action.entry;
      const available =
        entry.kind === 'perfume'
          ? Boolean(fragranceById(entry.target))
          : entry.kind === 'scentlist' &&
            visibleLists(state).some(list => list.id === entry.target);
      if (
        !available ||
        typeof entry.message !== 'string' ||
        !entry.message.trim() ||
        entry.message.length > 280 ||
        (entry.rating != null &&
          (!Number.isInteger(entry.rating) ||
            entry.rating < 1 ||
            entry.rating > 5))
      ) {
        throw new Error('Check your message and rating.');
      }
      return {
        ...state,
        feedback: [
          { ...entry, message: entry.message.trim() },
          ...state.feedback.filter(item => item.id !== entry.id),
        ],
      };
    }
    case 'deleteFeedback':
      return {
        ...state,
        feedback: state.feedback.filter(entry => entry.id !== action.id),
      };
    case 'bookmark': {
      const list = visibleLists(state).find(item => item.id === action.id);
      if (
        !list ||
        list.visibility !== 'public' ||
        list.authorId === state.profile.id
      ) {
        throw new Error('This scentlist cannot be saved.');
      }
      return {
        ...state,
        savedListIds: toggle(state.savedListIds, action.id),
      };
    }
    case 'follow':
      if (
        state.blocked.includes(action.authorId) ||
        !CURATORS.some(c => c.id === action.authorId)
      ) {
        throw new Error('This creator is unavailable.');
      }
      return {
        ...state,
        following: toggle(state.following, action.authorId),
      };
    case 'block': {
      if (!CURATORS.some(c => c.id === action.authorId)) {
        throw new Error('Creator not found.');
      }
      const blocked = toggle(state.blocked, action.authorId);
      const hidden = EDITORIAL_LISTS.filter(list =>
        blocked.includes(list.authorId),
      ).map(list => list.id);
      return {
        ...state,
        blocked,
        following: state.following.filter(id => !blocked.includes(id)),
        savedListIds: state.savedListIds.filter(id => !hidden.includes(id)),
        likedListIds: state.likedListIds.filter(id => !hidden.includes(id)),
      };
    }
    case 'report': {
      if (
        !visibleLists(state).some(list => list.id === action.report.listId) ||
        !action.report.reason.trim()
      ) {
        throw new Error('Invalid report.');
      }
      return {
        ...state,
        reports: [...state.reports, action.report],
      };
    }
    case 'wear':
      requireFragrance(action.log.fragranceId);
      if (
        !Number.isFinite(Date.parse(action.log.wornAt)) ||
        Date.parse(action.log.wornAt) > Date.now() + 60000 ||
        !OCCASIONS.includes(action.log.occasion) ||
        action.log.note.length > 280
      ) {
        throw new Error('Check the wear date, occasion, and notes.');
      }
      return {
        ...state,
        logs: [
          action.log,
          ...state.logs.filter(log => log.id !== action.log.id),
        ].sort((a, b) => b.wornAt.localeCompare(a.wornAt)),
      };
    case 'deleteWear':
      return {
        ...state,
        logs: state.logs.filter(log => log.id !== action.id),
      };
    case 'reset':
      return createInitialState();
    case 'studioDraft':
      if (action.draft) {
        validateDraft(action.draft);
      }
      return {
        ...state,
        studioDraft: action.draft,
      };
    case 'saveRecipe': {
      validateRecipe(action.recipe);
      return {
        ...state,
        recipes: [
          {
            ...action.recipe,
            title: action.recipe.title.trim(),
          },
          ...state.recipes.filter(recipe => recipe.id !== action.recipe.id),
        ],
        studioDraft: null,
      };
    }
    case 'deleteRecipe':
      return {
        ...state,
        recipes: state.recipes.filter(recipe => recipe.id !== action.id),
        studioDraft:
          state.studioDraft?.recipeId === action.id ? null : state.studioDraft,
      };
  }
}

// Replay persisted data through the same validation rules before exposing it to UI.
export function parseState(raw) {
  const data = JSON.parse(raw);
  if (
    ![1, 2].includes(data.schemaVersion) ||
    typeof data.onboarded !== 'boolean' ||
    ![
      'shelf',
      'favorites',
      'lists',
      'savedListIds',
      'following',
      'blocked',
      'reports',
      'logs',
    ].every(key => Array.isArray(data[key]))
  ) {
    throw new Error('Local data has an unrecognized format.');
  }
  let state = createInitialState();
  if (
    data.schemaVersion === 2 &&
    (!Array.isArray(data.recipes) ||
      !(data.studioDraft === null || typeof data.studioDraft === 'object'))
  ) {
    throw new Error('Local Studio data has an unrecognized format.');
  }
  if (data.onboarded) {
    state = reduceState(state, {
      type: 'profile',
      profile: data.profile,
      onboard: true,
    });
  }
  for (const item of data.shelf) {
    state = reduceState(state, {
      type: 'shelf',
      item,
    });
  }
  for (const fragranceId of new Set(data.favorites)) {
    state = reduceState(state, {
      type: 'favorite',
      fragranceId,
    });
  }
  // saveList prepends; replay oldest-first to preserve the displayed order.
  for (const list of [...data.lists].reverse()) {
    state = reduceState(state, {
      type: 'saveList',
      list,
    });
  }
  const legacyOccasions = { College: 'Kuliah', Work: 'Kerja', Casual: 'Santai', Evening: 'Malam' };
  for (const log of data.logs) {
    state = reduceState(state, {
      type: 'wear',
      log: { ...log, occasion: legacyOccasions[log.occasion] || log.occasion },
    });
  }
  // Version 1 has no Studio data; upgrading must preserve the existing collection.
  if (data.schemaVersion === 2) {
    for (const recipe of [...data.recipes].reverse()) {
      state = reduceState(state, {
        type: 'saveRecipe',
        recipe,
      });
    }
    if (data.studioDraft) {
      state = reduceState(state, {
        type: 'studioDraft',
        draft: data.studioDraft,
      });
    }
  }
  for (const authorId of new Set(data.blocked)) {
    state = reduceState(state, {
      type: 'block',
      authorId,
    });
  }
  for (const authorId of new Set(data.following)) {
    state = reduceState(state, {
      type: 'follow',
      authorId,
    });
  }
  for (const id of new Set(data.savedListIds)) {
    if (
      visibleLists(state).some(
        list => list.id === id && list.authorId !== state.profile.id,
      )
    ) {
      state = reduceState(state, {
        type: 'bookmark',
        id,
      });
    }
  }
  if (Array.isArray(data.feedback)) {
    for (const entry of [...data.feedback].reverse()) {
      const exists =
        entry?.kind === 'perfume'
          ? fragranceById(entry.target)
          : visibleLists(state).some(list => list.id === entry?.target);
      if (exists) {
        state = reduceState(state, { type: 'feedback', entry });
      }
    }
  }
  return {
    ...state,
    privacy: {
      shelf: data.privacy?.shelf === true,
      saved: data.privacy?.saved === true,
    },
    likedListIds: Array.isArray(data.likedListIds)
      ? [...new Set(data.likedListIds)].filter(id =>
          visibleLists(state).some(
            list => list.id === id && list.authorId !== state.profile.id,
          ),
        )
      : [],
    reports: data.reports.filter(
      report =>
        typeof report.reason === 'string' && typeof report.listId === 'string',
    ),
  };
}
