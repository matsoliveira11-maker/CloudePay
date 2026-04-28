// Mock backend que simula Supabase + AbacatePay + Resend.
// Toda a forma dos dados (tabelas profiles/charges) espelha o schema real
// que será criado no Supabase. Quando trocarmos pela API real, só o
// arquivo `api.ts` muda — telas e contexto continuam iguais.

import QRCode from "qrcode";

// ---------- Tipos (espelham o schema do Supabase) ----------

export interface FixedQRCode {
  id: string;
  image: string;                // data URL da imagem
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  password_hash: string;        // mock: guardamos plain só para demo local
  full_name: string;
  cpf: string;                  // só dígitos
  slug: string | null;
  service_name: string | null;
  description: string | null;
  onboarding_completed_at: string | null;
  onboarding_skipped_at: string | null;
  onboarding_step: number;
  fixed_qr_code: FixedQRCode | null;  // QR Code fixo gerado no onboarding
  mp_access_token?: string | null;    // Mercado Pago integration
  created_at: string;
}

export type ChargeStatus = "pending" | "paid" | "expired";
export type ChargeType = "avulsa" | "qr_code_fixo";

export interface Charge {
  id: string;
  profile_id: string;
  slug?: string;                 // slug do profissional (opcional na cobrança direta)
  gateway_id: string;
  amount_cents: number;
  fee_cents: number;            // 2%
  net_amount_cents: number;
  service_name: string;         // "Corte + escova", "Sessão de treino"
  description: string | null;   // descrição do serviço
  payer_name: string | null;    // nome do cliente (opcional)
  payer_cpf: string;
  payer_email: string;
  notes: string | null;         // observação opcional
  status: ChargeStatus;
  charge_type: ChargeType;      // 'avulsa' ou 'qr_code_fixo'
  qr_code_image: string;
  pix_code: string;
  expires_at: string;
  paid_at: string | null;
  receipt_number: string | null;
  receipt_sent: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  profile_id: string;
  name: string;
  amount_cents: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface DB {
  profiles: Profile[];
  charges: Charge[];
  products: Product[];
  session: { profile_id: string } | null;
}

interface OnboardingState {
  completedAt: string | null;
  skippedAt: string | null;
  currentStep: number;
  needsOnboarding: boolean;
}

// ---------- Persistência ----------

const DB_KEY = "linknode_db_v1";

function load(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return normalizeDb(JSON.parse(raw) as DB);
  } catch {}
  return { profiles: [], charges: [], products: [], session: null };
}

function save(db: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

let db: DB = load();

function normalizeDb(input: DB): DB {
  return {
    ...input,
    profiles: (input.profiles ?? []).map((profile) => ({
      ...profile,
      onboarding_completed_at: profile.onboarding_completed_at ?? null,
      onboarding_skipped_at: profile.onboarding_skipped_at ?? null,
      onboarding_step: Number.isFinite(profile.onboarding_step) ? profile.onboarding_step : 0,
      fixed_qr_code: profile.fixed_qr_code ?? null,
    })),
    charges: input.charges ?? [],
    products: input.products ?? [],
    session: input.session ?? null,
  };
}

// ---------- Helpers ----------

function uid(prefix = ""): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

// Generates a fixed QR code that points to the payment link
async function generateFixedQRCode(slug: string): Promise<FixedQRCode> {
  const fixedQRCodeId = uid("qrc_");
  const paymentUrl = `${window.location.origin}/${slug}/pagar`;
  const image = await QRCode.toDataURL(paymentUrl, {
    margin: 1,
    width: 280,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });
  return {
    id: fixedQRCodeId,
    image,
    created_at: new Date().toISOString(),
  };
}

// ---------- Auth ----------

export async function signUp(input: {
  full_name: string;
  email: string;
  password: string;
  cpf: string;
}): Promise<{ ok: true; profile: Profile } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (db.profiles.some((p) => p.email === email)) {
    return delay({ ok: false, error: "Já existe uma conta com esse email." });
  }
  const profile: Profile = {
    id: uid("usr_"),
    email,
    password_hash: input.password,
    full_name: input.full_name.trim(),
    cpf: input.cpf.replace(/\D/g, ""),
    slug: null,
    service_name: null,
    description: null,
    onboarding_completed_at: null,
    onboarding_skipped_at: null,
    onboarding_step: 0,
    fixed_qr_code: null,
    created_at: new Date().toISOString(),
  };
  db.profiles.push(profile);
  db.session = { profile_id: profile.id };
  save(db);
  return delay({ ok: true, profile });
}

