import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order, Restaurant } from '../types';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready', icon: '📦' },
  { key: 'picked_up', label: 'Picked Up', icon: '🚗' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  ready: 'bg-purple-100 text-purple-800 border-purple-200',
  picked_up: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      if (orderData?.restaurant_id) {
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', orderData.restaurant_id)
          .single();

        setRestaurant(restaurantData);
      }

      setOrder(orderData);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? statusSteps.findIndex((s) => s.key === order.status) : -1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Order not found</p>
          <Link to="/orders" className="text-primary-500 hover:text-primary-600 mt-2 inline-block">
            Go back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="ml-4 font-semibold text-gray-900">Order Details</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="card p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString()} at{' '}
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <h2 className="text-xl font-bold mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <div className="relative">
              <div className="flex justify-between">
                {statusSteps.slice(0, -1).map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        index <= currentStepIndex
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <p className="text-xs mt-2 text-center hidden sm:block">{step.label}</p>
                  </div>
                ))}
              </div>
              <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 -z-0">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${(currentStepIndex / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {restaurant && (
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Restaurant</h3>
            <div className="flex items-center space-x-4">
              <img
                src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'}
                alt={restaurant.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium">{restaurant.name}</h4>
                <p className="text-sm text-gray-500">{restaurant.cuisine_type}</p>
                <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Delivery Address</h3>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <p className="text-gray-700">{order.delivery_address}</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.quantity}x {item.name}</p>
                  {item.special_instructions && (
                    <p className="text-sm text-gray-500">{item.special_instructions}</p>
                  )}
                </div>
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span>${order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Payment</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium capitalize">{order.payment_method} on Delivery</p>
              <p className="text-sm text-gray-500">
                Status: <span className="capitalize">{order.payment_status}</span>
              </p>
            </div>
            <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
          </div>
        </div>

        {order.status === 'delivered' && !order.has_review && (
          <div className="card p-6">
            <button
              onClick={() => navigate(`/orders/${id}/review`)}
              className="w-full btn-primary py-3"
            >
              Leave a Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
