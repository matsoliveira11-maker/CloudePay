import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { Charge } from "../lib/api";
import { supabase } from "../lib/supabase";
import { formatBRL, maskBRLInput, parseBRLToCents, formatDate } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { 
  TrendUp, 
  Receipt, 
  ArrowCircleUp, 
  Wallet, 
  CalendarBlank, 
  ChartPie, 
  CaretLeft, 
  CaretRight,
  MagnifyingGlass,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  WhatsappLogo,
  InstagramLogo,
  TiktokLogo,
  TelegramLogo,
  ShareNetwork,
  X
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

// --- Main Page Component ---

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
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
    const sub = supabase.channel('dashboard_v2').on('postgres_changes', { event: '*', schema: 'public', table: 'charges', filter: `profile_id=eq.${profile.id}` }, () => reload()).subscribe();
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
    <div className="space-y-5">
      
      {/* Period Selector & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 a-up">
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#fce4ec]">
          {(["today", "month", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-widest rounded-lg transition-all ${
                period === p ? "bg-[#e11d48] text-white shadow-md" : "text-[#8c8c8c] hover:text-[#e11d48]"
              }`}
            >
              {p === "today" ? "Hoje" : p === "month" ? "Mês" : "Total"}
            </button>
          ))}
        </div>
        <button 
          onClick={() => navigate("/produtos")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#e11d48] bg-white border border-[#fce4ec] hover:bg-[#fff1f2] transition-all active:scale-[0.98]"
        >
          <Package size={18} weight="bold" />
          Adicionar Produto
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 a-up-1">
         <KpiCard label="Total em vendas" value={formatBRL(kpis.gross)} icon={<TrendUp size={18} weight="bold" />} accent />
         <KpiCard label="Total de transações" value={String(kpis.count)} icon={<Receipt size={18} weight="bold" />} />
         <KpiCard label="Ticket Médio" value={formatBRL(kpis.avg)} icon={<ArrowCircleUp size={18} weight="bold" />} />
      </div>

      {/* Payment Method Banner */}
      <div className="a-up-2">
        <PaymentMethodsBanner charges={charges} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
         <div className="a-up-3">
            <PerformanceChart charges={charges} />
         </div>
         <div className="a-up-4">
            <TicketEvolutionChart charges={charges} />
         </div>
      </div>

      {/* Bottom Row: Distribution & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
         <div className="a-up-5 h-full">
            <StatusDistribution charges={charges} />
         </div>
         <div className="a-up-6 h-full">
            <SalesCalendar />
         </div>
      </div>

      {/* Sales History Table */}
      <div className="a-up-6 pt-5">
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
  );
}

// --- Sub-components ---

function KpiCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) {
  const bg = accent ? "linear-gradient(135deg, #e11d48, #be123c)" : "#ffffff";
  const textColor = accent ? "#ffffff" : "#1a1a2e";
  const labelColor = accent ? "rgba(255,255,255,0.7)" : "#8c8c8c";
  const iconBg = accent ? "rgba(255,255,255,0.2)" : "#fff1f2";
  const iconColor = accent ? "#ffffff" : "#e11d48";
  const border = accent ? "none" : "1px solid #fce4ec";

  return (
    <div className="rounded-[14px] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{ background: bg, border, color: textColor }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <span className="text-[13px] font-medium" style={{ color: labelColor }}>{label}</span>
      </div>
      <p className="text-[32px] font-bold tracking-[-0.03em] num leading-none">{value}</p>
    </div>
  );
}

