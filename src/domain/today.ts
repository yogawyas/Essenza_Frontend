import { AppState, localDay } from './models';

export function todayLog(state: AppState, now = new Date()) {
  return state.logs
    .filter(
      log =>
        localDay(log.wornAt) === localDay(now) &&
        Date.parse(log.wornAt) <= now.getTime(),
    )
    .sort((a, b) => b.wornAt.localeCompare(a.wornAt))[0];
}

export function weeklyRecap(state: AppState, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  const logs = state.logs.filter(
    log =>
      Date.parse(log.wornAt) >= start.getTime() &&
      Date.parse(log.wornAt) <= now.getTime(),
  );
  const days = new Set(logs.map(log => localDay(log.wornAt))).size;
  const counts = new Map<string, number>();
  logs.forEach(log =>
    counts.set(log.fragranceId, (counts.get(log.fragranceId) || 0) + 1),
  );
  const ranking = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  return {
    days,
    total: logs.length,
    unique: counts.size,
    ready: days >= 3,
    top: ranking[0]?.[0],
  };
}
