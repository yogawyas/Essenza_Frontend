/* global AbortSignal: readonly */

const { Buffer } = require('node:buffer');
const { createHash } = require('node:crypto');
const { mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { decodeHTML } = require('entities');
const prettier = require('prettier');
const sharp = require('sharp');
const { OPENFUME, SCENTO, products } = require('./catalog-sources');

const root = path.resolve(__dirname, '..');
const assetDir = path.join(root, 'assets', 'catalog');
const illustratedNotes = new Set([
  'apple',
  'sichuan-pepper',
  'bergamot',
  'cardamom',
  'cedarwood',
  'cinnamon',
  'clove',
  'dates',
  'iris',
  'jasmine',
  'lavender',
  'lemon',
  'mandarin-orange',
  'myrrh',
  'nutmeg',
  'orange-blossom',
  'patchouli',
  'pear',
  'rose',
  'rum',
  'sandalwood',
  'tonka',
  'vanilla',
  'vetiver',
  'violet',
  'ylang-ylang',
]);
const concentrations = {
  'eau de parfum': 'EDP',
  'eau de toilette': 'EDT',
  'eau de cologne': 'EDC',
  parfum: 'Parfum',
  'extrait de parfum': 'Extrait',
};

async function request(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'EssenzaCatalog/1.0 (fragrance catalog refresh)' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} for ${url}`);
    error.status = response.status;
    throw error;
  }
  return response;
}

const text = (markup = '') =>
  decodeHTML(markup.replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();

const noteId = name =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function extractPhoto(html, imageClass, creditClass) {
  const photoTag = [...html.matchAll(/<img\b[^>]*>/g)]
    .map(match => match[0])
    .find(tag =>
      tag
        .match(/\bclass="([^"]+)"/)?.[1]
        .split(/\s+/)
        .includes(imageClass),
    );
  const url = photoTag?.match(/\bsrc="([^"]+)"/)?.[1];
  const credit = html.match(
    new RegExp(`<p class="${creditClass}">([\\s\\S]*?)</p>`),
  )?.[1];
  const source = credit?.match(/href="([^"]+)"/)?.[1];
  const license = text(credit).match(
    /\b(CC BY(?:-SA)? \d\.\d|CC0 1\.0|Public domain)$/i,
  )?.[1];
  if (!url || !source || !license) {
    return undefined;
  }
  return {
    url: decodeHTML(url),
    source: decodeHTML(source),
    credit: text(credit).replace(/^Photo:\s*/, ''),
    license,
  };
}

async function scrapeOpenfume(slug) {
  const url = new URL(`fragrance/${slug}/`, OPENFUME).href;
  const html = (await (await request(url)).text()).split('</main>')[0];
  const name = text(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]);
  const brand = text(
    html.match(/<a class="f-brand"[^>]*>([\s\S]*?)<\/a>/)?.[1],
  );
  if (!name || !brand) {
    throw new Error(`Could not parse the product title at ${url}`);
  }
  const tiers = {};
  for (const [, stage, markup] of html.matchAll(
    /<section class="tier tier-(top|heart|middle|base|general)">([\s\S]*?)<\/section>/g,
  )) {
    tiers[stage === 'middle' ? 'heart' : stage] = [
      ...markup.matchAll(
        /<a\b[^>]*href="\/openfume\/note\/([^/"<>]+)\/"[^>]*>([\s\S]*?)<\/a>/g,
      ),
    ].map(([, id, label]) => ({ id, name: text(label) }));
  }
  const strength = text(
    html.match(/<dt>Strength<\/dt><dd>([\s\S]*?)<\/dd>/)?.[1],
  );
  return {
    url,
    name,
    brand,
    concentration: concentrations[strength.toLowerCase()] || '',
    tiers,
    photo: extractPhoto(html, 'photo', 'credit'),
  };
}

function scentoTiers(row) {
  const entries = [
    ['top', row.top_notes],
    ['heart', row.heart_notes],
    ['base', row.base_notes],
  ].filter(([, names]) => names.length > 0);
  const ungrouped = row.notes.filter(
    name => !entries.some(([, names]) => names.includes(name)),
  );
  if (ungrouped.length) {
    entries.push(['general', ungrouped]);
  }
  return Object.fromEntries(
    entries.map(([stage, names]) => [
      stage,
      names.map(name => ({ id: noteId(name), name })),
    ]),
  );
}

function commonsPhoto([file, author, license]) {
  const hash = createHash('md5').update(file).digest('hex');
  const name = encodeURIComponent(file);
  const source = `https://commons.wikimedia.org/wiki/File:${name}`;
  return {
    url: `https://upload.wikimedia.org/wikipedia/commons/${
      hash[0]
    }/${hash.slice(0, 2)}/${name}`,
    source,
    credit: `${author}, Wikimedia Commons, ${license}`,
    license,
  };
}

async function loadProduct(id, config, scentoById) {
  const page = config.openfume
    ? await scrapeOpenfume(config.openfume)
    : undefined;
  const row = config.scento ? scentoById.get(config.scento) : undefined;
  if (config.scento && !row) {
    throw new Error(`Scento entry ${config.scento} was not found`);
  }
  const listedStrength =
    concentrations[row?.concentration.replace(/-/g, ' ')] || '';
  if (
    page?.concentration &&
    listedStrength &&
    page.concentration !== listedStrength
  ) {
    throw new Error(`Conflicting concentrations for ${id}`);
  }
  const tiers = row
    ? scentoTiers(row)
    : page?.tiers || {
        general: config.notes.names.map(name => ({ id: noteId(name), name })),
      };
  if (!Object.values(tiers).some(notes => notes.length)) {
    throw new Error(`Could not find fragrance notes for ${id}`);
  }
  return {
    data: {
      id,
      name: config.displayName || row?.name || page?.name,
      brand: row?.house || page?.brand,
      concentration: listedStrength || page?.concentration,
      accords: config.accords,
      notes: tiers,
    },
    notesSource: row?.url || page?.url || config.notes.url,
    photo: config.commons ? commonsPhoto(config.commons) : page?.photo,
  };
}

