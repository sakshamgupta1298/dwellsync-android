import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Image, Alert, ScrollView, RefreshControl } from 'react-native';
import { Text, TextInput, Button, Surface, Card } from 'react-native-paper';
import { ownerService } from '../../services/api'; // Make sure this import exists
import { useAuth } from '../../utils/AuthContext';

const { width } = Dimensions.get('window');

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const OwnerOverviewSection = () => {
  const { signOut } = useAuth();
  // State for electricity rate
  const [rate, setRate] = useState('');
  // State for tenant registration
  const [tenantName, setTenantName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [initialElectricity, setInitialElectricity] = useState('');
  const [initialWater, setInitialWater] = useState('');
  const [deposit, setDeposit] = useState('');
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
        Number(initialWater),
        Number(deposit)
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
        setDeposit('');
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
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Overview</Text>
        <Button mode="text" onPress={signOut} labelStyle={styles.logoutText}>
          Logout
        </Button>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Surface style={styles.container}>
            <Card style={styles.card}>
              <Card.Title title="Register New Tenant" titleStyle={styles.cardTitle} left={props => <Image source={require('../../assets/user-plus.png')} style={styles.icon} />} />
              <Card.Content>
                <TextInput
                  style={[styles.input, { color: '#fff' }]}
                  mode="flat"
                  label="Tenant Name"
                  value={tenantName}
                  textColor='#fff'
                  onChangeText={setTenantName}
                  theme={{
                    roundness: 16,
                    colors: {
                      primary: NETFLIX_RED,
                      text: '#fff',
                      placeholder: NETFLIX_GRAY,
                      background: NETFLIX_CARD,
                    },
                  }}
                  underlineColor={NETFLIX_RED}
                  selectionColor={NETFLIX_RED}
                />
                <TextInput
                  style={[styles.input, { color: '#fff' }]}
                  mode="flat"
                  label="Monthly Rent (₹)"
                  value={monthlyRent}
                  textColor='#fff'
                  onChangeText={setMonthlyRent}
                  keyboardType="numeric"
                  theme={{
                    roundness: 16,
                    colors: {
                      primary: NETFLIX_RED,
                      text: '#fff',
                      placeholder: NETFLIX_GRAY,
                      background: NETFLIX_CARD,
                    },
                  }}
                  underlineColor={NETFLIX_RED}
                  selectionColor={NETFLIX_RED}
                />
                <TextInput
                  style={[styles.input, { color: '#fff' }]}
                  mode="flat"
                  label="Initial Electricity Meter Reading"
                  value={initialElectricity}
                  textColor='#fff'
                  onChangeText={setInitialElectricity}
                  keyboardType="numeric"
                  theme={{
                    roundness: 16,
                    colors: {
                      primary: NETFLIX_RED,
                      text: '#fff',
                      placeholder: NETFLIX_GRAY,
                      background: NETFLIX_CARD,
                    },
                  }}
                  underlineColor={NETFLIX_RED}
                  selectionColor={NETFLIX_RED}
                />
                <TextInput
                  style={[styles.input, { color: '#fff' }]}
                  mode="flat"
                  label="Initial Water Meter Reading"
                  value={initialWater}
                  textColor='#fff'
                  onChangeText={setInitialWater}
                  keyboardType="numeric"
                  theme={{
                    roundness: 16,
                    colors: {
                      primary: NETFLIX_RED,
                      text: '#fff',
                      placeholder: NETFLIX_GRAY,
                      background: NETFLIX_CARD,
                    },
                  }}
                  underlineColor={NETFLIX_RED}
                  selectionColor={NETFLIX_RED}
                />
                <TextInput
                  style={[styles.input, { color: '#fff' }]}
                  mode="flat"
                  label="Deposit (₹)"
                  value={deposit}
                  textColor='#fff'
                  onChangeText={setDeposit}
                  keyboardType="numeric"
                  theme={{
                    roundness: 16,
                    colors: {
                      primary: NETFLIX_RED,
                      text: '#fff',
                      placeholder: NETFLIX_GRAY,
                      background: NETFLIX_CARD,
                    },
                  }}
                  underlineColor={NETFLIX_RED}
                  selectionColor={NETFLIX_RED}
                />
                <Button mode="contained" style={styles.actionButton} labelStyle={styles.actionButtonLabel} onPress={handleRegisterTenant}>
                  Register Tenant
                </Button>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Title title="Set Electricity Rate" titleStyle={styles.cardTitle} left={props => <Image source={require('../../assets/bolt.png')} style={styles.icon} />} />
              <Card.Content>
                <TextInput
                  style={styles.input}
                  mode="flat"
                  label="Rate per Unit (₹)"
                  value={rate}
                  textColor='#fff'
                  onChangeText={setRate}
                  keyboardType="numeric"
                  theme={{
                    roundness: 16,
                    colors: {
                      primary: NETFLIX_RED,
                      text: '#fff',
                      placeholder: NETFLIX_GRAY,
                      background: NETFLIX_CARD,
                    },
                  }}
                  underlineColor={NETFLIX_RED}
                  selectionColor={NETFLIX_RED}
                />
                <Button mode="contained" style={styles.actionButton} labelStyle={styles.actionButtonLabel} onPress={handleUpdateRate}>
                  Update Rate
                </Button>
              </Card.Content>
            </Card>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.04,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: width * 0.04,
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  heading: {
    fontSize: Math.max(20, width * 0.07),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    flexShrink: 1,
  },
  logoutText: {
    color: NETFLIX_RED,
    fontWeight: 'bold',
    fontSize: Math.max(14, width * 0.045),
    paddingHorizontal: width * 0.03,
    paddingVertical: width * 0.01,
    backgroundColor: 'rgba(229,9,20,0.08)',
    borderRadius: 18,
    overflow: 'hidden',
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    marginBottom: width * 0.02,
    backgroundColor: NETFLIX_CARD,
    elevation: 1,
    paddingVertical: width * 0.004,
    paddingHorizontal: width * 0.02,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#222',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: Math.max(14, width * 0.038),
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
    tintColor: NETFLIX_RED,
  },
  input: {
    marginBottom: width * 0.018,
    backgroundColor: NETFLIX_CARD,
    color: '#fff',
  },
  actionButton: {
    backgroundColor: NETFLIX_RED,
    borderRadius: 32,
    marginTop: 12,
    marginBottom: 8,
    elevation: 0,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  actionButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default OwnerOverviewSection; 