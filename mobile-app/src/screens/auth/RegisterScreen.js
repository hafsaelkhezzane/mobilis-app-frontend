import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState('DEMENAGEUR'); 
  
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');

  const handleRegister = async () => {
    if (!prenom || !nom || !email || !telephone || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires (*) ");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide.");
      return;
    }
    
    if (role === 'DEMENAGEUR' && (!companyName || !siret)) {
      Alert.alert("Erreur", "Veuillez renseigner le nom de l'entreprise et le SIRET.");
      return;
    }


    const API_URL = "http://192.168.1.36:5000"; 

   
    const userData = {
      prenom_utilisateur: prenom,
      nom_utilisateur: nom,
      email: email.trim().toLowerCase(),
      telephone: telephone,
      mot_de_passe: password,
      role: role, 
      nom_entreprise: role === 'DEMENAGEUR' ? companyName : null,
      siret: role === 'DEMENAGEUR' ? siret : null
    };
    
    try {
      console.log('Envoi des données d\'inscription au serveur :', userData);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      
      if (response.ok) {
        Alert.alert(
          "Succès ", 
          `Votre compte ${role === 'CLIENT' ? 'Client' : 'Déménageur'} a bien été créé !`,
          [
            { text: "Se connecter", onPress: () => navigation.navigate('Login') }
          ]
        );
      } else {
        Alert.alert("Erreur d'inscription", data.message || "Une erreur est survenue.");
      }

    } catch (error) {
      console.error('Erreur réseau lors de la liaison back-front :', error);
      Alert.alert(
        "Erreur de connexion", 
        "Impossible de joindre le serveur. Vérifiez que votre serveur Node.js est lancé et que l'adresse IP est correcte."
      );
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={style.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* HEADER */}
          <View style={style.headerContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={style.logo} 
              resizeMode="contain"
            />
            <Text style={style.subtitle}>Rejoignez la plateforme MobilisApp</Text>
          </View>

          {/* FORMULAIRE */}
          <View style={style.card}>
            
            {/* SÉLECTEUR DE RÔLE DYNAMIQUE */}
            <Text style={style.sectionLabel}>Je souhaite m'inscrire en tant que :</Text>
            <View style={style.roleContainer}>
              <TouchableOpacity 
                style={[style.roleButton, role === 'DEMENAGEUR' && style.activeRoleButton]}
                onPress={() => setRole('DEMENAGEUR')}
              >
                <Icon name="truck" size={18} color={role === 'DEMENAGEUR' ? '#fff' : '#4b5563'} />
                <Text style={[style.roleButtonText, role === 'DEMENAGEUR' && style.activeRoleText]}>Déménageur</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[style.roleButton, role === 'CLIENT' && style.activeRoleButton]}
                onPress={() => setRole('CLIENT')}
              >
                <Icon name="user" size={18} color={role === 'CLIENT' ? '#fff' : '#4b5563'} />
                <Text style={[style.roleButtonText, role === 'CLIENT' && style.activeRoleText]}>Client</Text>
              </TouchableOpacity>
            </View>

            {/* Prénom */}
            <Text style={style.label}>Prénom *</Text>
            <View style={style.inputContainer}>
              <Icon name="user" size={20} color="#9ca3af" style={style.inputIcon} />
              <TextInput
                style={style.input}
                placeholder="Ex: Jean"
                placeholderTextColor="#9ca3af"
                value={prenom}
                onChangeText={setPrenom}
              />
            </View>

            {/* Nom */}
            <Text style={style.label}>Nom *</Text>
            <View style={style.inputContainer}>
              <Icon name="user" size={20} color="#9ca3af" style={style.inputIcon} />
              <TextInput
                style={style.input}
                placeholder="Ex: Dupont"
                placeholderTextColor="#9ca3af"
                value={nom}
                onChangeText={setNom}
              />
            </View>

            {/* Adresse Email */}
            <Text style={style.label}>Adresse Email *</Text>
            <View style={style.inputContainer}>
              <Icon name="mail" size={20} color="#9ca3af" style={style.inputIcon} />
              <TextInput
                style={style.input}
                placeholder="Ex: jean.dupont@gmail.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Téléphone */}
            <Text style={style.label}>Téléphone *</Text>
            <View style={style.inputContainer}>
              <Icon name="phone" size={20} color="#9ca3af" style={style.inputIcon} />
              <TextInput
                style={style.input}
                placeholder="06 00 00 00 00"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={telephone}
                onChangeText={setTelephone}
              />
            </View>

            {role === 'DEMENAGEUR' && (
              <>
                {/* Nom de l'entreprise */}
                <Text style={style.label}>Nom de l'entreprise *</Text>
                <View style={style.inputContainer}>
                  <Icon name="briefcase" size={20} color="#9ca3af" style={style.inputIcon} />
                  <TextInput
                    style={style.input}
                    placeholder="Ex: Marseille Déménagement"
                    placeholderTextColor="#9ca3af"
                    value={companyName}
                    onChangeText={setCompanyName}
                  />
                </View>

                {/* Numéro SIRET */}
                <Text style={style.label}>Numéro SIRET *</Text>
                <View style={style.inputContainer}>
                  <Icon name="file-text" size={20} color="#9ca3af" style={style.inputIcon} />
                  <TextInput
                    style={style.input}
                    placeholder="14 chiffres"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    maxLength={14}
                    value={siret}
                    onChangeText={setSiret}
                  />
                </View>
              </>
            )}

            {/* Mot de passe */}
            <Text style={style.label}>Mot de passe *</Text>
            <View style={style.inputContainer}>
              <Icon name="lock" size={20} color="#9ca3af" style={style.inputIcon} />
              <TextInput
                style={style.input}
                placeholder="Minimum 6 caractères"
                placeholderTextColor="#9ca3af"
                secureTextEntry={secureText}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <Icon name={secureText ? "eye-off" : "eye"} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={style.button} onPress={handleRegister}>
              <Text style={style.buttonText}>
                Créer mon compte {role === 'CLIENT' ? 'Client' : 'Déménageur'}
              </Text>
            </TouchableOpacity>

            <View style={style.footerContainer}>
              <Text style={style.footerText}>Déjà inscrit ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={style.linkText}>Se connecter</Text>
              </TouchableOpacity>
            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 240, height: 60, marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#4b5563', fontWeight: '400' },
  card: { 
    backgroundColor: '#ffffff', borderRadius: 12, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 
  },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#4b5563', marginBottom: 12, textAlign: 'center' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  roleButton: { flex: 1, flexDirection: 'row', height: 42, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, backgroundColor: '#f9fafb' },
  activeRoleButton: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  roleButtonText: { marginLeft: 8, fontSize: 14, color: '#4b5563', fontWeight: '500' },
  activeRoleText: { color: '#fff', fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6, marginTop: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#fff' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#1f2937', fontSize: 15 },
  button: { backgroundColor: '#3b82f6', borderRadius: 8, height: 46, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#4b5563', fontSize: 14 },
  linkText: { color: '#2563eb', fontSize: 14, fontWeight: '600' },
});