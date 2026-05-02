import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || 'https://gladttjcpcgpvxdrhqmx.supabase.co'
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWR0dGpjcGNncHZ4ZHJocW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODkyMTIsImV4cCI6MjA5MzI2NTIxMn0.HON5KpR2tuXISMZl4hgx48A0qYaxeUlBMHg7fO0rNJI'
  
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

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid token' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  const userId = user.id

  try {
    switch (req.method) {
      case 'GET': {
        const { data: cartItems, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:products(id, title, featured_image, price, status)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        const total = cartItems?.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0) || 0

        return new Response(
          JSON.stringify({ success: true, data: { items: cartItems, total } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'POST': {
        const body = await req.json()
        const { product_id, quantity, variant_id } = body

        if (!product_id || !quantity) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing product_id or quantity' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: product, error: productError } = await supabase
          .from('products')
          .select('price, status')
          .eq('id', product_id)
          .single()

        if (productError || !product || product.status !== 'active') {
          return new Response(
            JSON.stringify({ success: false, error: 'Product not found or inactive' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          )
        }

        const unitPrice = product.price
        const totalPrice = unitPrice * quantity

        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('product_id', product_id)
          .eq('variant_id', variant_id || null)
          .maybeSingle()

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity
          const { data, error } = await supabase
            .from('cart_items')
            .update({
              quantity: newQuantity,
              total_price: unitPrice * newQuantity
            })
            .eq('id', existingItem.id)
            .select()

          if (error) throw error
          return new Response(
            JSON.stringify({ success: true, data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: product_id,
            variant_id: variant_id || null,
            quantity: quantity,
            unit_price: unitPrice,
            total_price: totalPrice
          })
          .select()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const body = await req.json()
        const { item_id, quantity } = body

        if (!item_id || !quantity) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing item_id or quantity' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: item, error: itemError } = await supabase
          .from('cart_items')
          .select('unit_price')
          .eq('id', item_id)
          .eq('user_id', userId)
          .single()

        if (itemError || !item) {
          return new Response(
            JSON.stringify({ success: false, error: 'Item not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          )
        }

        const { data, error } = await supabase
          .from('cart_items')
          .update({
            quantity: quantity,
            total_price: item.unit_price * quantity
          })
          .eq('id', item_id)
          .eq('user_id', userId)
          .select()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'DELETE': {
        const url = new URL(req.url)
        const itemId = url.searchParams.get('id')

        if (!itemId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing item id' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, message: 'Item removed from cart' }),
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
