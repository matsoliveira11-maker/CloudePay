import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoMark from "./LogoMark";
import SupportWidget from "./SupportWidget";
import { cn } from "../lib/utils";
import { 
  Layout, 
  Receipt, 
  Package, 
  ChartBar, 
  Gear, 
  User, 
  SignOut,
  Bell,
  Plus,
  X,
  Question,
  Flask
} from "phosphor-react";

interface ShellProps {
  children: React.ReactNode;
}

function SandboxBanner() {
  return (
    <div className="w-full flex items-center justify-center gap-2.5 px-4 sm:px-6 py-2"
      style={{ background: "linear-gradient(135deg, #fecdd3 0%, #fda4af 100%)" }}>
      <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
        <Flask size={12} weight="bold" className="text-[#be123c]" />
      </div>
      <span className="text-[12px] font-medium text-[#be123c]">Sandbox Mode · Você está em um ambiente de teste</span>
    </div>
  );
}

export default function Shell({ children }: ShellProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [supportOpen, setSupportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", Icon: Layout, path: "/painel" },
    { id: "cobrancas", label: "Cobranças", Icon: Receipt, path: "/cobrancas" },
    { id: "produtos", label: "Produtos", Icon: Package, path: "/produtos" },
    { id: "relatorios", label: "Relatórios", Icon: ChartBar, path: "/relatorios" },
  ];

  const bottomItems = [
    { id: "perfil", label: "Perfil", Icon: User, path: "/perfil" },
    { id: "config", label: "Ajustes", Icon: Gear, path: "/configuracoes" },
  ];

  const handleCreateCharge = () => {
    window.dispatchEvent(new CustomEvent("open-create-charge"));
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#f8f7f5" }}>
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[68px] xl:w-[220px] shrink-0 flex-col bg-white lg:flex"
        style={{ borderRight: "1px solid #fce4ec" }}>
        
        {/* Brand */}
        <div className="flex items-center justify-center xl:justify-start xl:px-5 h-16"
          style={{ borderBottom: "1px solid #fce4ec" }}>
          <LogoMark className="w-9 h-9 shrink-0" />
          <span className="hidden xl:block ml-3 text-[15px] font-bold tracking-[-0.03em] text-[#1a1a2e]">CloudePay</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pt-3 space-y-0.5">
          {menuItems.map((item) => {
            const on = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-200",
                  on ? "text-white" : "text-[#8c8c8c] hover:text-[#e11d48] hover:bg-[#fff1f2]"
                )}
                style={on ? { background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 2px 8px rgba(225,29,72,0.3)" } : undefined}
              >
                <item.Icon size={18} weight={on ? "bold" : "regular"} />
                <span className="hidden xl:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-4 space-y-0.5">
          <div className="h-px mb-3 mx-2" style={{ background: "#fce4ec" }} />
          
          <button
            onClick={() => setSupportOpen(true)}
            className="w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-lg text-[12px] text-[#8c8c8c] hover:text-[#e11d48] hover:bg-[#fff1f2] transition-colors"
          >
            <Question size={18} weight="regular" />
            <span className="hidden xl:block">Suporte</span>
          </button>

          {bottomItems.map((item) => {
             const on = location.pathname === item.path;
             return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-200",
                  on ? "text-white" : "text-[#8c8c8c] hover:text-[#e11d48] hover:bg-[#fff1f2]"
                )}
                style={on ? { background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 2px 8px rgba(225,29,72,0.3)" } : undefined}
              >
                <item.Icon size={18} weight={on ? "bold" : "regular"} />
                <span className="hidden xl:block">{item.label}</span>
              </Link>
             );
          })}

          <button
            onClick={() => signOut().then(() => navigate("/login"))}
            className="w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-2.5 rounded-lg text-[12px] text-[#8c8c8c] hover:text-[#e11d48] hover:bg-[#fff1f2] transition-colors"
          >
            <SignOut size={18} />
            <span className="hidden xl:block">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="flex flex-1 flex-col lg:pl-[68px] xl:pl-[220px]">
        <SandboxBanner />
        
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/70 backdrop-blur-xl"
          style={{ borderBottom: "1px solid #fce4ec" }}>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden">
               <LogoMark className="w-8 h-8" />
            </button>
            <h1 className="text-[17px] font-semibold tracking-tight text-[#1a1a2e]">
               {menuItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateCharge}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 2px 8px rgba(225,29,72,0.25)" }}>
              <Plus size={16} weight="bold" />
              Nova cobrança
            </button>
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#fff1f2] transition-colors">
              <Bell size={18} className="text-[#8c8c8c]" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1320px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex h-16 items-center px-6 border-b border-[#fce4ec]">
               <LogoMark className="w-8 h-8" />
               <span className="ml-3 text-lg font-bold text-[#1a1a2e]">CloudePay</span>
               <button onClick={() => setMobileMenuOpen(false)} className="ml-auto text-gray-400">
                  <X size={24} />
               </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {menuItems.concat(bottomItems).map((item) => {
                const on = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all",
                      on ? "text-white" : "text-[#8c8c8c]"
                    )}
                    style={on ? { background: "linear-gradient(135deg, #e11d48, #be123c)" } : undefined}
                  >
                    <item.Icon size={22} weight={on ? "bold" : "regular"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <SupportWidget isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}
