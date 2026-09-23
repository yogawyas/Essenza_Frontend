import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal, Animated, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { C } from '../theme/colors';
import { DUPE_DB, NOTES } from '../data/mockData';
import { GoldButton } from '../components/GoldButton';

const { width, height } = Dimensions.get('window');

// Helper: lighten hex color for gradient
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},`;
};

// --- Scent DNA Radar (simplified visual using bars) ---
const ScentRadar = ({ notes, allNotes }) => {
  const noteData = allNotes.filter(n => notes.includes(n.id));
  return (
    <View style={radarStyles.container}>
      <Text style={radarStyles.title}>Scent Profile</Text>
      <View style={radarStyles.bars}>
        {noteData.map((note, idx) => {
          const dominance = idx === 0 ? 95 : idx === 1 ? 72 : 55;
          return (
            <View key={note.id} style={radarStyles.barRow}>
              <View style={radarStyles.barLabelRow}>
                <Text style={radarStyles.barEmoji}>{note.emoji}</Text>
                <Text style={radarStyles.barLabel}>{note.label}</Text>
              </View>
              <View style={radarStyles.barTrack}>
                <View style={[radarStyles.barFill, { width: `${dominance}%` }]} />
              </View>
              <Text style={radarStyles.barPct}>{dominance}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const radarStyles = StyleSheet.create({
  container: {
    backgroundColor: C.cardBg,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.divider,
  },
  title: {
    fontSize: 13, fontWeight: '700', color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16,
  },
  bars: { gap: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', width: 90, gap: 4 },
  barEmoji: { fontSize: 16 },
  barLabel: { fontSize: 13, fontWeight: '600', color: C.greenDark },
  barTrack: {
    flex: 1, height: 8, backgroundColor: C.divider,
    borderRadius: 4, overflow: 'hidden',
  },
  barFill: {
    height: '100%', backgroundColor: C.green,
    borderRadius: 4,
  },
  barPct: { fontSize: 12, fontWeight: '700', color: C.textMuted, width: 34, textAlign: 'right' },
});

// --- Dupe Card inside Bottom Sheet ---
const DupeCard = ({ dupe }) => {
  const [vote, setVote] = useState(null); // 'up' | 'down' | null

  return (
    <View style={dupeStyles.card}>
      <View style={dupeStyles.left}>
        <View style={dupeStyles.emojiBox}>
          <Text style={dupeStyles.emoji}>{dupe.emoji}</Text>
        </View>
        <View>
          <Text style={dupeStyles.brand}>{dupe.brand}</Text>
          <Text style={dupeStyles.name}>{dupe.name}</Text>
          <Text style={dupeStyles.price}>{dupe.price}</Text>
        </View>
      </View>
      <View style={dupeStyles.right}>
        <View style={dupeStyles.simBadge}>
          <Text style={dupeStyles.simText}>{dupe.similarity}%</Text>
          <Text style={dupeStyles.simLabel}>mirip</Text>
        </View>
        {/* Community vote */}
        <View style={dupeStyles.voteRow}>
          <TouchableOpacity
            style={[dupeStyles.voteBtn, vote === 'up' && dupeStyles.voteBtnActive]}
            onPress={() => setVote(v => v === 'up' ? null : 'up')}
          >
            <Text style={dupeStyles.voteBtnText}>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dupeStyles.voteBtn, vote === 'down' && dupeStyles.voteBtnDown]}
            onPress={() => setVote(v => v === 'down' ? null : 'down')}
          >
            <Text style={dupeStyles.voteBtnText}>👎</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const dupeStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.offWhite,
    borderRadius: 16, padding: 14,
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  emojiBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.cardBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.divider,
  },
  emoji: { fontSize: 22 },
  brand: { color: C.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  name: { color: C.greenDark, fontSize: 14, fontWeight: '700' },
  price: { color: C.green, fontSize: 12, fontWeight: '600', marginTop: 1 },
  right: { alignItems: 'center', gap: 6 },
  simBadge: {
    backgroundColor: C.greenFaint, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4,
    alignItems: 'center',
  },
  simText: { color: C.green, fontSize: 15, fontWeight: '800' },
  simLabel: { color: C.textMuted, fontSize: 9, fontWeight: '600' },
  voteRow: { flexDirection: 'row', gap: 6 },
  voteBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.divider,
    justifyContent: 'center', alignItems: 'center',
  },
  voteBtnActive: { backgroundColor: C.greenFaint },
  voteBtnDown: { backgroundColor: '#FEE2E2' },
  voteBtnText: { fontSize: 14 },
});

// --- Main Screen ---
export const PerfumeDetailScreen = ({ route, navigation }) => {
  const { perfume, scentDNA = [] } = route.params;
  const [dupeSheetVisible, setDupeSheetVisible] = useState(false);
  const [inWardrobe, setInWardrobe] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const dupes = DUPE_DB[perfume.id] ?? [];
  const gradientStart = (perfume.color || '#163B2C') + 'CC';
  const gradientEnd = C.offWhite;

  const openDupeSheet = () => {
    setDupeSheetVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeDupeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setDupeSheetVisible(false));
  };

  const handleAddWardrobe = () => {
    setInWardrobe(v => !v);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Adaptive gradient hero */}
      <LinearGradient
        colors={[perfume.color ?? C.greenDark, C.offWhite]}
        locations={[0, 0.72]}
        style={styles.gradientBg}
      />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroEmojiBox, { backgroundColor: (perfume.color ?? C.green) + '33' }]}>
            <Text style={styles.heroEmoji}>{perfume.emoji}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{perfume.score}% Match</Text>
          </View>
        </View>

        {/* Identity */}
        <View style={styles.identity}>
          <Text style={styles.brand}>{perfume.brand}</Text>
          <Text style={styles.name}>{perfume.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{perfume.concentration}</Text>
            </View>
            <Text style={styles.price}>{perfume.price}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descBox}>
          <Text style={styles.descText}>{perfume.description}</Text>
        </View>

        {/* Notes pills */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionLabel}>Scent Notes</Text>
          <View style={styles.notesPills}>
            {perfume.notes.map(n => {
              const noteObj = NOTES.find(x => x.id === n);
              return (
                <View key={n} style={styles.notePill}>
                  <Text style={styles.notePillEmoji}>{noteObj?.emoji}</Text>
                  <Text style={styles.notePillText}>{n}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Scent DNA Radar */}
        <ScentRadar notes={perfume.notes} allNotes={NOTES} />

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.wardrobeBtn, inWardrobe && styles.wardrobeBtnActive]}
            onPress={handleAddWardrobe}
            activeOpacity={0.8}
          >
            <Text style={styles.wardrobeBtnText}>
              {inWardrobe ? '✓ In Wardrobe' : '+ Wardrobe'}
            </Text>
          </TouchableOpacity>
          <GoldButton style={styles.buyBtn} onPress={() => {}}>
            🛒  Beli di Shopee
          </GoldButton>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Dupe Radar FAB */}
      <TouchableOpacity style={styles.fab} onPress={openDupeSheet} activeOpacity={0.88}>
        <Text style={styles.fabText}>🔍</Text>
        <Text style={styles.fabLabel}>Dupe Radar</Text>
      </TouchableOpacity>

      {/* Dupe Bottom Sheet Modal */}
      <Modal
        visible={dupeSheetVisible}
        transparent
        animationType="none"
        onRequestClose={closeDupeSheet}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeDupeSheet} activeOpacity={1}>
          <Animated.View
            style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Handle bar */}
              <View style={styles.sheetHandle} />

              <Text style={styles.sheetTitle}>🔍 Dupe Radar</Text>
              <Text style={styles.sheetSubtitle}>
                Parfum terjangkau yang mirip dengan <Text style={{ fontWeight: '800', color: C.greenDark }}>{perfume.name}</Text>
              </Text>

              {dupes.length > 0 ? dupes.map(dupe => (
                <DupeCard key={dupe.id} dupe={dupe} />
              )) : (
                <Text style={styles.noDupeText}>Belum ada data dupe untuk parfum ini.</Text>
              )}

              <View style={{ height: 24 }} />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },
  gradientBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.55,
  },
  backBtn: {
    position: 'absolute',
    top: 54, left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  backText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  scrollContent: { paddingTop: 60 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 24,
  },
  heroEmojiBox: {
    width: 140, height: 140,
    borderRadius: 70,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  heroEmoji: { fontSize: 72 },
  heroBadge: {
    marginTop: 14,
    backgroundColor: C.greenDark,
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.goldBorder,
  },
  heroBadgeText: { color: C.gold, fontSize: 13, fontWeight: '800' },

  // Identity
  identity: {
    paddingHorizontal: 24, marginBottom: 16,
    alignItems: 'center',
  },
  brand: {
    color: C.textMuted, fontSize: 13, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6,
  },
  name: {
    color: C.greenDark, fontSize: 30, fontWeight: '900',
    textAlign: 'center', marginBottom: 12,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaPill: {
    backgroundColor: C.greenFaint,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10,
  },
  metaText: { color: C.green, fontSize: 12, fontWeight: '700' },
  price: { color: C.greenDark, fontSize: 16, fontWeight: '800' },

  // Description
  descBox: {
    marginHorizontal: 24, marginBottom: 20,
    backgroundColor: C.cardBg,
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: C.divider,
  },
  descText: { color: C.textMuted, fontSize: 15, lineHeight: 24 },

  // Notes
  notesSection: { paddingHorizontal: 24, marginBottom: 16 },
  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12,
  },
  notesPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  notePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.greenFaint,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 16,
  },
  notePillEmoji: { fontSize: 16 },
  notePillText: {
    color: C.green, fontSize: 13, fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 8,
    gap: 12,
  },
  wardrobeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.green,
    backgroundColor: 'transparent',
  },
  wardrobeBtnActive: {
    backgroundColor: C.greenFaint,
    borderColor: C.green,
  },
  wardrobeBtnText: { color: C.green, fontSize: 14, fontWeight: '700' },
  buyBtn: { flex: 1.2 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 32, right: 24,
    backgroundColor: C.greenDark,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: C.goldBorder,
  },
  fabText: { fontSize: 18 },
  fabLabel: { color: C.gold, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  // Bottom sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: height * 0.72,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.divider,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20, fontWeight: '800', color: C.greenDark, marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14, color: C.textMuted, marginBottom: 20, lineHeight: 20,
  },
  noDupeText: { color: C.textFaint, fontSize: 14, textAlign: 'center', marginVertical: 20 },
});
