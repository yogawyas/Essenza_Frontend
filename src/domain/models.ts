export type Accord =
  | 'citrus'
  | 'fresh'
  | 'woody'
  | 'floral'
  | 'sweet'
  | 'musky'
  | 'spicy'
  | 'green';
export type Occasion = 'Kuliah' | 'Kerja' | 'Santai' | 'Malam';
export type ShelfStatus = 'have' | 'want' | 'had';
export type BottleFormat = 'Full bottle' | 'Decant' | 'Sample';
export type Visibility = 'private' | 'public';

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  concentration: string;
  accords: Accord[];
  occasions: Occasion[];
  color: string;
  ink: string;
  description: string;
}

export interface ShelfItem {
  fragranceId: string;
  status: ShelfStatus;
  format: BottleFormat;
}

export interface ScentlistItem {
  fragranceId: string;
  note: string;
}

export interface Scentlist {
  id: string;
  authorId: string;
  title: string;
  description: string;
  visibility: Visibility;
  color: string;
  items: ScentlistItem[];
  updatedAt: string;
}

export interface WearLog {
  id: string;
  fragranceId: string;
  wornAt: string;
  occasion: Occasion;
  note: string;
}

export interface AppState {
  schemaVersion: 1;
  onboarded: boolean;
  profile: {
    id: string;
    name: string;
    bio: string;
    likes: Accord[];
    avoids: Accord[];
  };
  shelf: ShelfItem[];
  favorites: string[];
  lists: Scentlist[];
  savedListIds: string[];
  following: string[];
  blocked: string[];
  reports: { id: string; listId: string; reason: string; createdAt: string }[];
  logs: WearLog[];
}

export const LOCAL_USER_ID = 'local-profile';
export const ACCORDS: Accord[] = [
  'citrus',
  'fresh',
  'woody',
  'floral',
  'sweet',
  'musky',
  'spicy',
  'green',
];
export const OCCASIONS: Occasion[] = ['Kuliah', 'Kerja', 'Santai', 'Malam'];
export const COVER_COLORS = [
  '#163B2C',
  '#354E65',
  '#805347',
  '#756346',
  '#62546F',
];

export function createInitialState(): AppState {
  return {
    schemaVersion: 1,
    onboarded: false,
    profile: { id: LOCAL_USER_ID, name: '', bio: '', likes: [], avoids: [] },
    shelf: [],
    favorites: [],
    lists: [],
    savedListIds: [],
    following: [],
    blocked: [],
    reports: [],
    logs: [],
  };
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function localDay(iso: string | Date): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}
