# FoodHub Deployment Guide

This guide covers deploying the FoodHub application to Vercel and setting up the Supabase database.

---

## Prerequisites

- Node.js 18+ installed
- Supabase account and project created
- Stripe account with API keys
- Vercel account
- Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Supabase Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready (2-3 minutes)
4. Note down:
   - Project URL
   - Anon Public Key
   - Service Role Key (from Settings → API)

### 1.2 Run Database Migration

**IMPORTANT:** The `has_review` field is already included in the main `schema.sql` file. You do NOT need to run the separate migration file. The main schema file is complete.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the **entire contents** of `supabase/schema.sql`
5. Execute the query
6. Verify all tables were created successfully:
   - profiles
   - restaurants
   - menu_items
   - orders (includes has_review field)
   - reviews
   - notifications

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply the schema (this will run migrations from supabase/migrations folder)
supabase db push
```

**Note:** The migration files are now organized in `supabase/migrations/`:
- `001_initial_schema.sql` - Main schema with all tables including has_review field
- The old `002_add_has_review_to_orders.sql` has been removed since the field is already in the main schema

### 1.3 Verify Schema

After running the main schema, verify the `has_review` field exists:

1. Go to Table Editor in Supabase Dashboard
2. Click on the `orders` table
3. Check that the `has_review` column exists with type `boolean` and default `false`

If for some reason the column is missing, you can add it manually:

```sql
-- Only run this if has_review column is missing
ALTER TABLE orders ADD COLUMN IF NOT EXISTS has_review BOOLEAN DEFAULT false;
```

### 1.4 Configure RLS Policies

The RLS policies are included in `schema.sql` and should be applied automatically. Verify them:

1. Go to Authentication → Policies
2. Check that all tables have RLS enabled
3. Verify policies are correctly configured

### 1.5 Test Database Connection

1. In Supabase Dashboard, go to Table Editor
2. Verify all tables exist:
   - profiles
   - restaurants
   - menu_items
   - orders
   - reviews
   - notifications

---

## Step 2: Stripe Setup

### 2.1 Get Stripe API Keys

1. Go to [stripe.com](https://stripe.com)
2. Go to Developers → API keys
3. Note down:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)

### 2.2 Configure Webhook

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-vercel-domain.vercel.app/api/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Note down the **Webhook Signing Secret** (starts with `whsec_`)

**Note:** You'll need to update the webhook URL after deploying to Vercel.

---

## Step 3: Environment Variables Setup

### 3.1 Local Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Supabase Service Role (for backend functions)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3.2 Vercel Environment Variables

1. Push your code to your Git repository
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. During setup, add the following environment variables:

```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY = your_stripe_publishable_key
STRIPE_SECRET_KEY = your_stripe_secret_key
STRIPE_WEBHOOK_SECRET = your_stripe_webhook_secret
SUPABASE_URL = your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
```

5. Deploy the application

---

## Step 4: Deploy to Vercel

### 4.1 Using Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name: foodhub (or your preferred name)
# - Directory: ./
# - Override settings? No
```

### 4.2 Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables (see Step 3.2)
6. Click "Deploy"
7. Wait for deployment to complete

### 4.3 Configure Vercel Functions

The `vercel.json` file is already configured for Deno functions. No additional setup needed.

---

## Step 5: Update Stripe Webhook URL

After deploying to Vercel:

1. Get your Vercel deployment URL (e.g., `https://foodhub.vercel.app`)
2. Go to Stripe Dashboard → Webhooks
3. Update the endpoint URL to: `https://your-vercel-domain.vercel.app/api/webhook`
4. Or create a new webhook with the correct URL

---

## Step 6: Flutter Deployment

### 6.1 Build Flutter App

```bash
cd flutter/foodhub

# Set environment variables (Windows PowerShell)
$env:SUPABASE_URL="your_supabase_project_url"
$env:SUPABASE_ANON_KEY="your_supabase_anon_key"
$env:STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"

# Build APK for Android
flutter build apk --release

# Or build for iOS (macOS only)
flutter build ios --release
```

### 6.2 Alternative: Use Build Config

Create `flutter/foodhub/android/key.properties`:

```properties
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=your_key_alias
storeFile=/path/to/your/keystore.jks
```

Build with environment variables:

