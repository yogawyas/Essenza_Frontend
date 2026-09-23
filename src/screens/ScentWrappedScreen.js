import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { C } from '../theme/colors';
import { SCENT_WRAPPED, NOTES, PERFUME_DB } from '../data/mockData';

const { width, height } = Dimensions.get('window');

// Bar chart for monthly activity
const MonthlyChart = ({ months }) => {
  const max = Math.max(...months.map(m => m.count));
  return (
    <View style={chartStyles.container}>
      {months.map(m => (
        <View key={m.month} style={chartStyles.barCol}>
          <View style={chartStyles.barTrack}>
            <View style={[chartStyles.barFill, { height: `${(m.count / max) * 100}%` }]} />
          </View>
          <Text style={chartStyles.barLabel}>{m.month}</Text>
          <Text style={chartStyles.barCount}>{m.count}</Text>
        </View>
      ))}
    </View>
  );
};

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 6, height: 90, paddingTop: 8,
  },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: {
    flex: 1, width: '60%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: C.gold,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 4 },
  barCount: { color: C.gold, fontSize: 9, fontWeight: '700' },
});

// Single "story" slide
const Slide = ({ children, colors }) => (
  <LinearGradient colors={colors} style={slideStyles.slide}>
    {children}
  </LinearGradient>
);

const slideStyles = StyleSheet.create({
  slide: {
    width,
    height: height * 0.82,
    borderRadius: 28,
    padding: 32,
    overflow: 'hidden',
  },
});

