import { CATALOG } from './catalog';
import { scentLabel } from './models';
import { canonicalNoteId } from './noteArtwork';

const noteCache = new Map();
function noteIds(fragrance) {
  if (!noteCache.has(fragrance.id)) {
    const names = Object.values(fragrance.notes || {})
      .flat()
      .map(note => canonicalNoteId(note.name || note.id || ''));
    noteCache.set(fragrance.id, new Set(names));
  }
  return noteCache.get(fragrance.id);
}

export function recommend(state, source, occasion, mood, now = new Date()) {
  const { likes, avoids } = state.profile;
  const owned = new Set(
    state.shelf
      .filter(item => item.status === 'have')
      .map(item => item.fragranceId),
  );
  return CATALOG.filter(
    item =>
      (source === 'owned' ? owned.has(item.id) : !owned.has(item.id)) &&
      !item.accords.some(accord => avoids.includes(accord)) &&
      !avoids.some(scent => noteIds(item).has(scent)),
  )
    .map(fragrance => {
      const matches = fragrance.accords.filter(accord =>
        likes.includes(accord),
      );
      const noteMatches = likes.filter(
        scent => !fragrance.accords.includes(scent) && noteIds(fragrance).has(scent),
      );
      let score = matches.length * 3 + noteMatches.length * 2;
      const reasons = [];
      if (matches.length || noteMatches.length) {
        const names = [
          ...matches,
          ...noteMatches.map(scent => scentLabel(scent).toLowerCase()),
        ];
        reasons.push(`Selaras dengan preferensi ${names.join(' & ')}.`);
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
      return {
        fragrance,
        reasons,
        score,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.fragrance.id.localeCompare(b.fragrance.id),
    );
}
