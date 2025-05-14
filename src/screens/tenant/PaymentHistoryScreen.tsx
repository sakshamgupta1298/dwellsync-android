import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, StatusBar, TouchableOpacity } from 'react-native';
import { tenantService } from '../../services/api';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';

const PaymentHistoryScreen = ({ navigation }: any) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hide the navigation header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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
      <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
        <StatusBar barStyle="light-content" backgroundColor="#ff3e55" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ff3e55" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="#ff3e55" />
      <View style={{ padding: 20, paddingTop: 40, flex: 1 }}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment History</Text>
        <FlatList
          data={payments}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <Surface style={styles.card}>
              <Text style={styles.label}>Date: <Text style={styles.value}>{new Date(item.date).toLocaleString()}</Text></Text>
              <Text style={styles.label}>Amount: <Text style={styles.value}>₹{item.amount}</Text></Text>
              <Text style={styles.label}>Method: <Text style={styles.value}>{item.method}</Text></Text>
              <Text style={styles.label}>Status: <Text style={[styles.value, { color: item.status === 'completed' ? '#2ecc40' : '#e67e22' }]}>{item.status}</Text></Text>
              <Text style={styles.label}>Reference: <Text style={styles.value}>{item.reference}</Text></Text>
            </Surface>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No payment history found.</Text>}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    elevation: 2,
  },
  backButtonText: {
    color: '#ff3e55',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#ff3e55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  label: {
    color: '#ff3e55',
    fontWeight: 'bold',
    fontSize: 15,
  },
  value: {
    color: '#333',
    fontWeight: 'normal',
    fontSize: 15,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#fff', marginTop: 20, fontSize: 16 },
});

export default PaymentHistoryScreen;