// Mock data para o admin dashboard inspirado no Arena.ai
// Adaptado para CloudePay

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    cpf: string;
    plan: "Free" | "Pro" | "Business";
    status: "Ativo" | "Inativo" | "Bloqueado";
    service: string;
    joinedAt: string;
    totalReceived: number;
    chargesCount: number;
    city: string;
}

export interface AdminCharge {
    id: string;
    userId: string;
    userName: string;
    payerName: string;
    payerEmail: string;
    payerCpf: string;
    amount: number;
    fee: number;
    net: number;
    method: "PIX" | "PIX QR" | "Boleto";
    type: "Cobrança" | "Assinatura" | "Reembolso";
    status: "Paga" | "Pendente" | "Expirada" | "Reembolsada" | "Fraude";
    createdAt: string;
    paidAt: string | null;
    service: string;
}

export const adminAlerts = [
    { id: "a1", level: "high", title: "Taxa de churn elevada", description: "Churn de 8.4% nos últimos 30 dias supera meta de 5%.", at: new Date().toISOString() },
    { id: "a2", level: "medium", title: "Confirmação de PIX lenta", description: "Tempo médio acima do esperado (12s) no gateway.", at: new Date().toISOString() },
    { id: "a3", level: "low", title: "Webhook com falhas isoladas", description: "3 falhas recuperadas automaticamente nas últimas 2h.", at: new Date().toISOString() },
];

export const adminMetrics = {
    mrr: 184320,
    mrrDelta: 12.4,
    users: 242,
    usersDelta: 8.1,
    churn: 8.4,
    churnDelta: 1.2,
    conversion: 32.7,
    conversionDelta: -2.3,
};

export const revenueSeries = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: Math.floor(2200 + Math.sin(i * 0.4) * 900 + Math.random() * 1400),
}));

export const newVsChurnSeries = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][i],
    newUsers: Math.floor(40 + Math.random() * 80),
    churned: Math.floor(8 + Math.random() * 28),
}));

export const hourlyActivity = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    value: Math.floor(20 + Math.sin((h - 6) * 0.5) * 60 + Math.random() * 30),
}));

export const revenueByPlan = [
    { label: "Pro", value: 92500, color: "#9EEA6C" },
    { label: "Business", value: 71800, color: "#3B82F6" },
    { label: "Free upgrade", value: 20020, color: "#8B5CF6" },
];

export const chargeStatusBreakdown = [
    { label: "Pagas", value: 68, color: "#9EEA6C" },
    { label: "Pendentes", value: 18, color: "#F59E0B" },
    { label: "Expiradas", value: 9, color: "#94A3B8" },
    { label: "Reembolsadas", value: 4, color: "#A78BFA" },
    { label: "Fraude", value: 1, color: "#EF4444" },
];

export const adminTickets = [
    {
        id: "t1", user: "Marina Costa", email: "marina@email.com",
        subject: "Não recebi o comprovante",
        preview: "Oi, gerei o link mas o cliente disse que pagou...",
        unread: true, lastAt: new Date().toISOString(),
        messages: [{ who: "user", text: "Oi, gerei o link mas o cliente disse que pagou.", at: new Date().toISOString() }],
    }
];

export const adminLogs = Array.from({ length: 20 }, (_, i) => ({
    id: `log_${i}`,
    timestamp: new Date().toISOString(),
    type: "payment" as const,
    action: "PIX confirmado",
    user: "cliente@email.com",
    ip: "192.168.0.1",
    status: "ok" as const,
}));
