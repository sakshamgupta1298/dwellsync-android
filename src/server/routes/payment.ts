import express from 'express';
import crypto from 'crypto';
import { RAZORPAY_CONFIG } from '../../config/razorpay';

const router = express.Router();

interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const verifyPaymentSignature = (data: PaymentVerificationData, secret: string): boolean => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  
  // Create the signature string
  const signatureString = `${razorpay_order_id}|${razorpay_payment_id}`;
  
  // Generate the expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signatureString)
    .digest('hex');
  
  // Compare the signatures
  return expectedSignature === razorpay_signature;
};

router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify the payment signature
    const isValid = verifyPaymentSignature(
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      },
      RAZORPAY_CONFIG.secretKey
    );

    if (isValid) {
      // Payment is verified
      // Here you would typically:
      // 1. Update your database to mark the payment as successful
      // 2. Update the tenant's payment history
      // 3. Send notifications to both tenant and landlord

      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router; 