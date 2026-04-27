import { useRef, useState } from "react";
import QRCode from "qrcode";
import { formatBRL } from "../lib/format";
import Button from "./Button";
import Logo from "./Logo";
import html2canvas from "html2canvas";
import type { FixedQRCode, Charge } from "../lib/mockBackend";
import {
  Download,
  CopySimple,
  WhatsappLogo,
  CheckCircle,
  QrCode as QrCodeIcon,
} from "phosphor-react";

interface FixedQRCodeCardProps {
  fixedQRCode: FixedQRCode | null;
  slug: string;
  fullName: string;
  fixedQRCodeCharges: Charge[];
  monthFixed: number;
}

export default function FixedQRCodeCard({
  fixedQRCode,
  slug,
  fullName,
  fixedQRCodeCharges,
  monthFixed,
}: FixedQRCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!fixedQRCode) {
    return null;
  }

  const paymentUrl = `${window.location.origin}/${slug}/pagar`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Olá! Realize o seu pagamento para ${fullName} escaneando este link:\n${paymentUrl}`
  )}`;

  async function copyLink() {
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadQRCode() {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1.0);
      link.download = `qr-code-fixo-${slug}.png`;
      link.click();
    } catch (err) {
      console.error("Erro ao baixar cartão:", err);
      // Fallback
      const canvas = await QRCode.toCanvas(paymentUrl, {
        width: 1000,
        margin: 2,
        color: { dark: "#0a0a0a", light: "#ffffff" },
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `qr-code-fixo-${slug}-fallback.png`;
      link.click();
    }
  }

  const totalReceivedFixed = fixedQRCodeCharges
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.net_amount_cents, 0);

  return (
    <div className="rounded-2xl sm:rounded-[28px] border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] shadow-sm mb-3 sm:mb-5 overflow-hidden">
      {/* Header */}
      <div className="border-b border-neutral-100 dark:border-white/5 px-3 sm:px-5 py-3 sm:py-4">
        <div>
          <h2 className="text-[15px] sm:text-[16px] leading-tight font-heading font-extrabold text-[#0a0a0a] dark:text-white">
            Meu QR Code Fixo
          </h2>
          <p className="text-[8px] sm:text-[9px] font-medium text-neutral-400 dark:text-white/20 mt-0.5 uppercase tracking-wide">
            Link permanente de cobranças via PIX
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-5 py-4 sm:py-5">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.2fr_1fr]">
          {/* Pretty Card Capture */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e0f11] p-3 sm:p-4">
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
                          <h3 className="mt-1 text-[20px] sm:text-[24px] font-heading font-extrabold leading-tight text-white break-words">{fullName}</h3>
                        </div>
                        
                        <div>
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
                <div className="mt-3 sm:mt-4 flex items-center gap-2 bg-black/20 rounded-lg px-2.5 py-1.5">
                  <QrCodeIcon size={12} weight="duotone" className="text-lime-accent shrink-0" />
                  <p className="text-[9px] sm:text-[10px] text-white/40 truncate font-mono">
                    {paymentUrl}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full space-y-2">
              <Button
                onClick={downloadQRCode}
                variant="secondary"
                size="sm"
                className="w-full inline-flex items-center justify-center gap-2"
              >
                <Download size={16} weight="duotone" />
                Baixar PNG (1000x1000px)
              </Button>
              <Button
                onClick={copyLink}
                variant="secondary"
                size="sm"
                className="w-full inline-flex items-center justify-center gap-2"
              >
                <CopySimple size={16} weight="duotone" />
                {copied ? "Link copiado!" : "Copiar link"}
              </Button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  className="w-full inline-flex items-center justify-center gap-2"
                >
                  <WhatsappLogo size={16} weight="duotone" />
                  Compartilhar WhatsApp
                </Button>
              </a>
            </div>
          </div>

          {/* Link and Stats */}
          <div className="flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-[8px] sm:text-[9px] font-heading font-extrabold text-neutral-400 dark:text-white/20 uppercase tracking-[0.06em] mb-1">
                  Link permanente
                </p>
                <div className="rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.02] p-2.5 break-all font-mono text-[10px] sm:text-[11px] text-neutral-600 dark:text-white/60">
                  {paymentUrl}
                </div>
              </div>

              <div>
                <p className="text-[8px] sm:text-[9px] font-heading font-extrabold text-neutral-400 dark:text-white/20 uppercase tracking-[0.06em] mb-1">
                  Recebido este mês (via QR Code)
                </p>
                <p className="text-[24px] sm:text-[28px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">
                  {formatBRL(monthFixed)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100 dark:border-white/5">
              <div>
                <p className="text-[8px] text-neutral-400 dark:text-white/20 font-heading font-bold uppercase tracking-wide mb-1">
                  Total de pagamentos
                </p>
                <p className="text-[18px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">
                  {fixedQRCodeCharges.filter((c) => c.status === "paid").length}
                </p>
              </div>
              <div>
                <p className="text-[8px] text-neutral-400 dark:text-white/20 font-heading font-bold uppercase tracking-wide mb-1">
                  Pendente
                </p>
                <p className="text-[18px] font-heading font-extrabold text-amber-600 dark:text-amber-400">
                  {fixedQRCodeCharges.filter((c) => c.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed QR Code Charges History */}
      {fixedQRCodeCharges.length > 0 && (
        <>
          <div className="border-t border-neutral-100 dark:border-white/5 px-3 sm:px-5 py-3 sm:py-4">
            <h3 className="text-[13px] sm:text-[14px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">
              Histórico de pagamentos
            </h3>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-50 dark:border-white/[0.02] text-[9px] sm:text-[10px] font-heading font-extrabold uppercase tracking-[0.08em] text-neutral-400 dark:text-white/20">
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3">Cliente</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3">Status</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-white/[0.02]">
                {fixedQRCodeCharges.slice(0, 5).map((c) => (
                  <tr key={c.id} className="group hover:bg-neutral-50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                      <div className="font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[12px] sm:text-[13px]">
                        {c.payer_name || "Sem nome"}
                      </div>
                      <div className="mt-0.5 text-[10px] sm:text-[11px] text-neutral-400 dark:text-white/30">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-right font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[12px] sm:text-[13px]">
                      {formatBRL(c.amount_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-white/5 md:hidden">
            {fixedQRCodeCharges.slice(0, 5).map((c) => (
              <div key={c.id} className="px-3 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[13px]">
                      {c.payer_name || "Sem nome"}
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-400 dark:text-white/30">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[13px]">
                      {formatBRL(c.amount_cents)}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    paid: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    pending: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    expired: {
      bg: "bg-neutral-100 dark:bg-white/5",
      text: "text-neutral-600 dark:text-white/40",
      dot: "bg-neutral-400",
    },
  };

  const style = styles[status] || styles.expired;
  const label = { paid: "Pago", pending: "Pendente", expired: "Expirado" }[status] || status;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-heading font-extrabold uppercase tracking-wide ${style.bg} ${style.text}`}>
      <span className={`h-1 w-1 rounded-full ${style.dot}`} />
      {label}
    </div>
  );
}
