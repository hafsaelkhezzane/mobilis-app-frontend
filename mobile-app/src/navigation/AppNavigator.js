import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/mover/DashboardScreen';
import RequestsScreen from '../screens/client/RequestsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.role === 'mover' ? (
          <Stack.Screen name="MoverDashboard" component={DashboardScreen} />
        ) : (
          <Stack.Screen name="ClientRequests" component={RequestsScreen} />
        )
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}