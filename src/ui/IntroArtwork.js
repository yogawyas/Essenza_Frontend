import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { DesignIcon } from './design';
import { figma } from './figmaAssets';

// Coordinates are relative to the 360 × 800 intro frame.
export function IntroArtwork() {
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
    >
      <DesignIcon name="introShapeLeft" style={styles.shapeLeft} />
      <DesignIcon name="introShapeBottom" style={styles.shapeBottom} />
      <DesignIcon name="introShapeRight" style={styles.shapeRight} />
      <View style={styles.vanillaShadowClip}>
        <Image source={figma.introVanillaShadow} style={styles.vanillaShadow} />
      </View>
      <Image source={figma.introVanilla} style={styles.vanilla} />
      <View style={styles.bottleShadowClip}>
        <Image source={figma.introBottleShadow} style={styles.bottleShadow} />
      </View>
      <Image source={figma.introBottle} style={styles.bottle} />
    </View>
  );
}

const styles = StyleSheet.create({
  shapeLeft: {
    position: 'absolute',
    left: -79,
    top: 173,
    transform: [{ rotate: '23.82deg' }],
  },
  shapeBottom: {
    position: 'absolute',
    left: 73,
    top: 434,
    transform: [{ rotate: '-3.64deg' }],
  },
  shapeRight: {
    position: 'absolute',
    left: 252,
    top: 91,
    transform: [{ rotate: '-70.75deg' }],
  },
  vanillaShadowClip: {
    position: 'absolute',
    left: -39,
    top: 295,
    width: 230,
    height: 185,
    overflow: 'hidden',
  },
  vanillaShadow: {
    position: 'absolute',
    left: 1.91,
    top: 12.91,
    width: 214.756,
    height: 214.756,
    tintColor: '#000000',
    opacity: 0.35,
    transform: [{ rotate: '24.55deg' }],
  },
  vanilla: {
    position: 'absolute',
    left: -25,
    top: 299,
    width: 214.756,
    height: 214.756,
    transform: [{ rotate: '24.55deg' }],
  },
  bottleShadowClip: {
    position: 'absolute',
    left: 122.6,
    top: 133.08,
    width: 286.604,
    height: 383.38,
    overflow: 'hidden',
  },
  bottleShadow: {
    position: 'absolute',
    left: -8.964,
    top: -2.45,
    width: 348.736,
    height: 348.736,
    tintColor: '#000000',
    opacity: 0.32,
    transform: [{ rotate: '-166.17deg' }, { scaleY: -1 }],
  },
  bottle: {
    position: 'absolute',
    left: 84.367,
    top: 101.367,
    width: 374.769,
    height: 374.769,
    transform: [{ rotate: '-166.17deg' }, { scaleY: -1 }],
  },
});
