import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { Charge } from "../lib/api";
import { supabase } from "../lib/supabase";
import { formatBRL, formatDateTime, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { 
  X, 
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  TrendUp,
  Receipt,
  Users,
  DotsThreeVertical,
  CheckCircle,
  Clock,
  WarningCircle
} from "phosphor-react";
import { 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

import QRCode from "qrcode";

type PeriodFilter = "today" | "month" | "30days" | "90days" | "all";

export default function Dashboard() {
  const { profile } = useAuth();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [stats, setStats] = useState({ monthNet: 0, monthGross: 0, totalNet: 0, totalGross: 0 });
  const [filter] = useState<"all" | "paid" | "pending" | "cancelled">("all");
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [search, setSearch] = useState("");
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
    const channel = supabase
      .channel('dashboard_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'charges',
        filter: `profile_id=eq.${profile.id}`,
      }, () => reload())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [reload, profile?.id]);

  const filteredCharges = useMemo(() => {
    let list = charges;
    if (filter === "paid") list = list.filter(c => c.status === "paid");
    if (filter === "pending") list = list.filter(c => c.status === "pending");
    if (filter === "cancelled") list = list.filter(c => c.status === "expired");
    
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => 
        c.service_name.toLowerCase().includes(s) || 
        c.payer_name?.toLowerCase().includes(s)
      );
    }

    const now = new Date();
    if (period === "today") {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      list = list.filter(c => new Date(c.created_at) >= todayStart);
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      list = list.filter(c => new Date(c.created_at) >= startOfMonth);
    }
    return list;
  }, [charges, filter, period, search]);

  const paidCharges = charges.filter((c) => c.status === "paid");
  const avgTicket = paidCharges.length > 0 ? stats.totalGross / paidCharges.length : 0;

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        name: date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
        raw: date.toLocaleDateString('pt-BR'),
        vendas: 0,
      };
    });
    charges.forEach(c => {
      if (c.status !== 'paid') return;
      const d = new Date(c.paid_at || c.created_at).toLocaleDateString('pt-BR');
      const dayData = days.find(day => day.raw === d);
      if (dayData) dayData.vendas += c.amount_cents / 100;
    });
    return days;
  }, [charges]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A]">Visão Geral</h1>
           <p className="text-sm font-bold text-gray-400">Acompanhe seu desempenho em tempo real</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl">
           {(["today", "month", "all"] as const).map((p) => (
             <button
               key={p}
               onClick={() => setPeriod(p)}
               className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${period === p ? "bg-white text-[#e11d48] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
             >
               {p === "today" ? "Hoje" : p === "month" ? "Mês" : "Total"}
             </button>
           ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="group relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 p-8 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-rose-50 text-[#e11d48]">
                  <TrendUp size={20} weight="bold" />
               </div>
               <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Vendas Brutas</p>
            <h3 className="text-4xl font-black tracking-tighter text-[#1A1A1A] mt-1">
               {formatBRL(period === "month" ? stats.monthGross : stats.totalGross)}
            </h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e11d48]/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
         </div>

         <div className="group relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 p-8 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-rose-50 text-[#e11d48]">
                  <Receipt size={20} weight="bold" />
               </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Transações</p>
            <h3 className="text-4xl font-black tracking-tighter text-[#1A1A1A] mt-1">{filteredCharges.length}</h3>
         </div>

         <div className="group relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 p-8 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-rose-50 text-[#e11d48]">
                  <Users size={20} weight="bold" />
               </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Ticket Médio</p>
            <h3 className="text-4xl font-black tracking-tighter text-[#1A1A1A] mt-1">{formatBRL(avgTicket)}</h3>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chart & Methods */}
        <div className="lg:col-span-8 space-y-6">
           <div className="rounded-[2rem] bg-white border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Faturamento Semanal</h4>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-[#e11d48]" />
                       <span className="text-[10px] font-bold text-gray-400">Vendas (R$)</span>
                    </div>
                 </div>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#9CA3AF' }} dy={10} />
                       <Tooltip 
                          contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', padding: '12px' }}
                          labelStyle={{ fontWeight: 800, color: '#1A1A1A', marginBottom: '4px' }}
                       />
                       <Area type="monotone" dataKey="vendas" stroke="#e11d48" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" animationDuration={1500} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* History Table */}
           <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Vendas Recentes</h4>
                    <p className="text-[11px] font-bold text-gray-300 mt-0.5">Últimas atualizações via PIX</p>
                 </div>
                 <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                       placeholder="Buscar..." 
                       className="bg-gray-50/50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold w-full md:w-64 focus:ring-2 focus:ring-[#e11d48]/10" 
                       value={search}
                       onChange={e => setSearch(e.target.value)}
                    />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead className="bg-gray-50/30">
                       <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                          <th className="px-8 py-4">Cliente / Serviço</th>
                          <th className="px-8 py-4">Status</th>
                          <th className="px-8 py-4">Data</th>
                          <th className="px-8 py-4 text-right">Valor</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {filteredCharges.slice(0, 8).map(c => (
                          <tr key={c.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="h-9 w-9 rounded-xl bg-[#fff1f2] text-[#e11d48] flex items-center justify-center text-[10px] font-black">
                                      {c.payer_name?.slice(0, 2).toUpperCase() || "CF"}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-[#1A1A1A]">{c.service_name}</p>
                                      <p className="text-[10px] font-bold text-gray-400">{c.payer_name || "Cliente Final"}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                   c.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                                   c.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                                }`}>
                                   {c.status === 'paid' ? <CheckCircle size={12} weight="bold" /> : c.status === 'pending' ? <Clock size={12} weight="bold" /> : <WarningCircle size={12} weight="bold" />}
                                   {c.status === 'paid' ? 'Pago' : c.status === 'pending' ? 'Pendente' : 'Expirado'}
                                </div>
                             </td>
                             <td className="px-8 py-5 text-[11px] font-bold text-gray-400">{formatDateTime(c.created_at)}</td>
                             <td className="px-8 py-5 text-right">
                                <span className="text-sm font-black text-[#1A1A1A]">{formatBRL(c.amount_cents)}</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {filteredCharges.length === 0 && (
                   <div className="py-12 text-center text-gray-300 text-xs font-bold">Nenhuma venda encontrada</div>
                 )}
              </div>
           </div>
        </div>

        {/* Right Column: Methods & Calendar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="rounded-[2rem] bg-white border border-gray-100 p-8 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Métodos de Pagamento</h4>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#e11d48] shadow-sm">
                          <Receipt size={20} weight="bold" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-[#1A1A1A]">Pix</p>
                          <p className="text-[10px] font-bold text-gray-400">Confirmação instantânea</p>
                       </div>
                    </div>
                    <span className="text-xs font-black text-[#e11d48]">100%</span>
                 </div>
                 <div className="pt-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                       <span>Taxa de Conversão</span>
                       <span>98.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                       <div className="h-full bg-[#e11d48] rounded-full" style={{ width: '98.2%' }} />
                    </div>
                 </div>
              </div>
           </div>

           <div className="rounded-[2rem] bg-white border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Atividade Mensal</h4>
                 <button className="text-gray-300 hover:text-gray-500"><DotsThreeVertical size={20} weight="bold" /></button>
              </div>
              
              <div className="flex items-center justify-center py-4">
                 <div className="relative h-44 w-44">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={[
                                { name: 'Pago', value: charges.filter(c => c.status === 'paid').length, color: '#e11d48' },
                                { name: 'Pendente', value: charges.filter(c => c.status === 'pending').length, color: '#fca5a5' },
                                { name: 'Outros', value: charges.filter(c => c.status === 'expired').length, color: '#f3f4f6' },
                             ]}
                             cx="50%" cy="50%" innerRadius={55} outerRadius={70} paddingAngle={8} dataKey="value"
                          >
                             <Cell fill="#e11d48" stroke="none" />
                             <Cell fill="#fda4af" stroke="none" />
                             <Cell fill="#f3f4f6" stroke="none" />
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black text-[#1A1A1A] tracking-tighter">{paidCharges.length}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Vendas</span>
                    </div>
                 </div>
              </div>
              
              <div className="mt-6 space-y-3">
                 <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-[#e11d48]" />
                       <span className="text-gray-500">Pagos</span>
                    </div>
                    <span className="text-[#1A1A1A]">{charges.filter(c => c.status === 'paid').length}</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-rose-200" />
                       <span className="text-gray-500">Pendentes</span>
                    </div>
                    <span className="text-[#1A1A1A]">{charges.filter(c => c.status === 'pending').length}</span>
                 </div>
              </div>
           </div>

           <div className="rounded-[2rem] bg-white border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Calendário</h4>
                 <div className="flex items-center gap-2">
                    <button className="text-gray-300 hover:text-gray-500"><CaretLeft size={16} weight="bold" /></button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Mai 26</span>
                    <button className="text-gray-300 hover:text-gray-500"><CaretRight size={16} weight="bold" /></button>
                 </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                 {['D','S','T','Q','Q','S','S'].map(d => <div key={d} className="text-[10px] font-black text-gray-300 py-1">{d}</div>)}
                 {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className={`aspect-square flex items-center justify-center text-[10px] font-black rounded-lg transition-all cursor-pointer ${i === 14 ? 'bg-[#e11d48] text-white shadow-lg shadow-rose-200' : 'text-gray-500 hover:bg-gray-50'}`}>
                       {i + 1}
                    </div>
                 ))}
              </div>
           </div>
        </div>
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

// --- CreateChargeFlowModal Implementation ---
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
      QRCode.toDataURL(localCharge.pix_code, { margin: 1, width: 600, color: { dark: "#000000", light: "#ffffff" } }).then(setGeneratedQr);
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
      const channel = supabase.channel(`modal_${localCharge.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'charges', filter: `id=eq.${localCharge.id}` }, (payload) => {
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl transition-all duration-500 ${step === "share" ? "max-w-4xl" : "max-w-xl"}`}>
        <button onClick={onClose} className="absolute top-6 right-6 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 transition-all">
          <X size={20} weight="bold" />
        </button>

        {step === "share" ? (
          <div className="flex flex-col md:flex-row h-full">
            {/* Design do Modal de Compartilhamento (Reduzido para brevidade mas elegante) */}
            <div className="md:w-[45%] bg-[#e11d48] p-10 text-white">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Cobrança Gerada</span>
               <h2 className="text-5xl font-black tracking-tighter mt-2">{formatBRL(localCharge!.amount_cents)}</h2>
               <p className="text-sm font-bold opacity-80 mt-1">{localCharge!.service_name}</p>
               <div className="mt-12 p-6 rounded-3xl bg-white/10 border border-white/10">
                  <div className="flex items-center gap-3">
                     <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#e11d48] font-black">
                        {profile?.full_name?.slice(0, 2).toUpperCase()}
                     </div>
                     <div>
                        <p className="text-sm font-black">{profile?.full_name}</p>
                        <p className="text-[10px] font-bold opacity-60">cloudepay.com.br/{profile?.slug}</p>
                     </div>
                  </div>
               </div>
               <button onClick={() => window.open(checkoutUrl, '_blank')} className="w-full mt-12 py-4 bg-white text-[#e11d48] rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Abrir Link</button>
            </div>
            <div className="md:w-[55%] p-10 flex flex-col items-center justify-center">
               <div className="p-4 border border-gray-100 rounded-3xl bg-white shadow-sm mb-6">
                  <img src={localCharge?.qr_code_image || generatedQr} className="h-48 w-48 object-contain" />
               </div>
               <div className="w-full bg-gray-50 p-2 rounded-2xl flex items-center gap-2 pl-4">
                  <span className="flex-1 truncate text-xs font-bold text-gray-400">{checkoutUrl.replace('https://', '')}</span>
                  <button onClick={() => { navigator.clipboard.writeText(checkoutUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${copied ? 'bg-emerald-500' : 'bg-[#e11d48]'} text-white`}>
                     {copied ? 'Copiado' : 'Copiar'}
                  </button>
               </div>
            </div>
          </div>
        ) : (
          <div className="p-10">
             <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">Nova Cobrança</h3>
             <p className="text-sm font-bold text-gray-400 mb-8">Selecione o tipo de venda</p>
             <div className="grid grid-cols-2 gap-3 bg-gray-50 p-1.5 rounded-2xl mb-8">
                <button onClick={() => setStep("product")} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step === "product" ? "bg-white text-[#e11d48] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>Produtos</button>
                <button onClick={() => setStep("custom")} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step === "custom" || step === "choose" ? "bg-white text-[#e11d48] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>Avulsa</button>
             </div>

             {step === "product" ? (
                <div className="space-y-4">
                   <select className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-[#e11d48]/10" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                      <option value="">Escolha um produto...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} - {formatBRL(p.amount_cents)}</option>)}
                   </select>
                   <input placeholder="Nome do cliente (opcional)" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-[#e11d48]/10" value={payerName} onChange={e => setPayerName(e.target.value)} />
                   <button onClick={createFromProduct} disabled={loading || !selectedProductId} className="w-full py-4 bg-[#e11d48] text-white rounded-full text-xs font-black uppercase tracking-widest mt-4 shadow-lg shadow-rose-200">Gerar Cobrança</button>
                </div>
             ) : (
                <form onSubmit={createCustom} className="space-y-4">
                   <input placeholder="R$ 0,00" className="w-full bg-gray-50 border-none rounded-2xl py-6 px-6 text-4xl font-black tracking-tighter text-[#e11d48] focus:ring-0" value={amountStr} onChange={e => setAmountStr(maskBRLInput(e.target.value))} required />
                   <input placeholder="Descrição do serviço" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-[#e11d48]/10" value={serviceName} onChange={e => setServiceName(e.target.value)} required />
                   <input placeholder="Nome do cliente (opcional)" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-[#e11d48]/10" value={payerName} onChange={e => setPayerName(e.target.value)} />
                   <button type="submit" disabled={loading} className="w-full py-4 bg-[#e11d48] text-white rounded-full text-xs font-black uppercase tracking-widest mt-4 shadow-lg shadow-rose-200">Gerar Link PIX</button>
                </form>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
