import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useStore, getCartTotal } from '../store/useStore';
import { CartItem } from '../components';

export function CartPage() {
  const navigate = useNavigate();
  const { cart, selectedRestaurant, clearCart } = useStore();
  const total = getCartTotal(cart);
  const deliveryFee = selectedRestaurant?.delivery_fee || 0;
  const tax = total * 0.08;
  const finalTotal = total + deliveryFee + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add items from a restaurant to get started</p>
          <Link to="/" className="btn-primary">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={selectedRestaurant ? `/restaurant/${selectedRestaurant.id}` : '/'} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900">Your Cart</h1>
              <p className="text-sm text-gray-500">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {selectedRestaurant && (
          <div className="card p-4 mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={selectedRestaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'}
                alt={selectedRestaurant.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium">{selectedRestaurant.name}</h3>
                <p className="text-sm text-gray-500">{selectedRestaurant.cuisine_type}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card p-4 mb-6">
          {cart.map((item) => (
            <CartItem key={item.menu_item.id} item={item} />
          ))}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          
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

          <button
            onClick={() => navigate('/checkout')}
            className="w-full btn-primary mt-6 py-3"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
