import { useState } from "react";

function Logo({ centered = false, variant = "dark" }: { centered?: boolean; variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-white" : "text-[#4c0519]";
  return (
    <div className={`flex items-center gap-2.5 ${centered ? "justify-center" : ""}`}>
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

function PixIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path d="m12 3 4.2 4.2L12 11.4 7.8 7.2 12 3Zm-6 6 3 3-3 3-3-3 3-3Zm12 0 3 3-3 3-3-3 3-3Zm-6 3.6 4.2 4.2L12 21l-4.2-4.2 4.2-4.2Z" fill="currentColor" />
    </svg>
  );
}

function PixBigIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="pixBigGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <path
        d="M32 6 42 16 32 26 22 16 32 6Zm-16 16 10 10-10 10L6 32l10-10Zm32 0 10 10-10 10L38 32l10-10Zm-16 16 10 10-10 10L22 48l10-10Z"
        fill="url(#pixBigGrad)"
      />
      <circle cx="32" cy="32" r="3.5" fill="#fff" />
    </svg>
  );
}

function CardShareIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <rect x="6" y="14" width="42" height="32" rx="5" fill="url(#cardGrad)" />
      <rect x="11" y="20" width="14" height="3" rx="1.5" fill="#fff" opacity="0.85" />
      <rect x="11" y="27" width="22" height="2.5" rx="1.25" fill="#fff" opacity="0.55" />
      <rect x="11" y="33" width="18" height="2.5" rx="1.25" fill="#fff" opacity="0.55" />
      <rect x="11" y="39" width="10" height="2.5" rx="1.25" fill="#fff" opacity="0.55" />
      <circle cx="50" cy="20" r="6" fill="#fff" />
      <circle cx="50" cy="44" r="6" fill="#fff" />
      <circle cx="58" cy="32" r="6" fill="#fff" />
      <path d="m50 20 8 12m-8 12 8-12" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function PanelIcon({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="52" height="44" rx="5" fill="url(#panelGrad)" />
      <rect x="11" y="16" width="42" height="6" rx="2" fill="#fff" opacity="0.3" />
      <rect x="11" y="26" width="14" height="22" rx="2" fill="#fff" opacity="0.85" />
      <path d="M28 42 34 36 38 39 50 28" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="50" cy="28" r="2" fill="#fff" />
      <rect x="28" y="44" width="22" height="3" rx="1.5" fill="#fff" opacity="0.55" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.4-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5 4.5 1.9.8 2.6.8 3.5.7.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4ZM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.4.8 3 1.3 4.8 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2Z" />
    </svg>
  );
}

function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}


const navItems = ["Para quem é", "Como funciona", "Taxas", "FAQ"];

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#fecdd3] bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between border-x border-[#fecdd3] px-4 sm:px-6 md:h-20 md:px-9">
        <Logo />
        <nav className="hidden items-center gap-9 text-sm font-medium text-[#881337] md:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} className="transition hover:text-[#f43f5e]">
              {item}
            </a>
          ))}
        </nav>
        <a href="/entrar" className="inline-flex items-center gap-2 rounded-full bg-[#e11d48] px-4 py-2.5 text-xs font-semibold text-[#fff] shadow-[0_10px_30px_rgba(225,29,72,0.25)] transition hover:-translate-y-0.5 hover:bg-[#be123c] sm:px-5 sm:py-3 sm:text-sm">
          Acessar Plataforma <ArrowIcon />
        </a>
      </div>
    </header>
  );
}

