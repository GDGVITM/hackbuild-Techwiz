import { NextRequest, NextResponse } from 'next/server';
// import { createPaymentIntent } from '@/lib/payments/stripe';
import { verifyToken } from '@/lib/auth/jwt';
import { createPaymentIntent } from '@/lib/payment/stripe';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { amount, milestoneId } = await request.json();
    
    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount);
    
    // Update milestone status to 'funded'
    // Implementation would update milestone in database
    
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}