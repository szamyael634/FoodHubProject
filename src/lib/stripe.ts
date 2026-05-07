import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe environment variable: VITE_STRIPE_PUBLISHABLE_KEY must be set.');
}

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const createPaymentIntent = async (amount: number, orderId: string): Promise<PaymentIntentResponse> => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, orderId }),
  });
  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }
  return response.json();
};

export const confirmPayment = async (stripe: Stripe, clientSecret: string, paymentMethod: unknown) => {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethod as any,
  });
  if (error) throw error;
  return paymentIntent;
};

export interface PaymentMethod {
  card: {
    exp_month: number;
    exp_year: number;
    number: string;
    cvc: string;
  };
}
