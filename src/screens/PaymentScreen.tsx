import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { initiatePayment, verifyPayment } from '../services/paymentService';

const NETFLIX_BG = '#141414';
const NETFLIX_CARD = '#232323';
const NETFLIX_RED = '#E50914';
const NETFLIX_GRAY = '#b3b3b3';

const { width } = Dimensions.get('window');

interface PaymentScreenProps {
  route: {
    params: {
      rentAmount: number;
      propertyId: string;
      tenantId: string;
    };
  };
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route }) => {
  const { rentAmount, propertyId, tenantId } = route.params;
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const paymentResult = await initiatePayment({
        amount: rentAmount,
        currency: 'INR',
        description: `Rent payment for property ${propertyId}`,
        tenantId,
        propertyId,
      });

      if (paymentResult.success) {
        // Verify the payment on the backend
        const verificationResult = await verifyPayment(
          paymentResult.paymentId,
          paymentResult.orderId,
          paymentResult.signature
        );

        if (verificationResult.success) {
          Alert.alert('Success', 'Payment completed successfully!');
        } else {
          Alert.alert('Error', 'Payment verification failed');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: NETFLIX_BG }}>
      <StatusBar barStyle="light-content" backgroundColor={NETFLIX_BG} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Rent Payment</Text>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Pay:</Text>
            <Text style={styles.amount}>₹{rentAmount}</Text>
          </View>

          <Button
            mode="contained"
            onPress={handlePayment}
            style={styles.payButton}
            labelStyle={styles.payButtonText}
            buttonColor={NETFLIX_RED}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              'Pay Now'
            )}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NETFLIX_BG,
    padding: width * 0.05,
  },
  content: {
    flex: 1,
    paddingTop: width * 0.05,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
    letterSpacing: 1,
  },
  amountContainer: {
    backgroundColor: NETFLIX_CARD,
    padding: 30,
    borderRadius: 24,
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#222',
  },
  amountLabel: {
    fontSize: 18,
    color: NETFLIX_GRAY,
    marginBottom: 10,
  },
  amount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  payButton: {
    marginTop: 20,
    paddingVertical: 8,
    width: '100%',
    maxWidth: 300,
    borderRadius: 32,
    elevation: 0,
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});

export default PaymentScreen; 