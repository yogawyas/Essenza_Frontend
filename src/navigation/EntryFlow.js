import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  Keyboard,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { AuthScreen } from '../screens/AuthScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { useApp } from '../storage/AppProvider';
import { AuthRepository } from '../storage/auth';

export function EntryFlow({ children, onReady }) {
  const { state, dispatch } = useApp();
  const { width, height } = useWindowDimensions();
  const repository = useRef(new AuthRepository()).current;
  const [screen, setScreen] = useState('loading');
  const [transitioning, setTransitioning] = useState(false);
  const [homeReady, setHomeReady] = useState(false);
  const [session, setSession] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const pendingRegistration = useRef(null);
  const introAvailable = useRef(false);
  const returningToIntro = useRef(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  const readyReported = useRef(false);
  const lastAuthMode = useRef('login');
  const introProgress = useRef(new Animated.Value(0)).current;
  const pageProgress = useRef(new Animated.Value(0)).current;
  const authOpacity = useRef(new Animated.Value(1)).current;

  // Both screens share progress: login follows the finger from one screen below.
  const loginY = useMemo(
    () =>
      introProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [height, 0],
        extrapolate: 'clamp',
      }),
    [height, introProgress],
  );
  const loginX = useMemo(
    () =>
      pageProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -width],
        extrapolate: 'clamp',
      }),
    [pageProgress, width],
  );
  const registerX = useMemo(
    () =>
      pageProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0],
        extrapolate: 'clamp',
      }),
    [pageProgress, width],
  );

  useEffect(() => {
    let active = true;
    repository
      .load()
      .then(({ session: restoredSession }) => {
        if (!active) {
          return;
        }
        introAvailable.current = !restoredSession;
        introProgress.setValue(restoredSession ? 1 : 0);
        pageProgress.setValue(0);
        authOpacity.setValue(1);
        locked.current = false;
        setTransitioning(false);
        setSession(restoredSession);
        setHomeReady(Boolean(restoredSession));
        // Swiping the design once is not a completed login. Keep both splash
        // screens on startup until there is an actual saved session.
        setScreen(restoredSession ? 'home' : 'splash');
      })
      .catch(() => {
        if (active) {
          introAvailable.current = true;
          introProgress.setValue(0);
          pageProgress.setValue(0);
          authOpacity.setValue(1);
          locked.current = false;
          setTransitioning(false);
          setScreen('splash');
        }
      });
    return () => {
      active = false;
    };
  }, [authOpacity, introProgress, pageProgress, repository]);

  const reportReady = useCallback(() => {
    if (screen !== 'loading' && !readyReported.current) {
      readyReported.current = true;
      onReady?.();
    }
  }, [onReady, screen]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      introProgress.stopAnimation();
      pageProgress.stopAnimation();
      authOpacity.stopAnimation();
    };
  }, [authOpacity, introProgress, pageProgress]);

  const unlock = useCallback(() => {
    locked.current = false;
    if (mounted.current) {
      setTransitioning(false);
    }
  }, []);

  const changePage = useCallback(
    mode => {
      if (locked.current || screen === mode) {
        return;
      }
      locked.current = true;
      setTransitioning(true);
      Keyboard.dismiss();
      Animated.timing(pageProgress, {
        toValue: mode === 'register' ? 1 : 0,
        duration: 340,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!mounted.current) {
          return;
        }
        if (finished) {
          lastAuthMode.current = mode;
          setScreen(mode);
        }
        unlock();
      });
    },
    [pageProgress, screen, unlock],
  );

  const back = useCallback(() => {
    if (locked.current) {
      return;
    }
    if (screen === 'register') {
      changePage('login');
    } else if (screen === 'login' && introAvailable.current) {
      locked.current = true;
      returningToIntro.current = true;
      setTransitioning(true);
      Keyboard.dismiss();
      // Mount splash at progress 1 before starting its return animation.
      setScreen('splash');
    } else {
      BackHandler.exitApp();
    }
  }, [changePage, screen]);

  useEffect(() => {
    if (screen !== 'splash' || !returningToIntro.current) {
      return;
    }
    returningToIntro.current = false;
    Animated.timing(introProgress, {
      toValue: 0,
      duration: 380,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(unlock);
  }, [introProgress, screen, unlock]);

  useEffect(() => {
    if (screen !== 'home-transition') {
      return;
    }
    // Home stays mounted after the fade, so its navigator is not restarted.
    Animated.timing(authOpacity, {
      toValue: 0,
      duration: 280,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (mounted.current) {
        if (finished) {
          setScreen('home');
        }
        unlock();
      }
    });
  }, [authOpacity, screen, unlock]);

  useEffect(() => {
    if (screen === 'home' || screen === 'loading') {
      return;
    }
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (locked.current) {
        return true;
      }
      if (
        screen === 'register' ||
        (screen === 'login' && introAvailable.current)
      ) {
        back();
        return true;
      }
      return false;
    });
    return () => listener.remove();
  }, [back, screen]);

  const finishIntro = async () => {
    try {
      await repository.finishIntro();
      introProgress.setValue(1);
      setScreen('login');
      return true;
    } catch {
      Alert.alert('Belum tersimpan', 'Coba geser lagi untuk membuka login.');
      return false;
    }
  };

  const submit = async (mode, { name, email, password, confirmation }) => {
    if (locked.current) {
      return;
    }
    if (mode === 'register') {
      const registered = repository.register(
        name,
        email,
        password,
        confirmation,
      );
      pendingRegistration.current = { session: registered, password };
      setRegisteredEmail(registered.email);
      changePage('login');
      return;
    }
    const registration = pendingRegistration.current;
    const signedIn =
      registration?.session.email === email.trim().toLowerCase() &&
      registration.password === password
        ? registration.session
        : repository.signIn(email, password);
    locked.current = true;
    setTransitioning(true);
    Keyboard.dismiss();
    try {
      const saved = await dispatch({
        type: 'profile',
        profile: {
          ...state.profile,
          name:
            signedIn === registration?.session
              ? signedIn.name
              : state.profile.name || signedIn.name,
        },
        onboard: Boolean(state.onboarded),
      });
      if (!saved) {
        unlock();
        return;
      }
      await repository.saveSession(signedIn);
      if (mounted.current) {
        lastAuthMode.current = mode;
        pendingRegistration.current = null;
        setSession(signedIn);
        setHomeReady(true);
        setScreen('home-transition');
      }
    } catch (error) {
      unlock();
      throw error;
    }
  };

  const signOut = async (reset = false) => {
    if (locked.current) return;
    locked.current = true;
    try {
      if (reset && !(await dispatch({ type: 'reset' }))) return;
      await repository.clearSession();
      pendingRegistration.current = null;
      setRegisteredEmail('');
      setSession(null);
      introAvailable.current = false;
      introProgress.setValue(1);
      pageProgress.setValue(0);
      authOpacity.setValue(1);
      lastAuthMode.current = 'login';
      setHomeReady(false);
      setScreen('login');
    } catch {
      Alert.alert('Belum bisa keluar', 'Coba lagi.');
    } finally {
      unlock();
    }
  };

  const loginActive = screen === 'login' && !transitioning;
  const registerActive = screen === 'register' && !transitioning;
  const movingAuthPages =
    transitioning && (screen === 'login' || screen === 'register');
  const restingAuthMode =
    screen === 'home-transition' ? lastAuthMode.current : screen;
  // At rest, use actual screen positions rather than a retained native animated
  // value. Only moving screens need interpolations, including during Fast Refresh.
  const restingLoginX = restingAuthMode === 'register' ? -width : 0;
  const restingRegisterX = restingAuthMode === 'register' ? 0 : width;
  return (
    <View style={styles.screen}>
      <StatusBar hidden={screen !== 'home'} barStyle="dark-content" />
      {homeReady && (
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents={screen === 'home' ? 'auto' : 'none'}
          onLayout={reportReady}
        >
          {typeof children === 'function'
            ? children({ session, signOut })
            : children}
        </View>
      )}
      {screen !== 'home' && screen !== 'loading' && (
        <Animated.View
          testID="auth-transition-layer"
          style={[
            StyleSheet.absoluteFill,
            { opacity: screen === 'home-transition' ? authOpacity : 1 },
          ]}
          pointerEvents={transitioning ? 'none' : 'auto'}
        >
          <Animated.View
            testID="auth-vertical-page"
            style={[
              StyleSheet.absoluteFill,
              { transform: [{ translateY: screen === 'splash' ? loginY : 0 }] },
            ]}
          >
            <Animated.View
              testID="auth-login-page"
              style={[
                styles.authPage,
                {
                  display:
                    movingAuthPages || restingAuthMode !== 'register'
                      ? 'flex'
                      : 'none',
                  transform: [
                    { translateX: movingAuthPages ? loginX : restingLoginX },
                  ],
                },
              ]}
              onLayout={loginActive ? reportReady : undefined}
              pointerEvents={loginActive ? 'auto' : 'none'}
              accessibilityElementsHidden={!loginActive}
              importantForAccessibility={
                loginActive ? 'auto' : 'no-hide-descendants'
              }
            >
              <AuthScreen
                mode="login"
                registrationSuccess={registeredEmail}
                onBack={back}
                onSwitchMode={() => changePage('register')}
                onSubmit={fields => submit('login', fields)}
              />
            </Animated.View>
            <Animated.View
              testID="auth-register-page"
              style={[
                styles.authPage,
                {
                  display:
                    movingAuthPages || restingAuthMode === 'register'
                      ? 'flex'
                      : 'none',
                  transform: [
                    {
                      translateX: movingAuthPages
                        ? registerX
                        : restingRegisterX,
                    },
                  ],
                },
              ]}
              onLayout={registerActive ? reportReady : undefined}
              pointerEvents={registerActive ? 'auto' : 'none'}
              accessibilityElementsHidden={!registerActive}
              importantForAccessibility={
                registerActive ? 'auto' : 'no-hide-descendants'
              }
            >
              <AuthScreen
                mode="register"
                onBack={back}
                onSwitchMode={() => changePage('login')}
                onSubmit={fields => submit('register', fields)}
              />
            </Animated.View>
          </Animated.View>
          {screen === 'splash' && (
            <View
              style={StyleSheet.absoluteFill}
              pointerEvents={transitioning ? 'none' : 'auto'}
              onLayout={reportReady}
            >
              <SplashScreen
                onContinue={finishIntro}
                progress={introProgress}
                disabled={transitioning}
              />
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden', backgroundColor: '#FAF3E0' },
  authPage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
  },
});
