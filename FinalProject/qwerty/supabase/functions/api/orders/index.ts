import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../../_shared/cors.ts'

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()

  try {
    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'customer'

    switch (req.method) {
      case 'GET': {
        // Customer view their orders
        if (userRole === 'customer') {
          const { data: orders, error } = await supabase
            .from('orders')
            .select(`
              *,
              seller:seller_details(business_name, user_id),
              rider:rider_details(user_id),
              items:order_items(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true, data: orders }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Seller view their orders
        if (userRole === 'seller') {
          const { data: seller } = await supabase
            .from('seller_details')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (!seller) {
            return new Response(
              JSON.stringify({ success: false, error: 'Seller not found' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
          }

          const { data: orders, error } = await supabase
            .from('orders')
            .select(`
              *,
              customer:profiles(first_name, last_name, email, phone),
              rider:rider_details(user_id),
              items:order_items(*)
            `)
            .eq('seller_id', seller.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true, data: orders }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Rider view assigned orders
        if (userRole === 'rider') {
          const { data: rider } = await supabase
            .from('rider_details')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (!rider) {
            return new Response(
              JSON.stringify({ success: false, error: 'Rider not found' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
          }

          const { data: orders, error } = await supabase
            .from('orders')
            .select(`
              *,
              customer:profiles(first_name, last_name, phone),
              seller:seller_details(business_name),
              items:order_items(*)
            `)
            .eq('rider_id', rider.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true, data: orders }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Admin view all orders
        if (userRole === 'admin') {
          const { data: orders, error } = await supabase
            .from('orders')
            .select(`
              *,
              customer:profiles(first_name, last_name, email),
              seller:seller_details(business_name),
              rider:rider_details(user_id)
            `)
            .order('created_at', { ascending: false })
            .limit(100)

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true, data: orders }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: false, error: 'Invalid role' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }

      case 'POST': {
        if (userRole !== 'customer') {
          return new Response(
            JSON.stringify({ success: false, error: 'Only customers can create orders' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }

        const body = await req.json()
        const { seller_id, shipping_address, payment_method, notes } = body

        // Get cart items
        const { data: cartItems, error: cartError } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:products(id, title, seller_id, price, featured_image, status)
          `)
          .eq('user_id', user.id)

        if (cartError) throw cartError

        if (!cartItems || cartItems.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: 'Cart is empty' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // Filter items from the specified seller
        const sellerItems = cartItems.filter(item => 
          item.product?.seller_id === seller_id && item.product?.status === 'active'
        )

        if (sellerItems.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: 'No valid items from this seller' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        // Calculate totals
        const subtotal = sellerItems.reduce((sum, item) => sum + item.total_price, 0)
        const shipping_fee = 50 // Default shipping fee
        const total_amount = subtotal + shipping_fee

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            seller_id,
            status: 'pending',
            payment_status: 'pending',
            payment_method,
            subtotal,
            shipping_fee,
            total_amount,
            shipping_address,
            notes
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Create order items
        const orderItems = sellerItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_title: item.product.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          image_url: item.product.featured_image
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError

        // Clear cart items for this seller
        const { error: clearError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .in('product_id', sellerItems.map(item => item.product_id))

        if (clearError) throw clearError

        return new Response(
          JSON.stringify({ success: true, data: order }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const body = await req.json()
        const { order_id, status, rider_id } = body

        // Get order to check permissions
        const { data: order } = await supabase
          .from('orders')
          .select('seller_id, rider_id, user_id')
          .eq('id', order_id)
          .single()

        if (!order) {
          return new Response(
            JSON.stringify({ success: false, error: 'Order not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          )
        }

        let updates: any = {}

        // Seller can update status (preparing, ready)
        if (userRole === 'seller') {
          const { data: seller } = await supabase
            .from('seller_details')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (seller?.id !== order.seller_id) {
            return new Response(
              JSON.stringify({ success: false, error: 'Unauthorized' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
          }

          updates.status = status
        }

        // Rider can update status (picked_up, in_transit, delivered)
        if (userRole === 'rider') {
          const { data: rider } = await supabase
            .from('rider_details')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (rider?.id !== order.rider_id) {
            return new Response(
              JSON.stringify({ success: false, error: 'Unauthorized' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
          }

          updates.status = status
          if (status === 'delivered') {
            updates.delivered_at = new Date().toISOString()
          }
        }

        // Admin can update everything
        if (userRole === 'admin') {
          updates = { ...updates, status, rider_id }
        }

        const { data, error } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', order_id)
          .select()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
