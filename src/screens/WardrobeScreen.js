import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { C } from '../theme/colors';
import { Header } from '../components/Header';
import { PERFUME_DB, NOTES } from '../data/mockData';

const { width } = Dimensions.get('window');
const TABS = [
  { id: 'have', label: '💎 Have', subtitle: 'Koleksi sekarang' },
  { id: 'had',  label: '🕰️ Had',  subtitle: 'Pernah punya' },
  { id: 'want', label: '🌟 Want', subtitle: 'Wishlist' },
];

// --- Mock: seed a few initial items so wardrobe isn't fully empty ---
const INITIAL_HAVE = [PERFUME_DB[1], PERFUME_DB[4]];   // Chanel No.5, Flowerbomb
const INITIAL_WANT = [PERFUME_DB[0], PERFUME_DB[7]];   // Santal 33, Oud Wood

// --- Grid Card ---
const WardrobeCard = ({ perfume, onRemove }) => (
  <View style={styles.card}>
    <View style={[styles.cardVisual, { backgroundColor: (perfume.color ?? C.green) + '22' }]}>
      <Text style={styles.cardEmoji}>{perfume.emoji}</Text>
    </View>
    <Text style={styles.cardBrand} numberOfLines={1}>{perfume.brand}</Text>
    <Text style={styles.cardName} numberOfLines={1}>{perfume.name}</Text>
    <Text style={styles.cardConc}>{perfume.concentration}</Text>
    <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
      <Text style={styles.removeBtnText}>✕</Text>
    </TouchableOpacity>
  </View>
);

// --- Empty state per tab ---
const EmptyState = ({ tabId }) => {
  const msgs = {
    have: { emoji: '💎', text: "Tambahkan parfum yang kamu punya dari halaman Detail." },
    had:  { emoji: '🕰️', text: "Parfum yang pernah kamu miliki akan muncul di sini." },
    want: { emoji: '🌟', text: "Simpan parfum impianmu dari halaman Detail." },
  };
  const { emoji, text } = msgs[tabId];
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
};

