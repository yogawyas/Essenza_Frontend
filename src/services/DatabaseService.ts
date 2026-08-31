/**
 * DatabaseService.ts
 * ==================
 * Versi JSON-based (tanpa native SQLite module).
 * - perfumes.json  : 2000+ parfum dari Kaggle (bundled asset, read-only)
 * - AsyncStorage   : parfum custom user (CRUD penuh, persisten)
 *
 * 100% OFFLINE, tidak memerlukan native module tambahan.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- Interfaces --------------------------------------------------------------

export interface Perfume {
  pid: number;
  brand: string;
  name: string;
  gender: string;
  rating: string;
  accords: Record<string, number>;
  top_accords: string;
  is_custom?: 0 | 1;
}

export interface UserPerfume {
  id?: string;
  name: string;
  accords: Record<string, number>;
  top_accords: string;
  mode: 'simple' | 'advanced';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ---- Internal State ----------------------------------------------------------

let _perfumesCache: Perfume[] | null = null;
const STORAGE_KEY = '@essenza_user_perfumes';

// ---- DatabaseService ---------------------------------------------------------

export class DatabaseService {

  /** Load catalog parfum dari bundled JSON asset (lazy, cached). */
  private static async getCatalog(): Promise<Perfume[]> {
    if (_perfumesCache) return _perfumesCache;
    const data = require('../assets/perfumes.json');
    _perfumesCache = data as Perfume[];
    return _perfumesCache;
  }

  /** (No-op untuk kompatibilitas - tidak perlu init khusus). */
  static async init(): Promise<void> {
    await DatabaseService.getCatalog();
    console.log('[DB] Catalog loaded from JSON asset.');
  }

  // ---- READ: Parfum Komersial ------------------------------------------------

  /** Full-text search berdasarkan nama atau brand. Max 30 hasil. */
  static async searchPerfumes(query: string): Promise<Perfume[]> {
    const catalog = await DatabaseService.getCatalog();
    const q = query.toLowerCase().trim();
    return catalog
      .filter(p => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q))
      .sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'))
      .slice(0, 30);
  }

  /**
   * Filter parfum berdasarkan label aroma.
   * Menghitung cosine-like similarity score per parfum.
   */
  static async getPerfumesByLabels(
    targetLabels: string[],
    minScore = 0.05,
    topK = 20
  ): Promise<(Perfume & { similarityScore: number })[]> {
    if (targetLabels.length === 0) return [];
    const catalog = await DatabaseService.getCatalog();
    return catalog
      .map(p => {
        let score = 0;
        for (const label of targetLabels) score += p.accords[label] ?? 0;
        return { ...p, similarityScore: score / targetLabels.length };
      })
      .filter(p => p.similarityScore >= minScore)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, topK);
  }

  // ---- CRUD: Parfum Custom (AsyncStorage) -----------------------------------

  private static async _readAll(): Promise<UserPerfume[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private static async _writeAll(items: UserPerfume[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  /** CREATE: Simpan parfum custom baru. */
  static async createUserPerfume(data: UserPerfume): Promise<string> {
    const items = await DatabaseService._readAll();
    const top = Object.entries(data.accords)
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join(', ');
    const newItem: UserPerfume = {
      ...data,
      id: Date.now().toString(),
      top_accords: top,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await DatabaseService._writeAll([newItem, ...items]);
    return newItem.id!;
  }

  /** READ ALL: Ambil semua parfum custom user. */
  static async getAllUserPerfumes(): Promise<UserPerfume[]> {
    return DatabaseService._readAll();
  }

  /** UPDATE: Edit parfum custom berdasarkan ID. */
  static async updateUserPerfume(id: string, data: Partial<UserPerfume>): Promise<void> {
    const items = await DatabaseService._readAll();
    const top = data.accords
      ? Object.entries(data.accords).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join(', ')
      : undefined;
    const updated = items.map(item =>
      item.id === id
        ? { ...item, ...data, top_accords: top ?? item.top_accords, updated_at: new Date().toISOString() }
        : item
    );
    await DatabaseService._writeAll(updated);
  }

  /** DELETE: Hapus parfum custom berdasarkan ID. */
  static async deleteUserPerfume(id: string): Promise<void> {
    const items = await DatabaseService._readAll();
    await DatabaseService._writeAll(items.filter(item => item.id !== id));
  }
}
