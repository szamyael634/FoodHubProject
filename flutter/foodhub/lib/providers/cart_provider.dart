import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});

final cartTotalProvider = Provider<double>((ref) {
  final cart = ref.watch(cartProvider);
  return cart.fold(0, (sum, item) => sum + (item.menuItem.price * item.quantity));
});

final cartItemCountProvider = Provider<int>((ref) {
  final cart = ref.watch(cartProvider);
  return cart.fold(0, (sum, item) => sum + item.quantity);
});

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addItem(MenuItem menuItem, {int quantity = 1, String? specialInstructions}) {
    final existingIndex = state.indexWhere((item) => item.menuItem.id == menuItem.id);
    
    if (existingIndex >= 0) {
      state = [
        ...state.sublist(0, existingIndex),
        state[existingIndex].copyWith(
          quantity: state[existingIndex].quantity + quantity,
        ),
        ...state.sublist(existingIndex + 1),
      ];
    } else {
      state = [
        ...state,
        CartItem(
          menuItem: menuItem,
          quantity: quantity,
          specialInstructions: specialInstructions,
        ),
      ];
    }
  }

  void removeItem(String menuItemId) {
    state = state.where((item) => item.menuItem.id != menuItemId).toList();
  }

  void updateQuantity(String menuItemId, int quantity) {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    
    state = state.map((item) {
      if (item.menuItem.id == menuItemId) {
        return item.copyWith(quantity: quantity);
      }
      return item;
    }).toList();
  }

  void clearCart() {
    state = [];
  }
}