export const WardrobeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('have');
  const [collections, setCollections] = useState({
    have: INITIAL_HAVE,
    had:  [],
    want: INITIAL_WANT,
  });

  const removeItem = (tabId, perfumeId) => {
    setCollections(prev => ({
      ...prev,
      [tabId]: prev[tabId].filter(p => p.id !== perfumeId),
    }));
  };

  const currentItems = collections[activeTab];

  // DNA insight: dominant notes in 'have' collection
  const dnaInsight = (() => {
    const haveItems = collections.have;
    if (haveItems.length === 0) return null;
    const freq = {};
    haveItems.forEach(p => p.notes.forEach(n => { freq[n] = (freq[n] ?? 0) + 1; }));
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 2);
    if (sorted.length === 0) return null;
    return sorted.map(([noteId]) => {
      const n = NOTES.find(x => x.id === noteId);
      return n ? `${n.emoji} ${n.label}` : noteId;
    }).join(' & ');
  })();

  return (
    <View style={styles.container}>
      <Header title="Virtual Wardrobe" subtitle="Your personal fragrance collection" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Quick access row */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Collections')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: C.goldFaint }]}>
              <View style={styles.qiStack}>
                <View style={[styles.qiBar, { backgroundColor: C.gold, width: 18 }]} />
                <View style={[styles.qiBar, { backgroundColor: C.gold, width: 14 }]} />
                <View style={[styles.qiBar, { backgroundColor: C.gold, width: 10 }]} />
              </View>
            </View>
            <Text style={styles.quickLabel}>Collections</Text>
            <Text style={styles.quickSub}>Your playlists</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('LayeringStudio')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: C.greenFaint }]}>
              <View style={styles.qiMix}>
                <View style={[styles.qiDot, { backgroundColor: C.green, left: 4 }]} />
                <View style={[styles.qiDot, { backgroundColor: C.green, right: 4 }]} />
                <View style={[styles.qiPlus]} />
              </View>
            </View>
            <Text style={styles.quickLabel}>Layering Studio</Text>
            <Text style={styles.quickSub}>Blend two scents</Text>
          </TouchableOpacity>
        </View>

        {/* DNA Insight */}
        {dnaInsight && (
          <View style={styles.insightBanner}>
            <Text style={styles.insightIcon}>🧬</Text>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Koleksimu didominasi oleh</Text>
              <Text style={styles.insightDna}>{dnaInsight}</Text>
            </View>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          {TABS.map(tab => (
            <View key={tab.id} style={styles.statBox}>
              <Text style={styles.statNumber}>{collections[tab.id].length}</Text>
              <Text style={styles.statLabel}>{tab.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab selector */}
        <View style={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.tabSubtitle}>{TABS.find(t => t.id === activeTab)?.subtitle}</Text>

        {/* Grid */}
        {currentItems.length === 0 ? (
          <EmptyState tabId={activeTab} />
        ) : (
          <View style={styles.grid}>
            {currentItems.map(perfume => (
              <WardrobeCard
                key={perfume.id}
                perfume={perfume}
                onRemove={() => removeItem(activeTab, perfume.id)}
              />
            ))}
          </View>
        )}

        {/* Suggestion: quick-add from DB */}
        <View style={styles.suggestSection}>
          <Text style={styles.suggestTitle}>Tambah ke koleksi</Text>
          <Text style={styles.suggestSubtitle}>Tap parfum untuk ditambahkan ke tab aktif</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
            {PERFUME_DB
              .filter(p => !currentItems.find(c => c.id === p.id))
              .slice(0, 6)
              .map(perfume => (
                <TouchableOpacity
                  key={perfume.id}
                  style={styles.suggestCard}
                  onPress={() => setCollections(prev => ({
                    ...prev,
                    [activeTab]: [...prev[activeTab], perfume],
                  }))}
                  activeOpacity={0.8}
                >
                  <View style={[styles.suggestVisual, { backgroundColor: (perfume.color ?? C.green) + '22' }]}>
                    <Text style={styles.suggestEmoji}>{perfume.emoji}</Text>
                  </View>
                  <Text style={styles.suggestBrand} numberOfLines={1}>{perfume.brand}</Text>
                  <Text style={styles.suggestName} numberOfLines={1}>{perfume.name}</Text>
                  <View style={styles.addIcon}>
                    <Text style={styles.addIconText}>+</Text>
                  </View>
                </TouchableOpacity>
              ))
            }
          </ScrollView>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const CARD_W = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },
  scrollContent: { paddingBottom: 40 },

  // Quick access
  quickRow: {
    flexDirection: 'row',
    marginHorizontal: 24, marginTop: 20,
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: C.cardBg,
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: C.divider,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  quickIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  quickLabel: { color: C.greenDark, fontSize: 13, fontWeight: '800', marginBottom: 2 },
  quickSub: { color: C.textMuted, fontSize: 11 },
  qiStack: { gap: 3, alignItems: 'flex-start' },
  qiBar: { height: 2, borderRadius: 1, backgroundColor: C.gold },
  qiMix: { width: 26, height: 20, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  qiDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, top: 0, backgroundColor: C.green },
  qiPlus: { width: 10, height: 10, borderRadius: 2, backgroundColor: C.greenLight, position: 'absolute', bottom: 0 },

  // Insight
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenDark,
    marginHorizontal: 24, marginTop: 20,
    borderRadius: 18, padding: 16,
    gap: 12,
    borderWidth: 1, borderColor: C.goldBorder,
  },
  insightIcon: { fontSize: 28 },
  insightText: { flex: 1 },
  insightTitle: { color: C.textFaint, fontSize: 12, marginBottom: 2 },
  insightDna: { color: C.gold, fontSize: 16, fontWeight: '800' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24, marginTop: 16,
    backgroundColor: C.cardBg,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: C.divider,
  },
  statBox: {
    flex: 1, alignItems: 'center',
    paddingVertical: 14,
    borderRightWidth: 1, borderRightColor: C.divider,
  },
  statNumber: { color: C.greenDark, fontSize: 22, fontWeight: '900' },
  statLabel: { color: C.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 24, marginTop: 20,
    borderBottomWidth: 1, borderBottomColor: C.divider,
  },
  tabBtn: {
    flex: 1, alignItems: 'center',
    paddingBottom: 12,
    position: 'relative',
  },
  tabBtnActive: {},
  tabLabel: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  tabLabelActive: { color: C.greenDark, fontWeight: '800' },
  tabUnderline: {
    position: 'absolute', bottom: -1,
    left: 20, right: 20, height: 2,
    backgroundColor: C.gold,
    borderRadius: 1,
  },
  tabSubtitle: {
    color: C.textFaint, fontSize: 12,
    marginHorizontal: 24, marginTop: 10, marginBottom: 16,
  },

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 24, gap: 12,
  },
  card: {
    width: CARD_W,
    backgroundColor: C.cardBg,
    borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: C.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardVisual: {
    height: 80, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  cardEmoji: { fontSize: 36 },
  cardBrand: { color: C.textFaint, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  cardName: { color: C.greenDark, fontSize: 14, fontWeight: '800', marginTop: 2 },
  cardConc: { color: C.textMuted, fontSize: 11, marginTop: 3 },
  removeBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.divider,
    justifyContent: 'center', alignItems: 'center',
  },
  removeBtnText: { color: C.textMuted, fontSize: 11, fontWeight: '800' },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48, paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyText: { color: C.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 },

  // Suggestions
  suggestSection: {
    marginTop: 28, marginBottom: 8,
  },
  suggestTitle: {
    fontSize: 18, fontWeight: '800', color: C.greenDark,
    paddingHorizontal: 24, marginBottom: 4,
  },
  suggestSubtitle: {
    fontSize: 13, color: C.textMuted,
    paddingHorizontal: 24, marginBottom: 14,
  },
  suggestRow: { paddingHorizontal: 24, gap: 12 },
  suggestCard: {
    width: 120,
    backgroundColor: C.cardBg,
    borderRadius: 18, padding: 12,
    borderWidth: 1, borderColor: C.divider,
    alignItems: 'center',
  },
  suggestVisual: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  suggestEmoji: { fontSize: 26 },
  suggestBrand: { color: C.textFaint, fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  suggestName: { color: C.greenDark, fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  addIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.green,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 8,
  },
  addIconText: { color: C.gold, fontSize: 16, fontWeight: '900', lineHeight: 20 },
});
