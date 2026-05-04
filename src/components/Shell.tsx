import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import SupportWidget from "./SupportWidget";
import { cn } from "../lib/utils";
import { 
  Layout, 
  Package, 
  Gear, 
  SignOut,
  Bell,
  Plus,
  X,
  Question
} from "phosphor-react";

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [supportOpen, setSupportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", Icon: Layout, path: "/painel" },
    { id: "produtos", label: "Produtos", Icon: Package, path: "/produtos" },
  ];

  const bottomItems = [
    { id: "config", label: "Ajustes", Icon: Gear, path: "/configuracoes" },
  ];

  const handleCreateCharge = () => {
    window.dispatchEvent(new CustomEvent("open-create-charge"));
  };

  return (
    <div className="flex min-h-screen bg-[#f8f7f5] overflow-x-hidden w-full">
      {/* Sidebar - Desktop Only (Hidden on < 1024px) */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[220px] flex-col bg-white lg:flex border-r border-[#fce4ec]">
        <div className="flex h-16 items-center px-6 border-b border-[#fce4ec]">
          <Logo size="md" />
        </div>

        <nav className="flex-1 px-3 pt-4 space-y-1">
          {menuItems.map((item) => {
            const on = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200",
                  on ? "text-white shadow-lg shadow-rose-100" : "text-[#8c8c8c] hover:text-[#e11d48] hover:bg-rose-50"
                )}
                style={on ? { background: "linear-gradient(135deg, #e11d48, #be123c)" } : undefined}
              >
                <item.Icon size={20} weight={on ? "bold" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 space-y-1">
          <div className="h-px bg-[#fce4ec] mx-4 mb-4" />
          
          <button onClick={() => setSupportOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold text-[#8c8c8c] hover:text-[#e11d48] hover:bg-rose-50 transition-all">
            <Question size={20} />
            Suporte
          </button>

          {bottomItems.map((item) => {
             const on = location.pathname === item.path;
             return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200",
                  on ? "text-white shadow-lg shadow-rose-100" : "text-[#8c8c8c] hover:text-[#e11d48] hover:bg-rose-50"
                )}
                style={on ? { background: "linear-gradient(135deg, #e11d48, #be123c)" } : undefined}
              >
                <item.Icon size={20} weight={on ? "bold" : "regular"} />
                {item.label}
              </Link>
             );
          })}

          <button onClick={() => signOut().then(() => navigate("/login"))} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold text-[#8c8c8c] hover:text-[#e11d48] hover:bg-rose-50 transition-all">
            <SignOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col w-full lg:pl-[220px]">
        {/* Topbar - Responsive */}
        <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-8 bg-white/80 backdrop-blur-md border-b border-[#fce4ec]">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-[#e11d48]">
               <Logo size="sm" iconOnly />
            </button>
            <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-[#1a1a2e]">
               {menuItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateCharge}
              className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[12px] font-bold text-white transition-all active:scale-[0.95]"
              style={{ background: "linear-gradient(135deg, #e11d48, #be123c)", boxShadow: "0 4px 12px rgba(225,29,72,0.2)" }}>
              <Plus size={18} weight="bold" />
              <span className="hidden xs:inline">Novo</span>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#8c8c8c] hover:bg-rose-50 transition-all">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 w-full max-w-[1320px] mx-auto p-4 sm:p-8 pb-28 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-white flex flex-col animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="flex h-16 items-center px-6 border-b border-[#fce4ec]">
               <Logo size="md" />
               <button onClick={() => setMobileMenuOpen(false)} className="ml-auto text-[#8c8c8c]">
                  <X size={24} />
               </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa] mb-4">Menu Principal</p>
              {menuItems.concat(bottomItems).map((item) => {
                const on = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold transition-all active:scale-[0.98]",
                      on ? "text-white shadow-lg shadow-rose-100" : "text-[#5c5c6d] hover:bg-[#f8f7f5]"
                    )}
                    style={on ? { background: "linear-gradient(135deg, #e11d48, #be123c)" } : undefined}
                  >
                    <item.Icon size={22} weight={on ? "bold" : "regular"} />
                    {item.label}
                  </Link>
                );
              })}
              
              <button
                onClick={() => signOut().then(() => navigate("/login"))}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold text-[#e11d48] hover:bg-rose-50 transition-all mt-4"
              >
                <SignOut size={22} weight="bold" />
                Sair da conta
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Persistent Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 backdrop-blur-xl border-t border-[#fce4ec] px-2 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {menuItems.map((item) => {
            const on = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all active:scale-90",
                  on ? "text-[#e11d48]" : "text-[#8c8c8c]"
                )}
              >
                <item.Icon size={22} weight={on ? "bold" : "regular"} />
                <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setSupportOpen(true)}
            className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-[#8c8c8c] active:scale-90"
          >
            <Question size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Suporte</span>
          </button>
          {bottomItems.map((item) => {
            const on = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all active:scale-90",
                  on ? "text-[#e11d48]" : "text-[#8c8c8c]"
                )}
              >
                <item.Icon size={22} weight={on ? "bold" : "regular"} />
                <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <SupportWidget isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}
