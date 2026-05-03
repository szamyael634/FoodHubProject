<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/flutter/foodhub/lib/providers/providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';

final supabaseProvider = Provider<SupabaseClient>((ref) => Supabase.instance.client);

final authProvider = FutureProvider<User?>((ref) async {
  final supabase = ref.read(supabaseProvider);
  final session = supabase.auth.currentSession;
  
  if (session?.user == null) return null;
  
  final response = await supabase
    .from('profiles')
    .select()
    .eq('id', session!.user.id)
    .maybeSingle();
  
  if (response == null) return null;
  return User.fromJson(response);
});

final restaurantsProvider = FutureProvider<List<Restaurant>>((ref) async {
  final supabase = ref.read(supabaseProvider);
  final response = await supabase
    .from('restaurants')
    .select()
    .eq('is_open', true)
    .order('rating', ascending: false);
  
  return response.map((json) => Restaurant.fromJson(json)).toList();
});

final restaurantProvider = FutureProvider.family<Restaurant, String>((ref, id) async {
  final supabase = ref.read(supabaseProvider);
  final response = await supabase
    .from('restaurants')
    .select()
    .eq('id', id)
    .single();
  
  return Restaurant.fromJson(response);
});

final menuItemsProvider = FutureProvider.family<List<MenuItem>, String>((ref, restaurantId) async {
  final supabase = ref.read(supabaseProvider);
  final response = await supabase
    .from('menu_items')
    .select()
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('category');
  
  return response.map((json) => MenuItem.fromJson(json)).toList();
});

final ordersProvider = FutureProvider<List<Order>>((ref) async {
  final supabase = ref.read(supabaseProvider);
  final user = await ref.read(authProvider.future);
  
  if (user == null) return [];
  
  final response = await supabase
    .from('orders')
    .select()
    .eq('user_id', user.id)
    .order('created_at', ascending: false);
  
  return response.map((json) => Order.fromJson(json)).toList();
});

final orderProvider = FutureProvider.family<Order, String>((ref, id) async {
  final supabase = ref.read(supabaseProvider);
  final response = await supabase
    .from('orders')
    .select()
    .eq('id', id)
    .single();
  
  return Order.fromJson(response);
});

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addItem(MenuItem item, {int quantity = 1, String? instructions}) {
    final existingIndex = state.indexWhere((ci) => ci.menuItem.id == item.id);
    
    if (existingIndex >= 0) {
      final updated = [...state];
      updated[existingIndex].quantity += quantity;
      state = updated;
    } else {
      state = [...state, CartItem(menuItem: item, quantity: quantity, specialInstructions: instructions)];
    }
  }

  void removeItem(String itemId) {
    state = state.where((ci) => ci.menuItem.id != itemId).toList();
  }

  void updateQuantity(String itemId, int quantity) {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    state = state.map((ci) {
      if (ci.menuItem.id == itemId) {
        return CartItem(menuItem: ci.menuItem, quantity: quantity, specialInstructions: ci.specialInstructions);
      }
      return ci;
    }).toList();
  }

  void clear() {
    state = [];
  }

  double get total => state.fold(0, (sum, item) => sum + (item.menuItem.price * item.quantity));
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) => CartNotifier());

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  final SupabaseClient _supabase;
  
  AuthNotifier(this._supabase) : super(const AsyncValue.loading()) {
    _init();
  }

  Future<void> _init() async {
    final session = _supabase.auth.currentSession;
    if (session?.user == null) {
      state = const AsyncValue.data(null);
      return;
    }
    
    final response = await _supabase
      .from('profiles')
      .select()
      .eq('id', session!.user.id)
      .maybeSingle();
    
    state = response != null 
      ? AsyncValue.data(User.fromJson(response))
      : const AsyncValue.data(null);
  }

  Future<void> signIn(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      await _supabase.auth.signInWithPassword(email: email, password: password);
      await _init();
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signUp(String email, String password, String fullName) async {
    state = const AsyncValue.loading();
    try {
      await _supabase.auth.signUp(email: email, password: password, options: AuthOptions(
        data: {'full_name': fullName},
      ));
      await _init();
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
    state = const AsyncValue.data(null);
  }
}

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  return AuthNotifier(ref.read(supabaseProvider));
});
=======
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';

final supabaseProvider = Provider<SupabaseClient>((ref) => Supabase.instance.client);

final authProvider = FutureProvider<User?>((ref) async {
  final supabase = ref.read(supabaseProvider);
  final session = supabase.auth.currentSession;

  if (session?.user == null) return null;

  final response = await supabase
    .from('profiles')
    .select()
    .eq('id', session!.user.id)
    .maybeSingle();

  if (response == null) return null;
  return User.fromJson(response);
});

final orderDetailProvider = FutureProvider.family<Order, String>((ref, id) async {
  final supabase = ref.read(supabaseProvider);
  final response = await supabase
    .from('orders')
    .select()
    .eq('id', id)
    .single();

  return Order.fromJson(response);
});

