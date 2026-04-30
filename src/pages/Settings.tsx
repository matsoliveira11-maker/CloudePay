import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";

// --- Icons ---

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

function LinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10h9M10 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9f1239]">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-[#9f1239]/80">{hint}</p>}
    </div>
  );
}

// --- Page Component ---

export default function Settings() {
  const { profile, signOut, refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"dashboard" | "produtos" | "perfil">("perfil");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    slug: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        slug: profile.slug || "",
      });
    }
  }, [profile]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await api.updateProfile(profile.id, {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      });
      await refresh();
      alert("Perfil atualizado!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleConnectMP = () => {
    const clientId = (import.meta as any).env.VITE_MP_CLIENT_ID;
    const redirectUri = (import.meta as any).env.VITE_REDIRECT_URI;
    const authUrl = `https://auth.mercadopago.com.br/authorization?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read%20write%20offline_access&state=${profile?.id}`;
    window.location.href = authUrl;
  };

  const isConnected = !!profile?.mp_access_token;

  return (
    <main className="min-h-screen bg-[#fffafa] text-[#4c0519] antialiased page-grid">
      <header className="sticky top-0 z-40 border-b border-[#fecdd3] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <Link to="/dashboard" className="inline-flex"><Logo /></Link>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[#fecdd3] bg-white px-4 py-2 text-sm font-semibold text-[#881337] sm:inline-flex">
              cloudepay.com.br/{profile?.slug || "carregando"}
            </span>
            <button
              type="button"
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
          <div className="space-y-5 sm:space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e11d48]">Meu perfil</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.065em] text-[#4c0519] sm:text-5xl">Sua conta, seus dados.</h1>
              <p className="mt-4 max-w-[560px] text-base leading-7 text-[#881337]">Atualize suas informações, seu slug público e conecte sua conta do Mercado Pago.</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <section className="rounded-3xl border border-[#fecdd3] bg-white p-4 shadow-[0_14px_36px_rgba(136,19,55,0.06)] sm:p-6 sm:shadow-[0_18px_50px_rgba(136,19,55,0.07)]">
                <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#4c0519]">Informações pessoais</h2>
                <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleUpdate}>
                  <Field label="Nome completo" id="perfil-nome">
                    <input className="auth-input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                  </Field>
                  <Field label="Email" id="perfil-email">
                    <input className="auth-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </Field>
                  <Field label="Slug da conta" id="perfil-slug" hint="Esse é seu endereço público de cobrança.">
                    <input className="auth-input" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                  </Field>
                  <Field label="Link público" id="perfil-link">
                    <input className="auth-input" readOnly value={`cloudepay.com.br/${formData.slug}`} />
                  </Field>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-[#e11d48] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(225,29,72,0.28)] transition hover:-translate-y-0.5">
                      {loading ? "Atualizando..." : "Atualizar dados"} <ArrowIcon />
                    </button>
                  </div>
                </form>
              </section>
              <section className="rounded-3xl border border-[#fecdd3] bg-[#4c0519] p-4 text-white shadow-[0_18px_50px_rgba(76,5,25,0.18)] sm:p-6 sm:shadow-[0_24px_70px_rgba(76,5,25,0.2)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#fb7185]"><LinkIcon className="h-5 w-5" /></span>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">Conectar Mercado Pago</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">Conecte sua conta para receber pagamentos PIX com confirmação automática, webhook validado e conciliação no painel.</p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-white/75">
                  <p>Status: <span className="font-semibold text-[#fb7185]">{isConnected ? "conectado" : "não conectado"}</span></p>
                  <p className="mt-1">Conta: {isConnected ? "autorizada" : "aguardando autorização"}</p>
                </div>
                <button type="button" onClick={handleConnectMP} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-[#4c0519] transition hover:-translate-y-0.5">
                  {isConnected ? "Trocar conta" : "Conectar conta"} <ArrowIcon />
                </button>
              </section>
            </div>
          </div>
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
  );
}
