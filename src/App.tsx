import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AppProvider, useApp } from './storage/AppProvider';
import { RootParams, TabParams } from './navigation/types';
import { TodayScreen } from './screens/TodayScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { ShelfScreen } from './screens/ShelfScreen';
import { ScentlistsScreen } from './screens/ScentlistsScreen';
import { FragranceScreen } from './screens/FragranceScreen';
import { ListScreen } from './screens/ListScreen';
import { EditListScreen } from './screens/EditListScreen';
import { WearScreen } from './screens/WearScreen';
import { JournalScreen } from './screens/JournalScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { Button, Icon, IconName } from './ui/components';
import { colors } from './ui/theme';

const Stack = createNativeStackNavigator<RootParams>();
const Tabs = createBottomTabNavigator<TabParams>();
const tabIcons: Record<keyof TabParams, IconName> = {
  Today: 'today',
  Discover: 'search',
  Scentlists: 'lists',
  Shelf: 'shelf',
};
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.green,
    background: colors.ivory,
    card: colors.ivory,
    text: colors.ink,
    border: colors.line,
  },
};
function HomeTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.ivory,
          borderTopColor: colors.line,
          height: 65 + insets.bottom,
          paddingTop: 7,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ color }) => (
          <Icon name={tabIcons[route.name]} color={color} />
        ),
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tabs.Screen name="Today" component={TodayScreen} />
      <Tabs.Screen name="Discover" component={DiscoverScreen} />
      <Tabs.Screen name="Scentlists" component={ScentlistsScreen} />
      <Tabs.Screen
        name="Shelf"
        component={ShelfScreen}
        options={{ title: 'My Shelf' }}
      />
    </Tabs.Navigator>
  );
}
function Welcome() {
  return <ProfileScreen onboarding />;
}
function Navigation() {
  const { state } = useApp();
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.ivory },
          animation: 'slide_from_right',
        }}
      >
        {state.onboarded ? (
          <Stack.Group navigationKey="member">
            <Stack.Screen name="Home" component={HomeTabs} />
            <Stack.Screen name="Fragrance" component={FragranceScreen} />
            <Stack.Screen name="List" component={ListScreen} />
            <Stack.Screen name="EditList" component={EditListScreen} />
            <Stack.Screen name="Wear" component={WearScreen} />
            <Stack.Screen name="Journal" component={JournalScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Group>
        ) : (
          <Stack.Screen
            name="Home"
            component={Welcome}
            navigationKey="welcome"
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: 24,
          gap: 20,
          backgroundColor: colors.ivory,
        }}
      >
        <Text style={{ color: colors.ink, fontSize: 20 }}>
          Ada kendala membuka layar.
        </Text>
        <Text style={{ color: colors.muted }}>
          Data yang sudah tersimpan tetap ada.
        </Text>
        <Button
          label="Coba buka lagi"
          onPress={() => this.setState({ failed: false })}
        />
      </View>
    ) : (
      this.props.children
    );
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ErrorBoundary>
        <AppProvider>
          <Navigation />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
