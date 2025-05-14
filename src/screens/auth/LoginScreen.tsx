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

const LoginScreen = ({ navigation }: any) => {
  const [tenantId, setTenantId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to DwellSync</Text>
            <TextInput
              style={styles.input}
              mode="outlined"
              label="Tenant ID or Email"
              value={tenantId}
              onChangeText={setTenantId}
              autoCapitalize="none"
              keyboardType="email-address"
              // left={<TextInput.Icon icon="account" />}
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
            <Button
              mode="contained"
              style={styles.loginButton}
              contentStyle={{ paddingVertical: 10 }}
              labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> : 'Login'}
            </Button>
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
  loginButton: {
    width: '100%',
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  registerContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 15,
  },
  registerLink: {
    color: '#ff3e55',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default LoginScreen; 