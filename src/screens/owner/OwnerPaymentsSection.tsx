import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { ownerService } from '../../services/api';
import { Surface } from 'react-native-paper';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const { width } = Dimensions.get('window');

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
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <Surface style={styles.container}>
      <Text style={styles.title}>Payments</Text>
      <FlatList
        data={Array.isArray(payments) ? payments : []}
        keyExtractor={item => item && item.id ? item.id.toString() : Math.random().toString()}
        renderItem={({ item }) => item ? (
          <View style={styles.paymentCard}>
            <Text style={styles.label}>Tenant: <Text style={styles.value}>{item.tenant_name || 'N/A'}</Text></Text>
            <Text style={styles.label}>Amount: <Text style={styles.value}>₹{item.amount || 'N/A'}</Text></Text>
            <Text style={styles.label}>Date: <Text style={styles.value}>{item.date ? new Date(item.date).toLocaleString() : 'N/A'}</Text></Text>
            <Text style={styles.label}>Status: <Text style={[styles.value, item.status === 'pending' ? styles.pending : styles.completed]}>{item.status || 'N/A'}</Text></Text>
            <Text style={styles.label}>Method: <Text style={styles.value}>{item.method || 'N/A'}</Text></Text>
            <Text style={styles.label}>Reference: <Text style={styles.value}>{item.reference || 'N/A'}</Text></Text>
            {item.status === 'pending' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: NETFLIX_RED }]}
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
        ) : null}
        ListEmptyComponent={<Text style={styles.noPaymentsText}>No payments found.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: Math.max(18, width * 0.07),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: width * 0.04,
    letterSpacing: 1,
  },
  paymentCard: {
    backgroundColor: NETFLIX_CARD,
    padding: 20,
    borderRadius: 24,
    marginBottom: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#222',
  },
  label: {
    color: NETFLIX_GRAY,
    fontWeight: 'bold',
  },
  value: {
    color: '#fff',
    fontWeight: 'normal',
  },
  pending: {
    color: NETFLIX_RED,
    fontWeight: 'bold',
  },
  completed: {
    color: '#2ecc40',
    fontWeight: 'bold',
  },
  actionRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  actionButton: { flex: 1, padding: 12, borderRadius: 32, alignItems: 'center', marginHorizontal: 5 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
  noPaymentsText: {
    color: NETFLIX_GRAY,
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default OwnerPaymentsSection;