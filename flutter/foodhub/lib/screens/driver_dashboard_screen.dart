import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import '../models/models.dart';

class DriverDashboardScreen extends ConsumerStatefulWidget {
  const DriverDashboardScreen({super.key});

  @override
  ConsumerState<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends ConsumerState<DriverDashboardScreen> {
  String _activeTab = 'available';
  List<Order> _availableOrders = [];
  List<Order> _myOrders = [];
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
      // Load available orders (confirmed or ready, no driver assigned)
      final availableData = await supabase
          .from('orders')
          .select()
          .in_('status', ['confirmed', 'ready'])
          .is_('driver_id', null)
          .order('created_at', ascending: false);
      
      setState(() {
        _availableOrders = availableData.map((e) => Order.fromJson(e)).toList();
      });

      // Load my assigned orders
      final myOrdersData = await supabase
          .from('orders')
          .select()
          .eq('driver_id', user.id)
          .order('created_at', ascending: false);
      
      setState(() {
        _myOrders = myOrdersData.map((e) => Order.fromJson(e)).toList();
      });
    } catch (e) {
      print('Error loading orders: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _acceptOrder(String orderId) async {
    final supabase = Supabase.instance.client;
    final authState = ref.read(authNotifierProvider);
    final user = authState.value;

    if (user == null) return;

    try {
      await supabase
          .from('orders')
          .update({
            'driver_id': user.id,
            'status': 'picked_up',
          })
          .eq('id', orderId);
      
      await _loadData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to accept order: ${e.toString()}')),
      );
    }
  }

  Future<void> _updateOrderStatus(String orderId, String newStatus) async {
    final supabase = Supabase.instance.client;
    await supabase.from('orders').update({'status': newStatus}).eq('id', orderId);
    await _loadData();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: _TabButton(
                    label: 'Available Orders',
                    isActive: _activeTab == 'available',
                    onTap: () => setState(() => _activeTab = 'available'),
                  ),
                ),
                Expanded(
                  child: _TabButton(
                    label: 'My Deliveries',
                    isActive: _activeTab == 'my_orders',
                    onTap: () => setState(() => _activeTab == 'my_orders'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _activeTab == 'available'
                ? _AvailableOrdersTab(orders: _availableOrders, onAccept: _acceptOrder)
                : _MyOrdersTab(orders: _myOrders, onUpdateStatus: _updateOrderStatus),
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

class _AvailableOrdersTab extends StatelessWidget {
  final List<Order> orders;
  final Function(String) onAccept;

  const _AvailableOrdersTab({
    required this.orders,
    required this.onAccept,
  });

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No available orders', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
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
                const SizedBox(height: 4),
                Text('Total: \$${order.total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('📍 ${order.deliveryAddress}'),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => onAccept(order.id),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Accept Order'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _MyOrdersTab extends StatelessWidget {
  final List<Order> orders;
  final Function(String, String) onUpdateStatus;

  const _MyOrdersTab({
    required this.orders,
    required this.onUpdateStatus,
  });

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.local_shipping, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No active deliveries', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
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
                const SizedBox(height: 4),
                Text('Total: \$${order.total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('📍 ${order.deliveryAddress}'),
                const SizedBox(height: 16),
                if (order.status == 'picked_up')
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => onUpdateStatus(order.id, 'delivered'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        backgroundColor: Colors.green,
                      ),
                      child: const Text('Mark as Delivered'),
                    ),
                  ),
              ],
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
