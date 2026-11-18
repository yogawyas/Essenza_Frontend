import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AppProvider, useApp } from './storage/AppProvider';
import { TodayScreen } from './screens/TodayScreen';
import { CatalogSearchScreen } from './screens/CatalogSearchScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MemberProfileScreen } from './screens/MemberProfileScreen';
import { MyShelfCollections } from './screens/MyShelfCollectionsScreen';
import { PreferencesScreen } from './screens/PreferencesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ShelfScreen } from './screens/ShelfScreen';
import { ScentlistsScreen } from './screens/ScentlistsScreen';
import { FragranceDetailScreen } from './screens/FragranceDetailScreen';
import { ListScreen } from './screens/ListScreen';
import { EditListScreen } from './screens/EditListScreen';
import { WearScreen } from './screens/WearScreen';
import { JournalScreen } from './screens/JournalScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { StudioScreen } from './screens/StudioScreen';
import { StudioEditorScreen } from './screens/StudioEditorScreen';
import { RecipeScreen } from './screens/RecipeScreen';
import { Button, Icon } from './ui/components';
import { colors } from './ui/theme';
import { EntryFlow } from './navigation/EntryFlow';
import { LaunchSplashScreen } from './screens/LaunchSplashScreen';
const Root = createNativeStackNavigator();
const Feature = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const tabIcons = {
  Today: 'home',
  Discover: 'search',
  Studio: 'studio',
  Shelf: 'layers',
  ProfileTab: 'user',
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
function ShelfHub(props) {
  const section = props.route.params?.section;
  const [showCollections, setShowCollections] = useState(
    !section || section === 'lists',
  );
  useEffect(() => {
    if (section) setShowCollections(section === 'lists');
  }, [section]);
  return showCollections ? (
    <MyShelfCollections {...props} />
  ) : (
    <ShelfScreen {...props} />
  );
}

const homes = {
  TodayHome: HomeScreen,
  DiscoverHome: CatalogSearchScreen,
  StudioHome: StudioScreen,
  ShelfHome: ShelfHub,
  ProfileHome: MemberProfileScreen,
};
function FeatureStack({ home }) {
  return (
    <Feature.Navigator
      initialRouteName={home}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.ivory },
      }}
    >
      <Feature.Screen name={home} component={homes[home]} />
      <Feature.Screen
        name="Fragrance"
        component={FragranceDetailScreen}
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
      <Feature.Screen name="TodayPlanner" component={TodayScreen} />
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
function ProfileStack() {
  return <FeatureStack home="ProfileHome" />;
}
function HomeTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      id="EssenzaTabs"
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'shift',
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
      <Tabs.Screen
        name="Today"
        component={TodayStack}
        options={{ title: 'Beranda' }}
      />
      <Tabs.Screen
        name="Discover"
        component={DiscoverStack}
        options={{ title: 'Telusuri' }}
      />
      <Tabs.Screen
        name="Studio"
        component={StudioStack}
        options={{ tabBarItemStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="Shelf"
        component={ShelfStack}
        options={{ title: 'MyShelf' }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tabs.Navigator>
  );
}
function Navigation({ session, signOut }) {
  const { state } = useApp();
  return (
    <NavigationContainer theme={theme}>
      <Root.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.ivory },
        }}
      >
        {state.onboarded ? (
          <Root.Group navigationKey="member">
            <Root.Screen name="Home" component={HomeTabs} />
            <Root.Screen name="Profile" component={MemberProfileScreen} />
            <Root.Screen name="List" component={ListScreen} />
            <Root.Screen name="Fragrance" component={FragranceDetailScreen} />
            <Root.Group
              screenOptions={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            >
              <Root.Screen name="EditList" component={EditListScreen} />
              <Root.Screen name="Wear" component={WearScreen} />
              <Root.Screen name="StudioEditor" component={StudioEditorScreen} />
              <Root.Screen name="EditProfile" component={ProfileScreen} />
              <Root.Screen name="Preferences" component={PreferencesScreen} />
              <Root.Screen name="Settings">
                {props => (
                  <SettingsScreen
                    {...props}
                    email={session?.email}
                    onSignOut={() => signOut()}
                    onReset={() => signOut(true)}
                  />
                )}
              </Root.Screen>
            </Root.Group>
          </Root.Group>
        ) : (
          <Root.Screen name="Home" navigationKey="welcome">
            {props => (
              <PreferencesScreen
                {...props}
                onboarding
                onBack={() => signOut()}
              />
            )}
          </Root.Screen>
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError?.();
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
  const [launching, setLaunching] = useState(true);
  const [entryReady, setEntryReady] = useState(false);
  const finishLaunch = useCallback(() => setLaunching(false), []);
  const finishPreparingEntry = useCallback(() => setEntryReady(true), []);
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <ErrorBoundary onError={finishPreparingEntry}>
          <AppProvider>
            <EntryFlow onReady={finishPreparingEntry}>
              {entry => <Navigation {...entry} />}
            </EntryFlow>
          </AppProvider>
        </ErrorBoundary>
        {launching && (
          <View style={StyleSheet.absoluteFill}>
            <StatusBar hidden />
            <LaunchSplashScreen
              canFinish={entryReady}
              onComplete={finishLaunch}
            />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}
