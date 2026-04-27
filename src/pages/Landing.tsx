import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { formatBRL } from "../lib/format";

import {
  ArrowRight,
  QrCode,
  WhatsappLogo,
  EnvelopeSimple,
  DeviceMobile,
  InstagramLogo,
  TiktokLogo,
  LinkSimple,
  ShieldCheck,
  ChartBar,
  Envelope,
  Megaphone,
  Plus,
} from "phosphor-react";

export default function Landing() {
  const { profile } = useAuth();
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <BackgroundFX />
      <Header authed={!!profile} />
      <Hero />
      <Integrations />
      <Suite />
      <Calculator />
      <Testimonials />
      <Support />
      <FAQ />
      <FinalCTA />
      <Footer onEasterEgg={() => setShowEasterEgg(true)} />
      {showEasterEgg && <EasterEggModal onClose={() => setShowEasterEgg(false)} />}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Background                                                          */
/* ------------------------------------------------------------------ */

function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Doodle SVG                                                          */
/* ------------------------------------------------------------------ */

function GreenDoodle({ className = "", width = 215 }: { className?: string; width?: number }) {
  return (
    <svg className={className} width={width} viewBox="0 0 215 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M158.557 18.0539C76.7629 3.59645 4.61999 27.4373 2.52132 45.016C-3.48726 95.3446 236.85 65.2142 210.188 23.9397C199.842 7.92214 121.61 -0.649778 30.7298 18.0808"
        stroke="#9EEA6C"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GreenSquiggle() {
  return (
    <svg width="30" height="8" viewBox="0 0 30 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 5C4 1 8 1 15 5C22 9 26 7 29 3" stroke="#9EEA6C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function Header({ authed }: { authed: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-50">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 sm:px-6 py-3 sm:py-5">
        <Logo variant="white" />
        <nav className="hidden items-center gap-8 text-[15px] text-white/70 font-body md:flex">
          <a href="#integracoes" className="hover:text-white transition-colors">Integrações</a>
          <a href="#taxas" className="hover:text-white transition-colors">Taxas</a>
          <a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to={authed ? "/painel" : "/entrar"}
            className="rounded-full bg-lime-accent px-3.5 sm:px-5 py-2 sm:py-2.5 text-[13px] sm:text-sm font-heading font-bold text-[#0a0a0a] hover:brightness-110 transition flex items-center gap-1.5 sm:gap-2"
          >
            Acessar Plataforma
            <ArrowRight size={14} weight="bold" />
          </Link>
          <button
            className="ml-1 sm:ml-2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-white/60 hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Megaphone size={20} weight="bold" className={mobileOpen ? "hidden" : ""} />
            <Plus size={20} weight="bold" className={mobileOpen ? "rotate-45 transition" : "hidden"} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-white/10 bg-[#0a0a0a] px-6 py-5 md:hidden">
          <nav className="flex flex-col gap-4 text-[15px] text-white/70 font-body">
            <a href="#integracoes" onClick={() => setMobileOpen(false)}>Integrações</a>
            <a href="#taxas" onClick={() => setMobileOpen(false)}>Taxas</a>
            <a href="#depoimentos" onClick={() => setMobileOpen(false)}>Depoimentos</a>
            <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  const { profile } = useAuth();
  const authed = !!profile;

  return (
    <section className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 pt-4 sm:pt-8 pb-12 sm:pb-20">
      <div className="grid items-center gap-6 sm:gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          {/* Social proof */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur">
            <div className="flex -space-x-2">
              {["#9EEA6C", "#3B82F6", "#8B5CF6"].map((c, i) => (
                <div
                  key={i}
                  className="h-5 w-5 sm:h-7 sm:w-7 rounded-full border-2 border-[#0a0a0a]"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${c}, #052e16)` }}
                />
              ))}
            </div>
            <span className="text-[13px] sm:text-sm text-white/60 font-body">+12 mil autônomos já recebem com a gente.</span>
          </div>

          {/* Badge */}
          <div className="mt-3 sm:mt-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-accent/10 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-lime-accent font-body">
              <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-lime-accent" />
              Mais que pagamentos, somos uma comunidade.
            </span>
          </div>

          {/* Headline — Sora 800 */}
          <h1 className="mt-4 sm:mt-6 font-heading font-extrabold leading-[1.02] tracking-tight text-[2.15rem] sm:text-[3rem] lg:text-[4rem]">
            Receba fácil.{" "}
            <br className="hidden sm:block" />
            Cresça{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-lime-accent">rápido.</span>
              <GreenDoodle className="absolute -bottom-2 left-0 w-[120%] sm:w-[140%]" />
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 max-w-lg text-base sm:text-lg lg:text-xl leading-snug sm:leading-relaxed text-white/60 font-body">
            Cobranças via PIX sem complicação.
            <br />
            Crie, envie e receba. <br className="hidden sm:block" />
            Tudo na hora, tudo pela internet.
          </p>

          <div className="mt-5 sm:mt-8 flex flex-col gap-2 sm:gap-3 sm:flex-row">
            <Link
              to={authed ? "/painel" : "/entrar"}
              className="inline-flex h-[46px] sm:h-[52px] items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-lime-accent px-5 sm:px-7 text-[14px] sm:text-base font-heading font-bold text-[#0a0a0a] hover:brightness-110 transition"
            >
              Acessar Plataforma
              <ArrowRight size={15} weight="bold" />
            </Link>
            <a
              href="#integracoes"
              className="inline-flex h-[46px] sm:h-[52px] items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-white/15 px-5 sm:px-7 text-[14px] sm:text-base font-heading font-semibold text-white hover:bg-white/[0.04] transition"
            >
              Como funciona?
            </a>
          </div>
        </div>

        {/* Phone mock */}
        <HeroMock />
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
      {/* Moldura principal do Dashboard */}
      <div className="rounded-[24px] border border-white/10 bg-[#161616]/80 p-2 shadow-2xl backdrop-blur-xl">
        <div className="overflow-hidden rounded-[18px] bg-white text-neutral-900 shadow-inner">
          {/* Header do Mockup */}
          <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-5 py-3">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
              </div>
              <div className="h-4 w-32 rounded-full bg-neutral-100" />
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100">
              <div className="h-3 w-3 rounded-full bg-neutral-300" />
            </div>
          </div>

          {/* Conteúdo do Dashboard */}
          <div className="p-6">
            <header>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 font-body">Total em vendas</div>
              <div className="mt-1 text-3xl font-heading font-extrabold text-neutral-900">R$ 8.283,35</div>
            </header>

            {/* Filtros */}
            <div className="mt-6 flex flex-wrap gap-2">
              {["Hoje", "Ontem", "Semana", "Mês"].map((label, i) => (
                <div
                  key={label}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold font-heading transition ${
                    i === 0 ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {label}
                </div>
              ))}
              <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-1.5 text-[11px] font-bold text-neutral-400 font-heading flex items-center gap-1.5">
                <ChartBar size={12} />
                Escolher data
              </div>
            </div>

            {/* Gráfico (SVG) */}
            <div className="relative mt-8 h-40 w-full">
              <div className="absolute inset-0 flex flex-col justify-between py-2">
                {[500, 375, 250, 125, 0].map((val) => (
                  <div key={val} className="flex items-center gap-3">
                    <span className="w-6 text-[9px] font-medium text-neutral-300 font-body">{val}</span>
                    <div className="h-[1px] flex-1 bg-neutral-50" />
                  </div>
                ))}
              </div>
              
              <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 400 160">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,140 L40,150 L80,135 L120,155 L160,120 L200,125 L240,100 L280,110 L320,60 L360,80 L400,65"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M0,140 L40,150 L80,135 L120,155 L160,120 L200,125 L240,100 L280,110 L320,60 L360,80 L400,65 L400,160 L0,160 Z"
                  fill="url(#chartGradient)"
                />
                <circle cx="320" cy="60" r="4" fill="white" stroke="#22c55e" strokeWidth="2" />
              </svg>
            </div>

            {/* Stats rodapé */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { label: "Pedidos feitos", val: "652", color: "text-brand-600", bg: "bg-brand-50" },
                { label: "Pedidos pagos", val: "231", color: "text-red-600", bg: "bg-red-50" },
                { label: "Pendentes", val: "245", color: "text-neutral-900", bg: "bg-neutral-50" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-neutral-100 bg-white p-3 shadow-sm">
                  <div className="text-[9px] font-bold uppercase tracking-tight text-neutral-400 font-body leading-tight">
                    {stat.label}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-sm font-heading font-extrabold text-neutral-900">{stat.val}</span>
                    <span className={`rounded-full ${stat.bg} ${stat.color} px-1 py-0.5 text-[8px] font-bold`}>
                      +12
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notif — PIX */}
      <div className="absolute -top-6 -left-6 z-20 hidden rounded-[20px] border border-white/10 bg-[#121212] px-5 py-4 sm:block animate-float-slow shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-accent/10 shadow-inner">
            <QrCode size={24} weight="duotone" className="text-lime-accent" />
          </div>
          <div>
            <div className="text-[12px] text-white/40 font-body">Venda confirmada</div>
            <div className="text-base font-heading font-extrabold text-white">+ R$ 429,90</div>
          </div>
        </div>
      </div>

      {/* Floating Notif — Gráfico */}
      <div className="absolute -bottom-6 -right-6 z-20 hidden rounded-[20px] border border-white/10 bg-[#121212] px-5 py-4 sm:block animate-float-slow shadow-2xl" style={{ animationDelay: "2s" }}>
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/10">
            <ChartBar size={24} weight="duotone" className="text-brand-500" />
          </div>
          <div>
            <div className="text-[12px] text-white/40 font-body">Crescimento</div>
            <div className="text-base font-heading font-extrabold text-lime-accent">+ 24.5%</div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Integrações                                                         */
/* ------------------------------------------------------------------ */

function Integrations() {
  const channels = [
    { name: "WhatsApp",    Icon: WhatsappLogo,  desc: "Envie direto no chat",  color: "#25D366" },
    { name: "Instagram",   Icon: InstagramLogo, desc: "Na bio ou stories",     color: "#E1306C" },
    { name: "TikTok",      Icon: TiktokLogo,    desc: "Link na bio",           color: "#00f2ea" },
    { name: "Email",       Icon: EnvelopeSimple, desc: "Assinatura ou inbox",  color: "#9EEA6C" },
    { name: "QR Code",     Icon: QrCode,        desc: "Pessoalmente",          color: "#9EEA6C" },
    { name: "Celular",     Icon: DeviceMobile,  desc: "SMS ou WhatsApp",       color: "#9EEA6C" },
  ];

  return (
    <section id="integracoes" className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
        <div className="mb-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-body font-semibold text-lime-accent">
            Compartilhe
          </span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-heading font-extrabold leading-tight tracking-tight text-[2rem] sm:text-[2.5rem]">
              Compartilhe como quiser!{" "}
              <span className="text-lime-accent">No zap, no Insta, no email.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/60 font-body">
              Mande o link pra onde o cliente estiver. Ele clica, preenche o nome,
              paga com PIX e pronto. Sem app, sem cadastro pra ele.
            </p>
            <a
              href="/cadastro"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-lime-accent hover:underline"
            >
              Comece grátis <ArrowRight size={14} weight="bold" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {channels.map(({ name, Icon, desc, color }) => (
              <div
                key={name}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-lime-accent/30 hover:bg-white/[0.05]"
              >
                <Icon size={28} weight="duotone" style={{ color }} />
                <div className="mt-2 text-sm font-heading font-semibold text-white">{name}</div>
                <div className="mt-0.5 text-[11px] text-white/50 font-body">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Suite (feature grid)                                                */
/* ------------------------------------------------------------------ */

function Suite() {
  return (
    <section className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
        <h2 className="font-heading font-extrabold tracking-tight text-[2rem] sm:text-[2.5rem] max-w-3xl">
          Uma suite de{" "}
          <span className="relative inline-block">
            <span className="text-lime-accent">soluções</span>
            <GreenDoodle className="absolute -bottom-2 left-0 w-[120%]" width={180} />
          </span>{" "}
          para o seu negócio.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-white/60 font-body">
          Tudo que você precisa pra cobrar, sem nada que você não precisa.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {/* Large card */}
          <div className="row-span-2 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-lime-accent/5 via-transparent to-transparent p-8 sm:p-10">
            <div className="text-sm font-body font-semibold uppercase tracking-wider text-lime-accent">
              PIX automático
            </div>
            <h3 className="mt-2 font-heading font-bold text-[1.5rem] sm:text-[1.875rem]">
              QR Code + copia-e-cola gerados na hora.
            </h3>
            <p className="mt-3 max-w-md text-white/60 font-body">
              Cliente abre o link, preenche os dados, clica em pagar.
              QR pronto. Você é avisado na hora que cair.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { label: "Confirmação automática", value: "5 seg",   Icon: QrCode },
                { label: "Validade do QR",         value: "15 min",  Icon: DeviceMobile },
                { label: "Comprovante",            value: "Automático", Icon: EnvelopeSimple },
              ].map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3"
                >
                  <span className="flex items-center gap-2.5 text-sm text-white/60 font-body">
                    <Icon size={18} weight="duotone" className="text-lime-accent" />
                    {label}
                  </span>
                  <span className="text-sm font-heading font-bold text-lime-accent">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Small cards */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
            <ShieldCheck size={32} weight="duotone" className="text-lime-accent mb-4" />
            <h3 className="font-heading font-bold text-xl">Proteção antifraude.</h3>
            <p className="mt-2 text-sm text-white/60 font-body">
              Validação de CPF com algoritmo oficial, sanitização de dados
              e webhook assinado com criptografia. Você foca em vender.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
            <ChartBar size={32} weight="duotone" className="text-lime-accent mb-4" />
            <h3 className="font-heading font-bold text-xl">Painel limpo.</h3>
            <p className="mt-2 text-sm text-white/60 font-body">
              Total recebido no mês, todas as cobranças com status de cada PIX.
              Nada além do que importa.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
            <Envelope size={32} weight="duotone" className="text-lime-accent mb-4" />
            <h3 className="font-heading font-bold text-xl">Comprovante por email.</h3>
            <p className="mt-2 text-sm text-white/60 font-body">
              Toda venda gera comprovante automático para o cliente.
              Profissionalismo on.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
            <LinkSimple size={32} weight="duotone" className="text-lime-accent mb-4" />
            <h3 className="font-heading font-bold text-xl">Cobranças por link.</h3>
            <p className="mt-2 text-sm text-white/60 font-body">
              Cada cobrança gera um link único.{" "}
              <span className="font-mono text-[13px] text-lime-accent">
                CloudePay.com.br/seu/chg_abc
              </span>
              . Curto, direto e seu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Calculator                                                          */
/* ------------------------------------------------------------------ */

function Calculator() {
  const [monthly, setMonthly] = useState(5000);

  const ourFee = Math.round(monthly * 0.02 * 100);
  const ourNet = monthly * 100 - ourFee;
  const competitorFee = Math.round(monthly * 0.0499 * 100 + 39 * 100);
  const savings = competitorFee - ourFee;

  const presets = [1000, 5000, 15000];

  return (
    <section id="taxas" className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
        <div className="mb-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-body font-semibold text-lime-accent">
            Taxas
          </span>
        </div>
        <h2 className="font-heading font-extrabold tracking-tight text-[2rem] sm:text-[2.5rem] max-w-2xl">
          2% e acabou.{" "}
          <span className="text-white/40">Sem mensalidade.</span>
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8">
            <label className="text-sm font-body font-medium text-white/60">Você vende...</label>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-heading font-bold text-white/40">R$</span>
              <input
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(Math.max(0, parseInt(e.target.value || "0", 10)))}
                className="w-full bg-transparent text-5xl font-heading font-extrabold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <input
              type="range"
              min={500} max={50000} step={500}
              value={monthly}
              onChange={(e) => setMonthly(parseInt(e.target.value, 10))}
              className="mt-6 w-full accent-lime-accent"
            />
            <div className="mt-2 flex justify-between text-xs text-white/40 font-body">
              <span>R$ 500</span>
              <span>R$ 50.000</span>
            </div>
            <div className="mt-6 flex gap-2">
              {presets.map((v) => (
                <button
                  key={v}
                  onClick={() => setMonthly(v)}
                  className={`rounded-full border px-4 py-2 text-xs font-heading font-medium transition ${
                    monthly === v
                      ? "border-lime-accent bg-lime-accent/15 text-lime-accent"
                      : "border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  R$ {v.toLocaleString("pt-BR")}
                </button>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8">
            <div className="text-sm font-body font-medium text-white/60">Você recebe...</div>
            <div className="mt-2 text-4xl font-heading font-extrabold text-lime-accent">
              {formatBRL(ourNet)}
            </div>
            <div className="mt-1 text-xs text-white/50 font-body">
              por transação • taxa de 2% aplicada
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-lime-accent/20 bg-lime-accent/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-heading font-medium text-white/80">Na CloudePay</span>
                  <GreenSquiggle />
                </div>
                <div className="mt-1 text-xs text-lime-accent/70 font-body">Taxa efetiva: 2%</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xl font-heading font-bold text-lime-accent/50">R$</span>
                  <span className="text-2xl font-heading font-extrabold text-lime-accent">
                    {formatBRL(ourNet).replace("R$", "").trim()}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-heading font-medium text-white/50">Sua taxa atual</span>
                </div>
                <div className="mt-1 text-xs text-white/40 font-body">~5% + R$ 39/mês</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xl font-heading font-bold text-white/30">R$</span>
                  <span className="text-2xl font-heading font-extrabold text-white/50">
                    {formatBRL(ourNet).replace("R$", "").trim()}
                  </span>
                </div>
              </div>
            </div>

            {savings > 0 && (
              <div className="mt-6 rounded-2xl bg-lime-accent/10 p-4 text-center">
                <div className="text-xs font-body font-semibold uppercase tracking-wider text-lime-accent">
                  Você economiza
                </div>
                <div className="mt-1 text-2xl font-heading font-extrabold text-lime-accent">
                  {formatBRL(Math.max(0, savings))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

function Testimonials() {
  const cards = [
    {
      name: "Marina C.",
      role: "Manicure · São Paulo",
      text: "Antes eu mandava chave PIX no zap e ficava cobrando print. Agora é só mandar o link, o cliente paga e eu vejo no painel. Mudou meu dia a dia.",
      initial: "MC",
      color: "#9EEA6C",
    },
    {
      name: "Lucas P.",
      role: "Personal · Recife",
      text: "Configurei em 2 minutos no celular. Já recebi 14 mensalidades sem precisar de maquininha. A taxa de 2% é justa demais.",
      initial: "LP",
      color: "#3B82F6",
    },
    {
      name: "Ana R.",
      role: "Designer · Curitiba",
      text: "Cada cobrança é independente. Eu tenho 15 links abertos ao mesmo tempo, todos rastreados. Meu dinheiro cai na hora.",
      initial: "AR",
      color: "#8B5CF6",
    },
    {
      name: "Diego M.",
      role: "Prof. violão · BH",
      text: "Sem CNPJ, sem nota, sem complicação. Cobro a aula, recebo na hora. Simples como tem que ser.",
      initial: "DM",
      color: "#9EEA6C",
    },
  ];

  return (
    <section id="depoimentos" className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
        <div className="mb-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-body font-semibold text-lime-accent">
            Depoimentos
          </span>
        </div>
        <h2 className="font-heading font-extrabold tracking-tight text-[2rem] sm:text-[2.5rem] max-w-3xl">
          Histórias de quem usa a{" "}
          <span className="relative inline-block">
            CloudePay
            <GreenDoodle className="absolute -bottom-2 left-0 w-[110%]" width={180} />
          </span>{" "}
          no dia a dia.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-white/60 font-body">
          Veja relatos de profissionais que simplificaram pagamentos e gerenciaram
          suas cobranças com facilidade.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {cards.map((c) => (
            <figure
              key={c.name}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 transition hover:border-lime-accent/20"
            >
              <div className="mb-4 text-2xl leading-none text-lime-accent font-heading">"</div>
              <blockquote className="text-[15px] leading-relaxed text-white/80 font-body">
                {c.text}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-heading font-bold text-white/90"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${c.color}, #052e16)` }}
                >
                  {c.initial}
                </div>
                <div>
                  <div className="text-sm font-heading font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-white/50 font-body">{c.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Suporte                                                             */
/* ------------------------------------------------------------------ */

function Support() {
  return (
    <section id="suporte" className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Chat bubbles */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-80 w-80 rounded-full bg-lime-accent/5 blur-3xl" />
            </div>
            <div className="relative space-y-3 w-full max-w-sm">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-lime-accent/15 p-4 text-sm text-white font-body">
                Oi! Como mudo o meu link de cobrança?
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/[0.06] p-4 text-sm text-white/80 font-body">
                Oi Maria! É só ir em <b className="text-white">Configurações</b>, mudar o slug e salvar.
                Já te mando o passo a passo.
              </div>
              <div className="max-w-[60%] rounded-2xl rounded-tl-sm bg-white/[0.06] p-4">
                <div className="flex gap-1.5 items-center">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white/40" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white/40" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white/40" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <div className="mb-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-body font-semibold text-lime-accent">
                Suporte
              </span>
            </div>
            <h2 className="font-heading font-extrabold tracking-tight text-[2rem] sm:text-[2.5rem]">
              E tudo isso com um suporte que não te deixa na mão.
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/60 font-body">
              Travou? Mandou o link errado? Não sabe configurar? Chama a gente.
              Resposta em minutos, todo dia útil.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { label: "WhatsApp",     Icon: WhatsappLogo,  color: "#25D366" },
                { label: "Email",        Icon: EnvelopeSimple, color: "#9EEA6C" },
                { label: "Central ajuda", Icon: LinkSimple,   color: "#9EEA6C" },
              ].map(({ label, Icon, color }) => (
                <a
                  key={label}
                  href="#"
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-heading font-medium text-white/80 hover:bg-white/[0.06] transition inline-flex items-center gap-2"
                >
                  <Icon size={16} weight="duotone" style={{ color }} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

function FAQ() {
  const items = [
    {
      q: "Preciso ter CNPJ?",
      a: "Não! O CloudePay foi feito pra autônomo. Você cria a conta só com CPF e já recebe pagamentos na hora.",
    },
    {
      q: "Quanto tempo leva pra cair?",
      a: "PIX cai na hora. Geralmente em segundos. Você é notificado no painel automaticamente.",
    },
    {
      q: "Tem mensalidade?",
      a: "Zero. Cobramos apenas 2% de cada transação concluída. Se você não vendeu, não paga nada.",
    },
    {
      q: "O cliente precisa baixar algum app?",
      a: "Não. Ele abre seu link no navegador, paga com o PIX do banco dele e pronto. Nada a instalar.",
    },
    {
      q: "Como recebo o dinheiro?",
      a: "Os valores caem direto na sua conta PIX cadastrada. Você decide quando sacar.",
    },
    {
      q: "É seguro?",
      a: "Sim. Validamos CPF com algoritmo oficial, todos os webhooks são assinados e dados sensíveis ficam só no backend.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[720px] px-6 py-20 sm:py-28">
        <div className="mb-2 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-body font-semibold text-lime-accent">
            FAQ
          </span>
        </div>
        <h2 className="text-center font-heading font-extrabold tracking-tight text-[2rem] sm:text-[2.5rem]">
          Tem dúvidas? <span className="text-white/40">Relaxa,</span>
          <br />
          nós temos as respostas.
        </h2>

        <div className="mt-12 space-y-3">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition ${
                  isOpen ? "border-lime-accent/30 bg-lime-accent/[0.03]" : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-heading font-semibold text-white sm:text-base">
                    {it.q}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                      isOpen
                        ? "bg-lime-accent text-[#0a0a0a] rotate-45"
                        : "border border-white/15 text-white/60"
                    }`}
                  >
                    <Plus size={16} weight="bold" />
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden px-6 transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden text-[15px] leading-relaxed text-white/60 font-body">
                    {it.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  const { profile } = useAuth();
  return (
    <section className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 sm:py-32">
        <div className="relative overflow-hidden rounded-[40px] border border-white/[0.08] bg-gradient-to-br from-lime-accent/[0.07] via-transparent to-transparent px-6 py-16 text-center sm:px-16 sm:py-20">
          <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-accent/10 blur-3xl" />

          <h2 className="mx-auto max-w-2xl font-heading font-extrabold tracking-tight text-[2rem] sm:text-[3rem]">
            Você chegou no fim da página.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-white/60 font-body">
            Se chegou até aqui, é porque tá interessado.
            <br />
            Então vai lá, faz logo o cadastro.
          </p>
          <Link
            to={profile ? "/painel" : "/entrar"}
            className="mt-8 inline-flex h-[56px] items-center gap-2 rounded-full bg-lime-accent px-8 text-base font-heading font-bold text-[#0a0a0a] hover:brightness-110 transition"
          >
            Acessar Plataforma
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer({ onEasterEgg }: { onEasterEgg: () => void }) {
  return (
    <footer className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Logo variant="white" />
            <p className="mt-3 max-w-xs text-sm text-white/40 font-body">
              Receba PIX com seu link único.
              <br />
              Feito no Brasil, pra autônomo brasileiro.
            </p>
          </div>
          <div>
            <div className="text-xs font-body font-semibold uppercase tracking-wider text-white/30">
              Produto
            </div>
            <ul className="mt-3 space-y-2 text-sm text-white/60 font-body">
              <li><a href="#integracoes" className="hover:text-white transition">Integrações</a></li>
              <li><a href="#taxas" className="hover:text-white transition">Taxas</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-body font-semibold uppercase tracking-wider text-white/30">
              Conta
            </div>
            <ul className="mt-3 space-y-2 text-sm text-white/60 font-body">
              <li><Link to="/entrar" className="hover:text-white transition">Acessar Plataforma</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.06] pt-8 text-xs text-white/30 font-body sm:flex-row sm:justify-between">
          <span>&copy; {new Date().getFullYear()} CloudePay. Todos os direitos reservados.</span>
          <button 
            onClick={onEasterEgg}
            className="text-left hover:text-lime-accent transition-colors duration-500 cursor-help group"
          >
            Feito com carinho pra quem <span className="group-hover:underline decoration-lime-accent/30 underline-offset-4">trabalha por conta.</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Easter Egg Modal                                                    */
/* ------------------------------------------------------------------ */

function EasterEggModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-md max-h-[88dvh] overflow-auto rounded-[28px] sm:rounded-[32px] border border-white/10 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-5 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime-accent/5 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-node-violet/10 blur-3xl" />
        
        <div className="relative flex justify-center">
          <Logo size="lg" variant="white" />
        </div>
        
        <div className="mt-8 space-y-4">
          <h3 className="font-heading text-2xl font-extrabold text-white">
            Uma criação de <br />
            <span className="bg-gradient-to-r from-lime-accent to-node-violet bg-clip-text text-transparent">Mateus Oliveira</span>
          </h3>
          
          <p className="font-body text-sm leading-relaxed text-white/50">
            O CloudePay nasceu do sonho de simplificar a vida de quem, assim como eu, acredita no trabalho independente. 
          </p>
          
          <p className="font-body text-[13px] leading-relaxed text-white/40 italic">
            "A tecnologia deve servir às pessoas, <br /> nunca o contrário."
          </p>
        </div>

        <div className="mt-10">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-white/5 px-6 py-3 text-sm font-heading font-bold text-white border border-white/10 hover:bg-white/10 transition active:scale-95"
          >
            Fechar placa
          </button>
        </div>
        
        <div className="mt-6 flex justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-lime-accent/20" />
          ))}
        </div>
      </div>
    </div>
  );
}


