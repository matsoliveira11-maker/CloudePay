import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import { formatBRL } from "../lib/format";
import QRCode from "qrcode";

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

function ClockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

// --- Logic ---

export default function PublicCharge() {
  const { slug, chargeId } = useParams<{ slug: string; chargeId: string }>();
  const [charge, setCharge] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"pending" | "paid" | "expired">("pending");
  const [generatedQr, setGeneratedQr] = useState<string>("");
  const intervalRef = useRef<number | null>(null);

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
      if (!chargeId || !slug) return;
      try {
        // Busca a cobrança validando o slug do proprietário
        const c = await api.getChargeBySlugAndId(slug, chargeId);
        if (!c) {
          setCharge(null);
          return;
        }
        setCharge(c);
        setStatus(c.status);
        const p = await api.getProfileById(c.profile_id);
        setProfile(p);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chargeId, slug]);

  useEffect(() => {
    if (status === "paid" || status === "expired" || !chargeId) return;

    intervalRef.current = window.setInterval(async () => {
      const c = await api.getCharge(chargeId);
      if (c && c.status !== status) {
        setStatus(c.status);
        if (c.status === "paid") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }
    }, 5000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [chargeId, status]);

  const copyPix = () => {
    if (!charge?.pix_code) return;
    navigator.clipboard.writeText(charge.pix_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000000]">
        <div className="h-10 w-10 border-2 border-white/5 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!charge) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] p-6 text-center">
        <div className="mb-8 opacity-20"><Logo variant="light" /></div>
        <h1 className="text-xl font-bold text-white tracking-tight">Cobrança Não Localizada</h1>
        <p className="mt-3 text-sm text-zinc-500 max-w-[280px]">O link pode ter expirado ou o endereço de destino está incorreto.</p>
        <Link to="/" className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#000000] text-white antialiased flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-1000">
        <div className="mb-12 flex flex-col items-center text-center">
          <Logo variant="light" />
          <div className="mt-6 flex items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <ShieldIcon /> Protocolo de Pagamento Seguro
          </div>
        </div>

        {status === "paid" ? (
          <section className="rounded-[3rem] border border-white/[0.05] bg-white/[0.01] p-10 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-white">Transação Concluída</h1>
            <p className="mt-3 text-zinc-500 text-sm">O pagamento foi processado e autorizado com sucesso.</p>
            
            <div className="mt-10 space-y-3">
              <div className="flex justify-between rounded-2xl border border-white/[0.03] bg-white/[0.02] p-5 text-sm font-medium">
                <span className="text-zinc-600 uppercase text-[10px] font-black tracking-widest">Valor Pago</span>
                <span className="text-white font-bold tracking-tight">{formatBRL(charge.amount_cents)}</span>
              </div>
              <div className="flex justify-between rounded-2xl border border-white/[0.03] bg-white/[0.02] p-5 text-sm font-medium">
                <span className="text-zinc-600 uppercase text-[10px] font-black tracking-widest">Destinatário</span>
                <span className="text-white font-bold tracking-tight">{profile?.full_name}</span>
              </div>
            </div>

            <button onClick={() => window.print()} className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-colors">Imprimir Comprovante</button>
          </section>
        ) : (
          <section className="rounded-[3rem] border border-white/[0.05] bg-[#050505] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Logo variant="light" />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600">Serviço/Produto</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white truncate">{charge.service_name}</h1>
                <p className="mt-2 text-sm text-zinc-500">Destinado a: <span className="text-zinc-300 font-semibold tracking-tight">{profile?.full_name}</span></p>
              </div>
              <div className="rounded-3xl border border-white/[0.08] bg-white p-2.5 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                {(charge.qr_code_image || generatedQr) ? (
                  <img src={charge.qr_code_image || generatedQr} alt="Pix QR" className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl" />
                ) : (
                  <div className="h-28 w-28 sm:h-32 sm:w-32 animate-pulse bg-zinc-100 rounded-xl" />
                )}
              </div>
            </div>

            <div className="mt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600">Valor da Transação</p>
              <div className="mt-2 text-5xl font-bold tracking-tighter text-white">
                {formatBRL(charge.amount_cents)}
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <button
                onClick={copyPix}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl h-16 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
                  copied ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {copied ? "Código Copiado!" : <><CopyIcon /> Copiar Código PIX</>}
              </button>
              
              <div className="flex items-center justify-center gap-2.5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 py-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <ClockIcon /> Aguardando Confirmação da Rede
              </div>
            </div>
          </section>
        )}

        <footer className="mt-12 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800">
                Segurança Biométrica & Criptografia CloudePay Network
            </p>
        </footer>
      </div>
    </main>
  );
}
