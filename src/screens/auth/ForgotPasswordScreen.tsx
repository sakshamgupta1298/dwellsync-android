import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { authService, setDebugLogCallback, getDebugLogs } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  request?: any;
}

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  useEffect(() => {
    // Set up the debug log callback
    setDebugLogCallback((logs) => {
      setDebugLogs(logs);
    });

    // Initial load of existing logs
    setDebugLogs(getDebugLogs());

    // Cleanup
    return () => {
      setDebugLogCallback(() => {});
    };
  }, []);

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
      const response = await authService.forgotPassword(email);
      
      // Store OTP in AsyncStorage with expiration
      const otpData = {
        otp: response.otp,
        expiresAt: Date.now() + 300000 // 5 minutes from now
      };
      
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

      navigation.navigate('OTPVerification', { email });
    } catch (error: unknown) {
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
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a verification code
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      
      <Button 
        title={loading ? "Sending..." : "Send Verification Code"} 
        onPress={handleSubmit}
        disabled={loading}
      />

      {/* Debug View */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Logs:</Text>
        <ScrollView style={styles.debugLogs}>
          {debugLogs.map((log, index) => (
            <Text key={index} style={styles.debugLog}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    maxHeight: 200,
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
});

export default ForgotPasswordScreen; 