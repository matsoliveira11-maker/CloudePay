import { ArrowRight } from "lucide-react";

export default function CtaBanner({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="a-up-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#a1a1aa] mb-2">Nova cobrança</p>
          <h2 className="text-[22px] lg:text-[24px] font-semibold tracking-[-0.03em] text-[#09090b] leading-tight">
            Gere um link PIX para o cliente
          </h2>
          <p className="mt-1.5 text-[14px] text-[#71717a] leading-relaxed max-w-sm">
            Defina o valor, escolha um produto cadastrado ou cobrança avulsa e compartilhe em segundos.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-medium text-white bg-[#e11d48] hover:bg-[#be123c] active:scale-[0.97] transition-all"
        >
          Criar
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
