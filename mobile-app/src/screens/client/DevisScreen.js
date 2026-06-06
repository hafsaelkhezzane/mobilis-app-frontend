import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function DevisScreen({ route }) {
  const { token } = useAuth();
  
  // SÉCURITÉ CRITIQUE : On utilise le chaînage optionnel ?. au cas où route.params est indéfini au démarrage
  // CORRIGÉ : On bascule sur id_demande conformément à l'UML Client
  const id_demande = route?.params?.id_demande || null; 
  
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id_demande) {
      setLoading(false);
      return;
    }

    fetch(`http://192.168.1.36:5000/api/client/devis/${id_demande}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setDevis(data.devis);
      } else {
        setDevis(null);
      }
    })
    .catch((err) => {
      console.log("Erreur fetch devis:", err);
      setDevis(null);
    })
    .finally(() => setLoading(false));
  }, [id_demande, token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // ÉCRAN DE SECOURS : Si l'utilisateur est sur l'onglet mais n'a pas sélectionné de demande
  if (!id_demande || !devis) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mes Devis</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aucun devis sélectionné.</Text>
          <Text style={styles.emptySubText}>Rendez-vous dans l'onglet "Demandes" ou sur votre Accueil pour consulter les détails d'un devis.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails du Devis</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Montant total :</Text>
        <Text style={styles.value}>{devis?.montant} €</Text>
        
        <Text style={styles.label}>Date de validité :</Text>
        <Text style={styles.value}>
          {devis?.date_validite ? new Date(devis.date_validite).toLocaleDateString() : 'N/A'}
        </Text>
        
        <Text style={styles.label}>Statut :</Text>
        <Text style={styles.status}>{devis?.statut || 'En attente de traitement'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafb', paddingTop: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#0F172A' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  label: { color: '#64748b', marginTop: 10, fontSize: 13 },
  value: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  status: { fontSize: 16, color: '#4f46e5', fontWeight: 'bold', marginTop: 5 },
  emptyCard: { backgroundColor: '#fff', padding: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  emptySubText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8, lineHeight: 18 }
});