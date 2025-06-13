import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientBackground = ({ children }: { children: React.ReactNode }) => (
  <LinearGradient
    colors={["#0f2027", "#2c5364"]}
    style={styles.gradient}
  >
    <StatusBar barStyle="light-content" backgroundColor="#0f2027" />
    <View style={styles.content}>{children}</View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default GradientBackground; 