function PaymentMethodsBanner({ charges }: { charges: Charge[] }) {
  const pixTotal = charges.filter(c => c.status === "paid").reduce((s, c) => s + c.amount_cents, 0);
  return (
    <div className="rounded-[14px] p-6 bg-white transition-all duration-200 hover:shadow-md"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center gap-2 mb-5">
        <Wallet size={18} className="text-[#8c8c8c]" weight="bold" />
        <h3 className="text-[14px] font-bold text-[#1a1a2e]">Método de pagamento</h3>
      </div>
      <div className="h-2.5 rounded-full mb-6 overflow-hidden bg-[#f8f7f5]">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: "100%", background: "linear-gradient(90deg, #e11d48, #be123c)" }} />
      </div>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#fff1f2]">
            <span className="text-[#e11d48] font-bold text-[10px]">PIX</span>
          </div>
          <span className="text-[13px] font-medium text-[#1a1a2e]">Pix Instantâneo</span>
        </div>
        <span className="text-[13px] font-bold text-[#1a1a2e] num">{formatBRL(pixTotal)}</span>
      </div>
      <div className="mt-4 pt-4 flex items-center justify-between border-t border-[#fce4ec]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#fff1f2]">
            <div className="w-2 h-2 rounded-full bg-[#e11d48]" />
          </div>
          <span className="text-[13px] font-bold text-[#1a1a2e]">Total Recebido</span>
        </div>
        <span className="text-[13px] font-bold text-[#1a1a2e] num">{formatBRL(pixTotal)}</span>
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
      return { name: label.toUpperCase(), value };
    });
  }, [charges]);

  return (
    <div className="rounded-[14px] p-6 bg-white transition-all duration-200 hover:shadow-md"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center gap-2 mb-6">
        <TrendUp size={18} className="text-[#e11d48]" weight="bold" />
        <h3 className="text-[14px] font-bold text-[#1a1a2e]">Faturamento Semanal</h3>
      </div>
      <div className="h-[220px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e11d48" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8c8c8c", fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #fce4ec", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: "10px" }}
              formatter={(v: any) => [formatBRL(Number(v) * 100), ""]}
              labelStyle={{ fontSize: 11, fontWeight: 800, color: "#8c8c8c", marginBottom: 4 }}
            />
            <Area type="monotone" dataKey="value" stroke="#e11d48" strokeWidth={3} fill="url(#salesGrad)" dot={false} activeDot={{ r: 6, fill: "#e11d48", stroke: "#fff", strokeWidth: 2 }} />
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
      return { name: label.toUpperCase(), value };
    });
  }, [charges]);

  return (
    <div className="rounded-[14px] p-6 bg-white transition-all duration-200 hover:shadow-md"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center gap-2 mb-6">
        <ArrowCircleUp size={18} className="text-[#e11d48]" weight="bold" />
        <h3 className="text-[14px] font-bold text-[#1a1a2e]">Evolução do Ticket Médio</h3>
      </div>
      <div className="h-[220px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8c8c8c", fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #fce4ec", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: "10px" }}
              formatter={(v: any) => [formatBRL(Number(v) * 100), ""]}
              labelStyle={{ fontSize: 11, fontWeight: 800, color: "#8c8c8c", marginBottom: 4 }}
            />
            <Line type="monotone" dataKey="value" stroke="#be123c" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#be123c", stroke: "#fff", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatusDistribution({ charges }: { charges: Charge[] }) {
  const paid = charges.filter(c => c.status === "paid").length;
  const pending = charges.filter(c => c.status === "pending").length;
  const total = charges.length;
  const data = total ? [
    { name: "Pago", value: paid, color: "#e11d48" },
    { name: "Pendente", value: pending, color: "#f59e0b" },
    { name: "Outros", value: total - paid - pending, color: "#d4d4d8" }
  ] : [{ name: "Vazio", value: 1, color: "#f8f7f5" }];

  return (
    <div className="rounded-[14px] p-6 bg-white transition-all duration-200 hover:shadow-md h-full"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center gap-2 mb-6">
        <ChartPie size={18} className="text-[#e11d48]" weight="bold" />
        <h3 className="text-[14px] font-bold text-[#1a1a2e]">Divisão por Status</h3>
      </div>
      <div className="flex items-center gap-8">
         <div className="relative w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={data} dataKey="value" innerRadius={35} outerRadius={50} paddingAngle={4} stroke="none">
                     {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
               </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-xl font-bold text-[#1a1a2e] num leading-none">{total}</span>
            </div>
         </div>
         <div className="flex-1 space-y-3">
            {data.map((item, i) => (
               <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                     <span className="text-[12px] font-medium text-[#5c5c6d]">{item.name}</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#1a1a2e] num">{item.value}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function SalesCalendar() {
  const days = ["D", "S", "T", "Q", "Q", "S", "S"];
  return (
    <div className="rounded-[14px] p-6 bg-white transition-all duration-200 hover:shadow-md h-full"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarBlank size={18} className="text-[#e11d48]" weight="bold" />
          <h3 className="text-[14px] font-bold text-[#1a1a2e]">Calendário</h3>
        </div>
        <div className="flex items-center gap-2">
           <CaretLeft size={16} className="text-[#8c8c8c] cursor-pointer" />
           <span className="text-[11px] font-bold text-[#5c5c6d] uppercase">Mai 2025</span>
           <CaretRight size={16} className="text-[#8c8c8c] cursor-pointer" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(d => <div key={d} className="text-center text-[10px] font-bold text-[#8c8c8c] py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }, (_, i) => {
          const isToday = i + 1 === new Date().getDate();
          return (
            <div key={i} className={`aspect-square flex items-center justify-center text-[11px] font-bold rounded-lg transition-all ${isToday ? 'bg-[#e11d48] text-white shadow-lg' : 'text-[#1a1a2e] hover:bg-[#fff1f2]'}`}>
               {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SalesHistory({ charges }: { charges: Charge[] }) {
  const [search, setSearch] = useState("");
  const filtered = charges.filter(c => !search || c.service_name.toLowerCase().includes(search.toLowerCase()) || c.payer_name?.toLowerCase().includes(search.toLowerCase())).slice(0, 10);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
           <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8c8c8c]">Histórico Recente</p>
           <p className="text-[13px] text-[#8c8c8c] mt-1">Exibindo as últimas transações</p>
        </div>
        <div className="relative sm:w-72">
           <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4d4d8]" size={16} />
           <input 
              placeholder="Buscar por cliente ou serviço..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-[#fce4ec] rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-medium placeholder:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-[#fecdd3] transition-all"
           />
        </div>
      </div>
      <div className="bg-white rounded-[14px] border border-[#fce4ec] overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-[#fce4ec]">
                     {["Serviço / Cliente", "Data", "Status", "Valor"].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8c8c8c]">{h}</th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#fce4ec]">
                  {filtered.map(c => (
                     <tr key={c.id} className="hover:bg-[#fff1f2] transition-colors cursor-pointer group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#fff1f2] text-[#e11d48] flex items-center justify-center text-[11px] font-bold">
                                 {c.payer_name?.slice(0, 2).toUpperCase() || "CF"}
                              </div>
                              <div>
                                 <p className="text-[13px] font-bold text-[#1a1a2e] group-hover:text-[#e11d48] transition-colors">{c.service_name}</p>
                                 <p className="text-[11px] text-[#8c8c8c]">{c.payer_name || "Cliente Final"}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-[12px] font-medium text-[#8c8c8c]">{formatDate(c.created_at)}</td>
                        <td className="px-6 py-4">
                           <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              c.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : c.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                           }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'paid' ? 'bg-emerald-500' : c.status === 'pending' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                              {c.status === 'paid' ? 'Pago' : c.status === 'pending' ? 'Pendente' : 'Cancelado'}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-1.5">
                              {c.status === 'paid' ? <ArrowUpRight size={14} className="text-[#e11d48]" /> : <ArrowDownRight size={14} className="text-[#8c8c8c]" />}
                              <span className="text-[14px] font-bold text-[#1a1a2e] num">{formatBRL(c.amount_cents)}</span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
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
      <div className={`relative w-full max-h-[90vh] overflow-y-auto rounded-[24px] bg-white shadow-2xl transition-all duration-500 ${step === "share" ? "max-w-4xl" : "max-w-xl"}`}>
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
                  <button onClick={() => { navigator.clipboard.writeText(checkoutUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500' : 'bg-[#e11d48]'} text-white`}>
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
                <button onClick={() => setStep("product")} className={`py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${step === "product" ? "bg-white text-[#e11d48] shadow-sm" : "text-[#8c8c8c]"}`}>Meus Produtos</button>
                <button onClick={() => setStep("custom")} className={`py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${step === "custom" || step === "choose" ? "bg-white text-[#e11d48] shadow-sm" : "text-[#8c8c8c]"}`}>Valor Manual</button>
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
