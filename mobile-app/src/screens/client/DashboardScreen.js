import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, RefreshControl, Image, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PagerView from 'react-native-pager-view';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { token, user } = useAuth();
  const [demandes, setDemandes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const pagerRef = useRef(null);

  const fetchDemandes = useCallback(async () => {
    try {
      const response = await fetch('http://192.168.1.36:5000/api/client/demandes', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Accept': 'application/json' 
        }
      });
      
      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter.");
        return;
      }

      const data = await response.json();
      const validDemandes = (data.demandes || []).filter(
        item => item && item.id_demande !== null && item.id_demande !== undefined
      );
      setDemandes(validDemandes);
    } catch (err) {
      console.log("Erreur fetch demandes client:", err);
      setDemandes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDemandes();
  }, [fetchDemandes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDemandes();
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'terminé':
        return { color: '#10B981', bg: '#E6F4EA' };
      case 'en cours':
        return { color: '#F59E0B', bg: '#FEF3C7' };
      default:
        return { color: '#3B82F6', bg: '#EFF6FF' };
    }
  };

  const MainDashboardView = () => (
    <View style={styles.pageContent}>
      <TouchableOpacity 
        style={styles.voiceButton} 
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Chat')}
      >
        <LinearGradient 
          colors={['#0EA5E9', '#2563EB']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 0 }} 
          style={styles.voiceGradientLine}
        />
        <View style={styles.micCircle}>
          <Ionicons name="mic" size={20} color="#2563EB" />
        </View>
        <View style={styles.voiceTextContainer}>
          <Text style={styles.voiceButtonText}>Nouvelle demande vocale</Text>
          <Text style={styles.voiceButtonSubtext}>Dictez votre projet en quelques secondes</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Suivre mon déménagement</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={demandes}
          keyExtractor={(item) => item?.id_demande?.toString() || Math.random().toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (!item || !item.id_demande) return null;
            const badge = getStatusStyle(item.statut_demande);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardLabel}>NUMÉRO DE DOSSIER #{item.id_demande}</Text>
                    <Text style={styles.cardTitle}>Demande du {item.date_demande ? new Date(item.date_demande).toLocaleDateString() : 'N/A'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>{item.statut_demande || 'En attente'}</Text>
                  </View>
                </View>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.btnAction} 
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('DetailsDemande', { demande: item })}
                  >
                    <Text style={styles.btnText}>Consulter les détails</Text>
                    <Ionicons name="arrow-forward" size={14} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cube-outline" size={36} color="#64748B" />
              </View>
              <Text style={styles.emptyText}>Aucun déménagement en cours</Text>
              <Text style={styles.emptySubText}>Ouvrez le menu à gauche pour explorer vos options ou lancez une demande vocale.</Text>
            </View>
          }
        />
      )}
    </View>
  );

  const SecondPageView = () => (
    <View style={[styles.pageContent, styles.centeredPage]}>
      <View style={styles.bellIconCircle}>
        <Ionicons name="notifications-outline" size={32} color="#64748B" />
      </View>
      <Text style={styles.pageTitle}>Notifications & Alertes</Text>
      <Text style={styles.pageSubtitle}>Vos mises à jour importantes et suivis de devis s'afficheront ici en temps réel.</Text>
    </View>
  );

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerBackground}>
        <SafeAreaView edges={['top', 'left']} style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            
            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>Bonjour,</Text>
              <Text style={styles.userName}>{user?.nom || 'El Khezzane'}</Text>
              <Text style={styles.subTitle}>Espace Client connecté</Text>
            </View>

            {/* Conteneur de logo épuré */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo-removebg-preview.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.dotContainer}>
            <View style={[styles.dot, currentPage === 0 && styles.activeDot]} />
            <View style={[styles.dot, currentPage === 1 && styles.activeDot]} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <PagerView 
        style={styles.pagerView} 
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        <View key="1">
          <MainDashboardView />
        </View>
        <View key="2">
          <SecondPageView />
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  headerBackground: { 
    height: 220, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32, 
    paddingHorizontal: 24
  },
  headerContent: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  headerTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10,
    paddingLeft: 52 
  },
  textContainer: { 
    flex: 1 
  },
  welcomeText: { 
    color: '#94A3B8', 
    fontSize: 13, 
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  userName: { 
    color: '#FFFFFF', 
    fontSize: 22, 
    fontWeight: '800', 
    letterSpacing: -0.5, 
    marginTop: 2 
  },
  subTitle: { 
    color: '#38BDF8', 
    fontSize: 12, 
    fontWeight: '600',
    marginTop: 4 
  },
  
  logoContainer: { 
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  logo: { 
    width: 65,       
    height: 50,       
  },

  dotContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 18, 
    gap: 6 
  },
  dot: { 
    width: 6, height: 6, 
    borderRadius: 3, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)' 
  },
  activeDot: { 
    width: 16, 
    backgroundColor: '#38BDF8', 
    borderRadius: 3 
  },
  pagerView: { 
    flex: 1, 
    marginTop: -25 
  },
  pageContent: { 
    flex: 1,
  }, 
  centeredPage: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 24 
  },
  listContainer: { 
    paddingBottom: 40, 
    paddingTop: 4 
  },
  voiceButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 20, 
    padding: 16, 
    borderRadius: 20, 
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 12, 
    elevation: 4, 
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden'
  },
  voiceGradientLine: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: 5
  },
  micCircle: { 
    backgroundColor: '#EFF6FF', 
    padding: 12, 
    borderRadius: 16 
  },
  voiceTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  voiceButtonText: { 
    color: '#1E293B', 
    fontWeight: '800', 
    fontSize: 14, 
  },
  voiceButtonSubtext: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0F172A', 
    marginHorizontal: 20, 
    marginBottom: 16,
    letterSpacing: -0.3
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 18, 
    marginHorizontal: 20, 
    borderRadius: 20, 
    marginBottom: 14, 
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 16 
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
    letterSpacing: 0.5
  },
  cardTitle: { 
    fontWeight: '700', 
    fontSize: 14, 
    color: '#1E293B', 
  },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 10 
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: '800', 
  },
  actionRow: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9', 
    paddingTop: 12,
    justifyContent: 'flex-end'
  },
  btnAction: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6
  },
  btnText: { 
    color: '#2563EB', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 40, 
    paddingHorizontal: 32 
  },
  emptyIconCircle: { 
    width: 64, 
    height: 64, 
    borderRadius: 20, 
    backgroundColor: '#F1F5F9', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16 
  },
  emptyText: { 
    color: '#1E293B', 
    fontSize: 15, 
    fontWeight: '800', 
    marginBottom: 6 
  },
  emptySubText: { 
    color: '#64748B', 
    fontSize: 12, 
    textAlign: 'center', 
    lineHeight: 18 
  },
  bellIconCircle: {
    width: 64, height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  pageTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0F172A', 
  },
  pageSubtitle: { 
    color: '#64748B', 
    fontSize: 12, 
    marginTop: 6, 
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20
  }
});