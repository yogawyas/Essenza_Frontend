import React, { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import {
  loadNotePyramid,
  offlineNotes,
  offlinePyramid,
} from '../domain/fragranceMedia';
import { getNoteArtwork } from '../domain/noteArtwork';
import { NoteGrid } from './NoteTiles';
import { s } from './theme';

const tiers = { top: 'Top Notes', heart: 'Heart Notes', base: 'Base Notes' };

export function FragranceNotes({ fragrance }) {
  const [pyramid, setPyramid] = useState(null);
  const [loading, setLoading] = useState(true);
  const fallback = offlineNotes(fragrance.id);
  const visiblePyramid = pyramid ?? offlinePyramid(fragrance.id);
  const visibleNotes = visiblePyramid
    ? Object.values(visiblePyramid).flat()
    : fallback;
  const credits = [
    ...new Set(
      visibleNotes.map(note => getNoteArtwork(note).credit).filter(Boolean),
    ),
  ];

  useEffect(() => {
    let active = true;
    loadNotePyramid(fragrance).then(result => {
      if (active) {
        setPyramid(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [fragrance]);

  return (
    <View style={{ gap: 10 }}>
      <Text style={s.h2}>Notes</Text>
      {visiblePyramid ? (
        <>
          {Object.entries(tiers).map(
            ([key, label]) =>
              visiblePyramid[key].length > 0 && (
                <View key={key} style={{ gap: 6 }}>
                  <Text style={s.h3}>{label}</Text>
                  <NoteGrid labels={visiblePyramid[key]} />
                </View>
              ),
          )}
          {pyramid && (
            <Text
              accessibilityRole="link"
              style={s.small}
              onPress={() =>
                Linking.openURL(
                  'https://www.scento.com/developers/perfume-api',
                ).catch(() => {})
              }
            >
              Data notes: Scento Perfume API
            </Text>
          )}
        </>
      ) : fallback.length > 0 ? (
        <NoteGrid labels={fallback} />
      ) : (
        <Text style={s.small}>
          {loading ? 'Memuat notes…' : 'Notes belum tersedia untuk varian ini.'}
        </Text>
      )}
      {credits.map(credit => (
        <Text
          key={credit.source}
          accessibilityRole="link"
          style={s.small}
          onPress={() => Linking.openURL(credit.source).catch(() => {})}
        >
          Foto: {credit.author} · {credit.license}
        </Text>
      ))}
    </View>
  );
}
