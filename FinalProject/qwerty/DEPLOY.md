# Hub E-Commerce - Deployment Guide

## Prerequisites

1. **Supabase CLI** installed: `npm install -g supabase`
2. **Vercel CLI** installed: `npm install -g vercel`
3. Logged in to both CLIs:
   - `supabase login`
   - `vercel login`

## Step 1: Run Supabase Migrations

### Option A: Using Supabase Dashboard (Recommended for first setup)

1. Go to https://supabase.com/dashboard/project/gladttjcpcgpvxdrhqmx
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run**
6. Repeat for `002_rls_policies.sql`

### Option B: Using Supabase CLI

```bash
# Link to your Supabase project
supabase link --project-ref gladttjcpcgpvxdrhqmx

# Push migrations
supabase db push
```

## Step 2: Deploy Edge Functions

```bash
# Navigate to project root
cd c:\Users\bridd\Downloads\FoodHubProject\FinalProject\qwerty

# Deploy all functions
supabase functions deploy api/cart --project-ref gladttjcpcgpvxdrhqmx
supabase functions deploy api/orders --project-ref gladttjcpcgpvxdrhqmx
supabase functions deploy api/products --project-ref gladttjcpcgpvxdrhqmx

# Or deploy all at once (if using config.toml)
supabase functions deploy --project-ref gladttjcpcgpvxdrhqmx
```

### Set Edge Function Secrets

```bash
supabase secrets set --project-ref gladttjcpcgpvxdrhqmx SUPABASE_URL=https://gladttjcpcgpvxdrhqmx.supabase.co
supabase secrets set --project-ref gladttjcpcgpvxdrhqmx SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWR0dGpjcGNncHZ4ZHJocW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODkyMTIsImV4cCI6MjA5MzI2NTIxMn0.HON5KpR2tuXISMZl4hgx48A0qYaxeUlBMHg7fO0rNJI
supabase secrets set --project-ref gladttjcpcgpvxdrhqmx SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWR0dGpjcGNncHZ4ZHJocW14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY4OTIxMiwiZXhwIjoyMDkzMjY1MjEyfQ.t4Kc8Va6HD79-x9XiuJUuvfkKCRynvjNwINX2Q2a7fI
```

## Step 3: Setup Supabase Storage Buckets

In Supabase Dashboard:
1. Go to **Storage** → **New Bucket**
2. Create buckets: `products`, `avatars`, `documents`
3. Set policies: Allow authenticated uploads, public read for products/avatars

## Step 4: Vercel Deployment

### Option A: Vercel CLI

```bash
# Navigate to project
cd c:\Users\bridd\Downloads\FoodHubProject\FinalProject\qwerty

# Initialize Vercel project
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://gladttjcpcgpvxdrhqmx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWR0dGpjcGNncHZ4ZHJocW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODkyMTIsImV4cCI6MjA5MzI2NTIxMn0.HON5KpR2tuXISMZl4hgx48A0qYaxeUlBMHg7fO0rNJI

# Deploy
vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. Push code to GitHub repo
2. Import project in https://vercel.com/dashboard
3. Add environment variables in dashboard
4. Deploy

## Step 5: Verify Deployment

Test these endpoints after deployment:

```bash
# Test Edge Function
curl https://gladttjcpcgpvxdrhqmx.supabase.co/functions/v1/api/products

# Test via Vercel proxy
curl https://your-vercel-domain.vercel.app/api/products
```

## Quick Commands Summary

```bash
# 1. Migrations (via Dashboard SQL Editor - recommended)
# Run 001_initial_schema.sql then 002_rls_policies.sql

# 2. Deploy Functions
supabase functions deploy --project-ref gladttjcpcgpvxdrhqmx

# 3. Deploy to Vercel
vercel --prod
```

## Troubleshooting

- **CORS errors**: Check `cors.ts` shared module and vercel.json headers
- **Auth issues**: Verify anon key is correct in environment variables
- **Database errors**: Check RLS policies are properly applied
- **Function 404**: Ensure functions are deployed and project ref is correct
