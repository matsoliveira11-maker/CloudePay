import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "../utils/cn";
import { formatBRL, FEE_RATE, STATUS_LABEL, type Charge, type ChargeStatus } from "../data";

const TABS: { id: "all" | ChargeStatus; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "paid", label: "Pagas" },
  { id: "pending", label: "Pendentes" },
  { id: "canceled", label: "Canceladas" },
];

export default function ChargesTable({ charges }: { charges: Charge[] }) {
  const [tab, setTab] = useState<"all" | ChargeStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return charges
      .filter(c => tab === "all" || c.status === tab)
      .filter(c => !search || `${c.service} ${c.customer}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [charges, tab, search]);

  return (
    <div className="anim-fade-up-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">Histórico</p>
          <p className="text-[13px] text-[var(--text-dim)] mt-0.5">{filtered.length} cobrança{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <label className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente ou serviço..."
            className="w-full text-[13px] pl-9 pr-4 py-2.5 rounded-xl placeholder:text-[var(--text-dim)] text-[var(--text)] focus:outline-none focus:ring-2 transition-all"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          />
        </label>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn("px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all",
              tab === t.id
                ? "text-[var(--text)]"
                : "text-[var(--text-dim)] hover:text-[var(--text-secondary)]"
            )}
            style={tab === t.id ? { background: "var(--bg-hover)" } : undefined}
          >
            {t.label}
            <span className={cn("ml-1.5 num text-[11px]", tab === t.id ? "text-[var(--text-tertiary)]" : "text-[var(--text-dim)]")}>
              {charges.filter(c => t.id === "all" ? true : c.status === t.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-[var(--radius-xl)] overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[13px] text-[var(--text-dim)]">Nenhuma cobrança encontrada</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <ul className="lg:hidden divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map(c => {
                const net = c.gross * (1 - FEE_RATE);
                return (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-all duration-200">
                    <Avatar initials={c.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-medium text-[var(--text)] truncate">{c.service}</p>
                        <p className="text-[13px] font-semibold text-[var(--text)] num whitespace-nowrap">{formatBRL(net)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-[var(--text-tertiary)]">{c.customer}</p>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Serviço", "Status", "Bruto", "Taxa", "Líquido"].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const fee = c.gross * FEE_RATE;
                    const net = c.gross - fee;
                    return (
                      <tr key={c.id} className="hover:bg-[var(--bg-hover)] transition-all duration-200" style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar initials={c.avatar} />
                            <div>
                              <p className="text-[13px] font-medium text-[var(--text)]">{c.service}</p>
                              <p className="text-[11px] text-[var(--text-tertiary)]">{c.customer}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-6 py-3 text-right text-[13px] text-[var(--text-secondary)] num">{formatBRL(c.gross)}</td>
                        <td className="px-6 py-3 text-right text-[12px] text-[var(--text-dim)] num">− {formatBRL(fee)}</td>
                        <td className="px-6 py-3 text-right text-[13px] font-semibold text-[var(--text)] num">{formatBRL(net)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold"
      style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: ChargeStatus }) {
  const styles: Record<ChargeStatus, { bg: string; text: string; dot: string }> = {
    paid:     { bg: "rgba(16,185,129,0.1)",  text: "#34d399", dot: "#10b981" },
    pending:  { bg: "rgba(245,158,11,0.1)",  text: "#fbbf24", dot: "#f59e0b" },
    canceled: { bg: "rgba(68,64,60,0.3)",     text: "#a8a29e", dot: "#57534e" },
  };
  const s = styles[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium"
      style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {STATUS_LABEL[status]}
    </span>
  );
}
