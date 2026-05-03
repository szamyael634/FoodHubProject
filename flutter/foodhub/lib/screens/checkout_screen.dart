import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/providers.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _zipController = TextEditingController();
  String _paymentMethod = 'card';
  bool _isLoading = false;

  @override
  void dispose() {
    _addressController.dispose();
    _cityController.dispose();
    _zipController.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final cart = ref.read(cartProvider);
      final authState = ref.read(authNotifierProvider);
      final user = authState.value;
      
      if (user == null) {
        throw Exception('User not authenticated');
      }

      final order = await ref.read(orderProvider.notifier).createOrder(
            userId: user.id,
            restaurantId: cart.first.menuItem.restaurantId,
            items: cart,
            deliveryAddress:
                '${_addressController.text}, ${_cityController.text} ${_zipController.text}',
            paymentMethod: _paymentMethod == 'card' ? 'card' : 'cash',
          );

      ref.read(cartProvider.notifier).clear();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order placed successfully!')),
        );
        context.go('/orders/${order.id}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to place order: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final subtotal = cart.fold<double>(
      0,
      (sum, item) => sum + (item.menuItem.price * item.quantity),
    );
    final deliveryFee = 5.0;
    final tax = subtotal * 0.08;
    final total = subtotal + deliveryFee + tax;

    if (cart.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Checkout')),
        body: const Center(
          child: Text('Your cart is empty'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text(
              'Delivery Address',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: 'Street Address',
                prefixIcon: Icon(Icons.location_on),
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your address';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _cityController,
              decoration: const InputDecoration(
                labelText: 'City',
                prefixIcon: Icon(Icons.location_city),
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your city';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            _paymentMethod == 'card' ? (
              Padding(
                padding: const EdgeInsets.all(16),
                child: PaymentScreen(
                  amount: total,
                  orderId: 'temp', // Will be set after order creation
                  onSuccess: (paymentIntentId) {
                    // Handle success
                  },
                  onError: (errorMessage) {
                    setState(() => _errorMessage = errorMessage);
                  },
                ),
              ),
            ) : const SizedBox(height: 0),
            TextFormField(
              controller: _zipController,
              decoration: const InputDecoration(
                labelText: 'ZIP Code',
                prefixIcon: Icon(Icons.mail),
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your ZIP code';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),
            const Text(
              'Payment Method',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            RadioListTile<String>(
              title: const Text('Credit/Debit Card'),
              subtitle: const Text('Pay with Stripe'),
              value: 'card',
              groupValue: _paymentMethod,
              onChanged: (value) {
                setState(() => _paymentMethod = value!);
              },
            ),
            RadioListTile<String>(
              title: const Text('Cash on Delivery'),
              value: 'cash',
              groupValue: _paymentMethod,
              onChanged: (value) {
                setState(() => _paymentMethod = value!);
              },
            ),
            const SizedBox(height: 24),
            const Text(
              'Order Summary',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _SummaryRow(label: 'Subtotal', value: subtotal),
            const SizedBox(height: 8),
            _SummaryRow(label: 'Delivery Fee', value: deliveryFee),
            const SizedBox(height: 8),
            _SummaryRow(label: 'Tax', value: tax),
            const Divider(height: 24),
            _SummaryRow(
              label: 'Total',
              value: total,
              isBold: true,
              isTotal: true,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _placeOrder,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Place Order'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final double value;
  final bool isBold;
  final bool isTotal;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isBold = false,
    this.isTotal = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 20 : 16,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          '\$${value.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: isTotal ? 20 : 16,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            color: isTotal ? Colors.red : null,
          ),
        ),
      ],
    );
  }
}
