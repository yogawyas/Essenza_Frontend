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

  // Added from the Scento dataset (descriptions and notes, CC BY 4.0).
  // `openfumePhoto` only borrows the openly licensed bottle photo from Openfume.
  'creed-aventus': {
    scento: 'creed-aventus',
    accords: ['citrus', 'woody', 'fresh'],
    occasions: ['Kerja', 'Santai'],
  },
  'pdm-layton': {
    scento: 'parfums-de-marly-layton',
    accords: ['sweet', 'spicy', 'fresh'],
    occasions: ['Kerja', 'Malam'],
  },
  'dior-jadore': {
    scento: 'dior-jadore',
    openfumePhoto: 'christian-dior-jadore',
    accords: ['floral', 'sweet'],
    occasions: ['Kerja', 'Malam'],
  },
  'black-opium': {
    scento: 'ysl-black-opium',
    accords: ['sweet', 'floral', 'spicy'],
    occasions: ['Malam'],
  },
  'tobacco-vanille': {
    scento: 'tom-ford-tobacco-vanille',
    accords: ['sweet', 'spicy', 'woody'],
    occasions: ['Malam', 'Kerja'],
  },
  'gypsy-water': {
    scento: 'byredo-gypsy-water',
    accords: ['fresh', 'citrus', 'woody'],
    occasions: ['Kuliah', 'Santai'],
  },
  'english-pear-freesia': {
    scento: 'jo-malone-english-pear-and-freesia',
    concentration: 'EDC',
    accords: ['floral', 'fresh'],
    occasions: ['Kuliah', 'Santai'],
  },
  'pdm-delina': {
    scento: 'parfums-de-marly-delina',
    accords: ['floral', 'fresh', 'spicy'],
    occasions: ['Kerja', 'Santai'],
  },
  'prada-paradoxe': {
    scento: 'prada-paradoxe',
    commons: [
      '2023_Woda_perfumowana_Prada_Paradoxe_(1).jpg',
      'Jacek Halicki',
      'CC BY-SA 4.0',
    ],
    accords: ['floral', 'musky', 'sweet'],
    occasions: ['Kerja', 'Santai'],
  },
  'angels-share': {
    scento: 'kilian-angels-share',
    accords: ['sweet', 'woody', 'spicy'],
    occasions: ['Malam'],
  },
  'wood-sage-sea-salt': {
    scento: 'jo-malone-wood-sage-and-sea-salt',
    concentration: 'EDC',
    accords: ['fresh', 'green', 'musky'],
    occasions: ['Kuliah', 'Santai'],
  },
  'vanilla-28': {
    scento: 'kayali-vanilla-28',
    accords: ['sweet', 'musky'],
    occasions: ['Malam', 'Santai'],
  },
  'by-the-fireplace': {
    scento: 'maison-margiela-replica-by-the-fireplace',
    accords: ['woody', 'spicy', 'sweet'],
    occasions: ['Malam', 'Santai'],
  },
  'dylan-blue': {
    scento: 'versace-dylan-blue',
    accords: ['fresh', 'citrus', 'woody'],
    occasions: ['Kuliah', 'Kerja'],
  },
  'born-in-roma-donna': {
    scento: 'valentino-donna-born-in-roma',
    accords: ['floral', 'sweet', 'woody'],
    occasions: ['Malam', 'Santai'],
  },
  idole: {
    scento: 'lancome-idole',
    accords: ['floral', 'citrus', 'musky'],
    occasions: ['Kuliah', 'Kerja'],
  },
  'la-nuit-de-lhomme': {
    scento: 'ysl-la-nuit-de-lhomme',
    accords: ['spicy', 'woody', 'fresh'],
    occasions: ['Malam', 'Kerja'],
  },
  alien: {
    scento: 'mugler-alien',
    accords: ['floral', 'woody', 'sweet'],
    occasions: ['Malam', 'Kerja'],
  },
  'lost-cherry': {
    scento: 'tom-ford-lost-cherry',
    accords: ['sweet', 'floral'],
    occasions: ['Malam'],
  },
  'club-de-nuit-intense': {
    scento: 'armaf-club-de-nuit-intense-man',
    openfumePhoto: 'armaf-club-de-nuit-intense-man-edt-men-new-in-box',
    concentration: 'EDT',
    accords: ['citrus', 'woody', 'fresh'],
    occasions: ['Kerja', 'Malam'],
  },
  '212-vip': {
    scento: 'carolina-herrera-212-vip',
    accords: ['sweet', 'floral', 'citrus'],
    occasions: ['Malam'],
  },
  '9pm-night-out': {
    scento: 'afnan-9pm',
    concentration: 'Extrait',
    accords: ['sweet', 'woody', 'spicy'],
    occasions: ['Malam'],
  },
  'armani-code': {
    scento: 'armani-armani-code',
    accords: ['citrus', 'fresh', 'green'],
    occasions: ['Kerja', 'Kuliah'],
  },
  'gucci-bloom': {
    scento: 'gucci-bloom',
    accords: ['floral'],
    occasions: ['Kerja', 'Santai'],
  },
  'burberry-her': {
    scento: 'burberry-her',
    accords: ['sweet', 'floral', 'musky'],
    occasions: ['Kuliah', 'Santai'],
  },
  'mon-paris': {
    scento: 'ysl-mon-paris',
    openfumePhoto: 'yves-saint-laurent-ysl-mon-paris',
    accords: ['floral', 'sweet', 'citrus'],
    occasions: ['Santai', 'Malam'],
  },
  'lattafa-yara': {
    scento: 'lattafa-yara',
    concentration: 'EDP',
    accords: ['sweet', 'musky', 'floral'],
    occasions: ['Kuliah', 'Santai'],
  },
  scandal: {
    scento: 'jean-paul-gaultier-scandal',
    accords: ['sweet', 'floral', 'citrus'],
    occasions: ['Malam', 'Santai'],
  },
  linterdit: {
    scento: 'givenchy-linterdit',
    openfumePhoto: 'givenchy-linterdit',
    accords: ['floral', 'woody'],
    occasions: ['Kerja', 'Malam'],
  },
  'lazy-sunday-morning': {
    scento: 'maison-margiela-replica-lazy-sunday-morning',
    accords: ['floral', 'musky', 'fresh'],
    occasions: ['Santai', 'Kuliah'],
  },
};

module.exports = { OPENFUME, SCENTO, products };
