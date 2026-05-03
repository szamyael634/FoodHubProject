import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getRestaurantOrders, updateOrderStatus } from '../services';
import type { User, Order, MenuItem } from '../types';

export function RestaurantDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      navigate('/login');
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
    if (profile) setUser(profile);

    const { data: restData } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', authUser.id)
      .single();

    if (restData) {
      setRestaurant(restData);
      fetchOrders(restData.id);
      fetchMenuItems(restData.id);
    } else {
      // No restaurant found, redirect to create
      navigate('/restaurant/create');
    }
    setLoading(false);
  };

  const fetchOrders = async (restaurantId: string) => {
    const data = await getRestaurantOrders(restaurantId);
    setOrders(data);
  };

  const fetchMenuItems = async (restaurantId: string) => {
    const { data } = await supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId);
    setMenuItems(data || []);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders(restaurant.id);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const toggleMenuItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      await supabase.from('menu_items').update({ is_available: !isAvailable }).eq('id', itemId);
      fetchMenuItems(restaurant.id);
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await supabase.from('menu_items').delete().eq('id', itemId);
      fetchMenuItems(restaurant.id);
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
          {restaurant && <p className="text-gray-600">{restaurant.name}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'menu' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Menu Management
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="card p-8 text-center text-gray-500">No orders yet</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                      <p className="text-sm text-gray-600">{order.items.length} items</p>
                      <p className="text-sm text-gray-600">${order.total.toFixed(2)}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'preparing'
                          ? 'bg-purple-100 text-purple-800'
                          : order.status === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm</span>
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'preparing')}
                        className="flex items-center space-x-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Start Preparing</span>
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'ready')}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Ready</span>
                      </button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Add Menu Item</span>
            </button>

            {menuItems.length === 0 ? (
              <div className="card p-8 text-center text-gray-500">No menu items yet</div>
            ) : (
              menuItems.map((item) => (
                <div key={item.id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleMenuItemAvailability(item.id, item.is_available)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        item.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMenuItem(item.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
