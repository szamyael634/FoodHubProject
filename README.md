# FoodHub - Food Delivery Application

A comprehensive food delivery platform with React TypeScript frontend and Flutter mobile app, powered by Supabase backend and Stripe payments.

## 🚀 Tech Stack

### Frontend (Web)
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Supabase JS** for backend integration
- **Stripe JS** for payments

### Mobile App
- **Flutter** with Dart
- **Riverpod** for state management
- **GoRouter** for navigation
- **Supabase Flutter** for backend
- **Flutter Stripe** for payments

### Backend
- **Supabase** (PostgreSQL database, Auth, Real-time)
- **Stripe** for payment processing
- **Vercel Node.js Functions** for serverless API endpoints

## 📁 Project Structure

```
FoodHubProject/
├── src/                          # React frontend source
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Page components
│   ├── lib/                      # Library configurations
│   │   ├── supabase.ts          # Supabase client
│   │   └── stripe.ts            # Stripe client
│   ├── services/                 # API service functions
│   │   ├── api.ts               # REST API calls
│   │   └── auth.ts              # Authentication service
│   ├── store/                    # Zustand state management
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── flutter/                      # Flutter mobile app
│   └── foodhub/
│       ├── lib/
│       │   ├── models/          # Data models
│       │   ├── providers/       # Riverpod providers
│       │   ├── screens/         # Screen widgets
│       │   ├── services/        # API services
│       │   ├── app.dart         # App configuration
│       │   └── main.dart        # Entry point
│       └── pubspec.yaml         # Flutter dependencies
├── supabase/                     # Supabase configuration
│   └── schema.sql               # Database schema
├── api/                          # Serverless functions
│   ├── create-payment-intent.ts # Stripe payment intent
│   └── webhook.ts               # Stripe webhook handler
└── vercel.json                   # Vercel deployment config
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Flutter 3.0+ and Dart
- Supabase account
- Stripe account

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd FoodHubProject
```

2. **Install web dependencies**
```bash
npm install
```

3. **Set up environment variables**
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

4. **Set up Supabase database**
Run the schema migration in your Supabase dashboard:
```bash
# Copy contents of supabase/schema.sql
# Run in Supabase SQL Editor
```

5. **Run the web development server**
```bash
npm run dev
```
Open http://localhost:5173

### Flutter Mobile App Setup

1. **Install Flutter dependencies**
```bash
cd flutter/foodhub
flutter pub get
```

2. **Configure Supabase**
Update the Supabase credentials in `lib/main.dart`:
```dart
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);
```

3. **Run the app**
```bash
flutter run
```

## 📊 Database Schema

The application uses the following main tables:

- **profiles** - User profiles (extends auth.users)
- **restaurants** - Restaurant information
- **menu_items** - Menu items for restaurants
- **orders** - Customer orders
- **reviews** - Restaurant reviews
- **notifications** - User notifications

See `supabase/schema.sql` for the complete schema with RLS policies.

## 💳 Payment Integration

The app uses Stripe for payment processing:

1. **Payment Flow**
   - User creates order on checkout
   - Frontend calls `/api/create-payment-intent`
   - Stripe returns a client secret
   - User confirms payment with Stripe Elements
   - Webhook updates order status on success

2. **Webhook Setup**
   - Configure webhook endpoint in Stripe dashboard
   - Point to `https://your-domain.com/api/webhook`
   - Listen for `payment_intent.succeeded` and `payment_intent.payment_failed`

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables in Vercel dashboard**
   - Go to project settings
   - Add all environment variables from `.env.example`

4. **Configure Stripe webhook**
   - Add your Vercel deployment URL as webhook endpoint
   - Copy webhook secret to environment variables

### Flutter App Deployment

1. **Build for iOS**
```bash
cd flutter/foodhub
flutter build ios
```

2. **Build for Android**
```bash
flutter build apk
# or
flutter build appbundle
```

## 🔐 Security Features

- Row Level Security (RLS) on all Supabase tables
- Secure authentication with Supabase Auth
- Payment processing via Stripe (PCI compliant)
- Environment variables for sensitive data
- CORS configuration for API endpoints

## 📱 Key Features

### For Customers
- Browse restaurants by cuisine
- Search and filter restaurants
- View restaurant details and menus
- Add items to cart
- Secure checkout with Stripe
- Track order status in real-time
- Leave reviews
- Manage profile

### For Restaurant Owners
- Manage restaurant profile
- Add/edit menu items
- View and manage orders
- Update order status
- Track ratings and reviews

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions, please open an issue on GitHub.
