import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { authService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
        otp: response.otp, // Assuming the API returns the OTP
        expiresAt: Date.now() + 300000 // 5 minutes from now
      };
      await AsyncStorage.setItem('resetPasswordOTP', JSON.stringify(otpData));
      
      // Set up auto-deletion after 5 minutes
      setTimeout(async () => {
        await AsyncStorage.removeItem('resetPasswordOTP');
      }, 300000);

      navigation.navigate('OTPVerification', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.response) {
        Alert.alert('Error', error.response.data?.message || 'Failed to send verification code');
      } else if (error.request) {
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