import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { Charge } from "../lib/api";
import { supabase } from "../lib/supabase";
import Shell from "../components/Shell";
import { formatBRL, maskBRLInput, parseBRLToCents, formatDate } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { cn } from "../lib/utils";
import { 
  TrendUp, 
  Receipt, 
  ArrowCircleUp, 
  Wallet, 
  ChartPie, 
  MagnifyingGlass,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  WhatsappLogo,
  InstagramLogo,
  TiktokLogo,
  TelegramLogo,
  ShareNetwork,
  X,
  ArrowRight
} from "phosphor-react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell
} from "recharts";

import QRCode from "qrcode";

type PeriodFilter = "today" | "month" | "all";
type ChargeStatusLocal = "paid" | "pending" | "expired";

const TABS: { id: "all" | ChargeStatusLocal; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "paid", label: "Pagas" },
  { id: "pending", label: "Pendentes" },
  { id: "expired", label: "Canceladas" },
];

// --- Main Page Component ---

export default function Dashboard() {
  const { profile } = useAuth();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [stats, setStats] = useState({ monthNet: 0, monthGross: 0, totalNet: 0, totalGross: 0 });
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdCharge, setCreatedCharge] = useState<Charge | null>(null);

  const reload = useCallback(async () => {
    if (!profile) return;
    const [list, s] = await Promise.all([
      api.listChargesByProfile(profile.id),
      api.getDashboardStats(profile.id),
    ]);
    setCharges(list);
    setStats(s);
  }, [profile]);

  useEffect(() => {
    reload();
    if (!profile?.id) return;
    const handleOpenCreate = () => {
       setCreatedCharge(null);
       setShowCreateModal(true);
    };
    window.addEventListener("open-create-charge", handleOpenCreate);
    const sub = supabase.channel('dashboard_v4').on('postgres_changes', { event: '*', schema: 'public', table: 'charges', filter: `profile_id=eq.${profile.id}` }, () => reload()).subscribe();
    return () => { 
      window.removeEventListener("open-create-charge", handleOpenCreate);
      supabase.removeChannel(sub); 
    };
  }, [reload, profile?.id]);

  const kpis = useMemo(() => {
    const paid = charges.filter(c => c.status === "paid");
    const gross = period === "month" ? stats.monthGross : stats.totalGross;
    const count = charges.length;
    const avg = paid.length ? (gross / paid.length) : 0;
    return { gross, count, avg };
  }, [charges, stats, period]);

  return (
    <Shell>
      <div className="space-y-8 pb-10">
        
        {/* CTA Banner Section */}
        <div>
           <CtaBanner name={profile?.full_name?.split(' ')[0] || "Usuário"} />
        </div>

        {/* Filters and KPI Row */}
        <div className="space-y-4">
           <div className="flex justify-start px-1 sm:px-0">
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#e8e8ec] w-full sm:w-auto">
                {(["today", "month", "all"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "flex-1 sm:flex-none px-4 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all",
                      period === p ? "bg-[#e11d48] text-white shadow-md" : "text-[#8c8c8c] hover:text-[#e11d48]"
                    )}
                  >
                    {p === "today" ? "Hoje" : p === "month" ? "Mês" : "Total"}
                  </button>
                ))}
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard label="Total em vendas" value={formatBRL(kpis.gross)} icon={<TrendUp size={18} weight="bold" />} accent />
              <KpiCard label="Transações" value={String(kpis.count)} icon={<Receipt size={18} weight="bold" />} />
              <KpiCard label="Ticket Médio" value={formatBRL(kpis.avg)} icon={<ArrowCircleUp size={18} weight="bold" />} />
           </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
           <div className="lg:col-span-2 a-up-2">
              <PerformanceChart charges={charges} />
           </div>
           <div className="a-up-3">
              <PaymentMethodsBanner charges={charges} />
           </div>
        </div>

        {/* Distribution Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
           <div className="a-up-4">
              <StatusDistribution charges={charges} />
           </div>
           <div className="lg:col-span-2 a-up-5">
              <TicketEvolutionChart charges={charges} />
           </div>
        </div>

        {/* Sales History Table */}
        <div className="pt-4 a-up-6">
           <SalesHistory charges={charges} />
        </div>

        {showCreateModal && (
          <CreateChargeFlowModal
            onClose={() => setShowCreateModal(false)}
            onCreated={(charge) => {
              setCreatedCharge(charge);
              reload();
            }}
            createdCharge={createdCharge}
          />
        )}
      </div>
    </Shell>
  );
}

