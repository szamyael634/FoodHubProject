import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/providers.dart';
import '../models/models.dart';

class RestaurantDashboardScreen extends ConsumerStatefulWidget {
  const RestaurantDashboardScreen({super.key});

  @override
  ConsumerState<RestaurantDashboardScreen> createState() => _RestaurantDashboardScreenState();
}

class _RestaurantDashboardScreenState extends ConsumerState<RestaurantDashboardScreen> {
  String _activeTab = 'orders';
  Restaurant? _restaurant;
  List<Order> _orders = [];
  List<MenuItem> _menuItems = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final supabase = Supabase.instance.client;
    final authState = ref.read(authNotifierProvider);
    final user = authState.value;

    if (user == null) {
      context.go('/login');
      return;
    }

    try {
      final restaurantData = await supabase
          .from('restaurants')
          .select()
          .eq('owner_id', user.id)
          .single();

      setState(() {
        _restaurant = Restaurant.fromJson(restaurantData);
      });

      await _loadOrders();
      await _loadMenuItems();
    } catch (e) {
      print('Error loading restaurant: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _loadOrders() async {
    if (_restaurant == null) return;
    final supabase = Supabase.instance.client;
    final data = await supabase
        .from('orders')
        .select()
        .eq('restaurant_id', _restaurant!.id)
        .order('created_at', ascending: false);
    
    setState(() {
      _orders = data.map((e) => Order.fromJson(e)).toList();
    });
  }

  Future<void> _loadMenuItems() async {
    if (_restaurant == null) return;
    final supabase = Supabase.instance.client;
    final data = await supabase
        .from('menu_items')
        .select()
        .eq('restaurant_id', _restaurant!.id);
    
    setState(() {
      _menuItems = data.map((e) => MenuItem.fromJson(e)).toList();
    });
  }

  Future<void> _updateOrderStatus(String orderId, String newStatus) async {
    final supabase = Supabase.instance.client;
    await supabase.from('orders').update({'status': newStatus}).eq('id', orderId);
    await _loadOrders();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Restaurant Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: Column(
        children: [
          if (_restaurant != null)
            Container(
              padding: const EdgeInsets.all(16),
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Theme.of(context).primaryColor,
                    child: Text(_restaurant!.name[0]),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _restaurant!.name,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(_restaurant!.cuisineType),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: _TabButton(
                    label: 'Orders',
                    isActive: _activeTab == 'orders',
                    onTap: () => setState(() => _activeTab = 'orders'),
                  ),
                ),
                Expanded(
                  child: _TabButton(
                    label: 'Menu',
                    isActive: _activeTab == 'menu',
                    onTap: () => setState(() => _activeTab = 'menu'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _activeTab == 'orders' ? _OrdersTab(orders: _orders, onUpdateStatus: _updateOrderStatus) : _MenuTab(menuItems: _menuItems, onRefresh: _loadMenuItems),
          ),
        ],
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _TabButton({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isActive ? Theme.of(context).primaryColor : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? Theme.of(context).primaryColor : Colors.grey[600],
          ),
        ),
      ),
    );
  }
}

class _OrdersTab extends StatelessWidget {
  final List<Order> orders;
  final Function(String, String) onUpdateStatus;

  const _OrdersTab({
    required this.orders,
    required this.onUpdateStatus,
  });

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return const Center(child: Text('No orders yet'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        final order = orders[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Order #${order.id.substring(0, 8)}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    _StatusChip(status: order.status),
                  ],
                ),
                const SizedBox(height: 8),
                Text('${order.items.length} items'),
                const SizedBox(height: 8),
                Text('\$${order.total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  children: [
                    if (order.status == 'pending')
                      ElevatedButton(
                        onPressed: () => onUpdateStatus(order.id, 'confirmed'),
                        child: const Text('Confirm'),
                      ),
                    if (order.status == 'confirmed')
                      ElevatedButton(
                        onPressed: () => onUpdateStatus(order.id, 'preparing'),
                        child: const Text('Start Preparing'),
                      ),
                    if (order.status == 'preparing')
                      ElevatedButton(
                        onPressed: () => onUpdateStatus(order.id, 'ready'),
                        child: const Text('Mark Ready'),
                      ),
                    if (order.status != 'delivered' && order.status != 'cancelled')
                      OutlinedButton(
                        onPressed: () => onUpdateStatus(order.id, 'cancelled'),
                        style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                        child: const Text('Cancel'),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _MenuTab extends StatelessWidget {
  final List<MenuItem> menuItems;
  final VoidCallback onRefresh;

  const _MenuTab({
    required this.menuItems,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    if (menuItems.isEmpty) {
      return const Center(child: Text('No menu items yet'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: menuItems.length,
      itemBuilder: (context, index) {
        final item = menuItems[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: item.imageUrl != null
                ? Image.network(item.imageUrl!, width: 60, height: 60, fit: BoxFit.cover)
                : const Icon(Icons.restaurant_menu),
            title: Text(item.name),
            subtitle: Text('\$${item.price.toStringAsFixed(2)} • ${item.category}'),
            trailing: Switch(
              value: item.isAvailable,
              onChanged: (value) async {
                final supabase = Supabase.instance.client;
                await supabase
                    .from('menu_items')
                    .update({'is_available': value})
                    .eq('id', item.id);
                onRefresh();
              },
            ),
          ),
        );
      },
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;

    switch (status) {
      case 'pending':
        color = Colors.orange;
        label = 'Pending';
        break;
      case 'confirmed':
        color = Colors.blue;
        label = 'Confirmed';
        break;
      case 'preparing':
        color = Colors.purple;
        label = 'Preparing';
        break;
      case 'ready':
        color = Colors.teal;
        label = 'Ready';
        break;
      case 'picked_up':
        color = Colors.indigo;
        label = 'On the way';
        break;
      case 'delivered':
        color = Colors.green;
        label = 'Delivered';
        break;
      case 'cancelled':
        color = Colors.red;
        label = 'Cancelled';
        break;
      default:
        color = Colors.grey;
        label = status;
    }

    return Chip(
      label: Text(label, style: const TextStyle(color: Colors.white)),
      backgroundColor: color,
    );
  }
}
