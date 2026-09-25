import React from 'react';
import { StatusBar } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { ResultScreen } from './screens/ResultScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { GuideScreen } from './screens/GuideScreen';
import { LabProvider } from './storage/LabProvider';
import { Icon } from './ui/Icon';
import { colors } from './ui/theme';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
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
function Workspace() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: tabIcons[route.name],
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
  return (
    <SafeAreaProvider>
      <LabProvider>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer theme={theme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Workspace" component={Workspace} />
            <Stack.Screen name="Result" component={ResultScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LabProvider>
    </SafeAreaProvider>
  );
}
