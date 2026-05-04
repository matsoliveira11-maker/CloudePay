import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from "react";
import { formatBRL, type Charge } from "../data";

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function RevenueChart({ charges }: { charges: Charge[] }) {
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

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="anim-fade-up-3 rounded-[var(--radius-xl)] p-5 lg:p-6"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">Receita</p>
          <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--text)] num leading-none mt-1">{formatBRL(total)}</p>
          <p className="text-[12px] text-[var(--text-dim)] mt-1">últimos 7 dias</p>
        </div>
      </div>

      <div className="h-[160px] -mx-2 anim-fade-up-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e11d48" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#57534e", fontSize: 11, fontFamily: "Inter, sans-serif" }}
              dy={6}
            />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
              contentStyle={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "8px 12px",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "var(--text)",
                boxShadow: "var(--shadow-md)",
              }}
              formatter={(v: any) => [formatBRL(Number(v) || 0), ""]}
              labelStyle={{ color: "var(--text-tertiary)", fontSize: 11, marginBottom: 2 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#e11d48"
              strokeWidth={2}
              fill="url(#rg)"
              dot={false}
              activeDot={{ r: 4, fill: "#e11d48", stroke: "var(--bg-elevated)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
