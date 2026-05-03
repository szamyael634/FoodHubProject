import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Restaurant, MenuItem, CartItem, Order, Notification } from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  menuItems: MenuItem[];
  cart: CartItem[];
  orders: Order[];
  notifications: Notification[];
  searchQuery: string;
  filters: {
    cuisine: string;
    priceRange: [number, number];
    rating: number;
  };
  
  setUser: (user: User | null) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  setMenuItems: (items: MenuItem[]) => void;
  addToCart: (item: MenuItem, quantity?: number, instructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (notificationId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      restaurants: [],
      selectedRestaurant: null,
      menuItems: [],
      cart: [],
      orders: [],
      notifications: [],
      searchQuery: '',
      filters: {
        cuisine: '',
        priceRange: [0, 100],
        rating: 0,
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setRestaurants: (restaurants) => set({ restaurants }),
      
      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
      
      setMenuItems: (items) => set({ menuItems: items }),
      
      addToCart: (item, quantity = 1, instructions) => set((state) => {
        const existingItem = state.cart.find((ci) => ci.menu_item.id === item.id);
        if (existingItem) {
          return {
            cart: state.cart.map((ci) =>
              ci.menu_item.id === item.id
                ? { ...ci, quantity: ci.quantity + quantity }
                : ci
            ),
          };
        }
        return {
          cart: [...state.cart, { menu_item: item, quantity, special_instructions: instructions }],
        };
      }),
      
      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter((ci) => ci.menu_item.id !== itemId),
      })),
      
      updateCartItemQuantity: (itemId, quantity) => set((state) => ({
        cart: quantity > 0
          ? state.cart.map((ci) =>
              ci.menu_item.id === itemId ? { ...ci, quantity } : ci
            )
          : state.cart.filter((ci) => ci.menu_item.id !== itemId),
      })),
      
      clearCart: () => set({ cart: [] }),
      
      setOrders: (orders) => set({ orders }),
      
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      
      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        ),
      })),
      
      setNotifications: (notifications) => set({ notifications }),
      
      markNotificationRead: (notificationId) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
      })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
      })),
    }),
    {
      name: 'foodhub-storage',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const getCartTotal = (cart: CartItem[]) => {
  return cart.reduce((total, item) => total + item.menu_item.price * item.quantity, 0);
};

export const getCartItemCount = (cart: CartItem[]) => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};
