import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { useAuth } from '../../utils/AuthContext';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const PasswordResetScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { requestPasswordReset, verifyOtpAndResetPassword } = useAuth();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRequestOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email);
      setOtpSent(true);
      Alert.alert('Success', 'OTP has been sent to your email address');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await verifyOtpAndResetPassword(email, otp, newPassword);
      Alert.alert(
        'Success',
        'Password has been reset successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OwnerLogin'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to reset password. Please try again.'
      );
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a verification code</Text>

            <TextInput
              style={styles.input}
              mode="flat"
              label="Email"
              value={email}
              textColor='#fff'
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!otpSent}
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
            />

            {!otpSent ? (
              <Button
                mode="contained"
                style={styles.button}
                contentStyle={{ paddingVertical: 12 }}
                labelStyle={styles.buttonLabel}
                onPress={handleRequestOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : 'Send OTP'}
              </Button>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  mode="flat"
                  label="Verification Code"
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
                />
                <TextInput
                  style={styles.input}
                  mode="flat"
                  label="New Password"
                  value={newPassword}
                  textColor='#fff'
                  onChangeText={setNewPassword}
                  secureTextEntry
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
                />
                <TextInput
                  style={styles.input}
                  mode="flat"
                  label="Confirm New Password"
                  value={confirmPassword}
                  textColor='#fff'
                  onChangeText={setConfirmPassword}
                  secureTextEntry
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
                />
                <Button
                  mode="contained"
                  style={styles.button}
                  contentStyle={{ paddingVertical: 12 }}
                  labelStyle={styles.buttonLabel}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : 'Reset Password'}
                </Button>
              </>
            )}

            <Button
              mode="text"
              style={styles.backButton}
              labelStyle={styles.backButtonLabel}
              onPress={() => navigation.goBack()}
            >
              Back to Login
            </Button>
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
  },
  button: {
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
  backButton: {
    marginTop: 16,
  },
  backButtonLabel: {
    color: NETFLIX_GRAY,
    fontSize: 16,
  },
});

export default PasswordResetScreen; 