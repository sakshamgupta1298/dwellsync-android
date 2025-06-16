import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { initiatePayment, verifyPayment } from '../services/paymentService';

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  amountContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  payButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
});

export default PaymentScreen; 