// --- Sub-components ---

function CtaBanner({ name }: { name: string }) {
  const handleCreateCharge = () => window.dispatchEvent(new CustomEvent("open-create-charge"));
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-white border border-[#fce4ec] p-6 sm:p-8 lg:p-12 mb-2 sm:mb-4 a-up">
      <div className="relative z-10 max-w-2xl">
        <span className="inline-block px-3 py-1 rounded-full bg-[#fff1f2] text-[#e11d48] text-[10px] font-bold uppercase tracking-[0.15em] mb-4">
          Visão Geral
        </span>
        <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-[#1a1a2e] leading-[1.1] tracking-tight mb-3">
          Bem-vindo, {name}
        </h2>
        <p className="text-[14px] sm:text-[16px] text-[#5c5c6d] leading-relaxed mb-8 max-w-md">
          Monitore suas vendas em tempo real e gere links de pagamento instantâneos para seus clientes.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={() => navigate("/produtos")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#fce4ec] text-[13px] font-bold text-[#1a1a2e] transition-all hover:bg-[#f8f7f5] active:scale-95"
          >
             <Package size={18} weight="bold" />
             Produtos
          </button>
          <button 
            onClick={handleCreateCharge}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#e11d48] text-[13px] font-bold text-white shadow-lg shadow-rose-100 transition-all hover:bg-[#be123c] active:scale-95"
          >
             Nova cobrança
             <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-[#fff1f2] rounded-full blur-[80px] opacity-60" />
    </div>
  );
}

function KpiCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) {
  const bg = accent ? "linear-gradient(135deg, #e11d48, #be123c)" : "#ffffff";
  const textColor = accent ? "#ffffff" : "#1a1a2e";
  const labelColor = accent ? "rgba(255,255,255,0.7)" : "#8c8c8c";
  const iconBg = accent ? "rgba(255,255,255,0.2)" : "#f8f7f5";
  const iconColor = accent ? "#ffffff" : "#e11d48";
  const border = accent ? "none" : "1px solid #e8e8ec";

  return (
    <div className="rounded-[18px] p-5 sm:p-6 transition-all duration-200 hover:shadow-md group"
      style={{ background: bg, border, color: textColor }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: labelColor }}>{label}</span>
      </div>
      <p className="text-[26px] sm:text-[30px] font-bold tracking-tight num leading-none">{value}</p>
    </div>
  );
}

function PaymentMethodsBanner({ charges }: { charges: Charge[] }) {
  const pixTotal = charges.filter(c => c.status === "paid").reduce((s, c) => s + c.amount_cents, 0);
  return (
    <div className="rounded-[14px] p-5 lg:p-6 bg-white transition-all duration-200 hover:shadow-md h-full"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center gap-2 mb-5">
        <Wallet size={18} className="text-[#8c8c8c]" weight="bold" />
        <h3 className="text-[14px] font-bold text-[#1a1a2e]">Método de pagamento</h3>
      </div>
      <div className="h-2.5 rounded-full mb-6 overflow-hidden bg-[#f8f7f5]">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: "100%", background: "linear-gradient(90deg, #e11d48, #be123c)" }} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#fff1f2]">
               <span className="text-[#e11d48] font-bold text-[9px]">PIX</span>
            </div>
            <span className="text-[13px] text-[#1a1a2e]">Pix</span>
          </div>
          <span className="text-[13px] font-medium text-[#1a1a2e] num">{formatBRL(pixTotal)}</span>
        </div>
        <div className="pt-4 flex items-center justify-between border-t border-[#fce4ec]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#fff1f2]">
               <div className="w-2 h-2 rounded-full bg-[#e11d48]" />
            </div>
            <span className="text-[13px] font-bold text-[#1a1a2e]">Total</span>
          </div>
          <span className="text-[13px] font-bold text-[#1a1a2e] num">{formatBRL(pixTotal)}</span>
        </div>
      </div>
    </div>
  );
}

