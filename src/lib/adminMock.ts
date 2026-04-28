// Mock data completo para o CloudeOS Admin Dashboard

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

export const adminUsers: AdminUser[] = [
    { id: "usr_1001", name: "Marina Costa", email: "marina@email.com", cpf: "123.456.789-00", plan: "Business", status: "Ativo", service: "Aulas de Piano", joinedAt: "2024-01-10T10:00:00Z", totalReceived: 12500, chargesCount: 45, city: "São Paulo, SP" },
    { id: "usr_1002", name: "Lucas Pereira", email: "lucas@email.com", cpf: "234.567.890-11", plan: "Pro", status: "Ativo", service: "Personal Trainer", joinedAt: "2024-02-15T14:30:00Z", totalReceived: 8200, chargesCount: 32, city: "Rio de Janeiro, RJ" },
    { id: "usr_1003", name: "Ana Ribeiro", email: "ana@email.com", cpf: "345.678.901-22", plan: "Free", status: "Inativo", service: "Artesanato", joinedAt: "2024-03-05T09:15:00Z", totalReceived: 1500, chargesCount: 8, city: "Belo Horizonte, MG" },
    { id: "usr_1004", name: "Diego Mendes", email: "diego@email.com", cpf: "456.789.012-33", plan: "Business", status: "Bloqueado", service: "Consultoria TI", joinedAt: "2024-01-20T11:45:00Z", totalReceived: 21000, chargesCount: 12, city: "Curitiba, PR" },
];

export const adminCharges: AdminCharge[] = [
    { id: "chg_5001", userId: "usr_1001", userName: "Marina Costa", payerName: "Bruno Carvalho", payerEmail: "bruno@cliente.com", payerCpf: "111.222.333-44", amount: 25000, fee: 500, net: 24500, method: "PIX", type: "Cobrança", status: "Paga", createdAt: "2024-04-20T10:30:00Z", paidAt: "2024-04-20T10:31:00Z", service: "Aulas de Piano" },
    { id: "chg_5002", userId: "usr_1002", userName: "Lucas Pereira", payerName: "Carla Souza", payerEmail: "carla@cliente.com", payerCpf: "222.333.444-55", amount: 15000, fee: 300, net: 14700, method: "PIX QR", type: "Cobrança", status: "Pendente", createdAt: "2024-04-21T15:20:00Z", paidAt: null, service: "Personal Trainer" },
    { id: "chg_5003", userId: "usr_1001", userName: "Marina Costa", payerName: "Daniel Lima", payerEmail: "daniel@cliente.com", payerCpf: "333.444.555-66", amount: 45000, fee: 900, net: 44100, method: "Boleto", type: "Assinatura", status: "Expirada", createdAt: "2024-04-10T09:00:00Z", paidAt: null, service: "Aulas de Piano" },
];

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

export interface AdminTicket {
    id: string;
    user: string;
    email: string;
    subject: string;
    preview: string;
    unread: boolean;
    lastAt: string;
    messages: { who: "user" | "admin"; text: string; at: string }[];
}

export const adminTickets: AdminTicket[] = [
    {
        id: "t1", user: "Marina Costa", email: "marina@email.com",
        subject: "Não recebi o comprovante",
        preview: "Oi, gerei o link mas o cliente disse que pagou...",
        unread: true, lastAt: new Date().toISOString(),
        messages: [
            { who: "user", text: "Oi, gerei o link mas o cliente disse que pagou.", at: new Date().toISOString() },
            { who: "admin", text: "Olá Marina! Vou verificar agora mesmo o status dessa transação no gateway.", at: new Date().toISOString() }
        ],
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
