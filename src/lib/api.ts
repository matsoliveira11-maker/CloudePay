import { supabase } from "./supabase";
import * as mock from "./mockBackend";
import type { Profile, Charge, Product, ChargeStatus, ChargeType } from "./mockBackend";
import QRCode from "qrcode";

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
  const { data, error } = await supabase.auth.signInWithPassword({
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
  patch: Partial<Pick<Profile, "service_name" | "description" | "slug">>
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

const FEE_RATE = 0.02;

export async function createCharge(input: {
  profile_id: string;
  slug: string;
  amount_cents: number;
  service_name: string;
  description?: string | null;
  payer_name?: string | null;
  payer_cpf: string;
  payer_email: string;
  notes?: string | null;
  charge_type?: ChargeType;
}): Promise<Charge> {
  const fee_cents = Math.round(input.amount_cents * FEE_RATE);
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Mock do código PIX copia-e-cola (até integrar gateway)
  const pix_code = `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${(input.amount_cents / 100).toFixed(2)}5802BR5913CLOUDEPAY REAL6009SAO PAULO62070503***6304MOCK`;

  const qr_code_image = await QRCode.toDataURL(pix_code, {
    margin: 1, width: 280, color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  const { data, error } = await supabase
    .from('charges')
    .insert({
      profile_id: input.profile_id,
      amount_cents: input.amount_cents,
      fee_cents,
      net_amount_cents: input.amount_cents - fee_cents,
      service_name: input.service_name.trim(),
      description: input.description?.trim() || null,
      payer_name: input.payer_name?.trim() || null,
      payer_cpf: input.payer_cpf.replace(/\D/g, ""),
      payer_email: input.payer_email.trim().toLowerCase(),
      notes: input.notes?.trim() || null,
      status: "pending",
      charge_type: input.charge_type || "avulsa",
      pix_code,
      qr_code_image,
      expires_at,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Erro ao criar cobrança");
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
  // Primeiro buscamos a cobrança
  const { data: charge, error: chargeError } = await supabase
    .from('charges')
    .select('*')
    .eq('id', chargeId)
    .single();

  if (chargeError || !charge) return null;

  // Depois verificamos se o perfil dessa cobrança bate com o slug do link
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('slug')
    .eq('id', charge.profile_id)
    .single();

  if (profileError || !profile || profile.slug !== slug) return null;

  return charge as Charge;
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
  const { data: c } = await supabase.from('charges').select('*').eq('id', charge_id).single();
  if (!c || c.status !== "pending") return;

  await supabase
    .from('charges')
    .update({ 
      status: 'paid',
      paid_at: new Date().toISOString(),
      receipt_number: "LP" + Date.now().toString().slice(-8)
    })
    .eq('id', charge_id);
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
