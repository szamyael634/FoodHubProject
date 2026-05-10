import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Wallet, ArrowLeft } from 'lucide-react';
import { useStore, getCartTotal } from '../store/useStore';
import { PaymentForm } from '../components';
import { createOrder as createOrderService } from '../services';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, selectedRestaurant, user, clearCart, addOrder } = useStore();
  const [deliveryAddress, setDeliveryAddress] = useState(user?.full_name || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = getCartTotal(cart);
  const deliveryFee = selectedRestaurant?.delivery_fee || 0;
  const tax = total * 0.08;
  const finalTotal = total + deliveryFee + tax;

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    await placeOrder('paid', paymentIntentId);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const placeOrder = async (paymentStatus: 'pending' | 'paid', paymentIntentId?: string) => {
    if (!user || !selectedRestaurant) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderItems = cart.map((item) => ({
        menu_item_id: item.menu_item.id,
        name: item.menu_item.name,
        price: item.menu_item.price,
        quantity: item.quantity,
        special_instructions: item.special_instructions,
      }));

      const order = await createOrderService({
        user_id: user.id,
        restaurant_id: selectedRestaurant.id,
        driver_id: null,
        status: 'pending',
        items: orderItems,
        subtotal: total,
        delivery_fee: deliveryFee,
        tax,
        total: finalTotal,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        stripe_payment_intent_id: paymentIntentId,
      });

      clearCart();
      addOrder(order);
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = () => {
    placeOrder('pending');
  };

  if (cart.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/cart')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-4 font-semibold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Delivery Address</span>
              </h2>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="input-field h-24 resize-none"
                required
              />
            </div>

            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Method</span>
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="sr-only"
                  />
                  <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-500">Pay with Visa, Mastercard, etc.</p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cash' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="sr-only"
                  />
                  <Wallet className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              {selectedRestaurant && (
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
                  <img
                    src={selectedRestaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'}
                    alt={selectedRestaurant.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{selectedRestaurant.name}</h3>
                    <p className="text-sm text-gray-500">{cart.length} items</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {paymentMethod === 'card' ? (
              <div className="card p-6">
                <PaymentForm
                  amount={finalTotal}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            ) : (
              <button
                onClick={handleCashPayment}
                disabled={loading || !deliveryAddress}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
