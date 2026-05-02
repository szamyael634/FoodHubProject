import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://gladttjcpcgpvxdrhqmx.supabase.co'
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWR0dGpjcGNncHZ4ZHJocW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODkyMTIsImV4cCI6MjA5MzI2NTIxMn0.HON5KpR2tuXISMZl4hgx48A0qYaxeUlBMHg7fO0rNJI'
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const url = new URL(req.url)

  try {
    switch (req.method) {
      case 'GET': {
        const orderId = url.searchParams.get('id')
        const status = url.searchParams.get('status')
        const role = url.searchParams.get('role') || 'customer'

        if (orderId) {
          const { data: order, error } = await supabase
            .from('orders')
            .select(`
              *,
              items:order_items(*),
              seller:seller_details(business_name, user_id)
            `)
            .eq('id', orderId)
            .single()

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true, data: order }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        let query = supabase
          .from('orders')
          .select(`
            *,
            seller:seller_details(business_name)
          `)
          .order('created_at', { ascending: false })

        if (status) {
          query = query.eq('status', status)
        }

        const { data: orders, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: orders }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'POST': {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        )

        if (authError || !user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid token' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        const body = await req.json()
        const { seller_id, items, shipping_address, payment_method, notes } = body

        if (!seller_id || !items || !items.length) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing required fields' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const subtotal = items.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0)
        const deliveryFee = body.delivery_fee || 50
        const totalAmount = subtotal + deliveryFee

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_id: user.id,
            seller_id: seller_id,
            total_amount: totalAmount,
            delivery_fee: deliveryFee,
            status: 'pending',
            payment_method: payment_method || 'cod',
            payment_status: 'pending',
            shipping_address: shipping_address,
            notes: notes
          })
          .select()
          .single()

        if (orderError) throw orderError

        const orderItems = items.map((item: any) => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError

        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .in('product_id', items.map((i: any) => i.product_id))

        return new Response(
          JSON.stringify({ success: true, data: order }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const body = await req.json()
        const { order_id, status, rider_id, tracking_number } = body

        if (!order_id || !status) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing order_id or status' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const updates: any = { status }
        if (rider_id) updates.rider_id = rider_id
        if (tracking_number) updates.tracking_number = tracking_number
        if (status === 'delivered') updates.delivered_at = new Date().toISOString()

        const { data, error } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', order_id)
          .select()

        if (error) throw error

        await supabase
          .from('order_status_history')
          .insert({
            order_id: order_id,
            status: status,
            notes: body.notes || `Status updated to ${status}`
          })

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
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
