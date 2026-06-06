import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function DocumentsScreen({ navigation }) {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://192.168.1.36:5000/api/client/documents', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(res => {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return res.json();
      } else {
        throw new Error("Le serveur a renvoyé du HTML au lieu de JSON (Route manquante ou crash backend).");
      }
    })
    .then(data => {
      setDocuments(data.documents || []);
    })
    .catch(err => {
      // CORRIGÉ : On remplace console.error par console.log pour éviter de bloquer l'écran rouge d'Expo
      console.log("Erreur douce capturée dans DocumentsScreen:", err.message);
      setDocuments([]); // On vide la liste proprement pour éviter les crashs de rendu
    })
    .finally(() => setLoading(false));
  }, [token]);

  const renderDocument = ({ item }) => {
    // SÉCURITÉ : Si l'objet document est mal formé ou vide, on ne l'affiche pas
    if (!item || (!item.id && !item.id_document)) return null;

    return (
      <TouchableOpacity 
        style={styles.docCard} 
        onPress={() => item.url && Linking.openURL(item.url)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={24} color="#4f46e5" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.docName}>{item.nom || 'Document sans nom'}</Text>
          <Text style={styles.docDate}>{item.date || 'Date inconnue'}</Text>
        </View>
        <Ionicons name="download-outline" size={24} color="#64748b" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* CORRIGÉ : navigation.goBack() peut poser problème dans un TopTabNavigator, 
            on peut aussi le laisser ou naviguer vers l'Accueil */}
        <TouchableOpacity onPress={() => navigation.navigate('Accueil')}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Documents</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={documents}
          // CORRIGÉ : Utilisation sécurisée du chaînage optionnel pour éviter le crash .toString()
          keyExtractor={item => item?.id?.toString() || item?.id_document?.toString() || Math.random().toString()}
          renderItem={renderDocument}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun document trouvé.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#1e293b' },
  docCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    padding: 15, borderRadius: 12, marginBottom: 12, elevation: 1 
  },
  iconContainer: { backgroundColor: '#e0e7ff', padding: 10, borderRadius: 8 },
  infoContainer: { flex: 1, marginLeft: 15 },
  docName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  docDate: { fontSize: 12, color: '#64748b' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});