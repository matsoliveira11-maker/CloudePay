import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import SupportWidget from "./SupportWidget";
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
  List,
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
    { label: "Dashboard", Icon: Layout, path: "/painel", active: location.pathname === "/painel" },
    { label: "Cobranças", Icon: Receipt, path: "/cobrancas", active: location.pathname === "/cobrancas" },
    { label: "Produtos", Icon: Package, path: "/produtos", active: location.pathname === "/produtos" },
    { label: "Relatórios", Icon: ChartBar, path: "/relatorios", active: location.pathname === "/relatorios" },
  ];

  const bottomItems = [
    { label: "Perfil", Icon: User, path: "/perfil", active: location.pathname === "/perfil" },
    { label: "Ajustes", Icon: Gear, path: "/configuracoes", active: location.pathname === "/configuracoes" },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col bg-white border-r border-gray-100 lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex h-24 items-center px-10">
          <Logo size="md" />
        </div>

        <div className="flex flex-1 flex-col justify-between px-6 py-6">
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                  item.active 
                    ? "bg-[#e11d48] text-white shadow-xl shadow-rose-200" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                <item.Icon size={20} weight={item.active ? "bold" : "regular"} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-1.5 border-t border-gray-50 pt-8">
            {bottomItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                  item.active 
                    ? "bg-[#e11d48] text-white shadow-xl shadow-rose-200" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                <item.Icon size={20} weight={item.active ? "bold" : "regular"} />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => setSupportOpen(true)}
              className="flex w-full items-center gap-3.5 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
            >
              <Question size={20} />
              Suporte
            </button>
            <button
              onClick={() => signOut().then(() => navigate("/login"))}
              className="flex w-full items-center gap-3.5 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 hover:bg-rose-50 hover:text-[#e11d48] transition-all"
            >
              <SignOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-gray-100 bg-white/80 px-6 backdrop-blur-xl lg:px-10">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 lg:hidden"
          >
            <List size={22} weight="bold" />
          </button>

          <div className="hidden lg:block">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Overview</p>
             <h2 className="text-sm font-black text-[#1A1A1A] mt-0.5">Olá, Bem-vindo de volta!</h2>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-50 hover:text-[#e11d48]">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#e11d48] border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-gray-100" />
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("open-create-charge"))}
              className="flex items-center gap-2 rounded-full bg-[#e11d48] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-rose-200 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} weight="bold" />
              <span className="hidden sm:inline">Nova Cobrança</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1400px] p-6 lg:p-10">
             {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-80 bg-white p-8 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-12">
               <Logo size="md" />
               <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400"><X size={24} weight="bold" /></button>
            </div>
            <nav className="space-y-2">
              {menuItems.concat(bottomItems).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest ${
                    item.active ? "bg-[#e11d48] text-white shadow-xl shadow-rose-200" : "text-gray-400"
                  }`}
                >
                  <item.Icon size={22} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <SupportWidget isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}
