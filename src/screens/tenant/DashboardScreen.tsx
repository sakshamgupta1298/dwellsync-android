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
  StatusBar,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../utils/AuthContext';
import { tenantService } from '../../services/api';
import { Surface } from 'react-native-paper';
import { maintenanceService } from '../../services/maintenanceService';
import { MaintenanceRequest } from '../../types/maintenance';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: any) => {
  // Hide the navigation header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const { user, signOut } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);

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
    maintenanceService.getTenantRequests().then(setMaintenanceRequests);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handlePayment = () => {
    if (!dashboardData?.billing?.total) {
      Alert.alert('No Amount Due', 'There is no outstanding amount to pay.');
      return;
    }

    const options = ['Cash', 'UPI', 'Debit/Credit Card', 'Cancel'];
    const paymentMethods = ['cash', 'upi', 'card'];

    const onSelect = async (index: number) => {
      if (index === 3) return; // Cancel
      const method = paymentMethods[index];
      
      if (method === 'cash' || method === 'upi') {
        try {
          const response = await tenantService.createPayment(method as any);
          Alert.alert(
            'Payment Reference',
            `Reference Number: ${response.reference}\nAmount: ₹${response.amount}\n${response.message || ''}`
          );
        } catch (e: any) {
          Alert.alert('Error', e.response?.data?.error || 'Failed to initiate payment');
        }
      } else if (method === 'card') {
        // Navigate to PaymentScreen for card payments (Razorpay)
        navigation.navigate('Payment', {
          rentAmount: dashboardData.billing.total,
          propertyId: user?.property_id || 'default_property_id', // Ensure property_id is correctly obtained
          tenantId: user?.id, // Ensure tenantId is correctly obtained
        });
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
          { text: 'Debit/Credit Card', onPress: () => onSelect(2) },
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
        <StatusBar barStyle="light-content" backgroundColor={NETFLIX_BG} />
        <View style={styles.loadingContainer}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={NETFLIX_BG} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: width * 0.05, paddingTop: width * 0.1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.headerRow}>
          <Text style={styles.welcomeText}>Hi, {user?.name}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.changePasswordButton}
              onPress={() => navigation.navigate('TenantProfile')}
            >
              <Text style={styles.changePasswordText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Deposit Card */}
        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Deposit</Text>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Deposit Amount</Text>
            <Text style={styles.billingValue}>₹{dashboardData?.tenant?.deposit ?? 'N/A'}</Text>
          </View>
        </Surface>
        {/* Billing Card */}
        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Current Billing</Text>
          <View style={styles.billingRow}><Text style={styles.billingLabel}>Rent</Text><Text style={styles.billingValue}>₹{dashboardData?.billing?.rent}</Text></View>
          <View style={styles.billingRow}><Text style={styles.billingLabel}>Electricity</Text><Text style={styles.billingValue}>₹{dashboardData?.billing?.electricity}</Text></View>
          <View style={styles.billingRow}><Text style={styles.billingLabel}>Water</Text><Text style={styles.billingValue}>₹{dashboardData?.billing?.water}</Text></View>
          <View style={[styles.billingRow, styles.totalRow]}><Text style={styles.totalLabel}>Total Due</Text><Text style={styles.totalValue}>₹{dashboardData?.billing?.total}</Text></View>
        </Surface>
        {/* Meter Readings Card */}
        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Meter Readings</Text>
          <View style={styles.meterRow}><Text style={styles.meterLabel}>Electricity</Text><Text style={styles.meterValue}>{dashboardData?.meter_readings?.electricity?.current || 'N/A'}</Text></View>
          <View style={styles.meterRow}><Text style={styles.meterLabel}>Water</Text><Text style={styles.meterValue}>{dashboardData?.meter_readings?.water?.current || 'N/A'}</Text></View>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MeterReading')}>
            <Text style={styles.secondaryButtonText}>Submit New Reading</Text>
          </TouchableOpacity>
        </Surface>
        {/* Payment Status Card */}
        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Payment Status</Text>
          {dashboardData?.payment_status ? (
            <>
              <Text style={styles.paymentStatus}>Status: <Text style={{ color: dashboardData.payment_status.status === 'completed' ? '#2ecc40' : NETFLIX_RED, fontWeight: 'bold' }}>{dashboardData.payment_status.status}</Text></Text>
              <Text style={styles.paymentAmount}>Amount: ₹{dashboardData.payment_status.amount}</Text>
              <Text style={styles.paymentDate}>Date: {new Date(dashboardData.payment_status.date).toLocaleDateString()}</Text>
            </>
          ) : (
            <Text style={styles.noPayment}>No recent payments</Text>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePayment}
            disabled={!dashboardData?.billing?.total}>
            <Text style={styles.primaryButtonText}>Make Payment</Text>
          </TouchableOpacity>
        </Surface>
        {/* Maintenance Request Card */}
        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Maintenance</Text>
          <Text style={styles.maintenanceText}>
            Need something fixed? Submit a maintenance request and we'll take care of it.
          </Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MaintenanceRequest')}>
            <Text style={styles.secondaryButtonText}>Submit Maintenance Request</Text>
          </TouchableOpacity>
        </Surface>
        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Your Maintenance Requests</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MaintenanceHistory')}
          >
            <Text style={styles.secondaryButtonText}>View Maintenance Requests</Text>
          </TouchableOpacity>
        </Surface>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('PaymentHistory')}>
          <Text style={styles.historyButtonText}>View Payment History</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  changePasswordButton: {
    backgroundColor: NETFLIX_CARD,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: NETFLIX_GRAY,
  },
  changePasswordText: {
    color: NETFLIX_GRAY,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: NETFLIX_RED,
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: NETFLIX_CARD,
    borderRadius: 24,
    padding: width * 0.05,
    marginBottom: width * 0.06,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 14,
    letterSpacing: 1,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billingLabel: {
    fontSize: 16,
    color: NETFLIX_GRAY,
    fontWeight: '500',
  },
  billingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#232323',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: NETFLIX_RED,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: NETFLIX_RED,
  },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  meterLabel: {
    fontSize: 16,
    color: NETFLIX_GRAY,
    fontWeight: '500',
  },
  meterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: NETFLIX_RED,
    borderWidth: 2,
    borderRadius: 32,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: NETFLIX_RED,
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: NETFLIX_RED,
    borderRadius: 32,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 2,
    elevation: 0,
    width: '100%',
    alignSelf: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  paymentStatus: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
  },
  paymentAmount: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
  },
  paymentDate: {
    fontSize: 16,
    marginBottom: 15,
    color: NETFLIX_GRAY,
  },
  noPayment: {
    fontSize: 16,
    color: NETFLIX_GRAY,
    marginBottom: 15,
  },
  historyButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: NETFLIX_RED,
  },
  historyButtonText: {
    color: NETFLIX_RED,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  maintenanceText: {
    fontSize: 14,
    color: NETFLIX_GRAY,
    marginBottom: 16,
    lineHeight: 20,
  },
  maintenanceHistoryCard: {
    backgroundColor: NETFLIX_CARD,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  maintenanceHistoryTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#fff',
  },
});

export default DashboardScreen; 