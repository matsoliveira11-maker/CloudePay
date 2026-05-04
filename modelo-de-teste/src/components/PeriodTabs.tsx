import { cn } from "../utils/cn";

const PERIODS = [
  { id: "today", label: "Hoje" },
  { id: "month", label: "Esse mês" },
  { id: "30days", label: "Últimos 30 dias" },
  { id: "90days", label: "Últimos 90 dias" },
  { id: "all", label: "Todo o período" },
  { id: "custom", label: "Personalizado" },
];

export default function PeriodTabs({ value, onChange }: { value: string; onChange(id: string): void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PERIODS.map(p => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={cn(
            "px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-200",
            value === p.id
              ? "text-white"
              : "text-[#5c5c6d] hover:text-[#e11d48] hover:bg-[#fff1f2]"
          )}
          style={value === p.id
            ? { background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 2px 8px rgba(225,29,72,0.25)" }
            : { background: "#ffffff", border: "1px solid #fce4ec" }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
