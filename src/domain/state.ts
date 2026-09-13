import {
  ACCORDS,
  AppState,
  LOCAL_USER_ID,
  OCCASIONS,
  Scentlist,
  ShelfItem,
  WearLog,
  createInitialState,
} from './models';
import { CATALOG, CURATORS, EDITORIAL_LISTS, fragranceById } from './catalog';

export type Action =
  | { type: 'profile'; profile: AppState['profile']; onboard?: boolean }
  | { type: 'shelf'; item: ShelfItem }
  | { type: 'removeShelf'; fragranceId: string }
  | { type: 'favorite'; fragranceId: string }
  | { type: 'saveList'; list: Scentlist }
  | { type: 'deleteList'; id: string }
  | { type: 'bookmark'; id: string }
  | { type: 'follow'; authorId: string }
  | { type: 'block'; authorId: string }
  | { type: 'report'; report: AppState['reports'][number] }
  | { type: 'wear'; log: WearLog }
  | { type: 'deleteWear'; id: string }
  | { type: 'reset' };

function toggle(values: string[], id: string) {
  return values.includes(id)
    ? values.filter(value => value !== id)
    : [...values, id];
}
function requireFragrance(id: string) {
  if (!fragranceById(id)) {
    throw new Error('Parfum tidak ditemukan.');
  }
}

export function visibleLists(state: AppState) {
  return [...state.lists, ...EDITORIAL_LISTS].filter(
    list =>
      !state.blocked.includes(list.authorId) &&
      (list.authorId === state.profile.id || list.visibility === 'public'),
  );
}

export function reduceState(state: AppState, action: Action): AppState {
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
          'Isi nama 1–40 karakter dan bio maksimal 160 karakter.',
        );
      }
      if (
        [...profile.likes, ...profile.avoids].some(a => !ACCORDS.includes(a)) ||
        profile.likes.some(a => profile.avoids.includes(a))
      ) {
        throw new Error('Preferensi dan aroma yang dihindari harus berbeda.');
      }
      return {
        ...state,
        profile: { ...profile, name: profile.name.trim() },
        onboarded: action.onboard || state.onboarded,
      };
    }
    case 'shelf':
      requireFragrance(action.item.fragranceId);
      if (
        !['have', 'want', 'had'].includes(action.item.status) ||
        !['Full bottle', 'Decant', 'Sample'].includes(action.item.format)
      ) {
        throw new Error('Status koleksi tidak valid.');
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
    case 'saveList': {
      const list = action.list;
      if (
        list.authorId !== state.profile.id ||
        EDITORIAL_LISTS.some(item => item.id === list.id)
      ) {
        throw new Error('Kamu hanya bisa mengedit scentlist milikmu.');
      }
      if (
        !list.title.trim() ||
        list.title.length > 60 ||
        list.description.length > 240 ||
        !['public', 'private'].includes(list.visibility)
      ) {
        throw new Error('Periksa judul, deskripsi, dan privasi scentlist.');
      }
      if (
        new Set(list.items.map(item => item.fragranceId)).size !==
          list.items.length ||
        list.items.length > CATALOG.length
      ) {
        throw new Error('Parfum di scentlist harus unik.');
      }
      list.items.forEach(item => {
        requireFragrance(item.fragranceId);
        if (item.note.length > 160) {
          throw new Error('Catatan maksimal 160 karakter.');
        }
      });
      return {
        ...state,
        lists: [
          { ...list, title: list.title.trim() },
          ...state.lists.filter(item => item.id !== list.id),
        ],
      };
    }
    case 'deleteList':
      return {
        ...state,
        lists: state.lists.filter(item => item.id !== action.id),
        savedListIds: state.savedListIds.filter(id => id !== action.id),
      };
    case 'bookmark': {
      const list = visibleLists(state).find(item => item.id === action.id);
      if (
        !list ||
        list.visibility !== 'public' ||
        list.authorId === state.profile.id
      ) {
        throw new Error('Scentlist ini tidak bisa disimpan.');
      }
      return { ...state, savedListIds: toggle(state.savedListIds, action.id) };
    }
    case 'follow':
      if (
        state.blocked.includes(action.authorId) ||
        !CURATORS.some(c => c.id === action.authorId)
      ) {
        throw new Error('Kurator tidak tersedia.');
      }
      return { ...state, following: toggle(state.following, action.authorId) };
    case 'block': {
      if (!CURATORS.some(c => c.id === action.authorId)) {
        throw new Error('Kurator tidak ditemukan.');
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
      };
    }
    case 'report': {
      if (
        !visibleLists(state).some(list => list.id === action.report.listId) ||
        !action.report.reason.trim()
      ) {
        throw new Error('Laporan tidak valid.');
      }
      return { ...state, reports: [...state.reports, action.report] };
    }
    case 'wear':
      requireFragrance(action.log.fragranceId);
      if (
        !Number.isFinite(Date.parse(action.log.wornAt)) ||
        Date.parse(action.log.wornAt) > Date.now() + 60000 ||
        !OCCASIONS.includes(action.log.occasion) ||
        action.log.note.length > 280
      ) {
        throw new Error('Periksa tanggal, aktivitas, dan catatan pemakaian.');
      }
      return {
        ...state,
        logs: [
          action.log,
          ...state.logs.filter(log => log.id !== action.log.id),
        ].sort((a, b) => b.wornAt.localeCompare(a.wornAt)),
      };
    case 'deleteWear':
      return { ...state, logs: state.logs.filter(log => log.id !== action.id) };
    case 'reset':
      return createInitialState();
  }
}

// Replay persisted data through the same validation rules before exposing it to UI.
export function parseState(raw: string): AppState {
  const data = JSON.parse(raw) as AppState;
  if (
    data.schemaVersion !== 1 ||
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
    ].every(key => Array.isArray(data[key as keyof AppState]))
  ) {
    throw new Error('Format data lokal tidak dikenali.');
  }
  let state = createInitialState();
  if (data.onboarded) {
    state = reduceState(state, {
      type: 'profile',
      profile: data.profile,
      onboard: true,
    });
  }
  for (const item of data.shelf) {
    state = reduceState(state, { type: 'shelf', item });
  }
  for (const fragranceId of new Set(data.favorites)) {
    state = reduceState(state, { type: 'favorite', fragranceId });
  }
  // saveList prepends; replay oldest-first to preserve the displayed order.
  for (const list of [...data.lists].reverse()) {
    state = reduceState(state, { type: 'saveList', list });
  }
  for (const log of data.logs) {
    state = reduceState(state, { type: 'wear', log });
  }
  for (const authorId of new Set(data.blocked)) {
    state = reduceState(state, { type: 'block', authorId });
  }
  for (const authorId of new Set(data.following)) {
    state = reduceState(state, { type: 'follow', authorId });
  }
  for (const id of new Set(data.savedListIds)) {
    if (
      visibleLists(state).some(
        list => list.id === id && list.authorId !== state.profile.id,
      )
    ) {
      state = reduceState(state, { type: 'bookmark', id });
    }
  }
  return {
    ...state,
    reports: data.reports.filter(
      report =>
        typeof report.reason === 'string' && typeof report.listId === 'string',
    ),
  };
}
