import React from 'react';
import { View, StyleSheet, Image, Dimensions, StatusBar } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';

const { width } = Dimensions.get('window');

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const LandingScreen = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={NETFLIX_BG} />
      <Surface style={styles.container} elevation={0}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>LiveInSync</Text>
        <Text style={styles.tagline}>India's Smartest Rent App</Text>
        <Text style={styles.subtitle}>
        Unlock Effortless Living, Experience Smart Renting.
        </Text>
        <Button
          mode="contained"
          style={styles.startButton}
          contentStyle={{ paddingVertical: 10 }}
          labelStyle={{ fontSize: 20, fontWeight: 'bold', letterSpacing: 1, color: '#fff' }}
          onPress={() => navigation.navigate('LoginSelection')}
        >
          Start
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: width * 0.06,
  },
  logoContainer: {
    marginBottom: 32,
    backgroundColor: NETFLIX_CARD,
    borderRadius: 100,
    padding: 22,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  logo: {
    width: width * 0.28,
    height: width * 0.28,
  },
  title: {
    fontStyle: 'normal',
    fontFamily: 'Roboto',
    fontSize: Math.max(28, width * 0.09),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontStyle: 'normal',
    fontFamily: 'Roboto',
    fontSize: Math.max(16, width * 0.055),
    color: NETFLIX_RED,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontStyle: 'italic',
    fontFamily: 'Roboto',
    fontSize: Math.max(12, width * 0.02),
    color: NETFLIX_GRAY,
    marginBottom: 44,
    textAlign: 'center',
    opacity: 0.92,
  },
  startButton: {
    width: width * 0.6,
    borderRadius: 32,
    elevation: 6,
    backgroundColor: NETFLIX_RED,
    shadowColor: NETFLIX_RED,
  },
});

export default LandingScreen; 