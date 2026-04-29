import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowDown,
    ArrowUp,
    Bell,
    ChartBar,
    ChartLineUp,
    ChatCircleDots,
    CheckCircle,
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
    XCircle,
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
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6">
                <div className="w-full max-w-sm">
                    <div className="mb-12 text-center animate-in fade-in slide-in-from-top-8 duration-700">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6">
                            <Logo size="md" variant="white" iconOnly />
                        </div>
                        <h1 className="text-3xl font-heading font-black text-white mb-2 tracking-tight">Cofre de Fundadores</h1>
                        <p className="text-neutral-500 text-sm">Autenticação de nível 01 requerida para prosseguir.</p>
                    </div>

                    <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Email de Acesso</label>
                                <input
                                    type="email"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    placeholder="email@fundador.com"
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-[#9EEA6C] transition-all"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Senha Mestra</label>
                                <input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white placeholder:text-white/20 focus:outline-none focus:border-[#9EEA6C] transition-all"
                                />
                            </div>

                            {loginError && (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                                    <WarningCircle size={16} />
                                    {loginError}
                                </div>
                            )}

                            <button 
                                onClick={handleAdminLogin}
                                disabled={isLoggingIn}
                                className="w-full h-14 bg-[#9EEA6C] hover:bg-[#8CD95B] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] rounded-2xl font-heading font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                            >
                                {isLoggingIn ? (
                                    <div className="h-4 w-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Acessar Cofre
                                        <ArrowUp size={16} weight="bold" className="rotate-90" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center">
                        <Link to="/painel" className="text-xs text-neutral-500 hover:text-[#9EEA6C] transition-colors">
                            Voltar para o Painel Principal
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    if (!isUnlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6">
                <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500">
                    <ShieldCheck size={48} weight="duotone" className="mx-auto text-[#9EEA6C] mb-6" />
                    <h1 className="text-xl font-heading font-black text-white mb-2">Chave Mestre Requerida</h1>
                    <p className="text-sm text-neutral-400 mb-8">Insira o Master Token para desbloquear o console de fundadores.</p>
                    
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={masterToken}
                            onChange={(e) => setMasterToken(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                            placeholder="Digite o Token Mestre"
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-center text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-[#9EEA6C] transition-all"
                        />
                        {tokenError && (
                            <p className="text-xs text-red-400 font-medium">Token inválido ou expirado.</p>
                        )}
                        <button 
                            onClick={handleUnlock}
                            className="w-full h-14 bg-[#9EEA6C] hover:bg-[#8CD95B] text-[#0a0a0a] rounded-2xl font-heading font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
                        >
                            Desbloquear Acesso
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const clock = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const dateLabel = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden bg-[#050708] text-white">
            {/* Wallpaper */}
            <div aria-hidden className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(60% 70% at 20% 10%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(60% 60% at 90% 90%, rgba(158,234,108,0.16), transparent 60%), radial-gradient(50% 60% at 50% 50%, rgba(139,92,246,0.10), transparent 70%), #050708",
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: "radial-gradient(circle, #ffffff 0.8px, transparent 0.8px)",
                        backgroundSize: "26px 26px",
                    }}
                />
            </div>

            {/* Topbar — system info */}
            <div className="relative z-30 flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur">
                        <Logo size="sm" variant="white" />
                    </div>
                    <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-body text-xs text-white/60 backdrop-blur sm:flex">
                        <Lock size={13} weight="duotone" />
                        Painel Admin · Acesso restrito
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-body text-xs text-white/55 backdrop-blur md:flex">
                        <Pulse size={14} weight="duotone" className="text-lime-accent" />
                        Sistemas operacionais
                    </div>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 backdrop-blur hover:bg-white/[0.08]">
                        <Bell size={16} weight="duotone" />
                    </button>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-white/70 backdrop-blur">
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
            className="flex-col overflow-hidden rounded-[16px] md:rounded-[24px] border border-white/10 bg-[#0a0d10]/85 shadow-2xl shadow-black/50 backdrop-blur-xl animate-in zoom-in-95 duration-200"
        >
            {/* Window chrome */}
            <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5 cursor-default">
                <div className="flex items-center gap-2.5">
                    <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{ background: `${def.color}1a`, color: def.color }}
                    >
                        <def.Icon size={16} weight="duotone" />
                    </div>
                    <span className="font-heading text-sm font-bold text-white">{def.label}</span>
                    <span className="hidden font-body text-[11px] text-white/35 sm:inline">CloudePay Admin</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/45 hover:bg-white/[0.06] hover:text-white" aria-label="Minimizar">
                        <span className="block h-0.5 w-3 bg-current" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/45 hover:bg-red-500/20 hover:text-red-300" aria-label="Fechar">
                        <X size={14} weight="bold" />
                    </button>
                </div>
            </header>

            {/* Body — scrollable per window */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col">
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
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Sparkle size={42} weight="duotone" className="mx-auto text-lime-accent" />
                <h2 className="mt-3 font-heading text-2xl font-bold text-white">Área de trabalho limpa</h2>
                <p className="mt-1 font-body text-sm text-white/55">Use a barra inferior ou o menu Start para abrir uma ferramenta.</p>
                <button
                    onClick={() => onOpen("dashboard")}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-lime-accent px-6 py-3 font-heading text-sm font-black text-[#0a0a0a] transition-all hover:scale-105 active:scale-95"
                >
                    Abrir Dashboard
                </button>
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
        <div className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 px-3 sm:bottom-4">
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#0a0d10]/85 px-2 py-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
                <button
                    onClick={onShowStart}
                    aria-label="Abrir menu"
                    className={`group shrink-0 flex h-11 w-11 items-center justify-center rounded-xl transition-all active:scale-90 ${startActive ? "bg-lime-accent" : "text-white/75 hover:bg-white/[0.06]"
                        }`}
                >
                    <div className={startActive ? "brightness-0" : ""}>
                        <Logo size="sm" variant="white" iconOnly />
                    </div>
                </button>
                <div className="mx-1 hidden h-7 w-px shrink-0 bg-white/[0.08] sm:block" />
                <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
                    {apps.map(({ id, label, Icon, color }) => {
                        const isOpen = openApps.includes(id);
                        const isActive = isOpen && id === activeApp;
                        return (
                            <button
                                key={id}
                                onClick={() => onLaunch(id)}
                                title={label}
                                className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all hover:bg-white/[0.06] active:scale-90"
                            >
                                <Icon
                                    size={20}
                                    weight="duotone"
                                    style={{ color: isActive ? color : "#cbd5e1" }}
                                    className={isActive ? "" : "text-white/65"}
                                />
                                {isOpen && (
                                    <span
                                        className={`absolute -bottom-0.5 h-1 rounded-full transition-all ${isActive ? "w-5" : "w-1.5"
                                            }`}
                                        style={{ background: color }}
                                    />
                                )}
                                <span className="pointer-events-none absolute -top-9 hidden whitespace-nowrap rounded-md border border-white/10 bg-[#0a0d10] px-2 py-1 font-body text-[10px] font-semibold text-white/80 shadow-lg group-hover:block">
                                    {label}
                                </span>
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
                <KpiCard label="Receita (Taxas)" value={fmtBRL(revenue)} delta={0} icon={TrendUp} />
                <KpiCard label="Usuários cadastrados" value={String(users)} delta={0} icon={UsersFour} />
                <KpiCard label="GMV Total" value={fmtBRL(gmv)} delta={0} icon={ChartBar} />
                <KpiCard label="Conversão" value={`${conversion.toFixed(1)}%`} delta={0} icon={Pulse} />
            </div>

            {/* Resumo real */}
            <Panel title="Resumo da plataforma" icon={WarningCircle}>
                <div className="grid gap-2 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/55">Total de cobranças</span>
                        <p className="mt-1.5 font-heading text-xl font-bold text-white">{totalCharges}</p>
                    </div>
                    <div className="rounded-2xl border border-lime-accent/25 bg-lime-accent/10 p-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-lime-accent">Pagas</span>
                        <p className="mt-1.5 font-heading text-xl font-bold text-white">{paid}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Pendentes</span>
                        <p className="mt-1.5 font-heading text-xl font-bold text-white">{pending}</p>
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
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.05]">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-body text-xs text-white/45">{label}</p>
                    <p className="mt-1.5 font-heading text-2xl font-bold text-white">{value}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-lime-accent">
                    <Icon size={18} weight="duotone" />
                </div>
            </div>
            <p className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-[11px] font-semibold ${positive ? "bg-lime-accent/15 text-lime-accent" : "bg-red-500/15 text-red-300"
                }`}>
                <Trend size={11} weight="bold" />
                {Math.abs(delta).toFixed(1)}% vs. período anterior
            </p>
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
        <section className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 ${className ?? ""}`}>
            <div className="mb-3 flex items-center gap-2">
                {Icon && <Icon size={16} weight="duotone" className="text-white/55" />}
                <h3 className="font-heading text-sm font-bold text-white">{title}</h3>
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
        <div className={`grid gap-4 h-full items-start ${selected ? "lg:grid-cols-[1fr_360px]" : ""}`}>
            <div className="flex flex-col h-full">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nome, email..." />
                    <button onClick={onRefresh} className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 hover:text-white transition-all">
                        <Sparkle size={18} />
                    </button>
                    <span className="ml-auto font-body text-xs text-white/40">{filtered.length} usuários</span>
                </div>
                <div className="flex-1">
                    <DataTable
                        headers={["Usuário", "Cadastro", "Email", "Slug"]}
                        rows={filtered.map((u: any) => ({
                            key: u.id,
                            onClick: () => setSelected(u),
                            cells: [
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-accent/15 font-heading text-xs font-bold text-lime-accent">
                                        {(u.full_name || u.name || "U").split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-heading text-sm font-bold text-white">{u.full_name || u.name}</p>
                                    </div>
                                </div>,
                                <span className="font-mono text-[10px] text-white/55">{fmtDateTime(u.created_at || u.joinedAt)}</span>,
                                <span className="font-body text-xs text-white/65">{u.email}</span>,
                                <Tag variant={u.slug ? "success" : "default"}>{u.slug || "sem slug"}</Tag>,
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
        <aside className="rounded-2xl border border-white/10 bg-[#0b0e11] p-4 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-accent/15 font-heading text-sm font-bold text-lime-accent">
                        {name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                        <p className="font-heading text-base font-bold text-white">{name}</p>
                        <p className="font-body text-[11px] text-white/45">{email}</p>
                    </div>
                </div>
                <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/45 hover:bg-white/[0.06]">
                    <X size={14} weight="bold" />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat label="ID" value={(user.id || "").slice(0, 8)} />
                <Stat label="Slug" value={user.slug || "N/A"} />
                <Stat label="Cadastro" value={new Date(user.created_at || user.joinedAt).toLocaleDateString()} />
                <Stat label="CPF" value={user.cpf || "---"} />
            </div>

            <div className="mt-4">
                <p className="font-body text-[11px] font-bold uppercase tracking-wider text-white/40">Detalhes</p>
                <ul className="mt-2 space-y-1.5 font-body text-xs text-white/65">
                    <li><b className="text-white/85">Serviço:</b> {user.service_name || user.service || "Não definido"}</li>
                    <li><b className="text-white/85">Descrição:</b> {user.description || "Nenhuma"}</li>
                </ul>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
                <ActionBtn icon={UserCircle} label="Editar" />
                <ActionBtn icon={Eye} label="Acessar como" />
                <ActionBtn icon={ArrowDown} label="Downgrade" />
                <ActionBtn icon={Trash} danger label="Deletar" />
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
                <KpiCard label="Receita (Taxas)" value={fmtBRL(totalReceita)} delta={0} icon={TrendUp} />
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
                        { key: "4", cells: ["Receita líquida (taxas)", fmtBRL(totalReceita)] },
                        { key: "5", cells: ["Taxa aplicada", "2% por transação"] },
                        { key: "6", cells: ["Ticket médio", fmtBRL(Math.round(ticketMedio))] },
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

    // 1. Fetch Tickets
    useEffect(() => {
        getAdminTickets().then(data => {
            setTickets(data);
            setLoadingTickets(false);
        });

        // Listen for new tickets
        const sub = supabase.channel('tickets_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
                getAdminTickets().then(setTickets);
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, []);

    // 2. Fetch Messages for selected ticket
    useEffect(() => {
        if (!selectedTicket) return;
        getTicketMessages(selectedTicket.id).then(setMessages);

        // Listen for new messages
        const sub = supabase.channel(`messages_${selectedTicket.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${selectedTicket.id}` }, () => {
                getTicketMessages(selectedTicket.id).then(setMessages);
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, [selectedTicket]);

    // 3. Send message
    const handleSend = async () => {
        if (!newMessage.trim() || !selectedTicket || !profile) return;
        try {
            await sendTicketMessage(selectedTicket.id, profile.id, newMessage);
            setNewMessage("");
            // Optimistic reload or let realtime handle it:
            getTicketMessages(selectedTicket.id).then(setMessages);
        } catch (e) {
            console.error("Erro ao enviar mensagem", e);
        }
    };

    if (loadingTickets) {
        return <div className="flex h-full items-center justify-center text-white/50 text-sm">Carregando chamados...</div>;
    }

    if (tickets.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center max-w-md animate-in fade-in duration-500">
                    <Headset size={48} weight="duotone" className="mx-auto text-white/20 mb-4" />
                    <h3 className="font-heading text-xl font-bold text-white mb-2">Central de Suporte</h3>
                    <p className="font-body text-sm text-white/45 mb-6">Nenhum ticket de suporte aberto no momento. Quando os usuários entrarem em contato, os chamados aparecerão aqui em tempo real.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
            {/* Tickets List */}
            <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar border-r border-white/5">
                <h3 className="mb-2 font-heading text-sm font-bold text-white/80">Chamados Abertos ({tickets.length})</h3>
                {tickets.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`text-left rounded-xl border p-3 transition-all ${selectedTicket?.id === t.id ? "border-lime-accent/50 bg-lime-accent/5" : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]"}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-heading text-xs font-bold text-white truncate">{t.profiles?.full_name || 'Usuário'}</span>
                            <span className="font-mono text-[9px] text-white/40">{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="font-body text-xs text-white/60 truncate">{t.subject}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`inline-flex rounded-md px-1.5 py-0.5 font-body text-[9px] font-black uppercase tracking-widest ${t.status === 'open' ? 'bg-amber-400/20 text-amber-400' : 'bg-lime-accent/20 text-lime-accent'}`}>
                                {t.status}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Chat Area */}
            {selectedTicket ? (
                <div className="flex flex-col h-full rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden relative">
                    <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <div>
                            <h4 className="font-heading text-sm font-bold text-white">{selectedTicket.subject}</h4>
                            <p className="font-body text-[11px] text-white/45">Cliente: {selectedTicket.profiles?.email}</p>
                        </div>
                        {selectedTicket.status === 'open' && (
                            <button 
                                onClick={async () => {
                                    try {
                                        await closeTicket(selectedTicket.id);
                                        setSelectedTicket({...selectedTicket, status: 'closed'});
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-heading text-[10px] text-white hover:bg-white/10"
                            >
                                Encerrar
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                        {messages.length === 0 ? (
                            <p className="text-center font-body text-xs text-white/40 mt-auto mb-auto">Nenhuma mensagem neste chamado ainda.</p>
                        ) : (
                            messages.map((m) => {
                                const isAdmin = m.sender_id === profile?.id; // simplificação
                                return (
                                    <div key={m.id} className={`flex max-w-[80%] flex-col ${isAdmin ? "self-end items-end" : "self-start items-start"}`}>
                                        <div className={`rounded-2xl px-4 py-2.5 font-body text-sm ${isAdmin ? "bg-lime-accent text-[#0a0a0a] rounded-tr-sm" : "bg-white/[0.06] text-white/90 rounded-tl-sm"}`}>
                                            {m.message}
                                        </div>
                                        <span className="mt-1 px-1 font-mono text-[9px] text-white/40">{new Date(m.created_at).toLocaleTimeString()} - {m.profiles?.full_name || 'Admin'}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="border-t border-white/[0.06] bg-[#0a0d10] p-3">
                        {selectedTicket.status === 'open' ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Digite sua resposta..."
                                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-lime-accent/30"
                                />
                                <button onClick={handleSend} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-accent text-[#0a0a0a] transition-all hover:scale-105 active:scale-95">
                                    <ArrowUp size={16} weight="bold" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-center font-body text-[11px] text-white/40">Este chamado foi encerrado.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center text-white/40 font-body text-sm">
                    Selecione um chamado à esquerda
                </div>
            )}
        </div>
    );
}

/* ================================================================== */
/* APP 7 — CONFIGURAÇÕES                                                */
/* ================================================================== */

function SettingsApp() {
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Dados da plataforma" icon={GearSix}>
                <div className="space-y-3">
                    <SettingRow label="Nome" value="CloudePay" />
                    <SettingRow label="Domínio" value="cloudepay.vercel.app" />
                    <SettingRow label="Ambiente" value="Produção (Vercel)" />
                    <SettingRow label="Fuso horário" value="America/Sao_Paulo (UTC−3)" />
                </div>
            </Panel>

            <Panel title="Integrações" icon={Database}>
                <ul className="space-y-2">
                    <Integration name="Supabase (Auth + DB)" status="ok" />
                    <Integration name="Vercel (Hosting)" status="ok" />
                    <Integration name="Mercado Pago (Gateway)" status="pending" />
                </ul>
            </Panel>

            <Panel title="Taxas do sistema" icon={ChartBar}>
                <div className="space-y-3">
                    <SettingRow label="Taxa padrão sobre transações" value="2%" />
                    <SettingRow label="Método de pagamento" value="PIX" />
                </div>
            </Panel>

            <Panel title="Administradores" icon={Lock}>
                <div className="space-y-3">
                    <SettingRow label="Admin 1" value="matsoliveira11@gmail.com" />
                    <SettingRow label="Admin 2" value="mats.oliveira11@gmail.com" />
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
        ok: { icon: CheckCircle, color: "text-lime-accent", label: "Conectado" },
        pending: { icon: WarningCircle, color: "text-amber-300", label: "Pendente" },
        error: { icon: XCircle, color: "text-red-300", label: "Falha" },
    }[status];
    return (
        <li className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
            <span className="font-heading text-sm font-bold text-white">{name}</span>
            <span className={`inline-flex items-center gap-1.5 font-body text-xs ${map.color}`}>
                <map.icon size={14} weight="duotone" />
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
        <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-md animate-in fade-in duration-500">
                <Database size={48} weight="duotone" className="mx-auto text-white/20 mb-4" />
                <h3 className="font-heading text-xl font-bold text-white mb-2">Logs de Auditoria</h3>
                <p className="font-body text-sm text-white/45 mb-4">O sistema de auditoria será alimentado automaticamente conforme as transações e eventos ocorrerem na plataforma.</p>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left">
                    <p className="font-body text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3">Status do módulo</p>
                    <ul className="space-y-2 font-body text-xs text-white/65">
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-lime-accent" /> Registro de transações ativo</li>
                        <li className="flex items-center gap-2"><WarningCircle size={14} className="text-amber-300" /> Log detalhado em implantação</li>
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
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-in fade-in duration-500 custom-scrollbar h-full min-h-[400px]">
            <table className="w-full min-w-[640px]">
                <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        {headers.map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-body text-[10px] font-black uppercase tracking-wider text-white/40">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr
                            key={r.key}
                            onClick={r.onClick}
                            className={`border-b border-white/[0.04] last:border-0 transition-all ${r.onClick ? "cursor-pointer hover:bg-white/[0.03]" : ""
                                }`}
                        >
                            {r.cells.map((c, i) => (
                                <td key={i} className="px-4 py-3.5">{c}</td>
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
        <div className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 focus-within:ring-2 ring-lime-accent/30 transition-all">
            <MagnifyingGlass size={14} weight="duotone" className="text-white/40" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-56 bg-transparent font-body text-xs text-white placeholder:text-white/35 focus:outline-none"
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
        <div className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2">
            {Icon && <Icon size={13} weight="duotone" className="text-white/40" />}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-transparent font-body text-xs text-white/85 focus:outline-none appearance-none cursor-pointer"
            >
                {options.map((o) => (
                    <option key={o} value={o} className="bg-[#0b0e11]">{o === "all" ? "Todos" : o}</option>
                ))}
            </select>
        </div>
    );
}

function Tag({ children, variant }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" }) {
    const colors = {
        default: "bg-white/[0.06] text-white/75",
        success: "bg-lime-accent/15 text-lime-accent",
        warning: "bg-amber-400/15 text-amber-300",
        danger: "bg-red-500/15 text-red-300",
    }[variant || "default"];
    
    return (
        <span className={`inline-flex rounded-md px-2 py-0.5 font-body text-[11px] font-bold ${colors}`}>{children}</span>
    );
}


function ChargeStatus({ status }: { status: string }) {
    const map: Record<string, string> = {
        Paga: "bg-lime-accent/15 text-lime-accent",
        Pendente: "bg-amber-400/15 text-amber-300",
        Expirada: "bg-white/[0.06] text-white/55",
        Reembolsada: "bg-violet-400/15 text-violet-300",
        Fraude: "bg-red-500/15 text-red-300",
    };
    return (
        <span className={`inline-flex rounded-md px-2 py-0.5 font-body text-[11px] font-black tracking-wider uppercase ${map[status] ?? "bg-white/[0.06] text-white/65"}`}>
            {status}
        </span>
    );
}



function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-all hover:bg-white/[0.04]">
            <p className="font-body text-[11px] text-white/40">{label}</p>
            <p className={`mt-0.5 font-heading text-sm font-bold ${highlight ? "text-lime-accent" : "text-white"}`}>{value}</p>
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
        <button className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-heading font-black uppercase tracking-wider transition-all active:scale-95 ${small ? "h-8 px-3 text-[10px]" : "h-10 px-4 text-[11px]"
            } ${danger
                ? "border-red-400/25 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
            }`}>
            <Icon size={14} weight="duotone" />
            {label}
        </button>
    );
}
