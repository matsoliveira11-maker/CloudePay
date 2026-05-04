import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { type Charge } from "../data";

export default function StatusDistribution({ charges }: { charges: Charge[] }) {
  const paid = charges.filter(c => c.status === "paid").length;
  const pending = charges.filter(c => c.status === "pending").length;
  const canceled = charges.filter(c => c.status === "canceled").length;
  const total = charges.length;

  const data = total
    ? [
        { name: "Pago", value: paid, color: "#e11d48" },
        { name: "Pendente", value: pending, color: "#f59e0b" },
        { name: "Cancelado", value: canceled, color: "#d4d4d8" },
      ]
    : [{ name: "Vazio", value: 1, color: "#f4f5f7" }];

  return (
    <div className="rounded-[14px] p-5 lg:p-6 bg-white transition-all duration-200 hover:shadow-md h-full"
      style={{ border: "1px solid #fce4ec" }}>
      <div className="flex items-center gap-2 mb-5">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#e11d48]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M12 6v6l4 2"/>
        </svg>
        <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Distribuição por status</h3>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative shrink-0 w-[100px] h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={32} outerRadius={48} paddingAngle={total ? 3 : 0} stroke="none">
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[18px] font-bold text-[#1a1a2e] num">{total}</p>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {[
            { label: "Pago", value: paid, color: "#e11d48" },
            { label: "Pendente", value: pending, color: "#f59e0b" },
            { label: "Cancelado", value: canceled, color: "#d4d4d8" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-[12px] text-[#5c5c6d]">{item.label}</span>
              </div>
              <span className="text-[12px] font-medium text-[#1a1a2e] num">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
