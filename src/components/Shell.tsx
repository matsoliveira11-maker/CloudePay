import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";
import { 
  House, 
  User, 
  Moon, 
  Sun, 
  SignOut, 
  Plus,
  Bell,
  Package,
  Question,
  Gear,
  ShieldCheck,
} from "phosphor-react";

interface ShellProps {
  children: React.ReactNode;
  onNewCharge?: () => void;
}

export default function Shell({ children, onNewCharge }: ShellProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname === "/one-above-all-2000";

  const menuItems = isAdminPath ? [] : [
    { label: "Dashboard", icon: House, path: "/painel" },
    { label: "Produtos", icon: Package, path: "/produtos" },
    { label: "Meu Perfil", icon: User, path: "/configuracoes" },
  ];

  const openTutorial = () => {
    window.dispatchEvent(new CustomEvent("open-onboarding-tour"));
  };

  const handleSignOut = () => {
    signOut();
    nav("/entrar");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060606] flex flex-row-reverse transition-colors duration-300">
      
      {/* --- SIDEBAR (RIGHT) --- */}
      <aside id="tour-profile" className="hidden lg:flex w-[260px] xl:w-[280px] flex-col bg-[#0a0a0a] text-white p-5 xl:p-6 shrink-0 border-l border-white/5 shadow-2xl relative z-50">
        <div className="mb-10">
          <Logo variant="white" size="sm" />
          {!isAdminPath && (
            <>
              <p className="mt-3 text-[10px] leading-relaxed text-white/40 font-body font-medium">
                Crie links de pagamento, receba por PIX e acompanhe tudo em tempo real.
              </p>
              <button 
                onClick={onNewCharge}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#9EEA6C] py-2.5 text-[12px] font-heading font-extrabold text-[#0a0a0a] hover:brightness-110 transition-all shadow-lg shadow-[#9EEA6C]/10 active:scale-[0.98]"
              >
                <Plus size={16} weight="bold" />
                Nova cobrança
              </button>
            </>
          )}
          {isAdminPath && (
            <p className="mt-3 text-[10px] leading-relaxed text-[#9EEA6C] font-heading font-black uppercase tracking-widest">
              Modo Founder Master Ativado
            </p>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = item.path.startsWith("/painel")
              ? location.pathname === "/painel"
              : location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-heading font-bold transition-all ${
                  isActive 
                    ? "bg-[#9EEA6C] text-[#0a0a0a]" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={18} weight={isActive ? "bold" : "duotone"} />
                {item.label}
              </Link>
            );
          })}
          
          {!isAdminPath && (
            <>
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-heading font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                {theme === "light" ? <Moon size={18} weight="duotone" /> : <Sun size={18} weight="duotone" />}
                Tema escuro
              </button>
              <button
                onClick={openTutorial}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-heading font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                <Question size={18} weight="duotone" />
                Ver tutorial
              </button>
            </>
          )}
        </nav>

        {/* User Card At Bottom */}
        <div className="mt-auto pt-5 border-t border-white/5">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9EEA6C] text-[#0a0a0a] font-heading font-extrabold text-sm">
              {profile?.full_name?.charAt(0) || "M"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-heading font-extrabold text-white uppercase tracking-tight">
                {profile?.full_name}
              </div>
              <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Conta ativa</div>
            </div>
            <button onClick={handleSignOut} className="text-white/20 hover:text-red-500 transition-colors">
              <SignOut size={17} weight="bold" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative ${isAdminPath ? 'dark' : ''}`}>
        <header className={`sticky top-0 z-40 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 ${isAdminPath ? 'bg-[#060606]/80 border-b border-white/5' : 'bg-[#f8fafc]/80 dark:bg-[#060606]/80'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="lg:hidden">
                <Logo size="sm" variant={isAdminPath || theme === "dark" ? "white" : "black"} iconOnly />
              </div>
              <div className="hidden lg:flex h-8 w-8 items-center justify-center">
                <Logo size="sm" variant={isAdminPath || theme === "dark" ? "white" : "black"} iconOnly />
              </div>
              {isAdminPath && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#9EEA6C] animate-pulse shadow-[0_0_8px_#9EEA6C]" />
                  <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.2em]">Sistemas Operacionais</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {!isAdminPath && (
                <>
                  <button 
                    onClick={onNewCharge}
                    className="flex items-center gap-2 rounded-xl bg-[#9EEA6C] px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-heading font-extrabold text-[#0a0a0a] shadow-lg shadow-[#9EEA6C]/10 active:scale-95 transition-all"
                  >
                    <Plus size={16} weight="bold" />
                    <span className="hidden xs:inline">Nova cobrança</span>
                  </button>

                  <div className="flex items-center bg-white dark:bg-white/5 p-1 rounded-xl border border-neutral-200 dark:border-white/10">
                    <button 
                      onClick={toggleTheme}
                      className="p-1.5 sm:p-2 rounded-lg text-neutral-400 dark:text-white/40 hover:text-[#0a0a0a] dark:hover:text-white transition-colors"
                    >
                      {theme === "light" ? <Moon size={18} weight="duotone" /> : <Sun size={18} weight="duotone" />}
                    </button>
                    <button className="p-1.5 sm:p-2 rounded-lg text-neutral-400 dark:text-white/40 hover:text-[#0a0a0a] dark:hover:text-white transition-colors">
                      <Bell size={18} weight="duotone" />
                    </button>
                    <div className="w-px h-4 bg-neutral-200 dark:bg-white/10 mx-1" />
                    <button className="p-1.5 sm:p-2 rounded-lg text-neutral-400 dark:text-white/40 hover:text-[#0a0a0a] dark:hover:text-white transition-colors">
                      <Gear size={18} weight="duotone" />
                    </button>
                  </div>
                </>
              )}
              
              {isAdminPath && (
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                  <ShieldCheck size={18} weight="duotone" className="text-[#9EEA6C]" />
                  <span className="text-[10px] font-heading font-black text-white/60 uppercase tracking-widest">Acesso de Fundador</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 pb-24 sm:pb-24">
          {children}
        </main>

        {/* Mobile Nav */}
        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-neutral-200 dark:border-white/5 bg-white/95 dark:bg-[#0a0a0a]/95 px-3 py-2 backdrop-blur-xl">
          <div className="flex items-center justify-around">
            {menuItems.map((item) => {
              const isActive = item.path.startsWith("/painel")
                ? location.pathname === "/painel"
                : location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 min-w-[56px] ${
                    isActive ? "text-[#9EEA6C]" : "text-neutral-400 dark:text-white/30"
                  }`}
                >
                  <item.icon size={22} weight={isActive ? "fill" : "bold"} />
                  <span className="text-[10px] font-heading font-bold leading-none">
                    {item.label === "Meu Perfil" ? "Perfil" : item.label}
                  </span>
                </Link>
              );
            })}
            <button onClick={onNewCharge} className="h-12 w-12 -translate-y-4 rounded-xl bg-[#9EEA6C] text-[#0a0a0a] shadow-xl shadow-[#9EEA6C]/30 flex items-center justify-center active:scale-90 transition-all">
              <Plus size={22} weight="bold" />
            </button>
            <button onClick={toggleTheme} className="flex flex-col items-center gap-1 min-w-[56px] text-neutral-400 dark:text-white/30">
              {theme === "light" ? <Moon size={22} weight="bold" /> : <Sun size={22} weight="bold" />}
              <span className="text-[10px] font-heading font-bold leading-none">Tema</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}


