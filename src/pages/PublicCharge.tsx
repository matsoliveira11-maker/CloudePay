import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Logo from "../components/Logo";
import * as api from "../lib/api";
import type { Charge, Profile } from "../lib/mockBackend";
import { formatBRL } from "../lib/format";
import {
  CopySimple,
  CheckCircle,
  Clock,
  ShieldCheck,
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === "loading" && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-8 w-8 animate-spin rounded-full border-2 border-white/5 border-t-[#9EEA6C]"
          />
        )}

        {stage === "notfound" && (
          <motion.div 
            key="notfound"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Logo variant="white" size="sm" />
            <h1 className="mt-6 text-xl font-heading font-extrabold text-white/40 uppercase tracking-widest">Link expirado ou inválido</h1>
            <button onClick={() => nav("/")} className="mt-8 text-sm font-bold text-[#9EEA6C] underline underline-offset-4">Voltar ao início</button>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[440px] space-y-4"
    >
      <div className="flex flex-col items-center gap-3 mb-2">
        <Logo size="sm" variant="white" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <ShieldCheck size={12} className="text-[#9EEA6C]" />
          <span className="text-[9px] font-heading font-extrabold uppercase tracking-widest text-white/50">Pagamento Seguro</span>
        </div>
      </div>

      {/* O CARD PREMIUM */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#121212] to-[#080808] border border-white/10 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-[#9EEA6C]/5 blur-3xl rounded-full" />
        
        <div className="grid grid-cols-[1fr_auto] items-start gap-4">
          <div className="min-w-0 flex flex-col justify-center h-full">
            <p className="text-[9px] font-heading font-extrabold uppercase tracking-[0.2em] text-white/30 mb-2">Payment Request</p>
            <h1 className="text-[20px] sm:text-[24px] font-heading font-black leading-tight break-words mb-3">{charge.service_name}</h1>
            
            <p className="text-[9px] font-heading font-extrabold uppercase tracking-[0.2em] text-white/30 mb-1">Amount Due</p>
            <div className="text-[32px] sm:text-[40px] font-heading font-black text-white leading-none tracking-tight break-all">
              {formatBRL(charge.amount_cents)}
            </div>
            
            <p className="mt-4 text-[10px] font-medium text-white/50 truncate">
              Para: <span className="text-white font-bold">{profile.full_name}</span>
            </p>
          </div>

          <div className="shrink-0">
            <div className="p-2 bg-white rounded-2xl shadow-lg">
              <img src={charge.qr_code_image} alt="QR Code" className="h-24 w-24 sm:h-28 sm:w-28" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock size={14} weight="bold" />
            <span className="text-[11px] font-heading font-black uppercase tracking-widest">{mm}:{ss}</span>
          </div>
          <p className="text-[9px] font-heading font-extrabold uppercase tracking-[0.15em] text-white/20">CloudePay Network</p>
        </div>
      </div>

      {/* BOTÃO COPIAR - ESTILO CARD */}
      <button
        onClick={copyPix}
        className={`w-full rounded-2xl py-4 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${
          copied ? "bg-emerald-500" : "bg-[#9EEA6C]"
        }`}
      >
        {copied ? (
          <>
            <CheckCircle size={20} weight="bold" className="text-white" />
            <span className="font-heading font-black text-white uppercase tracking-wider text-xs">Copiado com Sucesso</span>
          </>
        ) : (
          <>
            <CopySimple size={20} weight="bold" className="text-[#0a0a0a]" />
            <span className="font-heading font-black text-[#0a0a0a] uppercase tracking-wider text-xs">Copiar Código PIX</span>
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-heading font-bold">
          Aguardando Confirmação Automática...
        </p>
        
        <button onClick={simulate} className="mt-8 text-[9px] font-heading font-extrabold text-white/10 uppercase tracking-widest hover:text-[#9EEA6C]/40 transition-colors">
          Simular Pagamento (Demo)
        </button>
      </div>
    </motion.div>
  );
}

// ---------- SUCCESS ----------

function SuccessStage({ charge, profile }: { charge: Charge; profile: Profile }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-[400px] text-center"
    >
      <div className="mb-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#9EEA6C] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(158,234,108,0.3)]">
          <CheckCircle size={44} weight="bold" className="text-[#0a0a0a]" />
        </div>
        <h1 className="text-3xl font-heading font-black mb-2 uppercase tracking-tight text-white">Pago!</h1>
        <p className="text-white/40 text-sm font-medium">Obrigado pelo seu pagamento.</p>
      </div>

      <div className="rounded-[32px] bg-white/5 border border-white/10 p-6 space-y-4">
        <ReceiptRow label="Valor" value={formatBRL(charge.amount_cents)} />
        <ReceiptRow label="Para" value={profile.full_name} />
        <ReceiptRow label="Serviço" value={charge.service_name} />
      </div>

      <p className="mt-8 text-[10px] text-white/20 uppercase tracking-[0.2em] font-heading font-bold">
        Comprovante enviado para seu e-mail.
      </p>
    </motion.div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-white/30">{label}</span>
      <span className="text-sm font-heading font-bold text-white">{value}</span>
    </div>
  );
}
