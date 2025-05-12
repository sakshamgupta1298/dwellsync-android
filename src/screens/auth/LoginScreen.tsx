import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../utils/AuthContext';

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
    <View style={styles.container}>
      <Text style={styles.title}>Rent Manager</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tenant ID or Email"
          value={tenantId}
          onChangeText={setTenantId}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('OwnerRegister')}>
          <Text style={styles.registerLink}>Register as Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 16,
  },
  registerLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
});

export default LoginScreen; 