import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        const { code, redirect_url } = await req.json()
        if (!code) throw new Error('Missing code')

        const clientId = Deno.env.get('GMAIL_CLIENT_ID')
        const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId!,
                client_secret: clientSecret!,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirect_url,
            }),
        })

        const tokenData = await tokenResponse.json()
        if (!tokenResponse.ok) throw new Error('Failed to exchange code: ' + JSON.stringify(tokenData))

        const expiresAt = Date.now() + (tokenData.expires_in * 1000)

        // Store in DB
        const { error: dbError } = await supabase
            .from('gmail_accounts')
            .upsert({
                user_id: user.id,
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_at: expiresAt,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (dbError) throw dbError

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
