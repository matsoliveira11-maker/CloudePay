import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("[Webhook] Recebido:", JSON.stringify(body));

    // O Mercado Pago envia o ID do pagamento em data.id
    if (body.type === "payment" && body.data?.id) {
      const paymentId = body.data.id.toString();

      // Inicializa Supabase
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // 1. Encontrar a cobrança no nosso banco pelo gateway_id
      const { data: charge, error: chargeError } = await supabaseAdmin
        .from("charges")
        .select("id, profile_id, status")
        .eq("gateway_id", paymentId)
        .single();

      if (chargeError || !charge) {
        console.error("[Webhook] Cobrança não encontrada:", paymentId);
        return new Response("Charge not found", { status: 200 }); // Retorna 200 para MP parar de tentar
      }

      if (charge.status === "paid") {
        console.log("[Webhook] Cobrança já estava paga:", paymentId);
        return new Response("Already paid", { status: 200 });
      }

      // 2. Buscar o token do vendedor para verificar o status real no MP
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("mp_access_token")
        .eq("id", charge.profile_id)
        .single();

      const sellerToken = profile?.mp_access_token;
      
      if (!sellerToken) {
        console.error("[Webhook] Vendedor sem token:", charge.profile_id);
        return new Response("Seller token not found", { status: 200 });
      }

      // 3. Consultar o status real do pagamento no Mercado Pago (Segurança contra fraudes)
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { "Authorization": `Bearer ${sellerToken}` }
      });

      if (!mpResponse.ok) {
        console.error("[Webhook] Erro ao consultar MP:", await mpResponse.text());
        return new Response("Failed to fetch MP", { status: 200 });
      }

      const paymentData = await mpResponse.json();
      console.log(`[Webhook] Status no MP para ${paymentId}: ${paymentData.status}`);

      // 4. Se estiver pago (approved), atualizar no nosso banco
      if (paymentData.status === "approved") {
        await supabaseAdmin
          .from("charges")
          .update({
            status: "paid",
            paid_at: paymentData.date_approved || new Date().toISOString(),
            receipt_number: `CP${Date.now().toString().slice(-8)}`
          })
          .eq("id", charge.id);

        console.log("[Webhook] ✅ Cobrança atualizada para PAGO no banco!");
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Webhook] Erro Fatal:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
