import React, { useCallback, useState } from 'react';
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
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { MyShelfScreen } from './screens/MyShelfScreen';
import { ScentlistsScreen } from './screens/ScentlistsScreen';
import { PerfumeScreen } from './screens/PerfumeScreen';
import { CollectionScreen } from './screens/CollectionScreen';
import { EditListScreen } from './screens/EditListScreen';
import { WearScreen } from './screens/WearScreen';
import {
  HistoryScreen,
  JournalDetailScreen,
  JournalScreen,
  StatsScreen,
} from './screens/JournalFlow';
import { ProfileScreen } from './screens/ProfileScreen';
import {
  EditProfileScreen,
  HelpScreen,
  NotificationsScreen,
  OtherProfileScreen,
  PreferenceScreen,
  PrivacyScreen,
  ProfileDirectoryScreen,
  SettingsScreen,
  UserProfileScreen,
} from './screens/ProfileFlow';
import { StudioScreen } from './screens/StudioScreen';
import { StudioEditorScreen } from './screens/StudioEditorScreen';
import { RecipeScreen } from './screens/RecipeScreen';
import { Button } from './ui/components';
import { Avatar, DesignIcon } from './ui/design';
import { colors, sans } from './ui/theme';
import { EntryFlow } from './navigation/EntryFlow';
import { LaunchSplashScreen } from './screens/LaunchSplashScreen';
import { getSupabase } from '../backend/client/supabase';
import { SupabaseAuthRepository } from '../backend/client/auth';
import { AccountRepository } from '../backend/client/AccountRepository';
const Root = createNativeStackNavigator();
const Feature = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const tabIcons = {
  Today: 'home',
  Discover: 'searchTabSelected',
  Shelf: 'shelfSelected',
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
  TodayHome: HomeScreen,
  DiscoverHome: SearchScreen,
  ShelfHome: MyShelfScreen,
  ProfileHome: UserProfileScreen,
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
        component={PerfumeScreen}
        getId={({ params }) => params.id}
      />
      <Feature.Screen
        name="List"
        component={CollectionScreen}
        getId={({ params }) => params.id}
      />
      <Feature.Screen name="Scentlists" component={ScentlistsScreen} />
      <Feature.Screen
        name="EditList"
        component={EditListScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Feature.Screen
        name="Recipe"
        component={RecipeScreen}
        getId={({ params }) => params.id}
      />
    </Feature.Navigator>
  );
}
function TodayStack() {
  return <FeatureStack home="TodayHome" />;
}
function DiscoverStack() {
  return <FeatureStack home="DiscoverHome" />;
}
function ProfileStack() {
  return <FeatureStack home="ProfileHome" />;
}
function ShelfStack() {
  return <FeatureStack home="ShelfHome" />;
}
function TabIcon({ name, focused, photoUri }) {
  return (
    <View style={[tabStyles.icon, focused && tabStyles.active]}>
      {name === 'Profile' ? (
        <Avatar
          photoUri={photoUri}
          size={32}
          style={!focused && tabStyles.inactive}
        />
      ) : (
        <DesignIcon
          name={tabIcons[name]}
          style={!focused && tabStyles.inactive}
        />
      )}
    </View>
  );
}
function HomeTabs() {
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  return (
    <Tabs.Navigator
      id="EssenzaTabs"
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        popToTopOnBlur: true,
        animation: 'shift',
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: '#163A2C88',
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          height: 55 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: sans },
        tabBarIcon: ({ focused }) => (
          <TabIcon
            name={route.name}
            focused={focused}
            photoUri={state.profile.photoUri}
          />
        ),
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tabs.Screen
        name="Today"
        component={TodayStack}
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="Discover"
        component={DiscoverStack}
        options={{ title: 'Search' }}
      />
      <Tabs.Screen
        name="Shelf"
        component={ShelfStack}
        options={{ title: 'MyShelf' }}
      />
      <Tabs.Screen name="Profile" component={ProfileStack} />
    </Tabs.Navigator>
  );
}
const tabStyles = StyleSheet.create({
  icon: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
  },
  active: { borderTopColor: colors.green },
  inactive: { opacity: 0.53 },
});
function Welcome() {
  return <ProfileScreen />;
}
function Navigation() {
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
            <Root.Screen name="Journal" component={JournalScreen} />
            <Root.Screen
              name="JournalDetail"
              component={JournalDetailScreen}
              getId={({ params }) => params.id}
            />
            <Root.Screen name="History" component={HistoryScreen} />
            <Root.Screen name="Stats" component={StatsScreen} />
            <Root.Screen name="Settings" component={SettingsScreen} />
            <Root.Screen name="Preference" component={PreferenceScreen} />
            <Root.Screen name="Privacy" component={PrivacyScreen} />
            <Root.Screen name="Help" component={HelpScreen} />
            <Root.Screen name="Notifications" component={NotificationsScreen} />
            <Root.Screen
              name="OtherProfile"
              component={OtherProfileScreen}
              getId={({ params }) => params.id}
            />
            <Root.Screen
              name="ProfileDirectory"
              component={ProfileDirectoryScreen}
            />
            <Root.Screen
              name="List"
              component={CollectionScreen}
              getId={({ params }) => params.id}
            />
            <Root.Screen
              name="Fragrance"
              component={PerfumeScreen}
              getId={({ params }) => params.id}
            />
            <Root.Screen name="EditProfile" component={EditProfileScreen} />
            <Root.Screen name="Studio" component={StudioScreen} />
            <Root.Screen
              name="Recipe"
              component={RecipeScreen}
              getId={({ params }) => params?.id}
            />
            <Root.Group
              screenOptions={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            >
              <Root.Screen name="EditList" component={EditListScreen} />
              <Root.Screen name="Wear" component={WearScreen} />
              <Root.Screen name="StudioEditor" component={StudioEditorScreen} />
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
          Could not open this screen.
        </Text>
        <Text style={{ color: colors.muted }}>
          Your saved data is still on this device.
        </Text>
        <Button
          label="Try Again"
          onPress={() => this.setState({ failed: false })}
        />
      </View>
    ) : (
      this.props.children
    );
  }
}
function AccountNavigation({ client, session, signOut }) {
  const [repository] = useState(() => new AccountRepository(client, session));
  return (
    <AppProvider accountRepository={repository} onSignOut={signOut}>
      <Navigation />
    </AppProvider>
  );
}

function PreparedEntry({ onReady, onResume }) {
  const [{ client, cloudAuth, configurationError }] = useState(() => {
    try {
      const supabase = getSupabase();
      return supabase
        ? { client: supabase, cloudAuth: new SupabaseAuthRepository(supabase) }
        : {};
    } catch (error) {
      return { configurationError: error.message };
    }
  });

  if (configurationError) {
    return (
      <View
        onLayout={onReady}
        style={{ flex: 1, justifyContent: 'center', padding: 24 }}
      >
        <Text>{configurationError}</Text>
      </View>
    );
  }
  if (cloudAuth) {
    return (
      <EntryFlow cloudAuth={cloudAuth} onReady={onReady} onResume={onResume}>
        {(session, signOut) => (
          <AccountNavigation
            key={session.userId}
            client={client}
            session={session}
            signOut={signOut}
          />
        )}
      </EntryFlow>
    );
  }
  return (
    <AppProvider>
      <EntryFlow onReady={onReady} onResume={onResume}>
        <Navigation />
      </EntryFlow>
    </AppProvider>
  );
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
          <PreparedEntry onReady={finishPreparingEntry} onResume={finishLaunch} />
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
