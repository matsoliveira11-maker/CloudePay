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
  X
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
  ];

  const bottomItems = [
    { key: "perfil", label: "Meu Perfil", Icon: User, path: "/perfil" },
    { key: "config", label: "Ajustes", Icon: Gear, path: "/configuracoes" },
  ];

  const handleCreateCharge = () => {
    window.dispatchEvent(new CustomEvent("open-create-charge"));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-white border-r border-gray-100 lg:flex">
        <div className="flex h-20 items-center px-8 border-b border-gray-50">
          <Logo size="md" />
        </div>

        <nav className="flex-1 space-y-1 px-4 py-8">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === item.key 
                  ? "bg-[#e11d48] text-white shadow-lg shadow-rose-200" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              <item.Icon size={18} weight={activeTab === item.key ? "bold" : "regular"} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 px-4 py-8 border-t border-gray-50">
          {bottomItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === item.key 
                  ? "bg-[#e11d48] text-white shadow-lg shadow-rose-200" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              <item.Icon size={18} weight={activeTab === item.key ? "bold" : "regular"} />
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => signOut().then(() => navigate("/login"))}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-rose-50 hover:text-[#e11d48] transition-all"
          >
            <SignOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden">
        <Logo size="sm" />
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-400">
          <List size={24} />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header - Desktop */}
        <header className="sticky top-0 z-40 hidden h-20 items-center justify-between bg-white/80 px-8 backdrop-blur-md border-b border-gray-50 lg:flex">
          <div className="flex items-center gap-4">
             <h2 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">Página Principal</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-gray-300 hover:text-[#e11d48] transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#e11d48]" />
            </button>
            <div className="h-6 w-px bg-gray-100" />
            <button 
              onClick={handleCreateCharge}
              className="flex items-center gap-2 rounded-full bg-[#e11d48] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-rose-200 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} weight="bold" />
              Nova cobrança
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Logo size="sm" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400">
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 px-4 py-8 space-y-2">
            {menuItems.concat(bottomItems).map((item) => (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-4 text-xs font-black uppercase tracking-widest ${
                  activeTab === item.key ? "bg-[#e11d48] text-white" : "text-gray-400"
                }`}
              >
                <item.Icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <SupportWidget isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}
