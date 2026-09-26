import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { colors, sans } from '../ui/theme';

export function SplashScreen() {
  // ── Animated values ──────────────────────────────────────────────────────
  const iconOpacity  = useRef(new Animated.Value(0)).current;
  const iconScale    = useRef(new Animated.Value(0.82)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;
  const wordmarkOp   = useRef(new Animated.Value(0)).current;
  const wordmarkY    = useRef(new Animated.Value(16)).current;


  useEffect(() => {
    Animated.sequence([
      // 1. Ikon fade + scale (0 → 600ms)
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1, friction: 5, tension: 70, useNativeDriver: true,
        }),
      ]),
      // 2. Garis divider melebar (600 → 920ms)
      Animated.timing(dividerWidth, {
        toValue: 1, duration: 300, useNativeDriver: false,
      }),
      // 3. Wordmark muncul (920ms → 1280ms)
      Animated.parallel([
        Animated.timing(wordmarkOp, {
          toValue: 1, duration: 360, useNativeDriver: true,
        }),
        Animated.timing(wordmarkY, {
          toValue: 0, duration: 360, useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dividerInterp = dividerWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '55%'],
  });

  return (
    <View style={styles.screen} accessibilityLabel="Layar pembuka Essenza">

      {/* ── Logo ── */}
      <Animated.View
        style={[
          styles.iconWrapper,
          { opacity: iconOpacity, transform: [{ scale: iconScale }] },
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          source={require('../../assets/icon/Icon_Essenza.png')}
          resizeMode="contain"
          style={styles.appIcon}
        />
      </Animated.View>

      {/* ── Wordmark block ── */}
      <View style={styles.wordmarkBlock}>

        {/* Garis dekoratif kiri-kanan */}
        <View style={styles.dividerRow}>
          <Animated.View style={[styles.dividerLine, { width: dividerInterp }]} />
          <Animated.View style={[styles.dividerLine, { width: dividerInterp }]} />
        </View>

        <Animated.Text
          style={[
            styles.wordmark,
            { opacity: wordmarkOp, transform: [{ translateY: wordmarkY }] },
          ]}
        >
          ESSENZA
        </Animated.Text>



      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.splash,
    gap: 28,
  },

  // ── Icon ──────────────────────────────────────────────────────────────────
  iconWrapper: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 36,
    elevation: 20,
  },
  appIcon: {
    width: 210,
    height: 210,
    borderRadius: 50,
  },

  // ── Wordmark block ────────────────────────────────────────────────────────
  wordmarkBlock: {
    alignItems: 'center',
    gap: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.55,
  },
  wordmark: {
    fontFamily: sans,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 10,
    color: colors.gold,
  },

});
