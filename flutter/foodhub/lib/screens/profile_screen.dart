import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: authState.when(
        data: (user) {
          if (user == null) {
            return const Center(child: Text('Please login'));
          }
          return _ProfileContent(user: user);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
    );
  }
}

class _ProfileContent extends StatelessWidget {
  final dynamic user;

  const _ProfileContent({required this.user});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SizedBox(height: 16),
          CircleAvatar(
            radius: 50,
            backgroundColor: Colors.red[100],
            child: Icon(Icons.person, size: 60, color: Colors.red[700]),
          ),
          const SizedBox(height: 16),
          Text(
            user.userMetadata?['full_name'] ?? 'User',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            user.email ?? '',
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(height: 32),
          _ProfileSection(
            title: 'Account Settings',
            children: [
              _ProfileTile(
                icon: Icons.edit,
                title: 'Edit Profile',
                onTap: () {
                  // TODO: Implement edit profile
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Edit profile coming soon!')),
                  );
                },
              ),
              _ProfileTile(
                icon: Icons.lock,
                title: 'Change Password',
                onTap: () {
                  // TODO: Implement change password
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Change password coming soon!')),
                  );
                },
              ),
              _ProfileTile(
                icon: Icons.payment,
                title: 'Payment Methods',
                onTap: () {
                  // TODO: Implement payment methods
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Payment methods coming soon!')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 16),
          _ProfileSection(
            title: 'Preferences',
            children: [
              _ProfileTile(
                icon: Icons.notifications,
                title: 'Notifications',
                onTap: () {
                  // TODO: Implement notifications
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Notifications coming soon!')),
                  );
                },
              ),
              _ProfileTile(
                icon: Icons.language,
                title: 'Language',
                onTap: () {
                  // TODO: Implement language
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Language settings coming soon!')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 16),
          _ProfileSection(
            title: 'Support',
            children: [
              _ProfileTile(
                icon: Icons.help,
                title: 'Help Center',
                onTap: () {
                  // TODO: Implement help center
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Help center coming soon!')),
                  );
                },
              ),
              _ProfileTile(
                icon: Icons.description,
                title: 'Terms of Service',
                onTap: () {
                  // TODO: Implement terms
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Terms coming soon!')),
                  );
                },
              ),
              _ProfileTile(
                icon: Icons.privacy_tip,
                title: 'Privacy Policy',
                onTap: () {
                  // TODO: Implement privacy
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Privacy policy coming soon!')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () async {
                await Supabase.instance.client.auth.signOut();
                if (context.mounted) {
                  context.go('/login');
                }
              },
              icon: const Icon(Icons.logout),
              label: const Text('Logout'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'FoodHub v1.0.0',
            style: TextStyle(color: Colors.grey[600], fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _ProfileSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _ProfileSection({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Card(
          child: Column(children: children),
        ),
      ],
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _ProfileTile({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: Colors.grey[700]),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontSize: 16),
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}
