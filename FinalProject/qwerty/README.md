# Hub E-Commerce Platform

A full-stack e-commerce platform with multi-vendor support, delivery management, and real-time messaging.

## Architecture

- **Frontend**: Static HTML/CSS/JS deployed on Vercel
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Mobile**: Flutter (to be implemented)
- **File Storage**: Supabase Storage

## Project Structure

```
qwerty/
├── frontend/              # Static frontend files
│   ├── *.html            # Page templates
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript modules
│   │   ├── supabase-client.js    # Supabase client initialization
│   │   ├── supabase-api.js       # Database API wrappers
│   │   └── ...           # Other modules
│   └── uploads/          # Product images
├── supabase/
│   ├── migrations/       # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_rls_policies.sql
│   ├── functions/        # Edge Functions
│   │   ├── _shared/      # Shared utilities
│   │   └── api/          # API endpoints
│   └── config.toml       # Supabase configuration
├── vercel.json           # Vercel deployment config
└── .env.example          # Environment variables template
```

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API and note your:
   - Project URL
   - `anon` key (public)
   - `service_role` key (secret - keep safe!)

3. Run the SQL migrations in the Supabase SQL Editor:
   - `001_initial_schema.sql` - Creates all tables, indexes, and triggers
   - `002_rls_policies.sql` - Sets up Row Level Security policies

4. Enable Email Auth in Authentication > Providers:
   - Enable Email provider
   - Configure email templates if needed

5. Create Storage buckets:
   - `products` - For product images
   - `avatars` - For user profile pictures
   - `documents` - For seller verification documents

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Or set these in Vercel Dashboard > Settings > Environment Variables.

### 3. Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Configure environment variables
4. Deploy

The `vercel.json` handles SPA routing and API proxying.

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends auth.users) |
| `seller_details` | Seller business information |
| `rider_details` | Rider delivery information |
| `products` | Product catalog |
| `product_variants` | Product variants/options |
| `categories` | Product categories |
| `cart_items` | Shopping cart items |
| `wishlist_items` | User wishlists |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `reviews` | Product/seller/rider reviews |
| `conversations` | Message threads |
| `messages` | Chat messages |
| `discounts` | Promo codes and discounts |
| `return_refund_requests` | Return/refund management |

### Row Level Security

All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Sellers can only manage their products and orders
- Riders can only see assigned deliveries
- Admins have full access
- Public can view active products and approved reviews

## API Endpoints

### Edge Functions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cart` | GET, POST, PUT, DELETE | Shopping cart operations |
| `/api/orders` | GET, POST, PUT | Order management |
| `/api/products` | GET, POST, PUT, DELETE | Product catalog |

### Supabase Client API

Use `window.HubAPI` from `supabase-api.js`:

```javascript
// Cart operations
const { data, error } = await window.HubAPI.cart.getCart();
await window.HubAPI.cart.addToCart(productId, quantity);

// Products
const { data: products } = await window.HubAPI.products.getProducts({
  category: 'category_id',
  search: 'query',
  limit: 20
});

// Orders
const { data: orders } = await window.HubAPI.orders.getOrders('customer');

// Realtime subscriptions
const subscription = await window.HubSupabase.subscribeToTable(
  'messages',
  (payload) => console.log('New message:', payload)
);
```

## User Roles

| Role | Permissions |
|------|-------------|
| `customer` | Browse, buy, review, message |
| `seller` | Manage products, orders, view analytics |
| `rider` | Accept deliveries, update delivery status |
| `admin` | Full system access, user management, analytics |

## Security Notes

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- RLS policies enforce data access control at database level
- All file uploads go through Supabase Storage
- JWT tokens auto-refresh via Supabase Auth

## Next Steps

1. [ ] Create Flutter mobile app
2. [ ] Implement payment gateway integration
3. [ ] Add email notification templates
4. [ ] Set up CI/CD pipeline
5. [ ] Add comprehensive tests

## License

Private - All rights reserved
