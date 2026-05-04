import { LayoutDashboard, CreditCard, Package, BarChart3, Settings, UserRound, LogOut } from "lucide-react";
import { cn } from "../utils/cn";
import LogoMark from "./LogoMark";

const nav = [
  { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { id: "cobrancas",  label: "Cobranças",  icon: CreditCard },
  { id: "produtos",   label: "Produtos",   icon: Package },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
  { id: "config",     label: "Config",     icon: Settings },
  { id: "perfil",     label: "Perfil",     icon: UserRound },
];

export default function Sidebar({ active, onNavigate }: { active: string; onNavigate(id: string): void }) {
  return (
    <aside className="hidden lg:flex w-[68px] xl:w-[220px] shrink-0 flex-col bg-white"
      style={{ borderRight: "1px solid #fce4ec" }}>

      {/* Brand */}
      <div className="flex items-center justify-center xl:justify-start xl:px-5 h-16"
        style={{ borderBottom: "1px solid #fce4ec" }}>
        <LogoMark className="w-9 h-9 shrink-0" />
        <span className="hidden xl:block ml-3 text-[15px] font-bold tracking-[-0.03em] text-[#1a1a2e]">CloudePay</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-3 space-y-0.5">
        {nav.map(({ id, label, icon: Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(
                "w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-200",
                on
                  ? "text-white"
                  : "text-[#8c8c8c] hover:text-[#e11d48] hover:bg-[#fff1f2]"
              )}
              style={on ? { background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 2px 8px rgba(225,29,72,0.3)" } : undefined}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={on ? 2.2 : 1.8} />
              <span className="hidden xl:block">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4">
        <div className="h-px mb-3 mx-2" style={{ background: "#fce4ec" }} />
        <button className="w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-lg text-[12px] text-[#8c8c8c] hover:text-[#e11d48] hover:bg-[#fff1f2] transition-colors">
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
          <span className="hidden xl:block">Sair</span>
        </button>
      </div>
    </aside>
  );
}
