import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, TouchableOpacity, Dimensions,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { C } from '../theme/colors';
import { PERFUME_DB, NOTES, TRENDING_DUPES, MOODS, SCENT_HISTORY } from '../data/mockData';
import { Header } from '../components/Header';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.58;

const computeScore = (perfumeNotes, scentDNA) => {
  if (!scentDNA || scentDNA.length === 0) return Math.floor(Math.random() * 20) + 70;
  const overlap = perfumeNotes.filter(n => scentDNA.includes(n)).length;
  const base = Math.round((overlap / Math.max(perfumeNotes.length, 1)) * 60);
  const bonus = Math.floor(Math.random() * 15) + 20;
  return Math.min(99, base + bonus);
};

const DailyMixCard = ({ perfume, onPress }) => (
  <TouchableOpacity style={styles.carouselCard} onPress={onPress} activeOpacity={0.88}>
    <View style={[styles.carouselVisual, { backgroundColor: perfume.color + '22' }]}>
      <Text style={styles.carouselEmoji}>{perfume.emoji}</Text>
      <View style={[styles.matchBadge, { backgroundColor: perfume.color }]}>
        <Text style={styles.matchText}>{perfume.score}%</Text>
      </View>
    </View>
    <View style={styles.carouselInfo}>
      <Text style={styles.carouselBrand}>{perfume.brand}</Text>
      <Text style={styles.carouselName} numberOfLines={1}>{perfume.name}</Text>
      <Text style={styles.carouselConc}>{perfume.concentration}</Text>
      <View style={styles.carouselNotes}>
        {perfume.notes.slice(0, 2).map(n => (
          <View key={n} style={styles.notePill}>
            <Text style={styles.notePillText}>{n}</Text>
          </View>
        ))}
      </View>
    </View>
  </TouchableOpacity>
);

const TrendingCard = ({ item }) => (
  <View style={styles.trendCard}>
    <View style={styles.trendVisual}>
      <Text style={styles.trendEmoji}>{item.emoji}</Text>
    </View>
    <Text style={styles.trendBrand}>{item.brand}</Text>
    <Text style={styles.trendName} numberOfLines={1}>{item.name}</Text>
    <Text style={styles.trendDupeOf} numberOfLines={1}>dupe of {item.dupeOf}</Text>
    <View style={styles.trendFooter}>
      <Text style={styles.trendPrice}>{item.price}</Text>
      <View style={styles.upvoteRow}>
        <Text style={styles.upvoteIcon}>👍</Text>
        <Text style={styles.upvoteCount}>{item.upvotes.toLocaleString()}</Text>
      </View>
    </View>
    <View style={styles.simBadge}>
      <Text style={styles.simText}>{item.similarity}% mirip</Text>
    </View>
  </View>
);

const MoodCard = ({ mood, onPress }) => (
  <TouchableOpacity
    style={[styles.moodCard, { backgroundColor: mood.color + '22', borderColor: mood.color + '55' }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
    <Text style={styles.moodLabel} numberOfLines={2}>{mood.label}</Text>
    <Text style={styles.moodDesc}>{mood.desc}</Text>
    <Text style={styles.moodCount}>{mood.perfumeIds.length} scents</Text>
  </TouchableOpacity>
);

const BecauseCard = ({ perfume, basedOn, onPress }) => (
  <TouchableOpacity style={styles.becauseCard} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.becauseVisual, { backgroundColor: perfume.color + '22' }]}>
      <Text style={styles.becauseEmoji}>{perfume.emoji}</Text>
    </View>
    <View style={styles.becauseInfo}>
      <Text style={styles.becauseBrand}>{perfume.brand}</Text>
      <Text style={styles.becauseName} numberOfLines={1}>{perfume.name}</Text>
      <Text style={styles.becauseBased}>Similar to {basedOn}</Text>
    </View>
  </TouchableOpacity>
);

