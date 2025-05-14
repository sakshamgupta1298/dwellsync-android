import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { ownerService } from '../../services/api';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';

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
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
      <Surface style={styles.container}>
      <Text style={styles.title}>Payments</Text>
      <FlatList
        data={payments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.paymentCard}>
              <Text style={styles.label}>Tenant: <Text style={styles.value}>{item.tenant_name}</Text></Text>
              <Text style={styles.label}>Amount: <Text style={styles.value}>₹{item.amount}</Text></Text>
              <Text style={styles.label}>Date: <Text style={styles.value}>{new Date(item.date).toLocaleString()}</Text></Text>
              <Text style={styles.label}>Status: <Text style={styles.value}>{item.status}</Text></Text>
              <Text style={styles.label}>Method: <Text style={styles.value}>{item.method}</Text></Text>
              <Text style={styles.label}>Reference: <Text style={styles.value}>{item.reference || 'N/A'}</Text></Text>
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
          ListEmptyComponent={<Text style={styles.noPaymentsText}>No payments found.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      </Surface>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 1,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
  },
  label: {
    color: '#ff3e55',
    fontWeight: 'bold',
  },
  value: {
    color: '#333',
    fontWeight: 'normal',
  },
  actionRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  actionButton: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center', marginHorizontal: 5 },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },
  noPaymentsText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default OwnerPaymentsSection;