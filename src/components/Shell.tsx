import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import * as api from "../lib/api";
import type { Charge } from "../lib/api";
import { formatBRL } from "../lib/format";
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
  ShieldCheck,
  Headset,
  CheckCircle
} from "phosphor-react";
import SupportWidget from "./SupportWidget";
import { useEffect } from "react";

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
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Charge[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    // Load recent paid charges
    api.listChargesByProfile(profile.id).then((charges: Charge[]) => {
      const paid = charges
        .filter((c: Charge) => c.status === "paid")
        .sort((a: Charge, b: Charge) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime())
        .slice(0, 5);
      setNotifications(paid);
    });

    // Realtime subscription for new payments
    const channel = supabase.channel('realtime_payments')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'charges', 
        filter: `profile_id=eq.${profile.id}` 
      }, (payload) => {
        if (payload.old.status !== 'paid' && payload.new.status === 'paid') {
          const charge = payload.new as Charge;
          setNotifications(prev => [charge, ...prev].slice(0, 10));
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

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
          <Logo variant="light" size="sm" />
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
                <Logo size="sm" variant={isAdminPath || theme === "dark" ? "light" : "dark"} iconOnly />
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
                    <div className="relative">
                      <button 
                        onClick={() => { setIsNotifOpen(!isNotifOpen); setUnreadCount(0); }}
                        className="relative p-1.5 sm:p-2 rounded-lg text-neutral-400 dark:text-white/40 hover:text-[#0a0a0a] dark:hover:text-white transition-colors"
                      >
                        <Bell size={18} weight="duotone" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                        )}
                      </button>

                      {isNotifOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-50 origin-top-right animate-in fade-in zoom-in duration-200">
                            <h3 className="text-[11px] font-heading font-black text-[#0a0a0a] dark:text-white uppercase tracking-widest mb-3">Últimos Recebimentos</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                              {notifications.length === 0 ? (
                                <p className="text-[11px] text-neutral-400 dark:text-white/30 text-center py-4 font-medium">Nenhuma cobrança paga recentemente.</p>
                              ) : (
                                notifications.map(n => (
                                  <div key={n.id} className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-inner">
                                      <CheckCircle size={16} weight="fill" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[12px] font-heading font-bold text-[#0a0a0a] dark:text-white truncate">{n.service_name}</p>
                                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-tight">PIX Recebido • {formatBRL(n.amount_cents)}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="w-px h-4 bg-neutral-200 dark:bg-white/10 mx-1" />
                    <button onClick={() => setIsSupportOpen(true)} className="p-1.5 sm:p-2 rounded-lg text-neutral-400 dark:text-white/40 hover:text-[#9EEA6C] dark:hover:text-[#9EEA6C] transition-colors">
                      <Headset size={18} weight="duotone" />
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

      {!isAdminPath && <SupportWidget isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />}
    </div>
  );
}


