import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"
import { getGmailToken, sendEmail, createMimeMessage } from "../_shared/gmail.ts"

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

        const { to, subject, body } = await req.json()
        if (!to || !subject || !body) throw new Error('Missing required fields')

        const accessToken = await getGmailToken(supabase, user.id)
        const rawMessage = createMimeMessage(to, subject, body, false)
        const result = await sendEmail(accessToken, rawMessage)

        // Log to DB
        await supabase.from('sent_emails').insert({
            user_id: user.id,
            to,
            subject,
            body_text: body,
            status: 'sent'
        })

        return new Response(JSON.stringify(result), {
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
