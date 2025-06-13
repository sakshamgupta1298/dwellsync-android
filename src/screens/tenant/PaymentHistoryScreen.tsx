import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { tenantService } from '../../services/api';
import { Surface } from 'react-native-paper';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const { width } = Dimensions.get('window');

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
      <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
        <StatusBar barStyle="light-content" backgroundColor={NETFLIX_BG} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={NETFLIX_RED} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={NETFLIX_BG} />
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
              <Text style={styles.label}>Status: <Text style={[styles.value, { color: item.status === 'completed' ? '#2ecc40' : NETFLIX_RED }]}>{item.status}</Text></Text>
              <Text style={styles.label}>Reference: <Text style={styles.value}>{item.reference}</Text></Text>
            </Surface>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No payment history found.</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 0,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  title: {
    fontSize: Math.max(18, width * 0.07),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: NETFLIX_CARD,
    borderRadius: 24,
    padding: width * 0.05,
    marginBottom: width * 0.04,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#222',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  label: {
    color: NETFLIX_RED,
    fontWeight: 'bold',
    fontSize: 15,
  },
  value: {
    color: '#fff',
    fontWeight: 'normal',
    fontSize: 15,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: NETFLIX_GRAY, marginTop: 20, fontSize: 16 },
});

export default PaymentHistoryScreen;