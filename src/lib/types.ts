export type { Profile, Charge, ChargeStatus, FixedQRCode, ChargeType } from "./mockBackend";

export interface Product {
  id: string;
  profile_id: string;
  name: string;
  amount_cents: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  profile_id: string;
  name: string;
  amount_cents: number;
  description?: string | null;
}

export interface CreateChargeFromProductInput {
  profile_id: string;
  slug: string;
  product_id: string;
  payer_name?: string | null;
  payer_cpf: string;
  payer_email: string;
  notes?: string | null;
}

export interface CreateChargeCustomInput {
  profile_id: string;
  slug: string;
  amount_cents: number;
  service_name: string;
  description?: string | null;
  payer_name?: string | null;
  payer_cpf: string;
  payer_email: string;
  notes?: string | null;
}
