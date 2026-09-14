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
import { StudioScreen } from './screens/StudioScreen';
import { StudioEditorScreen } from './screens/StudioEditorScreen';
import { RecipeScreen } from './screens/RecipeScreen';
import { Button, Icon, IconName } from './ui/components';
import { colors } from './ui/theme';

const Root = createNativeStackNavigator<RootParams>();
const Feature = createNativeStackNavigator<RootParams>();
const Tabs = createBottomTabNavigator<TabParams, 'EssenzaTabs'>();
const tabIcons: Record<keyof TabParams, IconName> = {
  Today: 'today',
  Discover: 'search',
  Studio: 'studio',
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
const homes = {
  TodayHome: TodayScreen,
  DiscoverHome: DiscoverScreen,
  StudioHome: StudioScreen,
  ShelfHome: ShelfScreen,
};
function FeatureStack({ home }: { home: keyof typeof homes }) {
  return (
    <Feature.Navigator
      initialRouteName={home}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ivory },
      }}
    >
      <Feature.Screen name={home} component={homes[home]} />
      <Feature.Screen
        name="Fragrance"
        component={FragranceScreen}
        getId={({ params }) => params.id}
      />
      <Feature.Screen
        name="List"
        component={ListScreen}
        getId={({ params }) => params.id}
      />
      <Feature.Screen name="Scentlists" component={ScentlistsScreen} />
      <Feature.Screen
        name="Recipe"
        component={RecipeScreen}
        getId={({ params }) => params.id}
      />
      <Feature.Screen name="Journal" component={JournalScreen} />
    </Feature.Navigator>
  );
}
function TodayStack() {
  return <FeatureStack home="TodayHome" />;
}
function DiscoverStack() {
  return <FeatureStack home="DiscoverHome" />;
}
function StudioStack() {
  return <FeatureStack home="StudioHome" />;
}
function ShelfStack() {
  return <FeatureStack home="ShelfHome" />;
}

function HomeTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      id="EssenzaTabs"
      backBehavior="history"
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
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color }) => (
          <Icon name={tabIcons[route.name]} color={color} />
        ),
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tabs.Screen name="Today" component={TodayStack} />
      <Tabs.Screen name="Discover" component={DiscoverStack} />
      <Tabs.Screen name="Studio" component={StudioStack} />
      <Tabs.Screen
        name="Shelf"
        component={ShelfStack}
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
      <Root.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.ivory },
        }}
      >
        {state.onboarded ? (
          <Root.Group navigationKey="member">
            <Root.Screen name="Home" component={HomeTabs} />
            <Root.Group screenOptions={{ presentation: 'modal' }}>
              <Root.Screen name="EditList" component={EditListScreen} />
              <Root.Screen name="Wear" component={WearScreen} />
              <Root.Screen name="StudioEditor" component={StudioEditorScreen} />
              <Root.Screen name="Profile" component={ProfileScreen} />
            </Root.Group>
          </Root.Group>
        ) : (
          <Root.Screen
            name="Home"
            component={Welcome}
            navigationKey="welcome"
          />
        )}
      </Root.Navigator>
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
