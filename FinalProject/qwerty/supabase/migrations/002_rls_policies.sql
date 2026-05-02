-- ============================================
-- Hub E-Commerce Platform - RLS Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Sellers can view customer profiles who have ordered from them
CREATE POLICY "Sellers can view customer profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.seller_details s ON o.seller_id = s.id
            WHERE o.user_id = public.profiles.id AND s.user_id = auth.uid()
        ) OR auth.uid() = id
    );

-- Riders can view customer/seller profiles for their deliveries
CREATE POLICY "Riders can view delivery profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.rider_details r ON o.rider_id = r.id
            WHERE (o.user_id = public.profiles.id OR 
                   EXISTS (SELECT 1 FROM public.seller_details s WHERE s.id = o.seller_id AND s.user_id = public.profiles.id))
            AND r.user_id = auth.uid()
        ) OR auth.uid() = id
    );

-- ============================================
-- SELLER DETAILS POLICIES
-- ============================================

-- Sellers can view and manage their own details
CREATE POLICY "Sellers manage own details" ON public.seller_details
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Customers can view verified seller details
CREATE POLICY "Customers view verified sellers" ON public.seller_details
    FOR SELECT USING (
        verification_status = 'verified' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer')
    );

-- Admins can manage all seller details
CREATE POLICY "Admins manage all sellers" ON public.seller_details
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- RIDER DETAILS POLICIES
-- ============================================

-- Riders can view and manage their own details
CREATE POLICY "Riders manage own details" ON public.rider_details
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Sellers can view rider details for their orders
CREATE POLICY "Sellers view order riders" ON public.rider_details
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.seller_details s ON o.seller_id = s.id
            WHERE o.rider_id = public.rider_details.id AND s.user_id = auth.uid()
        )
    );

-- Admins can manage all rider details
CREATE POLICY "Admins manage all riders" ON public.rider_details
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Anyone can view active products
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (status = 'active');

-- Sellers can manage their own products
CREATE POLICY "Sellers manage own products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = products.seller_id AND s.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = products.seller_id AND s.user_id = auth.uid()
        )
    );

-- Admins can manage all products
CREATE POLICY "Admins manage all products" ON public.products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- PRODUCT VARIANTS POLICIES
-- ============================================

-- Anyone can view variants of active products
CREATE POLICY "Anyone can view variants" ON public.product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_variants.product_id AND p.status = 'active'
        )
    );

-- Sellers can manage variants of their products
CREATE POLICY "Sellers manage own variants" ON public.product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.seller_details s ON p.seller_id = s.id
            WHERE p.id = product_variants.product_id AND s.user_id = auth.uid()
        )
    );

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

-- Anyone can view active categories
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (is_active = TRUE);

-- Only admins can manage categories
CREATE POLICY "Admins manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- CART ITEMS POLICIES
-- ============================================

-- Users can view their own cart items
CREATE POLICY "Users view own cart" ON public.cart_items
    FOR SELECT USING (user_id = auth.uid());

-- Users can add items to their cart
CREATE POLICY "Users add to cart" ON public.cart_items
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their cart items
CREATE POLICY "Users update own cart" ON public.cart_items
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their cart items
CREATE POLICY "Users delete from cart" ON public.cart_items
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- WISHLIST ITEMS POLICIES
-- ============================================

-- Users can view their own wishlist
CREATE POLICY "Users view own wishlist" ON public.wishlist_items
    FOR SELECT USING (user_id = auth.uid());

-- Users can add to wishlist
CREATE POLICY "Users add to wishlist" ON public.wishlist_items
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can remove from wishlist
CREATE POLICY "Users remove from wishlist" ON public.wishlist_items
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Customers can view their own orders
CREATE POLICY "Customers view own orders" ON public.orders
    FOR SELECT USING (user_id = auth.uid());

-- Sellers can view orders for their products
CREATE POLICY "Sellers view their orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = orders.seller_id AND s.user_id = auth.uid()
        )
    );

-- Riders can view assigned orders
CREATE POLICY "Riders view assigned orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rider_details r
            WHERE r.id = orders.rider_id AND r.user_id = auth.uid()
        )
    );

-- Admins can view all orders
CREATE POLICY "Admins view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Sellers can update order status (limited fields)
CREATE POLICY "Sellers update order status" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = orders.seller_id AND s.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = orders.seller_id AND s.user_id = auth.uid()
        )
    );

-- Riders can update delivery status
CREATE POLICY "Riders update delivery status" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.rider_details r
            WHERE r.id = orders.rider_id AND r.user_id = auth.uid()
        )
    );

-- Admins can update all orders
CREATE POLICY "Admins update all orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================

-- Users can view items from their orders
CREATE POLICY "Users view order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
        )
    );

-- Sellers can view items from their orders
CREATE POLICY "Sellers view order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.seller_details s ON o.seller_id = s.id
            WHERE o.id = order_items.order_id AND s.user_id = auth.uid()
        )
    );

-- ============================================
-- ORDER STATUS HISTORY POLICIES
-- ============================================

