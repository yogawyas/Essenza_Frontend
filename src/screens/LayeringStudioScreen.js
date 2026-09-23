import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Modal, FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { C } from '../theme/colors';
import { PERFUME_DB, NOTES } from '../data/mockData';
import { GoldButton } from '../components/GoldButton';

const { width, height } = Dimensions.get('window');

// Predict blend result from two perfumes
const predictBlend = (a, b) => {
  const allNotes = [...new Set([...a.notes, ...b.notes])];
  const blendNotes = allNotes.slice(0, 3);

  // Name generation logic
  const adjectives = { woody: 'Dark', fresh: 'Crisp', floral: 'Bloom', sweet: 'Velvet', musky: 'Smoky', citrus: 'Bright', spicy: 'Noir', herbal: 'Green', fruity: 'Lush', green: 'Wild' };
  const nouns = { woody: 'Cedar', fresh: 'Mist', floral: 'Petal', sweet: 'Amber', musky: 'Silk', citrus: 'Zest', spicy: 'Ember', herbal: 'Sage', fruity: 'Nectar', green: 'Forest' };
  const adj = adjectives[a.notes[0]] ?? 'Mystic';
  const noun = nouns[b.notes[0]] ?? 'Aura';
  const blendName = `${adj} ${noun}`;

  // Longevity estimate
  const longevity = a.concentration === 'EDP' || b.concentration === 'EDP' ? '8–10 hrs' : '5–7 hrs';

  // Find a famous perfume it resembles
  const famousMatch = PERFUME_DB.find(p =>
    p.id !== a.id && p.id !== b.id &&
    p.notes.some(n => blendNotes.includes(n))
  );

  const compatibility = (() => {
    const overlap = a.notes.filter(n => b.notes.includes(n)).length;
    if (overlap >= 2) return { score: 95, label: 'Perfect Harmony', color: '#2E7D52' };
    if (overlap === 1) return { score: 78, label: 'Great Combo', color: '#1B6CA8' };
    return { score: 61, label: 'Adventurous', color: '#E67E22' };
  })();

  return { blendName, blendNotes, longevity, famousMatch, compatibility };
};

