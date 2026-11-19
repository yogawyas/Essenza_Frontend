import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fragranceById } from '../domain/catalog';
import { DesignIcon, designStyles } from './design';
import { figma } from './figmaAssets';
import { colors, s } from './theme';

export const collectionCovers = [
  { id: 'campus', label: 'Workspace', source: figma.coverCampus },
  { id: 'notes', label: 'Journal', source: figma.coverNotes },
  { id: 'rotation', label: 'Forest', source: figma.coverRotation },
];

const covers = {
  'editorial-campus': figma.coverCampus,
  'editorial-afterhours': figma.coverRotation,
};

export function CollectionArtwork({ list, style }) {
  const source =
    collectionCovers.find(cover => cover.id === list.cover)?.source ||
    covers[list.id] ||
    list.items
      .map(item => fragranceById(item.fragranceId)?.photo)
      .find(Boolean);
  return (
    <View style={[styles.artwork, { backgroundColor: list.color }, style]}>
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <DesignIcon name="brand" />
        </View>
      )}
    </View>
  );
}

export function CollectionRow({ list, subtitle, onPress, trailing }) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={styles.link}
      >
        <CollectionArtwork list={list} />
        <View style={s.flex}>
          <Text numberOfLines={1} style={designStyles.strong}>
            {list.title}
          </Text>
          <Text numberOfLines={2} style={designStyles.caption}>
            {subtitle || list.items.length + ' perfumes · Collection'}
          </Text>
        </View>
      </Pressable>
      {trailing || <DesignIcon name="chevron" />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 64, gap: 8 },
  link: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  artwork: { width: 56, height: 56, borderRadius: 5, overflow: 'hidden' },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.sage,
  },
  image: { width: '100%', height: '100%' },
});
