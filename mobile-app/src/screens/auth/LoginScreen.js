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
  ScrollView
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons'; 

// Ajout de la prop { navigation } pour gérer les changements d'écran
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleLogin = () => {
    console.log('Tentative de connexion avec :', email, password);
  };

  return (
    <SafeAreaView style={style.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={style.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* ─── HEADER : LOGO & SOU-TITRE ─── */}
          <View style={style.headerContainer}>
            <Image 
              source={require('../../assets/logo.png')}
              style={style.logo} 
              resizeMode="contain"
            />
            <Text style={style.subtitle}>Connectez-vous à votre espace</Text>
          </View>

          {/* ─── CARTE BLANCHE (FORMULAIRE) ─── */}
          <View style={style.card}>
            
            {/* Champ Email */}
            <Text style={style.label}>Email</Text>
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

            {/* Champ Mot de passe */}
            <Text style={style.label}>Mot de passe</Text>
            <View style={style.inputContainer}>
              <Icon name="lock" size={20} color="#9ca3af" style={style.inputIcon} />
              <TextInput
                style={style.input}
                placeholder="••••••••"
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

            {/* Lien Mot de passe oublié */}
            <TouchableOpacity style={style.forgotPasswordContainer}>
              <Text style={style.linkText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Bouton Se connecter */}
            <TouchableOpacity style={style.button} onPress={handleLogin}>
              <Text style={style.buttonText}>Se connecter</Text>
            </TouchableOpacity>

            {/* Lien Créer un compte - AJOUT DE LA NAVIGATION ICI */}
            <View style={style.footerContainer}>
              <Text style={style.footerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                <Text style={[style.linkText, { fontWeight: '600' }]}>Créer un compte</Text>
              </TouchableOpacity>
            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── STYLES COULEURS & DESIGN ───
const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', 
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 240,
    height: 60,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5, 
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1f2937',
    fontSize: 15,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginTop: 14,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3b82f6', 
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#4b5563',
    fontSize: 14,
  },
  linkText: {
    color: '#2563eb', 
    fontSize: 14,
  },
});