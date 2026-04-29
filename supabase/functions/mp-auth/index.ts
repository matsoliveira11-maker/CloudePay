import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratar requisição CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirect_uri } = await req.json()

    // 1. Validar se o usuário que chamou a função está autenticado
    const authHeader = req.headers.get('Authorization')!
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Criar um cliente Supabase usando o token do usuário que fez a requisição
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Não autorizado. Faça login.')
    }

    // 2. Chamar a API do Mercado Pago de forma segura no backend
    const mpClientId = Deno.env.get('MP_CLIENT_ID')
    const mpClientSecret = Deno.env.get('MP_CLIENT_SECRET')

    if (!mpClientId || !mpClientSecret) {
      throw new Error('Credenciais do Mercado Pago não configuradas no servidor.')
    }

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

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json()
      console.error("Erro MP:", errorData)
      throw new Error(errorData.message || "Falha na comunicação com Mercado Pago.")
    }

    const tokenData = await mpResponse.json()

    // 3. Salvar os tokens do Mercado Pago no perfil do usuário
    // Usamos a Service Role Key para garantir permissão de update na tabela
    const supabaseAdmin = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token,
        mp_user_id: tokenData.user_id.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      throw new Error('Erro ao salvar token no banco de dados.')
    }

    // Sucesso!
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
