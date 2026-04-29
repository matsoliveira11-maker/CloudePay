import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 1. SEMPRE tratar OPTIONS primeiro de forma isolada
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar se existe corpo na requisição
    const body = await req.json().catch(() => ({}));
    const { code, redirect_uri, userId } = body;

    if (!code || !userId) {
      throw new Error('Dados insuficientes: code ou userId faltando.')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const mpClientId = Deno.env.get('MP_CLIENT_ID')
    const mpClientSecret = Deno.env.get('MP_CLIENT_SECRET')

    if (!mpClientId || !mpClientSecret) {
      throw new Error('Credenciais do Mercado Pago não configuradas no servidor.')
    }

    // 2. Trocar código pelo token no Mercado Pago
    const mpResponse = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: mpClientId,
        client_secret: mpClientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri
      })
    })

    const tokenData = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error("Erro MP Detalhado:", JSON.stringify(tokenData))
      throw new Error(`Mercado Pago diz: ${tokenData.message || tokenData.error || 'Erro desconhecido'}`)
    }

    // 3. Salvar no Banco de Dados
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token,
        mp_user_id: tokenData.user_id.toString(),
        gateway_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`Erro ao salvar no banco: ${updateError.message}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Erro na Function:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Usar 200 para o CORS não reclamar, mas enviar o erro no corpo
    })
  }
})
