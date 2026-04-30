import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
import { formatBRL } from "../lib/format";

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
  const { chargeId } = useParams<{ chargeId: string }>();
  const [charge, setCharge] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"pending" | "paid" | "expired">("pending");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      if (!chargeId) return;
      try {
        const c = await api.getCharge(chargeId);
        if (!c) return;
        setCharge(c);
        setStatus(c.status);
        const p = await api.getProfileById(c.profile_id);
        setProfile(p);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chargeId]);

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
      <div className="flex min-h-screen items-center justify-center bg-[#fffafa]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#fecdd3] border-t-[#e11d48]" />
      </div>
    );
  }

  if (!charge) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffafa] p-6 text-center">
        <h1 className="text-2xl font-bold text-[#4c0519]">Cobrança não encontrada</h1>
        <p className="mt-2 text-[#881337]">O link pode estar expirado ou incorreto.</p>
        <Link to="/" className="mt-6 font-semibold text-[#e11d48]">Voltar para o início</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffafa] text-[#4c0519] antialiased page-grid flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#e11d48] shadow-sm border border-[#fecdd3]">
            <ShieldIcon /> Pagamento 100% Seguro
          </div>
        </div>

        {status === "paid" ? (
          <section className="rounded-[2.5rem] border border-[#fecdd3] bg-white p-8 text-center shadow-[0_32px_80px_rgba(76,5,25,0.12)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#9EEA6C]/20 text-[#006400]">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#4c0519]">Pagamento confirmado!</h1>
            <p className="mt-2 text-[#881337]">A transação foi processada com sucesso.</p>
            <div className="mt-8 space-y-3 text-left">
              <div className="flex justify-between rounded-2xl bg-[#fffafa] p-4 text-sm font-semibold border border-[#fecdd3]">
                <span className="text-[#881337]">Valor</span>
                <span>{formatBRL(charge.amount_cents)}</span>
              </div>
              <div className="flex justify-between rounded-2xl bg-[#fffafa] p-4 text-sm font-semibold border border-[#fecdd3]">
                <span className="text-[#881337]">Recebedor</span>
                <span>{profile?.full_name}</span>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[2.5rem] border border-[#fecdd3] bg-white p-6 shadow-[0_32px_80px_rgba(76,5,25,0.12)]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9f1239]">Você está pagando</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#4c0519]">{charge.service_name}</h1>
                <p className="mt-1 text-sm text-[#881337]">Para: <strong>{profile?.full_name}</strong></p>
              </div>
              <div className="rounded-2xl border border-[#fecdd3] bg-[#fffafa] p-2">
                <img src={charge.qr_code_image} alt="QR Code PIX" className="h-24 w-24 sm:h-28 sm:w-28" />
              </div>
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9f1239]">Valor total</p>
              <div className="mt-1 text-4xl font-semibold tracking-tight text-[#e11d48]">
                {formatBRL(charge.amount_cents)}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={copyPix}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition ${
                  copied ? "bg-[#16a34a] text-white" : "bg-[#e11d48] text-white shadow-[0_14px_30px_rgba(225,29,72,0.22)]"
                }`}
              >
                {copied ? "Código copiado!" : <><CopyIcon /> Copiar código PIX</>}
              </button>
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#881337]">
                <ClockIcon /> Aguardando pagamento...
              </div>
            </div>
          </section>
        )}

        <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#881337]/40">
          Powered by CloudePay Network
        </p>
      </div>
    </main>
  );
}
