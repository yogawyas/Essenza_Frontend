import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignArt } from '../ui/DesignArt';
export function SplashScreen({
  onContinue,
  progress: sharedProgress,
  disabled = false,
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
        accessibilityLabel="Essenza. Your Scent. Your Story. Geser dari bawah ke atas untuk masuk."
        accessibilityActions={[{ name: 'increment', label: 'Lanjut ke login' }]}
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
        <DesignArt name="splash" width="100%" height="100%" />
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  artworkContainer: { flex: 1, backgroundColor: '#FAF3E1' },
});
