import { formatBRL } from "../data";
import { TrendingUp, Receipt, ArrowUpCircle } from "lucide-react";

export default function KpiCards({ gross, total, avgTicket }: {
  gross: number; total: number; avgTicket: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 a-up-1">
      <KpiCard
        label="Total em vendas"
        value={formatBRL(gross)}
        icon={<TrendingUp className="w-4 h-4" />}
        accent
      />
      <KpiCard
        label="Total de transações"
        value={String(total)}
        icon={<Receipt className="w-4 h-4" />}
      />
      <KpiCard
        label="Ticket Médio"
        value={formatBRL(avgTicket)}
        icon={<ArrowUpCircle className="w-4 h-4" />}
      />
    </div>
  );
}

function KpiCard({ label, value, icon, accent }: {
  label: string; value: string; icon: React.ReactNode; accent?: boolean;
}) {
  const bg = accent ? "linear-gradient(135deg, #e11d48, #be123c)" : "#ffffff";
  const textColor = accent ? "#ffffff" : "#1a1a2e";
  const labelColor = accent ? "rgba(255,255,255,0.7)" : "#8c8c8c";
  const iconBg = accent ? "rgba(255,255,255,0.2)" : "#fff1f2";
  const iconColor = accent ? "#ffffff" : "#e11d48";
  const border = accent ? "none" : "1px solid #e8e8ec";

  return (
    <div className="rounded-[14px] p-5 transition-all duration-200 hover:shadow-md"
      style={{ background: bg, border, color: textColor }}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <span className="text-[13px]" style={{ color: labelColor }}>{label}</span>
      </div>
      <p className="text-[28px] font-semibold tracking-[-0.03em] num leading-none">{value}</p>
    </div>
  );
}
