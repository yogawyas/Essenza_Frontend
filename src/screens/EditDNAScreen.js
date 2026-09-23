import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Animated,
} from 'react-native';
import { C } from '../theme/colors';
import { NOTES } from '../data/mockData';
import { GoldButton } from '../components/GoldButton';

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

export const EditDNAScreen = ({ route, navigation }) => {
  // Pre-fill with current DNA passed from HomeScreen via navigation state
  const currentDNA = route?.params?.currentDNA ?? [];
  const [selectedNotes, setSelectedNotes] = useState(currentDNA);

  const toggleNote = (noteId) => {
    setSelectedNotes(prev =>
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  const handleSave = () => {
    // Navigate back to MainTabs → Home with updated DNA
    // Must target MainTabs first since Home lives inside the Tab navigator
    navigation.navigate('MainTabs', {
      screen: 'Home',
      params: { scentDNA: selectedNotes },
    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const remaining = Math.max(0, 3 - selectedNotes.length);
  const hasChanges = JSON.stringify([...selectedNotes].sort()) !== JSON.stringify([...currentDNA].sort());

  return (
    <View style={styles.container}>
      {/* Custom header with Cancel */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Edit Scent DNA</Text>
          <Text style={styles.headerSubtitle}>Update your preferences</Text>
        </View>
        <View style={styles.cancelBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What scents do you love?</Text>
        <Text style={styles.subtitle}>
          {remaining > 0
            ? `Select ${remaining} more to save your new DNA`
            : `${selectedNotes.length} notes selected${hasChanges ? ' · unsaved changes' : ''}`}
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
        <GoldButton onPress={handleSave} disabled={selectedNotes.length < 3}>
          {selectedNotes.length >= 3 ? '✨  Save New DNA' : `Select ${remaining} More`}
        </GoldButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.offWhite },

  // Header
  header: {
    backgroundColor: C.greenDark,
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelBtn: {
    width: 64,
  },
  cancelText: {
    color: C.textFaint,
    fontSize: 15,
    fontWeight: '600',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: C.gold,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: C.textFaint,
    fontSize: 12,
    marginTop: 2,
  },

  scrollContent: { paddingBottom: 120 },
  title: {
    fontSize: 26, fontWeight: '800', color: C.greenDark,
    marginTop: 28, paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 14, color: C.textMuted,
    marginTop: 8, paddingHorizontal: 24, marginBottom: 16,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, marginBottom: 24, gap: 8,
  },
  progressDot: {
    width: 28, height: 6, borderRadius: 3,
    backgroundColor: C.divider,
  },
  progressDotActive: { backgroundColor: C.gold },
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
  bubbleLabel: { fontSize: 13, fontWeight: '700', color: C.greenDark, marginBottom: 2 },
  bubbleLabelSelected: { color: C.green },
  bubbleDesc: { fontSize: 10, color: C.textFaint, textAlign: 'center', lineHeight: 13 },
  bubbleDescSelected: { color: C.textMuted },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.green,
    justifyContent: 'center', alignItems: 'center',
  },
  checkText: { color: C.gold, fontSize: 10, fontWeight: '900' },
  footer: {
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40,
    backgroundColor: C.offWhite,
    borderTopWidth: 1, borderColor: C.divider,
  },
});
