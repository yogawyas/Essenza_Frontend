export const LOCAL_USER_ID = 'local-profile';
export const ACCORDS = [
  'citrus',
  'fresh',
  'woody',
  'floral',
  'sweet',
  'musky',
  'spicy',
  'green',
];
export const OCCASIONS = ['Kuliah', 'Kerja', 'Santai', 'Malam'];
export const OCCASION_LABELS = {
  Kuliah: 'College',
  Kerja: 'Work',
  Santai: 'Casual',
  Malam: 'Evening',
  College: 'College',
  Work: 'Work',
  Casual: 'Casual',
  Evening: 'Evening',
};
export const COVER_COLORS = [
  '#163B2C',
  '#354E65',
  '#805347',
  '#756346',
  '#62546F',
];
export function createInitialState() {
  return {
    schemaVersion: 2,
    onboarded: false,
    profile: {
      id: LOCAL_USER_ID,
      name: '',
      bio: '',
      likes: [],
      avoids: [],
    },
    shelf: [],
    favorites: [],
    lists: [],
    savedListIds: [],
    likedListIds: [],
    feedback: [],
    privacy: { shelf: false, saved: false },
    following: [],
    blocked: [],
    reports: [],
    logs: [],
    recipes: [],
    studioDraft: null,
  };
}
export function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
export function localDay(iso) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}
