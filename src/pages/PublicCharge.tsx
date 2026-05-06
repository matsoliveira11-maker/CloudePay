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
      
      if (chargeId.startsWith("demo_")) {
        setCharge({
          id: chargeId,
          amount_cents: 15000,
          service_name: "Serviço de Demonstração",
          status: "pending",
          created_at: new Date().toISOString(),
          pix_code: "00020126360014BR.GOV.BCB.PIX.DEMO.MODE.LINK.NODE",
          qr_code_image: "",
        });
        setProfile({
          full_name: "Conta de Demonstração",
          slug: slug,
          avatar_url: null
        });
        setLoading(false);
        return;
      }

      try {
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
        backgroundColor: "#ffffff",
        scale: 2,
    });
    const link = document.createElement("a");
    link.download = `comprovante-${charge.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <div className="h-10 w-10 border-2 border-[#e11d48]/5 border-t-[#e11d48] rounded-full animate-spin" />
      </div>
    );
  }

  if (!charge) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fcfcfc] p-6 text-center">
        <div className="mb-8 opacity-20"><Logo variant="dark" /></div>
        <h1 className="text-xl font-bold text-[#4c0519] tracking-tight">Cobrança Não Localizada</h1>
        <p className="mt-3 text-sm text-[#4c0519]/60 max-w-[280px]">O link pode ter expirado ou o endereço de destino está incorreto.</p>
        <Link to="/" className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-[#4c0519]/40 hover:text-[#e11d48] transition-colors">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-[#4c0519] antialiased flex flex-col items-center justify-center p-4 selection:bg-[#e11d48]/10 relative overflow-hidden">
      {/* Background Orbs & Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] h-[50%] w-[50%] rounded-full bg-rose-100/50 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[5%] h-[50%] w-[50%] rounded-full bg-rose-50/50 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Logo variant="dark" />
          <div className="flex items-center gap-2 rounded-full border border-[#e11d48]/10 bg-white/60 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#e11d48] backdrop-blur-sm shadow-sm">
            <ShieldIcon className="h-3.5 w-3.5" /> <span>Transação Protegida</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === "paid" ? (
            <motion.div 
              key="paid"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              ref={receiptRef}
              className="rounded-[2.5rem] border border-[#4c0519]/5 bg-white p-8 text-center shadow-[0_32px_64px_-12px_rgba(76,5,25,0.08)] overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                    <Logo variant="dark" />
                </div>
                
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 mb-6 shadow-sm border border-emerald-100"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#4c0519]/40">Pagamento Confirmado</p>
                <h1 className="mt-2 text-5xl font-bold tracking-tight text-[#4c0519]">{formatBRL(charge.amount_cents)}</h1>
                
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between border-b border-[#4c0519]/5 pb-3.5 text-[11px]">
                    <span className="font-semibold uppercase tracking-wider text-[#4c0519]/30">Recebedor</span>
                    <span className="text-[#4c0519] font-bold">{profile?.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#4c0519]/5 pb-3.5 text-[11px]">
                    <span className="font-semibold uppercase tracking-wider text-[#4c0519]/30">Data e Hora</span>
                    <span className="text-[#4c0519] font-medium">{new Date().toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between pb-1 text-[11px]">
                    <span className="font-semibold uppercase tracking-wider text-[#4c0519]/30">ID Único</span>
                    <span className="text-[#4c0519]/50 font-mono text-[10px]">{charge.id.slice(0, 12).toUpperCase()}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#4c0519]/5 flex flex-col gap-4">
                    <button 
                        onClick={downloadReceipt}
                        className="w-full rounded-2xl bg-[#4c0519] h-12 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-[#e11d48] transition-all active:scale-[0.98] shadow-lg shadow-[#4c0519]/10"
                    >
                        Baixar Comprovante
                    </button>
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#4c0519]/20">
                        CloudePay Network Verified
                    </p>
                </div>
            </motion.div>
          ) : (
            <motion.div 
              key="unpaid"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-[2.5rem] border border-[#4c0519]/5 bg-white shadow-[0_40px_80px_-15px_rgba(76,5,25,0.12)] overflow-hidden relative"
            >
                {/* Top Section: Amount & Store */}
                <div className="p-8 text-center border-b border-[#4c0519]/5 bg-[#fcfcfc]/50">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#e11d48] mb-2.5 opacity-80">Valor da Cobrança</p>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#4c0519]">{formatBRL(charge.amount_cents)}</h1>
                    
                    <div className="mt-8 inline-flex items-center gap-3.5 rounded-2xl border border-[#4c0519]/5 bg-white p-3 pr-5 shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fcfcfc] border border-[#4c0519]/5 shadow-sm">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <div className="font-bold text-[#e11d48] text-sm uppercase">{profile?.full_name?.slice(0, 2)}</div>
                        )}
                      </div>
                      <div className="text-left">
                          <p className="text-[12px] font-bold text-[#4c0519] tracking-tight">{profile?.full_name}</p>
                          <p className="text-[10px] text-[#4c0519]/40 font-medium tracking-tight">@{profile?.slug}</p>
                      </div>
                    </div>
                </div>

                {/* Middle Section: QR Code */}
                <div className="p-8 flex flex-col items-center gap-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#e11d48]/5 blur-3xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        <div className="relative rounded-[2.2rem] border border-[#4c0519]/5 bg-white p-3 shadow-xl transition-all hover:scale-[1.02] duration-500">
                            {(charge.qr_code_image || generatedQr) ? (
                                <img src={charge.qr_code_image || generatedQr} alt="Pix QR" className="h-36 w-36 rounded-2xl" />
                            ) : (
                                <div className="h-36 w-36 animate-pulse bg-zinc-50 rounded-2xl" />
                            )}
                        </div>
                    </div>

                    <div className="w-full space-y-5">
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4c0519]/30">Copia e Cola</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600/80">Aguardando PIX</span>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="rounded-2xl border border-[#4c0519]/10 bg-[#fcfcfc] p-4 pr-14 font-mono text-[11px] text-[#4c0519]/60 break-all line-clamp-2 leading-relaxed h-[56px] transition-colors group-hover:border-[#e11d48]/20 group-hover:bg-white">
                                    {charge.pix_code}
                                </div>
                                <button
                                    onClick={copyPix}
                                    className={`absolute right-2 top-2 h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                                        copied ? "bg-emerald-500 text-white" : "bg-white border border-[#4c0519]/5 text-[#4c0519]/40 hover:text-[#e11d48] hover:border-[#e11d48]/20"
                                    }`}
                                >
                                    {copied ? (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={copyPix}
                            className={`w-full h-14 rounded-2xl text-[11px] font-bold uppercase tracking-[0.25em] transition-all active:scale-[0.98] shadow-lg ${
                                copied ? "bg-emerald-500 text-white shadow-emerald-500/10" : "bg-[#e11d48] text-white hover:bg-[#881337] shadow-[#e11d48]/20"
                            }`}
                        >
                            {copied ? "PIX Copiado!" : "Copiar Código PIX"}
                        </button>
                    </div>
                </div>

                {/* Bottom Section: Hint */}
                <div className="p-5 bg-[#fcfcfc]/50 border-t border-[#4c0519]/5 text-center">
                    <p className="text-[10px] font-medium text-[#4c0519]/40 tracking-tight">
                        A tela atualizará <span className="text-[#4c0519] font-bold italic">automaticamente</span> após o pagamento.
                    </p>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex flex-col items-center gap-4 opacity-40">
             <div className="h-[1px] w-12 bg-[#4c0519]/10" />
             <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#4c0519]/40">
                CLOUDEPAY NETWORK · SECURE TRANSACTION
            </p>
        </div>
      </motion.div>
    </main>
  );
}
