import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { tenantService } from '../../services/api';

const PaymentHistoryScreen = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const dashboard = await tenantService.getDashboard();
        setPayments(dashboard.payment_history || []);
      } catch (e: any) {
        Alert.alert('Error', e.response?.data?.error || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment History</Text>
      <FlatList
        data={payments}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Date: {new Date(item.date).toLocaleString()}</Text>
            <Text>Amount: ₹{item.amount}</Text>
            <Text>Method: {item.method}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Reference: {item.reference}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No payment history found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, elevation: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
});

export default PaymentHistoryScreen;