import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ownerService } from '../../services/api';

const OwnerRatesSection = () => {
  const [electricityRate, setElectricityRate] = useState('');
  const [waterBill, setWaterBill] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ownerService.getElectricityRate(),
      ownerService.getWaterBill()
    ]).then(([rate, bill]) => {
      setElectricityRate(rate?.rate_per_unit?.toString() || '');
      setWaterBill(bill?.amount_per_tenant?.toString() || '');
    }).catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load rates'))
      .finally(() => setLoading(false));
  }, []);

  const updateRate = async () => {
    try {
      await ownerService.updateElectricityRate(Number(electricityRate));
      Alert.alert('Success', 'Electricity rate updated!');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update rate');
    }
  };

  const updateBill = async () => {
    try {
      await ownerService.updateWaterBill(Number(waterBill));
      Alert.alert('Success', 'Water bill updated!');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update bill');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rates & Bills</Text>
      <Text>Electricity Rate (per unit):</Text>
      <TextInput
        style={styles.input}
        value={electricityRate}
        onChangeText={setElectricityRate}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={updateRate}>
        <Text style={styles.buttonText}>Update Electricity Rate</Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 20 }}>Water Bill (per tenant):</Text>
      <TextInput
        style={styles.input}
        value={waterBill}
        onChangeText={setWaterBill}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={updateBill}>
        <Text style={styles.buttonText}>Update Water Bill</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginVertical: 8 },
  button: { backgroundColor: '#007AFF', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default OwnerRatesSection;