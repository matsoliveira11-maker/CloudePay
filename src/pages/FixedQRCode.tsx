import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import { formatBRL, maskBRLInput, parseBRLToCents, maskCPFInput } from "../lib/format";
import { isValidCPF, sanitizeText } from "../lib/validators";

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

function ShieldIcon() {
  return (
    <svg className="h-4 w-4 text-[#e11d48]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9f1239]">
        {label}
      </label>
      {children}
    </div>
  );
}

// --- Page Component ---

type Stage = "loading" | "form" | "paying" | "success" | "notfound";

export default function FixedQRCode() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [charge, setCharge] = useState<any>(null);

  // Form State
  const [amount, setAmount] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerCpf, setPayerCpf] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) { setStage("notfound"); return; }
      const p = await api.getProfileBySlug(slug);
      if (!p) { setStage("notfound"); return; }
      setProfile(p);
      setStage("form");
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (stage !== "paying" || !charge?.id) return;

    intervalRef.current = window.setInterval(async () => {
      const c = await api.getCharge(charge.id);
      if (c && c.status === "paid") {
        setCharge(c);
        setStage("success");
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 5000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [stage, charge?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amountCents = parseBRLToCents(amount);
    if (amountCents < 100) { setError("Valor mínimo: R$ 1,00"); return; }
    if (!isValidCPF(payerCpf)) { setError("CPF inválido"); return; }
    if (!payerEmail.includes("@")) { setError("Email inválido"); return; }

    setLoading(true);
    try {
      const c = await api.createFixedQRCodeCharge({
        profile_id: profile.id,
        slug: profile.slug!,
        amount_cents: amountCents,
        payer_name: sanitizeText(payerName),
        payer_cpf: payerCpf.replace(/\D/g, ""),
        payer_email: payerEmail.trim().toLowerCase(),
        description: description.trim() || null,
      });
      setCharge(c);
      setStage("paying");
    } catch (err) {
      setError("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const copyPix = () => {
    if (!charge?.pix_code) return;
    navigator.clipboard.writeText(charge.pix_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (stage === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffafa]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#fecdd3] border-t-[#e11d48]" />
      </div>
    );
  }

  if (stage === "notfound") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffafa] p-6 text-center">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold text-[#4c0519]">Profissional não encontrado</h1>
        <p className="mt-2 text-[#881337]">O link pode estar incorreto ou a conta foi desativada.</p>
        <Link to="/" className="mt-6 font-semibold text-[#e11d48]">Ir para o início</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffafa] text-[#4c0519] antialiased page-grid flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#e11d48] shadow-sm border border-[#fecdd3]">
            <ShieldIcon /> Pagamento 100% Seguro
          </div>
        </div>

        {stage === "form" && (
          <section className="rounded-[2.5rem] border border-[#fecdd3] bg-white p-6 shadow-[0_32px_80px_rgba(76,5,25,0.12)]">
            <div className="mb-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f2] text-[#e11d48] mb-3">
                    <UserIcon className="h-8 w-8" />
                </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#4c0519]">{profile.full_name}</h1>
              <p className="text-sm text-[#881337]">{profile.service_name || "Profissional"}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Valor a pagar" id="f-amount">
                <input className="auth-input text-2xl font-bold" placeholder="R$ 0,00" value={amount} onChange={e => setAmount(maskBRLInput(e.target.value))} required />
              </Field>
              <Field label="Seu nome" id="f-name">
                <input className="auth-input" placeholder="Seu nome completo" value={payerName} onChange={e => setPayerName(e.target.value)} required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CPF" id="f-cpf">
                  <input className="auth-input" placeholder="000.000.000-00" value={payerCpf} onChange={e => setPayerCpf(maskCPFInput(e.target.value))} required />
                </Field>
                <Field label="Email" id="f-email">
                  <input className="auth-input" placeholder="seu@email.com" value={payerEmail} onChange={e => setPayerEmail(e.target.value)} required />
                </Field>
              </div>
              <Field label="Descrição (opcional)" id="f-desc">
                <input className="auth-input" placeholder="Ex: Pagamento serviço" value={description} onChange={e => setDescription(e.target.value)} />
              </Field>

              {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

              <button type="submit" disabled={loading} className="cta-button w-full rounded-2xl bg-[#e11d48] py-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(225,29,72,0.22)] transition hover:-translate-y-0.5">
                {loading ? "Processando..." : "Gerar QR Code PIX"}
              </button>
            </form>
          </section>
        )}

        {stage === "paying" && (
          <section className="rounded-[2.5rem] border border-[#fecdd3] bg-white p-6 shadow-[0_32px_80px_rgba(76,5,25,0.12)] text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9f1239]">Pagar agora</p>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-[#4c0519]">{formatBRL(charge.amount_cents)}</div>
            
            <div className="mt-6 flex justify-center">
                <div className="rounded-2xl border border-[#fecdd3] bg-[#fffafa] p-3">
                    <img src={charge.qr_code_image} alt="QR Code" className="h-48 w-48" />
                </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={copyPix}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition ${
                  copied ? "bg-[#16a34a] text-white" : "bg-[#e11d48] text-white shadow-[0_14px_30px_rgba(225,29,72,0.22)]"
                }`}
              >
                {copied ? "Copiado!" : <><CopyIcon /> Copiar código PIX</>}
              </button>
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#881337]">
                <ClockIcon /> Aguardando pagamento...
              </div>
            </div>
          </section>
        )}

        {stage === "success" && (
          <section className="rounded-[2.5rem] border border-[#fecdd3] bg-white p-8 text-center shadow-[0_32px_80px_rgba(76,5,25,0.12)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#9EEA6C]/20 text-[#006400]">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#4c0519]">Pago!</h1>
            <p className="mt-2 text-[#881337]">Obrigado pelo seu pagamento.</p>
            <div className="mt-8 space-y-2 text-left">
              <div className="flex justify-between border-b border-[#fecdd3] pb-2 text-sm">
                <span className="text-[#881337]">Valor</span>
                <span className="font-bold">{formatBRL(charge.amount_cents)}</span>
              </div>
              <div className="flex justify-between border-b border-[#fecdd3] pb-2 text-sm">
                <span className="text-[#881337]">Para</span>
                <span className="font-bold">{profile.full_name}</span>
              </div>
            </div>
            <p className="mt-8 text-xs text-[#881337]/50">Você já pode fechar esta página.</p>
          </section>
        )}

        <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#881337]/40">
          Powered by CloudePay Network
        </p>
      </div>
    </main>
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
