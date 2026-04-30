import { supabase } from "./supabase";
import type { Profile, Charge, Product, ChargeStatus, ChargeType } from "./mockBackend";

// Re-export types
export type { Profile, Charge, Product, ChargeStatus, ChargeType };

// ---------- AUTH & PROFILE REAL (Já implementado) ----------

export async function signUp(input: {
  full_name: string;
  email: string;
  password: string;
  cpf: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.full_name,
        cpf: input.cpf.replace(/\D/g, ""),
      }
    }
  });

  if (error) return { ok: false as const, error: error.message };

  if (data.user) {
    const { error: pError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: input.email,
      full_name: input.full_name,
      cpf: input.cpf.replace(/\D/g, ""),
    });

    if (pError && pError.code !== '23505') { 
       console.error("Erro ao criar perfil:", pError);
    }
  }

  return { ok: true as const, profile: data.user };
}

export async function signIn(email: string, password: string) {
  const { data: _d, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { ok: false as const, error: "Email ou senha incorretos." };
  
  const p = await getCurrentProfile();
  return { ok: true as const, profile: p };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function updateProfile(
  id: string,
  patch: Partial<Pick<Profile, "service_name" | "description" | "slug" | "full_name" | "cpf" | "email">>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, profile: data as Profile };
}

export async function updateAuthCredentials(email?: string, password?: string) {
  const updates: { email?: string; password?: string } = {};
  if (email) updates.email = email;
  if (password) updates.password = password;

  const { error } = await supabase.auth.updateUser(updates);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function updateOnboardingState(
  profileId: string,
  patch: {
    currentStep?: number;
    completed?: boolean;
    skipped?: boolean;
  }
) {
  const update: any = {};
  if (patch.currentStep !== undefined) update.onboarding_step = patch.currentStep;
  if (patch.completed) update.onboarding_completed_at = new Date().toISOString();
  if (patch.skipped) update.onboarding_skipped_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', profileId)
    .select()
    .single();

  if (error || !data) return null;
  
  return {
    completedAt: data.onboarding_completed_at,
    skippedAt: data.onboarding_skipped_at,
    currentStep: data.onboarding_step,
    needsOnboarding: !data.onboarding_completed_at,
  };
}

export async function isSlugAvailable(slug: string, exceptProfileId?: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('slug', slug)
    .not('id', 'eq', exceptProfileId || '00000000-0000-0000-0000-000000000000');

  if (error) return false;
  return data.length === 0;
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

// ---------- CHARGES REAL ----------

export async function createCharge(input: {
  profile_id: string;
  slug: string;
  amount_cents: number;
  service_name: string;
  description?: string | null;
  payer_name?: string | null;
  payer_cpf: string;
  payer_email?: string | null;
  notes?: string | null;
  charge_type?: ChargeType;
  deviceId?: string;
  product_id?: string;
}): Promise<Charge> {
  const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  
  // 1. BUSCAR TOKEN DO VENDEDOR
  const { data: profile } = await supabase
    .from('profiles')
    .select('mp_access_token')
    .eq('id', input.profile_id)
    .single();

  const sellerToken = profile?.mp_access_token;

  if (!sellerToken) {
    throw new Error("Você precisa conectar sua conta do Mercado Pago nas Configurações para gerar cobranças reais.");
  }

  // Capturar IP do pagador para aumentar nota de qualidade
  let payerIp = "127.0.0.1";
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    payerIp = ipData.ip;
  } catch (e) {
    console.warn("Não foi possível capturar o IP para o score de qualidade.");
  }

  // Taxa total exibida no Dashboard (Sua + Mercado Pago = 2%)
  const total_fee_rate = 0.02;
  const fee_cents = Math.round(input.amount_cents * total_fee_rate);

    const nameParts = (input.payer_name || "Cliente Final").trim().split(" ");
    const firstName = nameParts[0] || "Cliente";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Final";

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sellerToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `charge_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        "X-Forwarded-For": payerIp,
        ...(input.deviceId ? { "X-Meli-Session-Id": input.deviceId } : {})
      } as HeadersInit,
      body: JSON.stringify({
        transaction_amount: input.amount_cents / 100,
        description: input.service_name || "Serviço CloudePay",
        external_reference: `charge_${Date.now()}`,
        statement_descriptor: "CLOUDEPAY",
        payment_method_id: "pix",
        notification_url: "https://crmhkvvjrblajemgtrpz.supabase.co/functions/v1/mp-webhook",
        payer: {
          email: input.payer_email || "pagamento@cloudepay.app",
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: "CPF",
            number: input.payer_cpf.replace(/\D/g, "")
          }
        },
        additional_info: {
          items: [
            {
              id: input.product_id || "custom_charge",
              title: input.service_name || "Serviço",
              description: input.description || "Pagamento via CloudePay",
              category_id: "services",
              quantity: 1,
              unit_price: input.amount_cents / 100
            }
          ],
          payer: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })
    });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Erro ao gerar PIX (HTTP ${response.status})`);
    }
    
    console.error("[MP Error]", JSON.stringify(errorData, null, 2));
    
    if (errorData.message?.includes("application_fee")) {
        throw new Error("Erro de Split: Sua conta Mercado Pago ainda não permite cobrar taxas de serviço.");
    }
    
    // Mostra o erro real do MP para facilitar o debug
    const cause = errorData.cause?.[0]?.description || errorData.message || "Erro desconhecido";
    throw new Error(`Recusado pelo Mercado Pago: ${cause}`);
  }

  const payment = await response.json();
  
  const pix_code = payment.point_of_interaction.transaction_data.qr_code;
  const qr_code_image = payment.point_of_interaction.transaction_data.qr_code_base64;
  const gateway_id = payment.id.toString();

  // 2. SALVAR NO SUPABASE
  const { data, error } = await supabase
    .from('charges')
    .insert({
      profile_id: input.profile_id,
      gateway_id,
      amount_cents: input.amount_cents,
      fee_cents,
      net_amount_cents: input.amount_cents - fee_cents,
      service_name: input.service_name.trim(),
      description: input.description?.trim() || null,
      payer_name: input.payer_name?.trim() || null,
      payer_cpf: input.payer_cpf.replace(/\D/g, ""),
      payer_email: (input.payer_email || "pagamento@cloudepay.app").trim().toLowerCase(),
      notes: input.notes?.trim() || null,
      status: "pending",
      charge_type: input.charge_type || "avulsa",
      pix_code,
      qr_code_image: `data:image/png;base64,${qr_code_image}`,
      expires_at,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Erro ao salvar cobrança");
  return data as Charge;
}

export async function getCharge(id: string): Promise<Charge | null> {
  const { data, error } = await supabase
    .from('charges')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  // Verificar expiração
  const c = data as Charge;
  if (c.status === "pending" && new Date(c.expires_at).getTime() < Date.now()) {
    const { data: updated } = await supabase
      .from('charges')
      .update({ status: 'expired' })
      .eq('id', id)
      .select()
      .single();
    return (updated as Charge) || c;
  }

  return c;
}

export async function getChargeBySlugAndId(slug: string, chargeId: string): Promise<Charge | null> {
  // Buscamos a cobrança e o slug do perfil em uma única chamada eficiente
  const { data, error } = await supabase
    .from('charges')
    .select('*, profiles(slug)')
    .eq('id', chargeId)
    .single();

  if (error || !data) return null;

  // Verificamos se o slug do perfil bate com o slug da URL
  // (Usamos uma verificação mais flexível para evitar erros de case-sensitive)
  const profileSlug = (data as any).profiles?.slug;
  if (!profileSlug || profileSlug.toLowerCase() !== slug.toLowerCase()) {
    return null;
  }

  return data as Charge;
}

export async function listChargesByProfile(profile_id: string): Promise<Charge[]> {
  const { data, error } = await supabase
    .from('charges')
    .select('*')
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Charge[];
}

export async function simulatePayment(charge_id: string) {
  const { data: c, error: selectError } = await supabase.from('charges').select('status').eq('id', charge_id).single();
  if (selectError || !c || c.status !== "pending") return;

  const { error: updateError } = await supabase
    .from('charges')
    .update({ 
      status: 'paid',
      paid_at: new Date().toISOString(),
      receipt_number: "CP" + Date.now().toString().slice(-8)
    })
    .eq('id', charge_id);

  if (updateError) {
    console.error("[api] Erro na simulação:", updateError);
    throw updateError;
  }
}

export async function getMonthTotalCents(profile_id: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data, error } = await supabase
    .from('charges')
    .select('net_amount_cents')
    .eq('profile_id', profile_id)
    .eq('status', 'paid')
    .gte('paid_at', startOfMonth);

  if (error || !data) return 0;
  return data.reduce((sum, c) => sum + c.net_amount_cents, 0);
}

