import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { Charge } from "../lib/api";
import { supabase } from "../lib/supabase";
import { formatBRL, formatDateTime, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { 
  X, 
  WhatsappLogo, 
  InstagramLogo, 
  TiktokLogo, 
  TelegramLogo, 
  ShareNetwork,
  MagnifyingGlass,
  ArrowUpRight,
  CaretLeft,
  CaretRight,
  TrendUp,
  Receipt,
  Users,
  User as UserIcon
} from "phosphor-react";
import QRCode from "qrcode";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import { useRef } from "react";

// --- Types ---
type PeriodFilter = "today" | "month" | "30days" | "90days" | "all" | "custom";

export default function Dashboard() {
  const { profile } = useAuth();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [stats, setStats] = useState({ monthNet: 0, monthGross: 0, totalNet: 0, totalGross: 0 });
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "cancelled">("all");
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdCharge, setCreatedCharge] = useState<Charge | null>(null);

  const openCreate = useCallback(() => {
    setCreatedCharge(null);
    setShowCreateModal(true);
  }, []);

  const closeCreate = useCallback(() => {
    setShowCreateModal(false);
    setCreatedCharge(null);
  }, []);

  useEffect(() => {
    const handleOpenCreate = () => openCreate();
    window.addEventListener("open-create-charge", handleOpenCreate as EventListener);
    return () => window.removeEventListener("open-create-charge", handleOpenCreate as EventListener);
  }, [openCreate]);

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
    const channel = supabase
      .channel('dashboard_charges_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'charges',
        filter: `profile_id=eq.${profile.id}`,
      }, (payload) => {
        if (payload.new && (payload.new as any).status === 'paid' && (payload.old as any).status !== 'paid') {
           toast.success(`Pagamento de ${formatBRL((payload.new as any).amount_cents)} recebido!`, {
             icon: '💰',
             duration: 5000,
           });
        }
        reload();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [reload, profile?.id]);

  const filteredCharges = useMemo(() => {
    let list = charges;
    
    // Status Filter
    if (filter === "paid") list = list.filter(c => c.status === "paid");
    if (filter === "pending") list = list.filter(c => c.status === "pending");
    if (filter === "cancelled") list = list.filter(c => c.status === "expired");
    
    // Search Filter
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => 
        c.service_name.toLowerCase().includes(s) || 
        c.payer_name?.toLowerCase().includes(s) ||
        c.gateway_id.toLowerCase().includes(s)
      );
    }

    // Period Filter
    const now = new Date();
    if (period === "today") {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      list = list.filter(c => new Date(c.created_at) >= todayStart);
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      list = list.filter(c => new Date(c.created_at) >= startOfMonth);
    } else if (period === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      list = list.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
    } else if (period === "90days") {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      list = list.filter(c => new Date(c.created_at) >= ninetyDaysAgo);
    }
    
    return list;
  }, [charges, filter, period, search]);

  const paidCharges = charges.filter((c) => c.status === "paid");
  const pendingCharges = charges.filter((c) => c.status === "pending");
  const cancelledCharges = charges.filter((c) => c.status === "expired");

  const avgTicket = paidCharges.length > 0 ? stats.totalGross / paidCharges.length : 0;

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        raw: date.toLocaleDateString('pt-BR'),
        vendas: 0,
        ticket: 0,
        count: 0
      };
    });

    charges.forEach(c => {
      if (c.status !== 'paid') return;
      const d = new Date(c.paid_at || c.created_at).toLocaleDateString('pt-BR');
      const dayData = days.find(day => day.raw === d);
      if (dayData) {
        dayData.vendas += c.amount_cents / 100;
        dayData.count += 1;
      }
    });

    days.forEach(d => {
      d.ticket = d.count > 0 ? d.vendas / d.count : 0;
    });

    return days;
  }, [charges]);

  // Pie Chart Data
  const pieData = [
    { name: 'Pago', value: paidCharges.length, color: '#e11d48' },
    { name: 'Pendente', value: pendingCharges.length, color: '#FBBF24' },
    { name: 'Cancelado', value: cancelledCharges.length, color: '#9CA3AF' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Period Selectors */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "today", label: "Hoje" },
          { id: "month", label: "Esse mês" },
          { id: "30days", label: "Últimos 30 dias" },
          { id: "90days", label: "Últimos 90 dias" },
          { id: "all", label: "Todo o período" },
          { id: "custom", label: "Personalizado" },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as PeriodFilter)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              period === p.id 
                ? "bg-[#e11d48] text-white shadow-lg shadow-rose-500/20" 
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#e11d48] p-8 text-white shadow-xl shadow-rose-500/10 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
            <TrendUp size={16} /> Total em vendas
          </div>
          <div className="mt-2 text-4xl font-black tracking-tighter sm:text-5xl">
            {formatBRL(period === "month" ? stats.monthGross : stats.totalGross)}
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 transition-transform hover:scale-[1.02] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Receipt size={16} /> Total de transações
          </div>
          <div className="mt-2 text-4xl font-black tracking-tighter text-[#1A1A1A] sm:text-5xl">
            {filteredCharges.length}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 transition-transform hover:scale-[1.02] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Users size={16} /> Ticket Médio
          </div>
          <div className="mt-2 text-4xl font-black tracking-tighter text-[#1A1A1A] sm:text-5xl">
            {formatBRL(avgTicket)}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
             Método de pagamento
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-50">
            <div className="h-full bg-[#e11d48] transition-all duration-1000" style={{ width: '100%' }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-50 text-[#e11d48]">
                <Receipt size={18} />
              </div>
              <span className="text-sm font-bold text-gray-600">Pix</span>
            </div>
            <span className="text-sm font-black text-[#1A1A1A]">{formatBRL(period === "month" ? stats.monthGross : stats.totalGross)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
             <span className="text-sm font-bold text-[#1A1A1A]">Total</span>
             <span className="text-sm font-black text-[#1A1A1A]">{formatBRL(period === "month" ? stats.monthGross : stats.totalGross)}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
               <TrendUp size={16} /> Desempenho de vendas
             </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#e11d48" 
                  strokeWidth={4} 
                  dot={false}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
               <ArrowUpRight size={16} /> Evolução do Ticket Médio
             </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ticket" 
                  stroke="#e11d48" 
                  strokeWidth={4} 
                  dot={false}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution & Calendar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
             Distribuição por status
          </div>
          <div className="flex flex-col items-center sm:flex-row sm:justify-around">
            <div className="relative h-48 w-48">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[#1A1A1A]">{filteredCharges.length}</span>
               </div>
            </div>
            <div className="mt-8 space-y-4 sm:mt-0">
               {pieData.map((item) => (
                 <div key={item.name} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-gray-400 w-20">{item.name}</span>
                    <span className="text-xs font-black text-[#1A1A1A]">{item.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
           <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                 Calendário de vendas
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-[#1A1A1A] transition-all"><CaretLeft size={16} /></button>
                <span className="text-xs font-black text-[#1A1A1A]">Mai 2026</span>
                <button className="text-gray-400 hover:text-[#1A1A1A] transition-all"><CaretRight size={16} /></button>
              </div>
           </div>
           <div className="grid grid-cols-7 gap-1 text-center">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="py-2 text-[10px] font-bold text-gray-400">{d}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isSelected = day === 15;
                return (
                  <div 
                    key={day} 
                    className={`flex aspect-square items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      isSelected ? "bg-[#e11d48] text-white shadow-lg shadow-rose-500/20" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      {/* History Section */}
      <div className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
           <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Histórico de vendas</h2>
              <p className="mt-1 text-[11px] font-bold text-gray-400">{filteredCharges.length} transações no período</p>
           </div>
           <div className="relative w-full max-w-sm">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                placeholder="Buscar cliente ou serviço..." 
                className="w-full rounded-2xl bg-gray-50/50 py-3 pl-12 pr-4 text-sm font-semibold transition-all focus:bg-white focus:ring-2 focus:ring-[#e11d48]/10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
           {[
             { id: "all", label: "Todas", count: charges.length },
             { id: "paid", label: "Pagas", count: paidCharges.length },
             { id: "pending", label: "Pendentes", count: pendingCharges.length },
             { id: "cancelled", label: "Canceladas", count: cancelledCharges.length },
           ].map(f => (
             <button
               key={f.id}
               onClick={() => setFilter(f.id as any)}
               className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                 filter === f.id ? "bg-[#e11d48] text-white shadow-lg" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
               }`}
             >
               {f.label} <span className="opacity-50">{f.count}</span>
             </button>
           ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="border-b border-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                   <th className="pb-4 pr-4">Serviço / Cliente</th>
                   <th className="pb-4 pr-4">Data</th>
                   <th className="pb-4 pr-4">Status</th>
                   <th className="pb-4 pr-4">Bruto</th>
                   <th className="pb-4 pr-4">Taxa (1%)</th>
                   <th className="pb-4">Líquido</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {filteredCharges.map((c) => (
                  <tr key={c.id} className="group transition-all hover:bg-gray-50/50">
                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-full bg-rose-50 text-[10px] font-black text-[#e11d48]">
                            {c.payer_name?.slice(0, 2).toUpperCase() || "CF"}
                         </div>
                         <div>
                            <p className="text-sm font-black text-[#1A1A1A]">{c.service_name}</p>
                            <p className="text-[11px] font-bold text-gray-400">{c.payer_name || "Cliente Final"}</p>
                         </div>
                      </div>
                    </td>
                    <td className="py-5 pr-4 text-xs font-bold text-gray-400">{formatDateTime(c.created_at)}</td>
                    <td className="py-5 pr-4">
                       <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${c.status === 'paid' ? 'bg-[#e11d48]' : c.status === 'pending' ? 'bg-amber-400' : 'bg-gray-400'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-wider ${c.status === 'paid' ? 'text-[#e11d48]' : c.status === 'pending' ? 'text-amber-600' : 'text-gray-400'}`}>
                             {c.status === 'paid' ? 'Pago' : c.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                       </div>
                    </td>
                    <td className="py-5 pr-4 text-sm font-bold text-gray-400">{formatBRL(c.amount_cents)}</td>
                    <td className="py-5 pr-4 text-sm font-bold text-gray-400">-{formatBRL(c.fee_cents)}</td>
                    <td className="py-5">
                       <div className="flex items-center gap-2">
                          {c.status === 'paid' && <TrendUp className="text-[#e11d48]" size={14} />}
                          <span className="text-sm font-black text-[#1A1A1A]">{formatBRL(c.net_amount_cents)}</span>
                       </div>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
          {filteredCharges.length === 0 && (
            <div className="py-20 text-center text-gray-400">
               Nenhuma transação localizada para este filtro.
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateChargeFlowModal
          onClose={closeCreate}
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

// --- Original Modal Components (Simplified/Adapted) ---

type FlowStep = "choose" | "product" | "custom" | "share";

function CreateChargeFlowModal({
  onClose,
  onCreated,
  createdCharge,
}: {
  onClose: () => void;
  onCreated: (c: Charge) => void;
  createdCharge: Charge | null;
}) {
  const { profile } = useAuth();
  const [step, setStep] = useState<FlowStep>("choose");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [localCharge, setLocalCharge] = useState<Charge | null>(createdCharge);
  const [amountStr, setAmountStr] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [generatedQr, setGeneratedQr] = useState<string>("");

  useEffect(() => {
    if (localCharge?.pix_code && !localCharge?.qr_code_image) {
      QRCode.toDataURL(localCharge.pix_code, {
        margin: 1,
        width: 600,
        color: { dark: "#000000", light: "#ffffff" }
      }).then(setGeneratedQr);
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
      const channel = supabase
        .channel(`modal_charge_realtime_${localCharge.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'charges',
          filter: `id=eq.${localCharge.id}`,
        }, (payload) => {
          const updated = payload.new as Charge;
          if (updated.status === 'paid') {
            setLocalCharge(updated);
          }
        })
        .subscribe();

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
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocorreu um erro ao gerar a cobrança.");
    } finally {
      setLoading(false);
    }
  }

  async function createCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.slug) return;
    const cents = parseBRLToCents(amountStr);
    setLoading(true);
    try {
      const charge = await api.createCharge({
        profile_id: profile.id,
        slug: profile.slug,
        amount_cents: cents,
        service_name: sanitizeText(serviceName, 60),
        description: null,
        payer_name: sanitizeText(payerName, 80) || null,
        payer_cpf: profile.cpf || "00000000000",
        payer_email: profile.email || "",
        notes: null,
      });
      onCreated(charge);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocorreu um erro ao gerar a cobrança avulsa.");
    } finally {
      setLoading(false);
    }
  }

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { backgroundColor: "#ffffff", scale: 2 });
    const link = document.createElement("a");
    link.download = `venda-${localCharge!.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full overflow-y-auto max-h-[90vh] md:max-h-none rounded-[2rem] md:rounded-[2.5rem] shadow-[0_40px_120px_rgba(136,19,55,0.15)] transition-all duration-500 ${step === "share" ? "max-w-4xl bg-white md:bg-transparent" : "max-w-xl bg-white"}`}>
        {step !== "share" && (
          <div className="absolute top-6 right-6 z-10">
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
              <X size={18} weight="bold" />
            </button>
          </div>
        )}

        {step === "share" ? (
          <div className="flex flex-col md:flex-row w-full h-full md:min-h-[560px]">
            {/* Left Column - Deep Red Brand Gradient */}
            <div className="relative w-full md:w-[45%] bg-gradient-to-br from-[#881337] to-[#e11d48] p-4 md:p-10 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                  Cobrança Pronta
                </span>
                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                  <X size={14} weight="bold" />
                </button>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl md:text-5xl font-bold tracking-tighter text-white mb-0.5 md:mb-2">
                  {formatBRL(localCharge!.amount_cents)}
                </h2>
                <p className="text-[10px] md:text-sm text-white/80 font-medium mb-3 md:mb-10">
                  {localCharge!.service_name || "Cobrança avulsa"}
                </p>

                <div className="rounded-2xl bg-white/10 border border-white/5 p-3 md:p-5">
                  <div className="flex items-center gap-3 mb-3 md:mb-6">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl md:rounded-2xl bg-white font-black text-[#e11d48] text-sm md:text-lg">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        profile?.full_name?.slice(0, 2).toUpperCase() || "CL"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-base font-bold text-white truncate">
                        {profile?.full_name || "Nome da Loja"}
                      </p>
                      <p className="text-[9px] md:text-xs text-white/60 truncate">
                        cloudepay.com.br/{profile?.slug || "loja"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg md:rounded-xl bg-white/5 p-2 md:p-4">
                      <p className="text-[8px] md:text-[10px] font-bold text-white/60 mb-0.5">Taxa CloudePay</p>
                      <p className="text-xs font-bold text-white">2%</p>
                    </div>
                    <div className="rounded-lg md:rounded-xl bg-white/5 p-2 md:p-4">
                      <p className="text-[8px] md:text-[10px] font-bold text-white/60 mb-0.5">Expiração</p>
                      <p className="text-xs font-bold text-white">15 min</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                  onClick={() => window.open(checkoutUrl, '_blank')}
                  className="mt-6 md:mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-[#881337] hover:bg-zinc-100 transition-all shadow-lg active:scale-[0.98]"
              >
                  Abrir página de pagamento
              </button>
            </div>

            {/* Right Column - White Background */}
            <div className="relative w-full md:w-[55%] bg-white p-4 md:p-10 flex flex-col items-center justify-center">
              <div className="w-full max-w-[320px] flex flex-col items-center">
                {localCharge?.status === "paid" ? (
                    <div className="w-full flex flex-col items-center">
                      <div ref={receiptRef} className="w-full rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-lg relative overflow-hidden mb-8">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-6">
                              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e11d48]">Venda Confirmada</p>
                          <h2 className="mt-3 text-4xl font-bold tracking-tighter text-[#1A1A1A]">{formatBRL(localCharge.amount_cents)}</h2>
                          <div className="mt-8 space-y-3 text-left">
                              <div className="flex justify-between border-b border-gray-50 pb-3">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Cliente</span>
                                  <span className="text-[#1A1A1A] font-bold text-[11px] truncate max-w-[120px]">{localCharge.payer_name || "Cliente Final"}</span>
                              </div>
                              <div className="flex justify-between border-b border-gray-50 pb-3">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Data</span>
                                  <span className="text-[#1A1A1A] font-bold text-[11px]">{new Date().toLocaleDateString('pt-BR')}</span>
                              </div>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 w-full">
                          <button onClick={downloadReceipt} className="h-14 rounded-full bg-[#e11d48] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#be123c] transition-all shadow-md">Baixar IMG</button>
                          <button onClick={() => window.print()} className="h-14 rounded-full border border-gray-100 bg-white text-[#1A1A1A] text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Imprimir</button>
                      </div>
                    </div>
                ) : (
                  <>
                    <div className="mb-3 md:mb-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 p-2 md:p-4 shadow-sm bg-white">
                        {(localCharge?.qr_code_image || generatedQr) ? (
                            <img src={localCharge?.qr_code_image || generatedQr} alt="QR Code" className="h-28 w-28 md:h-48 md:w-48 object-contain" />
                        ) : (
                            <div className="h-28 w-28 md:h-48 md:w-48 animate-pulse bg-zinc-50 rounded-2xl" />
                        )}
                    </div>

                    <p className="text-center text-[10px] md:text-[11px] font-medium leading-relaxed text-gray-400 mb-4 md:mb-8">
                        QR Code PIX gerado.
                    </p>

                <div className="w-full flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-1 md:p-1.5 pl-3 md:pl-4 mb-3 md:mb-8">
                  <span className="flex-1 truncate text-[9px] md:text-xs font-medium text-gray-400">
                    {checkoutUrl.replace('https://', '')}
                  </span>
                  <button onClick={copyLink} className={`rounded-lg px-4 md:px-6 py-2 md:py-3 text-[9px] md:text-xs font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-[#e11d48] text-white hover:bg-[#be123c]'}`}>
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <div className="w-full">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 text-center">
                    Compartilhar
                  </p>
                  <div className="grid grid-cols-5 gap-2 md:gap-3">
                    {[
                      { icon: <WhatsappLogo size={18} weight="bold" />, label: 'WhatsApp' },
                      { icon: <InstagramLogo size={18} weight="bold" />, label: 'Instagram' },
                      { icon: <TiktokLogo size={18} weight="bold" />, label: 'TikTok' },
                      { icon: <ShareNetwork size={18} weight="bold" />, label: 'Kwai' },
                      { icon: <TelegramLogo size={18} weight="bold" />, label: 'Telegram' },
                    ].map((app) => (
                      <button key={app.label} className="flex flex-col items-center group">
                        <div className="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-100 bg-white transition-all group-hover:bg-gray-50 group-active:scale-95 text-[#e11d48]">
                          {app.icon}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10">
            <h2 className="text-3xl font-bold tracking-tighter text-[#1A1A1A] mb-2">Criar nova cobrança</h2>
            <p className="text-sm text-gray-400 mb-8 font-medium">Defina os detalhes para gerar seu link de pagamento.</p>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5 mb-8">
              <button 
                onClick={() => setStep("product")} 
                className={`rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${step === "product" ? "bg-white text-[#e11d48] shadow-sm scale-[1.02]" : "text-gray-400 hover:text-[#e11d48]"}`}
              >
                Produtos
              </button>
              <button 
                onClick={() => setStep("custom")} 
                className={`rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${step === "custom" || step === "choose" ? "bg-white text-[#e11d48] shadow-sm scale-[1.02]" : "text-gray-400 hover:text-[#e11d48]"}`}
              >
                Avulsa
              </button>
            </div>

            {step === "product" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Selecionar Produto</label>
                    <select 
                        className="auth-input !bg-white border-gray-100 focus:border-[#e11d48] text-[#1A1A1A] shadow-sm" 
                        value={selectedProductId} 
                        onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                        <option value="">Escolha um item...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatBRL(p.amount_cents)})</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cliente (Opcional)</label>
                    <input placeholder="Nome completo do comprador" className="auth-input !bg-white border-gray-100 focus:border-[#e11d48] text-[#1A1A1A] shadow-sm placeholder:text-gray-300" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                </div>
                <button onClick={createFromProduct} disabled={loading || !selectedProductId} className="w-full h-14 rounded-full bg-[#e11d48] text-white text-xs font-black uppercase tracking-[0.15em] transition-all hover:bg-[#be123c] active:scale-[0.98] mt-6 shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:active:scale-100">
                  {loading ? "Processando..." : "Gerar cobrança"}
                </button>
              </div>
            ) : (
              <form onSubmit={createCustom} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Valor</label>
                    <input placeholder="R$ 0,00" className="auth-input text-3xl font-bold tracking-tighter !bg-white border-gray-100 focus:border-[#e11d48] text-[#e11d48] shadow-sm placeholder:text-gray-100" value={amountStr} onChange={(e) => setAmountStr(maskBRLInput(e.target.value))} required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Serviço / Produto</label>
                    <input placeholder="Ex: Consultoria de Marketing" className="auth-input !bg-white border-gray-100 focus:border-[#e11d48] text-[#1A1A1A] shadow-sm placeholder:text-gray-300" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cliente (Opcional)</label>
                    <input placeholder="Nome do cliente" className="auth-input !bg-white border-gray-100 focus:border-[#e11d48] text-[#1A1A1A] shadow-sm placeholder:text-gray-300" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                </div>
                <button type="submit" disabled={loading} className="w-full h-14 rounded-full bg-[#e11d48] text-white text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:bg-[#be123c] active:scale-[0.98] mt-6 shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:active:scale-100">
                  {loading ? "Processando..." : "Gerar link PIX"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
e}
        />
      )}
    </>
  );
}

// --- Original Modal Components (Simplified/Adapted) ---

type FlowStep = "choose" | "product" | "custom" | "share";

function CreateChargeFlowModal({
  onClose,
  onCreated,
  createdCharge,
}: {
  onClose: () => void;
  onCreated: (c: Charge) => void;
  createdCharge: Charge | null;
}) {
  const { profile } = useAuth();
  const [step, setStep] = useState<FlowStep>("choose");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [localCharge, setLocalCharge] = useState<Charge | null>(createdCharge);
  const [amountStr, setAmountStr] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [copied, setCopied] = useState(false);
  
  const receiptRef = useRef<HTMLDivElement>(null);

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
      const channel = supabase
        .channel(`modal_charge_realtime_${localCharge.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'charges',
          filter: `id=eq.${localCharge.id}`,
        }, (payload) => {
          const updated = payload.new as Charge;
          if (updated.status === 'paid') {
            setLocalCharge(updated);
          }
        })
        .subscribe();

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
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocorreu um erro ao gerar a cobrança.");
    } finally {
      setLoading(false);
    }
  }

  async function createCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.slug) return;
    const cents = parseBRLToCents(amountStr);
    setLoading(true);
    try {
      const charge = await api.createCharge({
        profile_id: profile.id,
        slug: profile.slug,
        amount_cents: cents,
        service_name: sanitizeText(serviceName, 60),
        description: null,
        payer_name: sanitizeText(payerName, 80) || null,
        payer_cpf: profile.cpf || "00000000000",
        payer_email: profile.email || "",
        notes: null,
      });
      onCreated(charge);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocorreu um erro ao gerar a cobrança avulsa.");
    } finally {
      setLoading(false);
    }
  }

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { backgroundColor: "#ffffff", scale: 2 });
    const link = document.createElement("a");
    link.download = `venda-${localCharge!.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full overflow-y-auto max-h-[90vh] md:max-h-none rounded-[2rem] md:rounded-[2.5rem] shadow-[0_40px_120px_rgba(136,19,55,0.15)] transition-all duration-500 ${step === "share" ? "max-w-4xl bg-white md:bg-transparent" : "max-w-xl bg-white"}`}>
        {step !== "share" && (
          <div className="absolute top-6 right-6 z-10">
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f2] text-[#881337] hover:bg-[#ffe4e6] hover:scale-105 transition-all">
              <X size={18} weight="bold" />
            </button>
          </div>
        )}

        {step === "share" ? (
          <div className="flex flex-col md:flex-row w-full h-full md:min-h-[560px]">
            {/* Left Column - Deep Red Brand Gradient */}
            <div className="relative w-full md:w-[45%] bg-gradient-to-br from-[#881337] to-[#e11d48] p-4 md:p-10 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                  Cobrança Pronta
                </span>
                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                  <X size={14} weight="bold" />
                </button>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl md:text-5xl font-bold tracking-tighter text-white mb-0.5 md:mb-2">
                  {formatBRL(localCharge!.amount_cents)}
                </h2>
                <p className="text-[10px] md:text-sm text-white/80 font-medium mb-3 md:mb-10">
                  {localCharge!.service_name || "Cobrança avulsa"}
                </p>

                <div className="rounded-2xl bg-white/10 border border-white/5 p-3 md:p-5">
                  <div className="flex items-center gap-3 mb-3 md:mb-6">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl md:rounded-2xl bg-white font-black text-[#e11d48] text-sm md:text-lg">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        profile?.full_name?.slice(0, 2).toUpperCase() || "CL"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-base font-bold text-white truncate">
                        {profile?.full_name || "Nome da Loja"}
                      </p>
                      <p className="text-[9px] md:text-xs text-white/60 truncate">
                        cloudepay.com.br/{profile?.slug || "loja"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg md:rounded-xl bg-white/5 p-2 md:p-4">
                      <p className="text-[8px] md:text-[10px] font-bold text-white/60 mb-0.5">Taxa CloudePay</p>
                      <p className="text-xs font-bold text-white">2%</p>
                    </div>
                    <div className="rounded-lg md:rounded-xl bg-white/5 p-2 md:p-4">
                      <p className="text-[8px] md:text-[10px] font-bold text-white/60 mb-0.5">Expiração</p>
                      <p className="text-xs font-bold text-white">15 min</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                  onClick={() => window.open(checkoutUrl, '_blank')}
                  className="mt-6 md:mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-[#881337] hover:bg-zinc-100 transition-all shadow-lg active:scale-[0.98]"
              >
                  Abrir página de pagamento <ArrowIcon />
              </button>
            </div>

            {/* Right Column - White Background */}
            <div className="relative w-full md:w-[55%] bg-white p-4 md:p-10 flex flex-col items-center justify-center">
              <div className="w-full max-w-[320px] flex flex-col items-center">
                {localCharge?.status === "paid" ? (
                    <div className="w-full flex flex-col items-center">
                      <div ref={receiptRef} className="w-full rounded-[2rem] border border-[#fecdd3] bg-white p-8 text-center shadow-lg relative overflow-hidden mb-8">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-6">
                              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#881337]/70">Venda Confirmada</p>
                          <h2 className="mt-3 text-4xl font-bold tracking-tighter text-[#4c0519]">{formatBRL(localCharge.amount_cents)}</h2>
                          <div className="mt-8 space-y-3 text-left">
                              <div className="flex justify-between border-b border-[#fecdd3]/50 pb-3">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#881337]/70">Cliente</span>
                                  <span className="text-[#4c0519] font-bold text-[11px] truncate max-w-[120px]">{localCharge.payer_name || "Cliente Final"}</span>
                              </div>
                              <div className="flex justify-between border-b border-[#fecdd3]/50 pb-3">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#881337]/70">Data</span>
                                  <span className="text-[#4c0519] font-bold text-[11px]">{new Date().toLocaleDateString('pt-BR')}</span>
                              </div>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 w-full">
                          <button onClick={downloadReceipt} className="h-14 rounded-full bg-[#e11d48] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#be123c] transition-all shadow-md">Baixar IMG</button>
                          <button onClick={() => window.print()} className="h-14 rounded-full border border-[#fecdd3] bg-white text-[#881337] text-[11px] font-black uppercase tracking-widest hover:bg-[#fff1f2] transition-all">Imprimir</button>
                      </div>
                    </div>
                ) : (
                  <>
                    <div className="mb-3 md:mb-6 rounded-[1.5rem] md:rounded-[2rem] border border-[#fecdd3] p-2 md:p-4 shadow-sm bg-white">
                        {(localCharge?.qr_code_image || localCharge?.pix_code) ? (
                            localCharge?.qr_code_image ? (
                                <img src={localCharge.qr_code_image} alt="QR Code" className="h-28 w-28 md:h-48 md:w-48 object-contain" />
                            ) : (
                                <div className="h-28 w-28 md:h-48 md:w-48 flex items-center justify-center text-[#fecdd3]">
                                    <PanelIcon className="h-6 w-6 md:h-10 md:w-10 animate-pulse" />
                                </div>
                            )
                        ) : (
                            <div className="h-28 w-28 md:h-48 md:w-48 animate-pulse bg-zinc-100 rounded-2xl" />
                        )}
                    </div>

                    <p className="text-center text-[10px] md:text-[11px] font-medium leading-relaxed text-[#881337] mb-4 md:mb-8">
                        QR Code PIX gerado.
                    </p>

                <div className="w-full flex items-center gap-2 rounded-xl border border-[#fecdd3] bg-white p-1 md:p-1.5 pl-3 md:pl-4 mb-3 md:mb-8">
                  <span className="flex-1 truncate text-[9px] md:text-xs font-medium text-[#881337]/70">
                    {checkoutUrl.replace('https://', '')}
                  </span>
                  <button onClick={copyLink} className={`rounded-lg px-4 md:px-6 py-2 md:py-3 text-[9px] md:text-xs font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-[#e11d48] text-white hover:bg-[#be123c]'}`}>
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <div className="w-full">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#881337]/70 mb-3 text-center">
                    Compartilhar
                  </p>
                  <div className="grid grid-cols-5 gap-2 md:gap-3">
                    {[
                      { icon: <WhatsappLogo size={18} weight="bold" />, label: 'WhatsApp' },
                      { icon: <InstagramLogo size={18} weight="bold" />, label: 'Instagram' },
                      { icon: <TiktokLogo size={18} weight="bold" />, label: 'TikTok' },
                      { icon: <ShareNetwork size={18} weight="bold" />, label: 'Kwai' },
                      { icon: <TelegramLogo size={18} weight="bold" />, label: 'Telegram' },
                    ].map((app) => (
                      <button key={app.label} className="flex flex-col items-center group">
                        <div className="h-9 w-9 flex items-center justify-center rounded-xl border border-[#fecdd3] bg-white transition-all group-hover:bg-[#fff1f2] group-active:scale-95 text-[#e11d48]">
                          {app.icon}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10">
            <h2 className="text-3xl font-bold tracking-tighter text-[#4c0519] mb-2">Criar nova cobrança</h2>
            <p className="text-sm text-[#881337]/70 mb-8 font-medium">Defina os detalhes para gerar seu link de pagamento.</p>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#fff1f2] p-1.5 mb-8">
              <button 
                onClick={() => setStep("product")} 
                className={`rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${step === "product" ? "bg-white text-[#e11d48] shadow-sm scale-[1.02]" : "text-[#881337]/60 hover:text-[#e11d48]"}`}
              >
                Produtos
              </button>
              <button 
                onClick={() => setStep("custom")} 
                className={`rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${step === "custom" || step === "choose" ? "bg-white text-[#e11d48] shadow-sm scale-[1.02]" : "text-[#881337]/60 hover:text-[#e11d48]"}`}
              >
                Avulsa
              </button>
            </div>

            {step === "product" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#881337]/70 ml-1">Selecionar Produto</label>
                    <select 
                        className="auth-input !bg-white border-[#fecdd3] focus:border-[#e11d48] text-[#4c0519] shadow-sm" 
                        value={selectedProductId} 
                        onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                        <option value="">Escolha um item...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatBRL(p.amount_cents)})</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#881337]/70 ml-1">Cliente (Opcional)</label>
                    <input placeholder="Nome completo do comprador" className="auth-input !bg-white border-[#fecdd3] focus:border-[#e11d48] text-[#4c0519] shadow-sm placeholder:text-[#881337]/30" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                </div>
                <button onClick={createFromProduct} disabled={loading || !selectedProductId} className="w-full h-14 rounded-full bg-gradient-to-r from-[#881337] to-[#e11d48] text-white text-xs font-black uppercase tracking-[0.15em] transition-all hover:opacity-90 active:scale-[0.98] mt-6 shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:active:scale-100">
                  {loading ? "Processando..." : "Gerar cobrança"}
                </button>
              </div>
            ) : (
              <form onSubmit={createCustom} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#881337]/70 ml-1">Valor</label>
                    <input placeholder="R$ 0,00" className="auth-input text-3xl font-bold tracking-tighter !bg-white border-[#fecdd3] focus:border-[#e11d48] text-[#e11d48] shadow-sm placeholder:text-[#fecdd3]" value={amountStr} onChange={(e) => setAmountStr(maskBRLInput(e.target.value))} required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#881337]/70 ml-1">Serviço / Produto</label>
                    <input placeholder="Ex: Consultoria de Marketing" className="auth-input !bg-white border-[#fecdd3] focus:border-[#e11d48] text-[#4c0519] shadow-sm placeholder:text-[#881337]/30" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#881337]/70 ml-1">Cliente (Opcional)</label>
                    <input placeholder="Nome do cliente" className="auth-input !bg-white border-[#fecdd3] focus:border-[#e11d48] text-[#4c0519] shadow-sm placeholder:text-[#881337]/30" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                </div>
                <button type="submit" disabled={loading} className="w-full h-14 rounded-full bg-gradient-to-r from-[#881337] to-[#e11d48] text-white text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:opacity-90 active:scale-[0.98] mt-6 shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:active:scale-100">
                  {loading ? "Processando..." : "Gerar link PIX"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
