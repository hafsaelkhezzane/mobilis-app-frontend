import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoriqueDemande() {
  const { token } = useAuth();
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://192.168.1.36:5000/api/client/historique', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { 
      setHistorique(data.historique || []); 
      setLoading(false); 
    })
    .catch(() => setLoading(false));
  }, [token]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historique des demandes</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={historique}
          keyExtractor={item => item.id_demande.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Demande n°{item.id_demande}</Text>
              <Text style={styles.cardText}>Date : {new Date(item.date_demande).toLocaleDateString()}</Text>
              <Text style={styles.cardText}>Statut : {item.statut}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucune demande trouvée.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb', 
    padding: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#1e293b' 
  },
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  cardTitle: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginBottom: 5 
  },
  cardText: { 
    color: '#475569' 
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 20, 
    color: '#64748b' 
  }
});