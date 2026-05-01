import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as api from "../lib/api";

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

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("senha") as string;

    const res = await api.signIn(email, password);
    setSubmitting(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => navigate("/painel"), 650);
    } else {
      setError(res.error || "Erro ao fazer login");
    }
  }

  return (
    <main className="auth-page relative min-h-screen overflow-hidden bg-white text-[#4c0519] antialiased">
      <div className="auth-aurora absolute inset-0 -z-10" aria-hidden="true" />
      <div className="auth-orb auth-orb-a absolute -left-24 top-20 h-72 w-72 rounded-full" aria-hidden="true" />
      <div className="auth-orb auth-orb-b absolute -right-32 bottom-10 h-[420px] w-[420px] rounded-full" aria-hidden="true" />
      <div className="auth-grid absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

      <header className="relative z-10 border-b border-[#fecdd3]/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between gap-3 px-4 sm:px-6 md:h-20 md:px-9">
          <Link to="/" className="inline-flex"><Logo /></Link>
          <div className="flex items-center gap-2 sm:gap-3">

            <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#4c0519] transition hover:text-[#e11d48] sm:text-sm">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M15 10H6m0 0 4-4m-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Voltar pro site</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1140px] gap-8 px-4 py-10 sm:px-6 sm:py-12 md:px-9 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:py-14">
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#fecdd3] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#4c0519]">
            Plataforma
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1] tracking-[-0.065em] text-[#4c0519] sm:text-5xl md:mt-7 md:text-6xl">
            Bem-vindo de <span className="text-[#e11d48]">volta.</span>
          </h1>
          <p className="mt-5 max-w-[440px] text-base leading-7 text-[#881337] sm:mt-6 sm:text-lg sm:leading-8">
            Acesse seu painel, gere novos links de cobrança e veja em tempo real cada PIX que cair na sua conta.
          </p>

          <div className="card-tilt-right mt-10 hidden max-w-[420px] rounded-2xl border border-[#fecdd3] bg-white p-6 shadow-[0_30px_70px_rgba(136,19,55,0.14)] md:block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9f1239]">PIX recebido</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e11d48] text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#4c0519]">R$ 1.176,00</p>
            <p className="mt-2 text-sm text-[#881337]">de Maria Santos · 14:32</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px] text-[#881337]">
              <span className="rounded-lg bg-[#fff5f5] py-2 text-center">Cliente OK</span>
              <span className="rounded-lg bg-[#fff5f5] py-2 text-center">Comprovante</span>
              <span className="rounded-lg bg-[#fff5f5] py-2 text-center">Painel</span>
            </div>
          </div>
        </div>

        <div className="auth-card-wrap relative">
          <div className="auth-card relative z-10 rounded-3xl border border-[#fecdd3] bg-white p-5 shadow-[0_26px_70px_rgba(136,19,55,0.14)] sm:p-7 md:p-10 md:shadow-[0_40px_100px_rgba(136,19,55,0.18)]">
            <div className="mb-7 grid grid-cols-2 gap-1 rounded-full bg-[#fff1f2] p-1 text-sm font-semibold">
              <button
                type="button"
                className="rounded-full px-4 py-2.5 transition bg-white text-[#4c0519] shadow-sm"
              >
                Entrar
              </button>
              <Link
                to="/cadastro"
                className="rounded-full px-4 py-2.5 transition text-[#9f1239] hover:text-[#4c0519] flex items-center justify-center"
              >
                Criar conta
              </Link>
            </div>

            {done ? (
              <div className="py-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e11d48] text-white">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#4c0519]">
                  Tudo certo!
                </h3>
                <p className="mt-3 text-sm text-[#881337]">
                  Redirecionando você pro painel...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Email" id="email">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="voce@email.com"
                    className="auth-input"
                  />
                </Field>

                <Field label="Senha" id="senha">
                  <div className="relative">
                    <input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="auth-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#9f1239] transition hover:bg-[#fff1f2]"
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 3 21 21" />
                          <path d="M10.6 6.1A10 10 0 0 1 22 12c-1 2-2.5 3.7-4.4 4.9M6.7 6.7C4.6 7.9 3 9.8 2 12c1.8 3.6 5.5 6 10 6 1.6 0 3.1-.3 4.4-.9" />
                          <path d="M14 14a3 3 0 0 1-4-4" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </Field>

                <div className="flex items-center justify-between text-xs text-[#881337]">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="auth-checkbox" defaultChecked />
                    Manter conectado
                  </label>
                  <a href="#" className="font-semibold text-[#e11d48] hover:underline">Esqueci a senha</a>
                </div>

                {error && (
                  <p className="text-center text-sm font-semibold text-red-600 bg-red-50 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="cta-button mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e11d48] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(225,29,72,0.4)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                        <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Carregando...
                    </>
                  ) : (
                    <>
                      Entrar no painel <ArrowIcon />
                    </>
                  )}
                </button>

                <p className="pt-4 text-center text-xs text-[#881337]">
                  Ainda não tem conta? <Link to="/cadastro" className="font-semibold text-[#e11d48] hover:underline">Criar grátis</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