export const HomeScreen = ({ route, navigation }) => {
  const scentDNA = route?.params?.scentDNA ?? [];
  const isFocused = useIsFocused();

  const dailyMix = useMemo(() => PERFUME_DB
    .map(p => ({ ...p, score: computeScore(p.notes, scentDNA) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6),
  [scentDNA, isFocused]);

  const dnaLabels = useMemo(() => scentDNA
    .map(id => NOTES.find(n => n.id === id))
    .filter(Boolean)
    .map(n => `${n.emoji} ${n.label}`)
    .join('  ·  '),
  [scentDNA, isFocused]);

  const becausePerfumes = useMemo(() => {
    const top = [...SCENT_HISTORY].sort((a, b) => b.rating - a.rating)[0];
    if (!top) return null;
    const base = PERFUME_DB.find(p => p.id === top.perfumeId);
    if (!base) return null;
    const items = PERFUME_DB
      .filter(p => p.id !== base.id && p.notes.some(n => base.notes.includes(n)))
      .slice(0, 5);
    return { baseName: base.name, items };
  }, []);

  const handleCardPress = (perfume) => navigation.navigate('PerfumeDetail', { perfume, scentDNA });

  return (
    <View style={styles.container}>
      <Header title="ESSENZA" subtitle="Discover Your Signature Scent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* DNA Banner */}
        {scentDNA.length > 0 && (
          <View style={styles.dnaBanner}>
            <View style={styles.dnaLeft}>
              <Text style={styles.dnaTitle}>YOUR SCENT DNA</Text>
              <Text style={styles.dnaLabels} numberOfLines={2}>{dnaLabels}</Text>
            </View>
            <TouchableOpacity
              style={styles.editDnaBtn}
              onPress={() => navigation.navigate('EditDNA', { currentDNA: scentDNA })}
              activeOpacity={0.7}
            >
              <View style={styles.filterIcon}>
                <View style={[styles.filterLine, { width: 20 }]} />
                <View style={[styles.filterLine, { width: 14 }]} />
                <View style={[styles.filterLine, { width: 8 }]} />
              </View>
              <Text style={styles.editDnaBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scent Wrapped Banner */}
        <TouchableOpacity
          style={styles.wrappedBanner}
          onPress={() => navigation.navigate('ScentWrapped')}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.wrappedTagRow}>
              <Text style={styles.wrappedTag}>2025</Text>
            </View>
            <Text style={styles.wrappedTitle}>Your Scent Wrapped is here</Text>
            <Text style={styles.wrappedSub}>See your year in fragrance →</Text>
          </View>
          <Text style={{ fontSize: 36 }}>✨</Text>
        </TouchableOpacity>

        {/* Mood Board */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pick a Mood</Text>
          <Text style={styles.sectionSubtitle}>Curated scents for every occasion</Text>
        </View>
        <FlatList
          data={MOODS}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          renderItem={({ item }) => (
            <MoodCard mood={item} onPress={() => navigation.navigate('MoodDetail', { mood: item })} />
          )}
        />

        {/* Daily Mix */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Mix for You</Text>
          <Text style={styles.sectionSubtitle}>
            {scentDNA.length > 0 ? 'Matched to your Scent DNA' : 'Explore popular fragrances'}
          </Text>
        </View>
        <FlatList
          data={dailyMix}
          keyExtractor={item => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          renderItem={({ item }) => <DailyMixCard perfume={item} onPress={() => handleCardPress(item)} />}
        />

        {/* Because You Liked */}
        {becausePerfumes && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Because You Liked</Text>
              <Text style={styles.sectionSubtitle}>{becausePerfumes.baseName}</Text>
            </View>
            <FlatList
              data={becausePerfumes.items}
              keyExtractor={item => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              renderItem={({ item }) => (
                <BecauseCard perfume={item} basedOn={becausePerfumes.baseName} onPress={() => handleCardPress(item)} />
              )}
            />
          </>
        )}

        {/* Trending Dupes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Trending Dupes</Text>
          <Text style={styles.sectionSubtitle}>Most upvoted by the community this week</Text>
        </View>
        <FlatList
          data={TRENDING_DUPES}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          renderItem={({ item }) => <TrendingCard item={item} />}
        />

        {/* Browse All */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse All</Text>
          <Text style={styles.sectionSubtitle}>The full collection</Text>
        </View>
        {PERFUME_DB.map(perfume => {
          const score = computeScore(perfume.notes, scentDNA);
          return (
            <TouchableOpacity
              key={perfume.id}
              style={styles.listCard}
              onPress={() => handleCardPress({ ...perfume, score })}
              activeOpacity={0.88}
            >
              <View style={[styles.listVisual, { backgroundColor: perfume.color + '22' }]}>
                <Text style={styles.listEmoji}>{perfume.emoji}</Text>
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listBrand}>{perfume.brand}</Text>
                <Text style={styles.listName}>{perfume.name}</Text>
                <View style={styles.listNotes}>
                  {perfume.notes.map(n => (
                    <View key={n} style={styles.notePill}>
                      <Text style={styles.notePillText}>{n}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.listRight}>
                <Text style={styles.listScore}>{score}%</Text>
                <Text style={styles.listScoreLabel}>match</Text>
                <Text style={styles.listPrice}>{perfume.price}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },
  scrollContent: { paddingBottom: 40 },

  // DNA Banner
  dnaBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 24, marginTop: 20,
    backgroundColor: C.greenDark,
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: C.goldBorder, gap: 12,
  },
  dnaLeft: { flex: 1 },
  dnaTitle: { color: C.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  dnaLabels: { color: C.white, fontSize: 13, fontWeight: '600', lineHeight: 20 },
  editDnaBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.greenMid, borderRadius: 14,
    padding: 10, borderWidth: 1, borderColor: C.goldBorder,
    gap: 5, minWidth: 52,
  },
  editDnaBtnText: { color: C.gold, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  filterIcon: { width: 20, height: 14, justifyContent: 'space-between' },
  filterLine: { height: 2, backgroundColor: C.gold, borderRadius: 1 },

  // Scent Wrapped Banner
  wrappedBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 24, marginTop: 16,
    backgroundColor: C.greenDark,
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: C.goldBorder,
    gap: 12,
    overflow: 'hidden',
  },
  wrappedTagRow: { flexDirection: 'row', marginBottom: 6 },
  wrappedTag: {
    backgroundColor: C.gold,
    color: C.greenDark,
    fontSize: 10, fontWeight: '900',
    letterSpacing: 1.5,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  wrappedTitle: { color: C.white, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  wrappedSub: { color: C.gold, fontSize: 13, fontWeight: '600' },

  // Section headers
  sectionHeader: { paddingHorizontal: 24, marginTop: 28, marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: C.greenDark },
  sectionSubtitle: { fontSize: 13, color: C.textMuted, marginTop: 3 },

  // Carousel
  carouselContainer: { paddingHorizontal: 24, gap: 16 },
  carouselCard: {
    width: CARD_WIDTH,
    backgroundColor: C.cardBg, borderRadius: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: C.divider,
  },
  carouselVisual: { height: 130, justifyContent: 'center', alignItems: 'center' },
  carouselEmoji: { fontSize: 52 },
  matchBadge: {
    position: 'absolute', top: 10, right: 10,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  matchText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  carouselInfo: { padding: 14 },
  carouselBrand: { color: C.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  carouselName: { color: C.greenDark, fontSize: 17, fontWeight: '800', marginBottom: 2 },
  carouselConc: { color: C.textFaint, fontSize: 11, marginBottom: 8 },
  carouselNotes: { flexDirection: 'row', gap: 6 },

  // Mood cards
  moodCard: {
    width: 120, borderRadius: 18,
    padding: 14, borderWidth: 1,
    alignItems: 'flex-start',
  },
  moodEmoji: { fontSize: 28, marginBottom: 8 },
  moodLabel: { color: C.greenDark, fontSize: 13, fontWeight: '800', marginBottom: 2 },
  moodDesc: { color: C.textMuted, fontSize: 10, marginBottom: 6 },
  moodCount: { color: C.textFaint, fontSize: 10, fontWeight: '600' },

  // Because You Liked
  becauseCard: {
    width: 160,
    backgroundColor: C.cardBg,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: C.divider,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  becauseVisual: { height: 90, justifyContent: 'center', alignItems: 'center' },
  becauseEmoji: { fontSize: 40 },
  becauseInfo: { padding: 12 },
  becauseBrand: { color: C.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  becauseName: { color: C.greenDark, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  becauseBased: { color: C.textFaint, fontSize: 10, fontStyle: 'italic' },

  // Note pills
  notePill: { backgroundColor: C.greenFaint, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  notePillText: { color: C.green, fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },

  // Trending
  trendCard: {
    width: 150, backgroundColor: C.cardBg, borderRadius: 20, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: C.divider,
  },
  trendVisual: { width: 52, height: 52, backgroundColor: C.offWhite, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  trendEmoji: { fontSize: 26 },
  trendBrand: { color: C.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  trendName: { color: C.greenDark, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  trendDupeOf: { color: C.textFaint, fontSize: 10, marginBottom: 10, fontStyle: 'italic' },
  trendFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendPrice: { color: C.green, fontSize: 11, fontWeight: '700' },
  upvoteRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  upvoteIcon: { fontSize: 11 },
  upvoteCount: { color: C.textMuted, fontSize: 10, fontWeight: '600' },
  simBadge: { marginTop: 8, backgroundColor: C.greenFaint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  simText: { color: C.green, fontSize: 10, fontWeight: '700' },

  // List cards
  listCard: {
    flexDirection: 'row', backgroundColor: C.cardBg,
    borderRadius: 20, marginHorizontal: 24, marginBottom: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: C.divider, alignItems: 'center',
  },
  listVisual: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  listEmoji: { fontSize: 28 },
  listInfo: { flex: 1 },
  listBrand: { color: C.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  listName: { color: C.greenDark, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  listNotes: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  listRight: { alignItems: 'flex-end', marginLeft: 8 },
  listScore: { color: C.green, fontSize: 18, fontWeight: '800' },
  listScoreLabel: { color: C.textFaint, fontSize: 10, marginBottom: 4 },
  listPrice: { color: C.textMuted, fontSize: 11, fontWeight: '600' },
});
