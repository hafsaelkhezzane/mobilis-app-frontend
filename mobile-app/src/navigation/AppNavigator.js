import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/mover/DashboardScreen';
import RequestsScreen from '../screens/client/RequestsScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import AnalyticsDashboardScreen from '../screens/admin/AnalyticsDashboardScreen'; 

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  console.log("======================================");
  console.log("DEBUG NAVIGATOR - Objet user complet :", JSON.stringify(user));
  console.log("======================================");

  const userRole = user?.role || user?.role_utilisateur || '';
  const cleanRole = String(userRole).trim().toUpperCase();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        cleanRole === 'ADMIN' ? (
          <Stack.Screen name="AdminAnalytics" component={AnalyticsDashboardScreen} />
        ) : cleanRole === 'MOVER' || cleanRole === 'DEMENAGEUR' ? (
          <Stack.Screen name="MoverDashboard" component={DashboardScreen} />
        ) : (
          <Stack.Screen name="ClientRequests" component={RequestsScreen} />
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}