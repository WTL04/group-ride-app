import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { RidesScreen } from '../screens/RidesScreen';
import { CreateRideScreen } from '../screens/CreateRideScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RideDetailsScreen } from '../screens/RideDetailsScreen';
import { RidesProvider } from '../store/RidesContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Rides" component={RidesScreen} />
      <Tab.Screen name="Create" component={CreateRideScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <RidesProvider>
      <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RideDetails"
        component={RideDetailsScreen}
        options={{ title: 'Ride details' }}
      />
    </Stack.Navigator>
    </RidesProvider>
  );
}
