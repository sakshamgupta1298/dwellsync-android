import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Image, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { ownerService } from '../../services/api'; // Make sure this import exists
import { useAuth } from '../../utils/AuthContext';

const { width } = Dimensions.get('window');

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
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Surface style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.heading}>Overview</Text>
            <Button mode="text" onPress={signOut} labelStyle={styles.logoutText}>
              Logout
            </Button>
          </View>
          <Card style={styles.card}>
            <Card.Title title="Set Electricity Rate" titleStyle={styles.cardTitle} left={props => <Image source={require('../../assets/bolt.png')} style={styles.icon} />} />
            <Card.Content>
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Rate per Unit (₹)"
                value={rate}
                onChangeText={setRate}
                keyboardType="numeric"
                // left={<TextInput.Icon icon="flash" />}
                theme={{ roundness: 12 }}
              />
              <Button mode="contained" style={styles.actionButton} labelStyle={styles.actionButtonLabel} onPress={handleUpdateRate}>
                Update Rate
              </Button>
            </Card.Content>
          </Card>
          <Card style={styles.card}>
            <Card.Title title="Register New Tenant" titleStyle={styles.cardTitle} left={props => <Image source={require('../../assets/user-plus.png')} style={styles.icon} />} />
            <Card.Content>
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Tenant Name"
                value={tenantName}
                onChangeText={setTenantName}
                // left={<TextInput.Icon icon="account" />}
                theme={{ roundness: 12 }}
              />
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Monthly Rent (₹)"
                value={monthlyRent}
                onChangeText={setMonthlyRent}
                keyboardType="numeric"
                // left={<TextInput.Icon icon="currency-inr" />}
                theme={{ roundness: 12 }}
              />
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Initial Electricity Meter Reading"
                value={initialElectricity}
                onChangeText={setInitialElectricity}
                keyboardType="numeric"
                theme={{ roundness: 12 }}
              />
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Initial Water Meter Reading"
                value={initialWater}
                onChangeText={setInitialWater}
                keyboardType="numeric"
                theme={{ roundness: 12 }}
              />
              <Button mode="contained" style={styles.actionButton} labelStyle={styles.actionButtonLabel} onPress={handleRegisterTenant}>
                Register Tenant
              </Button>
            </Card.Content>
          </Card>
        </Surface>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
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
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    elevation: 4,
    paddingVertical: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff3e55',
    letterSpacing: 1,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 2,
    marginTop: 8,
  },
  actionButtonLabel: {
    color: '#ff3e55',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OwnerOverviewSection; 