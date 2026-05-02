import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import * as api from "../lib/api";
import { supabase } from "../lib/supabase";

import { formatBRL } from "../lib/format";
import QRCode from "qrcode";
import html2canvas from "html2canvas";

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

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

    // Inscrição em tempo real: a tela muda instantaneamente quando o status no banco muda
    const channel = supabase
      .channel(`public_charge_${chargeId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'charges',
        filter: `id=eq.${chargeId}`,
      }, (payload) => {
        const newStatus = (payload.new as any).status;
        if (newStatus !== status) {
          setStatus(newStatus);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chargeId, status]);

  const copyPix = () => {
    if (!charge?.pix_code) return;
    navigator.clipboard.writeText(charge.pix_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const receiptRef = useRef<HTMLDivElement>(null);

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#000000",
        scale: 2,
    });
    const link = document.createElement("a");
    link.download = `comprovante-${charge.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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
    <main className="min-h-screen bg-[#000000] text-white antialiased flex flex-col items-center justify-center p-4 selection:bg-rose-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-rose-900/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-rose-950/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Logo variant="light" />
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-rose-400/80 backdrop-blur-md">
            <ShieldIcon className="h-3 w-3" /> <span>Transação Protegida</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === "paid" ? (
            <motion.div 
              key="paid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              ref={receiptRef}
              className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black p-8 text-center shadow-2xl backdrop-blur-2xl overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Logo variant="light" />
                </div>
                
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-6"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Pagamento Confirmado</p>
                <h1 className="mt-2 text-5xl font-bold tracking-tighter text-white">{formatBRL(charge.amount_cents)}</h1>
                
                <div className="mt-8 space-y-3.5">
                  <div className="flex justify-between border-b border-white/[0.05] pb-3 text-[10px]">
                    <span className="font-bold uppercase tracking-widest text-zinc-600">Recebedor</span>
                    <span className="text-white font-bold tracking-tight">{profile?.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.05] pb-3 text-[10px]">
                    <span className="font-bold uppercase tracking-widest text-zinc-600">Data e Hora</span>
                    <span className="text-white font-medium tracking-tight">{new Date().toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between pb-1 text-[10px]">
                    <span className="font-bold uppercase tracking-widest text-zinc-600">ID Único</span>
                    <span className="text-zinc-500 font-mono">{charge.id.slice(0, 12).toUpperCase()}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col gap-3">
                    <button 
                        onClick={downloadReceipt}
                        className="w-full rounded-2xl bg-white h-12 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
                    >
                        Baixar Comprovante
                    </button>
                    <p className="text-[7px] font-bold uppercase tracking-[0.4em] text-zinc-700">
                        CloudePay Network Verified
                    </p>
                </div>
            </motion.div>
          ) : (
            <motion.div 
              key="unpaid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-zinc-900/80 to-black shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden relative"
            >
                {/* Top Section: Amount & Store */}
                <div className="p-6 text-center border-b border-white/[0.05]">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-500/60 mb-2">Valor da Cobrança</p>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white drop-shadow-2xl">{formatBRL(charge.amount_cents)}</h1>
                    
                    <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 pr-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-xl shadow-rose-950/20">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <div className="font-black text-[#e11d48] text-sm uppercase">{profile?.full_name?.slice(0, 2)}</div>
                        )}
                      </div>
                      <div className="text-left">
                          <p className="text-[11px] font-bold text-white tracking-tight">{profile?.full_name}</p>
                          <p className="text-[9px] text-zinc-500 font-medium">@{profile?.slug}</p>
                      </div>
                    </div>
                </div>

                {/* Middle Section: QR Code */}
                <div className="p-6 flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full scale-50 group-hover:scale-75 transition-transform duration-1000" />
                        <div className="relative rounded-[2rem] border border-white/10 bg-white p-2.5 shadow-2xl transition-transform hover:scale-[1.02] duration-500">
                            {(charge.qr_code_image || generatedQr) ? (
                                <img src={charge.qr_code_image || generatedQr} alt="Pix QR" className="h-32 w-32 rounded-xl" />
                            ) : (
                                <div className="h-32 w-32 animate-pulse bg-zinc-800 rounded-xl" />
                            )}
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Copia e Cola</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500/80">Aguardando PIX</span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-3.5 pr-12 font-mono text-[10px] text-zinc-400 break-all line-clamp-2 leading-relaxed h-[52px]">
                                    {charge.pix_code}
                                </div>
                                <button
                                    onClick={copyPix}
                                    className={`absolute right-2 top-2 h-9 w-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                                        copied ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                                    }`}
                                >
                                    {copied ? (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={copyPix}
                            className={`w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-lg ${
                                copied ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-white text-black hover:bg-zinc-100 shadow-white/5"
                            }`}
                        >
                            {copied ? "PIX Copiado!" : "Copiar Código PIX"}
                        </button>
                    </div>
                </div>

                {/* Bottom Section: Hint */}
                <div className="p-4 bg-white/[0.02] border-t border-white/[0.05] text-center">
                    <p className="text-[8px] font-medium text-zinc-500 tracking-tight">
                        A tela atualizará <span className="text-white font-bold italic">automaticamente</span> após o pagamento.
                    </p>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex justify-center opacity-30">
             <p className="text-[7px] font-black uppercase tracking-[0.5em] text-zinc-600">
                CLOUDEPAY NETWORK · SECURE TRANSACTION
            </p>
        </div>
      </motion.div>
    </main>
  );
}
