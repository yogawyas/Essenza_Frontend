import { AppState, Fragrance, Occasion, Accord } from './models';
import { CATALOG } from './catalog';

export interface Recommendation {
  fragrance: Fragrance;
  reasons: string[];
  score: number;
}

export function recommend(
  state: AppState,
  source: 'owned' | 'discovery',
  occasion: Occasion,
  mood: Accord | null,
  now = new Date(),
): Recommendation[] {
  const owned = new Set(
    state.shelf
      .filter(item => item.status === 'have')
      .map(item => item.fragranceId),
  );
  return CATALOG.filter(
    item =>
      (source === 'owned' ? owned.has(item.id) : !owned.has(item.id)) &&
      !item.accords.some(accord => state.profile.avoids.includes(accord)),
  )
    .map(fragrance => {
      const matches = fragrance.accords.filter(accord =>
        state.profile.likes.includes(accord),
      );
      let score = matches.length * 3;
      const reasons: string[] = [];
      if (matches.length) {
        reasons.push(`Selaras dengan preferensi ${matches.join(' & ')}.`);
      }
      if (fragrance.occasions.includes(occasion)) {
        score += 2;
        reasons.push(`Referensi karakter untuk ${occasion.toLowerCase()}.`);
      }
      if (mood && fragrance.accords.includes(mood)) {
        score += 3;
        reasons.push(`Sesuai arah ${mood} yang kamu pilih.`);
      }
      if (state.favorites.includes(fragrance.id)) {
        score += 1;
        reasons.push('Ada di favoritmu.');
      }
      if (source === 'owned') {
        const latest = state.logs
          .filter(log => log.fragranceId === fragrance.id)
          .reduce(
            (timestamp, log) => Math.max(timestamp, Date.parse(log.wornAt)),
            0,
          );
        const days = latest ? (now.getTime() - latest) / 86400000 : Infinity;
        if (days >= 7) {
          score += 1;
          reasons.push(
            latest
              ? 'Belum tercatat dipakai dalam 7 hari terakhir.'
              : 'Belum ada catatan pemakaian.',
          );
        }
        if (days < 1) {
          score -= 2;
        }
      }
      if (!reasons.length) {
        reasons.push(
          'Referensi eksplorasi; tambahkan preferensi agar lebih personal.',
        );
      }
      return { fragrance, reasons, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.fragrance.id.localeCompare(b.fragrance.id),
    );
}
