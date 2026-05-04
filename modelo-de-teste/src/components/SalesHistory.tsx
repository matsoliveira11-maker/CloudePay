import { useMemo, useState } from "react";
import { Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "../utils/cn";
import { formatBRL, formatDate, FEE_RATE, STATUS_LABEL, type Charge, type ChargeStatus } from "../data";

const TABS: { id: "all" | ChargeStatus; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "paid", label: "Pagas" },
  { id: "pending", label: "Pendentes" },
  { id: "canceled", label: "Canceladas" },
];

export default function SalesHistory({ charges }: { charges: Charge[] }) {
  const [tab, setTab] = useState<"all" | ChargeStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return charges
      .filter(c => tab === "all" || c.status === tab)
      .filter(c => !search || `${c.service} ${c.customer}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [charges, tab, search]);

  return (
    <div className="a-up-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8c8c8c]">Histórico de vendas</p>
          <p className="text-[13px] text-[#8c8c8c] mt-0.5">{filtered.length} transação{filtered.length !== 1 ? "s" : ""} no período</p>
        </div>
        <label className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4d4d8] pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente ou serviço..."
            className="w-full text-[13px] pl-9 pr-4 py-2.5 rounded-xl placeholder:text-[#d4d4d8] text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#fecdd3] transition-all"
            style={{ background: "#ffffff", border: "1px solid #fce4ec" }}
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
              tab === t.id ? "text-white" : "text-[#8c8c8c] hover:text-[#e11d48]"
            )}
            style={tab === t.id ? { background: "linear-gradient(135deg, #e11d48, #be123c)" } : { background: "#ffffff", border: "1px solid #fce4ec" }}
          >
            {t.label}
            <span className={cn("ml-1.5 num text-[11px]", tab === t.id ? "text-white/70" : "text-[#d4d4d8]")}>
              {charges.filter(c => t.id === "all" ? true : c.status === t.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-[14px] overflow-hidden bg-white" style={{ border: "1px solid #fce4ec" }}>
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[13px] text-[#8c8c8c]">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <ul className="lg:hidden divide-y" style={{ borderColor: "#fce4ec" }}>
              {filtered.map(c => <MobileRow key={c.id} charge={c} />)}
            </ul>

            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #fce4ec" }}>
                    {["Serviço / Cliente", "Data", "Status", "Bruto", "Taxa (1%)", "Líquido"].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8c8c8c]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => <DesktopRow key={c.id} charge={c} />)}
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
      style={{ background: "#fff1f2", color: "#e11d48" }}>
      {initials}
    </div>
  );
}

function StatusDot({ status }: { status: ChargeStatus }) {
  const colors: Record<ChargeStatus, string> = {
    paid: "#e11d48",
    pending: "#f59e0b",
    canceled: "#d4d4d8",
  };
  return <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: colors[status] }} />;
}

function MobileRow({ charge: c }: { charge: Charge }) {
  const net = c.gross * (1 - FEE_RATE);
  const isIncoming = c.status === "paid";
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#fff1f2] transition-all">
      <Avatar initials={c.avatar} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[#1a1a2e] truncate">{c.service}</p>
          <div className="flex items-center gap-1">
            {isIncoming ? (
              <ArrowUpRight className="w-3 h-3 text-[#e11d48]" />
            ) : c.status === "pending" ? (
              <ArrowDownRight className="w-3 h-3 text-[#f59e0b]" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-[#d4d4d8]" />
            )}
            <p className="text-[13px] font-semibold text-[#1a1a2e] num whitespace-nowrap">{formatBRL(net)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[11px] text-[#8c8c8c]">{c.customer} · {formatDate(c.date)}</p>
          <span className="flex items-center gap-1.5 text-[11px] text-[#5c5c6d]">
            <StatusDot status={c.status} />
            {STATUS_LABEL[c.status]}
          </span>
        </div>
      </div>
    </li>
  );
}

function DesktopRow({ charge: c }: { charge: Charge }) {
  const fee = c.gross * FEE_RATE;
  const net = c.gross - fee;
  const isIncoming = c.status === "paid";

  return (
    <tr className="hover:bg-[#fff1f2] transition-all" style={{ borderBottom: "1px solid #fce4ec" }}>
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <Avatar initials={c.avatar} />
          <div>
            <p className="text-[13px] font-medium text-[#1a1a2e]">{c.service}</p>
            <p className="text-[11px] text-[#8c8c8c]">{c.customer}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-3 text-[12px] text-[#8c8c8c]">{formatDate(c.date)}</td>
      <td className="px-6 py-3">
        <span className="flex items-center gap-1.5 text-[12px] text-[#5c5c6d]">
          <StatusDot status={c.status} />
          {STATUS_LABEL[c.status]}
        </span>
      </td>
      <td className="px-6 py-3 text-right text-[13px] text-[#5c5c6d] num">{formatBRL(c.gross)}</td>
      <td className="px-6 py-3 text-right text-[12px] text-[#8c8c8c] num">− {formatBRL(fee)}</td>
      <td className="px-6 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {isIncoming ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-[#e11d48]" />
          ) : c.status === "pending" ? (
            <ArrowDownRight className="w-3.5 h-3.5 text-[#f59e0b]" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-[#d4d4d8]" />
          )}
          <span className="text-[13px] font-semibold text-[#1a1a2e] num">{formatBRL(net)}</span>
        </div>
      </td>
    </tr>
  );
}
