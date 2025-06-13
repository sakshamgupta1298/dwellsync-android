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
  Dimensions,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { tenantService } from '../../services/api';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const { width } = Dimensions.get('window');

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
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={NETFLIX_BG} />
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
            placeholderTextColor={NETFLIX_GRAY}
            value={electricityValue}
            onChangeText={setElectricityValue}
            keyboardType="numeric"
            selectionColor={NETFLIX_RED}
            underlineColorAndroid={NETFLIX_RED}
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
            placeholderTextColor={NETFLIX_GRAY}
            value={waterValue}
            onChangeText={setWaterValue}
            keyboardType="numeric"
            selectionColor={NETFLIX_RED}
            underlineColorAndroid={NETFLIX_RED}
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
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 20,
    elevation: 0,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: NETFLIX_CARD,
    borderRadius: 24,
    padding: width * 0.05,
    marginBottom: width * 0.06,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#222',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#181818',
    padding: width * 0.04,
    borderRadius: 16,
    marginBottom: width * 0.045,
    fontSize: Math.max(14, width * 0.045),
    color: '#fff',
    borderWidth: 1,
    borderColor: '#232323',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: NETFLIX_RED,
    borderWidth: 2,
    borderRadius: 32,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: NETFLIX_RED,
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: NETFLIX_RED,
    borderRadius: 32,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
    elevation: 0,
    width: '100%',
    alignSelf: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  image: {
    width: 180,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: NETFLIX_RED,
  },
});

export default MeterReadingScreen; 