# Hub E-Commerce - File Structure

Complete directory and file structure for the FoodHub E-Commerce Platform.

## Project Root

```
qwerty/
├── .env                          # Local environment variables (gitignored)
├── .env.example                  # Environment variables template
├── .env.local                    # Vercel local environment
├── .gitignore                    # Git ignore rules
├── .vercel/                      # Vercel deployment config (auto-generated)
├── .vercelignore                 # Vercel ignore rules
├── .vscode/                      # VS Code settings
├── vercel.json                   # Vercel deployment configuration
├── package.json                  # NPM scripts for deployment
├── README.md                     # Main project documentation
├── DEPLOY.md                     # Deployment guide
├── FILE_STRUCTURE.md           # This file
├── uploads/                      # Product images (legacy)
├── frontend/                     # Static frontend files
└── supabase/                     # Supabase backend
```

## Frontend Structure

```
frontend/
├── index.html                    # Homepage
├── about_us.html                 # About Us page
├── account.html                  # User account dashboard
├── admin_dashboard.html          # Admin dashboard
├── cart.html                     # Shopping cart
├── contact_us.html               # Contact page
├── dashboard.html                # Generic dashboard
├── loginregister.html            # Login/Register page
├── order-confirmation.html       # Order confirmation
├── our_services.html             # Services page
├── rider_dashboard.html          # Rider dashboard
├── seller.html                   # Seller store page
├── seller_dashboard.html         # Seller dashboard
├── shop.html                     # Product shop
├── wishlist.html                 # User wishlist
├──
├── css/                          # Stylesheets
│   ├── style.css                 # Main stylesheet
│   ├── account.css               # Account page styles
│   ├── auth.css                  # Authentication styles
│   ├── cart.css                  # Cart styles
│   ├── dashboard.css             # Dashboard styles
│   ├── seller_dashboard.css      # Seller dashboard styles
│   └── wishlist.css              # Wishlist styles
│
├── js/                           # JavaScript modules
│   ├── script.js                 # Core utilities (cart, auth)
│   ├── auth-guard.js             # Authentication guard
│   ├── cart-sync.js              # Cart synchronization
│   ├── messenger-global.js       # Global messaging
│   ├── notifications.js            # Toast notifications
│   ├── role-guard.js             # Role-based access control
│   ├── session-validator.js      # Session validation
│   ├── admin_dashboard.js        # Admin dashboard logic
│   ├── seller_dashboard.js       # Seller dashboard logic
│   ├── rider_dashboard.js        # Rider dashboard logic
│   ├── customer-messaging.js     # Customer messaging
│   ├── messaging-panel.js        # Messaging UI panel
│   ├── supabase-client.js        # Supabase client init
│   ├── supabase-api.js           # Supabase API wrappers
│   └── ...                       # Additional page scripts
│
└── uploads/                      # Product images
    ├── products/                 # Product photos
    ├── avatars/                  # User avatars
    └── documents/                # Documents
```

## Supabase Backend Structure

```
supabase/
├── config.toml                   # Supabase CLI configuration
│
├── migrations/                   # Database migrations
│   ├── 001_initial_schema.sql    # Initial database schema
│   └── 002_rls_policies.sql      # Row Level Security policies
│
└── functions/                    # Edge Functions
    ├── _shared/                  # Shared utilities
    │   ├── cors.ts               # CORS configuration
    │   ├── supabase.ts           # Supabase client helper
    │   └── types.ts              # TypeScript types
    │
    ├── cart-api/                 # Cart API endpoint
    │   └── index.ts              # Cart operations (GET/POST/PUT/DELETE)
    │
    ├── orders-api/               # Orders API endpoint
    │   └── index.ts              # Order management
    │
    └── products-api/             # Products API endpoint
        └── index.ts              # Product catalog
```

## Database Schema (from migrations)

### Core Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles extending auth.users |
| `seller_details` | Seller business information |
| `rider_details` | Rider delivery information |
| `products` | Product catalog |
| `product_variants` | Product variants/options |
| `categories` | Product categories |
| `cart_items` | Shopping cart items |
| `wishlist_items` | User wishlists |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `order_status_history` | Order status changes |
| `conversations` | Message threads |
| `messages` | Chat messages |
| `reviews` | Product/seller/rider reviews |
| `discounts` | Promo codes |
| `return_refund_requests` | Return/refund management |
| `admin_settings` | System settings |
| `activity_logs` | System activity logs |

### Indexes & Triggers
- Auto-updating `updated_at` timestamps
- Performance indexes on foreign keys
- Search indexes on product titles

## API Endpoints

### Vercel Proxy Routes
| Route | Destination |
|-------|-------------|
| `/api/cart/*` | Supabase `cart-api` function |
| `/api/orders/*` | Supabase `orders-api` function |
| `/api/products/*` | Supabase `products-api` function |

### Direct Supabase URLs
- **REST API**: `https://gladttjcpcgpvxdrhqmx.supabase.co/rest/v1/`
- **Auth**: `https://gladttjcpcgpvxdrhqmx.supabase.co/auth/v1/`
- **Realtime**: `wss://gladttjcpcgpvxdrhqmx.supabase.co/realtime/v1/`
- **Storage**: `https://gladttjcpcgpvxdrhqmx.supabase.co/storage/v1/`
- **Functions**: `https://gladttjcpcgpvxdrhqmx.supabase.co/functions/v1/`

## Environment Variables

### Required in Vercel
```
NEXT_PUBLIC_SUPABASE_URL=https://gladttjcpcgpvxdrhqmx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

### Supabase Secrets (Edge Functions)
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (auto-injected)
```

## Key Files Summary

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel deployment config, routing, headers |
| `supabase/config.toml` | Supabase project settings |
| `supabase/migrations/*.sql` | Database schema and RLS |
| `frontend/js/supabase-client.js` | Frontend Supabase init |
| `frontend/js/supabase-api.js` | High-level API functions |
| `.env.example` | Environment variable template |

## User Roles

| Role | Pages | API Access |
|------|-------|------------|
| `customer` | index, shop, cart, account, wishlist | cart, orders, products |
| `seller` | seller_dashboard, seller store | own products, own orders |
| `rider` | rider_dashboard | assigned deliveries |
| `admin` | admin_dashboard | full system access |

## Security

- **RLS Policies**: Enforce data isolation per role
- **JWT Auth**: Supabase Auth with auto-refresh
- **CORS**: Configured for cross-origin requests
- **File Uploads**: Supabase Storage with policies

## Next Steps for Development

1. [ ] Add more Edge Functions (messaging, reviews, admin)
2. [ ] Implement payment gateway integration
3. [ ] Create Flutter mobile app
4. [ ] Add email notification templates
5. [ ] Setup CI/CD pipeline

---

*Generated: 2024-05-02*
*Project: Hub E-Commerce Platform*
*Stack: HTML/CSS/JS + Supabase + Vercel*
