import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PaymentScreen extends ConsumerStatefulWidget {
  final double amount;
  final String orderId;
  final Function(String) onSuccess;
  final Function(String) onError;

  const PaymentScreen({
    super.key,
    required this.amount,
    required this.orderId,
    required this.onSuccess,
    required this.onError,
  });

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  bool _isLoading = false;
  CardFieldInputDetails? _cardDetails;

  Future<void> _processPayment() async {
    if (_cardDetails == null || !_cardDetails!.complete) {
      widget.onError('Please complete card details');
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Create payment intent via backend
      final response = await http.post(
        Uri.parse('https://your-vercel-app.vercel.app/api/create-payment-intent'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'amount': (widget.amount * 100).toInt(), // Convert to cents
          'orderId': widget.orderId,
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to create payment intent');
      }

      final data = json.decode(response.body);
      final clientSecret = data['clientSecret'];

      // Confirm payment with Stripe
      final paymentIntent = await Stripe.instance.confirmPayment(
        paymentIntentClientSecret: clientSecret,
        data: PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(
            billingDetails: BillingDetails(
              name: 'Customer Name',
              email: 'customer@example.com',
            ),
          ),
        ),
      );

      if (paymentIntent.status == 'Succeeded') {
        widget.onSuccess(paymentIntent.id);
      } else {
        widget.onError('Payment failed');
      }
    } catch (e) {
      widget.onError(e.toString());
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Total Amount',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            Text(
              '\$${widget.amount.toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: Theme.of(context).primaryColor,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Card Details',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            CardField(
              onCardChanged: (card) {
                setState(() {
                  _cardDetails = card;
                });
              },
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _processPayment,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Pay Now'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
