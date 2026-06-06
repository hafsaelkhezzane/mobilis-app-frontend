import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, StatusBar, BackHandler, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import de vos écrans
import DashboardScreen from '../screens/client/DashboardScreen';
import ChatbotVocalScreen from '../screens/client/ChatbotVocalScreen';
import DocumentsScreen from '../screens/client/DocumentsScreen';
import RequestsScreen from '../screens/client/RequestsScreen';
import DevisScreen from '../screens/client/DevisScreen';
import HistoriqueDemande from '../screens/client/HistoriqueDemande';

import { useAuth } from '../context/AuthContext'; 

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75; 

const TOP_MARGIN = Platform.OS === 'ios' ? 55 : StatusBar.currentHeight + 15;

const routes = [
  { name: 'Accueil', icon: 'home', iconOutline: 'home-outline', label: 'Tableau de bord', component: DashboardScreen },
  { name: 'Chat', icon: 'mic', iconOutline: 'mic-outline', label: 'Chatbot Vocal', component: ChatbotVocalScreen },
  { name: 'Demandes', icon: 'git-network', iconOutline: 'git-network-outline', label: 'Mes Demandes', component: RequestsScreen },
  { name: 'Historique', icon: 'time', iconOutline: 'time-outline', label: 'Historique', component: HistoriqueDemande },
  { name: 'Docs', icon: 'document-text', iconOutline: 'document-text-outline', label: 'Documents', component: DocumentsScreen },
  { name: 'Devis', icon: 'receipt', iconOutline: 'receipt-outline', label: 'Mes Devis', component: DevisScreen },
];

export default function ClientTabNavigator({ navigation: parentNavigation }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleBackPress = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
        return true;
      }
      if (activeTab !== 0) {
        setActiveTab(0);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [activeTab, isMenuOpen]);

  const customNavigation = {
    ...parentNavigation,
    navigate: (screenName, params) => {
      const tabIndex = routes.findIndex(r => r.name === screenName);
      if (tabIndex !== -1) {
        setActiveTab(tabIndex);
      } else if (parentNavigation) {
        parentNavigation.navigate(screenName, params);
      }
    },
    goBack: () => {
      if (activeTab !== 0) {
        setActiveTab(0);
      } else if (parentNavigation && parentNavigation.canGoBack()) {
        parentNavigation.goBack();
      }
    },
    canGoBack: () => {
      return activeTab !== 0 || (parentNavigation && parentNavigation.canGoBack());
    }
  };

  const ActiveScreen = routes[activeTab].component;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.screenContainer}>
        <ActiveScreen navigation={customNavigation} />
      </View>

      {!isMenuOpen && (
        <TouchableOpacity 
          style={styles.floatingMenuButton} 
          onPress={() => setIsMenuOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {isMenuOpen && (
        <View style={styles.absoluteLayer}>
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={() => setIsMenuOpen(false)} 
          />

          <View style={styles.drawerWrapper}>
            {/* En-tête du menu */}
            <View style={styles.drawerHeader}>
              <View style={styles.logoCircle}>
                <Ionicons name="sparkles" size={18} color="#2563EB" />
              </View>
              <Text style={styles.drawerTitle}>Navigation</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setIsMenuOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Liste des options principales */}
            <View style={styles.menuItemsContainer}>
              {routes.map((route, index) => {
                const focused = activeTab === index;
                const color = focused ? '#2563EB' : '#475569';

                return (
                  <TouchableOpacity
                    key={route.name}
                    style={[styles.tabButtonRow, focused && styles.tabButtonActive]}
                    onPress={() => {
                      setActiveTab(index);
                      setIsMenuOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
                      <Ionicons name={focused ? route.icon : route.iconOutline} color={color} size={22} />
                    </View>
                    
                    <Text style={[styles.labelText, { color: color, fontWeight: focused ? '700' : '600' }]}>
                      {route.label}
                    </Text>

                    {focused && <View style={styles.activeDotIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 🔑 Ligne de séparation et Bouton Modifier le profil tout en bas */}
            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.profileMenuButton}
              activeOpacity={0.7}
              onPress={() => {
                setIsMenuOpen(false); // On ferme le tiroir
                if (parentNavigation) {
                  parentNavigation.navigate('EditProfile'); // On navigue vers l'écran profil
                }
              }}
            >
              <View style={styles.profileIconBox}>
                <Ionicons name="person-outline" color="#2563EB" size={20} />
              </View>
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileLabel}>{user?.nom || 'Mon Profil'}</Text>
                <Text style={styles.profileSubLabel}>Modifier mon profil</Text>
              </View>
              <Ionicons name="pencil-sharp" size={14} color="#64748B" />
            </TouchableOpacity>

          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  screenContainer: {
    flex: 1,
  },
  floatingMenuButton: {
    position: 'absolute',
    top: 55, 
    left: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 90,
  },
  absoluteLayer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 999,
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  drawerWrapper: {
    position: 'absolute',
    top: TOP_MARGIN, 
    left: 0, 
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 24, 
    paddingTop: 24, 
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    gap: 12,
  },
  logoCircle: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  closeButton: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
  },
  menuItemsContainer: {
    flex: 1,
    gap: 6,
  },
  tabButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  tabButtonActive: {
    backgroundColor: '#F1F5F9',
  },
  iconBox: {
    width: 38, height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconBoxActive: {
    backgroundColor: '#FFFFFF',
  },
  labelText: {
    fontSize: 14,
    flex: 1,
  },
  activeDotIndicator: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },

  // 🔑 Nouveaux styles pour la section Profil dans le Drawer
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  profileMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Platform.OS === 'ios' ? 24 : 16, // Marge adaptative pour le bas de l'écran
  },
  profileIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  profileSubLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  }
});