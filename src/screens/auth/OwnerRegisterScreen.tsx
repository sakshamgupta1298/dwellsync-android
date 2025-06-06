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
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../utils/AuthContext';

const { width } = Dimensions.get('window');

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
            onPress: () => navigation.navigate('Login'),
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
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={styles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Surface style={styles.card} elevation={4}>
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
              mode="outlined"
              label="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              // left={<TextInput.Icon icon="account" />}
              theme={{ roundness: 12 }}
            />
            <TextInput
              style={styles.input}
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              // left={<TextInput.Icon icon="email" />}
              theme={{ roundness: 12 }}
            />
            <TextInput
              style={styles.input}
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              // left={<TextInput.Icon icon="lock" />}
              theme={{ roundness: 12 }}
            />
            <TextInput
              style={styles.input}
              mode="outlined"
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              // left={<TextInput.Icon icon="lock-check" />}
              theme={{ roundness: 12 }}
            />
            <Button
              mode="contained"
              style={styles.registerButton}
              contentStyle={{ paddingVertical: 10 }}
              labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> : 'Register'}
            </Button>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Button
                mode="text"
                labelStyle={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                Login
              </Button>
            </View>
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
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
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 4,
  },
  logoContainer: {
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 12,
    elevation: 4,
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
    color: '#ff3e55',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#ff914d',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  registerButton: {
    width: '100%',
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  loginContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#ff3e55',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default OwnerRegisterScreen; 