export async function signIn(email: string, password: string) {
  const p = db.profiles.find(
    (x) => x.email === email.trim().toLowerCase() && x.password_hash === password
  );
  if (!p) return delay({ ok: false as const, error: "Email ou senha incorretos." });
  db.session = { profile_id: p.id };
  save(db);
  return delay({ ok: true as const, profile: p });
}

export async function signOut() {
  db.session = null;
  save(db);
}

export function getCurrentProfile(): Profile | null {
  if (!db.session) return null;
  return db.profiles.find((p) => p.id === db.session!.profile_id) ?? null;
}

// ---------- Slug ----------

export async function isSlugAvailable(slug: string, exceptProfileId?: string) {
  const taken = db.profiles.some(
    (p) => p.slug === slug && p.id !== exceptProfileId
  );
  return delay(!taken, 150);
}

// ---------- Profile updates ----------

export async function updateProfile(
  id: string,
  patch: Partial<Pick<Profile, "service_name" | "description" | "slug">>
) {
  const p = db.profiles.find((x) => x.id === id);
  if (!p) return { ok: false as const, error: "Perfil não encontrado." };
  
  // If slug is being set and QR code doesn't exist, generate it
  if (patch.slug && !p.fixed_qr_code) {
    p.fixed_qr_code = await generateFixedQRCode(patch.slug);
  }
  
  Object.assign(p, patch);
  save(db);
  return { ok: true as const, profile: p };
}

export async function getOnboardingState(profileId: string): Promise<OnboardingState | null> {
  db = load();
  const profile = db.profiles.find((x) => x.id === profileId);
  if (!profile) return delay(null, 100);
  return delay({
    completedAt: profile.onboarding_completed_at,
    skippedAt: profile.onboarding_skipped_at,
    currentStep: profile.onboarding_step ?? 0,
    needsOnboarding: !profile.onboarding_completed_at,
  }, 100);
}

export async function updateOnboardingState(
  profileId: string,
  patch: {
    currentStep?: number;
    completed?: boolean;
    skipped?: boolean;
  }
): Promise<OnboardingState | null> {
  db = load();
  const profile = db.profiles.find((x) => x.id === profileId);
  if (!profile) return delay(null, 100);

  if (patch.currentStep !== undefined) {
    profile.onboarding_step = Math.max(0, Math.floor(patch.currentStep));
  }

  if (patch.completed) {
    profile.onboarding_completed_at = new Date().toISOString();
    profile.onboarding_skipped_at = null;
  }

  if (patch.skipped) {
    profile.onboarding_skipped_at = new Date().toISOString();
  }

  save(db);
  return delay({
    completedAt: profile.onboarding_completed_at,
    skippedAt: profile.onboarding_skipped_at,
    currentStep: profile.onboarding_step ?? 0,
    needsOnboarding: !profile.onboarding_completed_at,
  }, 100);
}

// ---------- Public: get profile by slug ----------

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  return delay(db.profiles.find((x) => x.slug === slug) ?? null, 150);
}

// ---------- Public: get specific charge by slug + id ----------

export async function getChargeBySlugAndId(slug: string, chargeId: string): Promise<Charge | null> {
  db = load();
  const c = db.charges.find((x) => x.slug === slug && x.id === chargeId) ?? null;
  if (c && c.status === "pending" && new Date(c.expires_at).getTime() < Date.now()) {
    c.status = "expired";
    save(db);
  }
  return c;
}

