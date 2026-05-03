import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { getStripe } from '../lib/stripe';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe not loaded');

      const [expMonth, expYear] = expiry.split('/');
      
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(expMonth),
          exp_year: parseInt('20' + expYear),
          cvc,
        },
        billing_details: { name },
      });

      if (error) {
        onError(error.message);
        return;
      }

      if (paymentMethod) {
        onSuccess(paymentMethod.id);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            className="input-field pl-10"
            maxLength={19}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            className="input-field"
            maxLength={5}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
          <input
            type="text"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            className="input-field"
            maxLength={4}
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <span>Processing...</span>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Pay ${amount.toFixed(2)}</span>
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 text-center flex items-center justify-center space-x-1">
        <Lock className="w-3 h-3" />
        <span>Payments secured by Stripe</span>
      </p>
    </form>
  );
}
