import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

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

    try {
      setLoading(true);
      const response = await api.post('/auth/verify-otp', {
        email,
        otp
      });
      
      if (response.data.verified) {
        navigation.navigate('ResetPassword', { email });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setTimer(300); // Reset timer
      Alert.alert('Success', 'New OTP has been sent to your email');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Surface style={styles.card} elevation={1}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your email
            </Text>
            
            <TextInput
              style={styles.input}
              mode="flat"
              label="Enter OTP"
              value={otp}
              textColor='#fff'
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              theme={{
                roundness: 16,
                colors: {
                  primary: NETFLIX_RED,
                  text: '#fff',
                  placeholder: NETFLIX_GRAY,
                  background: NETFLIX_CARD,
                },
              }}
              underlineColor={NETFLIX_RED}
              selectionColor={NETFLIX_RED}
              editable={!loading}
            />

            <Text style={styles.timer}>
              Time remaining: {formatTime(timer)}
            </Text>

            <Button
              mode="contained"
              style={styles.verifyButton}
              contentStyle={{ paddingVertical: 12 }}
              labelStyle={styles.buttonLabel}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : 'Verify OTP'}
            </Button>

            {timer === 0 && (
              <Button
                mode="text"
                style={styles.resendButton}
                labelStyle={styles.resendButtonLabel}
                onPress={handleResendOTP}
                disabled={loading}
              >
                Resend OTP
              </Button>
            )}
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    backgroundColor: NETFLIX_CARD,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#222',
  },
  logoContainer: {
    marginBottom: 18,
    backgroundColor: NETFLIX_CARD,
    borderRadius: 100,
    padding: 12,
    elevation: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  logo: {
    width: width * 0.18,
    height: width * 0.18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: NETFLIX_GRAY,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    marginBottom: 18,
    backgroundColor: NETFLIX_CARD,
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  timer: {
    marginBottom: 20,
    color: NETFLIX_GRAY,
    fontSize: 16,
  },
  verifyButton: {
    width: '100%',
    borderRadius: 32,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: NETFLIX_RED,
    elevation: 0,
    alignSelf: 'center',
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resendButton: {
    marginTop: 8,
  },
  resendButtonLabel: {
    color: NETFLIX_GRAY,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default OTPVerificationScreen; 