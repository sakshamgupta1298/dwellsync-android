import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { tenantService } from '../../services/api';

const MeterReadingScreen = ({ navigation }: any) => {
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
    <View style={styles.container}>
      {/* Electricity Card */}
      <View style={styles.form}>
        <Text style={styles.cardTitle}>Electricity Meter Reading</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter electricity meter reading"
          value={electricityValue}
          onChangeText={setElectricityValue}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.cameraButton} onPress={() => takePhoto('electricity')}>
          <Text style={styles.cameraButtonText}>Take Photo</Text>
        </TouchableOpacity>
        {electricityImageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: electricityImageUri }} style={styles.image} />
          </View>
        )}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => handleSubmit('electricity')}
          disabled={electricityLoading}
        >
          {electricityLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Electricity Reading</Text>
          )}
        </TouchableOpacity>
      </View>
      {/* Water Card */}
      <View style={styles.form}>
        <Text style={styles.cardTitle}>Water Meter Reading</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter water meter reading"
          value={waterValue}
          onChangeText={setWaterValue}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.cameraButton} onPress={() => takePhoto('water')}>
          <Text style={styles.cameraButtonText}>Take Photo</Text>
        </TouchableOpacity>
        {waterImageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: waterImageUri }} style={styles.image} />
          </View>
        )}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => handleSubmit('water')}
          disabled={waterLoading}
        >
          {waterLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Water Reading</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MeterReadingScreen; 