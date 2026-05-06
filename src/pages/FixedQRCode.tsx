import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import { formatBRL, maskBRLInput, parseBRLToCents, maskCPFInput } from "../lib/format";
import QRCode from "qrcode";
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
  const [generatedQr, setGeneratedQr] = useState<string>("");

  useEffect(() => {
    if (charge?.pix_code && !charge?.qr_code_image) {
      QRCode.toDataURL(charge.pix_code, {
        margin: 1,
        width: 600,
        color: { dark: "#000000", light: "#ffffff" }
      }).then(setGeneratedQr);
    }
  }, [charge?.pix_code, charge?.qr_code_image]);

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
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <div className="h-10 w-10 border-2 border-[#e11d48]/5 border-t-[#e11d48] rounded-full animate-spin" />
      </div>
    );
  }

  if (stage === "notfound") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fcfcfc] p-6 text-center">
        <div className="mb-8 opacity-20"><Logo variant="dark" /></div>
        <h1 className="text-xl font-bold text-[#4c0519] tracking-tight">Vendedor Não Localizado</h1>
        <p className="mt-3 text-sm text-[#4c0519]/60 max-w-[280px]">O link pode estar incorreto ou a conta foi desativada.</p>
        <Link to="/" className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-[#4c0519]/40 hover:text-[#e11d48] transition-colors">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-[#4c0519] antialiased flex flex-col items-center py-10 px-4 relative overflow-hidden">
      {/* Background Orbs & Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] h-[50%] w-[50%] rounded-full bg-rose-100/50 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[5%] h-[50%] w-[50%] rounded-full bg-rose-50/50 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="mb-12 flex flex-col items-center text-center">
          <Logo variant="dark" />
          <div className="mt-6 flex items-center gap-2 rounded-full border border-[#e11d48]/10 bg-white/60 px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#e11d48] backdrop-blur-sm shadow-sm">
            <ShieldIcon /> Gateway de Pagamento Seguro
          </div>
        </div>

        {stage === "form" && (
          <section className="rounded-[3rem] border border-[#4c0519]/5 bg-white p-8 shadow-[0_40px_80px_-15px_rgba(76,5,25,0.12)]">
            <div className="mb-10 text-center">
                <div className="mx-auto h-20 w-20 overflow-hidden rounded-[1.8rem] border border-[#4c0519]/5 bg-[#fcfcfc] mb-5 shadow-sm p-1">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Logo" className="h-full w-full object-cover rounded-[1.5rem]" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#e11d48]">
                            <UserIcon className="h-10 w-10 opacity-20" />
                        </div>
                    )}
                </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#4c0519]">{profile.full_name}</h1>
              <p className="mt-1 text-sm text-[#4c0519]/40 font-medium tracking-tight">{profile.service_name || "Profissional Verificado"}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Quanto você quer pagar?" id="f-amount">
                <input className="auth-input text-3xl font-bold tracking-tighter !bg-[#fcfcfc] border-[#4c0519]/5 focus:border-[#e11d48]/20 transition-all text-[#4c0519]" placeholder="R$ 0,00" value={amount} onChange={e => setAmount(maskBRLInput(e.target.value))} required />
              </Field>
              
              <div className="space-y-4">
                <Field label="Seu Nome Completo" id="f-name">
                    <input className="auth-input !bg-[#fcfcfc] border-[#4c0519]/5 text-[#4c0519]" placeholder="Nome do pagador" value={payerName} onChange={e => setPayerName(e.target.value)} required />
                </Field>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Seu CPF" id="f-cpf">
                    <input className="auth-input !bg-[#fcfcfc] border-[#4c0519]/5 text-[#4c0519]" placeholder="000.000.000-00" value={payerCpf} onChange={e => setPayerCpf(maskCPFInput(e.target.value))} required />
                    </Field>
                    <Field label="Seu Melhor Email" id="f-email">
                    <input className="auth-input !bg-[#fcfcfc] border-[#4c0519]/5 text-[#4c0519]" placeholder="seu@email.com" value={payerEmail} onChange={e => setPayerEmail(e.target.value)} required />
                    </Field>
                </div>

                <Field label="Descrição (Opcional)" id="f-desc">
                    <input className="auth-input !bg-[#fcfcfc] border-[#4c0519]/5 text-[#4c0519]" placeholder="Ex: Pagamento serviço" value={description} onChange={e => setDescription(e.target.value)} />
                </Field>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
                    {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full h-16 rounded-2xl bg-[#e11d48] text-white text-[11px] font-bold uppercase tracking-[0.25em] transition-all hover:bg-[#881337] active:scale-[0.98] mt-4 shadow-lg shadow-[#e11d48]/20">
                {loading ? "Processando..." : "Gerar QR Code PIX"}
              </button>
            </form>
          </section>
        )}

        {stage === "paying" && (
          <section className="rounded-[3rem] border border-[#4c0519]/5 bg-white p-10 text-center shadow-[0_40px_80px_-15px_rgba(76,5,25,0.12)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#4c0519]/40">Total a Transferir</p>
            <div className="mt-3 text-5xl font-bold tracking-tight text-[#4c0519]">{formatBRL(charge.amount_cents)}</div>
            
            <div className="mt-10 flex justify-center">
                <div className="rounded-[2.5rem] border border-[#4c0519]/5 bg-white p-3.5 shadow-xl transition-all hover:scale-[1.02] duration-500">
                    {(charge.qr_code_image || generatedQr) ? (
                      <img src={charge.qr_code_image || generatedQr} alt="QR Code" className="h-48 w-48 rounded-2xl sm:h-56 sm:w-56" />
                    ) : (
                      <div className="h-48 w-48 sm:h-56 sm:w-56 animate-pulse bg-zinc-50 rounded-2xl" />
                    )}
                </div>
            </div>

            <div className="mt-12 space-y-4">
              <button
                onClick={copyPix}
                className={`flex w-full h-16 items-center justify-center gap-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.25em] transition-all active:scale-[0.98] shadow-lg ${
                  copied ? "bg-emerald-500 text-white shadow-emerald-500/10" : "bg-[#e11d48] text-white hover:bg-[#881337] shadow-[#e11d48]/20"
                }`}
              >
                {copied ? "Código Copiado!" : <><CopyIcon /> Copiar Código PIX</>}
              </button>
              
              <div className="flex items-center justify-center gap-2.5 text-[9px] font-bold uppercase tracking-wider text-[#4c0519]/30 py-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <ClockIcon /> Aguardando Confirmação em Tempo Real
              </div>
            </div>
          </section>
        )}

        {stage === "success" && (
          <section className="rounded-[3rem] border border-[#4c0519]/5 bg-white p-10 text-center shadow-[0_40px_80px_-15px_rgba(76,5,25,0.12)]">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-[#4c0519]">Pagamento Realizado</h1>
            <p className="mt-3 text-[#4c0519]/60 text-sm font-medium">Obrigado. Sua transferência foi confirmada.</p>
            
            <div className="mt-10 space-y-4 text-left">
              <div className="flex justify-between border-b border-[#4c0519]/5 pb-4 text-sm">
                <span className="text-[#4c0519]/30 uppercase text-[10px] font-bold tracking-wider">Valor</span>
                <span className="font-bold text-[#4c0519] tracking-tight">{formatBRL(charge.amount_cents)}</span>
              </div>
              <div className="flex justify-between border-b border-[#4c0519]/5 pb-4 text-sm">
                <span className="text-[#4c0519]/30 uppercase text-[10px] font-bold tracking-wider">Favorecido</span>
                <span className="font-bold text-[#4c0519] tracking-tight">{profile.full_name}</span>
              </div>
            </div>
            <p className="mt-10 text-[9px] font-bold uppercase tracking-widest text-[#4c0519]/20">Esta página já pode ser fechada.</p>
          </section>
        )}

        <footer className="mt-16 text-center opacity-40">
             <div className="h-[1px] w-12 bg-[#4c0519]/10 mx-auto mb-6" />
             <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#4c0519]/40">
                CLOUDEPAY NETWORK · SECURE TRANSACTION
            </p>
        </footer>
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
