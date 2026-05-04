import { Receipt, TrendingUp, Plus } from "lucide-react";
import { formatBRL } from "../data";

export default function QuickActions({
  total, avgTicket, onCreate,
}: { total: number; avgTicket: number; onCreate: () => void }) {
  return (
    <div className="anim-fade-up-2 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* CTA Card */}
      <button
        onClick={onCreate}
        className="col-span-2 lg:col-span-1 group relative overflow-hidden rounded-[var(--radius-lg)] p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 8px 24px rgba(225,29,72,0.25)" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: "inset 0 0 20px rgba(255,255,255,0.1)" }} />
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <p className="text-[13px] font-semibold text-white">Criar cobrança</p>
          <p className="text-[11px] text-white/60 mt-0.5">Link PIX instantâneo</p>
        </div>
      </button>

      {/* Stats */}
      <StatCard
        icon={<Receipt className="w-4 h-4" />}
        label="Cobranças"
        value={String(total)}
        sub="no total"
        color="var(--text-secondary)"
        bg="rgba(168,162,158,0.08)"
      />
      <StatCard
        icon={<TrendingUp className="w-4 h-4" />}
        label="Ticket médio"
        value={formatBRL(avgTicket)}
        sub="por venda"
        color="var(--success)"
        bg="rgba(16,185,129,0.08)"
      />
      <StatCard
        icon={<Receipt className="w-4 h-4" />}
        label="Taxa"
        value="1%"
        sub="sobre vendas"
        color="var(--text-tertiary)"
        bg="rgba(120,113,108,0.08)"
      />
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, bg }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string; bg: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] p-5 transition-all duration-200 hover:bg-[var(--bg-hover)]"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: bg, color }}>
        {icon}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">{label}</p>
      <p className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--text)] num mt-0.5">{value}</p>
      <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{sub}</p>
    </div>
  );
}
