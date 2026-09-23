import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../theme/colors';

export const PerfumeCard = ({ perfume, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
    <View style={styles.cardVisual}>
      <Text style={styles.cardEmoji}>{perfume.emoji}</Text>
      {perfume.score && (
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{perfume.score}0% Match</Text>
        </View>
      )}
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.brandText}>{perfume.brand}</Text>
      <Text style={styles.nameText}>{perfume.name}</Text>
      <View style={styles.notesRow}>
        {perfume.notes.map(n => (
          <View key={n} style={styles.notePill}>
            <Text style={styles.notePillText}>{n}</Text>
          </View>
        ))}
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.cardBg,
    borderRadius: 24,
    marginHorizontal: 24,
    marginBottom: 20,
    flexDirection: 'row',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: C.divider,
  },
  cardVisual: {
    width: 80,
    height: 100,
    backgroundColor: C.offWhite,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardEmoji: {
    fontSize: 40,
  },
  matchBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: C.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.gold,
  },
  matchText: {
    color: C.gold,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  brandText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  nameText: {
    color: C.greenDark,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  notesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  notePill: {
    backgroundColor: C.greenFaint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notePillText: {
    color: C.green,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
