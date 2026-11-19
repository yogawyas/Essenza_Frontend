import { legacyCatalog } from './legacyCatalog';
import { bottlePhotos as legacyPhotos, offlineNotes, offlinePyramid } from './fragranceMedia';
import { bottlePhotos, scrapedProducts } from './scrapedCatalog';

const existingProducts = [
  {
    id: 'santal-33',
    name: 'Santal 33',
    brand: 'Le Labo',
    concentration: 'EDP',
    accords: ['woody', 'musky', 'spicy'],
    occasions: ['Kerja', 'Malam'],
    color: '#C9B89B',
    ink: '#514533',
    description: 'A dry, woody scent with soft musk and warm spice.',
  },
  {
    id: 'light-blue',
    name: 'Light Blue',
    brand: 'Dolce & Gabbana',
    concentration: 'EDT',
    accords: ['citrus', 'fresh', 'woody'],
    occasions: ['Kuliah', 'Santai'],
    color: '#B5CFD9',
    ink: '#31566B',
    description:
      'Bright citrus and crisp fruit soften into a light woody finish.',
  },
  {
    id: 'chanel-5',
    name: 'N°5',
    brand: 'Chanel',
    concentration: 'EDP',
    accords: ['floral', 'musky', 'fresh'],
    occasions: ['Kerja', 'Malam'],
    color: '#E4CA9D',
    ink: '#6B5430',
    description:
      'A floral bouquet with bright citrus, aldehydes, and soft vanilla.',
  },
  {
    id: 'black-orchid',
    name: 'Black Orchid',
    brand: 'Tom Ford',
    concentration: 'EDP',
    accords: ['sweet', 'woody', 'spicy'],
    occasions: ['Malam'],
    color: '#B5A3B3',
    ink: '#493F50',
    description: 'Dark florals and sweet spice over a warm woody base.',
  },
  {
    id: 'flowerbomb',
    name: 'Flowerbomb',
    brand: 'Viktor & Rolf',
    concentration: 'EDP',
    accords: ['floral', 'sweet', 'musky'],
    occasions: ['Santai', 'Malam'],
    color: '#E3C0C1',
    ink: '#795258',
    description: 'A sweet floral bouquet with a soft, warm finish.',
  },
  {
    id: 'acqua-di-gio',
    name: 'Acqua di Giò',
    brand: 'Giorgio Armani',
    concentration: 'EDT',
    accords: ['fresh', 'citrus', 'musky'],
    occasions: ['Kuliah', 'Kerja'],
    color: '#C3D3C6',
    ink: '#416454',
    description:
      'A fresh marine scent with crisp citrus and a soft woody base.',
  },
  {
    id: 'la-vie',
    name: 'La Vie Est Belle',
    brand: 'Lancôme',
    concentration: 'EDP',
    accords: ['sweet', 'floral'],
    occasions: ['Santai', 'Malam'],
    color: '#DEC4D0',
    ink: '#77556D',
    description: 'Soft florals and fruit over a sweet, warm base.',
  },
  {
    id: 'oud-wood',
    name: 'Oud Wood',
    brand: 'Tom Ford',
    concentration: 'EDP',
    accords: ['woody', 'spicy', 'musky'],
    occasions: ['Kerja', 'Malam'],
    color: '#9EAFA8',
    ink: '#344D43',
    description: 'Rich woods and warm spice with a smooth amber finish.',
  },
  {
    id: 'ck-one',
    name: 'CK One',
    brand: 'Calvin Klein',
    concentration: 'EDT',
    accords: ['fresh', 'green', 'citrus'],
    occasions: ['Kuliah', 'Santai'],
    color: '#CDD4BC',
    ink: '#556145',
    description: 'A light, green scent with crisp citrus and soft musk.',
  },
  {
    id: 'gucci-guilty',
    name: 'Guilty',
    brand: 'Gucci',
    concentration: 'EDP',
    accords: ['floral', 'spicy'],
    occasions: ['Kerja', 'Malam'],
    color: '#D4B98A',
    ink: '#6D542C',
    description: 'A floral scent with a touch of spice and warm woods.',
  },
];
const scrapedById = new Map(
  scrapedProducts.map(product => [product.id, product]),
);
const knownIds = new Set(existingProducts.map(product => product.id));
for (const product of legacyCatalog) {
  if (!knownIds.has(product.id)) existingProducts.push(product);
}
const existingIds = new Set(existingProducts.map(product => product.id));
const makeNotes = names => names.map(name => ({ id: name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), name }));
const legacyNotes = id => {
  const pyramid = offlinePyramid(id);
  if (pyramid) return Object.fromEntries(Object.entries(pyramid).map(([key, names]) => [key, makeNotes(names)]));
  const notes = offlineNotes(id);
  return notes.length ? { general: makeNotes(notes) } : undefined;
};

export const CATALOG = [
  ...existingProducts.map(product => {
    const scraped = scrapedById.get(product.id);
    return {
      ...product,
      name: scraped?.name || product.name,
      brand: scraped?.brand || product.brand,
      concentration: scraped?.concentration || product.concentration,
      notes: scraped?.notes || legacyNotes(product.id),
      photo: bottlePhotos[product.id] || legacyPhotos[product.id],
    };
  }),
  ...scrapedProducts
    .filter(product => !existingIds.has(product.id))
    .map(product => ({
      ...product,
      photo: bottlePhotos[product.id],
      occasions: [],
      color: '#C3D3C6',
      ink: '#416454',
    })),
];

export const fragranceById = id => CATALOG.find(item => item.id === id);
export const CURATORS = [
  {
    id: 'demo-nara',
    name: 'Nara',
    bio: 'Drawn to bright scents and simple rotations.',
  },
  {
    id: 'demo-ari',
    name: 'Ari',
    bio: 'Exploring woody scents for evenings.',
  },
];
export const EDITORIAL_LISTS = [
  {
    id: 'editorial-campus',
    authorId: 'demo-nara',
    title: 'Campus rotation',
    description:
      'A rotation for days that start in class and end at a coffee shop.',
    visibility: 'public',
    color: '#354E65',
    updatedAt: '2026-09-01T00:00:00.000Z',
    items: [
      {
        fragranceId: 'light-blue',
        note: 'Bright citrus to start the day.',
      },
      {
        fragranceId: 'ck-one',
        note: 'A crisp green scent.',
      },
      {
        fragranceId: 'acqua-di-gio',
        note: 'A fresh scent with a soft musk finish.',
      },
    ],
  },
  {
    id: 'editorial-afterhours',
    authorId: 'demo-ari',
    title: 'After hours',
    description: 'Warm, woody scents for after dark.',
    visibility: 'public',
    color: '#805347',
    updatedAt: '2026-09-01T00:00:00.000Z',
    items: [
      {
        fragranceId: 'santal-33',
        note: 'Dry woods and soft musk.',
      },
      {
        fragranceId: 'oud-wood',
        note: 'Warm woods with a spicy edge.',
      },
      {
        fragranceId: 'black-orchid',
        note: 'Dark florals and warm sweetness.',
      },
    ],
  },
];
