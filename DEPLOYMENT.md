# Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- Supabase project set up
- Stripe account configured

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project dashboard > Settings > Environment Variables and add:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Step 2: Deploy to Vercel

Using Vercel CLI:
```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Step 3: Configure Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your Vercel URL: `https://your-app.vercel.app/api/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook secret and add it to Vercel environment variables

### Step 4: Verify Deployment

1. Visit your deployed site
2. Test user registration and login
3. Test browsing restaurants
4. Test adding items to cart
5. Test checkout with Stripe
6. Verify webhook receives events

## Flutter App Deployment

### Android

1. **Set Environment Variables**
Create a `.env` file in `flutter/foodhub/` or pass them at build time:
```bash
--dart-define=SUPABASE_URL=your_supabase_url
--dart-define=SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Update `flutter/foodhub/android/app/build.gradle` with your app details
3. Generate signing key:
```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

4. Create `key.properties` in `android/`:
```
storePassword=your_password
keyPassword=your_password
keyAlias=upload
storeFile=/path/to/upload-keystore.jks
```

5. Build APK:
```bash
cd flutter/foodhub
flutter build apk --release \
  --dart-define=SUPABASE_URL=your_supabase_url \
  --dart-define=SUPABASE_ANON_KEY=your_supabase_anon_key
```

6. Build App Bundle (for Play Store):
```bash
flutter build appbundle --release \
  --dart-define=SUPABASE_URL=your_supabase_url \
  --dart-define=SUPABASE_ANON_KEY=your_supabase_anon_key
```

### iOS

1. Open `ios/Runner.xcworkspace` in Xcode
2. Configure signing and certificates
3. Update bundle identifier
4. Build:
```bash
flutter build ios --release
```

## Supabase Setup

1. Create a new project at https://supabase.com
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Enable Row Level Security (already in schema)
4. Configure authentication providers in Auth > Providers
5. Get your project URL and anon key from Settings > API

## Stripe Setup

1. Create account at https://stripe.com
2. Get your API keys from Developers > API keys
3. Configure webhook endpoint as shown above
4. Add products and prices if needed

## Troubleshooting

### Build Fails on Vercel
- Check that all environment variables are set
- Verify `package.json` has correct scripts
- Check build logs for specific errors

### Stripe Payment Fails
- Verify API keys are correct
- Check webhook is receiving events
- Ensure webhook secret matches
- Check payment intent creation in logs

### Supabase Connection Issues
- Verify URL and anon key are correct
- Check RLS policies allow access
- Ensure user is authenticated
- Check browser console for errors

### Flutter Build Issues
- Run `flutter clean` and `flutter pub get`
- Check Flutter version compatibility
- Verify platform-specific configurations
- Check for missing dependencies
