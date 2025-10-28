import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  fromName?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text, from, fromName }: EmailRequest = await req.json()

    // Get Resend API key from environment variables
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      throw new Error('Resend API key not configured. Please add RESEND_API_KEY to your environment variables.')
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || 'RaiseMed.IA <onboarding@resend.dev>', // Default sender (à remplacer par votre domaine)
        to: [to],
        subject: subject,
        html: html || text || '',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Resend API error: ${JSON.stringify(error)}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Email send error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

