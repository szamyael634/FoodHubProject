import { supabase } from '../lib/supabase';
import type { Restaurant, MenuItem, Order, Review, Notification } from '../types';

export const getRestaurants = async (filters?: {
  cuisine?: string;
  minRating?: number;
  searchQuery?: string;
}): Promise<Restaurant[]> => {
  let query = supabase.from('restaurants').select('*').eq('is_open', true);

  if (filters?.cuisine) {
    query = query.eq('cuisine_type', filters.cuisine);
  }

  if (filters?.minRating) {
    query = query.gte('rating', filters.minRating);
  }

  if (filters?.searchQuery) {
    query = query.ilike('name', `%${filters.searchQuery}%`);
  }

  const { data, error } = await query.order('rating', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  const { data, error } = await supabase.from('restaurants').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createRestaurant = async (restaurant: Omit<Restaurant, 'id' | 'created_at' | 'rating'>) => {
  const { data, error } = await supabase.from('restaurants').insert([restaurant]).select().single();
  if (error) throw error;
  return data;
};

export const updateRestaurant = async (id: string, updates: Partial<Restaurant>) => {
  const { data, error } = await supabase.from('restaurants').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteRestaurant = async (id: string) => {
  const { error } = await supabase.from('restaurants').delete().eq('id', id);
  if (error) throw error;
};

export const getMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('category');
  if (error) throw error;
  return data || [];
};

export const getMenuItemById = async (id: string): Promise<MenuItem> => {
  const { data, error } = await supabase.from('menu_items').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('menu_items').insert([item]).select().single();
  if (error) throw error;
  return data;
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
  const { data, error } = await supabase.from('menu_items').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteMenuItem = async (id: string) => {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getOrderById = async (id: string): Promise<Order> => {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'has_review'>) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ ...order, has_review: false }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
  if (error) throw error;
  return data;
};

export const assignDriverToOrder = async (orderId: string, driverId: string) => {
  const { data, error } = await supabase.from('orders').update({ driver_id: driverId }).eq('id', orderId).select().single();
  if (error) throw error;
  return data;
};

export const getRestaurantOrders = async (restaurantId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getDriverOrders = async (driverId: string): Promise<Order[]> => {
  const { data, error } = await supabase.from('orders').select('*').eq('driver_id', driverId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateOrderHasReview = async (orderId: string) => {
  const { error } = await supabase.from('orders').update({ has_review: true }).eq('id', orderId);
  if (error) throw error;
};

export const getAvailableOrdersForDrivers = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['confirmed', 'ready'])
    .is('driver_id', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const subscribeToNotifications = (userId: string, callback: (notification: Notification) => void) => {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return channel;
};

export const subscribeToOrderUpdates = (orderId: string, callback: (order: Order) => void) => {
  const channel = supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        callback(payload.new as Order);
      }
    )
    .subscribe();

  return channel;
};

export const getReviews = async (restaurantId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('reviews').insert([review]).select().single();
  if (error) throw error;

  if (review.order_id) {
    await updateOrderHasReview(review.order_id);
  }

  return data;
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  if (error) throw error;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
};