// ---------- PRODUCTS REAL ----------

export async function listProductsByProfile(profile_id: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Product[];
}

export async function createProduct(input: {
  profile_id: string;
  name: string;
  amount_cents: number;
  description?: string | null;
}): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      profile_id: input.profile_id,
      name: input.name.trim(),
      amount_cents: input.amount_cents,
      description: input.description?.trim() || null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Erro ao criar produto");
  return data as Product;
}

export async function updateProduct(
  id: string,
  patch: Partial<Pick<Product, "name" | "amount_cents" | "description">>
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...patch,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  return !error;
}

export async function createChargeFromProduct(input: {
  profile_id: string;
  slug: string;
  product_id: string;
  payer_name?: string | null;
  payer_cpf: string;
  payer_email: string;
  notes?: string | null;
  deviceId?: string;
}): Promise<Charge> {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', input.product_id)
    .single();

  if (error || !product) throw new Error("Produto não encontrado");

  return createCharge({
    profile_id: input.profile_id,
    slug: input.slug,
    amount_cents: product.amount_cents,
    service_name: product.name,
    description: product.description,
    payer_name: input.payer_name || null,
    payer_cpf: input.payer_cpf,
    payer_email: input.payer_email,
    notes: input.notes || null,
    deviceId: input.deviceId,
    product_id: input.product_id,
  });
}

