import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/mover/DashboardScreen';
import RequestsScreen from '../screens/client/RequestsScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

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
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}