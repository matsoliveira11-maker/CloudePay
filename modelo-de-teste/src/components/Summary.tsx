import { formatBRL, FEE_RATE } from "../data";

export default function Summary({ gross, pendingTotal }: { gross: number; pendingTotal: number }) {
  const fee = gross * FEE_RATE;
  const net = gross - fee;

  return (
    <div className="a-up-4">
      <div className="px-6 py-5 lg:px-8 rounded-2xl" style={{ backgroundColor: "#fafafa" }}>
        <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#a1a1aa] mb-4">Resumo financeiro</p>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#71717a]">Bruto recebido</span>
            <span className="text-[13px] num text-[#09090b] font-medium">{formatBRL(gross)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#a1a1aa]">Aguardando pagamento</span>
            <span className="text-[13px] num text-[#a1a1aa]">{formatBRL(pendingTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#a1a1aa]">Taxa CloudePay (1%)</span>
            <span className="text-[13px] num text-[#a1a1aa]">− {formatBRL(fee)}</span>
          </div>
        </div>

        <div className="mt-4 pt-3" style={{ borderTop: "1px solid #e4e4e7" }}>
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#a1a1aa]">Saldo líquido</p>
            <p className="text-[22px] font-semibold tracking-[-0.03em] text-[#09090b] num">{formatBRL(net)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
