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

  if (error) {
    console.error('[signIn] Supabase error:', error.message, error.status);
    const msg = error.status === 400
      ? "Email ou senha incorretos."
      : `Erro de autenticação: ${error.message}`;
    return { ok: false as const, error: msg };
  }
  
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
  patch: Partial<Pick<Profile, "service_name" | "description" | "slug" | "full_name" | "cpf" | "email" | "avatar_url">>
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

export async function uploadAvatar(profileId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${profileId}/avatar-${Date.now()}.${fileExt}`;

  // 1. Upload the file
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { 
      upsert: true,
      contentType: file.type 
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    throw uploadError;
  }

  // 2. Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // 3. Update the profile
  return updateProfile(profileId, { avatar_url: publicUrl });
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

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
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
  const { data, error: functionError } = await supabase.functions.invoke('mp-create-payment', {
    body: {
      amount_cents: input.amount_cents,
      service_name: input.service_name,
      description: input.description,
      payer_name: input.payer_name,
      payer_email: input.payer_email,
      payer_cpf: input.payer_cpf,
      deviceId: input.deviceId,
      profile_id: input.profile_id,
      external_reference: `charge_${Date.now()}`
    }
  });

  if (functionError) {
    // Tentar extrair a mensagem de erro do corpo da resposta, se disponível
    let errorMsg = "Erro no servidor de pagamentos.";
    try {
      const body = await functionError.context?.json();
      errorMsg = body?.error || body?.message || functionError.message;
    } catch {
      errorMsg = functionError.message;
    }
    console.error("[Edge Function Error]", functionError);
    throw new Error(errorMsg);
  }

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

export async function getDashboardStats(profile_id: string): Promise<{ 
  monthNet: number; 
  monthGross: number;
  totalNet: number;
  totalGross: number;
}> {
  const { data, error } = await supabase
    .from('charges')
    .select('net_amount_cents, amount_cents, paid_at, created_at, status')
    .eq('profile_id', profile_id)
    .eq('status', 'paid');

  if (error || !data) return { monthNet: 0, monthGross: 0, totalNet: 0, totalGross: 0 };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let mNet = 0;
  let mGross = 0;
  let tNet = 0;
  let tGross = 0;

  data.forEach(c => {
    const net = c.net_amount_cents || 0;
    const gross = c.amount_cents || 0;
    
    // Totais acumulados (Lifetime)
    tNet += net;
    tGross += gross;

    // Totais do mês
    const dateStr = c.paid_at || c.created_at;
    if (dateStr && new Date(dateStr) >= startOfMonth) {
      mNet += net;
      mGross += gross;
    }
  });

  return { 
    monthNet: mNet, 
    monthGross: mGross, 
    totalNet: tNet, 
    totalGross: tGross 
  };
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

// ---------- DEMO / MOCK DATA GENERATOR ----------

export function generateDemoCharges(profile_id: string): Charge[] {
  const charges: Charge[] = [];
  const now = new Date();
  const services = ["Consultoria VIP", "Desenvolvimento Web", "Design de Logo", "Mentoria Individual", "Pacote Mensal"];
  const names = ["Ana Silva", "Bruno Oliveira", "Carla Santos", "Diego Lima", "Elena Costa", "Fabio Souza", "Giovana Melo"];

  // Gerar ~50 cobranças nos últimos 30 dias
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(now.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const amount_cents = (Math.floor(Math.random() * 450) + 50) * 100; // R$ 50 a R$ 500
    const status: ChargeStatus = Math.random() > 0.3 ? "paid" : (Math.random() > 0.5 ? "pending" : "expired");
    const fee_cents = Math.round(amount_cents * 0.01); // Nossa parte (1%)
    const total_fee_cents = Math.round(amount_cents * 0.02); // Total (1% CP + 1% MP)
    
    charges.push({
      id: `demo_${i}`,
      profile_id,
      amount_cents,
      fee_cents, // Registramos 1% como nossa receita
      net_amount_cents: amount_cents - total_fee_cents, // O lojista recebe líquido de 2%
      service_name: services[Math.floor(Math.random() * services.length)],
      payer_name: names[Math.floor(Math.random() * names.length)],
      status,
      charge_type: "avulsa",
      created_at: date.toISOString(),
      paid_at: status === "paid" ? date.toISOString() : null,
      gateway_id: "demo_gtw",
      pix_code: "00020126360014BR.GOV.BCB.PIX...",
      qr_code_image: "",
      expires_at: new Date(date.getTime() + 900000).toISOString(),
      receipt_number: status === "paid" ? `DEMO${1000 + i}` : null,
      receipt_sent: false,
      payer_cpf: "000.000.000-00",
      payer_email: "demo@cliente.com",
      description: "Cobrança de teste modo demo",
      notes: null
    } as any);
  }

  return charges.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
