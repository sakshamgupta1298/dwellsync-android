import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ownerService } from '../../services/api';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';

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
        <Text style={styles.readingText}>Tenant: {item.tenant_name}</Text>
        <Text style={styles.readingText}>Value: {item.reading_value}</Text>
        <Text style={styles.readingText}>Date: {new Date(item.reading_date).toLocaleString()}</Text>
        {imageUrl ? (
          <TouchableOpacity onPress={() => Linking.openURL(imageUrl)}>
            <Text style={styles.link}>View Photo</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.readingText, { color: '#888' }]}>No photo</Text>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
      <Surface style={styles.container}>
        <ScrollView>
          <Text style={styles.title}>Electricity Meter Readings</Text>
          {electricityReadings.length === 0 ? (
            <Text style={styles.noReadingsText}>No electricity readings found.</Text>
          ) : (
            electricityReadings.map(renderReadingCard)
          )}

          <Text style={[styles.title, { marginTop: 24 }]}>Water Meter Readings</Text>
          {waterReadings.length === 0 ? (
            <Text style={styles.noReadingsText}>No water readings found.</Text>
          ) : (
            waterReadings.map(renderReadingCard)
          )}
        </ScrollView>
      </Surface>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 1,
  },
  readingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
  },
  readingText: {
    color: '#222',
    marginBottom: 4,
    fontSize: 15,
  },
  link: {
    color: '#ff3e55',
    fontWeight: 'bold',
    marginTop: 8,
  },
  noReadingsText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
});

export default OwnerReadingsSection;