function PerformanceChart({ charges }: { charges: Charge[] }) {
  const data = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const value = charges
        .filter(c => c.status === "paid" && new Date(c.paid_at || c.created_at).toLocaleDateString() === d.toLocaleDateString())
        .reduce((s, c) => s + (c.amount_cents / 100), 0);
      return { name: label, value };
    });
  }, [charges]);

  return (
    <div className="rounded-[20px] p-5 sm:p-6 bg-white border border-[#fce4ec] transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendUp size={18} className="text-[#e11d48]" weight="bold" />
          <h3 className="text-[14px] font-bold text-[#1a1a2e]">Desempenho de vendas</h3>
        </div>
      </div>
      <div className="h-[220px] sm:h-[280px] lg:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e11d48" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8c8c8c", fontSize: 11 }} dy={6} />
            <YAxis hide />
            <Tooltip
              cursor={{ stroke: "#fce4ec", strokeWidth: 1 }}
              contentStyle={{ background: "#fff", border: "1px solid #fce4ec", borderRadius: "10px", padding: "6px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              formatter={(v: any) => [formatBRL(Number(v) * 100), ""]}
              labelStyle={{ color: "#8c8c8c", fontSize: 11 }}
            />
            <Area type="monotone" dataKey="value" stroke="#e11d48" strokeWidth={2} fill="url(#salesGrad)" dot={false} activeDot={{ r: 4, fill: "#e11d48", stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TicketEvolutionChart({ charges }: { charges: Charge[] }) {
  const data = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const dayPaid = charges.filter(c => c.status === "paid" && new Date(c.paid_at || c.created_at).toLocaleDateString() === d.toLocaleDateString());
      const value = dayPaid.length ? (dayPaid.reduce((s, c) => s + (c.amount_cents / 100), 0) / dayPaid.length) : 0;
      return { name: label, value };
    });
  }, [charges]);

  return (
    <div className="rounded-[20px] p-5 sm:p-6 bg-white border border-[#fce4ec] transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <ArrowCircleUp size={18} className="text-[#e11d48]" weight="bold" />
        <h3 className="text-[14px] font-bold text-[#1a1a2e]">Evolução do Ticket Médio</h3>
      </div>
      <div className="h-[220px] sm:h-[280px] lg:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8c8c8c", fontSize: 11 }} dy={6} />
            <YAxis hide />
            <Tooltip
              cursor={{ stroke: "#fce4ec", strokeWidth: 1 }}
              contentStyle={{ background: "#fff", border: "1px solid #fce4ec", borderRadius: "10px", padding: "6px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              formatter={(v: any) => [formatBRL(Number(v) * 100), ""]}
              labelStyle={{ color: "#8c8c8c", fontSize: 11 }}
            />
            <Line type="monotone" dataKey="value" stroke="#be123c" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#be123c", stroke: "#fff", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatusDistribution({ charges }: { charges: Charge[] }) {
  const paid = charges.filter(c => c.status === "paid").length;
  const pending = charges.filter(c => c.status === "pending").length;
  const expired = charges.filter(c => c.status === "expired").length;
  const total = charges.length;
  const data = total ? [
    { name: "Pago", value: paid, color: "#e11d48" },
    { name: "Pendente", value: pending, color: "#f59e0b" },
    { name: "Expirado", value: expired, color: "#d4d4d8" }
  ] : [{ name: "Vazio", value: 1, color: "#f8f7f5" }];

  return (
    <div className="rounded-[20px] p-5 sm:p-6 bg-white border border-[#fce4ec] transition-all duration-200 hover:shadow-md h-full">
      <div className="flex items-center gap-2 mb-5">
        <ChartPie size={18} className="text-[#e11d48]" weight="bold" />
        <h3 className="text-[14px] font-bold text-[#1a1a2e]">Distribuição por status</h3>
      </div>
      <div className="flex items-center gap-5">
         <div className="relative shrink-0 w-[100px] h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={data} dataKey="value" innerRadius={32} outerRadius={48} paddingAngle={total ? 3 : 0} stroke="none">
                     {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
               </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="text-[18px] font-bold text-[#1a1a2e] num">{total}</span>
            </div>
         </div>
         <div className="flex-1 space-y-2.5">
            {[
               { label: "Pago", value: paid, color: "#e11d48" },
               { label: "Pendente", value: pending, color: "#f59e0b" },
               { label: "Expirado", value: expired, color: "#d4d4d8" },
            ].map(item => (
               <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                     <span className="text-[12px] text-[#5c5c6d]">{item.label}</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#1a1a2e] num">{item.value}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function SalesHistory({ charges }: { charges: Charge[] }) {
  const [tab, setTab] = useState<"all" | ChargeStatusLocal>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return charges
      .filter(c => tab === "all" || c.status === tab)
      .filter(c => !search || `${c.service_name} ${c.payer_name}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [charges, tab, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between mb-5">
        <div>
           <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8c8c8c]">Histórico de vendas</p>
           <p className="text-[13px] text-[#8c8c8c] mt-0.5">{filtered.length} transação{filtered.length !== 1 ? "s" : ""} no período</p>
        </div>
        <label className="relative sm:w-64">
           <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4d4d8] pointer-events-none" />
           <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente ou serviço..." 
              className="w-full text-[13px] pl-9 pr-4 py-2.5 rounded-xl placeholder:text-[#d4d4d8] text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#fecdd3] transition-all"
              style={{ background: "#ffffff", border: "1px solid #fce4ec" }}
           />
        </label>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn("px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-2",
              tab === t.id ? "text-white shadow-md" : "text-[#8c8c8c] hover:text-[#e11d48] bg-white border border-[#fce4ec]"
            )}
            style={tab === t.id ? { background: "linear-gradient(135deg, #e11d48, #be123c)" } : undefined}
          >
            {t.label}
            <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] num", tab === t.id ? "bg-white/20 text-white" : "bg-[#f8f7f5] text-[#8c8c8c]")}>
              {charges.filter(c => t.id === "all" ? true : c.status === t.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-[14px] overflow-hidden bg-white" style={{ border: "1px solid #fce4ec" }}>
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[13px] text-[#8c8c8c]">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <>
            <ul className="lg:hidden divide-y divide-[#fce4ec]">
              {filtered.map(c => <MobileRow key={c.id} charge={c} />)}
            </ul>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #fce4ec" }}>
                    {["Serviço / Cliente", "Data", "Status", "Bruto", "Taxa (1%)", "Líquido"].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8c8c8c]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fce4ec]">
                  {filtered.map(c => <DesktopRow key={c.id} charge={c} />)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "CF";
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold"
      style={{ background: "#fff1f2", color: "#e11d48" }}>
      {initials}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "#e11d48",
    pending: "#f59e0b",
    expired: "#d4d4d8",
  };
  return <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: colors[status] || "#d4d4d8" }} />;
}

function MobileRow({ charge: c }: { charge: Charge }) {
  const net = (c.amount_cents / 100) * 0.99;
  return (
    <li className="flex items-center gap-4 px-5 py-4 hover:bg-[#f8f7f5] transition-all">
      <Avatar name={c.payer_name || "CF"} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-bold text-[#1a1a2e] truncate tracking-tight">{c.service_name}</p>
          <p className="text-[14px] font-bold text-[#1a1a2e] num whitespace-nowrap">{formatBRL(net * 100)}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[12px] text-[#8c8c8c] font-medium">{c.payer_name || "Cliente Final"} · {formatDate(c.created_at)}</p>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#f8f7f5] border border-[#fce4ec]">
            <StatusDot status={c.status} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c5c6d]">
               {c.status === 'paid' ? 'Pago' : c.status === 'pending' ? 'Pendente' : 'Expirado'}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

function DesktopRow({ charge: c }: { charge: Charge }) {
  const gross = c.amount_cents / 100;
  const fee = gross * 0.01;
  const net = gross - fee;
  const isIncoming = c.status === "paid";

  return (
    <tr className="hover:bg-[#fff1f2] transition-all">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={c.payer_name || "CF"} />
          <div>
            <p className="text-[13px] font-medium text-[#1a1a2e]">{c.service_name}</p>
            <p className="text-[11px] text-[#8c8c8c]">{c.payer_name || "Cliente Final"}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-3 text-[12px] text-[#8c8c8c]">{formatDate(c.created_at)}</td>
      <td className="px-6 py-3">
        <span className="flex items-center gap-1.5 text-[12px] text-[#5c5c6d]">
          <StatusDot status={c.status} />
          {c.status === 'paid' ? 'Pago' : c.status === 'pending' ? 'Pendente' : 'Expirado'}
        </span>
      </td>
      <td className="px-6 py-3 text-right text-[13px] text-[#5c5c6d] num">{formatBRL(c.amount_cents)}</td>
      <td className="px-6 py-3 text-right text-[12px] text-[#8c8c8c] num">− {formatBRL(fee * 100)}</td>
      <td className="px-6 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {isIncoming ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-[#e11d48]" weight="bold" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-[#8c8c8c]" weight="bold" />
          )}
          <span className="text-[13px] font-semibold text-[#1a1a2e] num">{formatBRL(net * 100)}</span>
        </div>
      </td>
    </tr>
  );
}

// --- CREATE CHARGE MODAL ---

function CreateChargeFlowModal({ onClose, onCreated, createdCharge }: { onClose: () => void; onCreated: (c: Charge) => void; createdCharge: Charge | null }) {
  const { profile } = useAuth();
  const [step, setStep] = useState<"choose" | "product" | "custom" | "share">("choose");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [localCharge, setLocalCharge] = useState<Charge | null>(createdCharge);
  const [amountStr, setAmountStr] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [copied, setCopied] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<string>("");

  useEffect(() => {
    if (localCharge?.pix_code && !localCharge?.qr_code_image) {
      QRCode.toDataURL(localCharge.pix_code, { margin: 1, width: 600 }).then(setGeneratedQr);
    }
  }, [localCharge?.pix_code, localCharge?.qr_code_image]);

  useEffect(() => {
    setLocalCharge(createdCharge);
    if (createdCharge) setStep("share");
  }, [createdCharge]);

  useEffect(() => {
    if (!profile) return;
    api.listProductsByProfile(profile.id).then(setProducts);
  }, [profile?.id]);

  useEffect(() => {
    if (step === "share" && localCharge && localCharge.status === "pending") {
      const channel = supabase.channel(`m_${localCharge.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'charges', filter: `id=eq.${localCharge.id}` }, (payload) => {
        const updated = payload.new as Charge;
        if (updated.status === 'paid') setLocalCharge(updated);
      }).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [step, localCharge?.id, localCharge?.status]);

  const checkoutUrl = useMemo(() => {
    const target = localCharge || createdCharge;
    if (!target || !profile?.slug) return "";
    return `${window.location.origin}/${profile.slug}/${target.id}`;
  }, [localCharge, createdCharge, profile?.slug]);

  async function createFromProduct() {
    if (!profile?.slug) return;
    setLoading(true);
    try {
      const charge = await api.createChargeFromProduct({
        profile_id: profile.id,
        slug: profile.slug,
        product_id: selectedProductId,
        payer_name: sanitizeText(payerName, 80) || null,
        payer_cpf: profile.cpf || "00000000000",
        payer_email: profile.email || "",
        notes: null,
      });
      onCreated(charge);
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  }

  async function createCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.slug) return;
    setLoading(true);
    try {
      const charge = await api.createCharge({
        profile_id: profile.id,
        slug: profile.slug,
        amount_cents: parseBRLToCents(amountStr),
        service_name: sanitizeText(serviceName, 60),
        description: null,
        payer_name: sanitizeText(payerName, 80) || null,
        payer_cpf: profile.cpf || "00000000000",
        payer_email: profile.email || "",
        notes: null,
      });
      onCreated(charge);
    } catch (error: any) { alert(error.message); } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={cn("relative w-full max-h-[90vh] overflow-y-auto rounded-[24px] bg-white shadow-2xl transition-all duration-500", step === "share" ? "max-w-4xl" : "max-w-xl")}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-600">
          <X size={20} weight="bold" />
        </button>

        {step === "share" ? (
          <div className="flex flex-col md:flex-row h-full">
            <div className="md:w-[45%] bg-[#e11d48] p-10 text-white">
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Status: Aguardando</span>
               <h2 className="text-4xl font-bold tracking-tighter mt-4">{formatBRL(localCharge!.amount_cents)}</h2>
               <p className="text-sm font-medium opacity-80 mt-2">{localCharge!.service_name}</p>
               <div className="mt-10 p-6 rounded-[20px] bg-white/10 border border-white/10">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-[#e11d48] font-bold">
                        {profile?.full_name?.slice(0, 2).toUpperCase()}
                     </div>
                     <div>
                        <p className="text-sm font-bold">{profile?.full_name}</p>
                        <p className="text-[10px] opacity-60">cloudepay.com.br/{profile?.slug}</p>
                     </div>
                  </div>
               </div>
               <button onClick={() => window.open(checkoutUrl, '_blank')} className="w-full mt-10 py-4 bg-white text-[#e11d48] rounded-xl text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg">Abrir Checkout</button>
            </div>
            <div className="md:w-[55%] p-10 flex flex-col items-center justify-center">
               <div className="p-4 border-2 border-gray-50 rounded-[24px] bg-white shadow-lg mb-8">
                  <img src={localCharge?.qr_code_image || generatedQr} className="h-48 w-48 object-contain" />
               </div>
               <div className="w-full bg-gray-50 p-2 rounded-xl flex items-center gap-2 pl-4">
                  <span className="flex-1 truncate text-xs font-bold text-gray-400">{checkoutUrl.replace('https://', '')}</span>
                  <button onClick={() => { navigator.clipboard.writeText(checkoutUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={cn("px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", copied ? 'bg-emerald-500' : 'bg-[#e11d48]', "text-white")}>
                     {copied ? 'Copiado' : 'Copiar'}
                  </button>
               </div>
               <div className="mt-8 w-full flex justify-center gap-4">
                  {[WhatsappLogo, InstagramLogo, TiktokLogo, TelegramLogo, ShareNetwork].map((Icon, i) => (
                    <div key={i} className="h-10 w-10 rounded-xl border border-gray-100 flex items-center justify-center text-[#e11d48] hover:bg-[#fff1f2] cursor-pointer transition-all">
                      <Icon size={18} weight="bold" />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="p-10">
             <h3 className="text-2xl font-bold text-[#1a1a2e] tracking-tight">Nova Cobrança</h3>
             <p className="text-sm font-medium text-[#8c8c8c] mb-8">Defina os detalhes do pagamento</p>
             <div className="grid grid-cols-2 gap-3 bg-gray-50 p-1.5 rounded-xl mb-8">
                <button onClick={() => setStep("product")} className={cn("py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", step === "product" ? "bg-white text-[#e11d48] shadow-sm" : "text-[#8c8c8c]")}>Meus Produtos</button>
                <button onClick={() => setStep("custom")} className={cn("py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", step === "custom" || step === "choose" ? "bg-white text-[#e11d48] shadow-sm" : "text-[#8c8c8c]")}>Valor Manual</button>
             </div>

             {step === "product" ? (
                <div className="space-y-5">
                   <select className="w-full bg-gray-50 border border-transparent rounded-xl py-4 px-6 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                      <option value="">Selecione o produto...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} — {formatBRL(p.amount_cents)}</option>)}
                   </select>
                   <input placeholder="Nome do cliente (opcional)" className="w-full bg-gray-50 border border-transparent rounded-xl py-4 px-6 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none" value={payerName} onChange={e => setPayerName(e.target.value)} />
                   <button onClick={createFromProduct} disabled={loading || !selectedProductId} className="w-full py-4 bg-[#e11d48] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 shadow-lg active:scale-[0.98] transition-all">Gerar Pagamento</button>
                </div>
             ) : (
                <form onSubmit={createCustom} className="space-y-5">
                   <div className="bg-[#fff1f2] rounded-2xl p-6 text-center border-2 border-transparent focus-within:border-[#e11d48]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#e11d48] mb-1">Qual o valor?</p>
                      <input placeholder="R$ 0,00" className="w-full bg-transparent border-none text-center text-4xl font-bold tracking-tighter text-[#1a1a2e] focus:ring-0 placeholder:text-[#e11d48]/30" value={amountStr} onChange={e => setAmountStr(maskBRLInput(e.target.value))} required />
                   </div>
                   <input placeholder="Descrição do serviço" className="w-full bg-gray-50 border border-transparent rounded-xl py-4 px-6 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none" value={serviceName} onChange={e => setServiceName(e.target.value)} required />
                   <input placeholder="Nome do cliente (opcional)" className="w-full bg-gray-50 border border-transparent rounded-xl py-4 px-6 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none" value={payerName} onChange={e => setPayerName(e.target.value)} />
                   <button type="submit" disabled={loading} className="w-full py-4 bg-[#e11d48] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest mt-4 shadow-lg active:scale-[0.98] transition-all">Gerar Pagamento</button>
                </form>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
