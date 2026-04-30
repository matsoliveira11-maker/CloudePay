import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { Charge } from "../lib/api";
import { formatBRL, formatDateTime, maskBRLInput, parseBRLToCents } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import { X } from "phosphor-react";

// --- Icons & UI Components from Inspiration ---

function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-white" : "text-[#4c0519]";
  return (
    <div className="flex items-center gap-2.5">
      <span className="logo-mark relative inline-flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="55%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <linearGradient id="logoGloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M20 2.4c2.7 0 4.5 2.4 7.4 3.5 2.9 1.1 6.4.3 8 2.4 1.6 2.1.3 5.4 1.4 8.3 1.1 2.9 4.3 4.6 4.3 7.4 0 2.7-3.2 4.5-4.3 7.4-1.1 2.9.2 6.2-1.4 8.3-1.6 2.1-5.1 1.3-8 2.4-2.9 1.1-4.7 3.5-7.4 3.5s-4.5-2.4-7.4-3.5c-2.9-1.1-6.4-.3-8-2.4-1.6-2.1-.3-5.4-1.4-8.3C2.1 28.5-1 26.7-1 24c0-2.7 3.2-4.5 4.3-7.4 1.1-2.9-.2-6.2 1.4-8.3 1.6-2.1 5.1-1.3 8-2.4C15.5 4.8 17.3 2.4 20 2.4Z"
            fill="url(#logoGrad)"
            transform="translate(0 -2)"
          />
          <path
            d="M14.5 16.8c1.5-2.6 4.4-4.3 7.6-4.3 4.9 0 8.9 3.9 8.9 8.7 0 4.9-4 8.7-8.9 8.7-3.2 0-6.1-1.6-7.6-4.3"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="14.4" cy="21.2" r="2.2" fill="#fff" />
          <path
            d="M2 6c4 1 8 5 9 10"
            stroke="url(#logoGloss)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      <span className={`text-xl font-semibold tracking-[-0.045em] ${textColor}`}>
        Cloude<span className="text-[#e11d48]">Pay</span>
      </span>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10h9M10 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HelpIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7" />
      <circle cx="12" cy="17" r=".7" fill="currentColor" />
    </svg>
  );
}

function PanelIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M3 9h18" />
    </svg>
  );
}

function ProductIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  );
}

function UserIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MoneyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function ChargeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </svg>
  );
}

function FilterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function LinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.4-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5 4.5 1.9.8 2.6.8 3.5.7.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4ZM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.4.8 3 1.3 4.8 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2Z" />
    </svg>
  );
}

function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

// --- Logic ---

