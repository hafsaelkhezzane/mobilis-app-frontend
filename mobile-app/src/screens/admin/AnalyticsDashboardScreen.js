import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation, 
  UIManager,
  Modal,
  Image 
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  monthNamesShort: ['Janv.','Févr.','Mars','Avril','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
  dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  dayNamesShort: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

export default function AnalyticsDashboardScreen({ navigation }) {
  const { logout, token } = useAuth(); 
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); 
  
  const [data, setData] = useState({ 
    totalClients: 0, 
    totalDemenageurs: 0, 
    totalAdmins: 0, 
    missions: [], 
    taches: [] 
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('To Do');

  const API_URL = 'http://192.168.1.38:5000/api/admin';

  const declencherAnimation = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const loadData = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard-real`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const json = await response.json();
      
      if (json.success) {
        declencherAnimation();
        setData(json);
        genererPointsCalendrier(json.missions, json.taches);
      } else {
        console.error("Erreur renvoyée par l'API :", json.message);
      }
    } catch (error) {
      console.error("Erreur de connexion API :", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const genererPointsCalendrier = (missionsList = [], tachesList = []) => {
    let marked = {};
    
    if (Array.isArray(missionsList)) {
      missionsList.forEach(m => {
        if (m && m.date) {
          const d = new Date(m.date).toISOString().split('T')[0];
          marked[d] = { marked: true, dotColor: '#6366f1' };
        }
      });
    }

    if (Array.isArray(tachesList)) {
      tachesList.forEach(t => {
        if (t && t.date) {
          const d = new Date(t.date).toISOString().split('T')[0];
          marked[d] = { marked: true, dotColor: '#f59e0b' };
        }
      });
    }

    marked[selectedDate] = { ...marked[selectedDate], selected: true, selectedColor: '#4f46e5' };
    setMarkedDates(marked);
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert("Champs manquants", "Veuillez donner un titre à la tâche.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/taches`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titre: taskTitle,
          description: taskDesc,
          date: selectedDate,
          statut: taskStatus
        })
      });

      const json = await response.json();
      if (json.success) {
        declencherAnimation();
        setTaskTitle('');
        setTaskDesc('');
        loadData(); 
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer la tâche.");
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = 'To Do';
    if (currentStatus === 'To Do') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Done';

    try {
      const response = await fetch(`${API_URL}/taches/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ statut: nextStatus })
      });

      const json = await response.json();
      if (json.success) {
        declencherAnimation(); 
        loadData(); 
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
    }
  };

  useEffect(() => { 
    if (token) {
      loadData(); 
    } else {
      setLoading(false);
      console.warn("Aucun token JWT trouvé. L'accès à l'API est bloqué.");
    }
  }, [token]);
  
  const handleDateChange = (dateString) => {
    declencherAnimation();
    setSelectedDate(dateString);
  };

  useEffect(() => { genererPointsCalendrier(data.missions, data.taches); }, [selectedDate, data.missions, data.taches]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMenuAction = (actionLabel) => {
    setMenuVisible(false);
    Alert.alert("Navigation Back-Office", `Ouverture du module : ${actionLabel}`);
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter de l'espace Admin ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Se déconnecter", 
          style: "destructive",
          onPress: async () => {
            try {
              if (logout) {
                await logout(); 
              } else {
                Alert.alert("Erreur", "Fonction de déconnexion introuvable dans le contexte.");
              }
            } catch (error) {
              Alert.alert("Erreur", "Une erreur est survenue lors de la déconnexion.");
            }
          }
        }
      ]
    );
  };

  const tachesDuJour = (data.taches || []).filter(t => t && t.date && new Date(t.date).toISOString().split('T')[0] === selectedDate);
  const missionsDuJour = (data.missions || []).filter(m => m && m.date && new Date(m.date).toISOString().split('T')[0] === selectedDate);
  const utilisateursTotaux = (data.totalClients || 0) + (data.totalDemenageurs || 0) + (data.totalAdmins || 0);

  const pctClients = utilisateursTotaux > 0 ? (data.totalClients / utilisateursTotaux) * 100 : 0;
  const pctDemenageurs = utilisateursTotaux > 0 ? (data.totalDemenageurs / utilisateursTotaux) * 100 : 0;
  const pctAdmins = utilisateursTotaux > 0 ? (data.totalAdmins / utilisateursTotaux) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4f46e5"]} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        >
          {/* ─── EN-TÊTE PREMIUM ─── */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitlesContainer}>
              <Image 
                source={require('../../assets/logo-removebg-preview.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <Text style={styles.title}>Dashboard</Text>
              <Text style={styles.subtitle}>Espace administratif & pilotage</Text>
            </View>
            <TouchableOpacity 
              style={styles.logoutButton} 
              activeOpacity={0.7} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Quitter</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton Menu Actions Style Moderne / Action Flottante */}
          <TouchableOpacity 
            style={styles.topMenuButton} 
            activeOpacity={0.9}
            onPress={() => setMenuVisible(true)}
          >
            <View style={styles.topMenuContent}>
              <View style={styles.topMenuIconBackground}>
                <Text style={styles.topMenuIcon}>⚡</Text>
              </View>
              <Text style={styles.topMenuText}>Menu Actions Administrateur</Text>
            </View>
            <Text style={styles.topMenuArrow}>▼</Text>
          </TouchableOpacity>

          {/* Compteurs Cartes Volantes */}
          <View style={styles.row}>
            <View style={styles.card}>
              <View style={[styles.iconBadge, { backgroundColor: '#eff6ff' }]}>
                <Text style={[styles.cardIcon, { color: '#3b82f6' }]}>👥</Text>
              </View>
              <Text style={styles.cardValue}>{utilisateursTotaux}</Text>
              <Text style={styles.cardLabel}>Utilisateurs inscrits</Text>
            </View>
            
            <View style={styles.card}>
              <View style={[styles.iconBadge, { backgroundColor: '#ecfdf5' }]}>
                <Text style={[styles.cardIcon, { color: '#10b981' }]}>🚛</Text>
              </View>
              <Text style={styles.cardValue}>{data.totalDemenageurs || 0}</Text>
              <Text style={styles.cardLabel}>Déménageurs actifs</Text>
            </View>
          </View>

          <View style={styles.chartMockCard}>
            <Text style={styles.chartSectionTitle}>Répartition des comptes</Text>
            
            <View style={styles.distributionBarContainer}>
              <View style={[styles.distributionSegment, { width: `${pctClients}%`, backgroundColor: '#3b82f6', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />
              <View style={[styles.distributionSegment, { width: `${pctDemenageurs}%`, backgroundColor: '#10b981' }]} />
              <View style={[styles.distributionSegment, { width: `${pctAdmins}%`, backgroundColor: '#ef4444', borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />
            </View>

            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.legendText}>{data.totalClients || 0} Clients</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>{data.totalDemenageurs || 0} Pros</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendText}>{data.totalAdmins || 0} Admins</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>📅 Agenda de l'équipe</Text>
          <View style={styles.calendarCard}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => handleDateChange(day.dateString)}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                selectedDayBackgroundColor: '#4f46e5',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#4f46e5',
                dayTextColor: '#1e293b',
                textDisabledColor: '#94a3b8',
                arrowColor: '#4f46e5',
                monthTextColor: '#0f172a',
                textDayFontWeight: '500',
                textMonthFontWeight: '700',
              }}
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Créer un événement</Text>
            <Text style={styles.formDateText}>Planifié pour le {new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</Text>
            
            <TextInput style={styles.input} placeholder="Titre de l'action..." placeholderTextColor="#94a3b8" value={taskTitle} onChangeText={setTaskTitle} />
            <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Notes complémentaires..." placeholderTextColor="#94a3b8" multiline value={taskDesc} onChangeText={setTaskDesc} />
            
            <Text style={styles.label}>Niveau d'avancement :</Text>
            <View style={styles.statusRow}>
              {['To Do', 'In Progress', 'Done'].map((st) => (
                <TouchableOpacity 
                  key={st} 
                  activeOpacity={0.7}
                  style={[styles.statusButton, taskStatus === st && styles.statusButtonSelected]} 
                  onPress={() => { declencherAnimation(); setTaskStatus(st); }}
                >
                  <Text style={[styles.statusBtnText, taskStatus === st && { color: '#fff', fontWeight: '700' }]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={handleAddTask}>
              <Text style={styles.addButtonText}>Ajouter au planning</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>⚡ Activités du jour</Text>
          
          {tachesDuJour.length === 0 && missionsDuJour.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍃</Text>
              <Text style={styles.emptyText}>Aucun événement au programme</Text>
            </View>
          ) : (
            <>
              {tachesDuJour.map(tache => {
                const isDone = tache.statut === 'Done';
                const isInProgress = tache.statut === 'In Progress';
                return (
                  <View key={`t-${tache.id}`} style={[styles.itemCard, { borderLeftColor: isDone ? '#10b981' : isInProgress ? '#f59e0b' : '#ef4444' }]}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[styles.itemTitle, isDone && styles.lineThrough]}>{tache.titre}</Text>
                      {tache.description ? <Text style={styles.itemDesc}>{tache.description}</Text> : null}
                    </View>
                    
                    <TouchableOpacity 
                      activeOpacity={0.6}
                      style={[styles.badgeClickable, { backgroundColor: isDone ? '#e6f4ea' : isInProgress ? '#fff7ed' : '#fef2f2' }]}
                      onPress={() => handleUpdateStatus(tache.id, tache.statut)}
                    >
                      <Text style={[styles.badgeText, { color: isDone ? '#137333' : isInProgress ? '#c2410c' : '#b91c1c' }]}>
                        {tache.statut} 🔄
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              {missionsDuJour.map(mission => (
                <View key={`m-${mission.id}`} style={[styles.itemCard, { borderLeftColor: '#4f46e5' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>Mission N°{mission.id}</Text>
                    <Text style={styles.itemDesc}>Fiche Demande : #{mission.id_demande}</Text>
                  </View>
                  <View style={[styles.badgeClickable, { backgroundColor: '#eef2ff' }]}>
                    <Text style={[styles.badgeText, { color: '#4f46e5' }]}>{mission.statut || 'Planifiée'}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.dragIndicator} />
            
            <Text style={styles.menuHeaderTitle}>MobilisApp — Administration</Text>
            <Text style={styles.menuHeaderSubtitle}>Sélectionnez un module de gestion de flux :</Text>

            <View style={styles.menuGrid}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction("Gestion des Clients")}>
                <View style={[styles.menuItemIconBox, { backgroundColor: '#eff6ff' }]}>
                  <Text style={styles.menuItemEmoji}>👤</Text>
                </View>
                <Text style={styles.menuItemText}>Comptes Clients</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction("Gestion des Déménageurs")}>
                <View style={[styles.menuItemIconBox, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={styles.menuItemEmoji}>🚛</Text>
                </View>
                <Text style={styles.menuItemText}>Comptes Pros</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction("Demandes de déménagement")}>
                <View style={[styles.menuItemIconBox, { backgroundColor: '#fff7ed' }]}>
                  <Text style={styles.menuItemEmoji}>📦</Text>
                </View>
                <Text style={styles.menuItemText}>Demandes & Flux</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction("Suivi des Devis & CA")}>
                <View style={[styles.menuItemIconBox, { backgroundColor: '#f0fdf4' }]}>
                  <Text style={styles.menuItemEmoji}>📊</Text>
                </View>
                <Text style={styles.menuItemText}>Devis & CA</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction("Ajustement Modèles Chatbot")}>
                <View style={[styles.menuItemIconBox, { backgroundColor: '#faf5ff' }]}>
                  <Text style={styles.menuItemEmoji}>🤖</Text>
                </View>
                <Text style={styles.menuItemText}>Modèles Chatbot</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction("Logs d'extraction Whisper/NLP")}>
                <View style={[styles.menuItemIconBox, { backgroundColor: '#fff1f2' }]}>
                  <Text style={styles.menuItemEmoji}>🎙️</Text>
                </View>
                <Text style={styles.menuItemText}>Logs Vocaux</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeMenuButton} onPress={() => setMenuVisible(false)}>
              <Text style={styles.closeMenuButtonText}>Fermer le menu</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' }, // Fond ardoise ultra léger très pro
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 24 
  },
  headerTitlesContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logo: {
    width: 120,    
    height: 30,
    marginBottom: 4,  
  },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 1 },
  
  logoutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff5f5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffe3e3' },
  logoutIcon: { fontSize: 13, marginRight: 4 },
  logoutText: { color: '#e11d48', fontWeight: '700', fontSize: 13 },

  topMenuButton: { flexDirection: 'row', backgroundColor: '#1e1b4b', padding: 12, borderRadius: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, shadowColor: '#1e1b4b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  topMenuContent: { flexDirection: 'row', alignItems: 'center' },
  topMenuIconBackground: { backgroundColor: 'rgba(255,255,255,0.15)', width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  topMenuIcon: { fontSize: 14, color: '#fff' },
  topMenuText: { color: '#ffffff', fontWeight: '700', fontSize: 14, letterSpacing: 0.2 },
  topMenuArrow: { color: '#94a3b8', fontSize: 10, fontWeight: '700', marginRight: 4 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: { backgroundColor: '#ffffff', width: '48%', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#edf2f7', shadowColor: '#0f172a', shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  iconBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardIcon: { fontSize: 18 },
  cardValue: { fontSize: 26, fontWeight: '800', color: '#0f172a', style: { fontVariant: ['tabular-nums'] } },
  cardLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: '600' },
  
  chartMockCard: { backgroundColor: '#ffffff', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#edf2f7', shadowColor: '#0f172a', shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, marginBottom: 24 },
  chartSectionTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  distributionBarContainer: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, flexDirection: 'row', marginBottom: 16, overflow: 'hidden' },
  distributionSegment: { height: '100%' },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 12, color: '#334155', fontWeight: '600' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12, marginTop: 4 },
  calendarCard: { backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#edf2f7', shadowColor: '#0f172a', shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, marginBottom: 24 },
  
  formCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#edf2f7', shadowColor: '#0f172a', shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, marginBottom: 24 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  formDateText: { fontSize: 12, color: '#4f46e5', fontWeight: '600', marginBottom: 16, marginTop: 2 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 14, color: '#0f172a' },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  statusButton: { paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', width: '31%', alignItems: 'center', backgroundColor: '#f8fafc' },
  statusButtonSelected: { backgroundColor: '#4f46e5', borderColor: '#4f46e5', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  statusBtnText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  addButton: { backgroundColor: '#1e1b4b', padding: 14, borderRadius: 14, alignItems: 'center', shadowColor: '#1e1b4b', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  addButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },

  emptyContainer: { padding: 30, backgroundColor: '#ffffff', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', width: '100%', marginBottom: 10 },
  emptyEmoji: { fontSize: 22, marginBottom: 6 },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: 13, fontWeight: '500' },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 10, borderLeftWidth: 5, borderWidth: 1, borderColor: '#edf2f7', shadowColor: '#0f172a', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  lineThrough: { textDecorationLine: 'line-through', color: '#94a3b8' },
  itemDesc: { fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: '500' },
  
  badgeClickable: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minWidth: 95 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.3)', justifyContent: 'flex-end' },
  menuContainer: { backgroundColor: '#ffffff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 10 },
  dragIndicator: { width: 36, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  menuHeaderTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  menuHeaderSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2, marginBottom: 20 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuItem: { width: '48%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  menuItemIconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  menuItemEmoji: { fontSize: 16 },
  menuItemText: { fontSize: 12, fontWeight: '700', color: '#334155', flex: 1 },
  closeMenuButton: { backgroundColor: '#f1f5f9', padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  closeMenuButtonText: { color: '#64748b', fontWeight: '700', fontSize: 14 }
});