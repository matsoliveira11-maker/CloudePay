import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function SalesCalendar() {
  return (
    <div className="rounded-[14px] p-5 lg:p-6 bg-white transition-all duration-200 hover:shadow-md h-full"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#e11d48]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Calendário de vendas</h3>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#fff1f2] text-[#8c8c8c] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[12px] text-[#5c5c6d] px-2">Mai 2025</span>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#fff1f2] text-[#8c8c8c] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-[#8c8c8c] py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => {
          const day = i - 2;
          const isCurrentMonth = day > 0 && day <= 31;
          const isToday = day === 15;
          return (
            <div
              key={i}
              className="aspect-square rounded-lg flex items-center justify-center text-[12px] font-medium transition-colors"
              style={{
                color: isCurrentMonth ? (isToday ? "#fff" : "#1a1a2e") : "#d4d4d8",
                background: isToday ? "#e11d48" : "transparent",
              }}
            >
              {isCurrentMonth ? day : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
