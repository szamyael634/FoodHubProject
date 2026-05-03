import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getAvailableOrdersForDrivers, getDriverOrders, assignDriverToOrder, updateOrderStatus } from '../services';
import type { Order, User } from '../types';

export function DriverDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'my_orders'>('available');
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      navigate('/login');
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
    if (profile) setUser(profile);

    if (profile?.role === 'driver') {
      fetchOrders();
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const available = await getAvailableOrdersForDrivers();
    const myOrders = await getDriverOrders(authUser.id);
    
    setAvailableOrders(available);
    setMyOrders(myOrders);
  };

  const handleAcceptOrder = async (orderId: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    try {
      await assignDriverToOrder(orderId, authUser.id);
      await fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'delivered');
      await fetchOrders();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'available' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Available Orders
          </button>
          <button
            onClick={() => setActiveTab('my_orders')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my_orders' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            My Deliveries
          </button>
        </div>

        {activeTab === 'available' ? (
          <div className="space-y-4">
            {availableOrders.length === 0 ? (
              <div className="card p-8 text-center text-gray-500">No available orders</div>
            ) : (
              availableOrders.map((order) => (
                <div key={order.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                      <p className="text-sm text-gray-600">{order.items.length} items</p>
                      <p className="text-sm text-gray-600">${order.total.toFixed(2)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <Package className="w-4 h-4" />
                    <span>{order.delivery_address}</span>
                  </div>
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="w-full btn-primary py-2"
                  >
                    Accept Order
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.length === 0 ? (
              <div className="card p-8 text-center text-gray-500">No active deliveries</div>
            ) : (
              myOrders.map((order) => (
                <div key={order.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                      <p className="text-sm text-gray-600">{order.items.length} items</p>
                      <p className="text-sm text-gray-600">${order.total.toFixed(2)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'picked_up' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <Package className="w-4 h-4" />
                    <span>{order.delivery_address}</span>
                  </div>
                  {order.status === 'picked_up' && (
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
