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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { CreateMaintenanceRequestInput } from '../../types/maintenance';
import { useAuth } from '../../hooks/useAuth';
import { maintenanceService } from '../../services/maintenanceService';
import { pickImage, uploadImage, ImageUploadResult } from '../../utils/imageUpload';
import { socketService } from '../../services/socket';
import { showMessage } from 'react-native-flash-message';
import LinearGradient from 'react-native-linear-gradient';

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
      if (request.tenantId === user._id) {
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
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
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
              placeholderTextColor="#aaa"
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={request.description}
              onChangeText={(text) => setRequest({ ...request, description: text })}
              placeholder="Detailed description of the issue"
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
              editable={!loading}
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
              >
                <Picker.Item label="Low" value="low" color='#aaa' />
                <Picker.Item label="Medium" value="medium" color='#aaa'/>
                <Picker.Item label="High" value="high" color='#aaa' />
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#ff3e55',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff3e55',
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
    color: '#ff3e55',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ffd6c0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff8f3',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ffd6c0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff8f3',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#ff3e55',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ff3e55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#ffd6c0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
}); 