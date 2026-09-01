import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Platform, Modal, ActivityIndicator,
  Alert, Switch,
} from 'react-native';
import { InferenceService } from './src/services/InferenceService';
import { DatabaseService } from './src/services/DatabaseService';


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
  cream:       '#F3EFE3',
  ink:         '#10281F',
  success:     '#2E7D5B',
};

// ── Data: Scent Mixology Categories ────────────────────────────
const MOLECULE_CATEGORIES = [
  {
    name: '🍬 Sweet / Gourmand',
    items: [
      { name: 'Vanillin', smiles: 'O=Cc1ccc(O)c(OC)c1' },
      { name: 'Coumarin', smiles: 'O=C1OC2=CC=CC=C2C=C1' },
    ]
  },
  {
    name: '🍋 Citrus',
    items: [
      { name: 'Limonene', smiles: 'CC1=CCC(CC1)C(=C)C' },
      { name: 'Citral', smiles: 'CC(=CCCC(=CC=O)C)C' },
    ]
  },
  {
    name: '🌸 Floral',
    items: [
      { name: 'Linalool', smiles: 'CC(=CCCC(C)(C=C)O)C' },
      { name: 'Geraniol', smiles: 'CC(=CCCC(=CCO)C)C' },
    ]
  },
  {
    name: '🪵 Spicy / Woody',
    items: [
      { name: 'Eugenol', smiles: 'COc1cc(CC=C)ccc1O' },
      { name: 'Iso E Super', smiles: 'CC(=C)C1CCC2C1(C)CCCC2(C)C' },
    ]
  },
  {
    name: '🦨 Musk',
    items: [
      { name: 'Galaxolide', smiles: 'CC12CCC3C(C)(C)CC(C)(C)C3C1CCC2' },
    ]
  }
];

// ── Shared Components ─────────────────────────────────────────
const GoldButton = ({ onPress, disabled, children, style }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ disabled: Boolean(disabled) }}
    activeOpacity={0.78}
    style={[styles.goldBtn, disabled && styles.goldBtnDisabled, style]}
  >
    <Text style={[styles.goldBtnText, disabled && styles.goldBtnTextDisabled]}>
      {children}
    </Text>
  </TouchableOpacity>
);

const Header = ({ mode }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <View style={styles.headerIconBox}>
        <Text style={styles.headerMonogram}>E</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>ESSENZA</Text>
        <Text style={styles.headerSubtitle}>
          {mode === 'explorer' ? 'Perfume discovery' : 'Molecular scent analysis'}
        </Text>
      </View>
      <View style={styles.systemBadge}>
        <View style={styles.systemDot} />
        <Text style={styles.systemBadgeText}>HYBRID ML</Text>
      </View>
    </View>
    <View style={styles.headerBottomShimmer} />
  </View>
);

