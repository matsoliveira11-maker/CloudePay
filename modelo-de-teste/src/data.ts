export type ChargeStatus = "paid" | "pending" | "canceled";

export interface Charge {
  id: string;
  service: string;
  customer: string;
  avatar: string;
  status: ChargeStatus;
  gross: number;
  date: string;
}

export const STATUS_LABEL: Record<ChargeStatus, string> = {
  paid: "Pago",
  pending: "Pendente",
  canceled: "Cancelado",
};

export const FEE_RATE = 0.01;

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

function d(daysAgo: number, hour = 14) {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  now.setHours(hour, 0, 0, 0);
  return now.toISOString();
}

function ini(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const raw = [
  { service: "Vestido floral midi",   customer: "Marina Souza",    status: "paid"     as ChargeStatus, gross: 189.9, daysAgo: 1, hour: 9 },
  { service: "Conjunto linho",        customer: "Patrícia Lima",   status: "pending"  as ChargeStatus, gross: 249.0, daysAgo: 0, hour: 11 },
  { service: "Blusa cropped",         customer: "Júlia Andrade",   status: "paid"     as ChargeStatus, gross: 89.9,  daysAgo: 2, hour: 15 },
  { service: "Saia plissada",         customer: "Renata Castro",   status: "canceled" as ChargeStatus, gross: 159.0, daysAgo: 3, hour: 10 },
  { service: "Vestido festa longo",   customer: "Camila Rocha",    status: "paid"     as ChargeStatus, gross: 459.0, daysAgo: 4, hour: 14 },
  { service: "Calça wide leg",        customer: "Bianca Nogueira", status: "pending"  as ChargeStatus, gross: 219.9, daysAgo: 2, hour: 16 },
  { service: "Kit acessórios",        customer: "Larissa Mendes",  status: "paid"     as ChargeStatus, gross: 79.0,  daysAgo: 5, hour: 12 },
  { service: "Blazer alfaiataria",    customer: "Sofia Almeida",   status: "paid"     as ChargeStatus, gross: 329.0, daysAgo: 6, hour: 17 },
  { service: "Cropped renda",         customer: "Fernanda Torres", status: "paid"     as ChargeStatus, gross: 119.0, daysAgo: 0, hour: 8 },
  { service: "Saia midi plissada",    customer: "Isabela Santos",  status: "paid"     as ChargeStatus, gross: 179.0, daysAgo: 1, hour: 13 },
];

export const initialCharges: Charge[] = raw.map((r, i) => ({
  id: String(i + 1),
  service: r.service,
  customer: r.customer,
  avatar: ini(r.customer),
  status: r.status,
  gross: r.gross,
  date: d(r.daysAgo, r.hour),
}));

export const PRODUCTS = [
  { id: "p1", name: "Vestido floral midi",  price: 189.9 },
  { id: "p2", name: "Conjunto linho",       price: 249.0 },
  { id: "p3", name: "Blusa cropped",        price: 89.9 },
  { id: "p4", name: "Calça wide leg",       price: 219.9 },
  { id: "p5", name: "Vestido festa longo",  price: 459.0 },
  { id: "p6", name: "Blazer alfaiataria",   price: 329.0 },
  { id: "p7", name: "Saia plissada",        price: 159.0 },
  { id: "p8", name: "Kit acessórios",       price: 79.0 },
  { id: "p9", name: "Cobrança avulsa",      price: 0 },
];
