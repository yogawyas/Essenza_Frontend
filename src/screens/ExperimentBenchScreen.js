import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Modal, FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { C } from '../theme/colors';
import { NOTES, PERFUME_DB, DUPE_DB } from '../data/mockData';
import { GoldButton } from '../components/GoldButton';

const { height } = Dimensions.get('window');

// Mock Random Forest Prediciton
const predictMixture = (ingredients) => {
  if (ingredients.length === 0) return null;
  
  // Sort by percentage
  const sorted = [...ingredients].sort((a, b) => b.pct - a.pct);
  const mainNote = NOTES.find(n => n.id === sorted[0].id);
  const secondaryNote = sorted.length > 1 ? NOTES.find(n => n.id === sorted[1].id) : null;
  
  // Predict Scent Profile Name
  const profileName = secondaryNote 
    ? `${mainNote.label} ${secondaryNote.label}`
    : `Pure ${mainNote.label}`;

  // Find Expensive Match
  const ingredientIds = ingredients.map(i => i.id);
  let match = PERFUME_DB.find(p => p.notes.some(n => ingredientIds.includes(n)));
  if (!match) match = PERFUME_DB[0];

  // Find Cheaper Alternative (Dupe)
  const dupes = DUPE_DB[match.id] || [];
  const dupe = dupes.length > 0 ? dupes[0] : null;

  return {
    profileName,
    mainNoteEmoji: mainNote.emoji,
    matchScore: Math.floor(Math.random() * 15) + 80, // 80-95%
    expensiveMatch: match,
    cheapDupe: dupe,
  };
};

const SUGGESTIONS = [
  { label: 'Fresh & Clean', desc: 'Citrus + Marine', preset: [{ id: 'citrus', pct: 60 }, { id: 'fresh', pct: 40 }] },
  { label: 'Sweet Date', desc: 'Sweet + Musky', preset: [{ id: 'sweet', pct: 70 }, { id: 'musky', pct: 30 }] },
  { label: 'Elegant Wood', desc: 'Woody + Floral', preset: [{ id: 'woody', pct: 50 }, { id: 'floral', pct: 50 }] },
];