type DashboardTab = "dashboard" | "produtos" | "perfil";

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [tab, setTab] = useState<DashboardTab>("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
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
    const [list, total] = await Promise.all([
      api.listChargesByProfile(profile.id),
      api.getMonthTotalCents(profile.id),
    ]);
    setCharges(list);
    setMonthTotal(total);
  }, [profile]);

  useEffect(() => {
    reload();
    const i = setInterval(reload, 5000);
    return () => clearInterval(i);
  }, [reload]);

  const paidCharges = charges.filter((c) => c.status === "paid");
  const pendingCharges = charges.filter((c) => c.status === "pending");

  const monthNetTotal = monthTotal * 0.98;

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
      const dayCharges = charges.filter(c => 
        new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === day
      );
      return dayCharges.reduce((acc, curr) => acc + curr.amount_cents, 0) / 100;
    });
  }, [charges, chartDays]);

  const maxChartValue = Math.max(...chartValues, 1);

  return (
    <>
      <main className="min-h-screen bg-[#fffafa] text-[#4c0519] antialiased page-grid">
        <header className="sticky top-0 z-40 border-b border-[#fecdd3] bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <Link to="/dashboard" onClick={() => setTab("dashboard")} className="inline-flex"><Logo /></Link>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-[#fecdd3] bg-white px-4 py-2 text-sm font-semibold text-[#881337] sm:inline-flex">
                cloudepay.com.br/{profile?.slug || "carregando"}
              </span>
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#fecdd3] bg-white text-[#4c0519] transition hover:border-[#e11d48] hover:text-[#e11d48] sm:w-auto sm:gap-2 sm:px-4 sm:text-sm sm:font-semibold"
              >
                <HelpIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Suporte</span>
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#4c0519] px-4 text-xs font-semibold text-white transition hover:bg-[#7f1235] sm:text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:grid-cols-[240px_1fr] lg:px-8 lg:py-8">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-3xl border border-[#fecdd3] bg-white/90 p-3 shadow-[0_24px_70px_rgba(136,19,55,0.08)]">
              {[
                { key: "dashboard" as const, label: "Dashboard", Icon: PanelIcon, path: "/dashboard" },
                { key: "produtos" as const, label: "Produtos", Icon: ProductIcon, path: "/produtos" },
                { key: "perfil" as const, label: "Meu perfil", Icon: UserIcon, path: "/configuracoes" },
              ].map(({ key, label, Icon, path }) => (
                <Link
                  key={key}
                  to={path}
                  onClick={() => setTab(key)}
                  className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition last:mb-0 ${
                    tab === key ? "bg-[#e11d48] text-white shadow-[0_12px_26px_rgba(225,29,72,0.22)]" : "text-[#881337] hover:bg-[#fff1f2] hover:text-[#4c0519]"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            {tab === "dashboard" && (
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
                    { label: "Recebido no mês", value: formatBRL(monthNetTotal), note: "Líquido após taxa de 2%", Icon: MoneyIcon },
                    { label: "Total de cobranças", value: charges.length.toString(), note: `${pendingCharges.length} pendente(s)`, Icon: ChargeIcon },
                    { label: "Ticket médio", value: formatBRL(paidCharges.length > 0 ? (monthTotal / paidCharges.length) : 0), note: "Somente pagamentos confirmados", Icon: PanelIcon },
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
                    <h2 className="text-xl font-semibold tracking-[-0.04em]">Métodos de pagamento</h2>
                    <div className="mt-5 space-y-3">
                      {[
                        ["Pix QR Code", formatBRL(monthTotal)],
                        ["Pix pendente", formatBRL(pendingCharges.reduce((acc, curr) => acc + curr.amount_cents, 0))],
                        ["Cartão de crédito", "R$ 0,00"],
                        ["Total Bruto", formatBRL(monthTotal)],
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
                        <p className="mt-1 text-sm text-[#881337]">{formatBRL(monthTotal)} volume total criado</p>
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
            )}
          </section>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#fecdd3] bg-white/92 px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-2 shadow-[0_-18px_45px_rgba(136,19,55,0.08)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
            {[
              { key: "dashboard" as const, label: "Dashboard", Icon: PanelIcon, path: "/dashboard" },
              { key: "produtos" as const, label: "Produtos", Icon: ProductIcon, path: "/produtos" },
              { key: "perfil" as const, label: "Meu perfil", Icon: UserIcon, path: "/configuracoes" },
            ].map(({ key, label, Icon, path }) => (
              <Link
                key={key}
                to={path}
                onClick={() => setTab(key)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-semibold transition ${
                  tab === key ? "bg-[#e11d48] text-white shadow-[0_10px_24px_rgba(225,29,72,0.24)]" : "text-[#881337] hover:bg-[#fff1f2]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </main>

      {supportOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-[#4c0519]/35 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl border border-[#fecdd3] bg-white p-5 shadow-[0_28px_90px_rgba(76,5,25,0.22)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold text-[#e11d48]">Suporte humano</span>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[#4c0519]">Como podemos ajudar?</h2>
                <p className="mt-2 text-sm leading-6 text-[#881337]">Escolha um canal. Nosso time ajuda com conta, links de cobrança, pagamento pendente ou conexão com Mercado Pago.</p>
              </div>
              <button type="button" onClick={() => setSupportOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[#4c0519] transition hover:text-[#e11d48]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              <a href="#" className="flex items-center gap-3 rounded-2xl border border-[#fecdd3] bg-[#fffafa] p-4 text-[#4c0519] transition hover:border-[#e11d48]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e11d48] text-white"><WhatsAppIcon /></span>
                <span><strong className="block">WhatsApp</strong><small className="text-[#881337]">Resposta rápida em dia útil</small></span>
              </a>
              <a href="#" className="flex items-center gap-3 rounded-2xl border border-[#fecdd3] bg-[#fffafa] p-4 text-[#4c0519] transition hover:border-[#e11d48]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1f2] text-[#e11d48]"><MailIcon /></span>
                <span><strong className="block">Email</strong><small className="text-[#881337]">ajuda@cloudepay.com.br</small></span>
              </a>
            </div>
          </div>
        </div>
      )}
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      setErrors({ general: error.message });
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
      setErrors({ general: error.message });
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