final restaurantsProvider = FutureProvider<List<Restaurant>>((ref) async {
  final supabase = ref.read(supabaseProvider);
  final response = await supabase
    .from('restaurants')
    .select()
    .eq('is_open', true)
    .order('rating', ascending: false);
  
  return response.map((json) => Restaurant.fromJson(json)).toList();
});

final restaurantProvider = FutureProvider.family<Restaurant, String>((ref, id) async {
  final supabase = ref.read(supabaseProvider);
  final response = await supabase
    .from('restaurants')
    .select()
    .eq('id', id)
    .single();
  
  return Restaurant.fromJson(response);
});

final menuItemsProvider = FutureProvider.family<List<MenuItem>, String>((ref, restaurantId) async {
  final supabase = ref.read(supabaseProvider);
  final response = await supabase
    .from('menu_items')
    .select()
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('category');
  
  return response.map((json) => MenuItem.fromJson(json)).toList();
});

final ordersProvider = FutureProvider<List<Order>>((ref) async {
  final supabase = ref.read(supabaseProvider);
  final user = await ref.read(authProvider.future);
  
  if (user == null) return [];
  
  final response = await supabase
    .from('orders')
    .select()
    .eq('user_id', user.id)
    .order('created_at', ascending: false);
  
  return response.map((json) => Order.fromJson(json)).toList();
});

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addItem(MenuItem item, {int quantity = 1, String? instructions}) {
    final existingIndex = state.indexWhere((ci) => ci.menuItem.id == item.id);
    
    if (existingIndex >= 0) {
      final updated = [...state];
      updated[existingIndex].quantity += quantity;
      state = updated;
    } else {
      state = [...state, CartItem(menuItem: item, quantity: quantity, specialInstructions: instructions)];
    }
  }

  void removeItem(String itemId) {
    state = state.where((ci) => ci.menuItem.id != itemId).toList();
  }

  void updateQuantity(String itemId, int quantity) {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    state = state.map((ci) {
      if (ci.menuItem.id == itemId) {
        return CartItem(menuItem: ci.menuItem, quantity: quantity, specialInstructions: ci.specialInstructions);
      }
      return ci;
    }).toList();
  }

  void clear() {
    state = [];
  }

  double get total => state.fold(0, (sum, item) => sum + (item.menuItem.price * item.quantity));
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) => CartNotifier());

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  final SupabaseClient _supabase;

  AuthNotifier(this._supabase) : super(const AsyncValue.loading()) {
    _init();
  }

  Future<void> _init() async {
    final session = _supabase.auth.currentSession;
    if (session?.user == null) {
      state = const AsyncValue.data(null);
      return;
    }

    final response = await _supabase
      .from('profiles')
      .select()
      .eq('id', session!.user.id)
      .maybeSingle();

    state = response != null
      ? AsyncValue.data(User.fromJson(response))
      : const AsyncValue.data(null);
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      await _supabase.auth.signInWithPassword(email: email, password: password);
      await _init();
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> register(String email, String password, String fullName, [String? phone]) async {
    state = const AsyncValue.loading();
    try {
      await _supabase.auth.signUp(
        email: email,
        password: password,
        options: AuthOptions(
          data: {'full_name': fullName},
        ),
      );
      
      if (phone != null) {
        await _supabase
          .from('profiles')
          .update({'phone': phone})
          .eq('email', email);
      }
      
      await _init();
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
    state = const AsyncValue.data(null);
  }
}

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  return AuthNotifier(ref.read(supabaseProvider));
});

class OrderNotifier extends StateNotifier<AsyncValue<Order?>> {
  final SupabaseClient _supabase;

  OrderNotifier(this._supabase) : super(const AsyncValue.data(null));

  Future<Order> createOrder({
    required String userId,
    required String restaurantId,
    required List<CartItem> items,
    required String deliveryAddress,
    required String paymentMethod,
  }) async {
    state = const AsyncValue.loading();
    try {
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

      final response = await _supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single();

      final order = Order.fromJson(response);
      state = AsyncValue.data(order);
      return order;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }
}

final orderProvider = StateNotifierProvider<OrderNotifier, AsyncValue<Order?>>((ref) {
  return OrderNotifier(ref.read(supabaseProvider));
});
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/flutter/foodhub/lib/providers/providers.dart
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/flutter/foodhub/lib/providers/providers.dart
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/flutter/foodhub/lib/providers/providers.dart
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/flutter/foodhub/lib/providers/providers.dart
<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/flutter/foodhub/lib/providers/providers.dart
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/flutter/foodhub/lib/providers/providers.dart
=======
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/flutter/foodhub/lib/providers/providers.dart
=======
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/flutter/foodhub/lib/providers/providers.dart
=======
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/flutter/foodhub/lib/providers/providers.dart
=======
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/flutter/foodhub/lib/providers/providers.dart
=======
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/flutter/foodhub/lib/providers/providers.dart
