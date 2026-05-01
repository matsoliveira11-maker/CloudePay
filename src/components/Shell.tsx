import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import * as api from "../lib/api";
import type { Charge } from "../lib/api";
import Logo from "./Logo";

// Icons (Inspiration Style)
function PanelIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}

function ProductIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function UserIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HelpIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [supportOpen, setSupportOpen] = useState(false);
  const [notifications, setNotifications] = useState<Charge[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const activeTab = useMemo(() => {
    if (location.pathname === "/painel") return "dashboard";
    if (location.pathname === "/produtos") return "produtos";
    if (location.pathname === "/configuracoes") return "perfil";
    return "";
  }, [location.pathname]);

  const reloadNotifications = useCallback(async () => {
    if (!profile?.id) return;
    const list = await api.listChargesByProfile(profile.id);
    const recent = list
      .filter(c => c.status === "paid")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    setNotifications(recent);
  }, [profile?.id]);

  useEffect(() => {
    reloadNotifications();

    if (!profile?.id) return;
    const channel = supabase.channel('realtime_shell')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'charges', 
        filter: `profile_id=eq.${profile.id}` 
      }, (payload) => {
        if (payload.old.status !== 'paid' && payload.new.status === 'paid') {
          reloadNotifications();
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, reloadNotifications]);

  const menuItems = [
    { key: "dashboard", label: "Dashboard", Icon: PanelIcon, path: "/painel" },
    { key: "produtos", label: "Produtos", Icon: ProductIcon, path: "/produtos" },
    { key: "perfil", label: "Meu perfil", Icon: UserIcon, path: "/configuracoes" },
  ];

  return (
    <>
      <main className="min-h-screen bg-[#fffafa] text-[#4c0519] antialiased page-grid">
        <header className="sticky top-0 z-40 border-b border-[#fecdd3] bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <Link to="/painel" className="inline-flex"><Logo /></Link>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-[#fecdd3] bg-white px-4 py-2 text-sm font-semibold text-[#881337] sm:inline-flex">
                cloudepay.com.br/{profile?.slug || "carregando"}
              </span>
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#fecdd3] bg-white text-[#881337] transition hover:bg-[#fff1f2]"
                title={`${unreadCount} nova(s) notificação(ões)`}
                aria-label="Notificações"
              >
                <HelpIcon className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e11d48] text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => { signOut(); navigate("/entrar"); }}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[#4c0519] px-4 text-xs font-semibold text-white transition hover:bg-[#7f1235] sm:text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:grid-cols-[240px_1fr] lg:px-8 lg:py-8">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-3xl border border-[#fecdd3] bg-white/90 p-3 shadow-[0_24px_70px_rgba(136,19,55,0.08)]">
              {menuItems.map(({ key, label, Icon, path }) => (
                <Link
                  key={key}
                  to={path}
                  className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition last:mb-0 ${
                    activeTab === key ? "bg-[#e11d48] text-white shadow-[0_12px_26px_rgba(225,29,72,0.22)]" : "text-[#881337] hover:bg-[#fff1f2] hover:text-[#4c0519]"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            {children}
          </section>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#fecdd3] bg-white/92 px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-2 shadow-[0_-18px_45px_rgba(136,19,55,0.08)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
            {menuItems.map(({ key, label, Icon, path }) => (
              <Link
                key={key}
                to={path}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-semibold transition ${
                  activeTab === key ? "bg-[#e11d48] text-white shadow-[0_10px_24px_rgba(225,29,72,0.24)]" : "text-[#881337] hover:bg-[#fff1f2]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </main>

      {supportOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-[#4c0519]/35 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl border border-[#fecdd3] bg-white p-5 shadow-[0_28px_90px_rgba(76,5,25,0.22)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold text-[#e11d48]">Suporte Direto</span>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[#4c0519]">Fale com o Fundador</h2>
                <p className="mt-2 text-sm leading-6 text-[#881337]">Envie sua dúvida ou sugestão. Responderei o mais rápido possível.</p>
              </div>
              <button type="button" onClick={() => setSupportOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[#4c0519] transition hover:text-[#e11d48]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Mensagem enviada com sucesso! Entrarei em contato em breve."); setSupportOpen(false); }}>
              <textarea 
                className="w-full rounded-2xl border border-[#fecdd3] bg-[#fffafa] p-4 text-sm text-[#4c0519] outline-none transition focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]" 
                rows={4} 
                placeholder="Escreva sua mensagem aqui..." 
                required 
              />
              <button type="submit" className="w-full rounded-2xl bg-[#e11d48] py-3.5 text-sm font-semibold text-white transition hover:bg-[#be123c]">
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
