import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Button, Text } from 'react-native-paper';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const { width } = Dimensions.get('window');

const LoginSelectionScreen = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <View style={styles.container}>
        <Text style={styles.title}>Login to LiveInSync</Text>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.ownerButtonLabel}
          onPress={() => navigation.navigate('OwnerLogin')}
        >
          Login as Owner
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.tenantButtonLabel}
          onPress={() => navigation.navigate('TenantLogin')}
        >
          Login as Tenant
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.06,
  },
  title: {
    fontSize: Math.max(20, width * 0.07),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    letterSpacing: 1,
    textAlign: 'center',
  },
  button: {
    width: width * 0.7,
    borderRadius: 32,
    marginVertical: 12,
    backgroundColor: NETFLIX_RED,
    elevation: 3,
    paddingVertical: 8,
  },
  ownerButtonLabel: {
    fontSize: Math.max(14, width * 0.045),
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif-medium',
  },
  tenantButtonLabel: {
    fontSize: Math.max(14, width * 0.045),
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'GeezaPro-Bold' : 'sans-serif-medium',
  },
});

export default LoginSelectionScreen; 