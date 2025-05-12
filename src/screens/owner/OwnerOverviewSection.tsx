import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, RefreshControl } from 'react-native';
import { ownerService } from '../../services/api'; // Make sure this import exists
import { useAuth } from '../../utils/AuthContext';


const OwnerOverviewSection = () => {
  const { signOut } = useAuth();
  // State for electricity rate
  const [rate, setRate] = useState('');
  // State for tenant registration
  const [tenantName, setTenantName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [initialElectricity, setInitialElectricity] = useState('');
  const [initialWater, setInitialWater] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Placeholder handlers
  // const handleUpdateRate = () => {
  //   Alert.alert('Update Rate', `Set rate per unit: ₹${rate}`);
  // };
  const handleRegisterTenant = async () => {
    try {
      const response = await ownerService.registerTenant(
        tenantName,
        Number(monthlyRent),
        Number(initialElectricity),
        Number(initialWater)
      );
      console.log('Register Tenant Response:', response);
      if (response && response.tenant && response.tenant.tenant_id && response.tenant.password) {
        Alert.alert(
          'Tenant Registered',
          `Tenant ID: ${response.tenant.tenant_id}\nPassword: ${response.tenant.password}`
        );
        setTenantName('');
        setMonthlyRent('');
        setInitialElectricity('');
        setInitialWater('');
      } else {
        // Try to show the full response for debugging
        Alert.alert('Error', 'No tenant info returned from backend.\n' + JSON.stringify(response));
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to register tenant');
    }
  };

  const handleUpdateRate = async () => {
    try {
      await ownerService.updateElectricityRate(Number(rate));
      Alert.alert('Success', 'Rate is updated');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update rate');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Optionally, re-fetch summary data here if you have an API for it
    setTimeout(() => {
      setRate('');
      setTenantName('');
      setMonthlyRent('');
      setInitialElectricity('');
      setInitialWater('');
      setRefreshing(false);
    }, 1000);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Owner Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        {/* Set Electricity Rate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Set Electricity Rate</Text>
          <TextInput
            style={styles.input}
            placeholder="Rate per Unit (₹)"
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdateRate}>
            <Text style={styles.buttonText}>Update Rate</Text>
          </TouchableOpacity>
        </View>
        {/* Register New Tenant */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Register New Tenant</Text>
          <TextInput
            style={styles.input}
            placeholder="Tenant Name"
            value={tenantName}
            onChangeText={setTenantName}
          />
          <TextInput
            style={styles.input}
            placeholder="Monthly Rent (₹)"
            value={monthlyRent}
            onChangeText={setMonthlyRent}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Initial Electricity Meter Reading"
            value={initialElectricity}
            onChangeText={setInitialElectricity}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Initial Water Meter Reading"
            value={initialWater}
            onChangeText={setInitialWater}
            keyboardType="numeric"
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#2ecc40' }]} onPress={handleRegisterTenant}>
            <Text style={styles.buttonText}>Register Tenant</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* You can add summary cards or stats here if needed */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  logoutText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OwnerOverviewSection; 