function DashboardMockup() {
  const bars = [44, 70, 62, 92, 76, 108, 96, 134, 122, 150, 138, 160, 146];

  return (
    <div className="hero-visual relative flex min-h-[430px] items-center justify-end overflow-hidden border-t border-[#fecdd3] bg-[radial-gradient(circle_at_78%_82%,rgba(225,29,72,0.95),rgba(225,29,72,0.28)_35%,transparent_63%)] p-4 sm:min-h-[520px] sm:p-7 lg:min-h-[620px] lg:border-l lg:border-t-0 md:p-10">
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-[#e11d48] via-[#fb7185] to-transparent opacity-95" />
      <div className="dashboard-shell tilt-3d relative w-full max-w-[610px] overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/88 shadow-[0_24px_70px_rgba(136,19,55,0.18)] backdrop-blur-xl sm:rounded-[2rem] lg:shadow-[0_35px_90px_rgba(136,19,55,0.22)]">
        <div className="flex h-12 items-center border-b border-[#fecdd3] bg-white/90 px-4 sm:h-14 sm:px-6">
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e11d48]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#fecdd3]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#fecdd3]" />
          </div>
          <span className="mx-auto text-xs font-semibold text-[#4c0519]">Dashboard</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr]">
          <aside className="hidden border-r border-[#fecdd3] bg-[#fff5f5] p-5 text-[11px] text-[#9f1239] sm:block">
            <div className="mb-6 h-8 rounded-lg border border-[#fecdd3] bg-white px-3 py-2">Pesquisar</div>
            {["Cobranças", "Clientes", "Comprovantes", "Configurações"].map((item, index) => (
              <div key={item} className={`mb-3 rounded-lg px-3 py-2 ${index === 0 ? "bg-[#fff1f2] text-[#9f1239]" : ""}`}>
                {item}
              </div>
            ))}
          </aside>
          <main className="p-4 sm:p-6">
            <p className="text-xs font-medium text-[#9f1239]">Total recebido no mês</p>
            <h3 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-[#4c0519]">R$ 8.283,35</h3>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-medium text-[#9f1239] sm:mt-5 sm:text-[11px]">
              {['Hoje', 'Ontem', 'Esta semana', 'Este mês'].map((item, index) => (
                <span key={item} className={`rounded-full px-3 py-1.5 ${index === 0 ? 'bg-[#e11d48] text-[#fff]' : 'bg-[#fff1f2]'}`}>{item}</span>
              ))}
            </div>
            <div className="relative mt-5 h-44 overflow-hidden rounded-2xl border border-[#ffe4e6] bg-white sm:mt-7 sm:h-48">
              <div className="absolute inset-0 chart-grid opacity-80" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 190" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="heroArea" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#e11d48" stopOpacity="0.75" />
                    <stop offset="1" stopColor="#e11d48" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 145 C45 132 58 112 94 120 C128 126 132 82 166 91 C203 101 210 70 244 78 C282 85 286 49 320 58 C355 67 372 25 410 40 C448 55 463 52 500 66 L500 190 L0 190Z" fill="url(#heroArea)" />
                <path className="draw-line" d="M0 145 C45 132 58 112 94 120 C128 126 132 82 166 91 C203 101 210 70 244 78 C282 85 286 49 320 58 C355 67 372 25 410 40 C448 55 463 52 500 66" stroke="#e11d48" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2 text-[10px] sm:bottom-4 sm:left-5 sm:right-5 sm:gap-3 sm:text-[11px]">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="rounded-xl border border-[#ffe4e6] bg-white/82 p-2 shadow-sm sm:p-3">
                    <p className="text-[#9f1239]">Pedidos {index === 0 ? "feitos" : index === 1 ? "pagos" : "pendentes"}</p>
                    <p className="mt-1 font-semibold text-[#4c0519]">{index === 0 ? 652 : index === 1 ? 231 : 245}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="phone-mock float-3d absolute top-1/2 left-6 hidden w-[190px] -translate-y-1/2 rounded-[2rem] border border-white/70 bg-white p-4 shadow-[0_25px_60px_rgba(136,19,55,0.22)] md:block lg:left-12">
        <div className="mb-4 flex justify-between text-[10px] font-semibold text-[#4c0519]"><span>9:41</span><span>● ●</span></div>
        <p className="text-[11px] font-semibold text-[#4c0519]">Dashboard</p>
        <p className="mt-5 text-[10px] text-[#9f1239]">Total recebido</p>
        <p className="text-2xl font-semibold tracking-[-0.05em] text-[#4c0519]">R$ 8.283,35</p>
        <div className="mt-3 inline rounded-full bg-[#e11d48] px-2 py-1 text-[10px] font-semibold text-[#fff]">Hoje</div>
        <div className="mt-5 flex h-24 items-end gap-1.5">
          {bars.map((height, index) => (
            <span key={`${height}-${index}`} className="w-full rounded-t bg-[#e11d48]" style={{ height: `${height / 2.1}px`, opacity: 0.35 + index / 25 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="section-frame overflow-hidden">
      <div className="grid lg:min-h-[620px] lg:grid-cols-[45%_55%]">
        <div className="flex flex-col justify-center px-5 py-14 sm:px-7 sm:py-16 md:px-20 lg:py-10">
          <h1 className="max-w-[540px] text-5xl font-semibold leading-[0.98] tracking-[-0.07em] text-[#4c0519] sm:text-6xl md:text-7xl md:leading-[0.96]">
            Receba PIX <span className="text-[#f43f5e]">sem CNPJ.</span> Sem maquininha.
          </h1>
          <p className="mt-6 max-w-[440px] text-lg leading-7 text-[#881337] sm:mt-8 sm:text-xl sm:leading-8">
            Crie um link de cobrança em segundos, mande no WhatsApp e receba na hora. Feito pra quem trabalha por conta própria.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-12 sm:gap-6">
            <a href="/entrar" className="inline-flex items-center gap-2 rounded-full bg-[#e11d48] px-6 py-4 text-sm font-semibold text-[#fff] shadow-[0_16px_34px_rgba(225,29,72,0.38)] transition hover:-translate-y-0.5">
              Acessar Plataforma <ArrowIcon />
            </a>
            <a href="#como-funciona" className="text-sm font-semibold text-[#4c0519] transition hover:text-[#f43f5e]">Como funciona?</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-5 text-sm font-semibold text-[#4c0519] sm:mt-16 sm:gap-x-10">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1f2] text-sm font-bold text-[#e11d48]">CPF</span>
              <span>Sem CNPJ<br /><small className="font-medium text-[#9f1239]">Cadastro só com seu CPF</small></span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1f2] text-sm font-bold text-[#e11d48]">2%</span>
              <span>Sem mensalidade<br /><small className="font-medium text-[#9f1239]">Só paga quando vende</small></span>
            </div>
          </div>
        </div>
        <DashboardMockup />
      </div>
    </section>
  );
}

const featureStrip = [
  ["Sem CNPJ", "Cadastro só com CPF. Em 2 minutos sua conta tá pronta pra cobrar."],
  ["Sem maquininha", "Esquece aluguel e mensalidade. Só um link e o PIX do cliente."],
  ["Sem mensalidade", "Você só paga quando vende. 2% por transação confirmada e acabou."],
  ["Sem complicação", "Painel claro, comprovante automático e suporte que responde na hora."],
];

function FeatureStrip() {
  return (
    <section id="como-funciona" className="section-frame border-t border-[#fecdd3]">
      <div className="grid md:grid-cols-4">
        {featureStrip.map(([title, copy]) => (
          <div key={title} className="border-b border-[#fecdd3] px-5 py-10 md:min-h-[250px] md:border-l md:px-7 md:py-20 md:first:border-l-0 md:border-b-0">
            <div className="mb-7 text-[#4c0519]"><PixIcon /></div>
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#4c0519]">{title}</h3>
            <p className="mt-3 max-w-[320px] text-sm leading-7 text-[#881337] md:mt-4 md:max-w-[230px]">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CostIntro() {
  return (
    <section id="taxas" className="section-frame diagonal-band border-t border-[#fecdd3]">
      <div className="flex flex-col justify-center gap-8 px-5 py-12 sm:px-7 md:min-h-[260px] md:flex-row md:items-center md:justify-between md:px-20 md:py-16">
        <div>
          <h2 className="max-w-[680px] text-4xl font-semibold leading-[1.03] tracking-[-0.065em] text-[#4c0519] sm:text-5xl sm:leading-[1]">
            Link, QR Code e comprovante. <br /><span className="text-[#f43f5e]">Quanto custa pra você?</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-[#881337] sm:mt-6 sm:text-lg">2% por venda. Sem mensalidade, sem adesão, sem taxa escondida no boleto.</p>
        </div>
        <a href="#precos" className="inline-flex items-center gap-2 text-sm font-semibold text-[#f43f5e]">Ver na calculadora <ArrowIcon /></a>
      </div>
    </section>
  );
}

const channels = [
  ["WhatsApp", "Mande direto pro cliente"],
  ["Instagram", "Bio, stories ou direct"],
  ["Card pronto", "Imagem pra postar"],
  ["Email", "Assinatura ou inbox"],
  ["QR Code", "Pessoalmente, no balcão"],
  ["Link curto", "cloudepay.com.br/seu-nome"],
];

function Integrations() {
  return (
    <section id="para-quem-e" className="section-frame dot-field relative overflow-hidden border-t border-[#fecdd3] px-5 py-16 text-center sm:px-7 md:min-h-[500px] md:px-20 md:py-24">
      <span className="rounded-full border border-[#fecdd3] bg-white px-4 py-2 text-xs font-semibold text-[#4c0519]">Onde compartilhar</span>
      <h2 className="mx-auto mt-7 max-w-[680px] text-4xl font-semibold leading-[1.05] tracking-[-0.065em] text-[#4c0519] sm:mt-8 sm:text-5xl">
        Manda o link onde o cliente <br /> tá. Ele paga onde quiser.
      </h2>
      <p className="mx-auto mt-5 max-w-[540px] text-base leading-7 text-[#881337] sm:mt-6 sm:text-lg sm:leading-8">
        Cada cobrança gera um link único e um card visual pronto pra postar. O cliente abre, vê seu nome e o valor, paga com o PIX do banco dele e pronto. Sem app, sem cadastro, sem maquininha.
      </p>
      <a href="/entrar" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#e11d48] px-6 py-4 text-sm font-semibold text-[#fff] shadow-[0_16px_34px_rgba(225,29,72,0.28)]">
        Acessar Plataforma <ArrowIcon />
      </a>
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {channels.map(([title], index) => {
          const positions = [
            "left-[10%] top-[27%]",
            "left-[15%] bottom-[24%]",
            "left-[29%] bottom-[13%]",
            "right-[13%] top-[26%]",
            "right-[9%] bottom-[24%]",
            "right-[24%] bottom-[12%]",
          ];
          return (
            <span key={title} className={`float-pill pill-3d absolute ${positions[index]} rounded-full border border-[#fecdd3] bg-white px-5 py-3 text-sm font-semibold text-[#4c0519] shadow-[0_14px_35px_rgba(136,19,55,0.18)]`} style={{ animationDelay: `${index * 0.45}s` }}>
              {title}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function LinkShowcase() {
  return (
    <section className="section-frame grid border-t border-[#fecdd3] lg:grid-cols-2">
      <div className="dot-field perspective-stage border-b border-[#fecdd3] p-5 sm:p-8 lg:min-h-[360px] lg:border-b-0 lg:border-r">
        <div className="card-tilt-left mx-auto max-w-[430px] rounded-2xl border border-[#fecdd3] bg-white p-6 shadow-[0_30px_80px_rgba(136,19,55,0.12)]">
          <div className="text-sm font-semibold text-[#f43f5e]">cloudepay.com.br/mariadesign</div>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1f2] text-lg font-semibold text-[#4c0519]">MS</div>
            <div>
              <h3 className="text-xl font-semibold text-[#4c0519]">Maria Santos</h3>
              <p className="text-sm text-[#9f1239]">Identidade visual completa</p>
            </div>
          </div>
          <div className="mt-8 rounded-2xl bg-[#fff5f5] p-5">
            <p className="text-sm text-[#9f1239]">Valor a pagar</p>
            <p className="mt-1 text-4xl font-semibold tracking-[-0.06em] text-[#4c0519]">R$ 1.200,00</p>
            <div className="mt-5 rounded-xl bg-[#4c0519] px-5 py-4 text-center text-sm font-semibold text-white">Pagar com PIX</div>
          </div>
          <p className="mt-5 text-center text-sm text-[#9f1239]">QR Code e copia-e-cola gerados na hora</p>
        </div>
      </div>
      <div className="dot-field perspective-stage p-5 sm:p-8 lg:min-h-[360px]">
        <div className="card-tilt-right mx-auto max-w-[430px] rounded-3xl border border-[#fecdd3] bg-white/90 p-7 shadow-[0_30px_80px_rgba(136,19,55,0.1)]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-[#f43f5e]">PIX confirmado</span>
              <p className="mt-2 text-4xl font-semibold tracking-[-0.07em] text-[#4c0519]">R$ 1.176,00</p>
            </div>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e11d48] text-[#fff]">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#fecdd3] p-5">
              <p className="text-lg font-semibold text-[#4c0519]">Cliente</p>
              <p className="mt-2 text-sm text-[#9f1239]">recebeu comprovante</p>
            </div>
            <div className="rounded-2xl border border-[#fecdd3] p-5">
              <p className="text-lg font-semibold text-[#4c0519]">Painel</p>
              <p className="mt-2 text-sm text-[#9f1239]">marcou como paga</p>
            </div>
          </div>
          <p className="mt-7 text-sm leading-7 text-[#881337]">
            O cliente pagou pelo app do banco. Você foi avisado em segundos, o comprovante saiu automático e a cobrança virou "paga" no seu painel.
          </p>
        </div>
      </div>
    </section>
  );
}

const suite = [
  ["PIX automático", "QR Code e copia-e-cola gerados na hora pra cada cobrança. O cliente paga no app do banco e pronto."],
  ["Card visual da cobrança", "Cada link vira uma imagem pronta pra mandar no WhatsApp ou postar no story. Cobrança com cara de profissional."],
  ["Painel de fintech", "Pendentes, pagas e expiradas em uma tela só. Tema claro e escuro, no celular ou no computador."],
];

function Suite() {
  return (
    <section className="section-frame border-t border-[#fecdd3]">
      <div className="grid gap-8 px-5 py-16 sm:px-7 md:grid-cols-2 md:px-16 md:py-24 lg:px-20">
        <h2 className="max-w-[540px] text-4xl font-semibold leading-[1.1] tracking-[-0.065em] text-[#4c0519] sm:text-5xl sm:leading-[1.17]">
          Tudo que o autônomo <span className="highlight-word">precisa</span>. Nada do que atrapalha.
        </h2>
        <p className="max-w-[520px] text-base leading-7 text-[#881337] sm:text-lg sm:leading-8 md:pt-5">
          Esquece planilha, print de comprovante e correria pra anotar quem pagou. A CloudePay junta link de cobrança, PIX, comprovante e painel num só lugar, com cara de fintech de verdade.
        </p>
      </div>
      <div className="grid border-t border-[#fecdd3] md:grid-cols-3">
        {suite.map(([title, copy], index) => {
          const Icon = [PixBigIcon, CardShareIcon, PanelIcon][index];
          return (
            <article key={title} className="suite-card border-b border-[#fecdd3] md:min-h-[390px] md:border-l md:first:border-l-0 md:border-b-0">
              <div className="dot-field perspective-stage flex h-40 items-center justify-center border-b border-[#fecdd3] sm:h-48 md:h-56">
                <div className="suite-icon-tile icon-3d" style={{ animationDelay: `${index * 0.4}s` }}>
                  <Icon />
                </div>
              </div>
              <div className="p-5 sm:p-7">
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#4c0519]">{title}.</h3>
                <p className="mt-3 text-sm leading-7 text-[#881337]">{copy}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function Pricing() {
  const [valor, setValor] = useState(5000);
  const TAXA = 0.02;
  const taxaCobrada = valor * TAXA;
  const valorReceber = valor - taxaCobrada;
  const economiaMensal = 39;

  return (
    <section id="precos" className="relative overflow-hidden bg-[#4c0519] text-white">
      <div className="absolute inset-0 opacity-20 world-dots" />
      <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-[#e11d48]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#fb7185]/10 blur-3xl" />
      <div className="mx-auto grid max-w-[1140px] items-center gap-10 px-5 py-14 sm:px-7 md:min-h-[560px] md:grid-cols-[43%_57%] md:px-20 md:py-20">
        <div className="relative z-10">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.065em] sm:text-5xl">
            2% por venda. <br /><span className="text-[#fb7185]">E só.</span>
          </h2>
          <p className="mt-5 max-w-[410px] text-base leading-7 text-white/72 sm:mt-7 sm:text-lg sm:leading-8">
            Arrasta a barrinha e simula quanto você recebe líquido. Se você não vendeu nada, não paga nada. Sem mensalidade, sem adesão, sem pegadinha.
          </p>
          <a href="/entrar" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#e11d48] px-6 py-4 text-sm font-semibold text-[#fff] shadow-[0_16px_40px_rgba(225,29,72,0.45)] transition hover:-translate-y-0.5">
            Acessar Plataforma <ArrowIcon />
          </a>
        </div>

        <div className="calc-3d relative z-10 rounded-3xl border border-white/14 bg-white/[0.06] p-2 shadow-[0_28px_70px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-3 md:shadow-[0_40px_90px_rgba(0,0,0,0.32)]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-center text-sm font-semibold">
            <span className="block w-full rounded-xl bg-[#e11d48] py-3 text-white shadow-[0_10px_25px_rgba(225,29,72,0.4)]">Pix</span>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:mt-4 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-white/78">Você cobra...</p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                arraste a barrinha
              </span>
            </div>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.07em] sm:text-5xl md:text-6xl">{formatBRL(valor)}</p>

            <div className="mt-7">
              <input
                type="range"
                min={50}
                max={50000}
                step={50}
                value={valor}
                onChange={(event) => setValor(Number(event.target.value))}
                className="cloude-range w-full"
                style={{ "--progress": `${((valor - 50) / (50000 - 50)) * 100}%` } as any}
                aria-label="Valor da venda"
              />
              <div className="mt-3 flex justify-between text-xs font-medium text-white/55">
                <span>R$ 50</span>
                <span>R$ 25.000</span>
                <span>R$ 50.000</span>
              </div>
            </div>
          </div>

          <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <span className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#e11d48] text-white shadow-[0_10px_30px_rgba(225,29,72,0.45)]">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14m0 0 6-6m-6 6-6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-lg font-medium text-white/78">Cai na sua conta...</p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[#fb7185] md:text-5xl">
                  {formatBRL(valorReceber)}
                </p>
              </div>
              <div className="text-left text-sm text-white/65 sm:text-right">
                <p>Taxa CloudePay: {formatBRL(taxaCobrada)}</p>
                <p className="mt-2">2% por venda · só PIX</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <span>Maquininha tradicional cobra</span>
            <span className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-white/80">
              R$ {economiaMensal}/mês fixo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: "Antes eu mandava a chave PIX no zap e ficava pedindo print. Agora mando um link com o nome da cliente, valor e tudo bonitinho. Parece outro nível de profissionalismo.",
    name: "Marina C.",
    role: "Manicure · São Paulo",
    initials: "MC",
  },
  {
    quote: "Criei minha conta com CPF em uns 2 minutos. Já cobrei 14 mensalidades de aluno sem precisar de maquininha. Não pago nada de fixo, só os 2% quando o cara paga.",
    name: "Lucas P.",
    role: "Personal trainer · Recife",
    initials: "LP",
  },
  {
    quote: "Faço freela pra cliente diferente todo dia. Cada freela é um link separado, com valor e descrição própria. Eu vejo no painel o que tá pago, pendente e o que expirou.",
    name: "Ana R.",
    role: "Designer · Curitiba",
    initials: "AR",
  },
  {
    quote: "Sou professor de violão particular, sem CNPJ, sem nota. Cobro a aula pelo link, o aluno paga no PIX e o comprovante vai automático pro email dele. Resolveu minha vida.",
    name: "Diego M.",
    role: "Professor particular · BH",
    initials: "DM",
  },
];

function Testimonials() {
  const repeated = [...testimonials, ...testimonials];
  return (
    <section id="depoimentos" className="section-frame overflow-hidden border-t border-[#fecdd3]">
      <div className="dot-field px-5 py-16 text-center sm:px-7 md:px-20 md:py-24">
        <span className="rounded-full border border-[#fecdd3] bg-white px-4 py-2 text-xs font-semibold text-[#4c0519]">Quem já usa</span>
        <h2 className="mx-auto mt-7 max-w-[680px] text-4xl font-semibold leading-[1.08] tracking-[-0.065em] text-[#4c0519] sm:mt-8 sm:text-5xl">
          Autônomos brasileiros que largaram a chave PIX no zap.
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-base leading-7 text-[#881337] sm:text-lg sm:leading-8">Manicure, personal, designer, professor particular: gente que vive de cobrar cliente diferente todo dia e agora cobra com link.</p>
      </div>
      <div className="border-t border-[#fecdd3] bg-[#fff5f5] py-10">
        <div className="testimonial-track flex w-max gap-4 px-5 sm:gap-5 sm:px-7">
          {repeated.map((item, index) => (
            <article key={`${item.name}-${index}`} className="testimonial-card w-[min(340px,calc(100vw-2.5rem))] border border-[#fecdd3] bg-white p-5 shadow-sm sm:w-[410px] sm:p-7">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4c0519] text-sm font-bold text-[#e11d48]">{item.initials}</span>
                  <div>
                    <h3 className="font-semibold text-[#4c0519]">{item.name}</h3>
                    <p className="text-sm text-[#9f1239]">{item.role}</p>
                  </div>
                </div>
                <span className="text-2xl font-semibold text-[#e11d48]">CP</span>
              </div>
              <p className="text-lg leading-8 text-[#881337]">{item.quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Support() {
  return (
    <section className="section-frame grid border-t border-[#fecdd3] lg:grid-cols-2">
      <div className="support-image relative min-h-[360px] overflow-hidden border-b border-[#fecdd3] sm:min-h-[440px] lg:min-h-[520px] lg:border-b-0 lg:border-r">
        <img
          src="/images/suporte.jpg"
          alt="Suporte CloudePay"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#4c0519]/35 via-transparent to-[#fff1f2]/20" aria-hidden="true" />
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-white/40 bg-white/85 px-4 py-3 backdrop-blur-md shadow-[0_18px_45px_rgba(76,5,25,0.18)] sm:bottom-6 sm:left-6 sm:right-6 sm:px-5 sm:py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e11d48] text-white">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1.2 4.4A8 8 0 0 1 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="text-sm">
            <p className="font-semibold text-[#4c0519]">Online agora</p>
            <p className="text-[#9f1239]">Resposta média em 4 minutos</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#fff1f2] px-3 py-1 text-xs font-semibold text-[#e11d48]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16a34a]" /> ao vivo
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center px-5 py-14 sm:px-7 md:px-20 md:py-20 lg:min-h-[520px]">
        <span className="mb-7 w-fit rounded-full border border-[#fecdd3] bg-white px-4 py-2 text-xs font-semibold text-[#4c0519]">Suporte humano</span>
        <h2 className="max-w-[470px] text-4xl font-semibold leading-[1.08] tracking-[-0.065em] text-[#4c0519] sm:text-5xl">Gente de verdade do outro lado, em dia útil.</h2>
        <p className="mt-5 max-w-[440px] text-base leading-7 text-[#881337] sm:mt-7 sm:text-lg sm:leading-8">Travou na hora de criar a conta? Não sabe como mandar o link? Cliente pagou e você quer confirmar? Chama a gente. A resposta vem em minutos, não em 3 dias úteis.</p>
        <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold text-[#4c0519]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#fecdd3] bg-white px-4 py-2 text-[#4c0519] shadow-sm transition hover:-translate-y-0.5 hover:border-[#e11d48] hover:text-[#e11d48]">
            <WhatsAppIcon /> WhatsApp
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#fecdd3] bg-white px-4 py-2 text-[#4c0519] shadow-sm transition hover:-translate-y-0.5 hover:border-[#e11d48] hover:text-[#e11d48]">
            <MailIcon /> Email
          </span>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  ["Preciso ter CNPJ pra usar?", "Não precisa. A CloudePay foi feita pra autônomo brasileiro. Você cria sua conta só com nome, email, senha e CPF, e já pode gerar links de cobrança."],
  ["Quanto tempo leva pro PIX cair?", "Cai na hora. Assim que o cliente paga no app do banco, a CloudePay confirma automaticamente e você é avisado no painel em segundos."],
  ["Tem mensalidade ou taxa fixa?", "Zero. A gente cobra só 2% por transação confirmada. Se você não vendeu nada no mês, não paga nada. Sem letra miúda."],
  ["Meu cliente precisa baixar algum app?", "Não. Ele só abre o link que você mandou, vê o valor e seu nome, copia o código PIX ou escaneia o QR Code no banco dele e paga. Sem cadastro, sem download."],
];

function FAQ() {
  return (
    <section id="faq" className="section-frame grid border-t border-[#fecdd3] px-5 py-16 sm:px-7 md:grid-cols-[43%_57%] md:px-20 md:py-24">
      <div>
        <h2 className="max-w-[520px] text-4xl font-semibold leading-[1.12] tracking-[-0.065em] text-[#4c0519] sm:text-5xl">Tem dúvida? Relaxa, a gente já respondeu.</h2>
        <p className="mt-5 max-w-[500px] text-base leading-7 text-[#881337] sm:mt-7 sm:text-lg sm:leading-8">As perguntas que mais aparecem de quem tá começando a cobrar por link no lugar da chave PIX no zap.</p>
      </div>
      <div className="mt-12 border border-[#fecdd3] md:mt-0">
        {faqs.map(([question, answer]) => (
          <details key={question} className="group border-b border-[#fecdd3] last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-5 text-base font-semibold text-[#4c0519] sm:gap-5 sm:px-6 sm:py-6 sm:text-lg">
              <span className="text-[#f43f5e] transition group-open:rotate-45">+</span>{question}
            </summary>
            <p className="px-10 pb-5 text-sm leading-7 text-[#881337] sm:px-14 sm:pb-6">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="cta" className="section-frame diagonal-band border-t border-[#fecdd3] px-5 py-12 sm:px-7 md:px-20 md:py-20">
      <div className="cta-3d relative overflow-hidden bg-[#e11d48] px-5 py-14 sm:px-8 sm:py-16 md:px-16 md:py-20">
        <div className="cta-aurora absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="cta-grid absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[640px] text-center">
          <h2 className="text-4xl font-semibold leading-[1.04] tracking-[-0.065em] text-white sm:text-5xl md:text-6xl md:leading-[1.02]">
            Você chegou no fim da página.
          </h2>
          <p className="mx-auto mt-5 max-w-[460px] text-base leading-7 text-white/85 sm:mt-7 sm:text-lg sm:leading-8">
            Se você leu até aqui, é porque já entendeu o valor. Cria sua conta com CPF, gera seu primeiro link e cobra hoje.
          </p>
          <a href="/entrar" className="cta-button mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#4c0519] shadow-[0_18px_45px_rgba(76,5,25,0.28)] transition">
            Acessar Plataforma <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

function TerminalModal({ onClose }: { onClose: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const fullText = useMemo(() => [
    "havigah@cloudepay ~ % iniciar manifesto",
    "> A CloudePay pertence à Havigah Umbrella.",
    "> Foi criada com paixão pelo Mateus Oliveira.",
    "> O objetivo? Dar poder para quem trabalha por conta própria.",
    "> Sem CNPJ. Sem maquininha. Sem burocracia.",
    "status: construindo o futuro dos autônomos brasileiros..."
  ], []);

  useEffect(() => {
    let currentLine = 0;
    let currentChar = 0;
    const typingInterval = setInterval(() => {
      if (currentLine < fullText.length) {
        const line = fullText[currentLine];
        if (currentChar < line.length) {
          setLines(prev => {
            const newLines = [...prev];
            if (!newLines[currentLine]) newLines[currentLine] = "";
            newLines[currentLine] += line[currentChar];
            return newLines;
          });
          currentChar++;
        } else {
          currentLine++;
          currentChar = 0;
        }
      } else {
        clearInterval(typingInterval);
      }
    }, 40);
    return () => clearInterval(typingInterval);
  }, [fullText]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0e] shadow-[0_40px_100px_rgba(0,0,0,0.5)] font-mono">
        <div className="flex items-center gap-2 bg-[#1a1a1c] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="flex-1 text-center text-[10px] font-bold uppercase tracking-widest text-white/40">Terminal do Fundador</span>
        </div>
        
        <div className="p-8 text-left sm:p-10 min-h-[360px] flex flex-col">
          <div className="flex-1 space-y-3">
            {lines.map((line, i) => (
              <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-[#9EEA6C]' : i === fullText.length - 1 ? 'text-white/40 text-[11px] uppercase tracking-widest pt-6' : 'text-white/90'}`}>
                {line}{i === lines.length - 1 && i < fullText.length - 1 && <span className="inline-block w-2 h-4 bg-[#9EEA6C] ml-1 animate-pulse align-middle" />}
              </p>
            ))}
            {lines.length === fullText.length && (
              <div className="pt-4 mx-auto w-fit">
                <div className="h-4 w-2 bg-[#9EEA6C] animate-pulse" />
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className={`mt-10 self-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#fb7185] hover:brightness-125 transition-all ${lines.length === fullText.length ? 'opacity-100' : 'opacity-0'}`}
          >
            [ FECHAR_SESSAO ]
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer({ onShowManifest }: { onShowManifest: () => void }) {
  return (
    <footer className="section-frame border-t border-[#fecdd3]">
      <div className="grid gap-9 px-5 py-14 sm:px-7 md:grid-cols-5 md:px-20 md:py-20">
        <div>
          <h4 className="mb-5 text-sm font-semibold text-[#4c0519]">Conta</h4>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="/entrar">Criar conta grátis</a>
          <a className="block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="/entrar">Acessar plataforma</a>
        </div>
        <div>
          <h4 className="mb-5 text-sm font-semibold text-[#4c0519]">Suporte</h4>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="mailto:ajuda@cloudepay.com.br">ajuda@cloudepay.com.br</a>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#">WhatsApp</a>
          <a className="block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#">Central de ajuda</a>
        </div>
        <div>
          <h4 className="mb-5 text-sm font-semibold text-[#4c0519]">Produto</h4>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#">Link de cobrança</a>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#">PIX automático</a>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#">Card visual</a>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#">Painel completo</a>
          <a className="block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#">Comprovante automático</a>
        </div>
        <div>
          <h4 className="mb-5 text-sm font-semibold text-[#4c0519]">Site</h4>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#suite">Para quem é</a>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#feature-strip">Como funciona</a>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#pricing">Taxas</a>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#faq">FAQ</a>
          <a className="mb-3 block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#">Termos de uso</a>
          <a className="block text-sm text-[#881337] hover:text-[#e11d48] transition-colors" href="#">Privacidade</a>
        </div>
        <div>
          <h4 className="mb-5 text-sm font-semibold text-[#4c0519]">CloudePay</h4>
          <p className="text-sm leading-6 text-[#881337]">
            A forma mais simples do autônomo brasileiro receber por PIX. Sem CNPJ, sem mensalidade, sem maquininha.
          </p>
        </div>
      </div>
      <div className="border-t border-[#fecdd3]/50 px-5 py-10 text-center sm:px-7 md:px-20">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <p className="text-xs font-medium text-[#881337]">
          Feito com carinho pra quem trabalha por conta própria. - © 2026 CloudePay
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-[#881337]/50 font-bold">
          por <span 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShowManifest(); }} 
                className="hover:text-[#e11d48] transition-colors cursor-pointer underline underline-offset-2 decoration-[#fecdd3]"
              >
                Havigah Umbrella
              </span>
        </p>
      </div>
    </footer>
  );
}

export default function Landing() {
  const [showManifest, setShowManifest] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#4c0519] antialiased page-grid">
      <Header />
      <main>
        <Hero />
        <FeatureStrip />
        <CostIntro />
        <Integrations />
        <LinkShowcase />
        <Suite />
        <Pricing />
        <Testimonials />
        <Support />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer onShowManifest={() => setShowManifest(true)} />
      {showManifest && <TerminalModal onClose={() => setShowManifest(false)} />}
      <a href="/entrar" aria-label="Acessar plataforma" className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#e11d48] text-[#fff] shadow-[0_12px_30px_rgba(225,29,72,0.32)] transition hover:scale-105 sm:bottom-7 sm:right-7 sm:h-14 sm:w-14 sm:shadow-[0_15px_40px_rgba(225,29,72,0.38)]">
        <ArrowIcon />
      </a>
    </div>
  );
}
