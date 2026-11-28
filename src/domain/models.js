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
// Extra notes a user can like or avoid on top of the eight accords. Each id
// matches an image in assets/notes and the canonical note id in noteArtwork.
export const SCENT_FAMILIES = [
  { label: 'Main accords', scents: ACCORDS },
  {
    label: 'Citrus',
    scents: ['lemon', 'bergamot', 'orange', 'mandarin', 'grapefruit', 'neroli'],
  },
  {
    label: 'Fruity',
    scents: [
      'apple',
      'pear',
      'peach',
      'plum',
      'raspberry',
      'cherry',
      'fig',
      'coconut',
    ],
  },
  {
    label: 'Floral',
    scents: [
      'rose',
      'jasmine',
      'peony',
      'iris',
      'violet',
      'lilac',
      'magnolia',
      'freesia',
      'tuberose',
      'lily-of-the-valley',
      'ylang-ylang',
      'frangipani',
      'geranium',
      'black-orchid',
    ],
  },
  {
    label: 'Green & Herbal',
    scents: ['lavender', 'mint', 'rosemary', 'tea', 'oakmoss'],
  },
  {
    label: 'Spices',
    scents: [
      'cinnamon',
      'clove',
      'cardamom',
      'saffron',
      'black-pepper',
      'pink-pepper',
    ],
  },
  { label: 'Woods & Earth', scents: ['cedar', 'oud', 'patchouli', 'vetiver'] },
  {
    label: 'Gourmand',
    scents: [
      'vanilla',
      'tonka-bean',
      'caramel',
      'honey',
      'coffee',
      'cocoa',
      'almond',
      'spun-sugar',
      'rum',
    ],
  },
  { label: 'Amber & Resin', scents: ['amber', 'incense', 'myrrh'] },
];
export const PREFERENCE_SCENTS = SCENT_FAMILIES.flatMap(
  family => family.scents,
);
const SCENT_LABEL_OVERRIDES = {
  'lily-of-the-valley': 'Lily of the Valley',
  'ylang-ylang': 'Ylang-Ylang',
  'spun-sugar': 'Cotton Candy',
  incense: 'Frankincense',
};
export function scentLabel(id) {
  return (
    SCENT_LABEL_OVERRIDES[id] ||
    id
      .split('-')
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(' ')
  );
}
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
