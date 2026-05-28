import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function RequestsScreen() {
  return (
    <View style={styles.container}><Text>Mes demandes de déménagement (Client)</Text></View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' } });