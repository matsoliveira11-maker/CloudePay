import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowDown,
    ArrowUp,
    Bell,
    ChartBar,
    ChartLineUp,
    ChatCircleDots,
    Database,
    DotsThree,
    DownloadSimple,
    Eye,
    FileText,
    Funnel,
    GearSix,
    Headset,
    Lightning,

    Lock,
    MagnifyingGlass,
    Activity as Pulse,
    Receipt,
    ShieldWarning,
    SignOut,
    Sparkle,
    Trash,

    TrendUp,
    UserCircle,
    UsersFour,
    WarningCircle,
    X,
    ShieldCheck
} from "phosphor-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { signIn, getMasterStats, getAllProfiles, getAllCharges, getAdminTickets, getTicketMessages, sendTicketMessage, closeTicket } from "../lib/api";
import { supabase } from "../lib/supabase";


/* ------------------------------------------------------------------ */
/* Tipos de janelas                                                    */
/* ------------------------------------------------------------------ */

type AppId =
    | "dashboard"
    | "users"
    | "charges"
    | "finance"
    | "reports"
    | "support"
    | "settings"
    | "logs";

interface AppDef {
    id: AppId;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Icon: any;
    color: string;
}

const APPS: AppDef[] = [
    { id: "dashboard", label: "Dashboard", Icon: ChartLineUp, color: "#9EEA6C" },
    { id: "users", label: "Usuários", Icon: UsersFour, color: "#3B82F6" },
    { id: "charges", label: "Cobranças", Icon: Receipt, color: "#A78BFA" },
    { id: "finance", label: "Financeiro", Icon: ChartBar, color: "#F59E0B" },
    { id: "reports", label: "Relatórios", Icon: FileText, color: "#22D3EE" },
    { id: "support", label: "Suporte", Icon: Headset, color: "#34D399" },
    { id: "settings", label: "Config.", Icon: GearSix, color: "#94A3B8" },
    { id: "logs", label: "Logs", Icon: Database, color: "#F87171" },
];

const ADMIN_EMAILS = ["matsoliveira11@gmail.com", "mats.oliveira11@gmail.com"];
// @ts-ignore
const MASTER_SECRET_TOKEN = import.meta.env.VITE_MASTER_TOKEN;

const fmtBRL = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/* ------------------------------------------------------------------ */
/* Página principal — CloudeOS                                         */
/* ------------------------------------------------------------------ */

