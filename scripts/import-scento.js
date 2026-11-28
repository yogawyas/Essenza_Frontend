/* global AbortSignal: readonly */

// Imports the full Scento Perfume Dataset (CC BY 4.0) as extra catalog entries.
// Hand-curated perfumes in catalog-sources.js are skipped; catalog.js also drops
// any entry whose brand and name already exist in the curated catalog.
// Run with: npm run import:scento

const { writeFile } = require('node:fs/promises');
const path = require('node:path');
const { products } = require('./catalog-sources');

const DATASET =
  'https://raw.githubusercontent.com/Scento-com/perfume-dataset/main/perfumes.jsonl';
const output = path.resolve(__dirname, '..', 'src', 'domain', 'scentoCatalog.json');

// Dataset "character" values mapped onto the app's eight accords. Strong
// signals are used first; weak ones only fill in when fewer than two remain.
const strong = {
  citrusy: 'citrus',
  fresh: 'fresh',
  clean: 'fresh',
  salty: 'fresh',
  woody: 'woody',
  earthy: 'woody',
  smoky: 'woody',
  leathery: 'woody',
  floral: 'floral',
  sweet: 'sweet',
  fruity: 'sweet',
  musky: 'musky',
  powdery: 'musky',
  spicy: 'spicy',
  amber: 'spicy',
  resinous: 'spicy',
  green: 'green',
  herbal: 'green',
};
const weak = { warm: 'spicy', creamy: 'sweet', rich: 'sweet' };
const concentrations = {
  'eau-de-parfum': 'EDP',
  'eau-de-toilette': 'EDT',
  'eau-de-cologne': 'EDC',
  extrait: 'Extrait',
  parfum: 'Parfum',
  elixir: 'Elixir',
};

function accordsFor(row) {
  const picked = [];
  const add = accord => {
    if (accord && !picked.includes(accord) && picked.length < 3) {
      picked.push(accord);
    }
  };
  row.character.forEach(trait => add(strong[trait]));
  if (picked.length < 2) {
    row.character.forEach(trait => add(weak[trait]));
  }
  return picked.length ? picked : ['fresh'];
}

function occasionsFor(row) {
  const times = row.times_of_day;
  const occasions = [];
  if (times.includes('day')) occasions.push('Kuliah', 'Santai');
  if (times.includes('evening')) occasions.push('Kerja');
  if (times.includes('night') || !times.includes('day')) occasions.push('Malam');
  return occasions;
}

// Some dataset rows repeat a note within one tier ("Oud, Oud").
const unique = names => [...new Set(names)];

function notesFor(row) {
  const tiers = {};
  if (row.top_notes.length) tiers.top = unique(row.top_notes);
  if (row.heart_notes.length) tiers.heart = unique(row.heart_notes);
  if (row.base_notes.length) tiers.base = unique(row.base_notes);
  const grouped = new Set(Object.values(tiers).flat());
  const general = unique(row.notes.filter(name => !grouped.has(name)));
  if (general.length) tiers.general = general;
  return tiers;
}

const key = row =>
  `${row.house} ${row.name}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

async function main() {
  const response = await fetch(DATASET, {
    headers: { 'User-Agent': 'EssenzaCatalog/1.0 (fragrance catalog refresh)' },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${DATASET}`);
  }
  const rows = (await response.text())
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));

  const curated = new Set(
    Object.values(products)
      .map(config => config.scento)
      .filter(Boolean),
  );
  const ranked = [...rows].sort(
    (a, b) =>
      (a.popularity_rank ?? Infinity) - (b.popularity_rank ?? Infinity),
  );
  const seen = new Set();
  const entries = [];
  for (const row of ranked) {
    if (curated.has(row.id) || seen.has(key(row))) continue;
    if (!row.description || !row.notes.length) continue;
    seen.add(key(row));
    entries.push({
      id: `sc-${row.id}`,
      name: row.name,
      brand: row.house,
      concentration: concentrations[row.concentration] || '',
      accords: accordsFor(row),
      occasions: occasionsFor(row),
      description: row.description,
      notes: notesFor(row),
    });
  }

  await writeFile(
    output,
    `[\n${entries.map(entry => JSON.stringify(entry)).join(',\n')}\n]\n`,
  );
  console.log(`Imported ${entries.length} perfumes into ${path.basename(output)}.`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
