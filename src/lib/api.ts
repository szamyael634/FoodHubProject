import { supabase } from './supabase';
import type { Restaurant, MenuItem, Order, Review, Notification } from '../types';

// Restaurant APIs
export const getRestaurants = async (filters?: { cuisine?: string; search?: string }): Promise<Restaurant[]> => {
  let query = supabase.from('restaurants').select('*').eq('is_open', true);
  
  if (filters?.cuisine) {
    query = query.eq('cuisine_type', filters.cuisine);
  }
  
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  
  const { data, error } = await query.order('rating', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createRestaurant = async (restaurant: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateRestaurant = async (id: string, updates: Partial<Restaurant>): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Menu Item APIs
export const getMenuItems = async (restaurantId: string, category?: string): Promise<MenuItem[]> => {
  let query = supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).eq('is_available', true);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('category');
  if (error) throw error;
  return data || [];
};

export const getMenuItemById = async (id: string): Promise<MenuItem | null> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const getMenuCategories = async (restaurantId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('category')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true);
  if (error) throw error;
  return [...new Set(data?.map(item => item.category) || [])];
};

export const createMenuItem = async (menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(menuItem)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
  const { data, error } = await supabase
    .from('menu_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
};

// Order APIs
export const getOrders = async (userId?: string, status?: string): Promise<Order[]> => {
  let query = supabase.from('orders').select('*');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateOrderPaymentStatus = async (orderId: string, paymentStatus: Order['payment_status'], paymentIntentId?: string): Promise<Order> => {
  const updates: Partial<Order> = { 
    payment_status: paymentStatus, 
    updated_at: new Date().toISOString() 
  };
  if (paymentIntentId) {
    updates.stripe_payment_intent_id = paymentIntentId;
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Review APIs
export const getReviews = async (restaurantId?: string): Promise<Review[]> => {
  let query = supabase.from('reviews').select('*');
  
  if (restaurantId) {
    query = query.eq('restaurant_id', restaurantId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Notification APIs
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count || 0;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
};

// Analytics APIs
export const getRestaurantAnalytics = async (restaurantId: string, days: number = 30): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularItems: { name: string; count: number }[];
}> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total, items')
    .eq('restaurant_id', restaurantId)
    .eq('status', 'delivered')
    .gte('created_at', startDate.toISOString());
  
  if (ordersError) throw ordersError;
  
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Count popular items
  const itemCounts: Record<string, number> = {};
  orders?.forEach(order => {
    order.items?.forEach((item: { name: string; quantity: number }) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });
  
  const popularItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    popularItems
  };
};
