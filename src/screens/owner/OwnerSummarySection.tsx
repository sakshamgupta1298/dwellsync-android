import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { ownerService } from '../../services/api';

const OwnerSummarySection = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ownerService.getDashboard()
      .then(setSummary)
      .catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load summary'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary</Text>
      <Text>Total Tenants: {summary?.total_tenants}</Text>
      <Text>Total Rent: ₹{summary?.total_rent}</Text>
      <Text>Total Payments: {summary?.total_payments}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});

export default OwnerSummarySection;