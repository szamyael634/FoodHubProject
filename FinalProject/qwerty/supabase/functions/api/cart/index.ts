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

  try {
    switch (req.method) {
      case 'GET': {
        const { data: items, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:products(id, title, featured_image, status),
            variant:product_variants(id, title, stock_quantity)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        const validItems = items?.filter(item => item.product?.status === 'active') || []
        const total = validItems.reduce((sum, item) => sum + (item.total_price || 0), 0)

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              items: validItems,
              total: total,
              item_count: validItems.length
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'POST': {
        const body = await req.json()
        const { product_id, variant_id, quantity } = body

        if (!product_id || !quantity) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing required fields' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { data: product } = await supabase
          .from('products')
          .select('price, stock_quantity, status')
          .eq('id', product_id)
          .single()

        if (!product || product.status !== 'active') {
          return new Response(
            JSON.stringify({ success: false, error: 'Product not available' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const unit_price = product.price
        const total_price = unit_price * quantity

        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', product_id)
          .eq('variant_id', variant_id || null)
          .maybeSingle()

        let result
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity
          const { data, error } = await supabase
            .from('cart_items')
            .update({
              quantity: newQuantity,
              total_price: unit_price * newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingItem.id)
            .select()
          result = { data, error }
        } else {
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id,
              variant_id: variant_id || null,
              quantity,
              unit_price,
              total_price
            })
            .select()
          result = { data, error }
        }

        if (result.error) throw result.error

        return new Response(
          JSON.stringify({ success: true, data: result.data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const body = await req.json()
        const { item_id, quantity } = body

        const { data: item } = await supabase
          .from('cart_items')
          .select('unit_price')
          .eq('id', item_id)
          .eq('user_id', user.id)
          .single()

        if (!item) {
          return new Response(
            JSON.stringify({ success: false, error: 'Item not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          )
        }

        const { data, error } = await supabase
          .from('cart_items')
          .update({
            quantity,
            total_price: item.unit_price * quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item_id)
          .eq('user_id', user.id)
          .select()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'DELETE': {
        const url = new URL(req.url)
        const item_id = url.searchParams.get('item_id')

        if (!item_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Item ID required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', item_id)
          .eq('user_id', user.id)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, message: 'Item removed' }),
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
