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

  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()

  try {
    switch (req.method) {
      case 'GET': {
        // Get single product
        if (path && path !== 'products') {
          const { data: product, error } = await supabase
            .from('products')
            .select(`
              *,
              seller:seller_details(business_name, user_id, region, city),
              category:categories(name),
              variants:product_variants(*)
            `)
            .eq('id', path)
            .eq('status', 'active')
            .single()

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true, data: product }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // List products
        let query = supabase
          .from('products')
          .select(`
            *,
            seller:seller_details(business_name, user_id),
            category:categories(name)
          `)
          .eq('status', 'active')

        // Apply filters
        const categoryId = url.searchParams.get('category')
        const sellerId = url.searchParams.get('seller')
        const search = url.searchParams.get('search')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        if (sellerId) {
          query = query.eq('seller_id', sellerId)
        }

        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
        }

        const { data: products, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: products,
            pagination: { limit, offset, count }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'POST': {
        // Check authentication
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
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        // Verify user is a seller
        const { data: seller } = await supabase
          .from('seller_details')
          .select('id, verification_status')
          .eq('user_id', user.id)
          .single()

        if (!seller) {
          return new Response(
            JSON.stringify({ success: false, error: 'Only sellers can create products' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }

        const body = await req.json()
        const { data, error } = await supabase
          .from('products')
          .insert({
            ...body,
            seller_id: seller.id
          })
          .select()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        )

        const body = await req.json()
        const productId = body.id
        delete body.id

        // Verify ownership
        const { data: product } = await supabase
          .from('products')
          .select('seller_id')
          .eq('id', productId)
          .single()

        if (!product) {
          return new Response(
            JSON.stringify({ success: false, error: 'Product not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          )
        }

        const { data: seller } = await supabase
          .from('seller_details')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (product.seller_id !== seller?.id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }

        const { data, error } = await supabase
          .from('products')
          .update(body)
          .eq('id', productId)
          .select()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'DELETE': {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          )
        }

        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        )

        const productId = url.searchParams.get('id')

        const { data: product } = await supabase
          .from('products')
          .select('seller_id')
          .eq('id', productId)
          .single()

        const { data: seller } = await supabase
          .from('seller_details')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (product?.seller_id !== seller?.id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }

        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, message: 'Product deleted' }),
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
