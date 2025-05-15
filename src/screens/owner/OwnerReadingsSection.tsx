import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ownerService } from '../../services/api';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';
import config from '../../config';
import { commonStyles, screenStyles, scale } from '../../utils/responsiveStyles';

const BACKEND_URL = config.apiUrl.replace('/api', '');

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

  if (loading) return (
    <View style={commonStyles.loadingContainer}>
      <ActivityIndicator size="large" color="#ff3e55" />
    </View>
  );

  const renderReadingCard = (item: any) => {
    const imageUrl = item.image_path
      ? (item.image_path.startsWith('http')
        ? item.image_path
        : `${BACKEND_URL}/static/uploads/${item.image_path}`)
      : null;

    return (
      <View style={screenStyles.dashboard.card} key={item.id}>
        <Text style={commonStyles.text}>Tenant: {item.tenant_name}</Text>
        <Text style={commonStyles.text}>Value: {item.reading_value}</Text>
        <Text style={commonStyles.text}>Date: {new Date(item.reading_date).toLocaleString()}</Text>
        {imageUrl ? (
          <TouchableOpacity 
            style={[commonStyles.button, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ff3e55' }]}
            onPress={() => {
              Linking.openURL(imageUrl).catch(err => {
                console.error('Error opening URL:', err);
                Alert.alert('Error', 'Could not open the photo. Please check the URL or try again.');
              });
            }}>
            <Text style={{ color: '#ff3e55', fontWeight: 'bold', fontSize: scale.font(16) }}>View Photo</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[commonStyles.text, { color: '#888' }]}>No photo</Text>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={{ flex: 1 }}>
      <Surface style={screenStyles.dashboard.container}>
        <ScrollView 
          contentContainerStyle={{ paddingBottom: scale.height(20) }}
          showsVerticalScrollIndicator={false}>
          <Text style={[commonStyles.title, { color: '#fff' }]}>Electricity Meter Readings</Text>
          {electricityReadings.length === 0 ? (
            <Text style={[commonStyles.text, { color: '#fff' }]}>No electricity readings found.</Text>
          ) : (
            electricityReadings.map(renderReadingCard)
          )}

          <Text style={[commonStyles.title, { color: '#fff', marginTop: scale.height(24) }]}>Water Meter Readings</Text>
          {waterReadings.length === 0 ? (
            <Text style={[commonStyles.text, { color: '#fff' }]}>No water readings found.</Text>
          ) : (
            waterReadings.map(renderReadingCard)
          )}
        </ScrollView>
      </Surface>
    </LinearGradient>
  );
};

export default OwnerReadingsSection;