-- Related parties can view status history
CREATE POLICY "View order status history" ON public.order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            LEFT JOIN public.seller_details s ON o.seller_id = s.id
            LEFT JOIN public.rider_details r ON o.rider_id = r.id
            WHERE o.id = order_status_history.order_id
            AND (o.user_id = auth.uid() OR s.user_id = auth.uid() OR r.user_id = auth.uid())
        )
    );

-- System can insert status history (via trigger or edge function)
CREATE POLICY "System insert status history" ON public.order_status_history
    FOR INSERT WITH CHECK (true);

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON public.reviews
    FOR SELECT USING (status = 'approved');

-- Users can view their own reviews (even if pending)
CREATE POLICY "Users view own reviews" ON public.reviews
    FOR SELECT USING (user_id = auth.uid());

-- Sellers can view reviews for their products
CREATE POLICY "Sellers view product reviews" ON public.reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p
            JOIN public.seller_details s ON p.seller_id = s.id
            WHERE p.id = reviews.product_id AND s.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = reviews.seller_id AND s.user_id = auth.uid()
        )
    );

-- Riders can view their reviews
CREATE POLICY "Riders view own reviews" ON public.reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rider_details r
            WHERE r.id = reviews.rider_id AND r.user_id = auth.uid()
        )
    );

-- Users can create reviews for their completed orders
CREATE POLICY "Users create reviews" ON public.reviews
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = reviews.order_id 
            AND o.user_id = auth.uid() 
            AND o.status = 'delivered'
        )
    );

-- Users can update their own reviews
CREATE POLICY "Users update own reviews" ON public.reviews
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "Users delete own reviews" ON public.reviews
    FOR DELETE USING (user_id = auth.uid());

-- Admins can manage all reviews
CREATE POLICY "Admins manage reviews" ON public.reviews
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

-- Participants can view their conversations
CREATE POLICY "Participants view conversations" ON public.conversations
    FOR SELECT USING (
        customer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = conversations.seller_id AND s.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.rider_details r
            WHERE r.id = conversations.rider_id AND r.user_id = auth.uid()
        )
    );

-- Participants can create conversations
CREATE POLICY "Participants create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        customer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = conversations.seller_id AND s.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.rider_details r
            WHERE r.id = conversations.rider_id AND r.user_id = auth.uid()
        )
    );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Participants can view messages in their conversations
CREATE POLICY "Participants view messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
            AND (c.customer_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM public.seller_details s WHERE s.id = c.seller_id AND s.user_id = auth.uid()) OR
                 EXISTS (SELECT 1 FROM public.rider_details r WHERE r.id = c.rider_id AND r.user_id = auth.uid()))
        )
    );

-- Participants can send messages
CREATE POLICY "Participants send messages" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = messages.conversation_id
            AND (c.customer_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM public.seller_details s WHERE s.id = c.seller_id AND s.user_id = auth.uid()) OR
                 EXISTS (SELECT 1 FROM public.rider_details r WHERE r.id = c.rider_id AND r.user_id = auth.uid()))
        )
    );

-- Senders can update their messages (for edits)
CREATE POLICY "Senders update messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- ============================================
-- DISCOUNTS POLICIES
-- ============================================

-- Anyone can view active discounts
CREATE POLICY "Anyone view active discounts" ON public.discounts
    FOR SELECT USING (
        is_active = TRUE AND
        (start_at IS NULL OR start_at <= NOW()) AND
        (end_at IS NULL OR end_at >= NOW())
    );

-- Sellers can manage their discounts
CREATE POLICY "Sellers manage discounts" ON public.discounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = discounts.seller_id AND s.user_id = auth.uid()
        )
    );

-- Admins can manage all discounts
CREATE POLICY "Admins manage discounts" ON public.discounts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- RETURN/REFUND REQUESTS POLICIES
-- ============================================

-- Customers can view their requests
CREATE POLICY "Customers view own requests" ON public.return_refund_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = return_refund_requests.user_id AND p.id = auth.uid()
        )
    );

-- Customers can create requests
CREATE POLICY "Customers create requests" ON public.return_refund_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Sellers can view and respond to requests for their orders
CREATE POLICY "Sellers view order requests" ON public.return_refund_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = return_refund_requests.seller_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Sellers respond to requests" ON public.return_refund_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.seller_details s
            WHERE s.id = return_refund_requests.seller_id AND s.user_id = auth.uid()
        )
    );

-- Admins can manage all requests
CREATE POLICY "Admins manage requests" ON public.return_refund_requests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- ADMIN SETTINGS POLICIES
-- ============================================

-- Anyone can view admin settings (for public configs)
CREATE POLICY "Anyone view admin settings" ON public.admin_settings
    FOR SELECT USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins modify settings" ON public.admin_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- ACTIVITY LOGS POLICIES
-- ============================================

-- Users can view their own activity logs
CREATE POLICY "Users view own logs" ON public.activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- Admins can view all logs
CREATE POLICY "Admins view all logs" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- System can insert logs
CREATE POLICY "System insert logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS FOR PROFILE CREATION
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role, status, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        'active',
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
