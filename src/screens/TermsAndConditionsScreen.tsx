import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';

const TermsAndConditionsScreen = () => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms and Conditions</Text>
      <Text style={styles.text}>
        {`Welcome to LiveInSync! By using our app, you agree to the following terms and conditions. Please read them carefully.\n\n1. Acceptance of Terms\nBy accessing or using LiveInSync, you agree to be bound by these Terms and Conditions and our Privacy Policy.\n\n2. Use of the App\n- You must be at least 18 years old to use this app.\n- You agree to provide accurate and complete information.\n- You are responsible for maintaining the confidentiality of your account.\n\n3. Payments\n- All payments made through the app are processed securely.\n- LiveInSync is not responsible for any payment disputes between property owners and tenants.\n\n4. User Conduct\n- You agree not to misuse the app or engage in any unlawful activities.\n- You must not attempt to gain unauthorized access to any part of the app.\n\n5. Intellectual Property\n- All content, trademarks, and data on this app are the property of LiveInSync or its licensors.\n\n6. Limitation of Liability\n- LiveInSync is not liable for any indirect, incidental, or consequential damages arising from your use of the app.\n\n7. Termination\n- We reserve the right to suspend or terminate your access to the app at our discretion.\n\n8. Changes to Terms\n- We may update these Terms and Conditions at any time. Continued use of the app constitutes acceptance of the new terms.\n\nContact Us:\nFor any questions regarding these Terms and Conditions, please contact us at admin@liveinsync.in.`}
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

export default TermsAndConditionsScreen; 