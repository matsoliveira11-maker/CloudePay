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
    <main className="min-h-screen bg-[#fcfcfc] text-[#4c0519] antialiased flex flex-col items-center py-6 px-4 relative overflow-hidden">
      {/* Premium Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[70%] w-[70%] rounded-full bg-rose-100/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[70%] w-[70%] rounded-full bg-rose-50/40 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] h-[40%] w-[40%] rounded-full bg-blue-50/20 blur-[100px]" />
        
        <div className="absolute inset-0 opacity-[0.04]" 
             style={{ 
               backgroundImage: `radial-gradient(#e11d48 0.8px, transparent 0.8px)`, 
               backgroundSize: '32px 32px' 
             }} 
        />
      </div>

      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-6 flex flex-col items-center text-center">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Logo variant="dark" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 rounded-full border border-[#e11d48]/10 bg-white/60 px-3 py-1 text-[8px] font-bold uppercase tracking-wider text-[#e11d48] backdrop-blur-md shadow-sm"
          >
            <ShieldIcon className="h-3 w-3" /> <span>Gateway Seguro</span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {stage === "form" && (
            <motion.section 
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-[2.5rem] border border-white/80 bg-white/80 p-6 shadow-[0_40px_80px_-20px_rgba(76,5,25,0.1)] backdrop-blur-3xl"
            >
              <div className="mb-6 text-center">
                  <div className="mx-auto h-16 w-16 overflow-hidden rounded-[1.5rem] border border-white bg-white mb-3 shadow-sm p-1">
                      {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Logo" className="h-full w-full object-cover rounded-[1.2rem]" />
                      ) : (
                          <div className="flex h-full w-full items-center justify-center bg-rose-50 text-[#e11d48] font-bold text-base rounded-[1.2rem]">
                              {profile?.full_name?.slice(0, 2).toUpperCase()}
                          </div>
                      )}
                  </div>
                <h1 className="text-xl font-bold tracking-tight text-[#4c0519]">{profile.full_name}</h1>
                <p className="text-[11px] text-[#4c0519]/40 font-semibold tracking-tight">{profile.service_name || "Profissional Verificado"}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Valor do Pagamento" id="f-amount">
                  <input className="auth-input text-3xl font-bold tracking-tighter !bg-[#fcfcfc]/50 border-white focus:border-[#e11d48]/20 transition-all text-[#4c0519] h-14" placeholder="R$ 0,00" value={amount} onChange={e => setAmount(maskBRLInput(e.target.value))} required />
                </Field>
                
                <div className="space-y-3">
                  <Field label="Nome Completo" id="f-name">
                      <input className="auth-input !bg-[#fcfcfc]/50 border-white text-[#4c0519] h-11 text-xs" placeholder="Seu nome" value={payerName} onChange={e => setPayerName(e.target.value)} required />
                  </Field>
                  
                  <div className="grid grid-cols-2 gap-3">
                      <Field label="Seu CPF" id="f-cpf">
                      <input className="auth-input !bg-[#fcfcfc]/50 border-white text-[#4c0519] h-11 text-xs" placeholder="000.000.000-00" value={payerCpf} onChange={e => setPayerCpf(maskCPFInput(e.target.value))} required />
                      </Field>
                      <Field label="Email" id="f-email">
                      <input className="auth-input !bg-[#fcfcfc]/50 border-white text-[#4c0519] h-11 text-xs" placeholder="seu@email.com" value={payerEmail} onChange={e => setPayerEmail(e.target.value)} required />
                      </Field>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest text-center">{error}</p>
                )}

                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-12 rounded-2xl bg-[#e11d48] text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#e11d48]/10 mt-2"
                >
                  {loading ? "Processando..." : "Gerar Código PIX"}
                </motion.button>
              </form>
            </motion.section>
          )}

          {stage === "paying" && (
            <motion.section 
              key="paying"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-[2.5rem] border border-white bg-white/80 p-6 text-center shadow-[0_40px_80px_-20px_rgba(76,5,25,0.1)] backdrop-blur-3xl"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e11d48]">Total</p>
              <div className="mt-1 text-4xl font-bold tracking-tight text-[#4c0519]">
                {formatBRL(charge.amount_cents)}
              </div>
              
              <div className="mt-6 flex justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-[1.8rem] border border-white bg-white p-3 shadow-xl"
                  >
                      {(charge.qr_code_image || generatedQr) ? (
                        <div className="relative">
                            <img src={charge.qr_code_image || generatedQr} alt="QR Code" className="h-44 w-44 rounded-2xl" />
                            <motion.div 
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-[#e11d48]/20 blur-sm pointer-events-none"
                            />
                        </div>
                      ) : (
                        <div className="h-44 w-44 animate-pulse bg-rose-50/50 rounded-2xl" />
                      )}
                  </motion.div>
              </div>

              <div className="mt-8 space-y-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={copyPix}
                  className={`flex w-full h-12 items-center justify-center gap-2 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-lg ${
                    copied ? "bg-emerald-500 text-white" : "bg-[#e11d48] text-white shadow-[#e11d48]/20"
                  }`}
                >
                  {copied ? "PIX Copiado!" : <><CopyIcon /> Copiar Código PIX</>}
                </motion.button>
                
                <div className="flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-wider text-[#4c0519]/30 py-2 bg-[#fcfcfc]/50 rounded-xl">
                  <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                  <span>Aguardando Confirmação Instantânea</span>
                </div>
              </div>
            </motion.section>
          )}

          {stage === "success" && (
            <motion.section 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[2.5rem] border border-white bg-white/80 p-10 text-center shadow-[0_40px_80px_-20px_rgba(76,5,25,0.1)] backdrop-blur-3xl"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100 mb-6">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#4c0519]">Pagamento Realizado</h1>
              <p className="mt-2 text-[#4c0519]/60 text-xs font-medium">Sua transferência foi confirmada.</p>
              
              <div className="mt-8 space-y-4 text-left">
                <div className="flex justify-between border-b border-[#4c0519]/5 pb-3 text-xs">
                  <span className="text-[#4c0519]/30 uppercase text-[9px] font-bold">Valor</span>
                  <span className="font-bold text-[#4c0519]">{formatBRL(charge.amount_cents)}</span>
                </div>
                <div className="flex justify-between border-b border-[#4c0519]/5 pb-3 text-xs">
                  <span className="text-[#4c0519]/30 uppercase text-[9px] font-bold">Favorecido</span>
                  <span className="font-bold text-[#4c0519]">{profile.full_name}</span>
                </div>
              </div>
              <p className="mt-8 text-[8px] font-bold uppercase tracking-widest text-[#4c0519]/20">Esta página já pode ser fechada.</p>
            </motion.section>
          )}
        </AnimatePresence>

        <footer className="mt-8 text-center opacity-40">
             <div className="flex items-center justify-center gap-4">
                <span className="text-[7px] font-bold uppercase tracking-[0.4em] text-[#4c0519]">CLOUDEPAY NETWORK · SECURE TRANSACTION</span>
             </div>
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
