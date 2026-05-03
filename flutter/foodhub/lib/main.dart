import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // TODO: Replace with environment variables in production
  // Use: const String.fromEnvironment('SUPABASE_URL')
  // Use: const String.fromEnvironment('SUPABASE_ANON_KEY')
  await Supabase.initialize(
    url: const String.fromEnvironment(
      'SUPABASE_URL',
      defaultValue: 'https://gladttjcpcgpvxdrhqmx.supabase.co',
    ),
    anonKey: const String.fromEnvironment(
      'SUPABASE_ANON_KEY',
      defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWR0dGpjcGNncHZ4ZHJocW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODkyMTIsImV4cCI6MjA5MzI2NTIxMn0.HON5KpR2tuXISMZl4hgx48A0qYaxeUlBMHg7fO0rNJI',
    ),
  );

  runApp(const ProviderScope(child: FoodHubApp()));
}
