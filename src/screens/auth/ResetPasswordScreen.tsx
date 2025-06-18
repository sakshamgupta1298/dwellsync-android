import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

// Netflix theme colors
const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  request?: any;
}

const ResetPasswordScreen = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { email, isOwner = true } = route.params;

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        newPassword: password,
        is_owner: isOwner
      });
      
      Alert.alert('Success', response.data.message);
      navigation.navigate(isOwner ? 'OwnerLogin' : 'TenantLogin'); // Navigate back to appropriate login screen
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      Alert.alert('Error', apiError.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Please enter your new {isOwner ? 'owner' : 'tenant'} password
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor={NETFLIX_GRAY}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={NETFLIX_GRAY}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Resetting..." : "Reset Password"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to OTP Verification</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NETFLIX_BG,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: NETFLIX_CARD,
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: NETFLIX_GRAY,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 4,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: NETFLIX_RED,
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: NETFLIX_GRAY,
    fontSize: 14,
  },
});

export default ResetPasswordScreen; 