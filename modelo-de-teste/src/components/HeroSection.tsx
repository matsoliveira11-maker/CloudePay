import { useEffect, useRef, useState } from "react";
import { ArrowRight, Wallet, Zap } from "lucide-react";
import { formatBRL } from "../data";

export default function HeroSection({
  net, gross, pendingTotal, paidCount, pendingCount, onCreate,
}: {
  net: number; gross: number; pendingTotal: number;
  paidCount: number; pendingCount: number;
  onCreate: () => void;
}) {
  const [displayNet, setDisplayNet] = useState(0);
  const prevNet = useRef(0);

  useEffect(() => {
    const start = prevNet.current;
    const end = net;
    const duration = 800;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNet(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    prevNet.current = net;
  }, [net]);

  const fee = gross * 0.01;

  return (
    <div className="anim-fade-up-1 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main balance card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-[var(--radius-xl)] p-6 lg:p-8 group transition-all duration-500 hover:border-[var(--border-hover)]"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>

          {/* Subtle glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-30"
            style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />

          {/* Animated border glow on hover */}
          <div className="absolute inset-0 rounded-[var(--radius-xl)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ boxShadow: "inset 0 0 0 1px rgba(225,29,72,0.15)" }} />

          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(225,29,72,0.15)" }}>
                <Wallet className="w-[18px] h-[18px]" style={{ color: "var(--accent)" }} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                Saldo disponível
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--success)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--success)" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--success)" }} />
                </span>
                Ativo
              </span>
            </div>

            <div className="mb-6">
              <p className="text-[40px] lg:text-[52px] font-bold tracking-[-0.04em] text-[var(--text)] num leading-none">
                {formatBRL(displayNet)}
              </p>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-2">
                {paidCount} pagamento{paidCount !== 1 ? "s" : ""} confirmado{paidCount !== 1 ? "s" : ""} · Taxa: {formatBRL(fee)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 4px 16px rgba(225,29,72,0.3)" }}>
                <Zap className="w-4 h-4" />
                Nova cobrança
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {pendingCount > 0 && (
                <span className="text-[12px] text-[var(--warning)] font-medium">
                  {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Side stats */}
        <div className="flex flex-col gap-5">
          <div className="flex-1 rounded-[var(--radius-lg)] p-5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1">Bruto recebido</p>
            <p className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--text)] num">{formatBRL(gross)}</p>
          </div>
          <div className="flex-1 rounded-[var(--radius-lg)] p-5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1">Aguardando</p>
            <p className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--warning)] num">{formatBRL(pendingTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
