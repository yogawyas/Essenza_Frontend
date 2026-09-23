import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { C } from '../theme/colors';
import { PERFUME_DB, NOTES } from '../data/mockData';

export const MoodDetailScreen = ({ route, navigation }) => {
  const { mood } = route.params;
  const perfumes = mood.perfumeIds.map(id => PERFUME_DB.find(p => p.id === id)).filter(Boolean);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[mood.color, mood.color + '99', C.offWhite]}
        locations={[0, 0.45, 1]}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heroEmoji}>{mood.emoji}</Text>
        <Text style={styles.heroTitle}>{mood.label}</Text>
        <Text style={styles.heroDesc}>{mood.desc}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{perfumes.length} FRAGRANCES IN THIS MOOD</Text>

        {perfumes.map(perfume => (
          <TouchableOpacity
            key={perfume.id}
            style={styles.perfumeRow}
            onPress={() => navigation.navigate('PerfumeDetail', { perfume })}
            activeOpacity={0.85}
          >
            <View style={[styles.visual, { backgroundColor: perfume.color + '22' }]}>
              <Text style={styles.visualEmoji}>{perfume.emoji}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.brand}>{perfume.brand}</Text>
              <Text style={styles.name}>{perfume.name}</Text>
              <View style={styles.notesRow}>
                {perfume.notes.map(n => {
                  const note = NOTES.find(x => x.id === n);
                  return (
                    <View key={n} style={styles.notePill}>
                      <Text style={styles.notePillText}>{note?.emoji} {n}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={styles.right}>
              <Text style={styles.price}>{perfume.price}</Text>
              <Text style={styles.conc}>{perfume.concentration}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },
  hero: { paddingTop: 54, paddingBottom: 32, paddingHorizontal: 24 },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, marginBottom: 16,
  },
  backText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroTitle: { color: C.white, fontSize: 30, fontWeight: '900', marginBottom: 6 },
  heroDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 15 },

  scrollContent: { paddingTop: 16, paddingBottom: 40 },
  sectionLabel: {
    color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    paddingHorizontal: 24, marginBottom: 14,
  },
  perfumeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.cardBg,
    marginHorizontal: 24, marginBottom: 10,
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: C.divider,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  visual: { width: 54, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  visualEmoji: { fontSize: 26 },
  info: { flex: 1 },
  brand: { color: C.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  name: { color: C.greenDark, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  notesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  notePill: { backgroundColor: C.greenFaint, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  notePillText: { color: C.green, fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  right: { alignItems: 'flex-end', gap: 4 },
  price: { color: C.greenDark, fontSize: 12, fontWeight: '800' },
  conc: { color: C.textFaint, fontSize: 10, fontWeight: '600' },
});
