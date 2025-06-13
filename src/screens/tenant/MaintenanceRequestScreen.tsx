import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { CreateMaintenanceRequestInput } from '../../types/maintenance';
import { useAuth } from '../../hooks/useAuth';
import { maintenanceService } from '../../services/maintenanceService';
import { pickImage, uploadImage, ImageUploadResult } from '../../utils/imageUpload';
import { socketService } from '../../services/socket';
import { showMessage } from 'react-native-flash-message';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const { width } = Dimensions.get('window');

export const MaintenanceRequestScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [request, setRequest] = useState<CreateMaintenanceRequestInput>({
    title: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    // Initialize socket connection
    socketService.initialize();

    // Listen for maintenance updates
    const unsubscribe = socketService.onMaintenanceUpdate((request) => {
      if (request.tenantId === user.id) {
        showMessage({
          message: 'Maintenance Request Update',
          description: `Your request "${request.title}" has been ${request.status.toLowerCase()}`,
          type: 'info',
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleImagePick = async () => {
    try {
      const image = await pickImage();
      if (image) {
        setUploading(true);
        const imageUrl = await uploadImage(image);
        setImages([...images, imageUrl]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!request.title || !request.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await maintenanceService.createRequest({
        title: request.title,
        description: request.description,
        priority: request.priority,
      });
      Alert.alert('Success', 'Maintenance request submitted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Maintenance request error:', error);
      console.log ('Maintenance request error:', error)
      Alert.alert('Error', 'Failed to submit maintenance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Submit Maintenance Request</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={request.title}
              onChangeText={(text) => setRequest({ ...request, title: text })}
              placeholder="Description of the issue"
              placeholderTextColor={NETFLIX_GRAY}
              editable={!loading}
              selectionColor={NETFLIX_RED}
              underlineColorAndroid={NETFLIX_RED}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={request.description}
              onChangeText={(text) => setRequest({ ...request, description: text })}
              placeholder="Detailed description of the issue"
              placeholderTextColor={NETFLIX_GRAY}
              multiline
              numberOfLines={4}
              editable={!loading}
              selectionColor={NETFLIX_RED}
              underlineColorAndroid={NETFLIX_RED}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={request.priority}
                onValueChange={(value) => setRequest({ ...request, priority: value })}
                style={styles.picker}
                enabled={!loading}
                dropdownIconColor={NETFLIX_RED}
                itemStyle={{ color: '#fff' }}
              >
                <Picker.Item label="Low" value="low" color={NETFLIX_GRAY} />
                <Picker.Item label="Medium" value="medium" color={NETFLIX_GRAY} />
                <Picker.Item label="High" value="high" color={NETFLIX_GRAY} />
              </Picker>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: NETFLIX_CARD,
    borderRadius: 24,
    padding: width * 0.05,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#222',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: NETFLIX_RED,
  },
  input: {
    borderWidth: 1,
    borderColor: '#232323',
    borderRadius: 16,
    padding: width * 0.04,
    backgroundColor: '#181818',
    color: '#fff',
    fontSize: Math.max(14, width * 0.045),
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#232323',
    borderRadius: 16,
    backgroundColor: '#181818',
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  submitButton: {
    backgroundColor: NETFLIX_RED,
    borderRadius: 32,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    elevation: 0,
    width: '100%',
    alignSelf: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default MaintenanceRequestScreen; 