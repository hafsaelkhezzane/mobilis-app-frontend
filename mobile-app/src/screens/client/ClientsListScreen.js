import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from "react-native-chart-kit";
import { useAuth } from '../../context/AuthContext'; 

const screenWidth = Dimensions.get("window").width;

export default function ClientsListScreen() {
  const { token } = useAuth(); 
  const [clients, setClients] = useState([]);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.1.36:5000/api/admin/clients-stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setClients(Array.isArray(data.clients) ? data.clients : []);

        let newData = new Array(12).fill(0);
        if (Array.isArray(data.stats)) {
            data.stats.forEach(item => {
               if (item.month >= 1 && item.month <= 12) {
                 newData[item.month - 1] = item.count;
               }
            });
        }
        setChartData(newData);
      }
    } catch (error) {
      console.error("Erreur fetch :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={styles.loader} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Statistiques Clients</Text>
              <BarChart
                data={{
                  labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
                  datasets: [{ data: chartData }]
                }}
                width={screenWidth - 40}
                height={220}
                showValuesOnTopOfBars={true}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  labelColor: (opacity = 1) => `#64748b`,
                  barPercentage: 0.6,
                }}
                style={styles.chart}
              />
              <Text style={styles.listTitle}>Liste des clients</Text>
            </View>
          }
          data={clients}
          keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardName}>
                {(item?.nom || "Nom") + " " + (item?.prenom || "Prénom")}
              </Text>
              <Text style={styles.cardEmail}>{item?.email || "Aucun email"}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun client trouvé.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  loader: { flex: 1 },
  listContent: { padding: 20 },
  headerContainer: { marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 15, color: '#1e293b' },
  listTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 10, color: '#1e293b' },
  chart: { marginVertical: 8, borderRadius: 16, paddingRight: 30 },
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2 
  },
  cardName: { fontWeight: '700', fontSize: 16, color: '#0f172a' },
  cardEmail: { color: '#64748b', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 20, color: '#94a3b8' }
});