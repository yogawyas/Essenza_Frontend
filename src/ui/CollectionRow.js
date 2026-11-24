import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fragranceById } from '../domain/catalog';
import { DesignIcon, designStyles } from './design';
import { figma } from './figmaAssets';
import { s } from './theme';

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
  const gallerySource = list.cover?.startsWith('data:image/')
    ? { uri: list.cover }
    : null;
  const source =
    gallerySource ||
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
        <Image
          source={figma.emptyCover}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

export function CollectionRow({
  list,
  subtitle,
  onPress,
  trailing,
  compact,
  disabled,
}) {
  return (
    <View style={[styles.row, compact && styles.compactRow]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        accessibilityState={{ disabled: Boolean(disabled) }}
        style={styles.link}
      >
        <CollectionArtwork
          list={list}
          style={compact && styles.compactArtwork}
        />
        <View style={[s.flex, styles.copy]}>
          <Text
            numberOfLines={1}
            style={[
              designStyles.strong,
              styles.title,
              compact && styles.compactTitle,
            ]}
          >
            {list.title}
          </Text>
          <Text
            numberOfLines={2}
            style={[
              designStyles.caption,
              styles.subtitle,
              compact && styles.compactCaption,
            ]}
          >
            {subtitle || list.items.length + ' perfumes · Collection'}
          </Text>
        </View>
        {!trailing ? (
          <DesignIcon name="chevron" style={styles.chevron} />
        ) : null}
      </Pressable>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: 8 },
  link: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  copy: { paddingTop: 1 },
  title: { lineHeight: 20 },
  subtitle: { color: '#687D6D', lineHeight: 16 },
  chevron: { alignSelf: 'center' },
  artwork: { width: 56, height: 56, borderRadius: 5, overflow: 'hidden' },
  compactRow: { minHeight: 35 },
  compactArtwork: { width: 31, height: 31 },
  compactTitle: { fontSize: 13, lineHeight: 16 },
  compactCaption: { color: '#8BA097', fontSize: 10, lineHeight: 13 },
  image: { width: '100%', height: '100%' },
});