export default function Admin() {
    const { profile } = useAuth();
    const [masterToken, setMasterToken] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [tokenError, setTokenError] = useState(false);
    const [openApps, setOpenApps] = useState<AppId[]>(["dashboard"]);
    const [activeApp, setActiveApp] = useState<AppId>("dashboard");
    const [showStart, setShowStart] = useState(false);
    const [now, setNow] = useState(new Date());

    // Admin Login State
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const isAdmin = profile && ADMIN_EMAILS.includes(profile.email?.toLowerCase());

    // Real Data State
    const [realStats, setRealStats] = useState<any>(null);
    const [realUsers, setRealUsers] = useState<any[]>([]);
    const [realCharges, setRealCharges] = useState<any[]>([]);
    const [, setLoadingData] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(t);
    }, []);

    const fetchAdminData = async () => {
        setLoadingData(true);
        try {
            const [stats, users, charges] = await Promise.all([
                getMasterStats(),
                getAllProfiles(),
                getAllCharges()
            ]);
            setRealStats(stats);
            setRealUsers(users);
            setRealCharges(charges);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoadingData(false);
        }
    };

    // Auto fetch when unlocked
    useEffect(() => {
        if (isUnlocked) {
            fetchAdminData();
        }
    }, [isUnlocked]);

    function openApp(id: AppId) {
        setOpenApps((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setActiveApp(id);
        setShowStart(false);
    }

    function closeApp(id: AppId) {
        setOpenApps((prev) => prev.filter((a) => a !== id));
        if (activeApp === id) {
            const remaining = openApps.filter((a) => a !== id);
            setActiveApp(remaining[remaining.length - 1] ?? "dashboard");
        }
    }

    const handleUnlock = () => {
        if (masterToken === MASTER_SECRET_TOKEN) {
            setIsUnlocked(true);
            setTokenError(false);
        } else {
            setTokenError(true);
        }
    };

    const handleAdminLogin = async () => {
        if (!adminEmail || !adminPassword) {
            setLoginError("Preencha todos os campos.");
            return;
        }

        setIsLoggingIn(true);
        setLoginError("");
        try {
            const res = await signIn(adminEmail, adminPassword);
            if (!res.ok) {
                setLoginError(res.error || "Credenciais inválidas.");
            } else {
                if (!ADMIN_EMAILS.includes(res.profile?.email?.toLowerCase() || "")) {
                    setLoginError("Este usuário não tem permissão de fundadores.");
                }
            }
        } catch (err) {
            setLoginError("Ocorreu um erro ao tentar acessar.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#000000] p-6 font-sans antialiased selection:bg-white selection:text-black">
                {/* Subtle Light Source (Visionary Touch) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.03] blur-[120px] pointer-events-none" />

                <div className="w-full max-w-[360px] relative z-10">
                    <div className="mb-12 text-center animate-in fade-in duration-1000">
                        <div className="mx-auto mb-10 flex justify-center scale-[1.2]">
                            <Logo variant="light" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-white">Acesso ao Cofre</h1>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Console de Fundador v2.0</p>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-[2rem] p-8 shadow-[0_0_1px_rgba(255,255,255,0.1)] relative group overflow-hidden">
                        {/* Interactive light effect on border */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        <div className="space-y-7 relative z-10">
                            <div className="space-y-2.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Identidade</label>
                                <input
                                    type="email"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    placeholder="admin@cloudepay.com"
                                    className="w-full h-12 bg-black border border-white/[0.08] rounded-xl px-5 text-sm text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/5 transition-all"
                                />
                            </div>
                            
                            <div className="space-y-2.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Chave Mestra</label>
                                <input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                                    placeholder="••••••••"
                                    className="w-full h-12 bg-black border border-white/[0.08] rounded-xl px-5 text-sm text-white placeholder:text-zinc-800 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/5 transition-all"
                                />
                            </div>

                            {loginError && (
                                <div className="px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-bold text-center uppercase tracking-widest animate-in zoom-in-95">
                                    {loginError}
                                </div>
                            )}

                            <button 
                                onClick={handleAdminLogin}
                                disabled={isLoggingIn}
                                className="w-full h-12 bg-white hover:bg-[#f2f2f2] disabled:opacity-30 text-black rounded-xl font-bold text-[11px] uppercase tracking-[0.1em] transition-all active:scale-[0.98] mt-2 shadow-[0_8px_30px_rgb(255,255,255,0.05)]"
                            >
                                {isLoggingIn ? "Autenticando..." : "Autorizar Acesso"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-16 text-center animate-in fade-in duration-1000 delay-500">
                        <Link to="/painel" className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">
                            Voltar ao Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!isUnlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#000000] p-6 selection:bg-white selection:text-black">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.03] blur-[120px] pointer-events-none" />

                <div className="w-full max-w-[400px] bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] p-12 text-center relative z-10 shadow-2xl">
                    <div className="mx-auto w-16 h-16 rounded-full bg-white text-black flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        <ShieldCheck size={32} weight="bold" />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2 tracking-tight">Controle de Acesso</h1>
                    <p className="text-[9px] text-zinc-600 mb-12 uppercase tracking-[0.5em] font-black">Apenas Pessoal Autorizado</p>
                    
                    <div className="space-y-6">
                        <input
                            type="password"
                            value={masterToken}
                            onChange={(e) => setMasterToken(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                            placeholder="CHAVE_MESTRA"
                            className="w-full h-14 bg-black border border-white/[0.08] rounded-2xl px-6 text-center text-white font-mono text-lg tracking-[0.4em] placeholder:text-zinc-900 focus:outline-none focus:border-white/20 transition-all"
                        />
                        {tokenError && (
                            <p className="text-[9px] text-red-500 font-black uppercase tracking-widest animate-pulse">Incompatibilidade de Criptografia</p>
                        )}
                        <button 
                            onClick={handleUnlock}
                            className="w-full h-14 bg-white hover:bg-[#f2f2f2] text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98]"
                        >
                            Executar Desbloqueio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const clock = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const dateLabel = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden bg-[#000000] text-white font-sans antialiased selection:bg-white selection:text-black">
            {/* Visionary OLED Wallpaper */}
            <div aria-hidden className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#e11d48]/05 rounded-full blur-[120px]" />
            </div>

            {/* Topbar — surgical precision */}
            <div className="relative z-30 flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="hover:scale-105 transition-transform duration-500">
                        <Logo variant="light" />
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.02] backdrop-blur-md">
                        <Lock size={12} weight="bold" className="text-zinc-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Console do Cofre v2.0</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.02] backdrop-blur-md text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <Pulse size={14} weight="bold" className="text-white animate-pulse" />
                        Sistemas Operacionais
                    </div>
                    <div className="h-8 w-8 flex items-center justify-center rounded-full border border-white/[0.05] bg-white/[0.02] text-zinc-500">
                        <Bell size={16} weight="bold" />
                    </div>
                    <div className="px-4 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.02] font-mono text-[10px] text-zinc-400 tracking-widest">
                        {dateLabel} · {clock}
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <main className="relative z-10 mx-auto h-[calc(100vh-120px)] md:h-[calc(100vh-150px)] max-w-[1500px] px-2 sm:px-6 mt-2 md:mt-4">
                {openApps.length === 0 ? (
                    <EmptyDesk onOpen={openApp} />
                ) : (
                    <div className="relative h-full">
                        {openApps.map((id) => (
                            <AppWindow
                                key={id}
                                visible={id === activeApp}
                                appId={id}
                                onClose={() => closeApp(id)}
                                onMinimize={() => setActiveApp(openApps.find((a) => a !== id) ?? id)}
                                onFocus={() => setActiveApp(id)}
                                realStats={realStats}
                                realUsers={realUsers}
                                realCharges={realCharges}
                                fetchAdminData={fetchAdminData}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Start menu */}
            {showStart && (
                <StartMenu
                    onClose={() => setShowStart(false)}
                    onLaunch={(id) => openApp(id)}
                    openApps={openApps}
                />
            )}

            {/* Taskbar (Windows-like) */}
            <Taskbar
                apps={APPS}
                openApps={openApps}
                activeApp={activeApp}
                onLaunch={openApp}
                onShowStart={() => setShowStart((s) => !s)}
                startActive={showStart}
            />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Janela genérica                                                     */
/* ------------------------------------------------------------------ */

function AppWindow({
    visible, appId, onClose, onMinimize, onFocus,
    realStats, realUsers, realCharges, fetchAdminData,
}: {
    visible: boolean;
    appId: AppId;
    onClose: () => void;
    onMinimize: () => void;
    onFocus: () => void;
    realStats: any;
    realUsers: any[];
    realCharges: any[];
    fetchAdminData: () => void;
}) {
    const def = APPS.find((a) => a.id === appId)!;
    return (
        <section
            onClick={onFocus}
            style={{ 
                display: visible ? "flex" : "none", 
                zIndex: visible ? 20 : 10,
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0
            }}
            className="flex-col overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#0a0a0a] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300"
        >
            {/* Window chrome — High contrast */}
            <header className="flex items-center justify-between gap-3 border-b border-white/[0.04] px-6 py-4 cursor-default bg-white/[0.01]">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05]"
                        style={{ color: def.color }}
                    >
                        <def.Icon size={18} weight="bold" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-widest">{def.label}</span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Console Administrativo CloudeOS</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-white/[0.04] hover:text-white transition-all" aria-label="Minimizar">
                        <span className="block h-px w-3 bg-current" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-all" aria-label="Fechar">
                        <X size={14} weight="bold" />
                    </button>
                </div>
            </header>

            {/* Body — Pure focus */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar flex flex-col bg-[#000000]">
                {appId === "dashboard" && <DashboardApp stats={realStats} charges={realCharges} />}
                {appId === "users" && <UsersApp users={realUsers} onRefresh={fetchAdminData} />}
                {appId === "charges" && <ChargesApp charges={realCharges} />}
                {appId === "finance" && <FinanceApp stats={realStats} charges={realCharges} />}
                {appId === "reports" && <ReportsApp />}
                {appId === "support" && <SupportApp />}
                {appId === "settings" && <SettingsApp />}
                {appId === "logs" && <LogsApp />}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Empty desktop                                                       */
/* ------------------------------------------------------------------ */

function EmptyDesk({ onOpen }: { onOpen: (id: AppId) => void }) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="mx-auto w-20 h-20 rounded-full border border-white/[0.05] bg-white/[0.02] flex items-center justify-center mb-10 shadow-2xl">
                    <Sparkle size={32} weight="bold" className="text-white/20" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Núcleo em Repouso</h2>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Selecione um módulo para iniciar a gestão da fundação</p>
                
                <div className="mt-12 flex justify-center gap-4">
                    <button
                        onClick={() => onOpen("dashboard")}
                        className="px-8 py-3 rounded-2xl border border-white/10 bg-white text-black font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgb(255,255,255,0.05)]"
                    >
                        Iniciar Terminal
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Start menu                                                          */
/* ------------------------------------------------------------------ */

function StartMenu({
    onClose, onLaunch, openApps,
}: {
    onClose: () => void;
    onLaunch: (id: AppId) => void;
    openApps: AppId[];
}) {
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className="fixed bottom-[88px] left-1/2 z-50 w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d10]/95 p-5 shadow-2xl shadow-black/60 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-300">
                <div className="mb-3 flex items-center gap-2">
                    <MagnifyingGlass size={16} weight="duotone" className="text-white/40" />
                    <input
                        placeholder="Buscar ferramentas e atalhos..."
                        className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-lime-accent/30"
                    />
                </div>

                <p className="mb-2 px-1 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Aplicativos</p>
                <div className="grid grid-cols-4 gap-2">
                    {APPS.map(({ id, label, Icon, color }) => (
                        <button
                            key={id}
                            onClick={() => onLaunch(id)}
                            className="group flex flex-col items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-white/15 hover:bg-white/[0.06]"
                        >
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                                style={{ background: `${color}1f`, color }}
                            >
                                <Icon size={22} weight="duotone" />
                            </div>
                            <span className="font-heading text-[11px] font-semibold text-white/80">{label}</span>
                            {openApps.includes(id) && <span className="h-1 w-1 rounded-full bg-lime-accent" />}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-accent font-heading text-xs font-bold text-[#0a0a0a]">M</div>
                        <div>
                            <p className="font-heading text-sm font-semibold text-white">Mateus Oliveira</p>
                            <p className="font-body text-[10px] text-white/40">Sessão segura de Fundador</p>
                        </div>
                    </div>
                    <Link to="/painel" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs text-white/55 hover:bg-white/[0.06] hover:text-white">
                        <SignOut size={14} weight="duotone" />
                        Sair do Admin
                    </Link>
                </div>
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Taskbar                                                             */
/* ------------------------------------------------------------------ */

function Taskbar({
    apps, openApps, activeApp, onLaunch, onShowStart, startActive,
}: {
    apps: AppDef[];
    openApps: AppId[];
    activeApp: AppId;
    onLaunch: (id: AppId) => void;
    onShowStart: () => void;
    startActive: boolean;
}) {
    return (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 px-4">
            <div className="flex items-center gap-2 rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a]/80 p-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] backdrop-blur-3xl">
                <button
                    onClick={onShowStart}
                    aria-label="Abrir menu"
                    className={`group shrink-0 flex h-12 w-12 items-center justify-center rounded-[1.2rem] transition-all active:scale-90 ${startActive ? "bg-white" : "hover:bg-white/[0.05] text-white/40"
                        }`}
                >
                    <div className={startActive ? "brightness-0" : "scale-90 transition-transform group-hover:scale-100"}>
                        <Logo variant="light" iconOnly />
                    </div>
                </button>
                <div className="mx-2 hidden h-8 w-px shrink-0 bg-white/[0.08] sm:block" />
                <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
                    {apps.map(({ id, label, Icon }) => {
                        const isOpen = openApps.includes(id);
                        const isActive = isOpen && id === activeApp;
                        return (
                            <button
                                key={id}
                                onClick={() => onLaunch(id)}
                                title={label}
                                className={`group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] transition-all active:scale-90 ${isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}
                            >
                                <Icon
                                    size={20}
                                    weight="bold"
                                    className={`transition-colors duration-300 ${isActive ? "text-white" : "text-zinc-600 group-hover:text-zinc-300"}`}
                                />
                                {isOpen && (
                                    <span
                                        className={`absolute -bottom-1 h-0.5 rounded-full transition-all bg-white ${isActive ? "w-4 opacity-100" : "w-1 opacity-40"
                                            }`}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


/* ================================================================== */
/* APP 1 — DASHBOARD                                                   */
/* ================================================================== */

function DashboardApp({ stats, charges }: { stats: any; charges: any[] }) {
    const revenue = stats?.revenue || 0;
    const gmv = stats?.gmv || 0;
    const users = stats?.users || 0;
    const conversion = stats?.conversions || 0;
    const totalCharges = stats?.totalCharges || 0;

    // Derive status breakdown from real charges
    const paid = charges.filter((c) => c.status === "paid").length;
    const pending = charges.filter((c) => c.status === "pending").length;
    const expired = charges.filter((c) => c.status === "expired").length;
    const statusData = [
        { label: "Pagas", value: paid || 1, color: "#9EEA6C" },
        { label: "Pendentes", value: pending || 0, color: "#F59E0B" },
        { label: "Expiradas", value: expired || 0, color: "#94A3B8" },
    ].filter((s) => s.value > 0);

    // Derive daily revenue from real charges (last 14 days)
    const dailyRevenue: number[] = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().slice(0, 10);
        const total = charges
            .filter((c) => c.status === "paid" && (c.created_at || c.createdAt || "").slice(0, 10) === dayStr)
            .reduce((s: number, c: any) => s + (c.fee_cents || c.fee || 0), 0);
        dailyRevenue.push(total);
    }

    return (
        <div className="space-y-5">
            {/* KPIs */}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Receita CloudePay (1%)" value={fmtBRL(revenue)} delta={0} icon={TrendUp} />
                <KpiCard label="Usuários cadastrados" value={String(users)} delta={0} icon={UsersFour} />
                <KpiCard label="GMV Total" value={fmtBRL(gmv)} delta={0} icon={ChartBar} />
                <KpiCard label="Conversão" value={`${conversion.toFixed(1)}%`} delta={0} icon={Pulse} />
            </div>

            {/* Resumo real */}
            <Panel title="Resumo da Plataforma" icon={WarningCircle}>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-6 group hover:border-white/10 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Total de Transações</span>
                        <p className="mt-3 text-3xl font-bold text-white tracking-tight">{totalCharges}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-6 group hover:border-emerald-500/30 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Autorizadas</span>
                        <p className="mt-3 text-3xl font-bold text-white tracking-tight">{paid}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.02] p-6 group hover:border-amber-500/30 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60">Execução Pendente</span>
                        <p className="mt-3 text-3xl font-bold text-white tracking-tight">{pending}</p>
                    </div>
                </div>
            </Panel>

            {/* Charts from REAL data */}
            <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="Receita por dia (últimos 14 dias)" icon={ChartLineUp}>
                    <LineChart data={dailyRevenue.some((v) => v > 0) ? dailyRevenue : [0, 0, 0]} />
                </Panel>
                <Panel title="Status das cobranças" icon={Receipt}>
                    {statusData.length > 0 ? (
                        <BarsHorizontal data={statusData} />
                    ) : (
                        <p className="py-8 text-center font-body text-sm text-white/40">Nenhuma cobrança registrada ainda.</p>
                    )}
                </Panel>
            </div>
        </div>
    );
}

function KpiCard({
    label, value, delta, inverted, icon: Icon,
}: {
    label: string; value: string; delta: number; inverted?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
}) {
    const positive = inverted ? delta < 0 : delta > 0;
    const Trend = positive ? ArrowUp : ArrowDown;
    return (
        <div className="rounded-2xl border border-white/[0.05] bg-[#0a0a0a] p-5 transition-all hover:border-white/10 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">{label}</p>
                    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-white group-hover:scale-110 transition-transform">
                    <Icon size={20} weight="bold" />
                </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
                <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${positive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    <Trend size={10} weight="bold" />
                    {Math.abs(delta).toFixed(1)}%
                </div>
                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">vs. período anterior</span>
            </div>
        </div>
    );
}

function Panel({
    title, children, icon: Icon, className,
}: {
    title: string; children: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: any; className?: string;
}) {
    return (
        <section className={`rounded-2xl border border-white/[0.04] bg-[#050505] p-6 ${className ?? ""}`}>
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.02] pb-4">
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} weight="bold" className="text-white/20" />}
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">{title}</h3>
                </div>
            </div>
            {children}
        </section>
    );
}

/* ------------------ Mini-charts (SVG, sem libs) -------------------- */

function LineChart({ data }: { data: number[] }) {
    const w = 600, h = 180, p = 12;
    const max = Math.max(...data), min = Math.min(...data);
    const points = data.map((v, i) => [
        p + (i * (w - 2 * p)) / (data.length - 1),
        h - p - ((v - min) / (max - min || 1)) * (h - 2 * p),
    ] as const);
    const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
    const area = `${path} L${points[points.length - 1][0]},${h - p} L${p},${h - p} Z`;
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full">
            <defs>
                <linearGradient id="lg1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#9EEA6C" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#9EEA6C" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#lg1)" />
            <path d={path} fill="none" stroke="#9EEA6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.map(([x, y], i) => i % 5 === 0 && <circle key={i} cx={x} cy={y} r="3" fill="#9EEA6C" />)}
        </svg>
    );
}

function BarsHorizontal({ data }: { data: { label: string; value: number; color: string }[] }) {
    const max = Math.max(...data.map((d) => d.value));
    return (
        <ul className="space-y-2.5">
            {data.map((d) => (
                <li key={d.label}>
                    <div className="mb-1 flex justify-between font-body text-[11px] text-white/55">
                        <span>{d.label}</span>
                        <span className="font-mono">{d.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}



/* ================================================================== */
/* APP 2 — USUÁRIOS                                                    */
/* ================================================================== */

function UsersApp({ users, onRefresh }: { users: any[], onRefresh: () => void }) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<any | null>(null);

    const dataToUse = users;

    const filtered = dataToUse.filter((u: any) => {
        const name = u.full_name || u.name || "";
        const email = u.email || "";
        if (search && !`${name} ${email}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className={`grid gap-6 h-full items-start ${selected ? "lg:grid-cols-[1fr_380px]" : ""}`}>
            <div className="flex flex-col h-full">
                <div className="mb-6 flex flex-wrap items-center gap-3 bg-white/[0.01] p-2 rounded-2xl border border-white/[0.03]">
                    <SearchBox value={search} onChange={setSearch} placeholder="Buscar identidade..." />
                    <button onClick={onRefresh} className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02] text-zinc-500 hover:text-white transition-all">
                        <Sparkle size={18} weight="bold" />
                    </button>
                    <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-zinc-600 mr-4">{filtered.length} unidades detectadas</span>
                </div>
                <div className="flex-1 bg-[#050505] rounded-[2rem] border border-white/[0.03] overflow-hidden">
                    <DataTable
                        headers={["Identidade", "Data/Hora", "Email", "Status"]}
                        rows={filtered.map((u: any) => ({
                            key: u.id,
                            onClick: () => setSelected(u),
                            cells: [
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black font-black text-[10px]">
                                        {(u.full_name || u.name || "U").split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-white tracking-tight">{u.full_name || u.name}</p>
                                    </div>
                                </div>,
                                <span className="font-mono text-[10px] text-zinc-500 tracking-tighter">{fmtDateTime(u.created_at || u.joinedAt)}</span>,
                                <span className="text-[11px] font-medium text-zinc-400">{u.email}</span>,
                                <Tag variant={u.slug ? "success" : "default"}>{u.slug || "NOT_ASSIGNED"}</Tag>,
                            ],
                        }))}
                    />
                </div>
            </div>

            {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

function UserDrawer({ user, onClose }: { user: any; onClose: () => void }) {
    const name = user.full_name || user.name || "Usuário";
    const email = user.email || "";
    
    return (
        <aside className="rounded-[2rem] border border-white/[0.05] bg-[#0a0a0a] p-8 animate-in slide-in-from-right-8 duration-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
                <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-600 hover:bg-white/[0.04] hover:text-white transition-all">
                    <X size={16} weight="bold" />
                </button>
            </div>

            <div className="flex flex-col items-center text-center mb-10">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black font-black text-xl mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    {name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{name}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-2">{email}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <Stat label="Identificação" value={(user.id || "").slice(0, 12).toUpperCase()} />
                <Stat label="Caminho do Endpoint" value={user.slug || "NULO"} />
                <Stat label="Data de Autorização" value={new Date(user.created_at || user.joinedAt).toLocaleDateString("pt-BR", { year: 'numeric', month: 'long', day: 'numeric' })} />
            </div>

            <div className="mt-8 pt-8 border-t border-white/[0.03]">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-6">Ações de Segurança</p>
                <div className="grid grid-cols-2 gap-3">
                    <ActionBtn icon={UserCircle} label="Perfil" />
                    <ActionBtn icon={Eye} label="Simular" />
                    <ActionBtn icon={Trash} danger label="Revogar" />
                </div>
            </div>
        </aside>
    );
}

/* ================================================================== */
/* APP 3 — COBRANÇAS                                                   */
/* ================================================================== */

function ChargesApp({ charges }: { charges: any[] }) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>("all");
    const [selected, setSelected] = useState<any | null>(null);

    const dataToUse = charges;

    const filtered = dataToUse.filter((c: any) => {
        // Map status
        const currentStatus = c.status === "paid" ? "Paga" : c.status === "pending" ? "Pendente" : "Expirada";
        if (status !== "all" && currentStatus !== status) return false;
        
        const email = c.payer_email || c.payerEmail || "";
        const id = c.id || "";
        const name = c.payer_name || c.payerName || "";
        
        if (search && !`${id} ${email} ${name}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className={`grid gap-4 h-full items-start ${selected ? "lg:grid-cols-[1fr_360px]" : ""}`}>
            <div className="flex flex-col h-full">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <SearchBox value={search} onChange={setSearch} placeholder="Buscar por ID, email, CPF..." />
                    <Pill options={["all", "Paga", "Pendente", "Expirada"]} value={status} onChange={setStatus} icon={Funnel} />
                    <span className="ml-auto font-body text-xs text-white/40">{filtered.length} transações</span>
                </div>

                <div className="flex-1">
                    <DataTable
                        headers={["ID", "Cliente", "Vendedor", "Valor", "Taxa", "Status", "Data"]}
                        rows={filtered.map((c: any) => ({
                            key: c.id,
                            onClick: () => setSelected(c),
                            cells: [
                                <span className="font-mono text-[11px] text-white/55">{(c.id || "").slice(0, 8)}...</span>,
                                <div>
                                    <p className="font-heading text-xs font-semibold text-white">{c.payer_name || c.payerName || "Cliente"}</p>
                                    <p className="font-body text-[10px] text-white/40">{c.payer_email || c.payerEmail}</p>
                                </div>,
                                <span className="font-body text-xs text-white/65">{(c.profiles?.full_name || c.userName || "Vendedor")}</span>,
                                <span className="font-mono text-xs text-white/85">{fmtBRL(c.amount_cents || c.amount)}</span>,
                                <span className="font-mono text-xs text-amber-400/80">{fmtBRL(c.fee_cents || c.fee)}</span>,
                                <ChargeStatus status={c.status === "paid" ? "Paga" : c.status === "pending" ? "Pendente" : "Expirada"} />,
                                <span className="font-mono text-[10px] text-white/45">{fmtDateTime(c.created_at || c.createdAt)}</span>,
                            ],
                        }))}
                    />
                </div>
            </div>

            {selected && <ChargeDrawer charge={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

function ChargeDrawer({ charge, onClose }: { charge: any; onClose: () => void }) {
    const payerName = charge.payer_name || charge.payerName || "Cliente";
    const amount = charge.amount_cents || charge.amount || 0;
    const createdAt = charge.created_at || charge.createdAt;
    const status = charge.status === "paid" ? "Paga" : charge.status === "pending" ? "Pendente" : "Expirada";

    return (
        <aside className="rounded-2xl border border-white/10 bg-[#0b0e11] p-4 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-heading text-lg font-bold text-white">{fmtBRL(amount)}</p>
                    <p className="font-body text-[11px] text-white/45">Transação #{(charge.id || "").slice(0, 8)}</p>
                </div>
                <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/45 hover:bg-white/[0.06]">
                    <X size={14} weight="bold" />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat label="Status" value={status} />
                <Stat label="Data" value={new Date(createdAt).toLocaleDateString()} />
            </div>

            <div className="mt-4">
                <p className="font-body text-[11px] font-bold uppercase tracking-wider text-white/40">Cliente</p>
                <div className="mt-2 space-y-1.5 font-body text-xs text-white/65">
                    <p><b className="text-white/85">Nome:</b> {payerName}</p>
                    <p><b className="text-white/85">Email:</b> {charge.payer_email || charge.payerEmail}</p>
                    <p><b className="text-white/85">Vendedor:</b> {charge.profiles?.full_name || "N/A"}</p>
                    <p><b className="text-white/85">CPF:</b> {charge.payerCpf}</p>
                    <p><b className="text-white/85">Serviço:</b> {charge.service}</p>
                    <p><b className="text-white/85">Tipo:</b> {charge.type}</p>
                    <p><b className="text-white/85">Criada em:</b> {fmtDateTime(createdAt)}</p>
                    {charge.paidAt && <p><b className="text-white/85">Paga em:</b> {fmtDateTime(charge.paidAt)}</p>}
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
                <ActionBtn icon={ArrowDown} label="Reembolsar" />
                <ActionBtn icon={Receipt} label="Reenviar recibo" />
                <ActionBtn icon={ShieldWarning} label="Marcar fraude" danger />
                <ActionBtn icon={Eye} label="Ver checkout" />
            </div>
        </aside>
    );
}

/* ================================================================== */
/* APP 4 — FINANCEIRO                                                  */
/* ================================================================== */

function FinanceApp({ stats, charges }: { stats: any; charges: any[] }) {
    const totalReceita = stats?.revenue || 0;
    const gmv = stats?.gmv || 0;
    const conversao = stats?.conversions || 0;
    const totalCharges = charges.length;
    const paidCharges = charges.filter((c) => c.status === "paid");
    const ticketMedio = paidCharges.length > 0 ? paidCharges.reduce((s: number, c: any) => s + (c.amount_cents || 0), 0) / paidCharges.length : 0;

    return (
        <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Receita CloudePay (1%)" value={fmtBRL(totalReceita)} delta={0} icon={TrendUp} />
                <KpiCard label="GMV Total" value={fmtBRL(gmv)} delta={0} icon={ChartBar} />
                <KpiCard label="Conversão" value={`${conversao.toFixed(1)}%`} delta={0} icon={Pulse} />
                <KpiCard label="Ticket Médio" value={fmtBRL(Math.round(ticketMedio))} delta={0} icon={Receipt} />
            </div>

            <Panel title="Detalhamento financeiro" icon={Database}>
                <DataTable
                    headers={["Métrica", "Valor"]}
                    rows={[
                        { key: "1", cells: ["Total de cobranças geradas", String(totalCharges)] },
                        { key: "2", cells: ["Cobranças pagas", String(paidCharges.length)] },
                        { key: "3", cells: ["Volume bruto processado (GMV)", fmtBRL(gmv)] },
                        { key: "4", cells: ["Receita CloudePay (1%)", fmtBRL(totalReceita)] },
                        { key: "5", cells: ["Taxa aplicada", "2% (1% CP + 1% MP)"] },
                        { key: "6", cells: ["Ticket médio bruto", fmtBRL(Math.round(ticketMedio))] },
                    ]}
                />
            </Panel>
        </div>
    );
}

/* ================================================================== */
/* APP 5 — RELATÓRIOS                                                  */
/* ================================================================== */

function ReportsApp() {
    const reports = [
        { title: "Crescimento da plataforma", desc: "MAU, novas contas, retenção e expansão.", icon: TrendUp, color: "#9EEA6C" },
        { title: "Receita & faturamento", desc: "MRR, ARR, ticket médio, LTV e CAC.", icon: ChartBar, color: "#F59E0B" },
        { title: "Comportamento dos usuários", desc: "Engajamento, frequência, jornada.", icon: Pulse, color: "#22D3EE" },
        { title: "Transações", desc: "Aprovação, recusa, métodos e estornos.", icon: Receipt, color: "#A78BFA" },
        { title: "Segurança & compliance", desc: "Logins suspeitos, fraude, KYC pendente.", icon: ShieldWarning, color: "#F87171" },
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {reports.map((r) => (
                    <article key={r.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/10 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:scale-110" style={{ background: `${r.color}1f`, color: r.color }}>
                                <r.icon size={20} weight="duotone" />
                            </div>
                            <span className="font-mono text-[10px] text-white/40">PDF · CSV · Email</span>
                        </div>
                        <h3 className="mt-3 font-heading text-base font-bold text-white">{r.title}</h3>
                        <p className="mt-1 font-body text-xs text-white/55">{r.desc}</p>
                        <div className="mt-4 flex gap-2">
                            <ActionBtn icon={DownloadSimple} label="PDF" small />
                            <ActionBtn icon={DownloadSimple} label="CSV" small />
                            <ActionBtn icon={ChatCircleDots} label="Email" small />
                        </div>
                    </article>
                ))}
            </div>

            <Panel title="Filtros customizáveis" icon={Funnel}>
                <div className="grid gap-3 md:grid-cols-4">
                    <FilterField label="Período" value="Últimos 30 dias" />
                    <FilterField label="Plano" value="Todos" />
                    <FilterField label="Status" value="Ativos" />
                    <FilterField label="Origem" value="Todas" />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                    <ActionBtn icon={Lightning} label="Aplicar filtros" small />
                    <ActionBtn icon={DownloadSimple} label="Exportar" small />
                </div>
            </Panel>
        </div>
    );
}

function FilterField({ label, value }: { label: string; value: string }) {
    return (
        <label className="block">
            <span className="mb-1 block font-body text-[11px] text-white/45">{label}</span>
            <div className="flex h-10 items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 font-body text-sm text-white/85">
                {value}
                <DotsThree size={16} weight="bold" className="text-white/35" />
            </div>
        </label>
    );
}

/* ================================================================== */
/* APP 6 — SUPORTE                                                     */
/* ================================================================== */

function SupportApp() {
    const { profile } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingTickets, setLoadingTickets] = useState(true);

    useEffect(() => {
        getAdminTickets().then(data => {
            setTickets(data);
            setLoadingTickets(false);
        });
        const sub = supabase.channel('tickets_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
            getAdminTickets().then(setTickets);
        }).subscribe();
        return () => { supabase.removeChannel(sub); };
    }, []);

    useEffect(() => {
        if (!selectedTicket) return;
        getTicketMessages(selectedTicket.id).then(setMessages);
        const sub = supabase.channel(`messages_${selectedTicket.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${selectedTicket.id}` }, () => {
            getTicketMessages(selectedTicket.id).then(setMessages);
        }).subscribe();
        return () => { supabase.removeChannel(sub); };
    }, [selectedTicket]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket || !profile) return;
        try {
            await sendTicketMessage(selectedTicket.id, profile.id, newMessage);
            setNewMessage("");
            getTicketMessages(selectedTicket.id).then(setMessages);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;
        try {
            await closeTicket(selectedTicket.id);
            setSelectedTicket({ ...selectedTicket, status: 'closed' });
        } catch (e) {
            console.error(e);
        }
    };

    if (loadingTickets) return <div className="flex h-full items-center justify-center"><Pulse size={32} weight="bold" className="text-white/10 animate-pulse" /></div>;

    return (
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
            {/* Sidebar — Sessions */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                <div className="mb-4 px-2 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Sessões Ativas</h3>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                {tickets.length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-white/5 rounded-[2rem]">
                        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Nenhum sinal detectado</p>
                    </div>
                ) : (
                    tickets.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTicket(t)}
                            className={`group flex items-center gap-4 rounded-[1.5rem] border p-5 transition-all ${selectedTicket?.id === t.id ? "border-white/10 bg-white/[0.04]" : "border-white/[0.03] bg-black hover:border-white/10"}`}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black font-black text-xs">
                                {(t.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="font-bold text-white text-[11px] truncate tracking-tight">{t.profiles?.full_name || 'Usuário'}</p>
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Ref: {t.id.slice(0, 6)}</p>
                            </div>
                            {t.status === 'open' && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                        </button>
                    ))
                )}
            </div>

            {/* Chat Console */}
            <div className="flex flex-col h-full bg-[#050505] rounded-[2.5rem] border border-white/[0.05] overflow-hidden">
                {selectedTicket ? (
                    <>
                        <header className="flex items-center justify-between border-b border-white/[0.03] px-8 py-6 bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white">
                                    <Headset size={20} weight="bold" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white tracking-tight">{selectedTicket.profiles?.full_name || 'Usuário'}</h3>
                                    <p className="text-[9px] font-black text-emerald-500 mt-1 uppercase tracking-[0.2em]">Conexão Segura Ativa</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedTicket.status === 'open' && (
                                    <button onClick={handleCloseTicket} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                                        Finalizar
                                    </button>
                                )}
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-black">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-zinc-800 uppercase font-black text-[9px] tracking-[0.5em]">Aguardando transmissão...</div>
                            ) : (
                                messages.map((m) => {
                                    const isFromAdmin = ADMIN_EMAILS.includes(m.sender_email?.toLowerCase()) || m.sender_id === profile?.id;
                                    return (
                                        <div key={m.id} className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-[1.8rem] p-5 ${isFromAdmin ? 'bg-white text-black' : 'bg-zinc-900/50 border border-white/5 text-zinc-300'}`}>
                                                <p className="text-[13px] font-medium leading-relaxed">{m.content || m.message}</p>
                                                <p className={`text-[8px] mt-4 font-black uppercase tracking-[0.2em] ${isFromAdmin ? 'text-black/30' : 'text-zinc-600'}`}>{fmtDateTime(m.created_at)}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <footer className="p-6 border-t border-white/[0.03] bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Transmitir mensagem ao console do usuário..."
                                    className="flex-1 h-14 bg-black border border-white/[0.08] rounded-2xl px-6 text-sm text-white placeholder:text-zinc-900 focus:outline-none focus:border-white/20 transition-all"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="h-14 w-14 flex items-center justify-center bg-white text-black rounded-2xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <ArrowUp size={20} weight="bold" />
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center max-w-xs animate-in fade-in duration-1000">
                            <Headset size={48} weight="bold" className="mx-auto text-white/5 mb-8" />
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] mb-4">Central de Comando</h3>
                            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest leading-loose">Selecione uma transmissão de usuário para iniciar o protocolo de suporte</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ================================================================== */
/* APP 7 — CONFIGURAÇÕES                                                */
/* ================================================================== */

function SettingsApp() {
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Núcleo da Plataforma" icon={GearSix}>
                <div className="space-y-4">
                    <SettingRow label="Identidade do Ambiente" value="CloudeOS v2.0" />
                    <SettingRow label="Mapeamento de Domínio" value="cloudepay.vercel.app" />
                    <SettingRow label="Status do Sistema" value="OLED Mastery Ativo" />
                </div>
            </Panel>

            <Panel title="Integrações" icon={Database}>
                <ul className="space-y-3">
                    <Integration name="Identidade & Segurança" status="ok" />
                    <Integration name="Implantação Global" status="ok" />
                    <Integration name="Gateway Financeiro" status="pending" />
                </ul>
            </Panel>

            <Panel title="Economia" icon={ChartBar}>
                <div className="space-y-4">
                    <SettingRow label="Taxa de Execução" value="2.0% Fixa" />
                    <SettingRow label="Classe de Ativo" value="Fiat (BRL)" />
                </div>
            </Panel>

            <Panel title="Conselho Superior" icon={Lock}>
                <div className="space-y-4">
                    <SettingRow label="Principal" value="admin@cloudepay.com" />
                    <SettingRow label="Secundário" value="vault@cloudepay.com" />
                </div>
            </Panel>
        </div>
    );
}

function SettingRow({ label, value, editable }: { label: string; value: string; editable?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
            <span className="font-body text-xs text-white/55">{label}</span>
            <span className="flex items-center gap-2 font-heading text-sm font-bold text-white">
                {value}
                {editable && <button className="rounded-md bg-white/[0.06] px-2 py-1 font-body text-[10px] text-white/55 hover:bg-white/10 transition-all">editar</button>}
            </span>
        </div>
    );
}



function Integration({ name, status }: { name: string; status: "ok" | "pending" | "error" }) {
    const map = {
        ok: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "OPERACIONAL" },
        pending: { color: "text-amber-500", bg: "bg-amber-500/10", label: "SINCRONIZANDO" },
        error: { color: "text-red-500", bg: "bg-red-500/10", label: "FALHA_DETECTADA" },
    }[status];
    return (
        <li className="flex items-center justify-between rounded-xl border border-white/[0.03] bg-white/[0.01] px-4 py-3">
            <span className="text-[11px] font-bold text-white tracking-tight">{name}</span>
            <span className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest ${map.color} ${map.bg}`}>
                {map.label}
            </span>
        </li>
    );
}

/* ================================================================== */
/* APP 8 — LOGS                                                        */
/* ================================================================== */

function LogsApp() {
    return (
        <div className="flex h-full items-center justify-center bg-black">
            <div className="text-center max-w-md animate-in fade-in duration-1000">
                <Database size={56} weight="bold" className="mx-auto text-white/10 mb-8" />
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Console de Auditoria</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-10 leading-loose">Sincronização segura de registros em andamento. Cada transação está sendo indexada pelo núcleo.</p>
                
                <div className="rounded-[2rem] border border-white/[0.04] bg-white/[0.01] p-8 text-left">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-6">Status do Subsistema</p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-[11px] font-bold text-zinc-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Indexação de Transações Ativa
                        </li>
                        <li className="flex items-center gap-3 text-[11px] font-bold text-zinc-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            Log de Eventos Detalhado em Implantação
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

/* ================================================================== */
/* Componentes auxiliares                                              */
/* ================================================================== */

function DataTable({
    headers, rows,
}: {
    headers: string[];
    rows: { key: string; cells: React.ReactNode[]; onClick?: () => void }[];
}) {
    return (
        <div className="overflow-x-auto custom-scrollbar h-full min-h-[450px]">
            <table className="w-full min-w-[700px] border-collapse">
                <thead>
                    <tr className="border-b border-white/[0.03]">
                        {headers.map((h) => (
                            <th key={h} className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                    {rows.map((r) => (
                        <tr
                            key={r.key}
                            onClick={r.onClick}
                            className={`group transition-all ${r.onClick ? "cursor-pointer hover:bg-white/[0.01]" : ""}`}
                        >
                            {r.cells.map((c, i) => (
                                <td key={i} className="px-6 py-5 text-zinc-400 group-hover:text-white transition-colors">{c}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div className="flex h-10 items-center gap-3 rounded-xl border border-white/[0.05] bg-black px-4 focus-within:border-white/20 transition-all group">
            <MagnifyingGlass size={16} weight="bold" className="text-zinc-700 group-focus-within:text-white transition-colors" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-64 bg-transparent text-[11px] font-bold text-white placeholder:text-zinc-800 focus:outline-none uppercase tracking-widest"
            />
        </div>
    );
}

function Pill({
    options, value, onChange, icon: Icon,
}: {
    options: string[]; value: string; onChange: (v: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: any;
}) {
    return (
        <div className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.05] bg-black px-4">
            {Icon && <Icon size={14} weight="bold" className="text-zinc-700" />}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-zinc-400 focus:outline-none appearance-none cursor-pointer hover:text-white transition-colors"
            >
                {options.map((o) => (
                    <option key={o} value={o} className="bg-black">{o === "all" ? "FILTRO_MESTRE" : o.toUpperCase()}</option>
                ))}
            </select>
        </div>
    );
}

function Tag({ children, variant }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" }) {
    const colors = {
        default: "bg-white/[0.03] text-zinc-500",
        success: "bg-emerald-500/10 text-emerald-500",
        warning: "bg-amber-500/10 text-amber-500",
        danger: "bg-red-500/10 text-red-500",
    }[variant || "default"];
    
    return (
        <span className={`inline-flex rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${colors}`}>{children}</span>
    );
}

function ChargeStatus({ status }: { status: string }) {
    const map: Record<string, string> = {
        Paga: "bg-emerald-500/10 text-emerald-500",
        Pendente: "bg-amber-500/10 text-amber-500",
        Expirada: "bg-white/[0.03] text-zinc-700",
        Reembolsada: "bg-white text-black",
        Fraude: "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    };
    return (
        <span className={`inline-flex rounded-md px-2 py-0.5 text-[9px] font-black tracking-[0.2em] uppercase ${map[status] ?? "bg-white/[0.03] text-zinc-500"}`}>
            {status}
        </span>
    );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 transition-all hover:bg-white/[0.02]">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-2">{label}</p>
            <p className={`text-sm font-bold tracking-tight ${highlight ? "text-white" : "text-zinc-300"}`}>{value}</p>
        </div>
    );
}

function ActionBtn({
    icon: Icon, label, danger, small,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any; label: string; danger?: boolean; small?: boolean;
}) {
    return (
        <button className={`inline-flex items-center justify-center gap-2 rounded-xl border font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${small ? "h-8 px-4 text-[9px]" : "h-11 px-6 text-[10px]"
            } ${danger
                ? "border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:bg-white hover:text-black hover:border-white"
            }`}>
            <Icon size={14} weight="bold" />
            {label}
        </button>
    );
}