const BottomNav = ({ screen, onSelect }) => {
  const items = [
    { key: 'explorer', icon: '⌕', label: 'Discover' },
    { key: 'onboarding', icon: '◇', label: 'Home' },
    { key: 'chemist', icon: '⌬', label: 'Analyze' },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map(item => {
        const active = screen === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.bottomNavItem, active && styles.bottomNavItemActive]}
            onPress={() => onSelect(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            activeOpacity={0.75}
          >
            <Text style={[styles.bottomNavIcon, active && styles.bottomNavIconActive]}>{item.icon}</Text>
            <Text style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ── SCREEN: Mode Selector (Onboarding) ───────────────────────
const ModeSelector = ({ onSelect }) => (
  <ScrollView
    style={styles.onboardingContainer}
    contentContainerStyle={styles.onboardingContent}
    showsVerticalScrollIndicator={false}
  >
    <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
    <View style={styles.onboardingHeader}>
      <View style={styles.onboardingMark}>
        <Text style={styles.onboardingMarkText}>E</Text>
      </View>
      <View style={styles.eyebrowBadge}>
        <View style={styles.eyebrowDot} />
        <Text style={styles.eyebrowText}>HYBRID MACHINE LEARNING</Text>
      </View>
      <Text style={styles.onboardingTitle}>ESSENZA</Text>
      <Text style={styles.onboardingSubtitle}>Understand scent from molecule to perfume.</Text>
    </View>

    <View style={styles.architectureStrip}>
      <View style={styles.architectureItem}>
        <Text style={styles.architectureValue}>RDKit</Text>
        <Text style={styles.architectureLabel}>Online features</Text>
      </View>
      <Text style={styles.architectureArrow}>→</Text>
      <View style={styles.architectureItem}>
        <Text style={styles.architectureValue}>25 ONNX</Text>
        <Text style={styles.architectureLabel}>Offline models</Text>
      </View>
      <Text style={styles.architectureArrow}>→</Text>
      <View style={styles.architectureItem}>
        <Text style={styles.architectureValue}>Private</Text>
        <Text style={styles.architectureLabel}>Local inference</Text>
      </View>
    </View>

    <View style={styles.onboardingCards}>
      {/* Explorer Card */}
      <TouchableOpacity style={styles.modeCard} onPress={() => onSelect('explorer')} activeOpacity={0.85}>
        <View style={styles.modeCardTopRow}>
          <View style={styles.modeCardIconBg}>
            <Text style={styles.modeCardIcon}>✦</Text>
          </View>
          <View style={styles.modeCardBadge}>
            <Text style={styles.modeCardBadgeText}>OFFLINE DATABASE</Text>
          </View>
        </View>
        <Text style={styles.modeCardTitle}>Explorer</Text>
        <Text style={styles.modeCardDesc}>
          Search perfumes, filter by scent family, and build your personal fragrance lab.
        </Text>
        <GoldButton onPress={() => onSelect('explorer')} style={{ marginTop: 16 }}>
          Discover perfumes  →
        </GoldButton>
      </TouchableOpacity>

      {/* Chemist Card */}
      <TouchableOpacity style={[styles.modeCard, styles.modeCardDark]} onPress={() => onSelect('chemist')} activeOpacity={0.85}>
        <View style={styles.modeCardTopRow}>
          <View style={[styles.modeCardIconBg, styles.modeCardIconBgDark]}>
            <Text style={styles.modeCardIcon}>⌬</Text>
          </View>
          <View style={[styles.modeCardBadge, styles.modeCardBadgeDark]}>
            <Text style={[styles.modeCardBadgeText, { color: C.green }]}>THESIS LAB</Text>
          </View>
        </View>
        <Text style={[styles.modeCardTitle, styles.modeCardTitleLight]}>Molecule Analyzer</Text>
        <Text style={[styles.modeCardDesc, styles.modeCardDescLight]}>
          Convert SMILES into an odor profile using online RDKit features and private on-device ONNX inference.
        </Text>
        <GoldButton onPress={() => onSelect('chemist')} style={{ marginTop: 16 }}>
          Open molecule lab  →
        </GoldButton>
      </TouchableOpacity>
    </View>
    <Text style={styles.onboardingFootnote}>Undergraduate thesis prototype · Essenza 1.0</Text>
  </ScrollView>
);

// ── SCREEN: Explorer Mode (Offline + CRUD) ──────────────────
const ALL_LABELS = [
  'floral','fruity','woody','sweet','citrus','aromatic','musky','fresh',
  'spicy','balsamic','vanilla','powdery','earthy','smoky','tobacco','anisic',
  'aldehydic','rose','green','herbal','mint','caramellic','cocoa','honey','winey',
];

const ExplorerScreen = () => {
  // ── State ─────────────────────────────────────────────────
  const [tab, setTab]                   = useState('search');   // 'search' | 'custom'
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterLabels, setFilterLabels] = useState([]);
  const [perfumeResults, setPerfumeResults] = useState([]);
  const [userPerfumes, setUserPerfumes] = useState([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [dbReady, setDbReady]           = useState(false);

  // CRUD Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);  // null = Create, obj = Edit
  const [formName, setFormName]         = useState('');
  const [formMode, setFormMode]         = useState('simple');  // 'simple'|'advanced'
  const [formAccords, setFormAccords]   = useState({});

  // ── Init DB ────────────────────────────────────────────────
  useEffect(() => {
    DatabaseService.init()
      .then(() => { setDbReady(true); loadUserPerfumes(); })
      .catch(e => console.error('[Explorer] DB init failed:', e));
  }, []);

  const loadUserPerfumes = async () => {
    const items = await DatabaseService.getAllUserPerfumes();
    setUserPerfumes(items);
  };

  // ── Search Parfum Komersial ────────────────────────────────
  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (!dbReady || q.trim().length < 2) { setSearchResults([]); return; }
    const res = await DatabaseService.searchPerfumes(q.trim());
    setSearchResults(res);
  }, [dbReady]);

  // ── Filter by Label ────────────────────────────────────────
  const toggleLabel = (label) => {
    setFilterLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const handleFindByLabel = async () => {
    if (filterLabels.length === 0 || !dbReady) return;
    setIsLoading(true);
    const res = await DatabaseService.getPerfumesByLabels(filterLabels, 0.05, 20);
    setPerfumeResults(res);
    setIsLoading(false);
  };

  // ── CRUD Operations ────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setFormName('');
    setFormMode('simple');
    setFormAccords({});
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setFormName(item.name);
    setFormMode(item.mode);
    setFormAccords({ ...item.accords });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || Object.keys(formAccords).length === 0) {
      Alert.alert('Incomplete', 'Please enter a name and select at least one scent label.');
      return;
    }
    const top = Object.entries(formAccords).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k).join(', ');
    const data = { name: formName.trim(), accords: formAccords, top_accords: top, mode: formMode };
    if (editTarget) {
      await DatabaseService.updateUserPerfume(editTarget.id, data);
    } else {
      await DatabaseService.createUserPerfume(data);
    }
    setModalVisible(false);
    loadUserPerfumes();
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Perfume', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await DatabaseService.deleteUserPerfume(item.id);
        loadUserPerfumes();
      }},
    ]);
  };

  const setLabelScore = (label, val) => {
    if (val <= 0) {
      const next = { ...formAccords };
      delete next[label];
      setFormAccords(next);
    } else {
      setFormAccords(prev => ({ ...prev, [label]: val }));
    }
  };

  // ── Render Helpers ─────────────────────────────────────────
  const renderPerfumeCard = (item, showSimilarity = false) => (
    <TouchableOpacity
      key={item.pid ?? item.id}
      style={styles.explorerCard}
      onPress={item.id !== undefined ? () => openEdit(item) : undefined}
      activeOpacity={0.85}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={styles.perfumeMonogram}>
          <Text style={styles.perfumeMonogramText}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.explorerCardBrand}>{item.brand || 'CUSTOM FORMULA'}</Text>
          <Text style={styles.explorerCardName}>{item.name}</Text>
          <Text style={styles.explorerCardAccords}>{item.top_accords}</Text>
        </View>
        {showSimilarity && item.similarityScore !== undefined && (
          <View style={styles.explorerScoreBadge}>
            <Text style={styles.explorerScoreText}>
              {Math.round(item.similarityScore * 100)}%
            </Text>
          </View>
        )}
        {item.id !== undefined && (
          <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
              <Text style={{ color: C.gold, fontSize: 12 }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
              <Text style={{ color: '#e55', fontSize: 12 }}>Del</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: C.offWhite }}>
      {/* Tab Bar */}
      <View style={styles.explorerTabBar}>
        {['search', 'filter', 'custom'].map(t => (
          <TouchableOpacity key={t} style={[styles.explorerTab, tab===t && styles.explorerTabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.explorerTabText, tab===t && styles.explorerTabTextActive]}>
              {t==='search' ? 'Search' : t==='filter' ? 'Scent filter' : 'My lab'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>

        <View style={styles.explorerHero}>
          <Text style={styles.explorerHeroEyebrow}>YOUR OFFLINE SCENT LIBRARY</Text>
          <Text style={styles.explorerHeroTitle}>Find a fragrance that feels like you.</Text>
          <Text style={styles.explorerHeroDesc}>Search the curated collection or combine scent labels to surface your closest matches.</Text>
        </View>

        {/* ── TAB: Search ────────────────────────────── */}
        {tab === 'search' && (
          <View>
            <View style={styles.searchField}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.explorerSearch}
                placeholder="Search perfume or brand"
                placeholderTextColor={C.textFaint}
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
                accessibilityLabel="Search perfume or brand"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')} style={styles.searchClear}>
                  <Text style={styles.searchClearText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
            {searchResults.length > 0
              ? searchResults.map(p => renderPerfumeCard(p))
              : searchQuery.length >= 2
                ? <Text style={styles.explorerEmpty}>No results for "{searchQuery}"</Text>
                : <View style={styles.explorerEmptyCard}>
                    <Text style={styles.explorerEmptyIcon}>✦</Text>
                    <Text style={styles.explorerEmptyTitle}>Start with a name or brand</Text>
                    <Text style={styles.explorerHint}>Enter at least two characters. Everything here works offline.</Text>
                  </View>
            }
          </View>
        )}

        {/* ── TAB: Filter by Label ───────────────────── */}
        {tab === 'filter' && (
          <View>
            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.explorerSectionTitle}>Build your scent profile</Text>
                <Text style={styles.sectionSubtitle}>Choose one or more families</Text>
              </View>
              <View style={styles.selectionBadge}><Text style={styles.selectionBadgeText}>{filterLabels.length} selected</Text></View>
            </View>
            <View style={styles.labelChipWrap}>
              {ALL_LABELS.map(label => (
                <TouchableOpacity key={label}
                  style={[styles.labelChip, filterLabels.includes(label) && styles.labelChipActive]}
                  onPress={() => toggleLabel(label)}>
                  <Text style={[styles.labelChipText, filterLabels.includes(label) && styles.labelChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <GoldButton
              onPress={handleFindByLabel}
              disabled={filterLabels.length === 0 || isLoading}
              style={{ marginTop: 12 }}
            >
              {isLoading ? 'Searching...' : `Find Perfumes with ${filterLabels.join(', ') || '...'}`}
            </GoldButton>
            {perfumeResults.length > 0 && (
              <>
                <Text style={[styles.explorerSectionTitle, { marginTop: 20 }]}>
                  {perfumeResults.length} Matches Found
                </Text>
                {perfumeResults.map(p => renderPerfumeCard(p, true))}
              </>
            )}
            {perfumeResults.length === 0 && filterLabels.length > 0 && !isLoading && (
              <Text style={styles.explorerEmpty}>No perfumes found. Try fewer labels.</Text>
            )}
          </View>
        )}

        {/* ── TAB: My Lab (CRUD) ────────────────────── */}
        {tab === 'custom' && (
          <View>
            <View style={styles.myLabIntro}>
              <Text style={styles.myLabIntroTitle}>Your personal fragrance lab</Text>
              <Text style={styles.myLabIntroText}>Save custom scent profiles locally and compare them with the offline collection.</Text>
            </View>
            <GoldButton onPress={openCreate} style={{ marginBottom: 16 }}>
              +  Create a custom perfume
            </GoldButton>
            {userPerfumes.length === 0
              ? <Text style={styles.explorerHint}>
                  Your lab is empty. Create your first custom perfume formula above!
                </Text>
              : userPerfumes.map(p => renderPerfumeCard(p))
            }
          </View>
        )}

      </ScrollView>

      {/* ── CRUD Modal ─────────────────────────────── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              {editTarget ? '✏️ Edit Perfume' : '🧪 New Custom Perfume'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Perfume Name"
              placeholderTextColor={C.textFaint}
              value={formName}
              onChangeText={setFormName}
            />

            {/* Mode Toggle */}
            <View style={styles.modeRow}>
              <Text style={styles.modeLabelText}>Simple (tag only)</Text>
              <Switch
                value={formMode === 'advanced'}
                onValueChange={v => setFormMode(v ? 'advanced' : 'simple')}
                thumbColor={C.gold}
                trackColor={{ false: C.divider, true: C.greenLight }}
              />
              <Text style={styles.modeLabelText}>Advanced (%)</Text>
            </View>

            <ScrollView style={{ maxHeight: 280 }}>
              {ALL_LABELS.map(label => {
                const score = formAccords[label] ?? 0;
                if (formMode === 'simple') {
                  return (
                    <TouchableOpacity key={label}
                      style={[styles.modalLabelRow, score > 0 && styles.modalLabelRowActive]}
                      onPress={() => setLabelScore(label, score > 0 ? 0 : 0.8)}>
                      <Text style={styles.modalLabelText}>
                        {score > 0 ? '✅' : '⬜'} {label}
                      </Text>
                    </TouchableOpacity>
                  );
                } else {
                  return (
                    <View key={label} style={styles.modalLabelRow}>
                      <Text style={[styles.modalLabelText, { flex: 1 }]}>{label}</Text>
                      <View style={styles.percentBtns}>
                        {[0, 0.25, 0.5, 0.75, 1.0].map(v => (
                          <TouchableOpacity key={v}
                            style={[styles.percentBtn, score === v && styles.percentBtnActive]}
                            onPress={() => setLabelScore(label, v)}>
                            <Text style={[styles.percentBtnText, score === v && styles.percentBtnTextActive]}>
                              {v === 0 ? '—' : `${v*100}%`}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                }
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: C.textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <GoldButton onPress={handleSave} style={{ flex: 1 }}>
                {editTarget ? 'Update' : 'Save Perfume'}
              </GoldButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


// ── SCREEN: Chemist Mode (Real ML Backend) ───────────────────
const ChemistScreen = () => {
  const [smilesInput, setSmilesInput] = useState('');
  const [predictions, setPredictions]     = useState(null);
  const [moleculeInfo, setMoleculeInfo]   = useState(null);
  const [warningText, setWarningText]     = useState(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [statusText, setStatusText]       = useState('');
  const [errorModal, setErrorModal]       = useState({ visible: false, title: '', reason: '', tip: '' });

  useEffect(() => {
    return () => {
      InferenceService.releaseAll();
    };
  }, []);

  const handlePredict = async () => {
    if (!smilesInput.trim()) return;
    setIsLoading(true);
    setPredictions(null);
    setMoleculeInfo(null);
    setWarningText(null);
    try {
      setStatusText('Connecting to the RDKit fingerprint service...');
      const fpData = await InferenceService.getFingerprint(smilesInput.trim());

      setMoleculeInfo({
        formula:   fpData.molecular_formula,
        weight:    fpData.molecular_weight,
        iupacName: fpData.iupac_name,
      });
      if (fpData.warning) {
        setWarningText(fpData.warning);
      }

      setStatusText('Running 25 XGBoost models securely on-device...');
      const results = await InferenceService.predict(fpData.fingerprint);
      setPredictions(results);
    } catch (e) {
      const msg = e.message || 'An error occurred.';
      if (msg.includes('timed out')) {
        setErrorModal({
          visible: true,
          title: '⏳ Service Is Waking Up',
          reason: msg,
          tip: 'The Hugging Face Space may be starting or waiting in the free queue. Keep the app open, then try once more.',
        });
      } else if (msg.includes('No network')) {
        setErrorModal({
          visible: true,
          title: '📡 No Connection',
          reason: msg,
          tip: 'Check your Wi-Fi or mobile data and try again.',
        });
      } else if (msg.includes('terlalu berat') || msg.includes('MW') || msg.includes('molecular weight')) {
        setErrorModal({
          visible: true,
          title: '⚖️ Compound Not Volatile',
          reason: msg,
          tip: 'Fragrance compounds must be volatile (molecular weight <400 g/mol). Try compounds like Linalool, Limonene, or Vanillin.',
        });
      } else if (msg.includes('tidak ditemukan') || msg.includes('not found') || msg.includes('Invalid SMILES')) {
        setErrorModal({
          visible: true,
          title: '🔍 Compound Not Recognized',
          reason: msg,
          tip: 'Ensure the SMILES is valid. Use the example molecules below as a reference.',
        });
      } else {
        setErrorModal({
          visible: true,
          title: '⚠️ Analysis Failed',
          reason: msg,
          tip: 'Ensure your internet connection is active and try again.',
        });
      }
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  const handleClear = () => {
    setSmilesInput('');
    setPredictions(null);
    setMoleculeInfo(null);
    setWarningText(null);
  };

  const handleSmilesChange = (value) => {
    setSmilesInput(value);
    // Never leave a result on screen after its source molecule has changed.
    if (predictions || moleculeInfo || warningText) {
      setPredictions(null);
      setMoleculeInfo(null);
      setWarningText(null);
    }
  };

  return (
    <>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.labHero}>
          <View style={styles.labHeroGlow} />
          <View style={styles.labHeroEyebrow}>
            <View style={styles.systemDot} />
            <Text style={styles.labHeroEyebrowText}>MOLECULAR SCENT LAB</Text>
          </View>
          <Text style={styles.labHeroTitle}>From structure to scent profile.</Text>
          <Text style={styles.labHeroDesc}>
            RDKit creates the molecular features online. The 25 XGBoost models interpret them privately on this device.
          </Text>
          <View style={styles.pipelineRow}>
            <View style={styles.pipelinePill}><Text style={styles.pipelinePillText}>1 · SMILES</Text></View>
            <Text style={styles.pipelineArrow}>→</Text>
            <View style={styles.pipelinePill}><Text style={styles.pipelinePillText}>2 · RDKit</Text></View>
            <Text style={styles.pipelineArrow}>→</Text>
            <View style={styles.pipelinePill}><Text style={styles.pipelinePillText}>3 · ONNX</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <View style={styles.cardInner}>
            <View style={styles.inputHeadingRow}>
              <View>
                <Text style={styles.inputStep}>STEP 1</Text>
                <Text style={styles.inputTitle}>Enter a molecular structure</Text>
              </View>
              <View style={[styles.inputStateBadge, smilesInput.trim() && styles.inputStateBadgeReady]}>
                <Text style={[styles.inputStateText, smilesInput.trim() && styles.inputStateTextReady]}>
                  {smilesInput.trim() ? 'READY' : 'WAITING'}
                </Text>
              </View>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. O=Cc1ccc(O)c(OC)c1  (Vanillin)"
              placeholderTextColor={C.textFaint}
              value={smilesInput}
              onChangeText={handleSmilesChange}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              accessibilityLabel="SMILES molecular structure"
            />
            <View style={styles.inputMetaRow}>
              <Text style={styles.inputMetaText}>SMILES notation · case-sensitive</Text>
              <Text style={styles.inputMetaText}>{smilesInput.length} characters</Text>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 18, marginBottom: 4 }]}>Quick molecule library</Text>
            <Text style={styles.inputHelper}>Tap a molecule to fill the input, or select several for a prototype mixture demonstration.</Text>
            {MOLECULE_CATEGORIES.map((cat, catIdx) => (
              <View key={catIdx} style={{ marginBottom: 12 }}>
                <Text style={styles.catLabel}>{cat.name}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {cat.items.map((mol, i) => {
                    const currentSmiles = smilesInput.split('.').map(s => s.trim()).filter(Boolean);
                    const isActive = currentSmiles.includes(mol.smiles);
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.exampleChip, isActive && { borderColor: C.gold, backgroundColor: C.goldFaint }]}
                        onPress={() => {
                          let next = [...currentSmiles];
                          if (isActive) {
                            next = next.filter(s => s !== mol.smiles);
                          } else {
                            next.push(mol.smiles);
                          }
                          handleSmilesChange(next.join('.'));
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.exampleName, isActive && { color: C.gold }]}>
                          {isActive ? '✓ ' : ''}{mol.name}
                        </Text>
                        <Text style={styles.exampleSmiles} numberOfLines={1}>{mol.smiles}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))}

            <View style={styles.prototypeNote}>
              <Text style={styles.prototypeNoteIcon}>i</Text>
              <Text style={styles.prototypeNoteText}>
                Mixology is a UI prototype only; it does not model concentration or mixture interactions.
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <GoldButton
                onPress={handlePredict}
                disabled={!smilesInput.trim() || isLoading}
                style={{ flex: 1 }}
              >
                {isLoading ? '⏳  Processing...' : '🔬  Predict Odor Profile'}
              </GoldButton>
              {smilesInput.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {isLoading && (
              <View style={styles.loadingPanel}>
                <View style={styles.loadingIconBox}>
                  <ActivityIndicator size="small" color={C.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.loadingTitle}>Analysis in progress</Text>
                  <Text style={styles.loadingText}>{statusText}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {moleculeInfo && (
          <View style={styles.molMetaCard}>
            <Text style={[styles.sectionTitle, { color: '#15803D', marginBottom: 10 }]}>Molecule Profile 🧬</Text>
            <View style={styles.molMetaRow}>
              <View style={styles.molMetaItem}>
                <Text style={styles.molMetaLabel}>Formula</Text>
                <Text style={styles.molMetaValue}>{moleculeInfo.formula ?? '—'}</Text>
              </View>
              <View style={styles.molMetaItem}>
                <Text style={styles.molMetaLabel}>Mol. Weight</Text>
                <Text style={styles.molMetaValue}>
                  {moleculeInfo.weight != null ? `${Number(moleculeInfo.weight).toFixed(1)} g/mol` : '—'}
                </Text>
              </View>
              <View style={styles.molMetaItem}>
                <Text style={styles.molMetaLabel}>IUPAC</Text>
                <Text style={styles.molMetaValue} numberOfLines={2}>
                  {moleculeInfo.iupacName ?? '—'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {warningText && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningBannerIcon}>⚠️</Text>
            <Text style={styles.warningBannerText}>{warningText}</Text>
          </View>
        )}

        {predictions && predictions.length > 0 && (
          <View style={[styles.card, { borderColor: C.goldBorder }]}>
            <View style={styles.cardAccent} />
            <View style={styles.cardInner}>
              <View style={styles.resultHeadingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultEyebrow}>ANALYSIS COMPLETE</Text>
                  <Text style={styles.resultTitle}>Detected odor profile</Text>
                </View>
                <View style={styles.resultCountBadge}>
                  <Text style={styles.resultCountValue}>{predictions.length}</Text>
                  <Text style={styles.resultCountLabel}>labels</Text>
                </View>
              </View>
              <Text style={styles.molSmiles} numberOfLines={1}>{smilesInput}</Text>

              <View style={styles.thresholdRow}>
                <View style={styles.thresholdDash} />
                <Text style={styles.thresholdText}>{predictions.length} LABELS DETECTED</Text>
                <View style={styles.thresholdDash} />
              </View>

              {predictions.map((pred, idx) => (
                <View key={idx} style={styles.predRow}>
                  <View style={styles.predRank}><Text style={styles.predRankText}>{idx + 1}</Text></View>
                  <View style={styles.predInfo}>
                    <View style={styles.predLabelRow}>
                      <Text style={styles.predLabel}>{pred.label.replace(/\b\w/g, c => c.toUpperCase())}</Text>
                      <View style={styles.predBadge}>
                        <Text style={styles.predBadgeText}>Predicted</Text>
                      </View>
                    </View>
                    <View style={[styles.barBg, { position: 'relative', overflow: 'visible' }]}>
                      <View style={[styles.barFill, { width: `${Math.min(pred.probability * 100, 100)}%`, backgroundColor: C.gold }]} />
                      <View style={[styles.thresholdTick, { left: `${Math.min(pred.threshold * 100, 100)}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.predScore}>
                    {(pred.probability * 100).toFixed(0)}%
                  </Text>
                </View>
              ))}

              <View style={styles.methodBox}>
                <Text style={styles.methodText}>Online: Morgan FP + RDKit descriptors  ·  Offline: 25 ONNX XGBoost classifiers</Text>
              </View>
            </View>
          </View>
        )}

        {predictions && predictions.length === 0 && (
          <View style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: C.textFaint }]} />
            <View style={styles.cardInner}>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🤔</Text>
                <Text style={styles.emptyStateTitle}>No Odor Labels Detected</Text>
                <Text style={styles.emptyStateDesc}>
                  No labels exceeded their detection threshold. Try a known fragrance compound from the examples below.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal animationType="fade" transparent visible={errorModal.visible} onRequestClose={() => setErrorModal(m => ({ ...m, visible: false }))}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.errorModalTitle}>{errorModal.title}</Text>
            <View style={styles.errorReasonBox}>
              <Text style={styles.errorReasonLabel}>System Message</Text>
              <Text style={styles.errorReason}>{errorModal.reason}</Text>
            </View>
            <View style={styles.errorTipBox}>
              <Text style={styles.errorTipLabel}>💡 What to do</Text>
              <Text style={styles.errorTip}>{errorModal.tip}</Text>
            </View>
            <GoldButton onPress={() => setErrorModal(m => ({ ...m, visible: false }))}>
              Got It
            </GoldButton>
          </View>
        </View>
      </Modal>
    </>
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
      <Header mode={screen} />
      {screen === 'explorer' ? <ExplorerScreen /> : <ChemistScreen />}
      <BottomNav screen={screen} onSelect={setScreen} />
    </View>
  );
};

export default App;

// ── STYLES ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18 },

  onboardingContainer: {
    flex: 1,
    backgroundColor: C.green,
  },
  onboardingContent: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  onboardingHeader: { alignItems: 'center', marginBottom: 22 },
  onboardingMark: {
    width: 62, height: 62, borderRadius: 21, backgroundColor: C.gold,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: C.goldShine,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28, shadowRadius: 16, elevation: 8,
  },
  onboardingMarkText: { fontSize: 30, fontWeight: '900', color: C.ink, fontStyle: 'italic' },
  eyebrowBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)', marginBottom: 12,
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.goldLight },
  eyebrowText: { color: C.goldLight, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  onboardingTitle: {
    fontSize: 36, fontWeight: '900', color: C.white,
    letterSpacing: 6,
  },
  onboardingSubtitle: {
    fontSize: 15, color: 'rgba(255,255,255,0.66)',
    lineHeight: 22, marginTop: 6, textAlign: 'center', maxWidth: 300,
  },
  architectureStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.065)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)',
    paddingHorizontal: 12, paddingVertical: 13, marginBottom: 16,
  },
  architectureItem: { flex: 1, alignItems: 'center' },
  architectureValue: { color: C.white, fontSize: 11, fontWeight: '800' },
  architectureLabel: { color: 'rgba(255,255,255,0.48)', fontSize: 8, marginTop: 3 },
  architectureArrow: { color: C.gold, fontSize: 14, marginHorizontal: 2 },
  onboardingCards: { gap: 16 },
  modeCard: {
    backgroundColor: C.cardBg, borderRadius: 20, padding: 22,
    borderWidth: 1, borderColor: C.divider,
    shadowColor: C.greenDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },
  modeCardDark: { backgroundColor: C.greenMid, borderColor: C.goldBorder },
  modeCardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  modeCardIconBg: {
    width: 48, height: 48, borderRadius: 15,
    backgroundColor: C.goldFaint, borderWidth: 1.5,
    borderColor: C.goldBorder, alignItems: 'center',
    justifyContent: 'center',
  },
  modeCardIconBgDark: { backgroundColor: 'rgba(212,175,55,0.12)' },
  modeCardIcon: { fontSize: 24, color: C.goldDark },
  modeCardTitle: { fontSize: 22, fontWeight: '800', color: C.green, marginBottom: 8 },
  modeCardTitleLight: { color: C.gold },
  modeCardDesc: { fontSize: 13, color: C.textMuted, lineHeight: 20, marginBottom: 10 },
  modeCardDescLight: { color: 'rgba(212,175,55,0.7)' },
  modeCardBadge: {
    alignSelf: 'flex-start', backgroundColor: C.goldFaint,
    borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5,
    borderWidth: 1, borderColor: C.goldBorder,
  },
  modeCardBadgeDark: { backgroundColor: C.gold },
  modeCardBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.7, color: C.goldDark },
  onboardingFootnote: { color: 'rgba(255,255,255,0.36)', fontSize: 10, textAlign: 'center', marginTop: 20 },

  header: {
    backgroundColor: C.green,
    shadowColor: C.greenDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
  },
  headerContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 56,
    paddingBottom: 14, paddingHorizontal: 18,
  },
  headerIconBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: C.greenMid, borderWidth: 1.5,
    borderColor: C.goldBorder, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },
  headerMonogram: { fontSize: 21, fontWeight: '900', fontStyle: 'italic', color: C.gold },
  headerTitle: {
    fontSize: 22, fontWeight: '800', color: C.gold, letterSpacing: 4,
    textShadowColor: C.goldShine, textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  headerSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, marginTop: 2 },
  headerBottomShimmer: { height: 1, backgroundColor: C.gold, opacity: 0.38 },
  systemBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  systemDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#68D391' },
  systemBadgeText: { color: C.goldLight, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },

  bottomNav: {
    flexDirection: 'row', backgroundColor: C.white,
    paddingHorizontal: 18, paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 10 : 24,
    borderTopWidth: 1, borderTopColor: C.divider,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 12,
  },
  bottomNavItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 6,
  },
  bottomNavItemActive: { backgroundColor: C.greenFaint },
  bottomNavIcon: { fontSize: 19, color: C.textFaint, lineHeight: 21 },
  bottomNavIconActive: { color: C.green },
  bottomNavLabel: { fontSize: 9, fontWeight: '700', color: C.textFaint, marginTop: 2 },
  bottomNavLabelActive: { color: C.green },

  labHero: {
    backgroundColor: C.green, borderRadius: 22, padding: 20,
    marginBottom: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: C.greenLight,
  },
  labHeroGlow: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: C.gold, opacity: 0.08, right: -70, top: -90,
  },
  labHeroEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  labHeroEyebrowText: { color: C.goldLight, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  labHeroTitle: { color: C.white, fontSize: 23, lineHeight: 29, fontWeight: '800', maxWidth: 290 },
  labHeroDesc: { color: 'rgba(255,255,255,0.62)', fontSize: 12, lineHeight: 18, marginTop: 9 },
  pipelineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  pipelinePill: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  pipelinePillText: { color: C.white, fontSize: 9, fontWeight: '700' },
  pipelineArrow: { color: C.gold, fontSize: 12, marginHorizontal: 5 },

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

  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: C.green,
    marginBottom: 10, letterSpacing: 1.5, textTransform: 'uppercase',
  },

  inputLabel: {
    fontSize: 11, fontWeight: '700', color: C.green,
    marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase',
  },
  inputHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  inputStep: { fontSize: 9, fontWeight: '800', color: C.goldDark, letterSpacing: 1.3, marginBottom: 4 },
  inputTitle: { fontSize: 17, fontWeight: '800', color: C.ink },
  inputStateBadge: { backgroundColor: C.offWhite, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 },
  inputStateBadgeReady: { backgroundColor: '#E8F5EE' },
  inputStateText: { color: C.textFaint, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  inputStateTextReady: { color: C.success },
  catLabel: {
    fontSize: 12, fontWeight: '700', color: C.textMuted,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: C.offWhite, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 13, color: C.green, minHeight: 72, textAlignVertical: 'top',
    borderWidth: 1.5, borderColor: C.greenBorder,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
  },
  inputMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  inputMetaText: { fontSize: 9, color: C.textFaint },
  inputHelper: { fontSize: 11, color: C.textMuted, lineHeight: 16, marginBottom: 12 },
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
  prototypeNote: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F3F4F6',
    borderRadius: 11, padding: 11, marginTop: 2,
  },
  prototypeNoteIcon: {
    width: 18, height: 18, borderRadius: 9, textAlign: 'center', lineHeight: 18,
    backgroundColor: C.green, color: C.white, fontSize: 10, fontWeight: '800', marginRight: 9,
  },
  prototypeNoteText: { flex: 1, fontSize: 10, lineHeight: 15, color: C.textMuted },

  loadingPanel: {
    flexDirection: 'row', alignItems: 'center', marginTop: 16,
    backgroundColor: C.goldFaint, borderRadius: 13, padding: 12,
    borderWidth: 1, borderColor: C.goldBorder,
  },
  loadingIconBox: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: C.white,
    alignItems: 'center', justifyContent: 'center', marginRight: 11,
  },
  loadingTitle: { fontSize: 12, fontWeight: '800', color: C.green, marginBottom: 2 },
  loadingText: { fontSize: 10, color: C.textMuted, lineHeight: 15 },

  resultHeadingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  resultEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: C.success, marginBottom: 4 },
  resultTitle: { fontSize: 19, fontWeight: '800', color: C.ink },
  resultCountBadge: {
    width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.green, borderWidth: 1, borderColor: C.goldBorder,
  },
  resultCountValue: { color: C.goldLight, fontSize: 18, fontWeight: '900', lineHeight: 21 },
  resultCountLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 8, textTransform: 'uppercase' },
  molSmiles: {
    backgroundColor: C.offWhite, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: 10, color: C.textMuted,
  },
  thresholdRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  thresholdDash: { flex: 1, height: 1, backgroundColor: C.divider },
  thresholdText: { fontSize: 11, color: C.textFaint, marginHorizontal: 10, fontWeight: '600' },
  predRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  predRank: {
    width: 28, height: 28, borderRadius: 10, backgroundColor: C.greenFaint,
    alignItems: 'center', justifyContent: 'center',
  },
  predRankText: { fontSize: 10, fontWeight: '800', color: C.green },
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
  barFill: { height: '100%', borderRadius: 3, position: 'absolute', left: 0 },
  thresholdTick: { width: 2, height: '100%', backgroundColor: '#D4AF37', position: 'absolute' },
  predScore: { fontSize: 13, fontWeight: '700', color: C.green, width: 40, textAlign: 'right' },
  methodBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.divider },
  methodText: { fontSize: 11, color: C.textFaint, textAlign: 'center' },

  molMetaCard: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#DCFCE7' },
  molMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  molMetaItem: { flex: 1, minWidth: 80 },
  molMetaLabel: { fontSize: 10, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginBottom: 2 },
  molMetaValue: { fontSize: 13, color: '#14532D', fontWeight: '500' },

  warningBanner: { flexDirection: 'row', backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A', alignItems: 'center' },
  warningBannerIcon: { fontSize: 20, marginRight: 10 },
  warningBannerText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },

  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyStateEmoji: { fontSize: 40, marginBottom: 10 },
  emptyStateTitle: { fontSize: 16, fontWeight: '700', color: C.green, marginBottom: 6 },
  emptyStateDesc: { fontSize: 13, color: C.textMuted, textAlign: 'center', paddingHorizontal: 20 },

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

  explorerTabBar: {
    flexDirection: 'row', backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.divider,
    paddingHorizontal: 14, paddingVertical: 9, gap: 6,
  },
  explorerTab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 11 },
  explorerTabActive: { backgroundColor: C.greenFaint },
  explorerTabText: { fontSize: 13, fontWeight: '600', color: C.textFaint },
  explorerTabTextActive: { color: C.green },
  explorerHero: {
    backgroundColor: C.green, borderRadius: 20, padding: 19, marginBottom: 16,
    borderWidth: 1, borderColor: C.greenLight,
  },
  explorerHeroEyebrow: { color: C.goldLight, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  explorerHeroTitle: { color: C.white, fontSize: 22, lineHeight: 28, fontWeight: '800', maxWidth: 300 },
  explorerHeroDesc: { color: 'rgba(255,255,255,0.58)', fontSize: 11, lineHeight: 17, marginTop: 8 },
  searchField: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.white,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.divider,
    marginBottom: 16, paddingHorizontal: 13,
  },
  searchIcon: { color: C.green, fontSize: 21, marginRight: 8 },
  explorerSearch: { flex: 1, paddingVertical: 14, fontSize: 14, color: C.green },
  searchClear: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: C.offWhite },
  searchClearText: { color: C.textMuted, fontSize: 20, lineHeight: 22 },
  explorerHint: { fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 5, paddingHorizontal: 20, lineHeight: 18 },
  explorerEmpty: { fontSize: 14, color: C.textMuted, textAlign: 'center', marginTop: 40, fontStyle: 'italic' },
  explorerEmptyCard: { alignItems: 'center', backgroundColor: C.white, borderRadius: 18, paddingVertical: 28, paddingHorizontal: 18, borderWidth: 1, borderColor: C.divider },
  explorerEmptyIcon: { fontSize: 26, color: C.gold, marginBottom: 9 },
  explorerEmptyTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  explorerCard: { backgroundColor: C.white, borderRadius: 17, padding: 15, marginBottom: 11, borderWidth: 1, borderColor: C.divider, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  perfumeMonogram: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.greenFaint, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  perfumeMonogramText: { color: C.green, fontSize: 17, fontWeight: '900' },
  explorerCardBrand: { fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  explorerCardName: { fontSize: 16, fontWeight: '700', color: C.green, marginBottom: 6 },
  explorerCardAccords: { fontSize: 12, color: C.goldDark, fontWeight: '600' },
  explorerScoreBadge: { backgroundColor: C.goldFaint, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: C.goldBorder },
  explorerScoreText: { fontSize: 12, fontWeight: '700', color: C.goldDark },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  explorerSectionTitle: { fontSize: 17, fontWeight: '800', color: C.ink },
  sectionSubtitle: { fontSize: 11, color: C.textMuted, marginTop: 3 },
  selectionBadge: { backgroundColor: C.goldFaint, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 },
  selectionBadgeText: { fontSize: 9, color: C.goldDark, fontWeight: '800' },
  labelChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  labelChip: { backgroundColor: C.white, borderWidth: 1, borderColor: C.divider, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  labelChipActive: { backgroundColor: C.green, borderColor: C.greenDark },
  labelChipText: { fontSize: 13, color: C.textMuted },
  labelChipTextActive: { color: C.gold, fontWeight: '600' },
  editBtn: { padding: 6, backgroundColor: C.goldFaint, borderRadius: 6 },
  deleteBtn: { padding: 6, backgroundColor: '#fee2e2', borderRadius: 6 },
  myLabIntro: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.divider },
  myLabIntroTitle: { fontSize: 16, fontWeight: '800', color: C.ink, marginBottom: 5 },
  myLabIntroText: { fontSize: 11, lineHeight: 17, color: C.textMuted },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,43,32,0.6)', justifyContent: 'flex-end' },
  modalView: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
  modalSheet: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.green, marginBottom: 20 },
  modalInput: { backgroundColor: C.offWhite, borderWidth: 1, borderColor: C.divider, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.green, marginBottom: 16 },
  modeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.offWhite, padding: 12, borderRadius: 12, marginBottom: 16 },
  modeLabelText: { fontSize: 13, fontWeight: '600', color: C.green },
  modalLabelRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.divider },
  modalLabelRowActive: { backgroundColor: C.greenFaint },
  modalLabelText: { fontSize: 15, color: C.green },
  percentBtns: { flexDirection: 'row', gap: 4 },
  percentBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: C.offWhite, borderWidth: 1, borderColor: C.divider },
  percentBtnActive: { backgroundColor: C.gold, borderColor: C.goldDark },
  percentBtnText: { fontSize: 11, color: C.textMuted },
  percentBtnTextActive: { color: '#163B2C', fontWeight: '700' },
  modalActions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  modalCancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: C.offWhite, borderWidth: 1, borderColor: C.divider },

  errorModalTitle: { fontSize: 20, fontWeight: '800', color: '#B91C1C', marginBottom: 12 },
  errorReasonBox: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#FCA5A5' },
  errorReasonLabel: { fontSize: 11, color: '#991B1B', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  errorReason: { fontSize: 14, color: '#7F1D1D' },
  errorTipBox: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#86EFAC' },
  errorTipLabel: { fontSize: 11, color: '#166534', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  errorTip: { fontSize: 14, color: '#14532D', lineHeight: 20 },
});
