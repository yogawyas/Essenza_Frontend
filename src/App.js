import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { ResultScreen } from './screens/ResultScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { GuideScreen } from './screens/GuideScreen';
import { SplashScreen } from './screens/SplashScreen';
import { LabProvider } from './storage/LabProvider';
import { Icon } from './ui/Icon';
import { colors, sans } from './ui/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export const SPLASH_DURATION_MS = 1500;

const icons = {
  Analysis: 'flask',
  History: 'history',
  Guide: 'book',
};
const tabIcons = Object.fromEntries(
  Object.entries(icons).map(([route, name]) => [
    route,
    ({ color, size }) => <Icon name={name} color={color} size={size} />,
  ]),
);
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.green,
    background: colors.background,
    card: colors.paper,
    text: colors.ink,
    border: colors.line,
  },
};

// Komponen tombol tab kustom: pill hijau + emas saat aktif
function TabButton({ children, onPress, onLongPress, accessibilityState }) {
  const focused = accessibilityState?.selected;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[tabStyles.btn, focused && tabStyles.btnActive]}
      android_ripple={null}
    >
      <View style={tabStyles.inner}>{children}</View>
    </Pressable>
  );
}
const tabStyles = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 6,
  },
  btnActive: {
    backgroundColor: colors.ink, // dark green #192F24
  },
  inner: { alignItems: 'center', gap: 3 },
});

function Workspace() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.gold,   // emas saat aktif
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontFamily: sans,
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: tabIcons[route.name],
        tabBarButton: (props) => <TabButton {...props} />,
      })}
    >
      <Tab.Screen name="Analysis" options={{ title: 'Analisis' }}>
        {() => <AnalysisScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Riwayat' }}
      />
      <Tab.Screen
        name="Guide"
        component={GuideScreen}
        options={{ title: 'Panduan' }}
      />
    </Tab.Navigator>
  );
}
export default function App() {
  // true  = splash masih tampil di atas (sebelum & selama animasi keluar)
  const [splashVisible, setSplashVisible] = useState(true);
  // status bar mengikuti layer yang sedang aktif
  const [isDark, setIsDark] = useState(false);

  const splashOpacity = useRef(new Animated.Value(1)).current;
  const homeOpacity   = useRef(new Animated.Value(0)).current;
  const homeSlideY    = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDark(true); // ganti status bar lebih awal
      Animated.parallel([
        // Splash fade out
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
        // Home fade in + slide up (mulai 80ms setelah splash mulai fade)
        Animated.sequence([
          Animated.delay(80),
          Animated.parallel([
            Animated.timing(homeOpacity, {
              toValue: 1,
              duration: 480,
              useNativeDriver: true,
            }),
            Animated.timing(homeSlideY, {
              toValue: 0,
              duration: 480,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => setSplashVisible(false)); // unmount splash setelah selesai
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaProvider>
      <LabProvider>
        <StatusBar
          barStyle={isDark ? 'dark-content' : 'light-content'}
          backgroundColor={isDark ? colors.background : colors.splash}
        />

        {/* ── Home (selalu di-render, di bawah splash) ── */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: homeOpacity, transform: [{ translateY: homeSlideY }] },
          ]}
        >
          <NavigationContainer theme={theme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Workspace" component={Workspace} />
              <Stack.Screen name="Result" component={ResultScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </Animated.View>

        {/* ── Splash (di atas, fade out lalu unmount) ── */}
        {splashVisible && (
          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: splashOpacity }]}
          >
            <SplashScreen />
          </Animated.View>
        )}
      </LabProvider>
    </SafeAreaProvider>
  );
}
