import { Wallet } from "lucide-react";
import { formatBRL } from "../data";

export default function PaymentMethods({ charges }: { charges: { gross: number; status: string }[] }) {
  const pixTotal = charges.reduce((s, c) => s + c.gross, 0);
  const total = pixTotal;

  return (
    <div className="rounded-[14px] p-5 lg:p-6 transition-all duration-200 hover:shadow-md"
      style={{ background: "#ffffff", border: "1px solid #fce4ec" }}>

      <div className="flex items-center gap-2 mb-5">
        <Wallet className="w-4 h-4 text-[#8c8c8c]" />
        <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Método de pagamento</h3>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full mb-6 overflow-hidden" style={{ background: "#f8f7f5" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: "100%", background: "linear-gradient(90deg, #e11d48, #be123c)" }} />
      </div>

      {/* Pix row */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#fff1f2" }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-[13px] text-[#1a1a2e]">Pix</span>
        </div>
        <span className="text-[13px] font-medium text-[#1a1a2e] num">{formatBRL(pixTotal)}</span>
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid #fce4ec" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#fff1f2" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "#e11d48" }} />
          </div>
          <span className="text-[13px] font-semibold text-[#1a1a2e]">Total</span>
        </div>
        <span className="text-[13px] font-semibold text-[#1a1a2e] num">{formatBRL(total)}</span>
      </div>
    </div>
  );
}
