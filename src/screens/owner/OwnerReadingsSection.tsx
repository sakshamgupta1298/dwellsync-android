import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Linking, Dimensions, RefreshControl } from 'react-native';
import { ownerService } from '../../services/api';
import { Surface } from 'react-native-paper';
import config from '../../config';

const BACKEND_URL = config.apiUrl.replace('/api', ''); // This will use the correct URL based on environment

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const { width } = Dimensions.get('window');

const OwnerReadingsSection = () => {
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    ownerService.getMeterReadings()
      .then(setReadings)
      .catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load readings'))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    ownerService.getMeterReadings()
      .then(setReadings)
      .catch(e => Alert.alert('Error', e.response?.data?.error || 'Failed to load readings'))
      .finally(() => setLoading(false));
  }, []);

  const electricityReadings = Array.isArray(readings) ? readings.filter(
    r => r && r.meter_type && r.meter_type.toLowerCase() === 'electricity'
  ) : [];
  const waterReadings = Array.isArray(readings) ? readings.filter(
    r => r && r.meter_type && r.meter_type.toLowerCase() === 'water'
  ) : [];

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const renderReadingCard = (item: any) => {
    if (!item) return null;
    const imageUrl = item.image_path
      ? (item.image_path.startsWith('http')
        ? item.image_path
        : `${BACKEND_URL}/static/uploads/${item.image_path}`)
      : null;

    return (
      <View style={styles.readingCard} key={item.id}>
        <Text style={styles.readingText}>Tenant: <Text style={styles.readingHighlight}>{item.tenant_name}</Text></Text>
        <Text style={styles.readingText}>Units: <Text style={styles.readingHighlight}>{item.reading_value}</Text></Text>
        <Text style={styles.readingText}>Date: <Text style={styles.readingHighlight}>{new Date(item.reading_date).toLocaleString()}</Text></Text>
        {imageUrl ? (
          <TouchableOpacity onPress={() => {
            Linking.openURL(imageUrl).catch(err => {
              console.error('Error opening URL:', err);
              Alert.alert('Error', 'Could not open the photo. Please check the URL or try again.');
            });
          }}>
            <Text style={styles.link}>View Photo</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.readingText, { color: NETFLIX_GRAY }]}>No photo</Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <Surface style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.04,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: Math.max(14, width * 0.045),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: width * 0.04,
    letterSpacing: 1,
  },
  readingCard: {
    backgroundColor: NETFLIX_CARD,
    padding: width * 0.025,
    borderRadius: 24,
    marginBottom: width * 0.02,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#222',
    width: '100%',
    maxWidth: 470,
    alignSelf: 'center',
  },
  readingText: {
    color: '#fff',
    marginBottom: 4,
    fontSize: 16,
  },
  readingHighlight: {
    color: NETFLIX_RED,
    fontWeight: 'bold',
  },
  link: {
    color: NETFLIX_RED,
    fontWeight: 'bold',
    marginTop: 8,
  },
  noReadingsText: {
    color: NETFLIX_GRAY,
    fontSize: 16,
    marginBottom: 16,
  },
});

export default OwnerReadingsSection;