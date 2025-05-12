import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { useAuth } from '../../utils/AuthContext';
import { tenantService } from '../../services/api';

const DashboardScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const data = await tenantService.getDashboard();
      setDashboardData(data);
      console.log('Dashboard Data:', data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handlePayment = () => {
    const options = ['Cash', 'UPI', 'Debit/Credit Card', 'Cancel'];
    const paymentMethods = ['cash', 'upi', 'card'];

    const onSelect = async (index: number) => {
      if (index === 3) return; // Cancel
      const method = paymentMethods[index];
      try {
        const response = await tenantService.createPayment(method as any);
        if (method === 'cash' || method === 'upi') {
          Alert.alert(
            'Payment Reference',
            `Reference Number: ${response.reference}\nAmount: ₹${response.amount}\n${response.message || ''}`
          );
        } else if (method === 'card') {
          // Handle Stripe or card payment flow here
          Alert.alert('Card Payment', 'Proceed with card payment as per your backend integration.');
        }
      } catch (e: any) {
        Alert.alert('Error', e.response?.data?.error || 'Failed to initiate payment');
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
        },
        onSelect
      );
    } else {
      Alert.alert(
        'Select Payment Method',
        '',
        [
          { text: 'Cash', onPress: () => onSelect(0) },
          { text: 'UPI', onPress: () => onSelect(1) },
          { text: 'Debit/Credit Card', onPress: () => onSelect(2) },
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Billing</Text>
        <View style={styles.billingCard}>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Rent:</Text>
            <Text style={styles.billingValue}>₹{dashboardData?.billing?.rent}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Electricity:</Text>
            <Text style={styles.billingValue}>₹{dashboardData?.billing?.electricity}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Water:</Text>
            <Text style={styles.billingValue}>₹{dashboardData?.billing?.water}</Text>
          </View>
          <View style={[styles.billingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Due:</Text>
            <Text style={styles.totalValue}>₹{dashboardData?.billing?.total}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meter Readings</Text>
        <View style={styles.meterCard}>
          <View style={styles.meterRow}>
            <Text style={styles.meterLabel}>Electricity:</Text>
            <Text style={styles.meterValue}>
              {dashboardData?.meter_readings?.electricity?.current || 'N/A'}
            </Text>
          </View>
          <View style={styles.meterRow}>
            <Text style={styles.meterLabel}>Water:</Text>
            <Text style={styles.meterValue}>
              {dashboardData?.meter_readings?.water?.current || 'N/A'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => navigation.navigate('MeterReading')}>
            <Text style={styles.submitButtonText}>Submit New Reading</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Status</Text>
        <View style={styles.paymentCard}>
          {dashboardData?.payment_status ? (
            <>
              <Text style={styles.paymentStatus}>
                Status: {dashboardData.payment_status.status}
              </Text>
              <Text style={styles.paymentAmount}>
                Amount: ₹{dashboardData.payment_status.amount}
              </Text>
              <Text style={styles.paymentDate}>
                Date: {new Date(dashboardData.payment_status.date).toLocaleDateString()}
              </Text>
            </>
          ) : (
            <Text style={styles.noPayment}>No recent payments</Text>
          )}
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayment}
            disabled={!dashboardData?.billing?.total}>
            <Text style={styles.payButtonText}>Make Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('PaymentHistory')}>
        <Text style={styles.historyButtonText}>View Payment History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  billingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billingLabel: {
    fontSize: 16,
    color: '#666',
  },
  billingValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  meterCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  meterLabel: {
    fontSize: 16,
    color: '#666',
  },
  meterValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentStatus: {
    fontSize: 16,
    marginBottom: 5,
  },
  paymentAmount: {
    fontSize: 16,
    marginBottom: 5,
  },
  paymentDate: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  noPayment: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen; 