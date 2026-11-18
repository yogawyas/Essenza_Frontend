export const bottlePhotos = {
  'santal-33': require('../../assets/fragrance/santal-33.webp'),
  'black-orchid': require('../../assets/fragrance/black-orchid.webp'),
  'dolce-garden': require('../../assets/fragrance/dolce-garden.webp'),
  'chanel-5': require('../../assets/fragrance/chanel-5.jpg'),
  'ck-one': require('../../assets/fragrance/ck-one.jpg'),
  flowerbomb: {
    uri: 'https://us.viktor-rolf.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-vr-master-catalog/default/dw52a4b375/FB%20EDP%202024/01_vr_frag_fbb_edp_perfect_pdp_premium_packshot_100ml_1x1.webp?q=70&sfrm=jpg&sh=430&sm=cut&sw=430',
  },
  'la-vie': {
    uri: 'https://www.lancome-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lancome-us-master-catalog/default/dw4ddcca7c/pdp/100606/ALT0-3605532612768-PACKSHOT.webp?q=70&sfrm=jpg&sh=430&sm=cut&sw=430',
  },
  'oud-wood': {
    uri: 'https://www.tomfordbeauty.com/cdn/shop/files/tf_sku_T1XF01_2000x2000_0.png?v=1792675585&width=480',
  },
  'gucci-guilty': {
    uri: 'https://media.gucci.com/style/DarkGray_Center_0_0_490x490/1545325204/563241_99999_0099_001_100_0000_Light-gucci-guilty-pour-femme-90ml-eau-de-parfum.jpg',
  },
  'acqua-di-gio': require('../../assets/fragrance/acqua-di-gio.jpg'),
  'light-blue': {
    uri: 'https://www.sephora.com/productimages/sku/s2863249-main-zoom.jpg?imwidth=490',
  },
  'acqua-di-gio-parfum': {
    uri: 'https://www.giorgioarmanibeauty-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-gab-master-catalog/default/dw945b2892/products/2025/A2608%20RESTAGE/3614273954167_01.jpg?q=85&sfrm=jpg&sh=430&sm=cut&sw=430',
  },
};

export const bottlePhotoCredits = {
  'ck-one': {
    author: 'Gonna Fly Now',
    source: 'https://commons.wikimedia.org/wiki/File:CK_One.jpg',
  },
  'acqua-di-gio': {
    author: 'Gonna Fly Now',
    source: 'https://commons.wikimedia.org/wiki/File:Acqua_di_Gio.jpg',
  },
};

