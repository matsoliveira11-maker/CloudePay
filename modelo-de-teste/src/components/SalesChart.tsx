import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from "react";
import { formatBRL, type Charge } from "../data";

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function SalesChart({ charges }: { charges: Charge[] }) {
  const data = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const value = charges
        .filter(c => c.status === "paid" && sameDay(new Date(c.date), d))
        .reduce((s, c) => s + c.gross, 0);
      return { name: label, value };
    });
  }, [charges]);

  return (
    <div className="rounded-[14px] p-5 lg:p-6 bg-white transition-all duration-200 hover:shadow-md"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center gap-2 mb-5">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#e11d48]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/>
        </svg>
        <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Desempenho de vendas</h3>
      </div>

      <div className="h-[200px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e11d48" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8c8c8c", fontSize: 11 }} dy={6} />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              cursor={{ stroke: "#fce4ec", strokeWidth: 1 }}
              contentStyle={{ background: "#fff", border: "1px solid #fce4ec", borderRadius: "10px", padding: "6px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              formatter={(v: any) => [formatBRL(Number(v) || 0), ""]}
              labelStyle={{ color: "#8c8c8c", fontSize: 11 }}
            />
            <Area type="monotone" dataKey="value" stroke="#e11d48" strokeWidth={2} fill="url(#salesGrad)" dot={false} activeDot={{ r: 4, fill: "#e11d48", stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
