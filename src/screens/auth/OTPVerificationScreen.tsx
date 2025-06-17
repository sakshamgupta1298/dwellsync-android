import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/api';
import axios, { AxiosError } from 'axios';

const OTPVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);
  const { email } = route.params;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      
      // Get stored OTP data
      const storedOTPData = await AsyncStorage.getItem('resetPasswordOTP');
      if (!storedOTPData) {
        Alert.alert('Error', 'OTP has expired. Please request a new one.');
        return;
      }

      const { otp: storedOTP, expiresAt } = JSON.parse(storedOTPData);
      
      // Check if OTP has expired
      if (Date.now() > expiresAt) {
        await AsyncStorage.removeItem('resetPasswordOTP');
        Alert.alert('Error', 'OTP has expired. Please request a new one.');
        return;
      }

      // Verify OTP
      if (otp === storedOTP) {
        // Clear the OTP from storage
        await AsyncStorage.removeItem('resetPasswordOTP');
        navigation.navigate('ResetPassword', { email });
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);
      
      // Store new OTP in AsyncStorage with expiration
      const otpData = {
        otp: response.otp,
        expiresAt: Date.now() + 300000 // 5 minutes from now
      };
      await AsyncStorage.setItem('resetPasswordOTP', JSON.stringify(otpData));
      
      // Set up auto-deletion after 5 minutes
      setTimeout(async () => {
        await AsyncStorage.removeItem('resetPasswordOTP');
      }, 300000);

      setTimer(300); // Reset timer
      Alert.alert('Success', 'New OTP has been sent to your email');
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to your email
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
      />

      <Text style={styles.timer}>
        Time remaining: {formatTime(timer)}
      </Text>

      <Button 
        title={loading ? "Verifying..." : "Verify OTP"} 
        onPress={handleVerifyOTP}
        disabled={loading}
      />

      {timer === 0 && (
        <Button 
          title={loading ? "Sending..." : "Resend OTP"} 
          onPress={handleResendOTP}
          disabled={loading}
          color="#666"
        />
      )}
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
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  timer: {
    marginBottom: 20,
    color: '#666',
  },
});

export default OTPVerificationScreen; 