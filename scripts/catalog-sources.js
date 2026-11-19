const OPENFUME = 'https://stanczykwyatt.github.io/openfume/';
const SCENTO = 'https://github.com/Scento-com/perfume-dataset';

// Explicit matches preserve saved IDs and keep similarly named releases apart.
const products = {
  'santal-33': { openfume: 'le-labo-santal-33', scento: 'le-labo-santal-33' },
  'light-blue': {
    scento: 'dolce-gabbana-light-blue-toilette',
    commons: ['Light_blue.jpg', 'Bruce The Deus', 'CC BY-SA 3.0'],
  },
  'chanel-5': {
    notes: {
      url: 'https://www.chanel.com/us/fragrance/p/125530/n5-eau-de-parfum-spray/',
      names: ['Citrus', 'May rose', 'Jasmine', 'Aldehydes', 'Bourbon vanilla'],
    },
  },
  'black-orchid': { scento: 'tom-ford-black-orchid' },
  flowerbomb: {
    openfume: 'loreal-flowerbomb',
    scento: 'viktor-rolf-flowerbomb',
  },
  'acqua-di-gio': {
    openfume: 'loreal-giorgio-armani-acqua-di-gio-pour-homme',
    scento: 'armani-acqua-di-gio-eau-de-toilette',
    displayName: 'Acqua di Giò',
  },
  'la-vie': {
    openfume: 'lancome-la-vie-est-belle',
    scento: 'lancome-la-vie-est-belle-parfum',
  },
  'oud-wood': { scento: 'tom-ford-oud-wood' },
  'ck-one': {
    openfume: 'calvin-klein-ck-one',
    scento: 'calvin-klein-ck-one-toilette',
    commons: ['CK_One.jpg', 'Gonna Fly Now', 'CC BY-SA 2.0'],
  },
  'gucci-guilty': { scento: 'gucci-guilty' },
  'lattafa-khamrah': {
    openfume: 'lattafa-khamrah',
    accords: ['sweet', 'spicy', 'woody'],
  },
  'le-male': {
    openfume: 'jean-paul-gaultier-le-male',
    accords: ['sweet', 'fresh', 'spicy'],
  },
  'cool-water': {
    openfume: 'davidoff-cool-water',
    scento: 'davidoff-cool-water-toilette',
    accords: ['fresh', 'green', 'woody'],
  },
  libre: {
    openfume: 'yves-saint-laurent-ysl-libre',
    scento: 'ysl-libre',
    accords: ['floral', 'citrus', 'sweet'],
  },
  'crystal-noir': {
    openfume: 'versace-crystal-noir',
    accords: ['floral', 'sweet', 'spicy'],
  },
  eternity: {
    openfume: 'calvin-klein-eternity',
    accords: ['floral', 'fresh', 'green'],
  },
  'baccarat-rouge-540': {
    openfume: 'maison-francis-kurkdjian-baccarat-rouge-540',
    scento: 'mfk-baccarat-rouge-540',
    accords: ['sweet', 'woody', 'spicy'],
  },
  angel: {
    openfume: 'mugler-angel',
    scento: 'mugler-angel',
    accords: ['sweet', 'woody'],
  },
};

module.exports = { OPENFUME, SCENTO, products };
