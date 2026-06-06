import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  Platform, 
  StatusBar, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker'; 
import { useAuth } from '../../context/AuthContext';

// Configuration de l'URL de ton serveur de développement
const API_BASE_URL = 'http://192.168.1.36:5000';

export default function EditProfileScreen({ navigation }) {
  const { token, user, updateUserContext } = useAuth();

  // États locaux pour le formulaire
  const [nom, setNom] = useState(user?.nom_utilisateur || '');
  const [prenom, setPrenom] = useState(user?.prenom_utilisateur || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.telephone || '');
  const [adresse, setAdresse] = useState(user?.adresse || '');
  const [ville, setVille] = useState(user?.ville || '');
  const [pays, setPays] = useState(user?.pays || '');
  
  // États pour la gestion de l'avatar
  const [avatarUri, setAvatarUri] = useState(null);
  const [loadingAvatar, setLoadingAvatar] = useState(false); 
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  
  // Coordonnées de la carte
  const [region, setRegion] = useState({
    latitude: 43.296482,
    longitude: 5.36978,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  // ─── INITIALISATION DES PERMISSIONS ───
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            "Permission requise", 
            "L'application a besoin d'accéder à vos photos pour pouvoir modifier votre image de profil."
          );
        }
      }
    })();
  }, []);

  // ─── CHARGEMENT INITIAL DES DONNÉES DU PROFIL ───
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/client/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setNom(data.user.nom_utilisateur || '');
          setPrenom(data.user.prenom_utilisateur || '');
          setEmail(data.user.email || '');
          setPhone(data.user.telephone || '');
          setAdresse(data.user.adresse || '');
          setVille(data.user.ville || '');
          setPays(data.user.pays || '');

          if (data.user.photo_utilisateur) {
            setAvatarUri(`${API_BASE_URL}${data.user.photo_utilisateur}`);
          } else {
            setAvatarUri('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png');
          }

          if (data.user.adresse || data.user.ville) {
            triggerGeocoding(data.user.adresse, data.user.ville, data.user.pays);
          }
        } else {
          Alert.alert("Erreur", data.message || "Impossible de charger votre profil.");
        }
      } catch (error) {
        console.log("Erreur lors de la récupération du profil:", error);
        Alert.alert("Erreur réseau", "Impossible de charger vos informations de profil.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // ─── FONCTION : SELECTIONNER ET UPLOADER L'IMAGE SILENCIEUSEMENT ───
  const handlePickAndUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true,  
        aspect: [1, 1],       
        quality: 0.7,         
      });

      if (result.canceled) return;

      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('avatar', {
        uri: localUri,
        name: filename,
        type
      });

      setLoadingAvatar(true);

      const response = await fetch(`${API_BASE_URL}/api/client/upload-avatar`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const serverImageUrl = `${API_BASE_URL}${data.avatarUrl}`;
        setAvatarUri(serverImageUrl); 
        
        if (updateUserContext) {
          updateUserContext({ ...user, photo_utilisateur: data.avatarUrl });
        }
        // L'alerte de succès d'upload a été retirée d'ici pour plus de fluidité
      } else {
        Alert.alert("Erreur d'upload", data.message || "Impossible d'enregistrer la photo.");
      }
    } catch (error) {
      console.log("Erreur lors de la modification de l'image :", error);
      Alert.alert("Erreur réseau", "Impossible de joindre le serveur pour téléverser l'image.");
    } finally {
      setLoadingAvatar(false);
    }
  };

  // ─── SYNCHRO 1 : TEXTE ──> CARTE (Geocoding) ───
  const triggerGeocoding = async (currentAdresse = adresse, currentVille = ville, currentPays = pays) => {
    if (!currentAdresse.trim() && !currentVille.trim()) return;

    try {
      const fullAddressString = `${currentAdresse}, ${currentVille}, ${currentPays}`.trim();
      const geocodedLocation = await Location.geocodeAsync(fullAddressString);

      if (geocodedLocation && geocodedLocation.length > 0) {
        const { latitude, longitude } = geocodedLocation[0];
        setRegion((prevRegion) => ({
          ...prevRegion,
          latitude,
          longitude,
        }));
      }
    } catch (error) {
      console.log("Erreur Geocoding (adresse introuvable) :", error);
    }
  };

  // ─── SYNCHRO 2 : CLIC CARTE ──> TEXTE (Reverse Geocoding) ───
  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    setRegion((prevRegion) => ({
      ...prevRegion,
      latitude,
      longitude,
    }));

    try {
      const response = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (response && response.length > 0) {
        const place = response[0];
        const streetNumber = place.streetNumber ? `${place.streetNumber} ` : '';
        const streetName = place.street || '';
        const formattedStreet = `${streetNumber}${streetName}`.trim();

        if (formattedStreet) setAdresse(formattedStreet);
        if (place.city) setVille(place.city);
        if (place.country) setPays(place.country);
      }
    } catch (error) {
      console.log("Erreur Reverse Geocoding :", error);
      Alert.alert("Erreur", "Impossible de récupérer l'adresse à cet emplacement.");
    }
  };

  // ─── SAUVEGARDE DU FORMULAIRE AVEC ALERTE PERSONNALISÉE ───
  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim()) {
      Alert.alert("Erreur", "Le nom et le prénom ne peuvent pas être vides.");
      return;
    }

    setLoadingSave(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/client/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nom_utilisateur: nom,
          prenom_utilisateur: prenom,
          telephone: phone,
          adresse: adresse,
          ville: ville,
          pays: pays
        })
      });

      const data = await response.json();

      if (response.ok) {
        // CORRECTION : Message d'alerte épuré selon ton choix
        Alert.alert("Succès", "La mise à jour du profil a été effectuée");
        if (updateUserContext) updateUserContext(data.user); 
        navigation.goBack();
      } else {
        Alert.alert("Erreur", data.message || "Impossible de sauvegarder le profil.");
      }
    } catch (error) {
      console.log("Erreur lors de la sauvegarde du profil:", error);
      Alert.alert("Erreur réseau", "Impossible de joindre le serveur.");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loadingProfile) {
    return (
      <View style={[styles.safeContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: '#64748B', fontWeight: '600' }}>Chargement de votre profil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mon Profil</Text>
        
        <TouchableOpacity style={styles.headerButton} onPress={handleSave} disabled={loadingSave}>
          {loadingSave ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* SECTION AVATAR */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {loadingAvatar ? (
                <View style={[styles.avatar, styles.avatarLoaderContainer]}>
                  <ActivityIndicator size="small" color="#2563EB" />
                </View>
              ) : (
                <Image 
                  source={{ uri: avatarUri }} 
                  style={styles.avatar} 
                />
              )}
              <TouchableOpacity 
                style={styles.cameraBadge} 
                onPress={handlePickAndUploadImage}
                disabled={loadingAvatar}
              >
                <Ionicons name="camera" size={16} color="#475569" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{`${prenom} ${nom}`.trim() || 'Utilisateur'}</Text>
            <Text style={styles.userRoleText}>Espace Client connecté</Text>
          </View>

          <View style={styles.tabBar}>
            <View style={styles.tabItem}>
              <Text style={styles.tabText}>Infos Perso & Adresse</Text>
            </View>
          </View>

          {/* FORMULAIRE PRINCIPAL */}
          <View style={styles.formContainer}>
            
            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color="#475569" />
              </View>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>Prénom</Text>
                <TextInput 
                  style={styles.textInput}
                  value={prenom}
                  onChangeText={setPrenom}
                  placeholder="Votre prénom"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={20} color="#475569" />
              </View>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>Nom de famille</Text>
                <TextInput 
                  style={styles.textInput}
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Votre nom"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="at-outline" size={20} color="#94A3B8" />
              </View>
              <View style={styles.inputFieldContainer}>
                <Text style={[styles.inputLabel, { color: '#94A3B8' }]}>Email (Non modifiable)</Text>
                <TextInput 
                  style={[styles.textInput, { color: '#94A3B8' }]}
                  value={email}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={20} color="#475569" />
              </View>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>Téléphone</Text>
                <TextInput 
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Ex: +336..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <Text style={styles.subSectionTitle}>Coordonnées de livraison / Déménagement</Text>

            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={20} color="#475569" />
              </View>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>Adresse rue</Text>
                <TextInput 
                  style={styles.textInput}
                  value={adresse}
                  onChangeText={setAdresse}
                  onBlur={() => triggerGeocoding()}
                  placeholder="Ex: 15 Rue de la République"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="business-outline" size={20} color="#475569" />
              </View>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>Ville</Text>
                <TextInput 
                  style={styles.textInput}
                  value={ville}
                  onChangeText={setVille}
                  onBlur={() => triggerGeocoding()}
                  placeholder="Ex: Marseille"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={[styles.inputRow, { borderBottomWidth: 0 }]}>
              <View style={styles.iconContainer}>
                <Ionicons name="earth-outline" size={20} color="#475569" />
              </View>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>Pays</Text>
                <TextInput 
                  style={styles.textInput}
                  value={pays}
                  onChangeText={setPays}
                  onBlur={() => triggerGeocoding()}
                  placeholder="Ex: France"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <Text style={styles.mapTitle}>Aperçu géographique</Text>
            <View style={styles.mapWrapper}>
              <MapView
                style={styles.map}
                region={region}
                onPress={handleMapPress}
              >
                <Marker 
                  coordinate={{ latitude: region.latitude, longitude: region.longitude }} 
                  title={`${prenom} ${nom}`.trim() || "Moi"}
                  description={`${adresse}, ${ville}`}
                />
              </MapView>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E2E8F0',
  },
  avatarLoaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  userRoleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  tabBar: {
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginBottom: 10,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  formContainer: {
    marginHorizontal: 20,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 22,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 36,
  },
  inputFieldContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textInput: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginTop: 2,
    padding: 0,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});