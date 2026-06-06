import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image 
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons'; 

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState('EMAIL'); 
  const [secureText, setSecureText] = useState(true);

  const API_URL = "http://192.168.1.36:5000";

  // Étape 1 : Demande du code par mail
  const handleRequestCode = async () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez entrer votre adresse e-mail.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Code envoyé ", "Veuillez vérifier votre boîte de réception.");
        setStep('CODE'); 
      } else {
        Alert.alert("Erreur", data.message || "Une erreur est survenue.");
      }
    } catch (error) {
      Alert.alert("Erreur réseau", "Impossible de joindre le serveur.");
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Erreur", "Veuillez entrer le code à 6 chiffres.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();

      if (response.ok) {
        setStep('PASSWORD'); 
      } else {
        Alert.alert("Erreur", data.message || "Code incorrect.");
      }
    } catch (error) {
      Alert.alert("Erreur réseau", "Impossible de joindre le serveur.");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, nouveau_mot_de_passe: newPassword })
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Succès ", "Votre mot de passe a bien été mis à jour !", [
          { text: "Se connecter", onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert("Erreur", data.message || "Échec du changement.");
      }
    } catch (error) {
      Alert.alert("Erreur réseau", "Impossible de joindre le serveur.");
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={style.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={style.headerContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={style.logo} 
              resizeMode="contain"
            />
            <Text style={style.title}>Mot de passe oublié</Text>
            <Text style={style.subtitle}>
              {step === 'EMAIL' && "Entrez votre email pour recevoir votre code à 6 chiffres."}
              {step === 'CODE' && "Entrez le code de vérification reçu par e-mail."}
              {step === 'PASSWORD' && "Choisissez votre nouveau mot de passe de sécurité."}
            </Text>
          </View>

          <View style={style.card}>
            {step === 'EMAIL' && (
              <View>
                <Text style={style.label}>Adresse e-mail</Text>
                <View style={style.inputContainer}>
                  <Icon name="mail" size={20} color="#9ca3af" style={style.inputIcon} />
                  <TextInput
                    style={style.input}
                    placeholder="votre@email.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <TouchableOpacity style={style.button} onPress={handleRequestCode}>
                  <Text style={style.buttonText}>Envoyer le code</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* FORMULAIRE ÉTAPE 2 : CODE OTP */}
            {step === 'CODE' && (
              <View>
                <Text style={style.label}>Code de vérification (6 chiffres)</Text>
                <View style={style.inputContainer}>
                  <Icon name="key" size={20} color="#9ca3af" style={style.inputIcon} />
                  <TextInput
                    style={style.input}
                    placeholder="123456"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                  />
                </View>
                <TouchableOpacity style={style.button} onPress={handleVerifyCode}>
                  <Text style={style.buttonText}>Valider le code</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* FORMULAIRE ÉTAPE 3 : NOUVEAU MOT DE PASSE */}
            {step === 'PASSWORD' && (
              <View>
                <Text style={style.label}>Nouveau mot de passe</Text>
                <View style={style.inputContainer}>
                  <Icon name="lock" size={20} color="#9ca3af" style={style.inputIcon} />
                  <TextInput
                    style={style.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={secureText}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                  />
                </View>

                <Text style={style.label}>Confirmer le mot de passe</Text>
                <View style={style.inputContainer}>
                  <Icon name="lock" size={20} color="#9ca3af" style={style.inputIcon} />
                  <TextInput
                    style={style.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={secureText}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity style={style.button} onPress={handleResetPassword}>
                  <Text style={style.buttonText}>Enregistrer le mot de passe</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* BOUTON RETOUR AU LOGIN */}
            <TouchableOpacity style={style.backButton} onPress={() => navigation.navigate('Login')}>
              <Text style={style.backButtonText}>Retour à l'écran de connexion</Text>
            </TouchableOpacity>
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
  logo: {
    width: 120,       
    height: 120,      
    marginBottom: 15,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#4b5563', textAlign: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8, marginTop: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, height: 48, marginBottom: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#1f2937', fontSize: 15 },
  button: { backgroundColor: '#3b82f6', borderRadius: 8, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  backButton: { marginTop: 20, alignItems: 'center' },
  backButtonText: { color: '#2563eb', fontSize: 14, fontWeight: '500' }
});