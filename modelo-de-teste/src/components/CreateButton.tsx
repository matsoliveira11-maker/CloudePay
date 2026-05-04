import { Plus } from "lucide-react";

export default function CreateButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97] shadow-lg"
      style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 4px 16px rgba(225,29,72,0.35)" }}
    >
      <Plus className="w-4 h-4" strokeWidth={2.5} />
      Criar cobrança
    </button>
  );
}
