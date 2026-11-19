import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getNoteArtwork } from '../domain/noteArtwork';
import { notePhotos } from '../domain/scrapedCatalog';
import { colors, s } from './theme';

const sections = [
  ['top', 'Top notes'],
  ['heart', 'Heart notes'],
  ['base', 'Base notes'],
  ['general', 'Other notes'],
];

export function FragranceNotes({ notes }) {
  const available = sections.filter(([stage]) => notes?.[stage]?.length);
  if (!available.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={s.h2}>Notes</Text>
      {available.map(([stage, label]) => (
        <View key={stage} style={styles.group}>
          {(stage !== 'general' || available.length > 1) && (
            <Text style={s.label}>{label}</Text>
          )}
          <View style={s.wrap}>
            {notes[stage].map(note => {
              const photo = getNoteArtwork(note.name).source || notePhotos[note.id];
              return (
                <View key={note.id} style={styles.note}>
                  {photo ? (
                    <Image
                      source={photo}
                      resizeMode="cover"
                      style={styles.photo}
                    />
                  ) : null}
                  <Text style={[s.small, styles.label]}>{note.name}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  group: { gap: 8 },
  note: {
    width: 76,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderColor: colors.line,
    borderWidth: StyleSheet.hairlineWidth,
  },
  photo: { width: '100%', height: 56 },
  label: { textAlign: 'center', paddingHorizontal: 4, paddingVertical: 6 },
});
