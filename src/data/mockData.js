export const NOTES = [
  { id: 'floral',  label: 'Floral',  emoji: '🌸', desc: 'Rose, Jasmine, Peony' },
  { id: 'citrus',  label: 'Citrus',  emoji: '🍋', desc: 'Lemon, Bergamot, Orange' },
  { id: 'woody',   label: 'Woody',   emoji: '🪵', desc: 'Sandalwood, Cedar, Oud' },
  { id: 'fresh',   label: 'Fresh',   emoji: '💨', desc: 'Aquatic, Marine, Clean' },
  { id: 'sweet',   label: 'Sweet',   emoji: '🍬', desc: 'Vanilla, Caramel, Sugar' },
  { id: 'musky',   label: 'Musky',   emoji: '🫧', desc: 'White Musk, Amber, Skin' },
  { id: 'herbal',  label: 'Herbal',  emoji: '🌿', desc: 'Lavender, Sage, Mint' },
  { id: 'fruity',  label: 'Fruity',  emoji: '🍑', desc: 'Peach, Berry, Apple' },
  { id: 'spicy',   label: 'Spicy',   emoji: '🌶️', desc: 'Pepper, Cinnamon, Clove' },
  { id: 'green',   label: 'Green',   emoji: '🍃', desc: 'Grass, Leaves, Vetiver' },
];

export const PERFUME_DB = [
  {
    id: 1, name: 'Santal 33', brand: 'Le Labo',
    notes: ['woody', 'musky', 'spicy'],
    price: 'Rp 2.800.000', concentration: 'EDP',
    emoji: '🟤', color: '#8B5E3C',
    description: 'Iconic woody-musky signature with cedarwood & cardamom. A cult classic that defined a generation of fragrance lovers.',
  },
  {
    id: 2, name: 'Chanel No.5', brand: 'Chanel',
    notes: ['floral', 'musky', 'fresh'],
    price: 'Rp 2.200.000', concentration: 'EDP',
    emoji: '⬜', color: '#C9B99A',
    description: "Timeless powdery floral with ylang-ylang & sandalwood. The world's most iconic fragrance since 1921.",
  },
  {
    id: 3, name: 'Light Blue', brand: 'Dolce & Gabbana',
    notes: ['citrus', 'fresh', 'woody'],
    price: 'Rp 1.400.000', concentration: 'EDT',
    emoji: '🔵', color: '#4A90D9',
    description: 'Bright citrus-fresh with apple & cedar. Captures the spirit of the Mediterranean coast.',
  },
  {
    id: 4, name: 'Black Orchid', brand: 'Tom Ford',
    notes: ['sweet', 'woody', 'spicy'],
    price: 'Rp 3.100.000', concentration: 'EDP',
    emoji: '⚫', color: '#2C1654',
    description: 'Dark and opulent with black truffle & orchid. A sumptuous, lush fragrance of dark, sensual nature.',
  },
  {
    id: 5, name: 'Flowerbomb', brand: 'Viktor&Rolf',
    notes: ['floral', 'sweet', 'musky'],
    price: 'Rp 1.900.000', concentration: 'EDP',
    emoji: '🌸', color: '#D4688A',
    description: 'Explosive floral bouquet with patchouli & vanilla. An addictive and feminine floral explosion.',
  },
  {
    id: 6, name: 'Acqua di Gio', brand: 'Giorgio Armani',
    notes: ['fresh', 'citrus', 'musky'],
    price: 'Rp 1.200.000', concentration: 'EDT',
    emoji: '💧', color: '#1B6CA8',
    description: 'Mediterranean aquatic freshness with neroli & musk. The scent of sun, sea, and warm coastal air.',
  },
  {
    id: 7, name: 'La Vie Est Belle', brand: 'Lancôme',
    notes: ['sweet', 'floral', 'fruity'],
    price: 'Rp 1.600.000', concentration: 'EDP',
    emoji: '🟣', color: '#8E44AD',
    description: 'Joyful iris & praline with gourmand sweetness. A declaration of happiness in a bottle.',
  },
  {
    id: 8, name: 'Oud Wood', brand: 'Tom Ford',
    notes: ['woody', 'spicy', 'musky'],
    price: 'Rp 4.200.000', concentration: 'EDP',
    emoji: '🟫', color: '#6D4C2A',
    description: 'Rare oud with rosewood & cardamom warmth. A smoky, exotic blend of rare oud wood.',
  },
  {
    id: 9, name: 'CK One', brand: 'Calvin Klein',
    notes: ['fresh', 'green', 'citrus'],
    price: 'Rp 650.000', concentration: 'EDT',
    emoji: '🍃', color: '#2E7D52',
    description: 'Clean unisex freshness with green tea & musk. The original shared fragrance that broke all the rules.',
  },
  {
    id: 10, name: 'Guilty', brand: 'Gucci',
    notes: ['floral', 'fruity', 'spicy'],
    price: 'Rp 1.750.000', concentration: 'EDP',
    emoji: '🔴', color: '#B03A2E',
    description: 'Bold pink pepper & geranium with amber base. A provocative and free-spirited modern floral.',
  },
];

