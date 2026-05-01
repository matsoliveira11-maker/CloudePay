import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate as _useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { Charge } from "../lib/api";
import { supabase } from "../lib/supabase";
import { formatBRL, formatDateTime, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { X } from "phosphor-react";
import Shell from "../components/Shell";
import { MoneyIcon, ChargeIcon, FilterIcon, ArrowIcon, WhatsAppIcon, LinkIcon, PanelIcon } from "../components/Icons";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import { useRef } from "react";


// --- Logic ---


export default function Dashboard() {
  const { profile } = useAuth();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [stats, setStats] = useState({ monthNet: 0, monthGross: 0, totalNet: 0, totalGross: 0 });
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [period, setPeriod] = useState<"month" | "total">("month");
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
    // Realtime: atualiza instantaneamente quando pagamento é confirmado
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
    if (filter === "paid") list = list.filter(c => c.status === "paid");
    if (filter === "pending") list = list.filter(c => c.status === "pending");
    
    if (period === "month") {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      list = list.filter(c => new Date(c.paid_at || c.created_at) >= startOfMonth);
    }
    return list;
  }, [charges, filter, period]);

  const paidCharges = charges.filter((c) => c.status === "paid");
  const pendingCharges = charges.filter((c) => c.status === "pending");

  // Ticket médio: média do bruto de todas as cobranças pagas
  const avgTicket = paidCharges.length > 0 ? stats.totalGross / paidCharges.length : 0;

  // Valores para os cards (Se o mês estiver zerado, mostramos o total para não ficar vazio no início do mês)
  const isMonthEmpty = period === "month" && stats.monthNet === 0;
  
  const displayNet = isMonthEmpty ? stats.totalNet : (period === "month" ? stats.monthNet : stats.totalNet);
  const displayGross = isMonthEmpty ? stats.totalGross : (period === "month" ? stats.monthGross : stats.totalGross);
  
  const netLabel = isMonthEmpty ? "Saldo Total" : (period === "month" ? "Recebido no mês" : "Saldo Total");
  const netNote = isMonthEmpty ? "Líquido acumulado" : (period === "month" ? "Líquido real após taxa" : "Líquido acumulado");

  // Chart Logic (Simple approximation of inspiration chart)
  const chartDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });
  }, []);

  const chartValues = useMemo(() => {
    return chartDays.map(day => {
      const dayCharges = charges.filter(c => {
        const d = c.created_at ? new Date(c.created_at) : new Date();
        return !isNaN(d.getTime()) && d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === day;
      });
      return dayCharges.reduce((acc, curr) => acc + curr.amount_cents, 0) / 100;
    });
  }, [charges, chartDays]);

  const maxChartValue = Math.max(...chartValues, 1);

  return (
    <>
      <Shell>
      <div className="space-y-5 sm:space-y-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-base font-medium text-[#881337] sm:text-lg">Olá,</p>
                    <h1 className="text-4xl font-semibold leading-none tracking-[-0.07em] text-[#4c0519] sm:text-6xl">{profile?.full_name?.split(" ")[0]}</h1>
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#fecdd3] bg-white p-2 shadow-sm sm:flex sm:flex-wrap">
                    <button 
                      onClick={() => { setPeriod(period === "month" ? "total" : "month"); }}
                      className={`inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold sm:gap-2 sm:px-4 sm:text-sm transition ${period === "month" ? "bg-[#e11d48] text-white" : "text-[#881337] hover:bg-[#fff1f2]"}`}
                    >
                      <FilterIcon /> {period === "month" ? "Este mês" : "Todo período"}
                    </button>
                    <button 
                      onClick={() => setFilter("paid")}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm transition ${filter === "paid" ? "bg-[#e11d48] text-white" : "text-[#881337] hover:bg-[#fff1f2]"}`}
                    >
                      Pagas
                    </button>
                    <button 
                      onClick={() => setFilter("pending")}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm transition ${filter === "pending" ? "bg-[#e11d48] text-white" : "text-[#881337] hover:bg-[#fff1f2]"}`}
                    >
                      Pendentes
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                  {[
                    { label: netLabel, value: formatBRL(displayNet), note: netNote, Icon: MoneyIcon },
                    { label: "Total de cobranças", value: filteredCharges.length.toString(), note: `${filteredCharges.filter(c => c.status === 'pending').length} pendente(s)`, Icon: ChargeIcon },
                    { label: "Ticket médio", value: formatBRL(avgTicket), note: `${paidCharges.length} pagamento(s) confirmado(s)`, Icon: PanelIcon },
                  ].map(({ label, value, note, Icon }) => (
                    <section key={label} className="rounded-3xl border border-[#fecdd3] bg-white p-4 shadow-[0_14px_36px_rgba(136,19,55,0.06)] sm:p-5 sm:shadow-[0_18px_50px_rgba(136,19,55,0.07)]">
                      <div className="mb-4 flex items-center justify-between sm:mb-5">
                        <span className="text-sm font-semibold text-[#881337]">{label}</span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1f2] text-[#e11d48]"><Icon className="h-5 w-5" /></span>
                      </div>
                      <p className="text-3xl font-semibold tracking-[-0.06em] text-[#4c0519] sm:text-4xl">{value}</p>
                      <p className="mt-3 text-sm text-[#9f1239]">{note}</p>
                    </section>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                  <section className="rounded-3xl border border-[#fecdd3] bg-white p-4 shadow-[0_14px_36px_rgba(136,19,55,0.06)] sm:p-6 sm:shadow-[0_18px_50px_rgba(136,19,55,0.07)]">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold text-[#e11d48]"><ChargeIcon /> Nova cobrança</span>
                        <h2 className="mt-4 max-w-[420px] text-2xl font-semibold leading-tight tracking-[-0.055em] text-[#4c0519] sm:text-3xl">Gere um link PIX único para cada cliente.</h2>
                        <p className="mt-3 max-w-[520px] text-sm leading-6 text-[#881337]">Defina o valor, escolha produto cadastrado ou cobrança avulsa e compartilhe em segundos.</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                        <button onClick={openCreate} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#e11d48] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(225,29,72,0.25)] transition hover:-translate-y-0.5">
                        Criar cobrança <ArrowIcon />
                        </button>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-[#fecdd3] bg-[#4c0519] p-4 text-white shadow-[0_18px_50px_rgba(76,5,25,0.18)] sm:p-6 sm:shadow-[0_24px_70px_rgba(76,5,25,0.2)]">
                    <h2 className="text-xl font-semibold tracking-[-0.04em]">Resumo financeiro</h2>
                    <div className="mt-5 space-y-3">
                      {[
                        ["Total bruto recebido", formatBRL(displayGross)],
                        ["Pix pendente", formatBRL(pendingCharges.reduce((acc, curr) => acc + curr.amount_cents, 0))],
                        ["Taxa total (2%)", formatBRL(displayGross - displayNet)],
                        ["Saldo total (líquido)", formatBRL(displayNet)],
                      ].map(([label, value], index, arr) => (
                        <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                          <span className="text-sm text-white/75">{label}</span>
                          <span className={index === arr.length - 1 ? "font-semibold text-[#fb7185]" : "font-semibold text-white"}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                  <section className="rounded-3xl border border-[#fecdd3] bg-white p-4 shadow-[0_14px_36px_rgba(136,19,55,0.06)] sm:p-6 sm:shadow-[0_18px_50px_rgba(136,19,55,0.07)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#4c0519]">Desempenho (últimos 7 dias)</h2>
                        <p className="mt-1 text-sm text-[#881337]">{formatBRL(displayGross)} volume total recebido</p>
                      </div>
                    </div>
                    <div className="mt-6 flex h-44 items-end gap-1.5 rounded-2xl border border-[#ffe4e6] bg-[#fffafa] p-3 sm:mt-8 sm:h-56 sm:gap-2 sm:p-4">
                      {chartValues.map((value, index) => (
                        <div key={chartDays[index]} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                          <div className="mx-auto w-full max-w-10 rounded-t-2xl bg-gradient-to-t from-[#e11d48] to-[#fb7185]" style={{ height: `${(value / maxChartValue) * 100}%`, opacity: value ? 1 : 0.22 }} />
                          <span className="text-[10px] font-semibold text-[#9f1239] sm:text-[11px]">{chartDays[index]}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-[#fecdd3] bg-white p-4 shadow-[0_14px_36px_rgba(136,19,55,0.06)] sm:p-6 sm:shadow-[0_18px_50px_rgba(136,19,55,0.07)]">
                    <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#4c0519]">Distribuição por status</h2>
                    <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
                      {[
                        [paidCharges.length.toString(), 'Pago'],
                        [pendingCharges.length.toString(), 'Pendente'],
                        [charges.filter(c => c.status === 'expired').length.toString(), 'Cancelado']
                      ].map(([value, label], index) => (
                        <div key={label} className="rounded-2xl border border-[#fecdd3] bg-[#fffafa] p-3 text-center sm:p-4">
                          <p className={`text-2xl font-semibold tracking-[-0.05em] sm:text-3xl ${index === 0 ? 'text-[#e11d48]' : 'text-[#4c0519]'}`}>{value}</p>
                          <p className="mt-1 text-xs font-semibold text-[#881337]">{label}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="overflow-hidden rounded-3xl border border-[#fecdd3] bg-white shadow-[0_14px_36px_rgba(136,19,55,0.06)] sm:shadow-[0_18px_50px_rgba(136,19,55,0.07)]">
                  <div className="border-b border-[#fecdd3] p-4 sm:p-6">
                    <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#4c0519]">Histórico de cobranças</h2>
                    <p className="mt-2 text-sm text-[#881337]">Todas as cobranças criadas, pagas, pendentes ou expiradas.</p>
                  </div>
                  <div className="grid gap-3 p-4 md:hidden">
                    {charges.map((charge) => (
                      <article key={charge.id} className="rounded-2xl border border-[#fecdd3] bg-[#fffafa] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-[#4c0519]">{charge.service_name}</h3>
                            <p className="mt-1 text-xs leading-5 text-[#881337]">{formatDateTime(charge.created_at)} · {charge.payer_name || "Cliente Final"}</p>
                            <p className="mt-1 text-xs text-[#9f1239]">ID: {charge.gateway_id}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${charge.status === 'paid' ? 'bg-[#9EEA6C]/20 text-[#006400]' : 'bg-[#fff1f2] text-[#e11d48]'}`}>{charge.status === 'paid' ? 'Pago' : charge.status === 'pending' ? 'Pendente' : 'Cancelado'}</span>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="rounded-xl bg-white p-2"><p className="text-[#9f1239]">Bruto</p><p className="mt-1 font-semibold text-[#4c0519]">{formatBRL(charge.amount_cents)}</p></div>
                          <div className="rounded-xl bg-white p-2"><p className="text-[#9f1239]">Taxa</p><p className="mt-1 font-semibold text-[#881337]">{formatBRL(charge.fee_cents)}</p></div>
                          <div className="rounded-xl bg-white p-2"><p className="text-[#9f1239]">Líquido</p><p className="mt-1 font-semibold text-[#e11d48]">{formatBRL(charge.net_amount_cents)}</p></div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-[760px] w-full text-left text-sm">
                      <thead className="bg-[#fff5f5] text-xs uppercase tracking-[0.12em] text-[#9f1239]">
                        <tr><th className="px-5 py-4">Serviço / Cliente</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Bruto</th><th className="px-5 py-4">Taxa (2%)</th><th className="px-5 py-4">Líquido</th></tr>
                      </thead>
                      <tbody>
                        {charges.map((charge) => (
                          <tr key={charge.id} className="border-t border-[#fecdd3]">
                            <td className="px-5 py-5">
                              <p className="font-semibold text-[#4c0519]">{charge.service_name}</p>
                              <p className="mt-1 text-xs text-[#881337]">{formatDateTime(charge.created_at)} · {charge.payer_name || "Cliente Final"}</p>
                              <p className="mt-1 text-xs text-[#9f1239]">ID: {charge.gateway_id}</p>
                            </td>
                            <td className="px-5 py-5"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${charge.status === 'paid' ? 'bg-[#9EEA6C]/20 text-[#006400]' : 'bg-[#fff1f2] text-[#e11d48]'}`}>{charge.status === 'paid' ? 'Pago' : charge.status === 'pending' ? 'Pendente' : 'Cancelado'}</span></td>
                            <td className="px-5 py-5 font-semibold text-[#4c0519]">{formatBRL(charge.amount_cents)}</td>
                            <td className="px-5 py-5 text-[#9f1239]">{formatBRL(charge.fee_cents)}</td>
                            <td className="px-5 py-5 font-semibold text-[#e11d48]">{formatBRL(charge.net_amount_cents)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
    </Shell>



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
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalCharge(createdCharge);
  }, [createdCharge]);

  useEffect(() => {
    if (step === "share" && localCharge && localCharge.status === "pending") {
      intervalRef.current = window.setInterval(async () => {
        const c = await api.getCharge(localCharge.id);
        if (c && c.status === "paid") {
          setLocalCharge(c);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 5000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [step, localCharge?.id, localCharge?.status]);

  const [amountStr, setAmountStr] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [notes] = useState("");

  useEffect(() => {
    if (!profile) return;
    api.listProductsByProfile(profile.id).then(setProducts);
  }, [profile?.id]);

  useEffect(() => {
    if (createdCharge) {
      setStep("share");
    }
  }, [createdCharge]);

  const checkoutUrl = useMemo(() => {
    if (!createdCharge || !profile?.slug) return "";
    return `${window.location.origin}/${profile.slug}/${createdCharge.id}`;
  }, [createdCharge, profile?.slug]);

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
        notes: sanitizeText(notes, 100) || null,
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
    const cents = parseBRLToCents(amountStr);
    setLoading(true);
    try {
      const charge = await api.createCharge({
        profile_id: profile!.id,
        slug: profile!.slug!,
        amount_cents: cents,
        service_name: sanitizeText(serviceName, 60),
        description: null,
        payer_name: sanitizeText(payerName, 80) || null,
        payer_cpf: profile!.cpf || "00000000000",
        payer_email: profile!.email || "",
        notes: sanitizeText(notes, 100) || null,
      });
      onCreated(charge);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Ocorreu um erro ao gerar a cobrança avulsa.");
    } finally {
  const receiptRef = useRef<HTMLDivElement>(null);
  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { backgroundColor: "#000000", scale: 2 });
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
      
      <div className={`relative w-full overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-[#000000] shadow-[0_40px_120px_rgba(0,0,0,1)] transition-all duration-500 ${step === "share" ? "max-w-4xl" : "max-w-xl"}`}>
        {/* Header (Floating) */}
        <div className="absolute top-6 right-6 z-10">
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white hover:text-black transition-all">
            <X size={18} weight="bold" />
          </button>
        </div>

        {step === "share" ? (
          <div className="grid md:grid-cols-[1fr_1.1fr]">
            {/* Lado Esquerdo: Info ou Recibo */}
            {localCharge?.status === "paid" ? (
                <div className="bg-[#050505] p-10 flex flex-col items-center justify-center border-r border-white/[0.05]">
                     <div ref={receiptRef} className="w-full max-w-sm rounded-3xl border border-white/[0.05] bg-black p-8 text-center shadow-2xl relative overflow-hidden">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Venda Confirmada</p>
                        <h2 className="mt-4 text-4xl font-bold tracking-tighter text-white">{formatBRL(localCharge.amount_cents)}</h2>
                        <div className="mt-8 space-y-3 text-left">
                            <div className="flex justify-between border-b border-white/[0.02] pb-3">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Cliente</span>
                                <span className="text-white font-bold text-[10px]">{localCharge.payer_name || "Cliente Final"}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.02] pb-3">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Data</span>
                                <span className="text-white font-bold text-[10px]">{new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
                        <button onClick={downloadReceipt} className="h-14 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">Baixar IMG</button>
                        <button onClick={() => window.print()} className="h-14 rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">PDF</button>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-zinc-900 to-[#050505] p-10 flex flex-col justify-between min-h-[520px]">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Cobrança Gerada</p>
                    <h2 className="mt-4 text-6xl font-bold tracking-tighter text-white">{formatBRL(localCharge!.amount_cents)}</h2>
                    <p className="mt-2 text-sm text-zinc-400">{localCharge!.service_name}</p>

                    <div className="mt-10 rounded-3xl border border-white/[0.05] bg-white/[0.02] p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 font-bold text-white uppercase">{profile?.full_name?.slice(0, 2)}</div>
                            <div>
                                <p className="text-sm font-bold text-white">{profile?.full_name}</p>
                                <p className="text-xs text-zinc-500">cloudepay.com.br/{profile?.slug}</p>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/[0.02]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Taxa CloudePay</p>
                                <p className="mt-1 text-sm font-bold text-white">2%</p>
                            </div>
                            <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/[0.02]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Expiração</p>
                                <p className="mt-1 text-sm font-bold text-white">30 min</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => window.open(checkoutUrl, '_blank')}
                    className="mt-10 flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-xs font-black uppercase tracking-[0.2em] text-black hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                    Abrir página de pagamento <ArrowIcon />
                </button>
                </div>
            )}

            {/* Lado Direito: Compartilhamento */}
            <div className="bg-white p-10 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <div className="rounded-[2.5rem] border border-zinc-100 bg-zinc-50 p-4 shadow-sm">
                    {(localCharge?.qr_code_image || localCharge?.pix_code) ? (
                        localCharge?.qr_code_image ? (
                            <img src={localCharge.qr_code_image} alt="QR Code" className="h-44 w-44" />
                        ) : (
                            <div className="h-44 w-44 flex items-center justify-center text-zinc-300">
                                <PanelIcon className="h-10 w-10 animate-pulse" />
                            </div>
                        )
                    ) : (
                        <div className="h-44 w-44 animate-pulse bg-zinc-200 rounded-2xl" />
                    )}
                </div>
                <p className="mt-6 text-center text-[11px] font-bold leading-relaxed text-zinc-400 max-w-[240px]">
                    {localCharge?.status === "paid" ? "Pagamento confirmado! O recibo está disponível para download." : "QR Code PIX gerado. Compartilhe o link ou abra a página de pagamento para o cliente."}
                </p>
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 p-2 pl-4">
                  <span className="flex-1 truncate text-xs font-bold text-zinc-500">{checkoutUrl.replace('https://', '')}</span>
                  <button onClick={copyLink} className={`rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white hover:bg-rose-600'}`}>
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className="mt-8">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Compartilhar em</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { icon: 'WA', label: 'WhatsApp', color: 'bg-emerald-50 text-emerald-600' },
                      { icon: 'IG', label: 'Instagram', color: 'bg-fuchsia-50 text-fuchsia-600' },
                      { icon: 'TT', label: 'TikTok', color: 'bg-zinc-50 text-zinc-900' },
                      { icon: 'KW', label: 'Kwai', color: 'bg-orange-50 text-orange-600' },
                      { icon: 'TG', label: 'Telegram', color: 'bg-sky-50 text-sky-600' },
                    ].map((app) => (
                      <button key={app.label} className="flex flex-col items-center gap-2 group">
                        <div className={`h-11 w-11 flex items-center justify-center rounded-2xl border border-zinc-100 transition-all group-hover:scale-110 active:scale-95 ${app.color}`}>
                          <span className="text-[10px] font-black">{app.icon}</span>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-400">{app.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-100 bg-white py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 hover:border-zinc-200 transition-all">
                  Compartilhar pelo celular <LinkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
   </div>
          </div>
        ) : (
          <div className="p-8">
            <h2 className="text-3xl font-bold tracking-tighter text-white mb-2">Criar nova cobrança</h2>
            <p className="text-sm text-zinc-500 mb-8">Defina os detalhes para gerar seu link de pagamento.</p>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.03] border border-white/[0.05] p-1.5 mb-8">
              <button onClick={() => setStep("product")} className={`rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${step === "product" ? "bg-white text-black shadow-xl scale-[1.02]" : "text-zinc-500 hover:text-white"}`}>Produtos</button>
              <button onClick={() => setStep("custom")} className={`rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${step === "custom" || step === "choose" ? "bg-white text-black shadow-xl scale-[1.02]" : "text-zinc-500 hover:text-white"}`}>Avulsa</button>
            </div>

            {step === "product" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Selecionar Produto</label>
                    <select 
                        className="auth-input !bg-white/[0.02] border-white/[0.05] focus:border-white/20" 
                        value={selectedProductId} 
                        onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                        <option value="" className="bg-black">Escolha um item...</option>
                        {products.map(p => <option key={p.id} value={p.id} className="bg-black">{p.name} ({formatBRL(p.amount_cents)})</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Cliente (Opcional)</label>
                    <input placeholder="Nome completo do comprador" className="auth-input !bg-white/[0.02] border-white/[0.05]" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                </div>
                <button onClick={createFromProduct} disabled={loading || !selectedProductId} className="w-full h-16 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-200 active:scale-[0.98] mt-4">
                  {loading ? "Processando..." : "Gerar cobrança"}
                </button>
              </div>
            ) : (
              <form onSubmit={createCustom} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Valor</label>
                    <input placeholder="R$ 0,00" className="auth-input text-3xl font-bold tracking-tighter !bg-white/[0.02] border-white/[0.05]" value={amountStr} onChange={(e) => setAmountStr(maskBRLInput(e.target.value))} required />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Serviço / Produto</label>
                    <input placeholder="Ex: Consultoria de Marketing" className="auth-input !bg-white/[0.02] border-white/[0.05]" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Cliente (Opcional)</label>
                    <input placeholder="Nome do cliente" className="auth-input !bg-white/[0.02] border-white/[0.05]" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                </div>
                <button type="submit" disabled={loading} className="w-full h-16 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-200 active:scale-[0.98] mt-4">
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
