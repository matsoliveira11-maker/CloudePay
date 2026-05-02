import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate as _useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { Charge } from "../lib/api";
import { supabase } from "../lib/supabase";
import { formatBRL, formatDateTime, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { X, WhatsappLogo, InstagramLogo, TiktokLogo, TelegramLogo, ShareNetwork } from "phosphor-react";

import Shell from "../components/Shell";
import { MoneyIcon, ChargeIcon, FilterIcon, ArrowIcon, PanelIcon } from "../components/Icons";
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
                        ["Taxa total (1%)", formatBRL(displayGross - displayNet)],
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
                        <tr><th className="px-5 py-4">Serviço / Cliente</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Bruto</th><th className="px-5 py-4">Taxa (1%)</th><th className="px-5 py-4">Líquido</th></tr>
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
  const [amountStr, setAmountStr] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [copied, setCopied] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
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
                    <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-white font-black text-[#e11d48] text-sm md:text-lg">
                      {profile?.full_name?.slice(0, 2).toUpperCase() || "CL"}
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
