import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { Charge } from "../lib/api";
import { supabase } from "../lib/supabase";
import { formatBRL, formatDateTime, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { 
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  TrendUp,
  Receipt,
  Users,
  DotsThreeVertical,
  X,
  Clock,
  CheckCircle,
  WhatsappLogo,
  InstagramLogo,
  TiktokLogo,
  TelegramLogo,
  ShareNetwork
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

type PeriodFilter = "today" | "month" | "all";

export default function Dashboard() {
  const { profile } = useAuth();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [stats, setStats] = useState({ monthNet: 0, monthGross: 0, totalNet: 0, totalGross: 0 });
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
    const handleOpenCreate = () => {
       setCreatedCharge(null);
       setShowCreateModal(true);
    };
    window.addEventListener("open-create-charge", handleOpenCreate);
    const channel = supabase.channel('dash_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'charges', filter: `profile_id=eq.${profile.id}` }, () => reload()).subscribe();
    return () => { 
      window.removeEventListener("open-create-charge", handleOpenCreate);
      supabase.removeChannel(channel); 
    };
  }, [reload, profile?.id]);

  const filteredCharges = useMemo(() => {
    let list = charges;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => c.service_name.toLowerCase().includes(s) || c.payer_name?.toLowerCase().includes(s));
    }
    return list;
  }, [charges, search]);

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
      if (c.status === 'paid') {
        const d = new Date(c.paid_at || c.created_at).toLocaleDateString('pt-BR');
        const dayData = days.find(day => day.raw === d);
        if (dayData) dayData.vendas += c.amount_cents / 100;
      }
    });
    return days;
  }, [charges]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
         {[
           { label: "Vendas Totais", value: formatBRL(period === "month" ? stats.monthGross : stats.totalGross), icon: TrendUp, trend: "+12%" },
           { label: "Transações", value: charges.length.toString(), icon: Receipt, trend: "+5%" },
           { label: "Ticket Médio", value: formatBRL(charges.length > 0 ? stats.totalGross / charges.length : 0), icon: Users, trend: "Stable" }
         ].map((card, i) => (
           <div key={i} className="group relative rounded-[2.5rem] bg-white border border-gray-100 p-10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                 <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-rose-50 text-[#e11d48] group-hover:scale-110 transition-transform">
                    <card.icon size={24} weight="bold" />
                 </div>
                 <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{card.trend}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">{card.label}</p>
              <h3 className="text-4xl font-black tracking-tighter text-[#1A1A1A] mt-1">{card.value}</h3>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section: Chart and History */}
        <div className="lg:col-span-8 space-y-8">
           
           <div className="rounded-[3rem] bg-white border border-gray-100 p-10 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Performance Financeira</h4>
                 <div className="flex gap-2">
                    {[
                      { id: "today", label: "Hoje" },
                      { id: "month", label: "Mês" },
                      { id: "all", label: "Total" }
                    ].map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => setPeriod(t.id as PeriodFilter)}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${period === t.id ? "bg-[#e11d48] text-white shadow-lg" : "text-gray-300 hover:text-gray-500"}`}
                      >
                        {t.label}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#e11d48" stopOpacity={0.12}/>
                             <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F8F9FA" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#CBD5E1' }} dy={10} />
                       <Tooltip 
                          contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.06)', padding: '16px' }}
                          labelStyle={{ fontWeight: 900, fontSize: '12px', color: '#1A1A1A', marginBottom: '4px' }}
                       />
                       <Area type="monotone" dataKey="vendas" stroke="#e11d48" strokeWidth={5} fillOpacity={1} fill="url(#areaGrad)" animationDuration={2000} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="rounded-[3rem] bg-white border border-gray-100 shadow-sm overflow-hidden p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                 <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Histórico de Cobranças</h4>
                    <p className="text-xs font-bold text-gray-300 mt-1">Total de {filteredCharges.length} registros encontrados</p>
                 </div>
                 <div className="relative w-full md:w-72">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                       placeholder="Procurar transação..." 
                       className="w-full bg-gray-50/50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-[#e11d48]/10 transition-all"
                       value={search}
                       onChange={e => setSearch(e.target.value)}
                    />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 border-b border-gray-50">
                          <th className="pb-6">Cliente & Item</th>
                          <th className="pb-6">Status</th>
                          <th className="pb-6 text-right">Líquido</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {filteredCharges.slice(0, 10).map(c => (
                          <tr key={c.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                             <td className="py-6">
                                <div className="flex items-center gap-4">
                                   <div className="h-11 w-11 rounded-2xl bg-[#FFF1F2] text-[#e11d48] flex items-center justify-center text-xs font-black group-hover:scale-105 transition-transform">
                                      {c.payer_name?.slice(0, 2).toUpperCase() || "CF"}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-[#1A1A1A]">{c.service_name}</p>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDateTime(c.created_at)}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="py-6">
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                   c.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                   {c.status === 'paid' ? <CheckCircle size={14} weight="bold" /> : <Clock size={14} weight="bold" />}
                                   {c.status === 'paid' ? 'Pago' : 'Pendente'}
                                </div>
                             </td>
                             <td className="py-6 text-right font-black text-[#1A1A1A] text-sm">
                                {formatBRL(c.net_amount_cents)}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {filteredCharges.length === 0 && <div className="py-20 text-center text-gray-300 text-xs font-black uppercase tracking-widest">Nenhuma transação localizada</div>}
              </div>
           </div>
        </div>

        {/* Right Section: Stats & Calendar */}
        <div className="lg:col-span-4 space-y-8">
           
           <div className="rounded-[3rem] bg-white border border-gray-100 p-10 shadow-sm">
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 mb-8">Método Pix</h4>
              <div className="p-8 rounded-[2rem] bg-gray-50 flex flex-col items-center text-center">
                 <div className="h-16 w-16 rounded-[1.5rem] bg-white flex items-center justify-center text-[#e11d48] shadow-lg mb-4">
                    <Receipt size={32} weight="bold" />
                 </div>
                 <p className="text-base font-black text-[#1A1A1A]">Pix Ativo</p>
                 <p className="text-xs font-bold text-gray-400 mt-1">Taxas reduzidas de 1% já aplicadas.</p>
                 <div className="w-full mt-8">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                       <span>Conversão</span>
                       <span className="text-[#e11d48]">99.8%</span>
                    </div>
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                       <div className="h-full bg-[#e11d48] rounded-full" style={{ width: '99.8%' }} />
                    </div>
                 </div>
              </div>
           </div>

           <div className="rounded-[3rem] bg-white border border-gray-100 p-10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Atividade Global</h4>
                 <DotsThreeVertical size={24} className="text-gray-300 cursor-pointer" />
              </div>
              <div className="flex flex-col items-center">
                 <div className="relative h-56 w-56 mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={[
                                { name: 'Paid', value: charges.filter(c => c.status === 'paid').length },
                                { name: 'Pend', value: charges.filter(c => c.status === 'pending').length },
                             ]}
                             cx="50%" cy="50%" innerRadius={75} outerRadius={95} paddingAngle={8} dataKey="value"
                          >
                             <Cell fill="#e11d48" stroke="none" />
                             <Cell fill="#F1F5F9" stroke="none" />
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-4xl font-black text-[#1A1A1A] tracking-tighter">{charges.length}</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Vendas</span>
                    </div>
                 </div>
                 <div className="w-full space-y-4">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-gray-400 uppercase tracking-widest">Pagas</span>
                       <span className="text-[#1A1A1A] font-black">{charges.filter(c => c.status === 'paid').length}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-gray-400 uppercase tracking-widest">Abertas</span>
                       <span className="text-[#1A1A1A] font-black">{charges.filter(c => c.status === 'pending').length}</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="rounded-[3rem] bg-white border border-gray-100 p-10 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Agenda</h4>
                 <div className="flex items-center gap-3">
                    <CaretLeft size={20} className="text-gray-300 cursor-pointer hover:text-[#e11d48] transition-colors" />
                    <span className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest">MAIO 26</span>
                    <CaretRight size={20} className="text-gray-300 cursor-pointer hover:text-[#e11d48] transition-colors" />
                 </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                 {['D','S','T','Q','Q','S','S'].map(d => <div key={d} className="text-[10px] font-black text-gray-200 text-center pb-2">{d}</div>)}
                 {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className={`aspect-square flex items-center justify-center text-[11px] font-black rounded-2xl cursor-pointer transition-all ${i === 14 ? 'bg-[#e11d48] text-white shadow-xl shadow-rose-200 scale-110' : 'text-gray-400 hover:bg-gray-50'}`}>
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

// --- FLOW MODAL ---
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
      <div className={`relative w-full max-h-[90vh] overflow-y-auto rounded-[3rem] bg-white shadow-2xl transition-all duration-500 ${step === "share" ? "max-w-4xl" : "max-w-xl"}`}>
        <button onClick={onClose} className="absolute top-8 right-8 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 transition-all">
          <X size={20} weight="bold" />
        </button>

        {step === "share" ? (
          <div className="flex flex-col md:flex-row h-full">
            <div className="md:w-[45%] bg-[#e11d48] p-12 text-white">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Pagamento Criado</span>
               <h2 className="text-5xl font-black tracking-tighter mt-4">{formatBRL(localCharge!.amount_cents)}</h2>
               <p className="text-sm font-bold opacity-80 mt-2">{localCharge!.service_name}</p>
               <div className="mt-12 p-8 rounded-[2rem] bg-white/10 border border-white/10">
                  <div className="flex items-center gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-[#e11d48] text-lg font-black">
                        {profile?.full_name?.slice(0, 2).toUpperCase()}
                     </div>
                     <div>
                        <p className="text-base font-black">{profile?.full_name}</p>
                        <p className="text-[11px] font-bold opacity-60">cloudepay.com.br/{profile?.slug}</p>
                     </div>
                  </div>
               </div>
               <button onClick={() => window.open(checkoutUrl, '_blank')} className="w-full mt-12 py-5 bg-white text-[#e11d48] rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl">Acessar Checkout</button>
            </div>
            <div className="md:w-[55%] p-12 flex flex-col items-center justify-center">
               <div className="p-4 border-2 border-gray-50 rounded-[2.5rem] bg-white shadow-xl mb-10">
                  <img src={localCharge?.qr_code_image || generatedQr} className="h-56 w-56 object-contain" />
               </div>
               <div className="w-full bg-gray-50 p-2 rounded-2xl flex items-center gap-2 pl-6">
                  <span className="flex-1 truncate text-xs font-bold text-gray-400">{checkoutUrl.replace('https://', '')}</span>
                  <button onClick={() => { navigator.clipboard.writeText(checkoutUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500' : 'bg-[#e11d48]'} text-white shadow-lg`}>
                     {copied ? 'Copiado' : 'Copiar'}
                  </button>
               </div>
               <div className="mt-10 w-full">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 text-center mb-6">Redes Sociais</p>
                  <div className="flex justify-center gap-4">
                     {[WhatsappLogo, InstagramLogo, TiktokLogo, TelegramLogo, ShareNetwork].map((Icon, i) => (
                        <div key={i} className="h-12 w-12 rounded-2xl border border-gray-100 flex items-center justify-center text-[#e11d48] hover:bg-rose-50 cursor-pointer transition-all">
                           <Icon size={20} weight="bold" />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="p-12">
             <h3 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">Nova Venda</h3>
             <p className="text-sm font-bold text-gray-400 mb-10">Escolha o formato de cobrança</p>
             <div className="grid grid-cols-2 gap-4 bg-gray-50 p-2 rounded-[1.5rem] mb-10">
                <button onClick={() => setStep("product")} className={`py-4 rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all ${step === "product" ? "bg-white text-[#e11d48] shadow-xl" : "text-gray-400"}`}>Catálogo</button>
                <button onClick={() => setStep("custom")} className={`py-4 rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all ${step === "custom" || step === "choose" ? "bg-white text-[#e11d48] shadow-xl" : "text-gray-400"}`}>Valor Avulso</button>
             </div>

             {step === "product" ? (
                <div className="space-y-6">
                   <select className="w-full bg-gray-50/50 border-none rounded-[1.5rem] py-5 px-8 text-sm font-bold focus:ring-2 focus:ring-[#e11d48]/10 transition-all" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                      <option value="">Selecione um produto...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} — {formatBRL(p.amount_cents)}</option>)}
                   </select>
                   <input placeholder="Identificação do cliente" className="w-full bg-gray-50/50 border-none rounded-[1.5rem] py-5 px-8 text-sm font-bold focus:ring-2 focus:ring-[#e11d48]/10 transition-all" value={payerName} onChange={e => setPayerName(e.target.value)} />
                   <button onClick={createFromProduct} disabled={loading || !selectedProductId} className="w-full py-5 bg-[#e11d48] text-white rounded-full text-xs font-black uppercase tracking-[0.2em] mt-6 shadow-2xl shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all">Criar Link de Pagamento</button>
                </div>
             ) : (
                <form onSubmit={createCustom} className="space-y-6">
                   <div className="bg-gray-50/50 rounded-[2rem] p-8 text-center border-2 border-transparent focus-within:border-[#e11d48]/10 transition-all">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Qual o valor?</p>
                      <input placeholder="R$ 0,00" className="w-full bg-transparent border-none text-center text-5xl font-black tracking-tighter text-[#e11d48] focus:ring-0 placeholder:text-rose-100" value={amountStr} onChange={e => setAmountStr(maskBRLInput(e.target.value))} required />
                   </div>
                   <input placeholder="Descrição da venda" className="w-full bg-gray-50/50 border-none rounded-[1.5rem] py-5 px-8 text-sm font-bold focus:ring-2 focus:ring-[#e11d48]/10 transition-all" value={serviceName} onChange={e => setServiceName(e.target.value)} required />
                   <input placeholder="Nome do cliente (opcional)" className="w-full bg-gray-50/50 border-none rounded-[1.5rem] py-5 px-8 text-sm font-bold focus:ring-2 focus:ring-[#e11d48]/10 transition-all" value={payerName} onChange={e => setPayerName(e.target.value)} />
                   <button type="submit" disabled={loading} className="w-full py-5 bg-[#e11d48] text-white rounded-full text-xs font-black uppercase tracking-[0.2em] mt-6 shadow-2xl shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all">Gerar Link PIX</button>
                </form>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
