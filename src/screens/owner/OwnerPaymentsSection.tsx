import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { ownerService } from '../../services/api';

const OwnerPaymentsSection = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    ownerService.getPayments()
      .then(setPayments)
      .catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load payments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    ownerService.getPayments()
      .then(setPayments)
      .catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load payments'))
      .finally(() => setRefreshing(false));
  };

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    setActionLoading(id);
    try {
      if (action === 'accept') {
        await ownerService.acceptPayment(id);
        Alert.alert('Success', 'Payment accepted');
      } else {
        await ownerService.rejectPayment(id);
        Alert.alert('Success', 'Payment rejected');
      }
      fetchPayments();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update payment');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payments</Text>
      <FlatList
        data={payments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.paymentCard}>
            <Text>Tenant: {item.tenant_name}</Text>
            <Text>Amount: ₹{item.amount}</Text>
            <Text>Date: {new Date(item.date).toLocaleString()}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Method: {item.method}</Text>
            <Text>Reference: {item.reference || 'N/A'}</Text>
            {item.status === 'pending' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#2ecc40' }]}
                  onPress={() => handleAction(item.id, 'accept')}
                  disabled={actionLoading === item.id}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
                  onPress={() => handleAction(item.id, 'reject')}
                  disabled={actionLoading === item.id}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text>No payments found.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  paymentCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, elevation: 1 },
  actionRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  actionButton: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center', marginHorizontal: 5 },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default OwnerPaymentsSection;