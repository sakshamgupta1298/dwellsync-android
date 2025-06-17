import React, { useState } from 'react';
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

const ResetPasswordScreen = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { email } = route.params;

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
      const response = await api.post('/auth/reset-password', {
        email,
        newPassword: password
      });
      
      Alert.alert('Success', response.data.message);
      navigation.navigate('Login'); // Navigate back to login
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Please enter your new password
            </Text>
            
            <TextInput
              style={styles.input}
              mode="flat"
              label="New Password"
              value={password}
              textColor='#fff'
              onChangeText={setPassword}
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
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              mode="flat"
              label="Confirm Password"
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
              editable={!loading}
            />
            
            <Button
              mode="contained"
              style={styles.submitButton}
              contentStyle={{ paddingVertical: 12 }}
              labelStyle={styles.submitButtonLabel}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : 'Reset Password'}
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
  },
  submitButton: {
    width: '100%',
    borderRadius: 32,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: NETFLIX_RED,
    elevation: 0,
    alignSelf: 'center',
  },
  submitButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default ResetPasswordScreen; 