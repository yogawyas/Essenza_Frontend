import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Dimensions, Platform, Image,
} from 'react-native';

const { width } = Dimensions.get('window');

//tes
// ── Brand Colors ──────────────────────────────────────────────
const C = {
  green:       '#163B2C',
  greenLight:  '#1E5040',
  greenMid:    '#1A4535',
  greenDark:   '#0F2B20',
  greenFaint:  '#163B2C18',
  greenBorder: '#163B2C35',
  gold:        '#D4AF37',
  goldLight:   '#F0D060',
  goldDark:    '#A88820',
  goldFaint:   '#D4AF3718',
  goldBorder:  '#D4AF3755',
  goldShine:   '#FFF3A3',
  white:       '#FFFFFF',
  offWhite:    '#F8F6EE',
  cardBg:      '#FDFCF7',
  textMuted:   '#7A8C84',
  textFaint:   '#B0BDB8',
  divider:     '#E8EDE0',
};

// ── Data: Notes / Scent Categories ───────────────────────────
const NOTES = [
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

// ── Data: Molecules per note ──────────────────────────────────
const NOTE_MOLECULES = {
  floral:  [{ name: 'Linalool',       smiles: 'CC(=CCC/C(=C/CO)C)C', role: 'Top note carrier' },
            { name: 'Geraniol',        smiles: 'CC(=CCC/C(=C/CO)C)C', role: 'Rose character' }],
  citrus:  [{ name: 'Limonene',       smiles: 'CC1=CCC(CC1)C(=C)C', role: 'Citrus burst' },
            { name: 'Linalyl Acetate', smiles: 'CC(=O)OC/C=C(/C)CCC=C(C)C', role: 'Bergamot' }],
  woody:   [{ name: 'Cedrol',         smiles: 'CC1(C2CCC3(C)C(CC2)C13)O', role: 'Cedar base' },
            { name: 'α-Santalol',     smiles: 'CC(C)(O)CCC=C1CC=CC1', role: 'Sandalwood' }],
  fresh:   [{ name: 'Calone',         smiles: 'O=C1CCCCO1', role: 'Marine freshness' },
            { name: 'Dihydromyrcenol', smiles: 'CC(C)(O)CCC=C(C)C', role: 'Clean accord' }],
  sweet:   [{ name: 'Vanillin',       smiles: 'O=Cc1ccc(O)c(OC)c1', role: 'Vanilla warmth' },
            { name: 'Ethyl Maltol',   smiles: 'CCc1occc(=O)c1O', role: 'Caramel sugar' }],
  musky:   [{ name: 'Galaxolide',     smiles: 'CC1(C)CC(C)(C)c2cc3c(cc21)OC(C)(C)CO3', role: 'White musk' },
            { name: 'Habanolide',     smiles: 'O=C1CCCCCCC/C=C/CC1', role: 'Skin musk' }],
  herbal:  [{ name: 'Linalool',       smiles: 'CC(=CCC/C(=C/CO)C)C', role: 'Lavender' },
            { name: 'Eucalyptol',     smiles: 'CC12CCC(CC1)(O2)C(C)C', role: 'Fresh herb' }],
  fruity:  [{ name: 'γ-Undecalactone', smiles: 'O=C1CCCCC(CCCC)O1', role: 'Peach note' },
            { name: 'Allyl Amyl Glycolate', smiles: 'O=C(OCC=C)COCCCCC', role: 'Berry' }],
  spicy:   [{ name: 'Eugenol',        smiles: 'COc1cc(CC=C)ccc1O', role: 'Clove spice' },
            { name: 'Cinnamaldehyde', smiles: 'O=C/C=C/c1ccccc1', role: 'Cinnamon' }],
  green:   [{ name: 'Violet Leaf Aldehyde', smiles: 'O=CCCCC=C', role: 'Cut grass' },
            { name: 'Hexenol',        smiles: 'OCC=CCCC', role: 'Green leaves' }],
};

// ── Data: Mock Perfume Recommendations ───────────────────────
const PERFUME_DB = [
  {
    id: 1, name: 'Santal 33', brand: 'Le Labo',
    notes: ['woody', 'musky', 'spicy'],
    price: 'Rp 2.800.000', concentration: 'EDP',
    emoji: '🟤', description: 'Iconic woody-musky signature with cedarwood & cardamom.',
  },
  {
    id: 2, name: 'Chanel No.5', brand: 'Chanel',
    notes: ['floral', 'musky', 'fresh'],
    price: 'Rp 2.200.000', concentration: 'EDP',
    emoji: '⬜', description: 'Timeless powdery floral with ylang-ylang & sandalwood.',
  },
  {
    id: 3, name: 'Light Blue', brand: 'Dolce & Gabbana',
    notes: ['citrus', 'fresh', 'woody'],
    price: 'Rp 1.400.000', concentration: 'EDT',
    emoji: '🔵', description: 'Bright citrus-fresh with apple & cedar.',
  },
  {
    id: 4, name: 'Black Orchid', brand: 'Tom Ford',
    notes: ['sweet', 'woody', 'spicy'],
    price: 'Rp 3.100.000', concentration: 'EDP',
    emoji: '⚫', description: 'Dark and opulent with black truffle & orchid.',
  },
  {
    id: 5, name: 'Flowerbomb', brand: 'Viktor&Rolf',
    notes: ['floral', 'sweet', 'musky'],
    price: 'Rp 1.900.000', concentration: 'EDP',
    emoji: '🌸', description: 'Explosive floral bouquet with patchouli & vanilla.',
  },
  {
    id: 6, name: 'Acqua di Gio', brand: 'Giorgio Armani',
    notes: ['fresh', 'citrus', 'musky'],
    price: 'Rp 1.200.000', concentration: 'EDT',
    emoji: '💧', description: 'Mediterranean aquatic freshness with neroli & musk.',
  },
  {
    id: 7, name: 'La Vie Est Belle', brand: 'Lancôme',
    notes: ['sweet', 'floral', 'fruity'],
    price: 'Rp 1.600.000', concentration: 'EDP',
    emoji: '🟣', description: 'Joyful iris & praline with gourmand sweetness.',
  },
  {
    id: 8, name: 'Oud Wood', brand: 'Tom Ford',
    notes: ['woody', 'spicy', 'musky'],
    price: 'Rp 4.200.000', concentration: 'EDP',
    emoji: '🟫', description: 'Rare oud with rosewood & cardamom warmth.',
  },
  {
    id: 9, name: 'CK One', brand: 'Calvin Klein',
    notes: ['fresh', 'green', 'citrus'],
    price: 'Rp 650.000', concentration: 'EDT',
    emoji: '🍃', description: 'Clean unisex freshness with green tea & musk.',
  },
  {
    id: 10, name: 'Guilty', brand: 'Gucci',
    notes: ['floral', 'fruity', 'spicy'],
    price: 'Rp 1.750.000', concentration: 'EDP',
    emoji: '🔴', description: 'Bold pink pepper & geranium with amber base.',
  },
];

// ── Data: SMILES examples for Chemist mode ───────────────────
const EXAMPLE_SMILES = [
  { name: 'Linalool',         smiles: 'CC(=CCC/C(=C/CO)C)C' },
  { name: 'Vanillin',         smiles: 'O=Cc1ccc(O)c(OC)c1' },
  { name: 'Limonene',         smiles: 'CC1=CCC(CC1)C(=C)C' },
  { name: 'Eugenol',          smiles: 'COc1cc(CC=C)ccc1O' },
  { name: 'Cinnamaldehyde',   smiles: 'O=C/C=C/c1ccccc1' },
];

// ── Mock Logic ────────────────────────────────────────────────
const mockPredictFromSmiles = (smiles) => {
  let hash = 0;
  for (let i = 0; i < smiles.length; i++) {
    hash = ((hash << 5) - hash) + smiles.charCodeAt(i);
    hash |= 0;
  }
  return NOTES.map((note, idx) => {
    const seed = Math.abs(hash * (idx + 1) * 13) % 100;
    return { ...note, confidence: Math.round(seed) / 100 };
  }).sort((a, b) => b.confidence - a.confidence);
};

const recommendPerfumes = (selectedNoteIds) => {
  if (!selectedNoteIds.length) return [];
  return PERFUME_DB
    .map(p => {
      const matches = p.notes.filter(n => selectedNoteIds.includes(n)).length;
      return { ...p, score: matches };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

// ── Shared Components ─────────────────────────────────────────
const GoldButton = ({ onPress, disabled, children, style }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.78}
    style={[styles.goldBtn, disabled && styles.goldBtnDisabled, style]}
  >
    <Text style={[styles.goldBtnText, disabled && styles.goldBtnTextDisabled]}>
      {children}
    </Text>
  </TouchableOpacity>
);

const Header = ({ mode, onModeToggle }) => (
  <View style={styles.header}>
    <View style={styles.headerGoldLine} />
    <View style={styles.headerContent}>
      <View style={styles.headerIconBox}>
        <Text style={styles.headerEmoji}>🧪</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>ESSENZA</Text>
        <Text style={styles.headerSubtitle}>Scent Profile Predictor</Text>
      </View>
      {/* Mode Toggle */}
      <TouchableOpacity style={styles.modeToggle} onPress={onModeToggle} activeOpacity={0.8}>
        <Text style={styles.modeToggleText}>{mode === 'explorer' ? '⚗️ Pro' : '🌸 Easy'}</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.headerBottomShimmer} />
  </View>
);

// ── SCREEN: Mode Selector (Onboarding) ───────────────────────
const ModeSelector = ({ onSelect }) => (
  <View style={styles.onboardingContainer}>
    <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
    <View style={styles.onboardingHeader}>
      <Text style={styles.onboardingEmoji}>🧪</Text>
      <Text style={styles.onboardingTitle}>ESSENZA</Text>
      <Text style={styles.onboardingSubtitle}>Discover your scent identity</Text>
    </View>

    <View style={styles.onboardingCards}>
      {/* Explorer Card */}
      <TouchableOpacity style={styles.modeCard} onPress={() => onSelect('explorer')} activeOpacity={0.85}>
        <View style={styles.modeCardIconBg}>
          <Text style={styles.modeCardIcon}>🌸</Text>
        </View>
        <Text style={styles.modeCardTitle}>Explorer</Text>
        <Text style={styles.modeCardDesc}>
          Pilih aroma favorit kamu dan temukan parfum yang sempurna untukmu.
        </Text>
        <View style={styles.modeCardBadge}>
          <Text style={styles.modeCardBadgeText}>Untuk Semua</Text>
        </View>
        <GoldButton onPress={() => onSelect('explorer')} style={{ marginTop: 16 }}>
          Mulai Eksplorasi →
        </GoldButton>
      </TouchableOpacity>

      {/* Chemist Card */}
      <TouchableOpacity style={[styles.modeCard, styles.modeCardDark]} onPress={() => onSelect('chemist')} activeOpacity={0.85}>
        <View style={[styles.modeCardIconBg, styles.modeCardIconBgDark]}>
          <Text style={styles.modeCardIcon}>⚗️</Text>
        </View>
        <Text style={[styles.modeCardTitle, styles.modeCardTitleLight]}>Chemist</Text>
        <Text style={[styles.modeCardDesc, styles.modeCardDescLight]}>
          Masukkan SMILES string + notes untuk prediksi label aroma senyawa baru.
        </Text>
        <View style={[styles.modeCardBadge, styles.modeCardBadgeDark]}>
          <Text style={[styles.modeCardBadgeText, { color: C.green }]}>Advanced</Text>
        </View>
        <GoldButton onPress={() => onSelect('chemist')} style={{ marginTop: 16 }}>
          Buka Lab →
        </GoldButton>
      </TouchableOpacity>
    </View>
  </View>
);

// ── SCREEN: Explorer Mode ─────────────────────────────────────
const ExplorerScreen = () => {
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [step, setStep]                   = useState('notes'); // 'notes' | 'molecules' | 'perfumes'
  const [isLoading, setIsLoading]         = useState(false);
  const [molecules, setMolecules]         = useState([]);
  const [perfumes, setPerfumes]           = useState([]);

  const toggleNote = (id) => {
    setSelectedNotes(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
    // Reset results when notes change
    setStep('notes');
    setMolecules([]);
    setPerfumes([]);
  };

  const handleDiscover = () => {
    if (!selectedNotes.length) return;
    setIsLoading(true);
    setTimeout(() => {
      // Gather molecules from selected notes
      const mols = selectedNotes.flatMap(id => NOTE_MOLECULES[id] || []);
      setMolecules(mols);
      const recs = recommendPerfumes(selectedNotes);
      setPerfumes(recs);
      setStep('results');
      setIsLoading(false);
    }, 900);
  };

  const handleReset = () => {
    setSelectedNotes([]);
    setStep('notes');
    setMolecules([]);
    setPerfumes([]);
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Intro */}
      <View style={styles.card}>
        <View style={styles.cardAccent} />
        <View style={styles.cardInner}>
          <Text style={styles.cardTitle}>Aroma Apa yang Kamu Suka? 🌿</Text>
          <Text style={styles.cardDesc}>
            Pilih satu atau beberapa notes favoritmu. Kami akan tunjukkan molekul di baliknya dan parfum yang mungkin kamu suka.
          </Text>
        </View>
      </View>

      {/* Notes Selector */}
      <Text style={styles.sectionTitle}>Pilih Notes Favorit</Text>
      <View style={styles.notesGrid}>
        {NOTES.map(note => {
          const active = selectedNotes.includes(note.id);
          return (
            <TouchableOpacity
              key={note.id}
              style={[styles.noteChip, active && styles.noteChipActive]}
              onPress={() => toggleNote(note.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.noteChipEmoji}>{note.emoji}</Text>
              <Text style={[styles.noteChipLabel, active && styles.noteChipLabelActive]}>{note.label}</Text>
              <Text style={[styles.noteChipDesc, active && styles.noteChipDescActive]} numberOfLines={1}>{note.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected count + CTA */}
      {selectedNotes.length > 0 && (
        <View style={styles.ctaRow}>
          <Text style={styles.ctaCount}>{selectedNotes.length} notes dipilih</Text>
          <GoldButton onPress={handleDiscover} disabled={isLoading} style={{ flex: 1 }}>
            {isLoading ? '⏳  Mencari...' : '✨  Discover Parfum'}
          </GoldButton>
          <TouchableOpacity style={styles.clearButton} onPress={handleReset}>
            <Text style={styles.clearButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results: Molecules */}
      {step === 'results' && molecules.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <View style={styles.cardInner}>
            <Text style={styles.cardTitle}>🔬 Molekul di Balik Aromamu</Text>
            <Text style={styles.cardDesc}>Senyawa kimia yang menciptakan notes yang kamu pilih:</Text>
            {molecules.map((mol, i) => (
              <View key={i} style={styles.molRow}>
                <View style={styles.molIconBox}>
                  <Text style={styles.molIconText}>⬡</Text>
                </View>
                <View style={styles.molInfo}>
                  <Text style={styles.molName}>{mol.name}</Text>
                  <Text style={styles.molRole}>{mol.role}</Text>
                  <Text style={styles.molSmiles} numberOfLines={1}>{mol.smiles}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Results: Perfume Recommendations */}
      {step === 'results' && perfumes.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>💎 Parfum yang Mungkin Kamu Suka</Text>
          {perfumes.map((p, i) => (
            <View key={p.id} style={[styles.card, styles.perfumeCard]}>
              <View style={styles.cardAccent} />
              <View style={styles.cardInner}>
                <View style={styles.perfumeHeader}>
                  <View style={styles.perfumeEmojiBadge}>
                    <Text style={styles.perfumeEmoji}>{p.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.perfumeName}>{p.name}</Text>
                    <Text style={styles.perfumeBrand}>{p.brand}</Text>
                  </View>
                  <View style={styles.perfumeRankBadge}>
                    <Text style={styles.perfumeRankText}>#{i + 1}</Text>
                  </View>
                </View>
                <Text style={styles.perfumeDesc}>{p.description}</Text>
                <View style={styles.perfumeFooter}>
                  <View style={styles.perfumeTag}>
                    <Text style={styles.perfumeTagText}>{p.concentration}</Text>
                  </View>
                  {p.notes.filter(n => selectedNotes.includes(n)).map(n => {
                    const note = NOTES.find(x => x.id === n);
                    return (
                      <View key={n} style={styles.perfumeNoteTag}>
                        <Text style={styles.perfumeNoteTagText}>{note?.emoji} {note?.label}</Text>
                      </View>
                    );
                  })}
                  <Text style={styles.perfumePrice}>{p.price}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ── SCREEN: Chemist Mode ──────────────────────────────────────
const ChemistScreen = () => {
  const [smilesInput, setSmilesInput]   = useState('');
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [predictions, setPredictions]   = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const THRESHOLD = 0.5;

  const toggleNote = (id) => {
    setSelectedNotes(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const handlePredict = () => {
    if (!smilesInput.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setPredictions(mockPredictFromSmiles(smilesInput.trim()));
      setIsLoading(false);
    }, 800);
  };

  const handleClear = () => {
    setSmilesInput('');
    setSelectedNotes([]);
    setPredictions(null);
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      {/* Intro */}
      <View style={styles.card}>
        <View style={styles.cardAccent} />
        <View style={styles.cardInner}>
          <Text style={styles.cardTitle}>Analisis Molekul ⚗️</Text>
          <Text style={styles.cardDesc}>
            Masukkan SMILES string dan pilih notes referensi untuk memprediksi label aroma dari senyawa baru menggunakan Random Forest + Morgan Fingerprint.
          </Text>
        </View>
      </View>

      {/* SMILES Input */}
      <View style={styles.card}>
        <View style={styles.cardAccent} />
        <View style={styles.cardInner}>
          <Text style={styles.inputLabel}>SMILES String</Text>
          <TextInput
            style={styles.textInput}
            placeholder="cth: CC(=CCC/C(=C/CO)C)C"
            placeholderTextColor={C.textFaint}
            value={smilesInput}
            onChangeText={setSmilesInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Quick examples */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Contoh Molekul</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            {EXAMPLE_SMILES.map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={styles.exampleChip}
                onPress={() => setSmilesInput(ex.smiles)}
                activeOpacity={0.7}
              >
                <Text style={styles.exampleName}>{ex.name}</Text>
                <Text style={styles.exampleSmiles} numberOfLines={1}>{ex.smiles}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttonRow}>
            <GoldButton
              onPress={handlePredict}
              disabled={!smilesInput.trim() || isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? '⏳  Predicting...' : '🔬  Predict Label'}
            </GoldButton>
            {(smilesInput.length > 0 || selectedNotes.length > 0) && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Notes Reference (Optional) */}
      <Text style={styles.sectionTitle}>Notes Referensi (Opsional)</Text>
      <View style={[styles.notesGrid, { marginBottom: 16 }]}>
        {NOTES.map(note => {
          const active = selectedNotes.includes(note.id);
          return (
            <TouchableOpacity
              key={note.id}
              style={[styles.noteChip, active && styles.noteChipActive]}
              onPress={() => toggleNote(note.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.noteChipEmoji}>{note.emoji}</Text>
              <Text style={[styles.noteChipLabel, active && styles.noteChipLabelActive]}>{note.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Prediction Results */}
      {predictions && (
        <View style={[styles.card, { borderColor: C.goldBorder }]}>
          <View style={styles.cardAccent} />
          <View style={styles.cardInner}>
            <Text style={styles.cardTitle}>Profil Aroma Terdeteksi</Text>
            <Text style={styles.molSmiles} numberOfLines={1}>📝 {smilesInput}</Text>

            <View style={styles.thresholdRow}>
              <View style={styles.thresholdDash} />
              <Text style={styles.thresholdText}>Threshold: {THRESHOLD}</Text>
              <View style={styles.thresholdDash} />
            </View>

            {predictions.map((pred, idx) => {
              const hit = pred.confidence >= THRESHOLD;
              return (
                <View key={idx} style={[styles.predRow, !hit && { opacity: 0.35 }]}>
                  <Text style={styles.predEmoji}>{pred.emoji}</Text>
                  <View style={styles.predInfo}>
                    <View style={styles.predLabelRow}>
                      <Text style={[styles.predLabel, !hit && { color: C.textFaint }]}>{pred.label}</Text>
                      {hit && (
                        <View style={styles.predBadge}>
                          <Text style={styles.predBadgeText}>Predicted</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${pred.confidence * 100}%`, backgroundColor: hit ? C.gold : C.divider }]} />
                    </View>
                  </View>
                  <Text style={[styles.predScore, !hit && { color: C.textFaint }]}>
                    {(pred.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              );
            })}

            <View style={styles.methodBox}>
              <Text style={styles.methodText}>⚡ Random Forest + ONNX Runtime (on-device)</Text>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ── ROOT APP ──────────────────────────────────────────────────
const App = () => {
  const [screen, setScreen] = useState('onboarding'); // 'onboarding' | 'explorer' | 'chemist'

  if (screen === 'onboarding') {
    return <ModeSelector onSelect={(mode) => setScreen(mode)} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Header
        mode={screen}
        onModeToggle={() => setScreen(screen === 'explorer' ? 'chemist' : 'explorer')}
      />
      {screen === 'explorer' ? <ExplorerScreen /> : <ChemistScreen />}

      {/* Back to home */}
      <TouchableOpacity style={styles.homeBtn} onPress={() => setScreen('onboarding')}>
        <Text style={styles.homeBtnText}>⌂</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;

// ── STYLES ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },

  // ── Onboarding ──
  onboardingContainer: {
    flex: 1,
    backgroundColor: C.green,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  onboardingHeader: { alignItems: 'center', marginBottom: 36 },
  onboardingEmoji: { fontSize: 56, marginBottom: 10 },
  onboardingTitle: {
    fontSize: 34, fontWeight: '800', color: C.gold,
    letterSpacing: 5,
    textShadowColor: C.goldShine,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  onboardingSubtitle: {
    fontSize: 13, color: 'rgba(212,175,55,0.65)',
    letterSpacing: 2, textTransform: 'uppercase', marginTop: 6,
  },
  onboardingCards: { gap: 16 },
  modeCard: {
    backgroundColor: C.cardBg, borderRadius: 20, padding: 22,
    borderWidth: 1, borderColor: C.divider,
    shadowColor: C.greenDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },
  modeCardDark: { backgroundColor: C.greenMid, borderColor: C.goldBorder },
  modeCardIconBg: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: C.goldFaint, borderWidth: 1.5,
    borderColor: C.goldBorder, alignItems: 'center',
    justifyContent: 'center', marginBottom: 14,
  },
  modeCardIconBgDark: { backgroundColor: 'rgba(212,175,55,0.12)' },
  modeCardIcon: { fontSize: 28 },
  modeCardTitle: { fontSize: 22, fontWeight: '800', color: C.green, marginBottom: 8 },
  modeCardTitleLight: { color: C.gold },
  modeCardDesc: { fontSize: 13, color: C.textMuted, lineHeight: 20, marginBottom: 10 },
  modeCardDescLight: { color: 'rgba(212,175,55,0.7)' },
  modeCardBadge: {
    alignSelf: 'flex-start', backgroundColor: C.goldFaint,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: C.goldBorder,
  },
  modeCardBadgeDark: { backgroundColor: C.gold },
  modeCardBadgeText: { fontSize: 11, fontWeight: '700', color: C.goldDark },

  // ── Header ──
  header: {
    backgroundColor: C.green,
    shadowColor: C.greenDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  headerGoldLine: { height: 3, backgroundColor: C.gold },
  headerContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 14 : 58,
    paddingBottom: 16, paddingHorizontal: 18,
  },
  headerIconBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: C.greenMid, borderWidth: 1.5,
    borderColor: C.goldBorder, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },
  headerEmoji: { fontSize: 24 },
  headerTitle: {
    fontSize: 22, fontWeight: '800', color: C.gold, letterSpacing: 4,
    textShadowColor: C.goldShine, textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  headerSubtitle: {
    fontSize: 9, color: 'rgba(212,175,55,0.55)',
    letterSpacing: 2, textTransform: 'uppercase', marginTop: 2,
  },
  headerBottomShimmer: { height: 2, backgroundColor: C.greenLight, opacity: 0.5 },
  modeToggle: {
    backgroundColor: C.goldFaint, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 7, borderWidth: 1, borderColor: C.goldBorder,
  },
  modeToggleText: { fontSize: 12, fontWeight: '700', color: C.gold },

  // ── Scroll ──
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18 },

  // ── Card ──
  card: {
    backgroundColor: C.cardBg, borderRadius: 16, marginBottom: 14,
    flexDirection: 'row', overflow: 'hidden',
    borderWidth: 1, borderColor: C.divider,
    shadowColor: C.greenDark, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardAccent: { width: 4, backgroundColor: C.gold },
  cardInner: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.green, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: C.textMuted, lineHeight: 20 },

  // ── Section Title ──
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: C.green,
    marginBottom: 10, letterSpacing: 1.5, textTransform: 'uppercase',
  },

  // ── Notes Grid ──
  notesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14,
  },
  noteChip: {
    width: (width - 32 - 10) / 2,
    backgroundColor: C.cardBg, borderRadius: 14,
    padding: 14, borderWidth: 1.5, borderColor: C.divider,
    shadowColor: C.greenDark, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  noteChipActive: {
    backgroundColor: C.green, borderColor: C.gold,
    shadowColor: C.gold, shadowOpacity: 0.3, elevation: 4,
  },
  noteChipEmoji: { fontSize: 24, marginBottom: 6 },
  noteChipLabel: { fontSize: 15, fontWeight: '700', color: C.green },
  noteChipLabelActive: { color: C.gold },
  noteChipDesc: { fontSize: 11, color: C.textFaint, marginTop: 2 },
  noteChipDescActive: { color: 'rgba(212,175,55,0.65)' },

  // ── CTA Row ──
  ctaRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 16,
  },
  ctaCount: { fontSize: 12, color: C.textMuted, minWidth: 80 },

  // ── Molecule Rows ──
  molRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.divider,
  },
  molIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.goldFaint, borderWidth: 1,
    borderColor: C.goldBorder, alignItems: 'center',
    justifyContent: 'center', marginRight: 12, marginTop: 2,
  },
  molIconText: { fontSize: 18, color: C.gold },
  molInfo: { flex: 1 },
  molName: { fontSize: 14, fontWeight: '700', color: C.green },
  molRole: { fontSize: 12, color: C.gold, fontWeight: '600', marginTop: 2 },
  molSmiles: {
    fontSize: 11, color: C.textFaint, marginTop: 3,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
  },

  // ── Perfume Card ──
  perfumeCard: { borderColor: C.goldBorder },
  perfumeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  perfumeEmojiBadge: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.offWhite, borderWidth: 1,
    borderColor: C.divider, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  perfumeEmoji: { fontSize: 24 },
  perfumeName: { fontSize: 16, fontWeight: '800', color: C.green },
  perfumeBrand: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  perfumeRankBadge: {
    backgroundColor: C.gold, borderRadius: 8,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  perfumeRankText: { fontSize: 12, fontWeight: '800', color: C.green },
  perfumeDesc: { fontSize: 13, color: C.textMuted, lineHeight: 20, marginBottom: 10 },
  perfumeFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  perfumeTag: {
    backgroundColor: C.greenFaint, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.greenBorder,
  },
  perfumeNoteTag: {
    backgroundColor: C.goldFaint, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.goldBorder,
  },
  perfumeNoteTagText: { fontSize: 11, fontWeight: '600', color: C.goldDark },
  perfumePrice: { marginLeft: 'auto', fontSize: 14, fontWeight: '800', color: C.green },

  // ── Input / Chemist ──
  inputLabel: {
    fontSize: 11, fontWeight: '700', color: C.green,
    marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: C.offWhite, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 13, color: C.green,
    borderWidth: 1.5, borderColor: C.greenBorder,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
  },
  buttonRow: { flexDirection: 'row', marginTop: 14, gap: 10 },
  exampleChip: {
    backgroundColor: C.cardBg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    marginRight: 8, marginBottom: 4,
    borderWidth: 1.5, borderColor: C.goldBorder, minWidth: 120,
  },
  exampleName: { fontSize: 13, fontWeight: '700', color: C.gold, marginBottom: 3 },
  exampleSmiles: {
    fontSize: 10, color: C.textFaint,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
  },

  // ── Prediction ──
  thresholdRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  thresholdDash: { flex: 1, height: 1, backgroundColor: C.divider },
  thresholdText: { fontSize: 11, color: C.textFaint, marginHorizontal: 10, fontWeight: '600' },
  predRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  predEmoji: { fontSize: 20, width: 32 },
  predInfo: { flex: 1, marginHorizontal: 10 },
  predLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  predLabel: { fontSize: 14, fontWeight: '600', color: C.green },
  predBadge: {
    borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2,
    marginLeft: 8, backgroundColor: C.goldFaint,
    borderWidth: 1, borderColor: C.goldBorder,
  },
  predBadgeText: { fontSize: 10, fontWeight: '700', color: C.goldDark },
  barBg: { height: 6, backgroundColor: C.divider, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  predScore: { fontSize: 13, fontWeight: '700', color: C.green, width: 40, textAlign: 'right' },
  methodBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.divider },
  methodText: { fontSize: 11, color: C.textFaint, textAlign: 'center' },

  // ── Gold Button ──
  goldBtn: {
    borderRadius: 13, backgroundColor: C.gold,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
    borderTopColor: '#F5E070', borderLeftColor: '#E8C84A',
    borderRightColor: '#C09820', borderBottomColor: '#8A6A00',
    shadowColor: '#8A6A00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55, shadowRadius: 8, elevation: 6,
  },
  goldBtnDisabled: {
    backgroundColor: '#C4A84A', borderTopColor: '#C4A84A',
    borderLeftColor: '#C4A84A', borderRightColor: '#C4A84A',
    borderBottomColor: '#A89030', shadowOpacity: 0, elevation: 0,
  },
  goldBtnText: {
    color: '#1A3828', fontWeight: '800', fontSize: 14, letterSpacing: 0.5,
    textShadowColor: 'rgba(255,245,150,0.5)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  goldBtnTextDisabled: { color: 'rgba(22,59,44,0.4)', textShadowColor: 'transparent' },

  // ── Clear / Home button ──
  clearButton: {
    backgroundColor: C.offWhite, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center',
    borderWidth: 1.5, borderColor: C.greenBorder,
  },
  clearButtonText: { color: C.textMuted, fontWeight: '600', fontSize: 13 },
  homeBtn: {
    position: 'absolute', bottom: 22, right: 20,
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.green, alignItems: 'center',
    justifyContent: 'center', borderWidth: 2, borderColor: C.gold,
    shadowColor: C.greenDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  homeBtnText: { fontSize: 20, color: C.gold },
});
