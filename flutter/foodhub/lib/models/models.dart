class User {
  final String id;
  final String email;
  final String fullName;
  final String? phone;
  final String? avatarUrl;
  final String role;
  final DateTime createdAt;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone,
    this.avatarUrl,
    required this.role,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      fullName: json['full_name'] ?? '',
      phone: json['phone'],
      avatarUrl: json['avatar_url'],
      role: json['role'] ?? 'customer',
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class Restaurant {
  final String id;
  final String ownerId;
  final String name;
  final String? description;
  final String imageUrl;
  final String address;
  final String phone;
  final String cuisineType;
  final double rating;
  final double deliveryFee;
  final int deliveryTime;
  final bool isOpen;
  final DateTime createdAt;

  Restaurant({
    required this.id,
    required this.ownerId,
    required this.name,
    this.description,
    required this.imageUrl,
    required this.address,
    required this.phone,
    required this.cuisineType,
    required this.rating,
    required this.deliveryFee,
    required this.deliveryTime,
    required this.isOpen,
    required this.createdAt,
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) {
    return Restaurant(
      id: json['id'],
      ownerId: json['owner_id'] ?? '',
      name: json['name'],
      description: json['description'],
      imageUrl: json['image_url'] ?? '',
      address: json['address'] ?? '',
      phone: json['phone'] ?? '',
      cuisineType: json['cuisine_type'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      deliveryFee: (json['delivery_fee'] ?? 0).toDouble(),
      deliveryTime: json['delivery_time'] ?? 30,
      isOpen: json['is_open'] ?? true,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class MenuItem {
  final String id;
  final String restaurantId;
  final String name;
  final String? description;
  final double price;
  final String? imageUrl;
  final String category;
  final bool isAvailable;
  final DateTime createdAt;

  MenuItem({
    required this.id,
    required this.restaurantId,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    required this.category,
    required this.isAvailable,
    required this.createdAt,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'],
      restaurantId: json['restaurant_id'],
      name: json['name'],
      description: json['description'],
      price: (json['price'] ?? 0).toDouble(),
      imageUrl: json['image_url'],
      category: json['category'] ?? '',
      isAvailable: json['is_available'] ?? true,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class CartItem {
  final MenuItem menuItem;
  int quantity;
  String? specialInstructions;

  CartItem({
    required this.menuItem,
    this.quantity = 1,
    this.specialInstructions,
  });

  CartItem copyWith({
    MenuItem? menuItem,
    int? quantity,
    String? specialInstructions,
  }) {
    return CartItem(
      menuItem: menuItem ?? this.menuItem,
      quantity: quantity ?? this.quantity,
      specialInstructions: specialInstructions ?? this.specialInstructions,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'menu_item_id': menuItem.id,
      'name': menuItem.name,
      'price': menuItem.price,
      'quantity': quantity,
      'special_instructions': specialInstructions,
    };
  }
}

class OrderItem {
  final String menuItemId;
  final String name;
  final double price;
  final int quantity;
  final String? specialInstructions;

  OrderItem({
    required this.menuItemId,
    required this.name,
    required this.price,
    required this.quantity,
    this.specialInstructions,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      menuItemId: json['menu_item_id'],
      name: json['name'],
      price: (json['price'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 1,
      specialInstructions: json['special_instructions'],
    );
  }
}

class Order {
  final String id;
  final String userId;
  final String? restaurantId;
  final String? driverId;
  final String status;
  final List<OrderItem> items;
  final double subtotal;
  final double deliveryFee;
  final double tax;
  final double total;
  final String deliveryAddress;
  final String paymentMethod;
  final String paymentStatus;
  final String? stripePaymentIntentId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool hasReview;

  Order({
    required this.id,
    required this.userId,
    this.restaurantId,
    this.driverId,
    required this.status,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.tax,
    required this.total,
    required this.deliveryAddress,
    required this.paymentMethod,
    required this.paymentStatus,
    this.stripePaymentIntentId,
    required this.createdAt,
    required this.updatedAt,
    this.hasReview = false,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      userId: json['user_id'],
      restaurantId: json['restaurant_id'],
      driverId: json['driver_id'],
      status: json['status'] ?? 'pending',
      items: (json['items'] as List<dynamic>?)
          ?.map((item) => OrderItem.fromJson(item))
          .toList() ?? [],
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      deliveryFee: (json['delivery_fee'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      deliveryAddress: json['delivery_address'] ?? '',
      paymentMethod: json['payment_method'] ?? 'cash',
      paymentStatus: json['payment_status'] ?? 'pending',
      stripePaymentIntentId: json['stripe_payment_intent_id'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
      hasReview: json['has_review'] ?? false,
    );
  }
}

  Restaurant({
    required this.id,
    required this.ownerId,
    required this.name,
    this.description,
    this.imageUrl,
    required this.address,
    required this.phone,
    required this.cuisineType,
    required this.rating,
    required this.deliveryFee,
    required this.deliveryTime,
    required this.isOpen,
    required this.createdAt,
  });

  Restaurant.fromJson(Map<String, dynamic> json) {
    return Restaurant(
      id: json['id'],
      ownerId: json['owner_id'] ?? '',
      name: json['name'],
      description: json['description'],
      imageUrl: json['image_url'],
      address: json['address'] ?? '',
      phone: json['phone'] ?? '',
      cuisineType: json['cuisine_type'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      deliveryFee: (json['delivery_fee'] ?? 0).toDouble(),
      deliveryTime: json['delivery_time'] ?? 30,
      isOpen: json['is_open'] ?? true,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class MenuItem {
  final String id;
  final String restaurantId;
  final String name;
  final String? description;
  final double price;
  final String? imageUrl;
  final String category;
  final bool isAvailable;
  final DateTime createdAt;

  MenuItem({
    required this.id,
    required this.restaurantId,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    required this.category,
    required this.isAvailable,
    required this.createdAt,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'],
      restaurantId: json['restaurant_id'],
      name: json['name'],
      description: json['description'],
      price: (json['price'] ?? 0).toDouble(),
      imageUrl: json['image_url'],
      category: json['category'] ?? '',
      isAvailable: json['is_available'] ?? true,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class CartItem {
  final MenuItem menuItem;
  int quantity;
  String? specialInstructions;

  CartItem({
    required this.menuItem,
    this.quantity = 1,
    this.specialInstructions,
  });

  Map<String, dynamic> toJson() {
    return {
      'menu_item_id': menuItem.id,
      'name': menuItem.name,
      'price': menuItem.price,
      'quantity': quantity,
      'special_instructions': specialInstructions,
    };
  }
}

class OrderItem {
  final String menuItemId;
  final String name;
  final double price;
  final int quantity;
  final String? specialInstructions;

  OrderItem({
    required this.menuItemId,
    required this.name,
    required this.price,
    required this.quantity,
    this.specialInstructions,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      menuItemId: json['menu_item_id'],
      name: json['name'],
      price: (json['price'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 1,
      specialInstructions: json['special_instructions'],
    );
  }
}

class Order {
  final String id;
  final String userId;
  final String? restaurantId;
  final String? driverId;
  final String status;
  final List<OrderItem> items;
  final double subtotal;
  final double deliveryFee;
  final double tax;
  final double total;
  final String deliveryAddress;
  final String paymentMethod;
  final String paymentStatus;
  final String? stripePaymentIntentId;
  final DateTime createdAt;
  final DateTime updatedAt;
  bool hasReview;

  Order({
    required this.id,
    required this.userId,
    this.restaurantId,
    this.driverId,
    required this.status,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.tax,
    required this.total,
    required this.deliveryAddress,
    required this.paymentMethod,
    required this.paymentStatus,
    this.stripePaymentIntentId,
    required this.createdAt,
    required this.updatedAt,
    this.hasReview = false,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      userId: json['user_id'],
      restaurantId: json['restaurant_id'],
      driverId: json['driver_id'],
      status: json['status'] ?? 'pending',
      items: (json['items'] as List<dynamic>?)
          ?.map((item) => OrderItem.fromJson(item))
          .toList() ?? [],
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      deliveryFee: (json['delivery_fee'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      deliveryAddress: json['delivery_address'] ?? '',
      paymentMethod: json['payment_method'] ?? 'cash',
      paymentStatus: json['payment_status'] ?? 'pending',
      stripePaymentIntentId: json['stripe_payment_intent_id'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
      hasReview: json['has_review'] ?? false,
    );
  }
}
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/flutter/foodhub/lib/models/models.dart
