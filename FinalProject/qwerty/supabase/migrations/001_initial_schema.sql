-- ============================================
-- Hub E-Commerce Platform - Initial Schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'seller', 'rider', 'admin')) DEFAULT 'customer',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller Details
CREATE TABLE IF NOT EXISTS public.seller_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_description TEXT,
    business_type TEXT,
    region TEXT,
    province TEXT,
    city TEXT,
    address TEXT,
    postal_code TEXT,
    tax_id TEXT,
    business_permit_url TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Rider Details
CREATE TABLE IF NOT EXISTS public.rider_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type TEXT,
    vehicle_plate TEXT,
    license_number TEXT,
    license_url TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    service_fee_rate DECIMAL(5,2) DEFAULT 5.00,
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0.00,
    rating DECIMAL(2,1) DEFAULT 5.0,
    is_online BOOLEAN DEFAULT FALSE,
    current_location JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Product Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES public.categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.seller_details(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku TEXT,
    barcode TEXT,
    weight DECIMAL(8,2),
    dimensions JSONB,
    stock_quantity INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorders BOOLEAN DEFAULT FALSE,
    images JSONB DEFAULT '[]',
    featured_image TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'out_of_stock')),
    tags JSONB DEFAULT '[]',
    seo_title TEXT,
    seo_description TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sku TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    options JSONB DEFAULT '{}',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart Items
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);

-- Wishlist Items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID NOT NULL REFERENCES public.seller_details(id),
    rider_id UUID REFERENCES public.rider_details(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    seller_earnings DECIMAL(10,2) DEFAULT 0,
    rider_earnings DECIMAL(10,2) DEFAULT 0,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    cancelled_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    product_title TEXT NOT NULL,
    variant_title TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    image_url TEXT
);

-- Order Status History
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    product_id UUID REFERENCES public.products(id),
    seller_id UUID REFERENCES public.seller_details(id),
    rider_id UUID REFERENCES public.rider_details(id),
    order_id UUID REFERENCES public.orders(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    images JSONB DEFAULT '[]',
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_response TEXT,
    admin_responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (product_id IS NOT NULL AND seller_id IS NULL AND rider_id IS NULL) OR
        (product_id IS NULL AND seller_id IS NOT NULL AND rider_id IS NULL) OR
        (product_id IS NULL AND seller_id IS NULL AND rider_id IS NOT NULL)
    )
);

-- Messages / Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID REFERENCES public.seller_details(id),
    rider_id UUID REFERENCES public.rider_details(id),
    order_id UUID REFERENCES public.orders(id),
    subject TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    customer_unread_count INTEGER DEFAULT 0,
    seller_unread_count INTEGER DEFAULT 0,
    rider_unread_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (seller_id IS NOT NULL AND rider_id IS NULL) OR
        (seller_id IS NULL AND rider_id IS NOT NULL)
    )
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discounts / Coupons
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.seller_details(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    value DECIMAL(10,2) NOT NULL,
    min_purchase DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    code TEXT UNIQUE,
    applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_products', 'specific_categories')),
    product_ids JSONB DEFAULT '[]',
    category_ids JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Return/Refund Requests
CREATE TABLE IF NOT EXISTS public.return_refund_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    order_item_id UUID REFERENCES public.order_items(id),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID NOT NULL REFERENCES public.seller_details(id),
    request_type TEXT NOT NULL CHECK (request_type IN ('return', 'refund', 'replacement')),
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'item_received', 'refunded', 'completed')),
    images JSONB DEFAULT '[]',
    admin_notes TEXT,
    seller_response TEXT,
    seller_responded_at TIMESTAMPTZ,
    admin_processed_by UUID REFERENCES public.profiles(id),
    admin_processed_at TIMESTAMPTZ,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Settings
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured_image) WHERE featured_image IS NOT NULL;

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON public.orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at);

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON public.conversations(seller_id);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_seller_details_updated_at
    BEFORE UPDATE ON public.seller_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rider_details_updated_at
    BEFORE UPDATE ON public.rider_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_discounts_updated_at
    BEFORE UPDATE ON public.discounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Update product rating on review
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM public.reviews
        WHERE product_id = NEW.product_id AND status = 'approved'
    ),
    review_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE product_id = NEW.product_id AND status = 'approved'
    )
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Insert default admin settings
INSERT INTO public.admin_settings (key, value, description) VALUES
('platform_commission_rate', '5.00', 'Platform commission percentage from seller sales'),
('rider_service_fee_rate', '5.00', 'Service fee percentage charged to riders'),
('min_withdrawal_amount', '500.00', 'Minimum amount for seller/rider withdrawals'),
('max_return_days', '7', 'Maximum days allowed for return requests'),
('platform_status', '{"active": true, "maintenance_mode": false}', 'Platform operational status'),
('email_notifications', '{"enabled": true, "new_order": true, "order_status": true, "new_message": true}', 'Email notification settings')
ON CONFLICT (key) DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name, description, icon, sort_order) VALUES
('Baking', 'Baking ingredients and supplies', 'fa-bread-slice', 1),
('Coffee & Tea', 'Coffee beans, tea leaves, and accessories', 'fa-coffee', 2),
('Snacks', 'Snacks and finger foods', 'fa-cookie-bite', 3),
('Specialty', 'Specialty and gourmet foods', 'fa-globe', 4),
('Organic', 'Organic and natural products', 'fa-leaf', 5),
('Meal Kits', 'Pre-portioned meal kits', 'fa-box-open', 6)
ON CONFLICT (name) DO NOTHING;
