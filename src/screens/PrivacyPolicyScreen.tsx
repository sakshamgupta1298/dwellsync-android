import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';

const PrivacyPolicyScreen = () => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.text}>
        {`LiveInSync is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application ("App"). By using LiveInSync, you agree to the collection and use of information in accordance with this policy.\n\nInformation We Collect:\n- Personal Information: Name, email address, phone number, property details, payment information, and any other information you provide.\n- Usage Data: Information about how you use the app, including device information, log data, and usage patterns.\n- Location Data: With your permission, we may collect and process information about your actual location.\n\nHow We Use Your Information:\n- To provide and maintain our services\n- To process payments and manage property-related transactions\n- To communicate with you about your account or transactions\n- To improve our app and develop new features\n- To ensure security and prevent fraud\n\nInformation Sharing:\nWe do not sell or rent your personal information. We may share information with:\n- Service providers who assist in operating the app (e.g., payment processors)\n- Law enforcement or regulatory authorities if required by law\n\nData Security:\nWe use industry-standard security measures to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure.\n\nYour Rights:\nYou may access, update, or delete your personal information by contacting us at admin@liveinsync.in.\n\nChanges to This Policy:\nWe may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.\n\nContact Us:\nIf you have any questions about this Privacy Policy, please contact us at admin@liveinsync.in.`}
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

export default PrivacyPolicyScreen; 