import { Bell, Plus } from "lucide-react";
import LogoMark from "./LogoMark";

export default function Topbar({ onCreate }: { onCreate: () => void }) {
  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/70 backdrop-blur-xl"
      style={{ borderBottom: "1px solid #fce4ec" }}>

      <div className="flex items-center gap-3">
        <LogoMark className="w-8 h-8 lg:hidden" />
        <h1 className="text-[17px] font-semibold tracking-tight text-[#1a1a2e]">Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCreate}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 2px 8px rgba(225,29,72,0.25)" }}>
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nova cobrança
        </button>
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#fff1f2] transition-colors">
          <Bell className="w-[18px] h-[18px] text-[#8c8c8c]" />
        </button>
      </div>
    </header>
  );
}
