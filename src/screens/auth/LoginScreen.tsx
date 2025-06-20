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
import GradientBackground from '../GradientBackground';

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

  const handleLogin = async () => {
    if (!tenantId || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      await signIn(tenantId, password);
    } catch (error: any) {
      Alert.alert('Wrong credentials', 'The credentials you entered are incorrect.');
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to LiveInSync</Text>
            <TextInput
              style={styles.input}
              mode="flat"
              label={showRegister ? "Email" : "Tenant ID"}
              value={tenantId}
              textColor='#fff'
              onChangeText={setTenantId}
              autoCapitalize="none"
              keyboardType={showRegister ? "email-address" : "default"}
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
            {showRegister && (
              <Button
                mode="text"
                labelStyle={styles.forgotPasswordLink}
                onPress={() => navigation.navigate('ForgotPassword', { isOwner: showRegister })}
                style={styles.forgotPasswordButton}
              >
                Forgot Password?
              </Button>
            )}
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
          {/* Add legal/about links below the card */}
          <View style={styles.legalLinksRow}>
            <Button
              mode="text"
              labelStyle={styles.legalLink}
              onPress={() => navigation.navigate('PrivacyPolicy')}
              compact
            >
              Privacy Policy
            </Button>
            <Text style={styles.legalDivider}>|</Text>
            <Button
              mode="text"
              labelStyle={styles.legalLink}
              onPress={() => navigation.navigate('TermsAndConditions')}
              compact
            >
              Terms & Conditions
            </Button>
            <Text style={styles.legalDivider}>|</Text>
            <Button
              mode="text"
              labelStyle={styles.legalLink}
              onPress={() => navigation.navigate('AboutUs')}
              compact
            >
              About Us
            </Button>
          </View>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordLink: {
    color: NETFLIX_GRAY,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  legalLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 0,
  },
  legalLink: {
    color: NETFLIX_GRAY,
    textDecorationLine: 'underline',
    fontSize: 14,
    marginHorizontal: 4,
    paddingHorizontal: 0,
    minWidth: 0,
  },
  legalDivider: {
    color: NETFLIX_GRAY,
    fontSize: 16,
    marginHorizontal: 2,
    opacity: 0.7,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 