const fragranceProfiles = {
  'santal-33': {
    query: 'Le Labo Santal 33',
    house: 'Le Labo',
    notes: [
      'Cardamom',
      'Iris',
      'Violet',
      'Australian Sandalwood',
      'Cedarwood',
      'Leather',
      'Musk',
    ],
  },
  'acqua-di-gio-parfum': {
    query: 'Giorgio Armani Acqua di Giò Parfum',
    house: 'Armani',
    notes: ['Bergamot', 'Rosemary', 'Incense', 'Patchouli'],
  },
  'acqua-di-gio': {
    query: 'Giorgio Armani Acqua di Giò Eau de Toilette',
    house: 'Armani',
    notes: [
      'Bergamot',
      'Neroli',
      'Green Tangerine',
      'Aquatic Notes',
      'Rosemary',
      'Persimmon',
      'Patchouli',
    ],
  },
  'black-orchid': {
    query: 'Tom Ford Black Orchid Eau de Parfum',
    house: 'Tom Ford',
    notes: [
      'Black Truffle',
      'Ylang Ylang',
      'Black Orchid',
      'Black Plum',
      'Rum Absolute',
      'Patchouli',
      'Bergamot',
      'Bitter Orange',
    ],
  },
  'dolce-garden': {
    query: 'Dolce & Gabbana Dolce Garden',
    house: 'Dolce & Gabbana',
    pyramid: {
      top: ['Mandarin', 'Magnolia Accord', 'Neroli'],
      heart: ['Frangipani Accord', 'Coconut', 'Ylang Ylang'],
      base: ['Vanilla Absolute', 'Almond Milk Accord', 'Sandalwood'],
    },
  },
  'light-blue': {
    query: 'Dolce & Gabbana Light Blue Eau de Toilette',
    house: 'Dolce & Gabbana',
    pyramid: {
      top: ['Sicilian Lemon'],
      heart: ['Granny Smith Apple'],
      base: ['Cedarwood'],
    },
  },
  flowerbomb: {
    query: 'Viktor & Rolf Flowerbomb Eau de Parfum',
    house: 'Viktor & Rolf',
    notes: [
      'Peony',
      'Centifolia Rose',
      'Jasmine',
      'Orchid',
      'Freesia',
      'Amber',
      'Patchouli',
      'Vanilla',
    ],
  },
  'la-vie': {
    query: 'Lancôme La Vie Est Belle Eau de Parfum',
    house: 'Lancôme',
    notes: ['Iris', 'Patchouli', 'Vanilla', 'Spun Sugar'],
  },
  'oud-wood': {
    query: 'Tom Ford Oud Wood Eau de Parfum',
    house: 'Tom Ford',
    notes: [
      'Rosewood',
      'Cardamom',
      'Oud',
      'Sandalwood',
      'Vetiver',
      'Tonka Bean',
      'Amber',
    ],
  },
  'ck-one': {
    query: 'Calvin Klein CK One Eau de Toilette',
    house: 'Calvin Klein',
    pyramid: {
      top: ['Bergamot', 'Cardamom', 'Pineapple', 'Papaya'],
      heart: ['Jasmine', 'Violet', 'Rose', 'Nutmeg'],
      base: ['Musk', 'Amber'],
    },
  },
  'chanel-5': {
    query: 'Chanel N°5 Eau de Parfum',
    house: 'Chanel',
    notes: ['Citrus', 'Aldehydes', 'May Rose', 'Jasmine', 'Vanilla'],
  },
  'gucci-guilty': {
    query: 'Gucci Guilty Pour Femme Eau de Parfum',
    house: 'Gucci',
    pyramid: {
      top: ['Mandora', 'Bergamot', 'Pink Pepper'],
      heart: ['Lilac', 'Rose', 'Violet', 'Geranium'],
      base: ['Patchouli', 'Amber'],
    },
  },
};

const concentrations = {
  EDT: 'eau de toilette',
  EDP: 'eau de parfum',
  Parfum: 'parfum',
};
const cache = new Map();
const normalize = name =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]/g, '');

function sameVariantName(name, fragrance) {
  const variant = normalize(concentrations[fragrance.concentration]);
  const identity = normalize(fragrance.name);
  return [identity, identity + variant].includes(normalize(name));
}

export function offlineNotes(id) {
  return fragranceProfiles[id]?.notes ?? [];
}

export function offlinePyramid(id) {
  return fragranceProfiles[id]?.pyramid ?? null;
}

export function loadNotePyramid(fragrance) {
  const profile = fragranceProfiles[fragrance.id];
  if (!profile || !concentrations[fragrance.concentration]) {
    return Promise.resolve(null);
  }
  if (cache.has(fragrance.id)) {
    return cache.get(fragrance.id);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const promise = fetch(
    'https://www.scento.com/api/perfume/v1/perfumes/' +
      encodeURIComponent(profile.query),
    { signal: controller.signal },
  )
    .then(response => (response.ok ? response.json() : null))
    .then(data => {
      const detail = data?.detail;
      if (
        typeof detail?.name !== 'string' ||
        typeof detail.house !== 'string' ||
        typeof detail.concentration !== 'string' ||
        normalize(detail.house).replace(/^giorgio/, '') !==
          normalize(profile.house) ||
        !sameVariantName(detail.name, fragrance) ||
        normalize(detail.concentration) !==
          normalize(concentrations[fragrance.concentration])
      ) {
        return null;
      }
      const pyramid = Object.fromEntries(
        ['top', 'heart', 'base'].map(tier => [
          tier,
          Array.isArray(detail.pyramid?.[tier])
            ? detail.pyramid[tier].filter(
                note => typeof note === 'string' && note.trim(),
              )
            : [],
        ]),
      );
      return Object.values(pyramid).some(notes => notes.length > 0)
        ? pyramid
        : null;
    })
    .catch(() => {
      return null;
    })
    .then(pyramid => {
      if (!pyramid) cache.delete(fragrance.id);
      return pyramid;
    })
    .finally(() => clearTimeout(timeout));
  cache.set(fragrance.id, promise);
  return promise;
}
