import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ExperimentBenchScreen } from './src/screens/ExperimentBenchScreen';
import { WardrobeScreen } from './src/screens/WardrobeScreen';
import { PerfumeDetailScreen } from './src/screens/PerfumeDetailScreen';
import { EditDNAScreen } from './src/screens/EditDNAScreen';
import { CollectionsScreen } from './src/screens/CollectionsScreen';
import { CollectionDetailScreen } from './src/screens/CollectionDetailScreen';
import { LayeringStudioScreen } from './src/screens/LayeringStudioScreen';
import { ScentWrappedScreen } from './src/screens/ScentWrappedScreen';
import { MoodDetailScreen } from './src/screens/MoodDetailScreen';
import { HomeIcon, WardrobeIcon } from './src/components/TabIcons';
import { C } from './src/theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = ({ route }) => {
  const scentDNA = route?.params?.scentDNA ?? [];
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.greenDark,
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.2,
          shadowRadius: 10,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: C.gold,
        tabBarInactiveTintColor: C.textMuted,
      }}
    >
      <Tab.Screen
        name="Experiment"
        component={ExperimentBenchScreen}
        initialParams={{ scentDNA }}
        options={{
          tabBarLabel: 'Lab Bench',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Wardrobe"
        component={WardrobeScreen}
        options={{
          tabBarLabel: 'Wardrobe',
          tabBarIcon: ({ color, size }) => <WardrobeIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="PerfumeDetail" component={PerfumeDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="EditDNA" component={EditDNAScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Collections" component={CollectionsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="LayeringStudio" component={LayeringStudioScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ScentWrapped" component={ScentWrappedScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="MoodDetail" component={MoodDetailScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