async function downloadPhoto(photo, key, size, photos) {
  const url = new URL(photo.url);
  if (
    url.protocol !== 'https:' ||
    !['images.openbeautyfacts.org', 'upload.wikimedia.org'].includes(
      url.hostname,
    )
  ) {
    throw new Error(`Unexpected photo host for ${key}`);
  }
  if (
    url.hostname === 'upload.wikimedia.org' &&
    url.pathname.includes('/commons/thumb/')
  ) {
    url.pathname = url.pathname
      .replace('/commons/thumb/', '/commons/')
      .replace(/\/[^/]+$/, '');
  }
  const target = `${key}.jpg`;
  let response;
  try {
    response = await request(url);
  } catch (error) {
    if (![404, 429].includes(error.status)) {
      throw error;
    }
    console.warn(`Photo unavailable for ${key}: HTTP ${error.status}`);
    return undefined;
  }
  const image = await sharp(Buffer.from(await response.arrayBuffer()))
    .autoOrient()
    .resize({
      width: size,
      height: size,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 85 })
    .toBuffer();
  photos.set(target, image);
  return target;
}

function assetMap(files) {
  return Object.entries(files)
    .map(
      ([id, file]) =>
        `${JSON.stringify(id)}: require('../../assets/catalog/${file}')`,
    )
    .join(',\n');
}

function licenseLink(license) {
  const cc = /^CC (BY(?:-SA)?) (\d\.\d)$/.exec(license);
  if (cc) {
    return `https://creativecommons.org/licenses/${cc[1].toLowerCase()}/${
      cc[2]
    }/`;
  }
  return license === 'CC0 1.0'
    ? 'https://creativecommons.org/publicdomain/zero/1.0/'
    : 'https://creativecommons.org/publicdomain/mark/1.0/';
}

function creditLine(label, photo) {
  return `- ${label} — ${photo.credit} ([original](${
    photo.source
  }), [license](${licenseLink(photo.license)}))`;
}

async function main() {
  const scentoUrl =
    'https://raw.githubusercontent.com/Scento-com/perfume-dataset/main/perfumes.jsonl';
  const dataset = await (await request(scentoUrl)).text();
  const rows = dataset
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));
  const scentoById = new Map(rows.map(row => [row.id, row]));
  const catalog = [];
  const bottleFiles = {};
  const noteFiles = {};
  const photos = new Map();
  const bottleCredits = [];
  const noteCredits = [];
  const noteSources = [];
  const wantedNotes = new Map();

  for (const [id, config] of Object.entries(products)) {
    const { data, photo, notesSource } = await loadProduct(
      id,
      config,
      scentoById,
    );
    const label = data.name || 'Chanel N°5 Eau de Parfum';
    if (photo) {
      const file = await downloadPhoto(photo, `bottle-${id}`, 480, photos);
      if (file) {
        bottleFiles[id] = file;
        bottleCredits.push(creditLine(label, photo));
      }
    }
    for (const note of Object.values(data.notes).flat()) {
      if (illustratedNotes.has(note.id)) {
        wantedNotes.set(note.id, note.name);
      }
    }
    noteSources.push(`- [${label}](${notesSource})`);
    catalog.push(data);
  }

  for (const [id, label] of wantedNotes) {
    const url = new URL(`note/${id}/`, OPENFUME);
    try {
      const markup = await (await request(url)).text();
      const photo = extractPhoto(markup, 'note-photo-big', 'photo-credit');
      if (photo) {
        const file = await downloadPhoto(photo, `note-${id}`, 240, photos);
        if (file) {
          noteFiles[id] = file;
          noteCredits.push(creditLine(label, photo));
        }
      }
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      console.warn(`No photo available for ${label}`);
    }
  }

  const module = prettier.format(
    `// Generated by npm run scrape:catalog.
    export const scrapedProducts = ${JSON.stringify(catalog)};
    export const bottlePhotos = {${assetMap(bottleFiles)}};
    export const notePhotos = {${assetMap(noteFiles)}};`,
    { ...require('../.prettierrc'), parser: 'babel' },
  );
  const credits = `# Catalog credits

Generated by the Essenza catalog scraper. Photographs were resized and converted to JPEG.

- [Openfume data and sources](${OPENFUME}sources/) ([ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)).
- [Scento Perfume Dataset](${SCENTO}) ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).

## Product photos

${bottleCredits.join('\n')}

## Note photos

${noteCredits.join('\n')}

## Fragrance notes

${noteSources.join('\n')}
`;
  await mkdir(assetDir, { recursive: true });
  for (const [name, image] of photos) {
    await writeFile(path.join(assetDir, name), image);
  }
  await writeFile(
    path.join(root, 'src', 'domain', 'scrapedCatalog.js'),
    module,
  );
  await writeFile(path.join(assetDir, 'CREDITS.md'), credits);
  console.log(
    `Imported ${catalog.length} perfumes, ${bottleCredits.length} bottle photos, and ${noteCredits.length} note photos.`,
  );
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
