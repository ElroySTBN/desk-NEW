import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { token } = await req.json()

        if (!token) {
            throw new Error('Token is required')
        }

        // Create a Supabase client with the Admin Key (Service Role Key)
        // This is required because we are bypassing RLS to find the client by token
        // BUT we only return specific data.
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Find client by magic_link_token
        const { data: client, error: clientError } = await supabaseAdmin
            .from('clients')
            .select('id, name, email, phone, onboarding_status, lifecycle_stage')
            .eq('magic_link_token', token)
            .single()

        if (clientError || !client) {
            return new Response(
                JSON.stringify({ error: 'Invalid or expired token' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            )
        }

        // 2. Fetch Brand DNA
        const { data: brandDna, error: dnaError } = await supabaseAdmin
            .from('brand_dna')
            .select('*')
            .eq('client_id', client.id)
            .maybeSingle() // It might not exist yet

        return new Response(
            JSON.stringify({
                client,
                brandDna: brandDna || {} // Return empty object if no DNA yet
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
