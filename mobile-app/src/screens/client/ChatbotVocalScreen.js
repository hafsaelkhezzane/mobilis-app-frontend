import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function ChatbotVocalScreen({ navigation }) {
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("Appuyez sur le micro pour parler");

  const startListening = () => {
    setIsListening(true);
    setMessage("Écoute en cours...");
    setTimeout(() => {
      setIsListening(false);
      setMessage("Vous avez dit : 'Je veux déménager demain'");
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Assistant Vocal</Text>
      
      <View style={styles.chatArea}>
        <Text style={styles.messageText}>{message}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.micButton, isListening && styles.micActive]} 
        onPress={startListening}
      >
        {isListening ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="mic" size={50} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f8fafc' },
  backButton: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  chatArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageText: { fontSize: 18, color: '#475569', textAlign: 'center' },
  micButton: { 
    backgroundColor: '#4f46e5', 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    alignSelf: 'center', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 50 
  },
  micActive: { backgroundColor: '#ef4444' }
});