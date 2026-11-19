function normalize(value) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function matchesQuery(query, ...fields) {
  return normalize(fields.filter(Boolean).join(' ')).includes(
    normalize(query.trim()),
  );
}
