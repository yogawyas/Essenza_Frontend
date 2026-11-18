import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getNoteArtwork } from '../domain/noteArtwork';
import { Icon } from './components';
import { colors, s } from './theme';

export function NoteTile({ label, accord, selected, onPress }) {
  const { source } = getNoteArtwork(label, accord);
  const [failedSource, setFailedSource] = useState(null);
  const artwork = (
    <>
      <View style={styles.artwork}>
        {source && source !== failedSource ? (
          <Image
            source={source}
            style={styles.image}
            resizeMode="cover"
            onError={() => setFailedSource(source)}
            accessible={false}
          />
        ) : (
          <Icon name="drop" color={colors.muted} size={24} />
        )}
        {onPress && (
          <View style={styles.badge}>
            <Icon name={selected ? 'check' : 'plus'} size={14} />
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </>
  );
  return onPress ? (
    <Pressable
      style={styles.tile}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      {artwork}
    </Pressable>
  ) : (
    <View style={styles.tile}>{artwork}</View>
  );
}

export function NoteGrid({ labels }) {
  return (
    <View style={s.wrap}>
      {labels.map(label => (
        <NoteTile key={label} label={label} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { width: '22%', gap: 4 },
  artwork: {
    width: '100%',
    backgroundColor: colors.sage,
    borderRadius: 6,
    overflow: 'hidden',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  label: {
    textAlign: 'center',
    color: colors.green,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  badge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: '#FAF3E1',
    padding: 3,
    borderRadius: 3,
  },
});