export const ExperimentBenchScreen = ({ navigation }) => {
  const [ingredients, setIngredients] = useState([]); // { id: 'floral', pct: 50 }
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [result, setResult] = useState(null);

  const addIngredient = (note) => {
    if (ingredients.find(i => i.id === note.id)) return; // already added
    if (ingredients.length >= 3) return; // max 3
    
    // Balance percentages
    const newCount = ingredients.length + 1;
    const equalPct = Math.floor(100 / newCount);
    
    const newIngredients = ingredients.map(i => ({ ...i, pct: equalPct }));
    newIngredients.push({ id: note.id, pct: 100 - (equalPct * (newCount - 1)) });
    
    setIngredients(newIngredients);
    setPickerOpen(false);
    setResult(null);
  };

  const removeIngredient = (id) => {
    const filtered = ingredients.filter(i => i.id !== id);
    // Rebalance
    if (filtered.length > 0) {
      const equalPct = Math.floor(100 / filtered.length);
      filtered.forEach((i, idx) => {
        i.pct = idx === filtered.length - 1 ? 100 - (equalPct * (filtered.length - 1)) : equalPct;
      });
    }
    setIngredients(filtered);
    setResult(null);
  };

  const applyPreset = (preset) => {
    setIngredients(preset);
    setResult(null);
  };

  const handleSimulate = () => {
    if (ingredients.length === 0) return;
    setResult(predictMixture(ingredients));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[C.greenDark, C.offWhite]} locations={[0, 0.4]} style={styles.heroBg} />
      
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Scent Lab</Text>
          <Text style={styles.headerSub}>Digital Experiment Bench</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Suggestions / Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECIPE SUGGESTIONS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {SUGGESTIONS.map((s, idx) => (
              <TouchableOpacity key={idx} style={styles.suggestionCard} onPress={() => applyPreset(s.preset)}>
                <Text style={styles.sugLabel}>{s.label}</Text>
                <Text style={styles.sugDesc}>{s.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bench Area */}
        <View style={styles.benchCard}>
          <Text style={styles.benchTitle}>Your Formulation</Text>
          <Text style={styles.benchSub}>Add molecules and adjust ratios</Text>
          
          <View style={styles.ingredientsList}>
            {ingredients.map((ing) => {
              const note = NOTES.find(n => n.id === ing.id);
              return (
                <View key={ing.id} style={styles.ingredientRow}>
                  <View style={styles.ingInfo}>
                    <Text style={styles.ingEmoji}>{note?.emoji}</Text>
                    <Text style={styles.ingLabel}>{note?.label}</Text>
                  </View>
                  <View style={styles.pctControl}>
                    <Text style={styles.pctText}>{ing.pct}%</Text>
                  </View>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeIngredient(ing.id)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {ingredients.length < 3 && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setPickerOpen(true)}>
              <Text style={styles.addBtnText}>+ Add Molecule</Text>
            </TouchableOpacity>
          )}

          {ingredients.length > 0 && !result && (
            <View style={{ marginTop: 24 }}>
              <GoldButton onPress={handleSimulate}>Simulate Mixture</GoldButton>
            </View>
          )}
        </View>

        {/* Results Area */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultEmoji}>{result.mainNoteEmoji}</Text>
              <Text style={styles.resultTitle}>{result.profileName} Profile</Text>
              <Text style={styles.resultSub}>Predicted by Random Forest</Text>
            </View>

            <View style={styles.matchScoreBox}>
              <Text style={styles.scoreText}>{result.matchScore}%</Text>
              <Text style={styles.scoreLabel}>Harmony Score</Text>
            </View>

            {/* Expensive Match */}
            <Text style={styles.sectionTitle}>LUXURY MATCH</Text>
            <View style={styles.perfumeCard}>
              <View style={[styles.perfumeVisual, { backgroundColor: result.expensiveMatch.color + '22' }]}>
                <Text style={styles.perfumeEmoji}>{result.expensiveMatch.emoji}</Text>
              </View>
              <View style={styles.perfumeInfo}>
                <Text style={styles.perfumeBrand}>{result.expensiveMatch.brand}</Text>
                <Text style={styles.perfumeName}>{result.expensiveMatch.name}</Text>
                <Text style={styles.perfumePrice}>{result.expensiveMatch.price}</Text>
              </View>
            </View>

            {/* Cheap Dupe */}
            {result.cheapDupe && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>AFFORDABLE DUPE</Text>
                <View style={[styles.perfumeCard, { borderColor: C.gold, borderWidth: 1 }]}>
                  <View style={[styles.perfumeVisual, { backgroundColor: C.gold + '22' }]}>
                    <Text style={styles.perfumeEmoji}>{result.cheapDupe.emoji}</Text>
                  </View>
                  <View style={styles.perfumeInfo}>
                    <Text style={styles.perfumeBrand}>{result.cheapDupe.brand}</Text>
                    <Text style={styles.perfumeName}>{result.cheapDupe.name}</Text>
                    <Text style={styles.perfumePrice}>{result.cheapDupe.price}</Text>
                  </View>
                  <View style={styles.dupeBadge}>
                    <Text style={styles.dupeBadgeText}>{result.cheapDupe.similarity}% Match</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Note Picker Modal */}
      <Modal visible={isPickerOpen} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Select a Note</Text>
            <FlatList
              data={NOTES}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={{ gap: 10 }}
              contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.noteCard, ingredients.find(i => i.id === item.id) && { opacity: 0.5 }]} 
                  onPress={() => addIngredient(item)}
                >
                  <Text style={styles.noteEmoji}>{item.emoji}</Text>
                  <Text style={styles.noteLabel}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setPickerOpen(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  headerRow: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 },
  headerText: { alignItems: 'center' },
  headerTitle: { color: C.gold, fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  headerSub: { color: C.textFaint, fontSize: 13, marginTop: 4 },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  
  section: { marginBottom: 24 },
  sectionTitle: { color: C.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  
  suggestionCard: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 16, minWidth: 140 },
  sugLabel: { color: C.white, fontSize: 14, fontWeight: '700' },
  sugDesc: { color: C.textFaint, fontSize: 11, marginTop: 4 },

  benchCard: { backgroundColor: C.cardBg, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 24 },
  benchTitle: { color: C.greenDark, fontSize: 18, fontWeight: '800' },
  benchSub: { color: C.textMuted, fontSize: 12, marginBottom: 16 },
  
  ingredientsList: { gap: 12 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.offWhite, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: C.divider },
  ingInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  ingEmoji: { fontSize: 20 },
  ingLabel: { color: C.greenDark, fontSize: 14, fontWeight: '700' },
  pctControl: { backgroundColor: C.greenFaint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 10 },
  pctText: { color: C.green, fontWeight: '800', fontSize: 14 },
  removeBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  removeText: { color: '#999', fontSize: 10, fontWeight: 'bold' },

  addBtn: { marginTop: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: C.divider, borderRadius: 12, padding: 16, alignItems: 'center' },
  addBtnText: { color: C.textMuted, fontSize: 14, fontWeight: '700' },

  resultCard: { backgroundColor: C.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: C.divider },
  resultHeader: { alignItems: 'center', marginBottom: 20 },
  resultEmoji: { fontSize: 40, marginBottom: 8 },
  resultTitle: { color: C.greenDark, fontSize: 20, fontWeight: '900' },
  resultSub: { color: C.textMuted, fontSize: 12, marginTop: 4 },
  
  matchScoreBox: { backgroundColor: C.greenFaint, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 24 },
  scoreText: { color: C.green, fontSize: 28, fontWeight: '900' },
  scoreLabel: { color: C.green, fontSize: 12, fontWeight: '600' },

  perfumeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.offWhite, padding: 12, borderRadius: 16, gap: 12 },
  perfumeVisual: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  perfumeEmoji: { fontSize: 24 },
  perfumeInfo: { flex: 1 },
  perfumeBrand: { color: C.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  perfumeName: { color: C.greenDark, fontSize: 15, fontWeight: '800', marginTop: 2 },
  perfumePrice: { color: C.textMuted, fontSize: 12, marginTop: 4 },
  
  dupeBadge: { backgroundColor: C.gold, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dupeBadgeText: { color: C.white, fontSize: 10, fontWeight: '800' },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: height * 0.8 },
  pickerTitle: { color: C.greenDark, fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  noteCard: { flex: 1, backgroundColor: C.offWhite, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: C.divider },
  noteEmoji: { fontSize: 24, marginBottom: 8 },
  noteLabel: { color: C.greenDark, fontSize: 12, fontWeight: '700' },
  closeBtn: { marginTop: 10, padding: 16, alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 12 },
  closeBtnText: { color: C.textMuted, fontWeight: '700' }
});
