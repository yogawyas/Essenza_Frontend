import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Animated,
} from 'react-native';
import { C } from '../theme/colors';
import { NOTES } from '../data/mockData';
import { GoldButton } from '../components/GoldButton';
import { Header } from '../components/Header';

const { width } = Dimensions.get('window');

const BubbleItem = ({ note, isSelected, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: isSelected ? 1 : 1.07, useNativeDriver: true, friction: 4 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress}>
      <Animated.View style={[
        styles.bubble,
        isSelected && styles.bubbleSelected,
        { transform: [{ scale }] },
      ]}>
        <Text style={styles.bubbleEmoji}>{note.emoji}</Text>
        <Text style={[styles.bubbleLabel, isSelected && styles.bubbleLabelSelected]}>
          {note.label}
        </Text>
        <Text style={[styles.bubbleDesc, isSelected && styles.bubbleDescSelected]}>
          {note.desc}
        </Text>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const OnboardingScreen = ({ navigation }) => {
  const [selectedNotes, setSelectedNotes] = useState([]);

  const toggleNote = (noteId) => {
    setSelectedNotes(prev =>
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  const handleFinish = () => {
    navigation.replace('MainTabs', { scentDNA: selectedNotes });
  };

  const remaining = Math.max(0, 3 - selectedNotes.length);

  return (
    <View style={styles.container}>
      <Header title="ESSENZA" subtitle="Build Your Scent DNA" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What scents do you love?</Text>
        <Text style={styles.subtitle}>
          {remaining > 0
            ? `Select ${remaining} more to personalize your Daily Mix`
            : `${selectedNotes.length} notes selected — your DNA is ready! ✨`}
        </Text>

        {/* Progress dots */}
        <View style={styles.progressRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i < selectedNotes.length && styles.progressDotActive]}
            />
          ))}
          {selectedNotes.length > 3 && (
            <View style={styles.progressExtra}>
              <Text style={styles.progressExtraText}>+{selectedNotes.length - 3}</Text>
            </View>
          )}
        </View>

        <View style={styles.bubbleGrid}>
          {NOTES.map((note) => (
            <BubbleItem
              key={note.id}
              note={note}
              isSelected={selectedNotes.includes(note.id)}
              onPress={() => toggleNote(note.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GoldButton onPress={handleFinish} disabled={selectedNotes.length < 3}>
          {selectedNotes.length >= 3 ? '✨  Discover My DNA' : `Select ${remaining} More`}
        </GoldButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },
  scrollContent: { paddingBottom: 120 },
  title: {
    fontSize: 28, fontWeight: '800', color: C.greenDark,
    marginTop: 30, paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 15, color: C.textMuted,
    marginTop: 8, paddingHorizontal: 24, marginBottom: 16,
    lineHeight: 22,
  },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, marginBottom: 24, gap: 8,
  },
  progressDot: {
    width: 28, height: 6, borderRadius: 3,
    backgroundColor: C.divider,
  },
  progressDotActive: {
    backgroundColor: C.gold,
  },
  progressExtra: {
    backgroundColor: C.greenFaint, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  progressExtraText: { color: C.green, fontSize: 11, fontWeight: '700' },
  bubbleGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, justifyContent: 'center',
  },
  bubble: {
    width: (width - 64) / 3,
    aspectRatio: 0.9,
    backgroundColor: C.white,
    borderRadius: 24,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bubbleSelected: {
    backgroundColor: C.greenFaint,
    borderColor: C.green,
  },
  bubbleEmoji: { fontSize: 30, marginBottom: 6 },
  bubbleLabel: {
    fontSize: 13, fontWeight: '700', color: C.greenDark, marginBottom: 2,
  },
  bubbleLabelSelected: { color: C.green },
  bubbleDesc: {
    fontSize: 10, color: C.textFaint, textAlign: 'center', lineHeight: 13,
  },
  bubbleDescSelected: { color: C.textMuted },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.green,
    justifyContent: 'center', alignItems: 'center',
  },
  checkText: { color: C.gold, fontSize: 10, fontWeight: '900' },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: C.offWhite,
    borderTopWidth: 1,
    borderColor: C.divider,
  },
});