// ---------- Charges (PIX mock) ----------

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
  const profile = db.profiles.find((p) => p.id === input.profile_id);
  if (!profile) throw new Error("Perfil não encontrado");

  const fee_cents = Math.round(input.amount_cents * FEE_RATE);
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const chargeId = uid("chg_");

  // Mock do código PIX copia-e-cola
  const pix_code =
    `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${
      (input.amount_cents / 100).toFixed(2)
    }5802BR5913CLOUDEPAY MOCK6009SAO PAULO62070503***6304MOCK`;

  const qr_code_image = await QRCode.toDataURL(pix_code, {
    margin: 1, width: 280, color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  const charge: Charge = {
    id: chargeId,
    profile_id: input.profile_id,
    slug: input.slug,
    gateway_id: "mock_" + uid(),
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
    qr_code_image,
    pix_code,
    expires_at,
    paid_at: null,
    receipt_number: null,
    receipt_sent: false,
    created_at: new Date().toISOString(),
  };

  db.charges.unshift(charge);
  save(db);
  return charge;
}

export async function listProductsByProfile(profile_id: string): Promise<Product[]> {
  db = load();
  return db.products
    .filter((p) => p.profile_id === profile_id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createProduct(input: {
  profile_id: string;
  name: string;
  amount_cents: number;
  description?: string | null;
}): Promise<Product> {
  db = load();
  const now = new Date().toISOString();

  const product: Product = {
    id: uid("prd_"),
    profile_id: input.profile_id,
    name: input.name.trim(),
    amount_cents: input.amount_cents,
    description: input.description?.trim() || null,
    created_at: now,
    updated_at: now,
  };

  db.products.unshift(product);
  save(db);
  return delay(product, 180);
}

export async function updateProduct(
  id: string,
  patch: Partial<Pick<Product, "name" | "amount_cents" | "description">>
): Promise<Product | null> {
  db = load();
  const p = db.products.find((x) => x.id === id);
  if (!p) return delay(null, 120);

  if (patch.name !== undefined) p.name = patch.name.trim();
  if (patch.amount_cents !== undefined) p.amount_cents = patch.amount_cents;
  if (patch.description !== undefined) p.description = patch.description?.trim() || null;
  p.updated_at = new Date().toISOString();

  save(db);
  return delay(p, 120);
}

export async function deleteProduct(id: string): Promise<boolean> {
  db = load();
  const before = db.products.length;
  db.products = db.products.filter((x) => x.id !== id);
  save(db);
  return delay(db.products.length < before, 100);
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
  db = load();
  const product = db.products.find((p) => p.id === input.product_id && p.profile_id === input.profile_id);
  if (!product) throw new Error("Produto não encontrado");

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

export async function getCharge(id: string): Promise<Charge | null> {
  db = load();
  const c = db.charges.find((x) => x.id === id) ?? null;
  if (c && c.status === "pending" && new Date(c.expires_at).getTime() < Date.now()) {
    c.status = "expired";
    save(db);
  }
  return c;
}

export async function listChargesByProfile(profile_id: string): Promise<Charge[]> {
  db = load();
  return db.charges
    .filter((c) => c.profile_id === profile_id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ---------- Mock: simular pagamento ----------

export async function simulatePayment(charge_id: string) {
  db = load();
  const c = db.charges.find((x) => x.id === charge_id);
  if (!c || c.status !== "pending") return;
  c.status = "paid";
  c.paid_at = new Date().toISOString();
  c.receipt_number = "LP" + Date.now().toString().slice(-8);
  await sendReceiptEmail(c);
  c.receipt_sent = true;
  save(db);
}

async function sendReceiptEmail(c: Charge) {
  console.info("[mock email] Comprovante enviado para", c.payer_email, {
    receipt: c.receipt_number,
    amount: c.amount_cents,
  });
}

// ---------- Stats ----------

export async function getMonthTotalCents(profile_id: string): Promise<number> {
  db = load();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return db.charges
    .filter((c) => {
      if (c.profile_id !== profile_id || c.status !== "paid" || !c.paid_at) return false;
      const d = new Date(c.paid_at);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, c) => sum + c.net_amount_cents, 0);
}

// ---------- Fixed QR Code ----------

export async function getFixedQRCodeBySlug(slug: string): Promise<FixedQRCode | null> {
  db = load();
  const profile = db.profiles.find((p) => p.slug === slug);
  return delay(profile?.fixed_qr_code ?? null, 150);
}

export async function listFixedQRCodeChargesByProfile(profile_id: string): Promise<Charge[]> {
  db = load();
  return db.charges
    .filter((c) => c.profile_id === profile_id && c.charge_type === "qr_code_fixo")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
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
