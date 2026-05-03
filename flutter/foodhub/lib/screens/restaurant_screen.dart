import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/models.dart';
import '../providers/providers.dart';

class RestaurantScreen extends ConsumerWidget {
  final String id;

  const RestaurantScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurantAsync = ref.watch(restaurantProvider(id));

    return Scaffold(
      body: restaurantAsync.when(
        data: (restaurant) => _RestaurantContent(restaurant: restaurant),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
    );
  }
}

class _RestaurantContent extends StatelessWidget {
  final Restaurant restaurant;

  const _RestaurantContent({required this.restaurant});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 200,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            title: Text(restaurant.name),
            background: restaurant.image_url.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl: restaurant.image_url,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: Colors.grey[300],
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.grey[300],
                      child: const Icon(Icons.restaurant),
                    ),
                  )
                : Container(
                    color: Colors.grey[300],
                    child: const Icon(Icons.restaurant, size: 80),
                  ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 20),
                    const SizedBox(width: 4),
                    Text(
                      restaurant.rating.toString(),
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 16),
                    Icon(Icons.access_time, size: 20, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Text('${restaurant.delivery_time} min'),
                    const SizedBox(width: 16),
                    Icon(Icons.delivery_dining, size: 20, color: Colors.grey[600]),
                    const SizedBox(width: 4),
                    Text('\$${restaurant.delivery_fee.toStringAsFixed(2)}'),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  restaurant.cuisine_type,
                  style: TextStyle(color: Colors.grey[600]),
                ),
                const SizedBox(height: 16),
                Text(
                  restaurant.description,
                  style: const TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 8),
                Text(
                  restaurant.address,
                  style: TextStyle(color: Colors.grey[600]),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Menu',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Consumer(
            builder: (context, ref, child) {
              final menuItemsAsync = ref.watch(menuItemsProvider(restaurant.id));
              return menuItemsAsync.when(
                data: (items) => _MenuList(items: items, restaurant: restaurant),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stack) => Center(child: Text('Error: $error')),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _MenuList extends StatelessWidget {
  final List<MenuItem> items;
  final Restaurant restaurant;

  const _MenuList({required this.items, required this.restaurant});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Text('No menu items available'),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return _MenuItemTile(item: item);
      },
    );
  }
}

class _MenuItemTile extends ConsumerWidget {
  final MenuItem item;

  const _MenuItemTile({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: () {
          ref.read(cartProvider.notifier).addItem(item);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('${item.name} added to cart')),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (item.image_url.isNotEmpty)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: CachedNetworkImage(
                    imageUrl: item.image_url,
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      width: 80,
                      height: 80,
                      color: Colors.grey[300],
                    ),
                    errorWidget: (context, url, error) => Container(
                      width: 80,
                      height: 80,
                      color: Colors.grey[300],
                      child: const Icon(Icons.restaurant_menu),
                    ),
                  ),
                ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.description,
                      style: TextStyle(color: Colors.grey[600]),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '\$${item.price.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.add_circle, color: Colors.red),
            ],
          ),
        ),
      ),
    );
  }
}
