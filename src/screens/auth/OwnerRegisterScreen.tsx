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
import { useAuth } from '../../utils/AuthContext';

const { width } = Dimensions.get('window');

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const OwnerRegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerOwner } = useAuth();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    try {
      setLoading(true);
      await registerOwner(name, email, password);
      Alert.alert(
        'Success',
        'Registration successful! Please login with your credentials.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OwnerLogin'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.error || 'An error occurred during registration'
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
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Owner Registration</Text>
            <Text style={styles.subtitle}>Create your LiveInSync account</Text>
            <TextInput
              style={styles.input}
              mode="flat"
              label="Full Name"
              value={name}
              textColor='#fff'
              onChangeText={setName}
              autoCapitalize="words"
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
              label="Email"
              value={email}
              textColor='#fff'
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
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
              label="Password"
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
            />
            <Button
              mode="contained"
              style={styles.registerButton}
              contentStyle={{ paddingVertical: 12 }}
              labelStyle={styles.registerButtonLabel}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : 'Register'}
            </Button>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Button
                mode="text"
                labelStyle={styles.loginLink}
                onPress={() => navigation.navigate('OwnerLogin')}
              >
                Login
              </Button>
            </View>
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
  registerButton: {
    width: '100%',
    borderRadius: 32,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: NETFLIX_RED,
    elevation: 0,
    alignSelf: 'center',
  },
  registerButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  loginContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  loginText: {
    color: NETFLIX_GRAY,
    fontSize: 15,
  },
  loginLink: {
    color: NETFLIX_RED,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default OwnerRegisterScreen; 