// ---------- FIXED QR CODE REAL ----------

export async function getFixedQRCodeBySlug(slug: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('fixed_qr_code')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  // No banco real, podemos salvar o fixed_qr_code como um JSON ou gerá-lo dinamicamente.
  // Por enquanto, assumimos que o profile tem esse campo.
  return data.fixed_qr_code;
}

export async function listFixedQRCodeChargesByProfile(profile_id: string): Promise<Charge[]> {
  const { data, error } = await supabase
    .from('charges')
    .select('*')
    .eq('profile_id', profile_id)
    .eq('charge_type', 'qr_code_fixo')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Charge[];
}

export async function createFixedQRCodeCharge(input: {
  profile_id: string;
  slug: string;
  amount_cents: number;
  payer_name: string;
  payer_cpf: string;
  payer_email: string;
  description?: string | null;
  deviceId?: string;
}): Promise<Charge> {
  return createCharge({
    profile_id: input.profile_id,
    slug: input.slug,
    amount_cents: input.amount_cents,
    service_name: "Cobrança via QR Code Fixo",
    description: input.description || null,
    payer_name: input.payer_name,
    payer_cpf: input.payer_cpf,
    payer_email: input.payer_email,
    charge_type: "qr_code_fixo",
    deviceId: input.deviceId,
  });
}

