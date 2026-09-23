import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { C } from '../theme/colors';
import { PERFUME_DB } from '../data/mockData';

const { width } = Dimensions.get('window');

export const CollectionDetailScreen = ({ route, navigation }) => {
  const { collection } = route.params;
  const [perfumeIds, setPerfumeIds] = useState(collection.perfumeIds);

  const perfumes = perfumeIds
    .map(id => PERFUME_DB.find(p => p.id === id))
    .filter(Boolean);

  const removeFromCollection = (id) => {
    setPerfumeIds(prev => prev.filter(pid => pid !== id));
  };

  return (
    <View style={styles.container}>
      {/* Hero header */}
      <LinearGradient
        colors={[collection.color, collection.color + '88', C.offWhite]}
        locations={[0, 0.5, 1]}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <View style={styles.heroIconRow}>
            {perfumes.slice(0, 3).map((p, i) => (
              <View
                key={p.id}
                style={[styles.heroIcon, { backgroundColor: p.color + '44', marginLeft: i > 0 ? -14 : 0 }]}
              >
                <Text style={styles.heroEmoji}>{p.emoji}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.heroName}>{collection.name}</Text>
          <Text style={styles.heroDesc}>{collection.desc}</Text>
          <Text style={styles.heroCount}>{perfumeIds.length} fragrances</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {perfumes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🫧</Text>
            <Text style={styles.emptyTitle}>Collection is empty</Text>
            <Text style={styles.emptyText}>Add fragrances from their detail page using "Add to Collection".</Text>
          </View>
        ) : (
          perfumes.map(perfume => (
            <TouchableOpacity
              key={perfume.id}
              style={styles.perfumeRow}
              onPress={() => navigation.navigate('PerfumeDetail', { perfume })}
              activeOpacity={0.85}
            >
              <View style={[styles.perfumeVisual, { backgroundColor: perfume.color + '22' }]}>
                <Text style={styles.perfumeEmoji}>{perfume.emoji}</Text>
              </View>
              <View style={styles.perfumeInfo}>
                <Text style={styles.perfumeBrand}>{perfume.brand}</Text>
                <Text style={styles.perfumeName}>{perfume.name}</Text>
                <View style={styles.notesRow}>
                  {perfume.notes.slice(0, 2).map(n => (
                    <View key={n} style={styles.notePill}>
                      <Text style={styles.notePillText}>{n}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFromCollection(perfume.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.removeLine1} />
                <View style={styles.removeLine2} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        {/* Add more button */}
        <TouchableOpacity
          style={styles.addMoreBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.addMoreText}>+ Browse fragrances to add</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },

  hero: {
    paddingTop: 54,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, marginBottom: 20,
  },
  backText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  heroContent: {},
  heroIconRow: { flexDirection: 'row', marginBottom: 16 },
  heroIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  heroEmoji: { fontSize: 24 },
  heroName: { color: C.white, fontSize: 28, fontWeight: '900', marginBottom: 4 },
  heroDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 8 },
  heroCount: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600' },

  scrollContent: { paddingTop: 8, paddingBottom: 40 },

  perfumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardBg,
    marginHorizontal: 24, marginBottom: 10,
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: C.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  perfumeVisual: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  perfumeEmoji: { fontSize: 26 },
  perfumeInfo: { flex: 1 },
  perfumeBrand: {
    color: C.textMuted, fontSize: 10, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2,
  },
  perfumeName: { color: C.greenDark, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  notesRow: { flexDirection: 'row', gap: 6 },
  notePill: {
    backgroundColor: C.greenFaint,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  notePillText: { color: C.green, fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },

  removeBtn: {
    width: 28, height: 28,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 8,
  },
  removeLine1: {
    position: 'absolute',
    width: 14, height: 2,
    backgroundColor: C.textFaint,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  removeLine2: {
    position: 'absolute',
    width: 14, height: 2,
    backgroundColor: C.textFaint,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60, paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { color: C.greenDark, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: C.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },

  addMoreBtn: {
    marginHorizontal: 24, marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.goldBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addMoreText: { color: C.gold, fontSize: 14, fontWeight: '700' },
});
