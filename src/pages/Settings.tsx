import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import type { FixedQRCode, Charge } from "../lib/mockBackend";
import { isValidSlug, normalizeSlug, RESERVED_SLUGS, sanitizeText } from "../lib/validators";
import { formatBRL } from "../lib/format";
import Logo from "../components/Logo";
import { Info, ArrowRight, QrCode, CopySimple, CheckCircle, DownloadSimple, WhatsappLogo } from "phosphor-react";
import html2canvas from "html2canvas";

type SlugState = "idle" | "checking" | "available" | "unavailable" | "invalid" | "reserved";

export default function Settings() {
  const { profile, refresh } = useAuth();
  const [service_name, setServiceName] = useState(profile?.service_name ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [slug, setSlug] = useState(profile?.slug ?? "");
  const [slugState, setSlugState] = useState<SlugState>("available");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fixed QR Code state
  const [fixedQRCode, setFixedQRCode] = useState<FixedQRCode | null>(null);
  const [fixedQRCodeCharges, setFixedQRCodeCharges] = useState<Charge[]>([]);
  const [monthFixed, setMonthFixed] = useState(0);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const paymentUrl = useMemo(() => {
    if (!profile?.slug) return "";
    return `${window.location.origin}/${profile.slug}/pagar`;
  }, [profile?.slug]);

  const whatsappUrl = useMemo(() => {
    if (!paymentUrl) return "";
    return `https://wa.me/?text=${encodeURIComponent(
      `Olá! Realize o seu pagamento para ${profile?.full_name || "mim"} escaneando este link:\n${paymentUrl}`
    )}`;
  }, [paymentUrl, profile?.full_name]);

  async function copyLink() {
    if (!paymentUrl) return;
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadQRCode() {
    if (!cardRef.current || !profile) return;
    try {
      // Capture the element as canvas
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      // Download
      const link = document.createElement("a");
      link.download = `qr-code-fixo-${profile.slug}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (err) {
      console.error("Erro ao baixar cartão:", err);
      
      // Better SVG fallback if html2canvas fails
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#131b13;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#080b08;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" rx="24" ry="24" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  
  <g transform="translate(50, 50)">
    <text fill="#ffffff" font-size="28" font-family="Arial, sans-serif" font-weight="900">CloudePay</text>
    
    <g transform="translate(0, 80)">
      <text fill="rgba(255,255,255,0.35)" font-size="12" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2">LINK PERMANENTE</text>
      <text y="40" fill="#ffffff" font-size="32" font-family="Arial, sans-serif" font-weight="800" width="450">${profile.full_name}</text>
    </g>
    
    <g transform="translate(0, 180)">
      <text fill="rgba(255,255,255,0.35)" font-size="12" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2">QR CODE FIXO</text>
      <text y="45" fill="#9EEA6C" font-size="38" font-family="Arial, sans-serif" font-weight="900">Recebimento via Link</text>
    </g>
    
    <g transform="translate(0, 320)">
      <rect width="450" height="40" rx="8" fill="rgba(0,0,0,0.2)" />
      <text x="15" y="25" fill="rgba(255,255,255,0.4)" font-size="14" font-family="monospace">${window.location.origin}/${profile.slug}/pagar</text>
    </g>
  </g>
  
  <g transform="translate(520, 80)">
    <rect width="230" height="230" rx="24" fill="#ffffff" />
    <image href="${fixedQRCode?.image}" x="15" y="15" width="200" height="200" />
  </g>
</svg>`;

      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code-fixo-${profile.slug}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  useEffect(() => {
    if (!slug) { setSlugState("idle"); return; }
    if (slug === profile?.slug) { setSlugState("available"); return; }
    if (RESERVED_SLUGS.has(slug)) { setSlugState("reserved"); return; }
    if (!isValidSlug(slug)) { setSlugState("invalid"); return; }
    setSlugState("checking");
    const t = setTimeout(async () => {
      const ok = await api.isSlugAvailable(slug, profile?.id);
      setSlugState(ok ? "available" : "unavailable");
    }, 350);
    return () => clearTimeout(t);
  }, [slug, profile?.slug, profile?.id]);

  // Load Fixed QR Code data
  useEffect(() => {
    async function loadFixedQR() {
      if (!profile?.slug) return;
      const [qrCode, qrCharges] = await Promise.all([
        api.getFixedQRCodeBySlug(profile.slug),
        api.listFixedQRCodeChargesByProfile(profile.id),
      ]);
      setFixedQRCode(qrCode);
      setFixedQRCodeCharges(qrCharges);

      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const monthFixedTotal = qrCharges
        .filter((c) => {
          if (c.status !== "paid" || !c.paid_at) return false;
          const d = new Date(c.paid_at);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, c) => sum + c.net_amount_cents, 0);
      setMonthFixed(monthFixedTotal);
    }
    loadFixedQR();
  }, [profile?.id, profile?.slug]);

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!profile || slugState !== "available") return;
    setSaving(true);
    await api.updateProfile(profile.id, {
      service_name: sanitizeText(service_name, 60),
      description: sanitizeText(description, 80),
      slug,
    });
    refresh();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const slugHint = (() => {
    switch (slugState) {
      case "checking": return "Verificando…";
      case "available": return slug === profile?.slug ? "Seu link atual" : "✓ Disponível";
      case "unavailable": return "Esse link já está em uso.";
      case "invalid": return "Apenas letras minúsculas, números e hífen.";
      case "reserved": return "Link reservado.";
      default: return "";
    }
  })();

  const isSlugError = ["unavailable", "invalid", "reserved"].includes(slugState);

  return (
    <Shell>
      <div className="max-w-2xl space-y-6">
        <section className="rounded-[32px] border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-8 shadow-sm">
          <header className="mb-8">
            <h1 className="text-2xl font-heading font-extrabold text-neutral-900 dark:text-white">Meu Perfil</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-white/40 font-body">Personalize como os clientes verão seu link.</p>
          </header>

          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="group space-y-1.5">
              <label className="text-[13px] font-bold text-neutral-500 dark:text-white/40 ml-1">O que você faz?</label>
              <input
                placeholder="Ex: Fotógrafo, Personal Trainer..."
                className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 py-3.5 px-4 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-white/10 focus:border-brand-600 dark:focus:border-lime-accent/30 focus:bg-white dark:focus:bg-white/[0.08] focus:outline-none transition-all"
                value={service_name}
                onChange={(e) => setServiceName(e.target.value)}
                maxLength={60}
              />
            </div>

            <div className="group space-y-1.5">
              <label className="text-[13px] font-bold text-neutral-500 dark:text-white/40 ml-1">Bio curta</label>
              <textarea
                placeholder="Uma breve descrição sobre você..."
                rows={3}
                className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 py-3.5 px-4 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-white/10 focus:border-brand-600 dark:focus:border-lime-accent/30 focus:bg-white dark:focus:bg-white/[0.08] focus:outline-none transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={80}
              />
              <p className="text-[10px] text-right text-neutral-400 dark:text-white/20 font-bold uppercase tracking-widest">{description.length}/80</p>
            </div>

            <div className="group space-y-1.5">
              <label className="text-[13px] font-bold text-neutral-500 dark:text-white/40 ml-1">Seu link único</label>
              <div className="flex">
                <span className="flex items-center rounded-l-xl border-y border-l border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/[0.03] px-4 text-sm font-medium text-neutral-400 dark:text-white/30">
                  cloudepay.com.br/
                </span>
                <input
                  className={`w-full rounded-r-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 py-3.5 px-4 text-sm text-neutral-900 dark:text-white focus:border-brand-600 dark:focus:border-lime-accent/30 focus:bg-white dark:focus:bg-white/[0.08] focus:outline-none transition-all ${isSlugError ? "border-red-500/50" : ""}`}
                  value={slug}
                  onChange={(e) => setSlug(normalizeSlug(e.target.value))}
                  maxLength={30}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <p className={`text-[11px] font-bold ml-1 ${isSlugError ? "text-red-500" : "text-lime-accent dark:text-lime-accent/60"}`}>
                {slugHint}
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving || slugState !== "available"}
                className="flex items-center justify-center gap-2 rounded-2xl bg-lime-accent px-8 py-4 text-sm font-heading font-bold text-[#0a0a0a] shadow-lg shadow-lime-accent/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
                <ArrowRight size={18} weight="bold" />
              </button>
              {saved && (
                <p className="mt-3 text-center text-sm font-bold text-lime-accent animate-in fade-in slide-in-from-top-1">
                  Alterações salvas com sucesso! ✓
                </p>
              )}
            </div>
          </form>
        </section>

        {/* Fixed QR Code Section - Redesigned */}
        {profile && profile.slug && fixedQRCode && (
          <section className="rounded-[32px] border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-4 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-accent/10">
                <QrCode size={22} weight="duotone" className="text-lime-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] sm:text-[16px] font-heading font-extrabold text-neutral-900 dark:text-white">QR Code Fixo</h2>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-white/30">Link permanente de cobranças</p>
              </div>
            </div>

            {/* Main Card */}
            <div className="space-y-3">
              <div
                className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e0f11] p-3 sm:p-4"
              >
                {/* QR Card - Prominent */}
                <div 
                  ref={cardRef}
                  className="rounded-xl bg-gradient-to-br from-[#131b13] to-[#080b08] border border-white/10 p-3 sm:p-4 text-white"
                >
                  <div className="grid grid-cols-[1fr_auto] items-center gap-6 sm:gap-8">
                    <div className="min-w-0">
                      <Logo size="sm" variant="white" />
                      <div className="mt-5 sm:mt-8 space-y-5">
                        <div className="min-w-0">
                          <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/35 font-bold">Link Permanente</p>
                          <h3 className="mt-1 text-[20px] sm:text-[24px] font-heading font-extrabold leading-tight text-white break-words">{profile.full_name}</h3>
                        </div>
                        
                        <div className="min-w-0">
                          <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/35 font-bold">QR Code Fixo</p>
                          <p className="mt-1 text-[22px] sm:text-[28px] font-heading font-extrabold text-[#9EEA6C] leading-tight break-words">Recebimento via Link</p>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-2xl bg-white p-2.5 sm:p-4 shadow-2xl shadow-white/10">
                      <img
                        src={fixedQRCode.image}
                        alt="QR Code Fixo"
                        className="h-28 w-28 sm:h-36 sm:w-36 rounded-lg"
                      />
                    </div>
                  </div>
                  {/* Link below QR - Always visible */}
                  <div className="mt-3 sm:mt-4 flex items-center gap-2 bg-black/20 rounded-lg px-2.5 py-1.5">
                    <QrCode size={12} weight="duotone" className="text-lime-accent shrink-0" />
                    <p className="text-[9px] sm:text-[10px] text-white/40 truncate font-mono">
                      {window.location.origin}/{profile.slug}/pagar
                    </p>
                  </div>
                </div>
              </div>

              {/* Copy Link - Full width */}
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0a0a0a] dark:bg-white px-3 py-2 text-[10px] sm:text-[11px] font-heading font-extrabold text-white dark:text-[#0a0a0a]"
              >
                {copied ? <CheckCircle size={14} weight="bold" /> : <CopySimple size={14} weight="duotone" />}
                {copied ? "Copiado!" : "Copiar Link"}
              </button>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-2 text-[10px] sm:text-[11px] font-heading font-extrabold text-white"
                >
                  <WhatsappLogo size={14} weight="bold" /> WhatsApp
                </a>
                <button
                  onClick={downloadQRCode}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-transparent px-3 py-2 text-[10px] sm:text-[11px] font-heading font-extrabold text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition"
                >
                  <DownloadSimple size={14} weight="duotone" /> PNG
                </button>
              </div>

              {/* Stats - Clean inline */}
              <div className="flex items-center gap-4 pt-3 border-t border-neutral-100 dark:border-white/5">
                <div>
                  <p className="text-[9px] sm:text-[10px] text-neutral-400 dark:text-white/20 font-heading font-bold uppercase tracking-wide">
                    Recebido (mês)
                  </p>
                  <p className="text-[18px] sm:text-[20px] font-heading font-extrabold text-neutral-900 dark:text-white">
                    {formatBRL(monthFixed)}
                  </p>
                </div>
                <div className="h-8 w-px bg-neutral-200 dark:bg-white/10" />
                <div>
                  <p className="text-[9px] sm:text-[10px] text-neutral-400 dark:text-white/20 font-heading font-bold uppercase tracking-wide">
                    Pagamentos
                  </p>
                  <p className="text-[18px] sm:text-[20px] font-heading font-extrabold text-neutral-900 dark:text-white">
                    {fixedQRCodeCharges.filter((c) => c.status === "paid").length}
                  </p>
                </div>
              </div>

              {/* Recent Payments - Compact */}
              {fixedQRCodeCharges.length > 0 && (
                <div className="pt-3 border-t border-neutral-100 dark:border-white/5">
                  <p className="text-[9px] sm:text-[10px] text-neutral-400 dark:text-white/20 font-heading font-bold uppercase tracking-wide mb-2">
                    Recentes
                  </p>
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                    {fixedQRCodeCharges.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-[10px] sm:text-[11px]">
                        <span className="truncate text-neutral-600 dark:text-white/60 mr-2">
                          {c.payer_name || "Sem nome"}
                        </span>
                        <span className="shrink-0 font-heading font-bold text-neutral-900 dark:text-white">
                          {formatBRL(c.amount_cents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="rounded-[32px] border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Info size={20} className="text-neutral-400 dark:text-white/20" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 dark:text-white/20">Informações da Conta</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-neutral-50 dark:bg-white/[0.02] p-4 border border-neutral-100 dark:border-white/[0.03]">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-white/20">Nome Titular</dt>
              <dd className="mt-1 font-heading font-bold text-neutral-900 dark:text-white">{profile?.full_name}</dd>
            </div>
            <div className="rounded-2xl bg-neutral-50 dark:bg-white/[0.02] p-4 border border-neutral-100 dark:border-white/[0.03] overflow-hidden">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-white/20">E-mail de Acesso</dt>
              <dd className="mt-1 font-heading font-bold text-neutral-900 dark:text-white break-all">{profile?.email}</dd>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