export async function getOnboardingState(profileId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_step, onboarding_completed_at, onboarding_skipped_at')
    .eq('id', profileId)
    .single();

  if (error || !data) return null;
  return {
    completedAt: data.onboarding_completed_at,
    skippedAt: data.onboarding_skipped_at,
    currentStep: data.onboarding_step ?? 0,
    needsOnboarding: !data.onboarding_completed_at,
  };
}

// ---------- MASTER ADMIN FUNCTIONS (Investor-Ready) ----------

/**
 * Global stats for the Founder Dashboard.
 */
export async function getMasterStats() {
  const ADMIN_EMAILS = ["matsoliveira11@gmail.com", "mats.oliveira11@gmail.com"];

  const { data: charges, error: chargesError } = await supabase
    .from('charges')
    .select('amount_cents, fee_cents, status, created_at, profiles(email)');

  const { data: profiles, error: usersError } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at');

  if (chargesError || usersError) {
    console.error('Error fetching master stats:', chargesError || usersError);
    return { gmv: 0, revenue: 0, users: 0, conversions: 0, totalCharges: 0, rawCharges: [] };
  }

  // Filtrar dados: Remover administradores das métricas
  const filteredProfiles = (profiles || []).filter(p => !ADMIN_EMAILS.includes(p.email?.toLowerCase()));
  const filteredCharges = (charges || []).filter(c => {
    const email = (c as any).profiles?.email?.toLowerCase();
    return !ADMIN_EMAILS.includes(email);
  });

  const totalGMV = filteredCharges.reduce((acc, c) => c.status === 'paid' ? acc + c.amount_cents : acc, 0);
  const totalRevenue = filteredCharges.reduce((acc, c) => c.status === 'paid' ? acc + c.fee_cents : acc, 0);
  const paidCount = filteredCharges.filter(c => c.status === 'paid').length;
  const conversionRate = filteredCharges.length > 0 ? (paidCount / filteredCharges.length) * 100 : 0;

  return {
    gmv: totalGMV,
    revenue: totalRevenue,
    users: filteredProfiles.length,
    conversions: conversionRate,
    totalCharges: filteredCharges.length,
    rawCharges: filteredCharges
  };
}

/**
 * List all users (Excluding admins).
 */
export async function getAllProfiles() {
  const ADMIN_EMAILS = ["matsoliveira11@gmail.com", "mats.oliveira11@gmail.com"];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .not('email', 'in', `(${ADMIN_EMAILS.join(',')})`)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

/**
 * List all transactions with profile details.
 */
export async function getAllCharges() {
  const { data, error } = await supabase
    .from('charges')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as any[];
}

// ---------- SUPPORT TICKETS ----------

export async function getAdminTickets() {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !tickets) return [];

  const userIds = [...new Set(tickets.map(t => t.user_id))];
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);

  return tickets.map(t => ({
    ...t,
    profiles: profiles?.find(p => p.id === t.user_id) || null
  }));
}

export async function getTicketMessages(ticketId: string) {
  const { data: messages, error } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
  if (error || !messages) return [];

  const senderIds = [...new Set(messages.map(m => m.sender_id))];
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', senderIds);

  return messages.map(m => ({
    ...m,
    profiles: profiles?.find(p => p.id === m.sender_id) || null
  }));
}

export async function sendTicketMessage(ticketId: string, senderId: string, message: string) {
  const { data, error } = await supabase
    .from('ticket_messages')
    .insert({ ticket_id: ticketId, sender_id: senderId, message })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getClientTickets(userId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export async function createTicket(userId: string, subject: string, initialMessage: string) {
  // 1. Create the ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({ user_id: userId, subject })
    .select()
    .single();
  if (ticketError) throw ticketError;
  
  // 2. Create the first message
  const { error: msgError } = await supabase
    .from('ticket_messages')
    .insert({ ticket_id: ticket.id, sender_id: userId, message: initialMessage });
  if (msgError) throw msgError;

  return ticket;
}

export async function closeTicket(ticketId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
