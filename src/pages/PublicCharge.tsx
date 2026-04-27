import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import * as api from "../lib/api";
import type { Charge, Profile } from "../lib/mockBackend";
import { formatBRL } from "../lib/format";
import {
  QrCode,
  CopySimple,
  CheckCircle,
  Clock,
  ShieldCheck,
  Warning,
} from "phosphor-react";
import { motion, AnimatePresence } from "framer-motion";

type Stage = "loading" | "paying" | "success" | "notfound";

export default function PublicCharge() {
  const { slug, chargeId } = useParams<{ slug: string; chargeId: string }>();
  const nav = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [charge, setCharge] = useState<Charge | null>(null);
  const [stage, setStage] = useState<Stage>("loading");

  useEffect(() => {
    async function load() {
      try {
        if (!slug || !chargeId) { setStage("notfound"); return; }
        const [p, c] = await Promise.all([
          api.getProfileBySlug(slug),
          api.getChargeBySlugAndId(slug, chargeId),
        ]);
        
        if (!p || !c) { setStage("notfound"); return; }
        
        setProfile(p);
        setCharge(c);
        
        if (c.status === "paid") {
          setStage("success");
        } else if (c.status === "expired") {
          setStage("notfound");
        } else {
          setStage("paying");
        }
      } catch (err) {
        console.error("Erro ao carregar cobrança:", err);
        setStage("notfound");
      }
    }
    load();
  }, [slug, chargeId]);

  // Renderers
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#9EEA6C]/30">
      <AnimatePresence mode="wait">
        {stage === "loading" && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen items-center justify-center"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/5 border-t-[#9EEA6C]" />
          </motion.div>
        )}

        {stage === "notfound" && (
          <motion.div 
            key="notfound"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
          >
            <div className="mb-8 p-4 bg-white/5 rounded-full">
              <Warning size={40} weight="duotone" className="text-amber-400" />
            </div>
            <Logo variant="white" />
            <h1 className="mt-8 text-2xl font-heading font-extrabold">Link indisponível</h1>
            <p className="mt-3 max-w-xs text-sm text-white/40 font-body leading-relaxed">
              Esta cobrança não foi encontrada, já foi paga ou o link expirou.
            </p>
            <button 
              onClick={() => nav("/")} 
              className="mt-10 rounded-2xl bg-white px-8 py-4 text-sm font-heading font-extrabold text-[#0a0a0a] active:scale-95 transition-transform"
            >
              Voltar ao início
            </button>
          </motion.div>
        )}

        {stage === "paying" && charge && profile && (
          <PixStage
            key="paying"
            charge={charge}
            profile={profile}
            onPaid={(c) => { setCharge(c); setStage("success"); }}
            onExpired={() => setStage("notfound")}
          />
        )}

        {stage === "success" && charge && profile && (
          <SuccessStage key="success" charge={charge} profile={profile} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- PIX (pagando) ----------

function PixStage({
  charge: initial, profile, onPaid, onExpired,
}: {
  charge: Charge;
  profile: Profile;
  onPaid: (c: Charge) => void;
  onExpired: () => void;
}) {
  const [charge, setCharge] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    intervalRef.current = window.setInterval(async () => {
      const c = await api.getCharge(charge.id);
      if (!c) return;
      if (c.status === "paid") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onPaid(c);
      } else if (c.status === "expired") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onExpired();
      } else {
        setCharge(c);
      }
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [charge.id, onPaid, onExpired]);

  const remaining = useMemo(() => {
    const ms = new Date(charge.expires_at).getTime() - now;
    return Math.max(0, Math.floor(ms / 1000));
  }, [charge.expires_at, now]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  async function copyPix() {
    await navigator.clipboard.writeText(charge.pix_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function simulate() {
    await api.simulatePayment(charge.id);
    const c = await api.getCharge(charge.id);
    if (c?.status === "paid") onPaid(c);
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-md flex flex-col min-h-screen px-5 py-8"
    >
      <header className="flex flex-col items-center mb-8">
        <Logo size="sm" variant="white" />
        <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <ShieldCheck size={14} className="text-[#9EEA6C]" weight="fill" />
          <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-white/60">Pagamento Seguro</span>
        </div>
      </header>

      <main className="flex-1 space-y-6">
        {/* Card do Vendedor */}
        <div className="relative overflow-hidden rounded-[32px] bg-white/5 border border-white/10 p-6 text-center">
          <div className="absolute -top-12 -right-12 h-32 w-32 bg-[#9EEA6C]/10 blur-3xl rounded-full" />
          
          <p className="text-[10px] font-heading font-extrabold uppercase tracking-[0.15em] text-white/30 mb-2">Você está pagando para</p>
          <h1 className="text-xl font-heading font-extrabold text-white">{profile.full_name}</h1>
          <div className="mt-4 inline-block px-4 py-2 rounded-2xl bg-[#9EEA6C]/10 border border-[#9EEA6C]/20">
            <span className="text-sm font-medium text-[#9EEA6C]">{charge.service_name}</span>
          </div>
        </div>

        {/* Card do Valor + QR */}
        <div className="rounded-[32px] bg-white/5 border border-white/10 p-6">
          <div className="text-center mb-6">
            <p className="text-[10px] font-heading font-extrabold uppercase tracking-[0.15em] text-white/30 mb-1">Total a pagar</p>
            <div className="text-4xl font-heading font-black text-white tracking-tight">
              {formatBRL(charge.amount_cents)}
            </div>
          </div>

          <div className="relative mx-auto w-fit p-3 bg-white rounded-3xl mb-6 shadow-[0_0_40px_rgba(158,234,108,0.15)]">
            <img
              src={charge.qr_code_image}
              alt="QR Code PIX"
              className="h-56 w-56 sm:h-64 sm:w-64"
            />
            {remaining < 300 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-3xl opacity-0 hover:opacity-100 transition-opacity">
                 <p className="text-xs font-bold text-black">Aproxime o celular</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 py-3 border-t border-white/5">
            <Clock size={16} className="text-amber-400" />
            <span className="text-sm font-heading font-bold text-white/80">
              Expira em <span className="text-amber-400">{mm}:{ss}</span>
            </span>
          </div>
        </div>

        {/* Botão Copiar */}
        <button
          onClick={copyPix}
          className={`relative w-full overflow-hidden rounded-2xl py-4 transition-all active:scale-[0.98] ${
            copied ? "bg-emerald-500" : "bg-[#9EEA6C]"
          }`}
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            {copied ? (
              <>
                <CheckCircle size={20} weight="bold" className="text-white" />
                <span className="font-heading font-extrabold text-white">Código Copiado!</span>
              </>
            ) : (
              <>
                <CopySimple size={20} weight="bold" className="text-[#0a0a0a]" />
                <span className="font-heading font-extrabold text-[#0a0a0a]">Copiar Código PIX</span>
              </>
            )}
          </div>
        </button>

        <p className="text-center text-[11px] text-white/30 px-6 leading-relaxed">
          Após o pagamento, esta página será atualizada automaticamente com seu comprovante.
        </p>

        {/* Demonstração */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-white/20 mb-4">Modo Teste</p>
          <button 
            onClick={simulate}
            className="text-[11px] font-bold text-[#9EEA6C]/60 hover:text-[#9EEA6C] transition-colors underline decoration-[#9EEA6C]/20 underline-offset-4"
          >
            Simular confirmação de pagamento
          </button>
        </div>
      </main>

      <footer className="mt-12 text-center">
        <p className="text-[10px] text-white/20 font-heading font-bold uppercase tracking-widest">Powered by CloudePay</p>
      </footer>
    </motion.div>
  );
}

// ---------- SUCCESS ----------

function SuccessStage({ charge, profile }: { charge: Charge; profile: Profile }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-md flex flex-col min-h-screen px-5 py-8"
    >
      <header className="flex flex-col items-center mb-10">
        <Logo size="sm" variant="white" />
      </header>

      <main className="flex-1">
        <div className="relative overflow-hidden rounded-[40px] bg-white p-8 text-center text-[#0a0a0a] shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500">
            <CheckCircle size={44} weight="fill" className="text-white" />
          </div>
          
          <h1 className="text-3xl font-heading font-black tracking-tight">Sucesso!</h1>
          <p className="mt-2 text-sm font-body text-neutral-500">Pagamento confirmado.</p>
          
          <div className="my-8 h-px bg-neutral-100" />
          
          <div className="space-y-4">
            <ReceiptRow label="Valor" value={formatBRL(charge.amount_cents)} />
            <ReceiptRow label="Para" value={profile.full_name} />
            <ReceiptRow label="Serviço" value={charge.service_name} />
            <ReceiptRow label="Protocolo" value={charge.receipt_number?.slice(0, 8) ?? "—"} />
          </div>

          <button 
            onClick={() => window.print()}
            className="mt-10 w-full rounded-2xl border border-neutral-200 py-4 text-xs font-heading font-extrabold uppercase tracking-widest hover:bg-neutral-50 transition-colors"
          >
            Imprimir Comprovante
          </button>
        </div>

        <p className="mt-10 text-center text-[11px] text-white/30 leading-relaxed">
          Um comprovante detalhado foi enviado para <br/>
          <span className="text-white/60 font-bold">{charge.payer_email}</span>
        </p>
      </main>
    </motion.div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] font-heading font-extrabold uppercase tracking-widest text-neutral-400">{label}</span>
      <span className="text-sm font-heading font-extrabold text-[#0a0a0a]">{value}</span>
    </div>
  );
}
