import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignIcon } from '../ui/design';
import { figma } from '../ui/figmaAssets';
import { colors, sans, serif } from '../ui/theme';
export function SplashScreen({
  onContinue,
  progress: sharedProgress,
  disabled = false,
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(
    width / 360,
    (height - insets.top - insets.bottom) / 800,
  );
  const ownProgress = useRef(new Animated.Value(0)).current;
  const progress = sharedProgress ?? ownProgress;
  const dragStart = useRef(0);
  const translateY = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height],
        extrapolate: 'clamp',
      }),
    [height, progress],
  );
  const continuing = useRef(false);
  const mounted = useRef(true);
  const continueRef = useRef(onContinue);
  continueRef.current = onContinue;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      progress.stopAnimation();
    };
  }, [progress]);

  const resetPosition = useCallback(() => {
    Animated.spring(progress, {
      toValue: 0,
      stiffness: 220,
      damping: 28,
      mass: 1,
      overshootClamping: true,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const continueToLogin = useCallback(() => {
    if (continuing.current || disabled) {
      return;
    }
    continuing.current = true;
    Animated.timing(progress, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async ({ finished }) => {
      if (!finished || !mounted.current) {
        continuing.current = false;
        return;
      }
      let completed = false;
      try {
        completed = (await continueRef.current()) !== false;
      } catch {
        completed = false;
      } finally {
        if (mounted.current && !completed) {
          continuing.current = false;
          resetPosition();
        }
      }
    });
  }, [disabled, progress, resetPosition]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        // y0 is only populated after responder grant. Checking it here rejects
        // every swipe. Direction and distance are available before grant.
        onMoveShouldSetPanResponder: (_, gesture) =>
          !disabled &&
          !continuing.current &&
          gesture.numberActiveTouches === 1 &&
          gesture.dy < -6 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.2,
        onPanResponderGrant: () =>
          progress.stopAnimation(value => {
            dragStart.current = value;
          }),
        onPanResponderMove: (_, gesture) => {
          if (!continuing.current) {
            progress.setValue(
              Math.max(0, Math.min(1, dragStart.current - gesture.dy / height)),
            );
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -50 || (gesture.dy < -18 && gesture.vy < -0.35)) {
            continueToLogin();
          } else {
            resetPosition();
          }
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: resetPosition,
      }),
    [continueToLogin, disabled, height, progress, resetPosition],
  );
  return (
    <View style={styles.screen} {...responder.panHandlers}>
      <Animated.View
        testID="intro-swipe"
        accessible
        accessibilityLabel="Essenza. Your Scent. Your Story. Swipe up to sign in."
        accessibilityActions={[
          { name: 'increment', label: 'Continue to sign in' },
        ]}
        onAccessibilityAction={continueToLogin}
        style={[
          styles.artworkContainer,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateY }],
          },
        ]}
      >
        <View
          style={[styles.canvas, { width: 360 * scale, height: 800 * scale }]}
        >
          <Image
            source={figma.splashArtwork}
            resizeMode="contain"
            style={[
              styles.artwork,
              {
                width: 627 * scale,
                height: 499 * scale,
                left: -128 * scale,
                top: 62 * scale,
              },
            ]}
          />
          <View style={[styles.logo, { top: 28 * scale }]}>
            <DesignIcon name="splashLogoTop" />
            <DesignIcon name="splashLogoBottom" />
            <Text style={styles.brand}>Essenza</Text>
          </View>
          <View
            style={[
              styles.copy,
              { top: 544 * scale, paddingHorizontal: 18 * scale },
            ]}
          >
            <Text
              style={[
                styles.title,
                { fontSize: 48 * scale, lineHeight: 50 * scale },
              ]}
            >
              Your Scent.{'\n'}Your Story.
            </Text>
            <Text style={[styles.subtitle, { fontSize: 14 * scale }]}>
              Collect your favorite scents. Tell your story in a scentlist. Find
              a fragrance for every day.
            </Text>
          </View>
          <DesignIcon
            name="splashArrow"
            style={[styles.arrow, { bottom: 23 * scale }]}
          />
        </View>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  artworkContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ivory,
  },
  canvas: { overflow: 'hidden' },
  artwork: { position: 'absolute' },
  logo: { position: 'absolute', alignSelf: 'center', alignItems: 'center' },
  brand: { fontFamily: sans, color: colors.green, fontSize: 20 },
  copy: { position: 'absolute', width: '100%', gap: 6 },
  title: { fontFamily: serif, color: colors.green },
  subtitle: { fontFamily: sans, color: colors.green },
  arrow: { position: 'absolute', alignSelf: 'center' },
});
