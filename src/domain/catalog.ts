import { Fragrance, Scentlist } from './models';

// Inherited prototype metadata; deliberately not a verified commercial catalog.
export const CATALOG: Fragrance[] = [
  {
    id: 'santal-33',
    name: 'Santal 33',
    brand: 'Le Labo',
    concentration: 'EDP',
    accords: ['woody', 'musky', 'spicy'],
    occasions: ['Kerja', 'Malam'],
    color: '#C9B89B',
    ink: '#514533',
    description:
      'Karakter woody dan musky dengan sentuhan spicy. Jelajahi profil ini sebagai referensi awal.',
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
      'Arah aroma citrus-fresh dengan nuansa woody. Pilihan untuk mengeksplorasi karakter yang cerah.',
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
      'Profil floral dengan sisi musky. Catat kesanmu sendiri setelah mencobanya.',
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
    description:
      'Arah sweet, woody, dan spicy untuk eksplorasi karakter yang lebih hangat.',
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
    description:
      'Karakter floral-sweet dengan nuansa musky. Jadikan sebagai awal perjalanan aroma floralmu.',
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
      'Profil fresh-citrus dengan sentuhan musky. Bandingkan dengan pengalaman pemakaianmu.',
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
    description:
      'Eksplorasi sweet dan floral dalam satu profil. Preferensi setiap pemakai bisa berbeda.',
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
    description:
      'Arah woody-spicy dengan nuansa musky. Tambahkan catatan setelah mencoba sampelnya.',
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
    description:
      'Profil fresh, green, dan citrus. Referensi untuk mengeksplorasi karakter yang ringan.',
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
    description:
      'Pertemuan karakter floral dan spicy. Simpan jika kamu tertarik mencoba arah aroma ini.',
  },
];

export const fragranceById = (id: string) =>
  CATALOG.find(item => item.id === id);
export const CURATORS = [
  {
    id: 'demo-nara',
    name: 'Nara',
    bio: 'Contoh kurator · suka aroma cerah dan rotasi sederhana.',
  },
  {
    id: 'demo-ari',
    name: 'Ari',
    bio: 'Contoh kurator · menjelajahi woody dan parfum malam.',
  },
];

export const EDITORIAL_LISTS: Scentlist[] = [
  {
    id: 'editorial-campus',
    authorId: 'demo-nara',
    title: 'Campus rotation',
    description:
      'Referensi untuk hari yang dimulai di kelas dan berakhir di kedai kopi. Konten demo editorial.',
    visibility: 'public',
    color: '#354E65',
    updatedAt: '2026-09-01T00:00:00.000Z',
    items: [
      { fragranceId: 'light-blue', note: 'Arah citrus untuk membuka hari.' },
      {
        fragranceId: 'ck-one',
        note: 'Pilihan green-fresh untuk dieksplorasi.',
      },
      {
        fragranceId: 'acqua-di-gio',
        note: 'Alternatif fresh dengan sisi musky.',
      },
    ],
  },
  {
    id: 'editorial-afterhours',
    authorId: 'demo-ari',
    title: 'After hours',
    description:
      'Woody, hangat, dan sedikit misterius. Daftar contoh untuk inspirasi scentlist-mu.',
    visibility: 'public',
    color: '#805347',
    updatedAt: '2026-09-01T00:00:00.000Z',
    items: [
      { fragranceId: 'santal-33', note: 'Mulai dari karakter woody-musky.' },
      { fragranceId: 'oud-wood', note: 'Eksplorasi sisi spicy.' },
      {
        fragranceId: 'black-orchid',
        note: 'Coba arah sweet yang lebih hangat.',
      },
    ],
  },
];
