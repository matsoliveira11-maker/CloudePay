import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatBRL, type Charge } from "../data";

export default function StatusRing({ charges }: { charges: Charge[] }) {
  const paid = charges.filter(c => c.status === "paid").length;
  const pending = charges.filter(c => c.status === "pending").length;
  const canceled = charges.filter(c => c.status === "canceled").length;
  const total = charges.length;
  const paidPct = total ? Math.round((paid / total) * 100) : 0;
  const pending$ = charges.filter(c => c.status === "pending").reduce((s, c) => s + c.gross, 0);

  const data = total
    ? [
        { name: "Pago", value: paid, color: "#09090b" },
        { name: "Pendente", value: pending, color: "#a1a1aa" },
        { name: "Cancelado", value: canceled, color: "#e4e4e7" },
      ]
    : [{ name: "Vazio", value: 1, color: "#f4f4f5" }];

  return (
    <div className="a-up-5">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start justify-between mb-5">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#a1a1aa]">Distribuição</p>
          <p className="text-[22px] font-semibold tracking-[-0.03em] text-[#09090b] num leading-none">{paidPct}%</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative shrink-0 w-[90px] h-[90px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={44}
                  paddingAngle={total ? 4 : 0}
                  stroke="none"
                >
                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[18px] font-semibold tracking-[-0.03em] text-[#09090b] num leading-none">{total}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {[
              { label: "Pago", value: paid, color: "#09090b" },
              { label: "Pendente", value: pending, color: "#a1a1aa" },
              { label: "Cancelado", value: canceled, color: "#e4e4e7" },
            ].map(i => (
              <div key={i.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: i.color }} />
                  <span className="text-[13px] text-[#71717a]">{i.label}</span>
                </div>
                <span className="text-[13px] font-medium text-[#09090b] num">{i.value}</span>
              </div>
            ))}
            {pending$ > 0 && (
              <div className="pt-2" style={{ borderTop: "1px solid #f4f4f5" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#a1a1aa] uppercase tracking-[0.06em]">A receber</span>
                  <span className="text-[13px] font-medium text-[#09090b] num">{formatBRL(pending$)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
