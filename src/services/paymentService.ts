import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';
import { RAZORPAY_CONFIG } from '../config/razorpay';

interface PaymentOptions {
  amount: number;
  currency: string;
  description: string;
  tenantId: string;
  propertyId: string;
  email?: string;
  contact?: string;
  name?: string;
}

export const initiatePayment = async (options: PaymentOptions) => {
  try {
    const paymentData = {
      key: RAZORPAY_CONFIG.keyId,
      amount: options.amount * 100, // Convert to paise
      currency: options.currency,
      name: 'LiveInSync',
      description: options.description,
      image: 'https://your-logo-url.com/logo.png', // Replace with your logo URL
      prefill: {
        email: options.email || '',
        contact: options.contact || '',
        name: options.name || '',
      },
      theme: { color: '#3399cc' },
      notes: {
        tenantId: options.tenantId,
        propertyId: options.propertyId,
      },
      modal: {
        ondismiss: () => {
          Alert.alert('Payment Cancelled', 'You cancelled the payment');
        }
      }
    };

    const response = await RazorpayCheckout.open(paymentData);
    
    if (response) {
      return {
        success: true,
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
      };
    }
  } catch (error: any) {
    Alert.alert(
      'Payment Failed',
      error.description || error.message || 'Something went wrong'
    );
    return {
      success: false,
      error: error.description || error.message,
    };
  }
};

export const verifyPayment = async (paymentId: string, orderId: string, signature: string) => {
  try {
    const response = await fetch('YOUR_BACKEND_URL/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        orderId,
        signature,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
}; 