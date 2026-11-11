import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { colors, sans } from '../ui/theme';
export function LaunchSplashScreen({ onComplete, canFinish = true }) {
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.82)).current;
  const dividerScale = useRef(new Animated.Value(0)).current;
  const wordmarkOp = useRef(new Animated.Value(0)).current;
  const wordmarkY = useRef(new Animated.Value(16)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const [entranceFinished, setEntranceFinished] = useState(false);
  useEffect(() => {
    setEntranceFinished(false);
    iconOpacity.setValue(0);
    iconScale.setValue(0.82);
    dividerScale.setValue(0);
    wordmarkOp.setValue(0);
    wordmarkY.setValue(16);
    screenOpacity.setValue(1);
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 5,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(dividerScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(wordmarkOp, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkY, {
          toValue: 0,
          duration: 360,
          useNativeDriver: true,
        }),
      ]),
    ]);
    animation.start(({ finished }) => {
      if (finished) {
        setEntranceFinished(true);
      }
    });
    return () => animation.stop();
  }, [
    dividerScale,
    iconOpacity,
    iconScale,
    screenOpacity,
    wordmarkOp,
    wordmarkY,
  ]);

  useEffect(() => {
    if (!entranceFinished || !canFinish) {
      return;
    }
    const fade = Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 300,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });
    fade.start(({ finished }) => {
      if (finished) {
        onComplete();
      }
    });
    return () => fade.stop();
  }, [canFinish, entranceFinished, onComplete, screenOpacity]);
  return (
    <Animated.View
      style={[styles.screen, { opacity: screenOpacity }]}
      accessibilityLabel="Layar pembuka Essenza"
    >
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
      <View style={styles.wordmarkBlock}>
        <View style={styles.dividerRow}>
          <Animated.View
            style={[
              styles.dividerLine,
              { transform: [{ scaleX: dividerScale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.dividerLine,
              { transform: [{ scaleX: dividerScale }] },
            ]}
          />
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
    </Animated.View>
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
  iconWrapper: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 36,
    elevation: 20,
  },
  appIcon: { width: 210, height: 210, borderRadius: 50 },
  wordmarkBlock: { alignItems: 'center', gap: 10 },
  dividerRow: {
    width: 180,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    alignItems: 'center',
  },
  dividerLine: {
    width: 99,
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
