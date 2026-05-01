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


// --- Logic ---


export default function Dashboard() {
  const { profile } = useAuth();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [stats, setStats] = useState({ monthNet: 0, monthGross: 0, totalNet: 0, totalGross: 0 });
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
      }, () => {
        reload();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [reload, profile?.id]);

  const paidCharges = charges.filter((c) => c.status === "paid");
  const pendingCharges = charges.filter((c) => c.status === "pending");

  // Ticket médio: média do bruto de todas as cobranças pagas
  const avgTicket = paidCharges.length > 0 ? stats.totalGross / paidCharges.length : 0;

  // Valores para os cards
  const monthNetTotal = stats.monthNet;
  const totalNetTotal = stats.totalNet;
  const totalGrossTotal = stats.totalGross;

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
                    <button className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#e11d48] px-3 py-2 text-xs font-semibold text-white sm:gap-2 sm:px-4 sm:text-sm"><FilterIcon /> Este mês</button>
                    <button className="rounded-xl px-3 py-2 text-xs font-semibold text-[#881337] hover:bg-[#fff1f2] sm:px-4 sm:text-sm">Pagas</button>
                    <button className="rounded-xl px-3 py-2 text-xs font-semibold text-[#881337] hover:bg-[#fff1f2] sm:px-4 sm:text-sm">Pendentes</button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                  {[
                    { label: "Recebido no mês", value: formatBRL(monthNetTotal), note: "Líquido real após taxa", Icon: MoneyIcon },
                    { label: "Total de cobranças", value: charges.length.toString(), note: `${pendingCharges.length} pendente(s)`, Icon: ChargeIcon },
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
                        ["Total bruto recebido", formatBRL(totalGrossTotal)],
                        ["Pix pendente", formatBRL(pendingCharges.reduce((acc, curr) => acc + curr.amount_cents, 0))],
                        ["Taxa total (2%)", formatBRL(totalGrossTotal - totalNetTotal)],
                        ["Saldo total (líquido)", formatBRL(totalNetTotal)],
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
                        <p className="mt-1 text-sm text-[#881337]">{formatBRL(monthGrossTotal)} volume total recebido</p>
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
    return `${window.location.origin}/#/pagamento/${createdCharge.id}`;
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
      setLoading(false);
    }
  }

  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#4c0519]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl max-h-[92vh] overflow-auto rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-[#fecdd3] bg-white p-6 shadow-[0_40px_120px_rgba(76,5,25,0.3)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[#4c0519]">
            {step === "share" ? "Compartilhar cobrança" : "Nova cobrança"}
          </h2>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f2] text-[#4c0519]">
            <X size={18} weight="bold" />
          </button>
        </div>

        {step === "share" ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#fecdd3] bg-[#fffafa] p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#9f1239]">Link pronto</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-[#4c0519]">{formatBRL(createdCharge!.amount_cents)}</p>
              <p className="mt-2 text-sm text-[#881337]">{createdCharge!.service_name}</p>
            </div>
            
            <div className="flex items-center gap-2 rounded-2xl border border-[#fecdd3] bg-white p-2">
              <span className="flex-1 truncate px-3 text-sm font-medium text-[#4c0519]">{checkoutUrl}</span>
              <button onClick={copyLink} className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${copied ? 'bg-[#16a34a] text-white' : 'bg-[#e11d48] text-white'}`}>
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a href={`https://wa.me/?text=${encodeURIComponent(`Pague ${formatBRL(createdCharge!.amount_cents)}: ${checkoutUrl}`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-[#fecdd3] bg-white py-4 text-sm font-semibold text-[#4c0519]">
                <WhatsAppIcon /> WhatsApp
              </a>
              <button onClick={copyLink} className="flex items-center justify-center gap-2 rounded-2xl border border-[#fecdd3] bg-white py-4 text-sm font-semibold text-[#4c0519]">
                <LinkIcon /> Outros
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#fff1f2] p-1">
              <button onClick={() => setStep("product")} className={`rounded-xl py-3 text-xs font-bold transition ${step === "product" ? "bg-white text-[#4c0519] shadow-sm" : "text-[#9f1239]"}`}>Produtos</button>
              <button onClick={() => setStep("custom")} className={`rounded-xl py-3 text-xs font-bold transition ${step === "custom" || step === "choose" ? "bg-white text-[#4c0519] shadow-sm" : "text-[#9f1239]"}`}>Avulsa</button>
            </div>

            {step === "product" ? (
              <div className="space-y-4">
                <select 
                  className="auth-input" 
                  value={selectedProductId} 
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Selecione um produto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatBRL(p.amount_cents)})</option>)}
                </select>
                <input placeholder="Nome do cliente (opcional)" className="auth-input" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                <button onClick={createFromProduct} disabled={loading || !selectedProductId} className="cta-button w-full rounded-2xl bg-[#e11d48] py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                  {loading ? "Gerando..." : "Gerar cobrança"}
                </button>
              </div>
            ) : (
              <form onSubmit={createCustom} className="space-y-4">
                <input placeholder="R$ 0,00" className="auth-input text-2xl font-bold" value={amountStr} onChange={(e) => setAmountStr(maskBRLInput(e.target.value))} required />
                <input placeholder="Descrição do serviço" className="auth-input" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
                <input placeholder="Nome do cliente (opcional)" className="auth-input" value={payerName} onChange={(e) => setPayerName(e.target.value)} />
                <button type="submit" disabled={loading} className="cta-button w-full rounded-2xl bg-[#e11d48] py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                  {loading ? "Gerando..." : "Gerar link PIX"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
