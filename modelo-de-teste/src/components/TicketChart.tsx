import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from "react";
import { formatBRL, type Charge } from "../data";

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function TicketChart({ charges }: { charges: Charge[] }) {
  const data = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const dayCharges = charges.filter(c => c.status === "paid" && sameDay(new Date(c.date), d));
      const value = dayCharges.length ? dayCharges.reduce((s, c) => s + c.gross, 0) / dayCharges.length : 0;
      return { name: label, value };
    });
  }, [charges]);

  return (
    <div className="rounded-[14px] p-5 lg:p-6 bg-white transition-all duration-200 hover:shadow-md"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center gap-2 mb-5">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#e11d48]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
        <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Evolução do Ticket Médio</h3>
      </div>

      <div className="h-[200px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8c8c8c", fontSize: 11 }} dy={6} />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              cursor={{ stroke: "#fce4ec", strokeWidth: 1 }}
              contentStyle={{ background: "#fff", border: "1px solid #fce4ec", borderRadius: "10px", padding: "6px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              formatter={(v: any) => [formatBRL(Number(v) || 0), ""]}
              labelStyle={{ color: "#8c8c8c", fontSize: 11 }}
            />
            <Line type="monotone" dataKey="value" stroke="#be123c" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#be123c", stroke: "#fff", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
