<<<<<<< C:/Users/bridd/Downloads/FoodHubProject/flutter/foodhub/lib/app.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/restaurant_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/checkout_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/order_detail_screen.dart';
import 'screens/profile_screen.dart';

final _router = GoRouter(
  initialLocation: '/splash',
  redirect: (context, state) {
    final session = Supabase.instance.client.auth.currentSession;
    final isLoggedIn = session != null;
    final isAuthRoute = state.matchedLocation == '/login' || 
                       state.matchedLocation == '/register' ||
                       state.matchedLocation == '/splash';
    
    if (!isLoggedIn && !isAuthRoute) {
      return '/login';
    }
    
    if (isLoggedIn && (state.matchedLocation == '/login' || state.matchedLocation == '/register')) {
      return '/';
    }
    
    return null;
  },
  routes: [
    GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
    GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
    GoRoute(path: '/restaurant/:id', builder: (context, state) => RestaurantScreen(id: state.pathParameters['id']!)),
    GoRoute(path: '/cart', builder: (context, state) => const CartScreen()),
    GoRoute(path: '/checkout', builder: (context, state) => const CheckoutScreen()),
    GoRoute(path: '/orders', builder: (context, state) => const OrdersScreen()),
    GoRoute(path: '/orders/:id', builder: (context, state) => OrderDetailScreen(id: state.pathParameters['id']!)),
    GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
  ],
);

class FoodHubApp extends ConsumerWidget {
  const FoodHubApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'FoodHub',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.red),
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}
=======
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/restaurant_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/checkout_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/order_detail_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/review_screen.dart';
import 'screens/restaurant_dashboard_screen.dart';
import 'screens/driver_dashboard_screen.dart';

final _router = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
    GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
    GoRoute(path: '/restaurant/:id', builder: (context, state) => RestaurantScreen(id: state.pathParameters['id']!)),
    GoRoute(path: '/cart', builder: (context, state) => const CartScreen()),
    GoRoute(path: '/checkout', builder: (context, state) => const CheckoutScreen()),
    GoRoute(path: '/orders', builder: (context, state) => const OrdersScreen()),
    GoRoute(path: '/orders/:id', builder: (context, state) => OrderDetailScreen(id: state.pathParameters['id']!)),
    GoRoute(path: '/orders/:id/review', builder: (context, state) => ReviewScreen(orderId: state.pathParameters['id']!)),
    GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
    GoRoute(path: '/dashboard/restaurant', builder: (context, state) => const RestaurantDashboardScreen()),
    GoRoute(path: '/dashboard/driver', builder: (context, state) => const DriverDashboardScreen()),
  ],
);

class FoodHubApp extends ConsumerWidget {
  const FoodHubApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'FoodHub',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.red),
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}
>>>>>>> C:/Users/bridd/.windsurf/worktrees/FoodHubProject/FoodHubProject-935d8313/flutter/foodhub/lib/app.dart
