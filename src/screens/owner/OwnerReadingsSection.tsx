import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ownerService } from '../../services/api';

const BACKEND_URL = 'http://10.0.2.2:5000'; // Change this if your backend is running elsewhere

const OwnerReadingsSection = () => {
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ownerService.getMeterReadings()
      .then(setReadings)
      .catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load readings'))
      .finally(() => setLoading(false));
  }, []);

  const electricityReadings = readings.filter(
    r => r.meter_type && r.meter_type.toLowerCase() === 'electricity'
  );
  const waterReadings = readings.filter(
    r => r.meter_type && r.meter_type.toLowerCase() === 'water'
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const renderReadingCard = (item: any) => {
    const imageUrl = item.image_path
      ? (item.image_path.startsWith('http')
        ? item.image_path
        : `${BACKEND_URL}/static/uploads/${item.image_path}`)
      : null;

    return (
      <View style={styles.readingCard} key={item.id}>
        <Text>Tenant: {item.tenant_name}</Text>
        <Text>Value: {item.reading_value}</Text>
        <Text>Date: {new Date(item.reading_date).toLocaleString()}</Text>
        {imageUrl ? (
          <TouchableOpacity onPress={() => Linking.openURL(imageUrl)}>
            <Text style={styles.link}>View Photo</Text>
          </TouchableOpacity>
        ) : (
          <Text>No photo</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Electricity Meter Readings</Text>
      {electricityReadings.length === 0 ? (
        <Text>No electricity readings found.</Text>
      ) : (
        electricityReadings.map(renderReadingCard)
      )}

      <Text style={[styles.title, { marginTop: 24 }]}>Water Meter Readings</Text>
      {waterReadings.length === 0 ? (
        <Text>No water readings found.</Text>
      ) : (
        waterReadings.map(renderReadingCard)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  readingCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, elevation: 1 },
  link: { color: '#007AFF', marginTop: 8, fontWeight: 'bold' },
});

export default OwnerReadingsSection;