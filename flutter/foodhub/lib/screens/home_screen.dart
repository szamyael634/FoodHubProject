import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/providers.dart';
import '../models/models.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String _searchQuery = '';
  String _selectedCuisine = 'All';

  final List<String> _cuisines = ['All', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai'];

  @override
  Widget build(BuildContext context) {
    final restaurantsAsync = ref.watch(restaurantsProvider);
    final cart = ref.watch(cartProvider);
    final cartCount = cart.fold(0, (sum, item) => sum + item.quantity);

    return Scaffold(
      appBar: AppBar(
        title: const Text('FoodHub'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart),
                onPressed: () => context.push('/cart'),
              ),
              if (cartCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    child: Text('$cartCount', style: const TextStyle(color: Colors.white, fontSize: 10)),
                  ),
                ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).primaryColor,
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search restaurants...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
              ),
              onChanged: (value) => setState(() => _searchQuery = value),
            ),
          ),
          SizedBox(
            height: 50,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _cuisines.length,
              itemBuilder: (context, index) {
                final cuisine = _cuisines[index];
                final isSelected = _selectedCuisine == cuisine;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(cuisine),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _selectedCuisine = cuisine),
                    selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
                  ),
                );
              },
            ),
          ),
          Expanded(
            child: restaurantsAsync.when(
              data: (restaurants) {
                final filtered = restaurants.where((r) {
                  final matchesSearch = _searchQuery.isEmpty ||
                      r.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                      r.cuisineType.toLowerCase().contains(_searchQuery.toLowerCase());
                  final matchesCuisine = _selectedCuisine == 'All' ||
                      r.cuisineType.toLowerCase() == _selectedCuisine.toLowerCase();
                  return matchesSearch && matchesCuisine;
                }).toList();

                if (filtered.isEmpty) {
                  return const Center(child: Text('No restaurants found'));
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) => _RestaurantCard(restaurant: filtered[index]),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }
}

class _RestaurantCard extends StatelessWidget {
  final Restaurant restaurant;

  const _RestaurantCard({required this.restaurant});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push('/restaurant/${restaurant.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Image.network(
              restaurant.imageUrl ?? 'https://via.placeholder.com/400x200',
              height: 150,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: 150,
                color: Colors.grey[300],
                child: const Icon(Icons.restaurant, size: 50),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(restaurant.name, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 4),
                  Text(restaurant.cuisineType, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600])),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 16, color: Colors.amber),
                      Text(' ${restaurant.rating.toStringAsFixed(1)}'),
                      const SizedBox(width: 16),
                      const Icon(Icons.access_time, size: 16),
                      Text(' ${restaurant.deliveryTime} min'),
                      const SizedBox(width: 16),
                      const Icon(Icons.location_on, size: 16),
                      Text(' \$${restaurant.deliveryFee.toStringAsFixed(2)}'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
