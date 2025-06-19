import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';

const AboutUsScreen = () => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>About Us</Text>
      <Text style={styles.text}>
        {`LiveInSync is a modern property management app designed to simplify the lives of property owners and tenants. Our mission is to streamline rent collection, utility tracking, and communication between owners and tenants through a secure, user-friendly mobile platform.\n\nKey Features:\n- Secure login and OTP-based password reset\n- Owner and tenant dashboards\n- Digital meter reading submissions with image uploads\n- Automated rent and utility bill management\n- Integrated payment gateway for seamless transactions\n- Netflix-inspired, intuitive user interface\n\nAt LiveInSync, we are committed to providing a reliable and efficient solution for property management, ensuring transparency, security, and convenience for all users.\n\nContact:\nFor support or inquiries, please email us at admin@liveinsync.in.`}
      </Text>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#E50914', marginBottom: 16 },
  text: { color: '#fff', fontSize: 16, lineHeight: 24 },
});

export default AboutUsScreen; 