```bash
# Build with environment variables
flutter build apk \
  --dart-define=SUPABASE_URL=your_supabase_project_url \
  --dart-define=SUPABASE_ANON_KEY=your_supabase_anon_key \
  --dart-define=STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

## Step 7: Post-Deployment Verification

### 7.1 Test Web Application

1. Visit your Vercel deployment URL
2. Test user registration and login
3. Test restaurant browsing
4. Test cart and checkout flow
5. Test payment with Stripe (use test card: `4242 4242 4242 4242`)
6. Test order placement and notifications
7. Test review submission

### 7.2 Test Restaurant Dashboard

1. Create a user with role 'restaurant' in Supabase:
   ```sql
   INSERT INTO profiles (id, email, full_name, role)
   VALUES ('uuid-here', 'restaurant@example.com', 'Restaurant Owner', 'restaurant');
   ```
2. Login as restaurant user
3. Access `/dashboard/restaurant`
4. Test order management
5. Test menu item management

### 7.3 Test Driver Dashboard

1. Create a user with role 'driver' in Supabase:
   ```sql
   INSERT INTO profiles (id, email, full_name, role)
   VALUES ('uuid-here', 'driver@example.com', 'Driver Name', 'driver');
   ```
2. Login as driver user
3. Access `/dashboard/driver`
4. Test order acceptance
5. Test delivery status updates

### 7.4 Verify Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Check webhook delivery status
3. Verify payment_intent events are being received
4. Check that order status updates in Supabase after successful payment

### 7.5 Test Real-time Notifications

1. Place an order as a customer
2. Update order status as restaurant owner
3. Verify notification appears in customer's notification bell
4. Check browser notifications (if enabled)

---

## Step 8: Configure Production Domain (Optional)

### 8.1 Custom Domain in Vercel

1. Go to Vercel project settings
2. Domains → Add Domain
3. Enter your custom domain (e.g., `foodhub.yourdomain.com`)
4. Update DNS records as instructed by Vercel
5. Update Stripe webhook URL to use custom domain

---

## Troubleshooting

### Issue: Stripe webhook not receiving events

**Solution:**
- Verify webhook URL is correct
- Check webhook signing secret matches
- Ensure Vercel functions are deployed
- Check Vercel logs for webhook errors

### Issue: RLS policies blocking operations

**Solution:**
- Verify user is authenticated
- Check RLS policies in Supabase Dashboard
- Ensure policies allow the required operations
- Check user role matches policy conditions

### Issue: Environment variables not loading

**Solution:**
- Verify variable names match exactly (case-sensitive)
- Restart Vercel deployment after adding variables
- Check that VITE_ prefix is used for client-side variables
- For Flutter, verify dart-define syntax is correct

### Issue: CORS errors with Supabase

**Solution:**
- Add Vercel domain to Supabase allowed origins
- Go to Supabase Dashboard → Settings → API
- Add your domain to "Additional Allowed Origins"

### Issue: Flutter build fails

**Solution:**
- Ensure Flutter SDK is installed and updated
- Run `flutter pub get` before building
- Check environment variables are set correctly
- Verify Android/iOS build tools are installed

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use environment variables for all secrets
- [ ] Never commit .env files to Git
- [ ] Enable two-factor authentication on all accounts
- [ ] Regularly rotate API keys
- [ ] Monitor Stripe webhooks for suspicious activity
- [ ] Review RLS policies regularly
- [ ] Enable audit logging in Supabase
- [ ] Set up backup for Supabase database
- [ ] Monitor Vercel deployment logs

---

## Monitoring and Maintenance

### Vercel Monitoring

- Go to Vercel Dashboard → Your Project
- Monitor deployment logs
- Set up error tracking (e.g., Sentry)
- Monitor build times and performance

### Supabase Monitoring

- Go to Supabase Dashboard → Your Project
- Monitor database performance
- Check API usage and limits
- Review authentication logs
- Monitor real-time subscription usage

### Stripe Monitoring

- Go to Stripe Dashboard
- Monitor payment success rates
- Review webhook delivery status
- Check for failed payments
- Monitor refund activity

---

## Backup Strategy

### Database Backup

Supabase automatically backs up your database daily. For additional safety:

1. Go to Supabase Dashboard → Database → Backups
2. Configure additional backup schedules if needed
3. Export schema and data regularly

### Code Backup

- Keep your Git repository up to date
- Use Git tags for production releases
- Maintain separate branches for development

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Flutter Documentation](https://flutter.dev/docs)
- [React Router Documentation](https://reactrouter.com)
- [Riverpod Documentation](https://riverpod.dev)

---

## Quick Reference

### Important URLs After Deployment

- Web App: `https://your-vercel-domain.vercel.app`
- Stripe Webhook: `https://your-vercel-domain.vercel.app/api/webhook`
- Payment Intent API: `https://your-vercel-domain.vercel.app/api/create-payment-intent`

### Test Card Numbers (Stripe)

- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 0002`
- Insufficient funds: `4000 0025 0000 3155`

### Supabase Test User Creation

```sql
-- Customer
INSERT INTO profiles (id, email, full_name, role)
VALUES (gen_random_uuid(), 'customer@test.com', 'Test Customer', 'customer');

-- Restaurant Owner
INSERT INTO profiles (id, email, full_name, role)
VALUES (gen_random_uuid(), 'restaurant@test.com', 'Test Restaurant', 'restaurant');

-- Driver
INSERT INTO profiles (id, email, full_name, role)
VALUES (gen_random_uuid(), 'driver@test.com', 'Test Driver', 'driver');
```