// Slot component — drop zone for a perfume
const PerfumeSlot = ({ perfume, label, onPress, onClear }) => (
  <TouchableOpacity
    style={[styles.slot, perfume && { borderColor: perfume.color, backgroundColor: perfume.color + '15' }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {perfume ? (
      <>
        <Text style={styles.slotEmoji}>{perfume.emoji}</Text>
        <Text style={styles.slotBrand} numberOfLines={1}>{perfume.brand}</Text>
        <Text style={styles.slotName} numberOfLines={1}>{perfume.name}</Text>
        <TouchableOpacity style={styles.slotClear} onPress={onClear}>
          <View style={styles.clearLine1} />
          <View style={styles.clearLine2} />
        </TouchableOpacity>
      </>
    ) : (
      <>
        <View style={styles.slotPlus}>
          <View style={styles.plusH} />
          <View style={styles.plusV} />
        </View>
        <Text style={styles.slotLabel}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

// Picker modal
const PerfumePicker = ({ visible, onSelect, onClose, exclude }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.pickerOverlay}>
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHandle} />
        <Text style={styles.pickerTitle}>Choose a Fragrance</Text>
        <FlatList
          data={PERFUME_DB.filter(p => p.id !== exclude?.id)}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.pickerRow} onPress={() => onSelect(item)} activeOpacity={0.8}>
              <View style={[styles.pickerVisual, { backgroundColor: item.color + '22' }]}>
                <Text style={styles.pickerEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.pickerInfo}>
                <Text style={styles.pickerBrand}>{item.brand}</Text>
                <Text style={styles.pickerName}>{item.name}</Text>
              </View>
              <Text style={styles.pickerConc}>{item.concentration}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
);

export const LayeringStudioScreen = ({ navigation }) => {
  const [perfumeA, setPerfumeA] = useState(null);
  const [perfumeB, setPerfumeB] = useState(null);
  const [pickerFor, setPickerFor] = useState(null); // 'a' | 'b'
  const [result, setResult] = useState(null);

  const openPicker = (slot) => setPickerFor(slot);

  const handleSelect = (perfume) => {
    if (pickerFor === 'a') setPerfumeA(perfume);
    else setPerfumeB(perfume);
    setPickerFor(null);
    setResult(null);
  };

  const handleBlend = () => {
    if (!perfumeA || !perfumeB) return;
    setResult(predictBlend(perfumeA, perfumeB));
  };

  const handleReset = () => {
    setPerfumeA(null);
    setPerfumeB(null);
    setResult(null);
  };

  const mixColor = perfumeA && perfumeB
    ? perfumeA.color
    : C.greenMid;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[C.greenDark, C.offWhite]} locations={[0, 0.7]} style={styles.heroBg} />
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Layering Studio</Text>
          <Text style={styles.headerSub}>Blend two fragrances</Text>
        </View>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Two slots + connector */}
        <View style={styles.slotsRow}>
          <PerfumeSlot
            perfume={perfumeA}
            label="First Scent"
            onPress={() => openPicker('a')}
            onClear={() => { setPerfumeA(null); setResult(null); }}
          />

          {/* Plus connector */}
          <View style={styles.connector}>
            <View style={[styles.connectorDot, { backgroundColor: mixColor }]} />
            <Text style={styles.connectorPlus}>+</Text>
            <View style={[styles.connectorDot, { backgroundColor: mixColor }]} />
          </View>

          <PerfumeSlot
            perfume={perfumeB}
            label="Second Scent"
            onPress={() => openPicker('b')}
            onClear={() => { setPerfumeB(null); setResult(null); }}
          />
        </View>

        {/* Blend button */}
        {perfumeA && perfumeB && !result && (
          <View style={styles.blendBtnWrap}>
            <GoldButton onPress={handleBlend}>
              Blend Now
            </GoldButton>
          </View>
        )}

        {/* Result card */}
        {result && (
          <View style={styles.resultCard}>
            {/* Blend name */}
            <View style={styles.resultHeader}>
              <View style={styles.resultEmojiRow}>
                <Text style={styles.resultEmojiA}>{perfumeA.emoji}</Text>
                <View style={[styles.resultMix, { backgroundColor: mixColor + '44' }]}>
                  <Text style={styles.resultMixText}>×</Text>
                </View>
                <Text style={styles.resultEmojiB}>{perfumeB.emoji}</Text>
              </View>
              <Text style={styles.resultName}>{result.blendName}</Text>
              <Text style={styles.resultSub}>Your custom blend</Text>
            </View>

            {/* Compatibility badge */}
            <View style={[styles.compatBadge, { backgroundColor: result.compatibility.color + '22', borderColor: result.compatibility.color + '44' }]}>
              <Text style={[styles.compatScore, { color: result.compatibility.color }]}>{result.compatibility.score}%</Text>
              <Text style={[styles.compatLabel, { color: result.compatibility.color }]}>{result.compatibility.label}</Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{result.longevity}</Text>
                <Text style={styles.statLabel}>Longevity</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{result.blendNotes.length}</Text>
                <Text style={styles.statLabel}>Notes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>EDP</Text>
                <Text style={styles.statLabel}>Strength</Text>
              </View>
            </View>

            {/* Blend notes */}
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>BLEND NOTES</Text>
              <View style={styles.notesRow}>
                {result.blendNotes.map(n => {
                  const note = NOTES.find(x => x.id === n);
                  return (
                    <View key={n} style={styles.notePill}>
                      <Text style={styles.notePillEmoji}>{note?.emoji}</Text>
                      <Text style={styles.notePillText}>{n}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Reminds of */}
            {result.famousMatch && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>REMINDS OF</Text>
                <View style={styles.famousRow}>
                  <View style={[styles.famousVisual, { backgroundColor: result.famousMatch.color + '22' }]}>
                    <Text style={styles.famousEmoji}>{result.famousMatch.emoji}</Text>
                  </View>
                  <View>
                    <Text style={styles.famousName}>{result.famousMatch.name}</Text>
                    <Text style={styles.famousBrand}>{result.famousMatch.brand} · {result.famousMatch.price}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* AI insight */}
            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                "{result.blendName} is a {result.compatibility.label.toLowerCase()} combination. Layer {perfumeA.name} first, then add {perfumeB.name} on pulse points for best results."
              </Text>
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Try Another Blend</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Picker modal */}
      <PerfumePicker
        visible={pickerFor !== null}
        onSelect={handleSelect}
        onClose={() => setPickerFor(null)}
        exclude={pickerFor === 'a' ? perfumeB : perfumeA}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },
  heroBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, width: 80,
  },
  backText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  headerText: { flex: 1, alignItems: 'center' },
  headerTitle: { color: C.gold, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  headerSub: { color: C.textFaint, fontSize: 12, marginTop: 2 },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 },

  // Slots
  slotsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  slot: {
    flex: 1, aspectRatio: 0.85,
    backgroundColor: C.cardBg,
    borderRadius: 22,
    borderWidth: 2, borderColor: C.divider,
    borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
    padding: 12,
    position: 'relative',
  },
  slotEmoji: { fontSize: 38, marginBottom: 6 },
  slotBrand: { color: C.textMuted, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  slotName: { color: C.greenDark, fontSize: 13, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  slotPlus: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.greenFaint, justifyContent: 'center', alignItems: 'center', marginBottom: 8, position: 'relative' },
  plusH: { position: 'absolute', width: 16, height: 2, backgroundColor: C.green, borderRadius: 1 },
  plusV: { position: 'absolute', width: 2, height: 16, backgroundColor: C.green, borderRadius: 1 },
  slotLabel: { color: C.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  slotClear: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, justifyContent: 'center', alignItems: 'center' },
  clearLine1: { position: 'absolute', width: 12, height: 2, backgroundColor: C.textFaint, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearLine2: { position: 'absolute', width: 12, height: 2, backgroundColor: C.textFaint, borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  connector: { alignItems: 'center', gap: 3 },
  connectorDot: { width: 6, height: 6, borderRadius: 3 },
  connectorPlus: { color: C.textMuted, fontSize: 22, fontWeight: '300' },

  blendBtnWrap: { marginBottom: 24 },

  // Result
  resultCard: {
    backgroundColor: C.cardBg,
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: C.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06, shadowRadius: 16,
    elevation: 5,
  },
  resultHeader: { alignItems: 'center', marginBottom: 16 },
  resultEmojiRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  resultEmojiA: { fontSize: 40 },
  resultEmojiB: { fontSize: 40 },
  resultMix: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  resultMixText: { color: C.greenDark, fontSize: 18, fontWeight: '900' },
  resultName: { color: C.greenDark, fontSize: 24, fontWeight: '900', marginBottom: 4 },
  resultSub: { color: C.textMuted, fontSize: 13 },

  compatBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8,
    gap: 8, marginBottom: 16,
  },
  compatScore: { fontSize: 20, fontWeight: '900' },
  compatLabel: { fontSize: 14, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: C.offWhite,
    borderRadius: 14, padding: 14,
    marginBottom: 16,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: C.greenDark, fontSize: 16, fontWeight: '800' },
  statLabel: { color: C.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: C.divider },

  resultSection: { marginBottom: 16 },
  resultSectionTitle: { color: C.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  notesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.greenFaint, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 14,
  },
  notePillEmoji: { fontSize: 14 },
  notePillText: { color: C.green, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },

  famousRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  famousVisual: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  famousEmoji: { fontSize: 22 },
  famousName: { color: C.greenDark, fontSize: 14, fontWeight: '800' },
  famousBrand: { color: C.textMuted, fontSize: 11, marginTop: 2 },

  insightBox: {
    backgroundColor: C.greenFaint,
    borderRadius: 14, padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: C.green,
  },
  insightText: { color: C.greenDark, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },

  resetBtn: { alignItems: 'center', paddingVertical: 12 },
  resetText: { color: C.textMuted, fontSize: 14, fontWeight: '600' },

  // Picker
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
    maxHeight: height * 0.75,
  },
  pickerHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.divider, alignSelf: 'center', marginBottom: 16 },
  pickerTitle: { color: C.greenDark, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.divider, gap: 12,
  },
  pickerVisual: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  pickerEmoji: { fontSize: 22 },
  pickerInfo: { flex: 1 },
  pickerBrand: { color: C.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  pickerName: { color: C.greenDark, fontSize: 14, fontWeight: '700', marginTop: 2 },
  pickerConc: { color: C.textFaint, fontSize: 11, fontWeight: '600' },
});
