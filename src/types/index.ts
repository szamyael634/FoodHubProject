export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'customer' | 'restaurant' | 'driver' | 'admin';
  created_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  image_url: string;
  address: string;
  phone: string;
  cuisine_type: string;
  rating: number;
  delivery_fee: number;
  delivery_time: number;
  is_open: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  created_at: string;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  driver_id?: string | null;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  delivery_address: string;
  payment_method: 'card' | 'cash';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  has_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

export interface Review {
  id: string;
  order_id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system';
  is_read: boolean;
  created_at: string;
}
