import { useMemo, useRef, useState } from "react";
import { CheckCircle, CopySimple, DownloadSimple, InstagramLogo, ShareNetwork, TelegramLogo, WhatsappLogo } from "phosphor-react";
import { formatBRL } from "../lib/format";
import Logo from "./Logo";
import type { Charge } from "../lib/mockBackend";
import html2canvas from "html2canvas";

interface PaymentShareCardProps {
  charge: Charge;
  paymentUrl: string;
}

export default function PaymentShareCard({ charge, paymentUrl }: PaymentShareCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const baseText = useMemo(
    () => `Pagamento: ${charge.service_name}\nValor: ${formatBRL(charge.amount_cents)}\nLink: ${paymentUrl}`,
    [charge.amount_cents, charge.service_name, paymentUrl]
  );

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(baseText)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(paymentUrl)}&text=${encodeURIComponent(
    `Pagamento ${charge.service_name} - ${formatBRL(charge.amount_cents)}`
  )}`;

  async function copyLink() {
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function shareNative() {
    if (navigator.share) {
      await navigator.share({
        title: "Cobrança CloudePay",
        text: `Pagamento ${charge.service_name}`,
        url: paymentUrl,
      });
      return;
    }
    await copyLink();
  }

  function openInstagramHint() {
    alert("Para Instagram, baixe a imagem do card e compartilhe nos Stories/Reels junto com o link.");
  }

  async function downloadCard() {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `cloudepay-cobranca-${charge.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao baixar imagem do card:', err);
      // Fallback SVG
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
      <text fill="rgba(255,255,255,0.35)" font-size="12" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2">PAYMENT REQUEST</text>
      <text y="40" fill="#ffffff" font-size="32" font-family="Arial, sans-serif" font-weight="800">${charge.service_name}</text>
    </g>
    <g transform="translate(0, 180)">
      <text fill="rgba(255,255,255,0.35)" font-size="12" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2">AMOUNT DUE</text>
      <text y="55" fill="#ffffff" font-size="52" font-family="Arial, sans-serif" font-weight="900">${formatBRL(charge.amount_cents)}</text>
    </g>
    <g transform="translate(0, 320)">
      <rect width="450" height="40" rx="8" fill="rgba(0,0,0,0.2)" />
      <text x="15" y="25" fill="rgba(255,255,255,0.4)" font-size="12" font-family="monospace">${paymentUrl}</text>
    </g>
  </g>
  <g transform="translate(520, 80)">
    <rect width="230" height="230" rx="24" fill="#ffffff" />
    <image href="${charge.qr_code_image}" x="15" y="15" width="200" height="200" />
  </g>
</svg>`;
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cloudepay-cobranca-${charge.id.slice(0, 8)}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e0f11] p-3 sm:p-4"
      >
        <div 
          ref={cardRef}
          className="download-card-target rounded-xl bg-gradient-to-br from-[#131b13] to-[#080b08] border border-white/10 p-3 sm:p-4 text-white"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Logo size="sm" variant="white" />
              <p className="mt-2 text-[10px] uppercase tracking-widest text-white/35">Payment request</p>
              <h3 className="mt-1 text-[18px] sm:text-[22px] font-heading font-extrabold leading-none">{charge.service_name}</h3>
              <p className="mt-2 text-[10px] text-white/55">Amount due</p>
              <p className="text-[30px] sm:text-[36px] leading-none font-heading font-extrabold">{formatBRL(charge.amount_cents)}</p>
              {charge.payer_name && <p className="mt-2 text-[11px] text-white/70">Cliente: {charge.payer_name}</p>}
            </div>
            <img
              src={charge.qr_code_image}
              alt="QR Code"
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg border border-white/20 bg-white p-1"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121212] p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={paymentUrl}
            className="flex-1 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2 text-[11px] sm:text-xs font-mono"
          />
          <button
            onClick={copyLink}
            className="rounded-lg bg-[#0a0a0a] dark:bg-white px-3 py-2 text-[11px] font-heading font-extrabold text-white dark:text-[#0a0a0a]"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-[12px] font-heading font-extrabold text-white"
        >
          <WhatsappLogo size={16} weight="bold" /> Enviar no WhatsApp
        </a>

        <button
          onClick={shareNative}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#9EEA6C] py-2.5 text-[12px] font-heading font-extrabold text-[#0a0a0a]"
        >
          <ShareNetwork size={16} weight="bold" /> Compartilhar card
        </button>

        <a
          href={telegramHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-white/10 py-2.5 text-[12px] font-heading font-extrabold text-[#0a0a0a] dark:text-white"
        >
          <TelegramLogo size={16} weight="bold" /> Telegram
        </a>

        <button
          onClick={openInstagramHint}
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-white/10 py-2.5 text-[12px] font-heading font-extrabold text-[#0a0a0a] dark:text-white"
        >
          <InstagramLogo size={16} weight="bold" /> Instagram
        </button>

        <button
          onClick={downloadCard}
          className="sm:col-span-2 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-white/10 py-2.5 text-[12px] font-heading font-extrabold text-[#0a0a0a] dark:text-white"
        >
          <DownloadSimple size={16} weight="bold" /> Baixar imagem do card
        </button>

        <button
          onClick={copyLink}
          className="sm:col-span-2 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-white/10 py-2.5 text-[12px] font-heading font-extrabold text-[#0a0a0a] dark:text-white"
        >
          {copied ? <CheckCircle size={16} weight="bold" /> : <CopySimple size={16} weight="bold" />}
          Copiar só o link
        </button>
      </div>
    </div>
  );
}
