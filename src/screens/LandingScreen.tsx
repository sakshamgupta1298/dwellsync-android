import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Button, Text, useTheme, Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const LandingScreen = ({ navigation }: any) => {
  const theme = useTheme();
  return (
    <LinearGradient
      colors={["#ff914d", "#ff3e55"]}
      style={styles.gradient}
    >
      <Surface style={styles.container} elevation={0}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')} // Place a modern logo or icon in assets
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>LiveInSync</Text>
        <Text style={styles.tagline}>Smart. Simple. Seamless Rent Management.</Text>
        <Text style={styles.subtitle}>
          Manage your rental journey with ease. For tenants & owners.
        </Text>
        <Button
          mode="contained"
          style={styles.startButton}
          contentStyle={{ paddingVertical: 10 }}
          labelStyle={{ fontSize: 20, fontWeight: 'bold', letterSpacing: 1, color: '#000' }}
          onPress={() => navigation.navigate('Login')}
        >
          Start
        </Button>
      </Surface>
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
    backgroundColor: 'transparent',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.9,
  },
  startButton: {
    width: 200,
    borderRadius: 28,
    elevation: 4,
    backgroundColor: '#fff',
  },
});

export default LandingScreen; 