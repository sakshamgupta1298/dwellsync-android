import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';

const OTPVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
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
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email,
        otp
      });
      
      if (response.data.verified) {
        navigation.navigate('ResetPassword', { email });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleResendOTP = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setTimer(300); // Reset timer
      Alert.alert('Success', 'New OTP has been sent to your email');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
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
      />

      <Text style={styles.timer}>
        Time remaining: {formatTime(timer)}
      </Text>

      <Button title="Verify OTP" onPress={handleVerifyOTP} />

      {timer === 0 && (
        <Button 
          title="Resend OTP" 
          onPress={handleResendOTP}
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