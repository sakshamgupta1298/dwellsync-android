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
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../utils/AuthContext';
import GradientBackground from '../GradientBackground';
import { ownerService } from '../../services/api';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
  showRegister?: boolean;
}

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const LoginScreen = ({ navigation, showRegister = true }: LoginScreenProps) => {
  const [tenantId, setTenantId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!tenantId || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      await signIn(tenantId, password);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.error || 'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setForgotLoading(true);
    try {
      const response = await ownerService.forgotPassword(forgotEmail);
      console.log('Forgot password response:', response);
      if (response.message) {
        Alert.alert('Success', response.message);
        setForgotVisible(false);
        setForgotEmail('');
      } else {
        Alert.alert('Error', 'Unexpected response from server');
      }
    } catch (e: any) {
      console.error('Forgot password error:', e);
      Alert.alert(
        'Error',
        e.response?.data?.error || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setForgotLoading(false);
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to LiveInSync</Text>
            <TextInput
              style={styles.input}
              mode="flat"
              label="Tenant ID or Email"
              value={tenantId}
              textColor='#fff'
              onChangeText={setTenantId}
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
              textColor='#fff'
              value={password}
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
            <TouchableOpacity onPress={() => setForgotVisible(true)} style={{ alignSelf: 'flex-end', marginBottom: 12 }}>
              <Text style={{ color: NETFLIX_RED, fontWeight: 'bold' }}>Forgot Password?</Text>
            </TouchableOpacity>
            <Button
              mode="contained"
              style={styles.loginButton}
              contentStyle={{ paddingVertical: 12 }}
              labelStyle={styles.loginButtonLabel}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : 'Login'}
            </Button>
            {showRegister && (
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account?</Text>
                <Button
                  mode="text"
                  labelStyle={styles.registerLink}
                  onPress={() => navigation.navigate('OwnerRegister')}
                >
                  Register as Owner
                </Button>
              </View>
            )}
          </Surface>
        </View>
        <Modal visible={forgotVisible} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(20,20,20,0.92)' }}>
            <View style={{ backgroundColor: NETFLIX_CARD, padding: 24, borderRadius: 16, width: '85%' }}>
              <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12, fontWeight: 'bold', textAlign: 'center' }}>Reset Password</Text>
              <TextInput
                style={{ backgroundColor: '#181818', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 16 }}
                placeholder="Enter your email"
                placeholderTextColor={NETFLIX_GRAY}
                value={forgotEmail}
                onChangeText={setForgotEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={{ backgroundColor: NETFLIX_RED, borderRadius: 24, padding: 12, alignItems: 'center' }}
                onPress={handleForgotPassword}
                disabled={forgotLoading}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{forgotLoading ? 'Sending...' : 'Send Reset Link'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setForgotVisible(false)} style={{ marginTop: 16 }}>
                <Text style={{ color: NETFLIX_GRAY, textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  loginButton: {
    width: '100%',
    borderRadius: 32,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: NETFLIX_RED,
    elevation: 0,
    alignSelf: 'center',
  },
  loginButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  registerContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  registerText: {
    color: NETFLIX_GRAY,
    fontSize: 15,
  },
  registerLink: {
    color: NETFLIX_RED,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default LoginScreen; 