// Local/affordable dupe alternatives
export const DUPE_DB = {
  1: [
    { id: 'd1', name: 'Sandalwood Noir', brand: 'Zara', price: 'Rp 189.000', similarity: 91, emoji: '🟤' },
    { id: 'd2', name: 'Wood Elixir', brand: 'H&M', price: 'Rp 159.000', similarity: 87, emoji: '🪵' },
    { id: 'd3', name: 'Oud Intense', brand: 'Miniso', price: 'Rp 99.000', similarity: 82, emoji: '🟫' },
  ],
  2: [
    { id: 'd4', name: 'Fleur Blanche', brand: 'Zara', price: 'Rp 209.000', similarity: 89, emoji: '⬜' },
    { id: 'd5', name: 'Coco Musk', brand: 'The Body Shop', price: 'Rp 299.000', similarity: 85, emoji: '🌸' },
    { id: 'd6', name: 'White Floral', brand: 'H&M', price: 'Rp 149.000', similarity: 80, emoji: '🤍' },
  ],
  3: [
    { id: 'd7', name: 'Blue Seduction', brand: 'Zara', price: 'Rp 179.000', similarity: 93, emoji: '🔵' },
    { id: 'd8', name: 'Fresh Citrus', brand: 'Miniso', price: 'Rp 89.000', similarity: 86, emoji: '🍋' },
    { id: 'd9', name: 'Acqua Sport', brand: 'H&M', price: 'Rp 149.000', similarity: 81, emoji: '💧' },
  ],
  4: [
    { id: 'd10', name: 'Dark Rose', brand: 'Zara', price: 'Rp 219.000', similarity: 88, emoji: '⚫' },
    { id: 'd11', name: 'Black Oud', brand: 'Miniso', price: 'Rp 109.000', similarity: 83, emoji: '🖤' },
    { id: 'd12', name: 'Orchid Noir', brand: 'H&M', price: 'Rp 159.000', similarity: 79, emoji: '🟣' },
  ],
  5: [
    { id: 'd13', name: 'Flower Crush', brand: 'Zara', price: 'Rp 199.000', similarity: 92, emoji: '🌸' },
    { id: 'd14', name: 'Sweet Bloom', brand: 'The Body Shop', price: 'Rp 249.000', similarity: 88, emoji: '🌺' },
    { id: 'd15', name: 'Patchouli Rose', brand: 'Miniso', price: 'Rp 99.000', similarity: 82, emoji: '🏵️' },
  ],
  6: [
    { id: 'd16', name: 'Aqua Marine', brand: 'Zara', price: 'Rp 189.000', similarity: 94, emoji: '💧' },
    { id: 'd17', name: 'Ocean Fresh', brand: 'H&M', price: 'Rp 139.000', similarity: 87, emoji: '🌊' },
    { id: 'd18', name: 'Sea Breeze', brand: 'Miniso', price: 'Rp 89.000', similarity: 83, emoji: '💨' },
  ],
  7: [
    { id: 'd19', name: 'Belle Douce', brand: 'Zara', price: 'Rp 199.000', similarity: 90, emoji: '🟣' },
    { id: 'd20', name: 'Iris Praline', brand: 'H&M', price: 'Rp 149.000', similarity: 85, emoji: '🍬' },
    { id: 'd21', name: 'Sweet Iris', brand: 'Miniso', price: 'Rp 99.000', similarity: 80, emoji: '💜' },
  ],
  8: [
    { id: 'd22', name: 'Oud Royal', brand: 'Zara', price: 'Rp 229.000', similarity: 91, emoji: '🟫' },
    { id: 'd23', name: 'Dark Oud', brand: 'Miniso', price: 'Rp 109.000', similarity: 85, emoji: '🪵' },
    { id: 'd24', name: 'Wood Spice', brand: 'H&M', price: 'Rp 149.000', similarity: 80, emoji: '🌰' },
  ],
  9: [
    { id: 'd25', name: 'Clean Unisex', brand: 'Zara', price: 'Rp 169.000', similarity: 92, emoji: '🍃' },
    { id: 'd26', name: 'Green Tea Fresh', brand: 'The Body Shop', price: 'Rp 199.000', similarity: 88, emoji: '🍵' },
    { id: 'd27', name: 'Fresh Aqua', brand: 'Miniso', price: 'Rp 79.000', similarity: 83, emoji: '💚' },
  ],
  10: [
    { id: 'd28', name: 'Guilty Rose', brand: 'Zara', price: 'Rp 199.000', similarity: 89, emoji: '🔴' },
    { id: 'd29', name: 'Pink Pepper', brand: 'H&M', price: 'Rp 149.000', similarity: 84, emoji: '🌹' },
    { id: 'd30', name: 'Amber Floral', brand: 'Miniso', price: 'Rp 89.000', similarity: 79, emoji: '🏵️' },
  ],
};

