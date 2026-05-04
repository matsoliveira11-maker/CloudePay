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
  Plus
} from "phosphor-react";

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [supportOpen, setSupportOpen] = useState(false);

  const activeTab = React.useMemo(() => {
    if (location.pathname === "/painel") return "dashboard";
    if (location.pathname === "/cobrancas") return "cobrancas";
    if (location.pathname === "/produtos") return "produtos";
    if (location.pathname === "/relatorios") return "relatorios";
    if (location.pathname === "/configuracoes") return "config";
    if (location.pathname === "/perfil") return "perfil";
    return "";
  }, [location.pathname]);

  const menuItems = [
    { key: "dashboard", label: "Dashboard", Icon: Layout, path: "/painel" },
    { key: "cobrancas", label: "Cobranças", Icon: Receipt, path: "/cobrancas" },
    { key: "produtos", label: "Produtos", Icon: Package, path: "/produtos" },
    { key: "relatorios", label: "Relatórios", Icon: ChartBar, path: "/relatorios" },
    { key: "config", label: "Config", Icon: Gear, path: "/configuracoes" },
    { key: "perfil", label: "Perfil", Icon: User, path: "/configuracoes" },
  ];

  const handleCreateCharge = () => {
    window.dispatchEvent(new CustomEvent("open-create-charge"));
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1A1A1A] antialiased">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-gray-100 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center px-8">
          <Link to="/painel"><Logo /></Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {menuItems.map(({ key, label, Icon, path }) => {
            const isActive = activeTab === key;
            return (
              <Link
                key={key}
                to={path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-[#e11d48] text-white shadow-lg shadow-rose-500/20" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A]"
                }`}
              >
                <Icon size={20} weight={isActive ? "fill" : "regular"} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-50 p-4">
          <button
            onClick={() => { signOut(); navigate("/entrar"); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-50 hover:text-red-600"
          >
            <SignOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 h-20 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4 sm:px-8">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Dashboard</h1>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleCreateCharge}
                className="flex items-center gap-2 rounded-full bg-[#e11d48] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-[#be123c] active:scale-95"
              >
                <Plus size={18} weight="bold" />
                Nova cobrança
              </button>
              
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-gray-100 bg-white/95 px-2 pb-safe pt-2 backdrop-blur-xl lg:hidden">
        {menuItems.slice(0, 4).map(({ key, label, Icon, path }) => (
          <Link
            key={key}
            to={path}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold transition-all ${
              activeTab === key ? "text-[#e11d48]" : "text-gray-400"
            }`}
          >
            <Icon size={24} weight={activeTab === key ? "fill" : "regular"} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {supportOpen && (
        <SupportWidget isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
      )}
    </div>
  );
}