export const ScentWrappedScreen = ({ navigation }) => {
  const w = SCENT_WRAPPED;
  const scrollRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const topNote = NOTES.find(n => n.id === w.topNote);
  const secondNote = NOTES.find(n => n.id === w.secondNote);

  const SLIDES = 5;

  const goNext = () => {
    if (currentSlide < SLIDES - 1) {
      scrollRef.current?.scrollTo({ x: width * (currentSlide + 1), animated: true });
      setCurrentSlide(c => c + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleScroll = (e) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slide);
  };

  return (
    <View style={styles.container}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>✕</Text>
      </TouchableOpacity>

      {/* Progress dots */}
      <View style={styles.progressRow}>
        {Array.from({ length: SLIDES }).map((_, i) => (
          <View key={i} style={[styles.progressDot, i <= currentSlide && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.slidesContainer}
      >
        {/* Slide 1 — Intro */}
        <Slide colors={[C.greenDark, '#163B2C']}>
          <View style={styles.slideContent}>
            <Text style={styles.slideYear}>{w.year}</Text>
            <Text style={styles.slideMainTitle}>Your Scent{'\n'}Wrapped</Text>
            <Text style={styles.slideSubtitle}>A year of fragrance exploration, distilled into moments.</Text>
            <View style={styles.statHighlight}>
              <Text style={styles.statBig}>{w.totalExplored}</Text>
              <Text style={styles.statBigLabel}>fragrances explored</Text>
            </View>
            <MonthlyChart months={w.months} />
          </View>
        </Slide>

        {/* Slide 2 — Top Perfume */}
        <Slide colors={[w.topPerfume.color, w.topPerfume.color + 'AA', C.greenDark]}>
          <View style={styles.slideContent}>
            <Text style={styles.slideTag}>YOUR #1 FRAGRANCE</Text>
            <Text style={styles.slideTopEmoji}>{w.topPerfume.emoji}</Text>
            <Text style={styles.slideTopBrand}>{w.topPerfume.brand}</Text>
            <Text style={styles.slideTopName}>{w.topPerfume.name}</Text>
            <Text style={styles.slideTopDesc}>{w.topPerfume.description}</Text>
            <View style={styles.notesRow}>
              {w.topPerfume.notes.map(n => {
                const note = NOTES.find(x => x.id === n);
                return (
                  <View key={n} style={styles.notePill}>
                    <Text style={styles.notePillText}>{note?.emoji} {n}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Slide>

        {/* Slide 3 — Scent DNA stats */}
        <Slide colors={['#1A1A2E', '#16213E']}>
          <View style={styles.slideContent}>
            <Text style={styles.slideTag}>YOUR SCENT DNA</Text>
            <Text style={styles.slideMainTitle}>You're all about{'\n'}{topNote?.emoji} {topNote?.label}</Text>

            <View style={styles.dnaBar}>
              <View style={styles.dnaBarRow}>
                <Text style={styles.dnaBarLabel}>{topNote?.emoji} {topNote?.label}</Text>
                <View style={styles.dnaTrack}>
                  <View style={[styles.dnaFill, { width: `${w.topNotePercent}%` }]} />
                </View>
                <Text style={styles.dnaBarPct}>{w.topNotePercent}%</Text>
              </View>
              <View style={styles.dnaBarRow}>
                <Text style={styles.dnaBarLabel}>{secondNote?.emoji} {secondNote?.label}</Text>
                <View style={styles.dnaTrack}>
                  <View style={[styles.dnaFill, { width: `${w.secondNotePercent}%`, backgroundColor: C.goldLight }]} />
                </View>
                <Text style={styles.dnaBarPct}>{w.secondNotePercent}%</Text>
              </View>
            </View>

            <View style={styles.personalityCard}>
              <Text style={styles.personalityTitle}>"{w.personalityTitle}"</Text>
              <Text style={styles.personalityDesc}>{w.personalityDesc}</Text>
            </View>
          </View>
        </Slide>

        {/* Slide 4 — Dupe savings */}
        <Slide colors={['#2E7D32', '#1B5E20']}>
          <View style={styles.slideContent}>
            <Text style={styles.slideTag}>YOUR SAVINGS</Text>
            <Text style={styles.slideSavingsAmount}>{w.dupeSavings}</Text>
            <Text style={styles.slideSavingsLabel}>saved with dupes</Text>
            <View style={styles.savingsStats}>
              <View style={styles.savingsStat}>
                <Text style={styles.savingsStatNum}>{w.totalDupesFound}</Text>
                <Text style={styles.savingsStatLabel}>dupes discovered</Text>
              </View>
              <View style={styles.savingsDivider} />
              <View style={styles.savingsStat}>
                <Text style={styles.savingsStatNum}>{w.longestStreak}</Text>
                <Text style={styles.savingsStatLabel}>day streak</Text>
              </View>
            </View>
            <Text style={styles.savingsInsight}>
              You could've bought {Math.floor(parseInt(w.dupeSavings.replace(/\D/g, '')) / 650000)} bottles of CK One with what you saved!
            </Text>
          </View>
        </Slide>

        {/* Slide 5 — Share card */}
        <Slide colors={[C.greenDark, '#0A1F15']}>
          <View style={styles.slideContent}>
            <Text style={styles.slideTag}>SHARE YOUR WRAPPED</Text>
            <View style={styles.shareCard}>
              <Text style={styles.shareCardTitle}>ESSENZA {w.year}</Text>
              <Text style={styles.shareCardName}>Scent Wrapped</Text>
              <View style={styles.shareStats}>
                <Text style={styles.shareStatLine}>{topNote?.emoji} Top note: {topNote?.label} ({w.topNotePercent}%)</Text>
                <Text style={styles.shareStatLine}>🔍 {w.totalExplored} fragrances explored</Text>
                <Text style={styles.shareStatLine}>💰 {w.dupeSavings} saved on dupes</Text>
                <Text style={styles.shareStatLine}>✨ Personality: {w.personalityTitle}</Text>
              </View>
              <Text style={styles.shareCardTag}>#EssenzaWrapped #{w.year}</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.shareBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Slide>
      </ScrollView>

      {/* Tap to advance */}
      <TouchableOpacity style={styles.tapZone} onPress={goNext}>
        <Text style={styles.tapHint}>
          {currentSlide < SLIDES - 1 ? 'tap to continue →' : 'tap to finish'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center' },

  backBtn: {
    position: 'absolute', top: 54, right: 20, zIndex: 20,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  progressRow: {
    flexDirection: 'row', gap: 6,
    paddingTop: 54, paddingBottom: 16, zIndex: 10,
    alignSelf: 'flex-start', paddingLeft: 20,
  },
  progressDot: {
    height: 3, flex: 1, maxWidth: 40,
    borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotActive: { backgroundColor: C.gold },

  slidesContainer: { alignItems: 'center' },

  slideContent: { flex: 1, justifyContent: 'center' },
  slideYear: { color: C.gold, fontSize: 13, fontWeight: '700', letterSpacing: 3, marginBottom: 8 },
  slideTag: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 16 },
  slideMainTitle: { color: '#fff', fontSize: 38, fontWeight: '900', lineHeight: 44, marginBottom: 16 },
  slideSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  statHighlight: { marginBottom: 16 },
  statBig: { color: C.gold, fontSize: 64, fontWeight: '900', lineHeight: 68 },
  statBigLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },

  slideTopEmoji: { fontSize: 72, marginBottom: 12 },
  slideTopBrand: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  slideTopName: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 10 },
  slideTopDesc: { color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  notesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  notePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 14,
  },
  notePillText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },

  dnaBar: { marginBottom: 20, gap: 12 },
  dnaBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dnaBarLabel: { color: '#fff', fontSize: 13, fontWeight: '600', width: 80 },
  dnaTrack: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
  dnaFill: { height: '100%', backgroundColor: C.gold, borderRadius: 4 },
  dnaBarPct: { color: C.gold, fontSize: 12, fontWeight: '700', width: 32, textAlign: 'right' },

  personalityCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  personalityTitle: { color: C.gold, fontSize: 20, fontWeight: '900', marginBottom: 8 },
  personalityDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 22 },

  slideSavingsAmount: { color: C.gold, fontSize: 52, fontWeight: '900', marginBottom: 4 },
  slideSavingsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 18, marginBottom: 24 },
  savingsStats: { flexDirection: 'row', marginBottom: 24, alignItems: 'center' },
  savingsStat: { flex: 1, alignItems: 'center' },
  savingsStatNum: { color: '#fff', fontSize: 36, fontWeight: '900' },
  savingsStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
  savingsDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  savingsInsight: { color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 24, fontStyle: 'italic' },

  shareCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: C.goldBorder,
    marginBottom: 20,
  },
  shareCardTitle: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  shareCardName: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 16 },
  shareStats: { gap: 8, marginBottom: 16 },
  shareStatLine: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  shareCardTag: { color: C.gold, fontSize: 12, fontWeight: '600' },
  shareBtn: {
    backgroundColor: C.gold, borderRadius: 30,
    paddingVertical: 16, alignItems: 'center',
  },
  shareBtnText: { color: C.greenDark, fontSize: 16, fontWeight: '800' },

  tapZone: {
    position: 'absolute', bottom: 32,
    alignItems: 'center',
  },
  tapHint: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
});
