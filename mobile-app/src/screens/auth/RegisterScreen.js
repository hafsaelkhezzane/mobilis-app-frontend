import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function RegisterScreen({ navigation }) {
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleRegister = async () => {
    if (!companyName || !email || !password || !siret) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires (Entreprise, SIRET, Email, Mot de passe).");
      return;
    }
    
    console.log('Inscription de l\'entreprise :', companyName, email);
    // Ici, tu feras ton appel fetch() vers POST http://localhost:5000/api/auth/register
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
            <Text style={style.subtitle}>Créez votre espace Déménageur</Text>
          </View>

          {/* FORMULAIRE */}
          <View style={style.card}>
            
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

            {/* Email */}
            <Text style={style.label}>Email professionnel *</Text>
            <View style={style.inputContainer}>
              <Icon name="mail" size={20} color="#9ca3af" style={style.inputIcon} />
              <TextInput
                style={style.input}
                placeholder="contact@entreprise.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Téléphone */}
            <Text style={style.label}>Téléphone</Text>
            <View style={style.inputContainer}>
              <Icon name="phone" size={20} color="#9ca3af" style={style.inputIcon} />
              <TextInput
                style={style.input}
                placeholder="06 00 00 00 00"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

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

            {/* Bouton S'inscrire */}
            <TouchableOpacity style={style.button} onPress={handleRegister}>
              <Text style={style.buttonText}>Créer mon compte</Text>
            </TouchableOpacity>

            {/* Lien Retour à la connexion */}
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