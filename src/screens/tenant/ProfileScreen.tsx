import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tenant Profile Screen (To be implemented)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NETFLIX_BG,
  },
  text: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;