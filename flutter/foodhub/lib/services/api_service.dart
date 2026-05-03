import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';

class ApiService {
  final SupabaseClient _client = Supabase.instance.client;

  // Restaurant methods
  Future<List<Restaurant>> getRestaurants() async {
    final response = await _client
        .from('restaurants')
        .select()
        .eq('is_open', true)
        .order('rating', ascending: false);
    return (response as List).map((e) => Restaurant.fromJson(e)).toList();
  }

  Future<Restaurant> getRestaurantById(String id) async {
    final response = await _client
        .from('restaurants')
        .select()
        .eq('id', id)
        .single();
    return Restaurant.fromJson(response);
  }

  // Menu items methods
  Future<List<MenuItem>> getMenuItems(String restaurantId) async {
    final response = await _client
        .from('menu_items')
        .select()
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);
    return (response as List).map((e) => MenuItem.fromJson(e)).toList();
  }

  // Orders methods
  Future<List<Order>> getOrders(String userId) async {
    final response = await _client
        .from('orders')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return (response as List).map((e) => Order.fromJson(e)).toList();
  }

  Future<Order> getOrderById(String id) async {
    final response = await _client
        .from('orders')
        .select()
        .eq('id', id)
        .single();
    return Order.fromJson(response);
  }

  Future<Order> createOrder({
    required String userId,
    required String restaurantId,
    required List<CartItem> items,
    required String deliveryAddress,
    required String paymentMethod,
  }) async {
    final subtotal = items.fold<double>(
      0,
      (sum, item) => sum + (item.menuItem.price * item.quantity),
    );
    final deliveryFee = 5.0;
    final tax = subtotal * 0.08;
    final total = subtotal + deliveryFee + tax;

    final orderData = {
      'user_id': userId,
      'restaurant_id': restaurantId,
      'status': 'pending',
      'items': items.map((e) => e.toJson()).toList(),
      'subtotal': subtotal,
      'delivery_fee': deliveryFee,
      'tax': tax,
      'total': total,
      'delivery_address': deliveryAddress,
      'payment_method': paymentMethod,
      'payment_status': 'pending',
    };

    final response = await _client
        .from('orders')
        .insert(orderData)
        .select()
        .single();
    return Order.fromJson(response);
  }

  // Reviews methods
  Future<List<Review>> getReviews(String restaurantId) async {
    final response = await _client
        .from('reviews')
        .select()
        .eq('restaurant_id', restaurantId);
    return (response as List).map((e) => Review.fromJson(e)).toList();
  }

  // Profile methods
  Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    final response = await _client
        .from('profiles')
        .select()
        .eq('id', userId)
        .maybeSingle();
    return response;
  }

  Future<void> updateUserProfile(
    String userId,
    Map<String, dynamic> updates,
  ) async {
    await _client.from('profiles').update(updates).eq('id', userId);
  }
}
