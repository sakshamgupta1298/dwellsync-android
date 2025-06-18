import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/api';

// Netflix theme colors
const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const OTPVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { email, isOwner = true } = route.params;

  const addLog = (message: string) => {
    console.log(message);
    // setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
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
      // addLog('Retrieved stored OTP data: ' + storedOTPData);
      
      if (!storedOTPData) {
        // addLog('No OTP data found in storage');
        Alert.alert('Error', 'OTP has expired. Please request a new one.');
        return;
      }

      const { otp: storedOTP, expiresAt } = JSON.parse(storedOTPData);
      // addLog(`Parsed OTP data: storedOTP=${storedOTP}, expiresAt=${new Date(expiresAt).toLocaleString()}, currentTime=${new Date().toLocaleString()}`);
      
      // Check if OTP has expired
      if (Date.now() > expiresAt) {
        // addLog('OTP has expired');
        await AsyncStorage.removeItem('resetPasswordOTP');
        Alert.alert('Error', 'OTP has expired. Please request a new one.');
        return;
      }

      // Verify OTP
      // addLog(`Comparing OTPs: enteredOTP=${otp}, storedOTP=${storedOTP}`);
      if (otp === storedOTP) {
        // addLog('OTP verification successful');
        // Clear the OTP from storage
        await AsyncStorage.removeItem('resetPasswordOTP');
        navigation.navigate('ResetPassword', { email });
      } else {
        // addLog('OTP verification failed - OTPs do not match');
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      // addLog('OTP verification error: ' + JSON.stringify(error));
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      // addLog('Requesting new OTP for email: ' + email);
      const response = await authService.forgotPassword(email, isOwner);
      // addLog('New OTP response: ' + JSON.stringify(response));
      
      // Store new OTP in AsyncStorage with expiration
      const otpData = {
        otp: response.otp,
        expiresAt: Date.now() + 300000, // 5 minutes from now
        isOwner: isOwner // Store whether this is for owner or tenant
      };
      // addLog('Storing new OTP data: ' + JSON.stringify(otpData));
      await AsyncStorage.setItem('resetPasswordOTP', JSON.stringify(otpData));
      
      // Set up auto-deletion after 5 minutes
      setTimeout(async () => {
        await AsyncStorage.removeItem('resetPasswordOTP');
        // addLog('OTP data auto-deleted after 5 minutes');
      }, 300000);

      setTimer(300); // Reset timer
      Alert.alert('Success', 'New OTP has been sent to your email');
    } catch (error) {
      // addLog('Resend OTP error: ' + JSON.stringify(error));
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your {isOwner ? 'owner' : 'tenant'} email
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor={NETFLIX_GRAY}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />

          <Text style={styles.timer}>
            Time remaining: {formatTime(timer)}
          </Text>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Text>
          </TouchableOpacity>

          {timer === 0 && (
            <TouchableOpacity 
              style={[styles.resendButton, loading && styles.buttonDisabled]} 
              onPress={handleResendOTP}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>
                {loading ? "Sending..." : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Forgot Password</Text>
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
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  timer: {
    marginBottom: 20,
    color: NETFLIX_GRAY,
    textAlign: 'center',
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
  resendButton: {
    backgroundColor: 'transparent',
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  resendButtonText: {
    color: NETFLIX_GRAY,
    fontSize: 16,
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

export default OTPVerificationScreen; 