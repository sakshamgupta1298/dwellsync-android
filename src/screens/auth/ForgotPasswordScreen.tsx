import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { authService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const isOwner = route.params?.isOwner ?? true; // Default to owner if not specified

  const addLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      addLog(`Sending forgot password request for ${isOwner ? 'owner' : 'tenant'} email: ${email}`);
      const response = await authService.forgotPassword(email, isOwner);
      console.log('Forgot password response:', response);
      addLog(`Forgot password response: ${JSON.stringify(response)}`);
      
      if (!response.otp) {
        throw new Error('OTP not received from server');
      }

      addLog(`OTP received from API: ${response.otp}`);
      
      // Store OTP in AsyncStorage with expiration
      const otpData = {
        otp: response.otp,
        expiresAt: Date.now() + 300000, // 5 minutes from now
        isOwner: isOwner // Store whether this is for owner or tenant
      };
      console.log('Storing OTP data:', otpData);
      addLog(`Storing OTP data: ${JSON.stringify(otpData)}`);
      await AsyncStorage.setItem('resetPasswordOTP', JSON.stringify(otpData));
      
      // Verify the stored data
      const storedData = await AsyncStorage.getItem('resetPasswordOTP');
      if (storedData) {
        console.log('Verified stored OTP data:', JSON.parse(storedData));
      }
      
      // Set up auto-deletion after 5 minutes
      setTimeout(async () => {
        await AsyncStorage.removeItem('resetPasswordOTP');
        console.log('OTP data auto-deleted after 5 minutes');
      }, 300000);

      navigation.navigate('OTPVerification', { email, isOwner });
    } catch (error) {
      console.error('Forgot password error:', error);
      const apiError = error as ApiError;
      if (apiError.response) {
        Alert.alert('Error', apiError.response.data?.message || 'Failed to send verification code');
      } else if (apiError.request) {
        Alert.alert('Error', 'No response from server. Please check your internet connection');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            {isOwner ? 'Enter your owner email address' : 'Enter your tenant email address'} and we'll send you a verification code
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={NETFLIX_GRAY}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Sending..." : "Send Verification Code"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        {/* Debug View */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Logs:</Text>
          <ScrollView style={styles.debugLogs}>
            {debugLogs.map((log, index) => (
              <Text key={index} style={styles.debugLog}>{log}</Text>
            ))}
          </ScrollView>
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
  debugContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    marginTop: 20,
    borderRadius: 8,
  },
  debugTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugLogs: {
    maxHeight: 150,
  },
  debugLog: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
});

export default ForgotPasswordScreen; 