// Trending dupes this week
export const TRENDING_DUPES = [
  { id: 't1', name: 'Blue Seduction', brand: 'Zara', dupeOf: 'Light Blue', price: 'Rp 179.000', upvotes: 1243, similarity: 93, emoji: '🔵' },
  { id: 't2', name: 'Aqua Marine', brand: 'Zara', dupeOf: 'Acqua di Gio', price: 'Rp 189.000', upvotes: 987, similarity: 94, emoji: '💧' },
  { id: 't3', name: 'Flower Crush', brand: 'Zara', dupeOf: 'Flowerbomb', price: 'Rp 199.000', upvotes: 854, similarity: 92, emoji: '🌸' },
  { id: 't4', name: 'Clean Unisex', brand: 'Zara', dupeOf: 'CK One', price: 'Rp 169.000', upvotes: 712, similarity: 92, emoji: '🍃' },
  { id: 't5', name: 'Oud Royal', brand: 'Zara', dupeOf: 'Oud Wood', price: 'Rp 229.000', upvotes: 634, similarity: 91, emoji: '🟫' },
];

// Mood / Occasion presets — like Spotify mood playlists
export const MOODS = [
  {
    id: 'morning',
    label: 'Morning Commute',
    emoji: '🌅',
    color: '#F0A500',
    desc: 'Fresh & energizing',
    perfumeIds: [3, 6, 9],
  },
  {
    id: 'date',
    label: 'Date Night',
    emoji: '🌹',
    color: '#C0392B',
    desc: 'Sensual & memorable',
    perfumeIds: [1, 4, 5],
  },
  {
    id: 'office',
    label: 'Office Safe',
    emoji: '💼',
    color: '#2C3E50',
    desc: 'Subtle & professional',
    perfumeIds: [2, 9, 3],
  },
  {
    id: 'weekend',
    label: 'Weekend Vibes',
    emoji: '🏄',
    color: '#1B6CA8',
    desc: 'Casual & carefree',
    perfumeIds: [6, 9, 3],
  },
  {
    id: 'cozy',
    label: 'Cozy Night In',
    emoji: '🕯️',
    color: '#6D4C2A',
    desc: 'Warm & comforting',
    perfumeIds: [1, 7, 8],
  },
  {
    id: 'summer',
    label: 'Summer Heat',
    emoji: '☀️',
    color: '#E67E22',
    desc: 'Bright & sun-kissed',
    perfumeIds: [3, 6, 10],
  },
];

// Default Scent Collections (= Playlists)
export const DEFAULT_COLLECTIONS = [
  {
    id: 'c1',
    name: 'My Fresh Picks',
    desc: 'Light, clean, and airy',
    color: '#1B6CA8',
    perfumeIds: [3, 6, 9],
  },
  {
    id: 'c2',
    name: 'Dark & Seductive',
    desc: 'Bold, deep, and mysterious',
    color: '#2C1654',
    perfumeIds: [1, 4, 8],
  },
  {
    id: 'c3',
    name: 'Sweet Florals',
    desc: 'Romantic and feminine',
    color: '#D4688A',
    perfumeIds: [2, 5, 7],
  },
];

// Mock scent history for Scent Wrapped & "Because You Liked"
export const SCENT_HISTORY = [
  { perfumeId: 6, viewedAt: '2025-07-20', rating: 5 },
  { perfumeId: 3, viewedAt: '2025-07-19', rating: 4 },
  { perfumeId: 1, viewedAt: '2025-07-18', rating: 5 },
  { perfumeId: 9, viewedAt: '2025-07-17', rating: 3 },
  { perfumeId: 5, viewedAt: '2025-07-15', rating: 4 },
  { perfumeId: 4, viewedAt: '2025-07-14', rating: 5 },
  { perfumeId: 2, viewedAt: '2025-07-10', rating: 3 },
  { perfumeId: 8, viewedAt: '2025-07-08', rating: 4 },
];

// Scent Wrapped stats (mock — would be computed from history in real app)
export const SCENT_WRAPPED = {
  year: 2025,
  topPerfume: PERFUME_DB[5],       // Acqua di Gio
  totalExplored: 47,
  topNote: 'fresh',
  topNotePercent: 38,
  secondNote: 'woody',
  secondNotePercent: 27,
  dupeSavings: 'Rp 4.200.000',
  totalDupesFound: 12,
  longestStreak: 7,
  personalityTitle: 'The Explorer',
  personalityDesc: 'You love discovering new scents and never stick to just one signature fragrance.',
  months: [
    { month: 'Jan', count: 3 },
    { month: 'Feb', count: 5 },
    { month: 'Mar', count: 4 },
    { month: 'Apr', count: 7 },
    { month: 'May', count: 6 },
    { month: 'Jun', count: 9 },
    { month: 'Jul', count: 13 },
  ],
};
