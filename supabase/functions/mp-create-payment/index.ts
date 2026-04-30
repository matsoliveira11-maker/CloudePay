import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Obter dados da requisição
    const { 
      amount_cents, 
      service_name, 
      payer_name, 
      payer_email, 
      payer_cpf, 
      deviceId, 
      profile_id,
      external_reference,
      description
    } = await req.json()

    if (!amount_cents || !profile_id) {
      throw new Error('Dados insuficientes para criar cobrança.')
    }

    // 2. Buscar o Token do Vendedor no Banco (Segurança!)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('mp_access_token')
      .eq('id', profile_id)
      .single()

    if (profileError || !profile?.mp_access_token) {
      throw new Error('Vendedor não possui conta do Mercado Pago conectada.')
    }

    const sellerToken = profile.mp_access_token

    // 3. Preparar dados do pagador
    const nameParts = (payer_name || "Cliente Final").trim().split(" ")
    const firstName = nameParts[0] || "Cliente"
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Final"

    // 4. Chamar API do Mercado Pago (Server-side)
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sellerToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `charge_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        "X-Meli-Session-Id": deviceId || ""
      },
      body: JSON.stringify({
        transaction_amount: amount_cents / 100,
        description: service_name || "Serviço CloudePay",
        external_reference: external_reference || `charge_${Date.now()}`,
        statement_descriptor: "CLOUDEPAY",
        payment_method_id: "pix",
        notification_url: "https://crmhkvvjrblajemgtrpz.supabase.co/functions/v1/mp-webhook",
        payer: {
          email: payer_email || "pagamento@cloudepay.app",
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: "CPF",
            number: (payer_cpf || "00000000000").replace(/\D/g, "")
          }
        },
        additional_info: {
          items: [
            {
              id: external_reference || "custom_charge",
              title: service_name || "Serviço",
              description: description || "Pagamento via CloudePay",
              category_id: "services",
              quantity: 1,
              unit_price: amount_cents / 100
            }
          ],
          payer: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })
    })

    const mpData = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error("[MP Error]", JSON.stringify(mpData))
      throw new Error(mpData.message || 'Erro ao criar pagamento no Mercado Pago')
    }

    // 5. Salvar no nosso banco de dados (Charges)
    const total_fee_rate = 0.02
    const fee_cents = Math.round(amount_cents * total_fee_rate)
    const net_amount_cents = amount_cents - fee_cents
    const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    
    const { data: newCharge, error: insertError } = await supabaseAdmin
      .from('charges')
      .insert({
        profile_id: profile_id,
        amount_cents: amount_cents,
        fee_cents: fee_cents,
        net_amount_cents: net_amount_cents,
        service_name: service_name,
        description: description || null,
        payer_name: payer_name || null,
        payer_cpf: (payer_cpf || "00000000000").replace(/\D/g, ""),
        payer_email: payer_email || null,
        notes: null,
        status: 'pending',
        gateway_id: mpData.id.toString(),
        pix_code: mpData.point_of_interaction.transaction_data.qr_code,
        qr_code_image: mpData.point_of_interaction.transaction_data.qr_code_base64,
        expires_at: expires_at,
        charge_type: 'direct'
      })
      .select()
      .single()

    if (insertError) {
      console.error("[DB Insert Error]", insertError)
      throw new Error('Pagamento criado no MP, mas erro ao salvar no banco local.')
    }

    // 6. Retornar os dados para o Frontend
    return new Response(JSON.stringify(newCharge), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Erro na Function:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
