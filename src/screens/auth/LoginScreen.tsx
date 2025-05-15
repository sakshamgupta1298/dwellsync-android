import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useAuth } from '../../utils/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import { commonStyles, screenStyles, scale } from '../../utils/responsiveStyles';

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

    setLoading(true);
    try {
      await signIn(tenantId, password);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#ff914d", "#ff3e55"]} style={{ flex: 1 }}>
      <View style={screenStyles.auth.container}>
        <Image
          source={require('../../assets/logo.png')}
          style={screenStyles.auth.logo}
          resizeMode="contain"
        />
        
        <View style={screenStyles.auth.form}>
          <TextInput
            label="Tenant ID"
            value={tenantId}
            onChangeText={setTenantId}
            style={commonStyles.input}
            mode="outlined"
            theme={{ colors: { primary: '#ff3e55' } }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={commonStyles.input}
            mode="outlined"
            theme={{ colors: { primary: '#ff3e55' } }}
          />

          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: '#ff3e55' }]}
            onPress={handleLogin}
            disabled={loading}>
            <Text style={{ color: '#fff', textAlign: 'center', fontSize: scale.font(16), fontWeight: 'bold' }}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={[commonStyles.row, { justifyContent: 'center', marginTop: scale.height(16) }]}>
            <TouchableOpacity onPress={() => navigation.navigate('OwnerRegister')}>
              <Text style={{ color: '#fff', fontSize: scale.font(14) }}>
                Register as Owner
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default LoginScreen; 