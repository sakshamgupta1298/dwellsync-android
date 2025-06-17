import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/api';

const OTPVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { email } = route.params;

  const addLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

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
      addLog('Retrieved stored OTP data: ' + storedOTPData);
      
      if (!storedOTPData) {
        addLog('No OTP data found in storage');
        Alert.alert('Error', 'OTP has expired. Please request a new one.');
        return;
      }

      const { otp: storedOTP, expiresAt } = JSON.parse(storedOTPData);
      addLog(`Parsed OTP data: storedOTP=${storedOTP}, expiresAt=${new Date(expiresAt).toLocaleString()}, currentTime=${new Date().toLocaleString()}`);
      
      // Check if OTP has expired
      if (Date.now() > expiresAt) {
        addLog('OTP has expired');
        await AsyncStorage.removeItem('resetPasswordOTP');
        Alert.alert('Error', 'OTP has expired. Please request a new one.');
        return;
      }

      // Verify OTP
      addLog(`Comparing OTPs: enteredOTP=${otp}, storedOTP=${storedOTP}`);
      if (otp === storedOTP) {
        addLog('OTP verification successful');
        // Clear the OTP from storage
        await AsyncStorage.removeItem('resetPasswordOTP');
        navigation.navigate('ResetPassword', { email });
      } else {
        addLog('OTP verification failed - OTPs do not match');
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      addLog('OTP verification error: ' + JSON.stringify(error));
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      addLog('Requesting new OTP for email: ' + email);
      const response = await authService.forgotPassword(email);
      addLog('New OTP response: ' + JSON.stringify(response));
      
      // Store new OTP in AsyncStorage with expiration
      const otpData = {
        otp: response.otp,
        expiresAt: Date.now() + 300000 // 5 minutes from now
      };
      addLog('Storing new OTP data: ' + JSON.stringify(otpData));
      await AsyncStorage.setItem('resetPasswordOTP', JSON.stringify(otpData));
      
      // Set up auto-deletion after 5 minutes
      setTimeout(async () => {
        await AsyncStorage.removeItem('resetPasswordOTP');
        addLog('OTP data auto-deleted after 5 minutes');
      }, 300000);

      setTimer(300); // Reset timer
      Alert.alert('Success', 'New OTP has been sent to your email');
    } catch (error) {
      addLog('Resend OTP error: ' + JSON.stringify(error));
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
});

export default OTPVerificationScreen; 