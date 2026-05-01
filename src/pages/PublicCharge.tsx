import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";
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

function ShieldIcon() {
  return (
    <svg className="h-4 w-4 text-[#e11d48]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
    <main className="min-h-screen bg-[#000000] text-white antialiased flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-1000">
        <div className="mb-12 flex items-center justify-between">
          <Logo variant="light" />
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <ShieldIcon /> Pagamento 100% Seguro
          </div>
        </div>

        {status === "paid" ? (
          <div className="flex flex-col items-center">
            <div ref={receiptRef} className="w-full max-w-md rounded-[3rem] border border-white/[0.05] bg-[#050505] p-10 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Logo variant="light" />
                </div>
                
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-8">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Comprovante de Pagamento</p>
                <h1 className="mt-4 text-5xl font-bold tracking-tighter text-white">{formatBRL(charge.amount_cents)}</h1>
                
                <div className="mt-10 space-y-4 text-left">
                  <div className="flex justify-between border-b border-white/[0.03] pb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Status</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Confirmado</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.03] pb-4 text-sm">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Destinatário</span>
                    <span className="text-white font-bold tracking-tight text-xs">{profile?.full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.03] pb-4 text-sm">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Data e Hora</span>
                    <span className="text-white font-medium tracking-tight text-xs">{new Date().toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.03] pb-4 text-sm">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">ID da Transação</span>
                    <span className="text-zinc-500 font-mono text-[10px]">{charge.id.toUpperCase()}</span>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/[0.05]">
                    <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-zinc-800">
                        Autenticado via CloudePay Network
                    </p>
                </div>
            </div>
            
            <div className="mt-8 flex gap-4">
                <button 
                    onClick={downloadReceipt}
                    className="flex items-center gap-2 rounded-2xl bg-white px-8 h-14 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-zinc-200 transition-all active:scale-95"
                >
                    Baixar Imagem (PNG)
                </button>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 h-14 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all active:scale-95"
                >
                    Imprimir PDF
                </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Lado Esquerdo: Checkout Principal */}
            <section className="rounded-[3rem] border border-white/[0.05] bg-[#050505] overflow-hidden shadow-2xl relative">
                <div className="bg-gradient-to-br from-zinc-900 to-black p-10 sm:p-12 border-b border-white/[0.03]">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Checkout CloudePay</p>
                    <h1 className="mt-4 text-7xl font-bold tracking-tighter text-white">{formatBRL(charge.amount_cents)}</h1>
                    <p className="mt-3 text-zinc-400 font-medium">Cobrança {charge.charge_type === 'avulsa' ? 'Avulsa' : 'Recorrente'}</p>
                    
                    <div className="mt-10 flex items-center gap-4 rounded-3xl border border-white/[0.05] bg-white/[0.02] p-5 w-fit pr-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 font-bold text-white uppercase text-sm">{profile?.full_name?.slice(0, 2)}</div>
                        <div>
                            <p className="text-sm font-bold text-white">{profile?.full_name}</p>
                            <p className="text-xs text-zinc-500 tracking-tight">cloudepay.com.br/{profile?.slug}</p>
                        </div>
                    </div>
                </div>

                <div className="p-10 sm:p-12 grid md:grid-cols-[200px_1fr] gap-12 items-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="rounded-[2.5rem] border border-white/10 bg-white p-3 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                            {(charge.qr_code_image || generatedQr) ? (
                                <img src={charge.qr_code_image || generatedQr} alt="Pix QR" className="h-40 w-40 rounded-2xl sm:h-44 sm:w-44" />
                            ) : (
                                <div className="h-40 w-40 sm:h-44 sm:w-44 animate-pulse bg-zinc-800 rounded-2xl" />
                            )}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Escaneie o QR Code</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">Pague com PIX</h3>
                            <p className="mt-2 text-sm text-zinc-500 leading-relaxed max-w-sm">
                                Abra o app do seu banco, escaneie o QR Code ou copie o código PIX abaixo. A confirmação é instantânea.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Código Copia-e-Cola</p>
                            <div className="flex flex-col gap-2">
                                <div className="rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 font-mono text-[10px] text-zinc-500 break-all leading-relaxed max-h-24 overflow-y-auto">
                                    {charge.pix_code}
                                </div>
                                <button
                                    onClick={copyPix}
                                    className={`w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
                                        copied ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-zinc-200"
                                    }`}
                                >
                                    {copied ? "Código Copiado!" : "Copiar Código PIX"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lado Direito: Instruções e Status */}
            <aside className="space-y-6">
                <div className="rounded-[2.5rem] border border-white/[0.05] bg-[#050505] p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Aguardando Pagamento</span>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-white mb-6 leading-tight">
                        Assim que o PIX cair, esta tela muda sozinha.
                    </h2>

                    <div className="space-y-4">
                        {[
                            { step: 1, text: "Escaneie o QR Code ou copie o código PIX." },
                            { step: 2, text: "Confirme o pagamento no app do banco." },
                            { step: 3, text: "A CloudePay valida e envia o comprovante." }
                        ].map((item) => (
                            <div key={item.step} className="flex items-center gap-4 rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 group transition-all hover:bg-white/[0.03]">
                                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-white text-xs font-black">
                                    {item.step}
                                </div>
                                <p className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setStatus("paid")}
                        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 h-14 text-[9px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                        Simular pagamento confirmado <ArrowIcon />
                    </button>
                </div>

                <div className="rounded-[2.5rem] border border-white/[0.05] bg-white/[0.01] p-6 text-center">
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800">
                        Powered by CloudePay Network
                    </p>
                </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
