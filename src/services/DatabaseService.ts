/** Bundled catalog ranking and serialized, versioned local user storage. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import catalogData from '../assets/perfumes.json';

export interface Perfume {
  pid: number; brand: string; name: string; gender: string; rating: string;
  accords: Record<string, number>; top_accords: string; is_custom?: 0 | 1;
}
export interface UserPerfume {
  id?: string; name: string; accords: Record<string, number>; top_accords: string;
  mode: 'simple' | 'advanced'; notes?: string; created_at?: string; updated_at?: string;
}
const STORAGE_KEY = '@essenza_user_perfumes';
export const CATALOG_LABELS = Array.from(new Set(catalogData.flatMap(p => Object.keys(p.accords)))).sort();
const known = new Set(CATALOG_LABELS);
function validAccords(value: unknown, catalog = false): value is Record<string, number> {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.entries(value).every(([k, v]) => k.trim().length > 0 && (!catalog || known.has(k)) &&
      typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1);
}
function validateUser(item: any, persisted = true): asserts item is UserPerfume {
  if (!item || typeof item.name !== 'string' || !item.name.trim() || !validAccords(item.accords) ||
      !Object.keys(item.accords).length || !['simple', 'advanced'].includes(item.mode) ||
      (persisted && (typeof item.id !== 'string' || !item.id))) {
    throw new Error('Invalid saved perfume data. Existing storage has been preserved.');
  }
}
function topAccords(accords: Record<string, number>) {
  return Object.entries(accords).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]))
    .slice(0,3).map(([key]) => key).join(', ');
}
let validated: Perfume[] | null = null;
let operations: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>): Promise<T> {
  const next = operations.then(task, task);
  operations = next.catch(() => undefined);
  return next;
}
async function readAll(): Promise<UserPerfume[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) { return []; }
  let parsed: any;
  try { parsed = JSON.parse(raw); } catch { throw new Error('Saved perfume data is corrupt. Existing storage has been preserved.'); }
  // Legacy arrays remain readable; upgrade happens only during a successful user write.
  const items = Array.isArray(parsed) ? parsed : parsed?.version === 1 ? parsed.items : null;
  if (!Array.isArray(items)) { throw new Error('Unsupported saved perfume format. Existing storage has been preserved.'); }
  items.forEach(item => validateUser(item));
  if (new Set(items.map(p => p.id)).size !== items.length) { throw new Error('Duplicate saved perfume identifiers.'); }
  return items;
}
async function writeAll(items: UserPerfume[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({version: 1, items}));
}
export class DatabaseService {
  private static async getCatalog(): Promise<Perfume[]> {
    if (validated) { return validated; }
    const ids = new Set<number>();
    for (const p of catalogData) {
      if (!Number.isInteger(p.pid) || ids.has(p.pid) || typeof p.name !== 'string' || !p.name.trim() ||
          typeof p.brand !== 'string' || !validAccords(p.accords, true) || !Number.isFinite(Number(p.rating))) {
        throw new Error('The bundled catalog is invalid.');
      }
      ids.add(p.pid);
    }
    validated = catalogData as unknown as Perfume[];
    return validated;
  }
  static async init() { await this.getCatalog(); }
  static async searchPerfumes(query: string): Promise<Perfume[]> {
    const q = query.trim().toLowerCase();
    if (!q) { return []; }
    return (await this.getCatalog()).filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      .sort((a,b) => Number(b.rating)-Number(a.rating) || a.pid-b.pid).slice(0,30);
  }
  /** Arithmetic mean of selected catalog accord strengths; not cosine or an ML prediction. */
  static async getPerfumesByLabels(targetLabels: string[], minScore = .05, topK = 20): Promise<(Perfume & {matchScore: number})[]> {
    const labels = [...new Set(targetLabels)];
    if (labels.some(l => !known.has(l)) || !Number.isFinite(minScore) || minScore < 0 || minScore > 1 ||
        !Number.isInteger(topK) || topK < 1) { throw new Error('Invalid catalog filter.'); }
    if (!labels.length) { return []; }
    return (await this.getCatalog()).map(p => ({...p, matchScore: labels.reduce((s,l) => s+(p.accords[l] || 0),0)/labels.length}))
      .filter(p => p.matchScore >= minScore).sort((a,b) => b.matchScore-a.matchScore || Number(b.rating)-Number(a.rating) || a.pid-b.pid)
      .slice(0,topK);
  }
  static getAllUserPerfumes() { return serial(readAll); }
  static createUserPerfume(data: UserPerfume): Promise<string> {
    return serial(async () => {
      validateUser(data, false);
      const items = await readAll();
      const base = Date.now().toString();
      let id = base, suffix = 0;
      while (items.some(p => p.id === id)) { id = base + '-' + (++suffix); }
      const now = new Date().toISOString();
      await writeAll([{...data, id, name: data.name.trim(), top_accords: topAccords(data.accords), created_at: now, updated_at: now}, ...items]);
      return id;
    });
  }
  static updateUserPerfume(id: string, data: Partial<UserPerfume>): Promise<void> {
    return serial(async () => {
      const items = await readAll(), index = items.findIndex(p => p.id === id);
      if (index < 0) { throw new Error('Saved perfume no longer exists.'); }
      const item = {...items[index], ...data, id, created_at: items[index].created_at, updated_at: new Date().toISOString()};
      validateUser(item);
      item.name = item.name.trim(); item.top_accords = topAccords(item.accords);
      items[index] = item; await writeAll(items);
    });
  }
  static deleteUserPerfume(id: string): Promise<void> {
    return serial(async () => {
      const items = await readAll();
      if (!items.some(p => p.id === id)) { throw new Error('Saved perfume no longer exists.'); }
      await writeAll(items.filter(p => p.id !== id));
    });
  }
}
