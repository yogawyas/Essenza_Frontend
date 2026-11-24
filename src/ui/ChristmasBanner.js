import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { DesignAction } from './design';
import { figma } from './figmaAssets';
import { colors, serif } from './theme';

export function ChristmasBanner({ date, onExplore }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || date.getMonth() !== 11 || date.getDate() > 25) {
    return null;
  }
  return (
    <View style={styles.banner}>
      <Image
        source={figma.christmasCover}
        style={styles.image}
        resizeMode="stretch"
      />
      <Pressable
        accessibilityRole="button"
        onPress={onExplore}
        style={styles.link}
      >
        <Text style={styles.copy}>
          Christmas is just right around the corner, check out some perfume to
          celebrate!
        </Text>
      </Pressable>
      <DesignAction
        name="christmasClose"
        label="Close Christmas banner"
        onPress={() => setDismissed(true)}
        style={styles.close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 61,
    borderRadius: 11,
    backgroundColor: colors.green,
    overflow: 'hidden',
    elevation: 4,
    justifyContent: 'center',
  },
  image: {
    position: 'absolute',
    width: '114.32%',
    height: 250,
    left: '-7.31%',
    top: -80,
  },
  link: {
    minHeight: 61,
    paddingVertical: 4,
    paddingHorizontal: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    maxWidth: 190,
    color: colors.white,
    textAlign: 'center',
    fontFamily: serif,
    fontSize: 14,
    lineHeight: 14,
  },
  close: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 36,
    minHeight: 36,
  },
});
