import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import AdminDashboardScreen from '../screens/admin/AnalyticsDashboardScreen'; 
import MoverDashboardScreen from '../screens/mover/DashboardScreen'; 
import ClientTabNavigator from '../navigation/ClientTabNavigator'; 

import ChatbotVocalScreen from '../screens/client/ChatbotVocalScreen';
import DocumentsScreen from '../screens/client/DocumentsScreen';
import RequestsScreen from '../screens/client/RequestsScreen';
import ClientsListScreen from '../screens/client/ClientsListScreen';
import EditProfileScreen from '../screens/client/EditProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();
  const userRole = user?.role ? String(user?.role).trim().toUpperCase() : '';

  // Fonction pour retourner les écrans selon le rôle
  const renderScreensByRole = () => {
    if (userRole === 'ADMIN') {
      return (
        <>
          <Stack.Screen name="AdminAnalytics" component={AdminDashboardScreen} />
          <Stack.Screen name="ClientsList" component={ClientsListScreen} />
        </>
      );
    } 
    
    if (userRole === 'MOVER' || userRole === 'DEMENAGEUR') {
      return <Stack.Screen name="MoverDashboard" component={MoverDashboardScreen} />;
    }

    // Espace Client
    return (
      <>
        <Stack.Screen name="ClientMain" component={ClientTabNavigator} />
        <Stack.Screen name="ChatbotVocal" component={ChatbotVocalScreen} />
        <Stack.Screen name="Documents" component={DocumentsScreen} />
        <Stack.Screen name="ClientRequests" component={RequestsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      </>
    );
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        renderScreensByRole()
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