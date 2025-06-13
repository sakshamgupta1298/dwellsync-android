import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NETFLIX_BG = '#141414';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const TenantRegisterScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tenant Registration</Text>
      <Text style={styles.text}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NETFLIX_BG,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 1,
  },
  text: {
    fontSize: 20,
    color: NETFLIX_GRAY,
    textAlign: 'center',
  },
});

export default TenantRegisterScreen; 