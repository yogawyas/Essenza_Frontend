const SYMBOL_RULES = [
  { terms: ['rose'], symbol: '🌹' },
  { terms: ['floral', 'flower', 'jasmine', 'geranium'], symbol: '🌸' },
  { terms: ['citrus', 'lemon', 'lime', 'bergamot', 'grapefruit'], symbol: '🍋' },
  { terms: ['orange', 'mandarin', 'tangerine'], symbol: '🍊' },
  { terms: ['woody', 'wood', 'cedar', 'sandalwood', 'oak'], symbol: '🌲' },
  { terms: ['vanilla'], symbol: '🌼' },
  { terms: ['sweet', 'honey', 'caramel', 'sugar'], symbol: '🍯' },
  { terms: ['powdery'], symbol: '✨' },
  { terms: ['fruity', 'fruit', 'peach', 'apricot', 'plum'], symbol: '🍑' },
  { terms: ['apple', 'pear'], symbol: '🍏' },
  { terms: ['berry', 'strawberry', 'raspberry'], symbol: '🍓' },
  { terms: ['green', 'herbal', 'leafy', 'mint'], symbol: '🌿' },
  { terms: ['spicy', 'pepper', 'cinnamon', 'clove'], symbol: '🌶️' },
  { terms: ['marine', 'ocean', 'aquatic', 'watery'], symbol: '💧' },
  { terms: ['fresh', 'clean', 'cooling'], symbol: '❄️' },
  { terms: ['smoky', 'burnt', 'tobacco', 'leather'], symbol: '🔥' },
  { terms: ['earthy', 'soil', 'mushroom'], symbol: '🍄' },
  { terms: ['musky', 'animal'], symbol: '🐾' },
  { terms: ['nutty', 'almond', 'hazelnut'], symbol: '🌰' },
  { terms: ['coffee'], symbol: '☕' },
  { terms: ['chocolate', 'cocoa'], symbol: '🍫' },
  { terms: ['garlic', 'onion', 'sulfur'], symbol: '🧄' },
];

export function odorSymbol(label) {
  const normalized = String(label ?? '').trim().toLowerCase();
  const match = SYMBOL_RULES.find(rule =>
    rule.terms.some(term => normalized.includes(term)),
  );

  return match?.symbol ?? '⌬';
}
