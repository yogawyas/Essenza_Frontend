import { fragranceById } from './catalog';
import { localDay } from './models';

export function journalPerfumes(state) {
  const entries = new Map();
  for (const log of state.logs) {
    const logs = entries.get(log.fragranceId) || [];
    logs.push(log);
    entries.set(log.fragranceId, logs);
  }
  const statuses = new Map(
    state.shelf.map(item => [item.fragranceId, item.status]),
  );
  const ids = new Set([...entries.keys(), ...statuses.keys()]);
  return [...ids]
    .map(id => ({
      fragrance: fragranceById(id),
      status: statuses.get(id) || 'unfiled',
      logs: entries.get(id) || [],
    }))
    .filter(item => item.fragrance);
}

const calendarDay = date =>
  Date.parse(localDay(date) + 'T00:00:00Z') / 86400000;

export function groupWearLogs(logs, now, ascending = false) {
  const groups = [
    { title: 'Today', items: [] },
    { title: 'Yesterday', items: [] },
    { title: 'Less than 7 days', items: [] },
    { title: 'This month', items: [] },
    { title: 'More than a month', items: [] },
  ];
  const sorted = [...logs].sort((a, b) =>
    ascending
      ? a.wornAt.localeCompare(b.wornAt)
      : b.wornAt.localeCompare(a.wornAt),
  );
  const today = calendarDay(now);
  for (const log of sorted) {
    const age = today - calendarDay(log.wornAt);
    const group = age <= 0 ? 0 : age === 1 ? 1 : age < 7 ? 2 : age < 30 ? 3 : 4;
    groups[group].items.push(log);
  }
  return (ascending ? groups.reverse() : groups).filter(
    group => group.items.length,
  );
}
