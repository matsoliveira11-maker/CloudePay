import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatBRL, type Charge } from "../data";

export default function StatusBreakdown({ charges }: { charges: Charge[] }) {
  const paid = charges.filter(c => c.status === "paid").length;
  const pending = charges.filter(c => c.status === "pending").length;
  const canceled = charges.filter(c => c.status === "canceled").length;
  const total = charges.length;
  const paidAmount = charges.filter(c => c.status === "paid").reduce((s, c) => s + c.gross, 0);
  const pendingAmount = charges.filter(c => c.status === "pending").reduce((s, c) => s + c.gross, 0);

  const data = total
    ? [
        { name: "Pago", value: paid, color: "#10b981" },
        { name: "Pendente", value: pending, color: "#f59e0b" },
        { name: "Cancelado", value: canceled, color: "#44403c" },
      ]
    : [{ name: "Vazio", value: 1, color: "#292524" }];

  return (
    <div className="anim-fade-up-4 rounded-[var(--radius-xl)] p-5 lg:p-6"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>

      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">Status</p>
          <p className="text-[13px] text-[var(--text-dim)] mt-0.5">Distribuição</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative shrink-0 w-[100px] h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={34}
                outerRadius={48}
                paddingAngle={total ? 3 : 0}
                stroke="none"
              >
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[18px] font-bold tracking-[-0.02em] text-[var(--text)] num">{total}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {[
            { label: "Pago", value: paid, color: "#10b981", amount: paidAmount },
            { label: "Pendente", value: pending, color: "#f59e0b", amount: pendingAmount },
            { label: "Cancelado", value: canceled, color: "#44403c", amount: 0 },
          ].map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-[12px] text-[var(--text-secondary)]">{item.label}</span>
                </div>
                <span className="text-[12px] font-medium text-[var(--text)] num">{item.value}</span>
              </div>
              {item.amount > 0 && (
                <p className="text-[11px] text-[var(--text-dim)] num ml-4">{formatBRL(item.amount)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
