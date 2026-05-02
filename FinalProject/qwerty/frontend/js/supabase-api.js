/**
 * Hub E-Commerce - Supabase API Module
 * Database operations using Supabase client
 */

(function() {
    'use strict';

    /**
     * Cart Operations
     */
    const CartAPI = {
        async getCart() {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('cart_items')
                .select(`
                    *,
                    product:products(id, title, featured_image, price, status)
                `)
                .order('created_at', { ascending: false });

            return { data, error };
        },

        async addToCart(productId, quantity, variantId = null) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            // Get product details
            const { data: product } = await supabase
                .from('products')
                .select('price, status')
                .eq('id', productId)
                .single();

            if (!product || product.status !== 'active') {
                return { error: 'Product not available' };
            }

            const unitPrice = product.price;
            const totalPrice = unitPrice * quantity;

            // Check if item already exists
            const { data: existingItem } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('product_id', productId)
                .eq('variant_id', variantId || null)
                .maybeSingle();

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                const { data, error } = await supabase
                    .from('cart_items')
                    .update({
                        quantity: newQuantity,
                        total_price: unitPrice * newQuantity
                    })
                    .eq('id', existingItem.id)
                    .select();
                return { data, error };
            }

            const { data, error } = await supabase
                .from('cart_items')
                .insert({
                    product_id: productId,
                    variant_id: variantId,
                    quantity: quantity,
                    unit_price: unitPrice,
                    total_price: totalPrice
                })
                .select();

            return { data, error };
        },

        async updateQuantity(itemId, quantity) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data: item } = await supabase
                .from('cart_items')
                .select('unit_price')
                .eq('id', itemId)
                .single();

            if (!item) return { error: 'Item not found' };

            const { data, error } = await supabase
                .from('cart_items')
                .update({
                    quantity: quantity,
                    total_price: item.unit_price * quantity
                })
                .eq('id', itemId)
                .select();

            return { data, error };
        },

        async removeFromCart(itemId) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', itemId);

            return { error };
        },

        async clearCart() {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { error } = await supabase
                .from('cart_items')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            return { error };
        },

        subscribeToChanges(callback) {
            return window.HubSupabase.subscribeToTable('cart_items', callback, {
                filter: `user_id=eq.${window.HubSupabase.getCurrentUser()?.id}`
            });
        }
    };

    /**
     * Wishlist Operations
     */
    const WishlistAPI = {
        async getWishlist() {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('wishlist_items')
                .select(`
                    *,
                    product:products(id, title, featured_image, price, status)
                `)
                .order('added_at', { ascending: false });

            return { data, error };
        },

        async addToWishlist(productId) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('wishlist_items')
                .insert({ product_id: productId })
                .select();

            return { data, error };
        },

        async removeFromWishlist(itemId) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { error } = await supabase
                .from('wishlist_items')
                .delete()
                .eq('id', itemId);

            return { error };
        },

        async isInWishlist(productId) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { data: false };

            const { data, error } = await supabase
                .from('wishlist_items')
                .select('id')
                .eq('product_id', productId)
                .maybeSingle();

            return { data: !!data, error };
        }
    };

    /**
     * Products Operations
     */
    const ProductsAPI = {
        async getProducts(options = {}) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            let query = supabase
                .from('products')
                .select(`
                    *,
                    seller:seller_details(business_name, user_id),
                    category:categories(name)
                `)
                .eq('status', 'active');

            if (options.category) {
                query = query.eq('category_id', options.category);
            }

            if (options.sellerId) {
                query = query.eq('seller_id', options.sellerId);
            }

            if (options.search) {
                query = query.ilike('title', `%${options.search}%`);
            }

            if (options.minPrice) {
                query = query.gte('price', options.minPrice);
            }

            if (options.maxPrice) {
                query = query.lte('price', options.maxPrice);
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            return { data, error };
        },

        async getProductById(productId) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    seller:seller_details(business_name, user_id),
                    category:categories(name),
                    variants:product_variants(*)
                `)
                .eq('id', productId)
                .single();

            return { data, error };
        },

        async getFeaturedProducts(limit = 8) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'active')
                .not('featured_image', 'is', null)
                .order('total_sales', { ascending: false })
                .limit(limit);

            return { data, error };
        },

        async getCategories() {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            return { data, error };
        }
    };

    /**
     * Orders Operations
     */
    const OrdersAPI = {
        async getOrders(role = 'customer') {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            let query = supabase
                .from('orders')
                .select(`
                    *,
                    seller:seller_details(business_name),
                    items:order_items(*)
                `);

            if (role === 'customer') {
                // Filter by user - handled by RLS
            } else if (role === 'seller') {
                // Filter by seller - handled by RLS
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            return { data, error };
        },

        async getOrderById(orderId) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    seller:seller_details(business_name, user_id),
                    rider:rider_details(user_id),
                    items:order_items(*),
                    status_history:order_status_history(*)
                `)
                .eq('id', orderId)
                .single();

            return { data, error };
        },

        async createOrder(orderData) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('orders')
                .insert(orderData)
                .select();

            return { data, error };
        },

        async updateOrderStatus(orderId, status, notes = '') {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const updates = { status };
            if (status === 'delivered') {
                updates.delivered_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', orderId)
                .select();

            if (!error) {
                // Add status history entry
                await supabase
                    .from('order_status_history')
                    .insert({
                        order_id: orderId,
                        status: status,
                        notes: notes
                    });
            }

            return { data, error };
        },

        subscribeToOrderChanges(orderId, callback) {
            return window.HubSupabase.subscribeToTable('orders', callback, {
                filter: `id=eq.${orderId}`
            });
        }
    };

    /**
     * Messages Operations
     */
    const MessagesAPI = {
        async getConversations() {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    customer:profiles(first_name, last_name, email),
                    seller:seller_details(business_name, user_id),
                    rider:rider_details(user_id),
                    last_message:messages(content, created_at)
                `)
                .order('last_message_at', { ascending: false });

            return { data, error };
        },

        async getMessages(conversationId) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles(first_name, last_name, avatar_url)
                `)
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            return { data, error };
        },

        async sendMessage(conversationId, content, attachments = []) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    content: content,
                    attachments: attachments
                })
                .select();

            return { data, error };
        },

        async createConversation(participantData) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('conversations')
                .insert(participantData)
                .select();

            return { data, error };
        },

        async markAsRead(conversationId) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { error } = await supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('conversation_id', conversationId)
                .eq('is_read', false);

            return { error };
        },

        subscribeToMessages(conversationId, callback) {
            return window.HubSupabase.subscribeToTable('messages', callback, {
                filter: `conversation_id=eq.${conversationId}`
            });
        }
    };

    /**
     * Reviews Operations
     */
    const ReviewsAPI = {
        async getReviews(options = {}) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            let query = supabase
                .from('reviews')
                .select(`
                    *,
                    user:profiles(first_name, last_name, avatar_url)
                `)
                .eq('status', 'approved');

            if (options.productId) {
                query = query.eq('product_id', options.productId);
            }

            if (options.sellerId) {
                query = query.eq('seller_id', options.sellerId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            return { data, error };
        },

        async createReview(reviewData) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('reviews')
                .insert(reviewData)
                .select();

            return { data, error };
        },

        async getProductRating(productId) {
            const supabase = await window.HubSupabase.getClient();
            if (!supabase) return { error: 'Not initialized' };

            const { data, error } = await supabase
                .from('reviews')
                .select('rating')
                .eq('product_id', productId)
                .eq('status', 'approved');

            if (error) return { error };

            const avgRating = data.length > 0
                ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
                : 0;

            return { data: { average: avgRating, count: data.length } };
        }
    };

    // Expose APIs to global scope
    window.HubAPI = {
        cart: CartAPI,
        wishlist: WishlistAPI,
        products: ProductsAPI,
        orders: OrdersAPI,
        messages: MessagesAPI,
        reviews: ReviewsAPI
    };

    console.log('✅ Supabase API module loaded');
})();
