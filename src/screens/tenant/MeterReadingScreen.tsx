import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { tenantService } from '../../services/api';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';

const MeterReadingScreen = ({ navigation }: any) => {
  // Hide the navigation header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Electricity state
  const [electricityValue, setElectricityValue] = useState('');
  const [electricityImageUri, setElectricityImageUri] = useState<string | null>(null);
  const [electricityLoading, setElectricityLoading] = useState(false);

  // Water state
  const [waterValue, setWaterValue] = useState('');
  const [waterImageUri, setWaterImageUri] = useState<string | null>(null);
  const [waterLoading, setWaterLoading] = useState(false);

  const takePhoto = async (type: 'electricity' | 'water') => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });
      if (result.assets && result.assets[0]?.uri) {
        if (type === 'electricity') setElectricityImageUri(result.assets[0].uri);
        else setWaterImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSubmit = async (type: 'electricity' | 'water') => {
    const value = type === 'electricity' ? electricityValue : waterValue;
    const imageUri = type === 'electricity' ? electricityImageUri : waterImageUri;
    if (!value || !imageUri) {
      Alert.alert('Error', 'Please enter reading value and take a photo');
      return;
    }
    if (type === 'electricity') setElectricityLoading(true);
    else setWaterLoading(true);
    try {
      await tenantService.submitMeterReading(
        parseFloat(value),
        type,
        imageUri
      );
      Alert.alert('Success', 'Meter reading submitted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to submit meter reading'
      );
    } finally {
      if (type === 'electricity') setElectricityLoading(false);
      else setWaterLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="#ff3e55" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        {/* Electricity Card */}
        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Electricity Meter Reading</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter electricity meter reading"
            placeholderTextColor="#bbb"
            value={electricityValue}
            onChangeText={setElectricityValue}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={() => takePhoto('electricity')}>
            <Text style={styles.secondaryButtonText}>{electricityImageUri ? 'Retake Photo' : 'Take Photo'}</Text>
          </TouchableOpacity>
          {electricityImageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: electricityImageUri }} style={styles.image} />
            </View>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleSubmit('electricity')}
            disabled={electricityLoading}
          >
            {electricityLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit Electricity Reading</Text>
            )}
          </TouchableOpacity>
        </Surface>
        {/* Water Card */}
        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Water Meter Reading</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter water meter reading"
            placeholderTextColor="#bbb"
            value={waterValue}
            onChangeText={setWaterValue}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={() => takePhoto('water')}>
            <Text style={styles.secondaryButtonText}>{waterImageUri ? 'Retake Photo' : 'Take Photo'}</Text>
          </TouchableOpacity>
          {waterImageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: waterImageUri }} style={styles.image} />
            </View>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleSubmit('water')}
            disabled={waterLoading}
          >
            {waterLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit Water Reading</Text>
            )}
          </TouchableOpacity>
        </Surface>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    elevation: 2,
  },
  backButtonText: {
    color: '#ff3e55',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
    elevation: 5,
    shadowColor: '#ff3e55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardTitle: {
    color: '#ff3e55',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
    fontSize: 16,
    color: '#333',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#ff3e55',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#ff3e55',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
    marginBottom: 18,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ff914d',
  },
  primaryButton: {
    backgroundColor: '#ff3e55',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
});

export default MeterReadingScreen; 