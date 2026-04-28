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
    ListChecks,
    Lock,
    MagnifyingGlass,
    Activity as Pulse,
    Receipt,
    ShieldWarning,
    SignOut,
    Sparkle,
    Trash,
    TrendDown,
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
import {
    adminAlerts,
    adminCharges,
    adminLogs,
    adminMetrics,
    adminTickets,
    adminUsers,
    chargeStatusBreakdown,
    hourlyActivity,
    newVsChurnSeries,
    revenueByPlan,
    revenueSeries,
    type AdminCharge,
    type AdminUser,
} from "../lib/adminMock";

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

    const isAdmin = profile && ADMIN_EMAILS.includes(profile.email?.toLowerCase());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(t);
    }, []);

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

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6 text-center">
                <div className="max-w-md">
                    <WarningCircle size={48} weight="duotone" className="mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-heading font-black text-white mb-2">Acesso Negado</h1>
                    <p className="text-neutral-400 mb-6">Este terminal é restrito a fundadores autorizados.</p>
                    <Link to="/painel" className="inline-flex items-center gap-2 text-sm text-[#9EEA6C] hover:underline">
                        Voltar ao painel
                    </Link>
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
            <main className="relative z-10 mx-auto h-[calc(100vh-150px)] max-w-[1500px] px-3 pb-4 sm:px-6 mt-4">
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
    visible, appId, onClose, onMinimize, onFocus
}: {
    visible: boolean;
    appId: AppId;
    onClose: () => void;
    onMinimize: () => void;
    onFocus: () => void;
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
            className="flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0d10]/85 shadow-2xl shadow-black/50 backdrop-blur-xl animate-in zoom-in-95 duration-200"
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
                {appId === "dashboard" && <DashboardApp />}
                {appId === "users" && <UsersApp />}
                {appId === "charges" && <ChargesApp />}
                {appId === "finance" && <FinanceApp />}
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
                    className={`group flex h-11 w-11 items-center justify-center rounded-xl transition-all active:scale-90 ${startActive ? "bg-lime-accent" : "text-white/75 hover:bg-white/[0.06]"
                        }`}
                >
                    <div className={startActive ? "brightness-0" : ""}>
                        <Logo size="sm" variant="white" iconOnly />
                    </div>
                </button>
                <div className="mx-1 hidden h-7 w-px bg-white/[0.08] sm:block" />
                <div className="flex items-center gap-1 overflow-x-auto">
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

function DashboardApp() {
    return (
        <div className="space-y-5">
            {/* KPIs */}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Receita (MRR)" value={fmtBRL(adminMetrics.mrr * 100)} delta={adminMetrics.mrrDelta} icon={TrendUp} />
                <KpiCard label="Usuários ativos" value={String(adminMetrics.users)} delta={adminMetrics.usersDelta} icon={UsersFour} />
                <KpiCard label="Churn 30d" value={`${adminMetrics.churn}%`} delta={adminMetrics.churnDelta} inverted icon={TrendDown} />
                <KpiCard label="Conversão" value={`${adminMetrics.conversion}%`} delta={adminMetrics.conversionDelta} icon={Pulse} />
            </div>

            {/* Alertas */}
            <Panel title="Alertas automáticos" icon={WarningCircle}>
                <div className="grid gap-2 md:grid-cols-3">
                    {adminAlerts.map((a) => (
                        <div key={a.id} className={`rounded-2xl border p-3 ${a.level === "high" ? "border-red-500/25 bg-red-500/10"
                                : a.level === "medium" ? "border-amber-400/25 bg-amber-400/10"
                                    : "border-white/10 bg-white/[0.03]"
                            }`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${a.level === "high" ? "text-red-300" : a.level === "medium" ? "text-amber-300" : "text-white/55"
                                    }`}>{a.level === "high" ? "Crítico" : a.level === "medium" ? "Atenção" : "Info"}</span>
                                <span className="font-mono text-[10px] text-white/40">{fmtDateTime(a.at)}</span>
                            </div>
                            <p className="mt-1.5 font-heading text-sm font-bold text-white">{a.title}</p>
                            <p className="mt-1 font-body text-xs text-white/55">{a.description}</p>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* Charts grid */}
            <div className="grid gap-4 xl:grid-cols-3">
                <Panel title="Receita — últimos 30 dias" icon={ChartLineUp} className="xl:col-span-2">
                    <LineChart data={revenueSeries.map((p) => p.value)} />
                </Panel>
                <Panel title="Distribuição da receita" icon={ChartBar}>
                    <Donut segments={revenueByPlan.map((p) => ({ value: p.value, color: p.color, label: p.label }))} />
                </Panel>
                <Panel title="Novos vs. Churned" icon={UsersFour}>
                    <BarPairs data={newVsChurnSeries} />
                </Panel>
                <Panel title="Status de cobranças" icon={Receipt}>
                    <BarsHorizontal data={chargeStatusBreakdown} />
                </Panel>
                <Panel title="Atividade por hora" icon={Pulse}>
                    <Sparkbars data={hourlyActivity.map((p) => p.value)} />
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

function Donut({ segments }: { segments: { value: number; color: string; label: string }[] }) {
    const total = segments.reduce((s, x) => s + x.value, 0);
    let acc = 0;
    const r = 38, cx = 50, cy = 50, c = 2 * Math.PI * r;
    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="14" />
                {segments.map((s, i) => {
                    const len = (s.value / total) * c;
                    const dash = `${len} ${c - len}`;
                    const offset = -acc;
                    acc += len;
                    return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={dash} strokeDashoffset={offset} strokeLinecap="round" />;
                })}
            </svg>
            <ul className="space-y-1.5 text-xs">
                {segments.map((s) => (
                    <li key={s.label} className="flex items-center gap-2 font-body text-white/70">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                        {s.label}
                        <span className="ml-auto font-mono text-white/45">{Math.round((s.value / total) * 100)}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function BarPairs({ data }: { data: { month: string; newUsers: number; churned: number }[] }) {
    const max = Math.max(...data.map((d) => Math.max(d.newUsers, d.churned)));
    return (
        <div className="space-y-2">
            <div className="flex items-end gap-1.5">
                {data.map((d) => (
                    <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                        <div className="flex h-32 w-full items-end gap-1">
                            <div className="flex-1 rounded-t bg-lime-accent/80" style={{ height: `${(d.newUsers / max) * 100}%` }} />
                            <div className="flex-1 rounded-t bg-red-400/70" style={{ height: `${(d.churned / max) * 100}%` }} />
                        </div>
                        <span className="font-mono text-[9px] text-white/40">{d.month}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-3 font-body text-[11px] text-white/55">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-lime-accent" /> Novos</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-400" /> Churned</span>
            </div>
        </div>
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
                        <span className="font-mono">{d.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

function Sparkbars({ data }: { data: number[] }) {
    const max = Math.max(...data);
    return (
        <div className="flex h-32 items-end gap-1">
            {data.map((v, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-link-blue to-pago-violet"
                    style={{ height: `${(v / max) * 100}%`, opacity: 0.5 + (v / max) * 0.5 }}
                />
            ))}
        </div>
    );
}

/* ================================================================== */
/* APP 2 — USUÁRIOS                                                    */
/* ================================================================== */

function UsersApp() {
    const [filterPlan, setFilterPlan] = useState<"all" | "Free" | "Pro" | "Business">("all");
    const [filterStatus, setFilterStatus] = useState<"all" | "Ativo" | "Inativo" | "Bloqueado">("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<AdminUser | null>(null);

    const filtered = adminUsers.filter((u: AdminUser) => {
        if (filterPlan !== "all" && u.plan !== filterPlan) return false;
        if (filterStatus !== "all" && u.status !== filterStatus) return false;
        if (search && !`${u.name} ${u.email} ${u.service}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px] h-full items-start">
            <div className="flex flex-col h-full">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nome, email, serviço..." />
                    <Pill options={["all", "Free", "Pro", "Business"]} value={filterPlan} onChange={(v) => setFilterPlan(v as any)} icon={Funnel} />
                    <Pill options={["all", "Ativo", "Inativo", "Bloqueado"]} value={filterStatus} onChange={(v) => setFilterStatus(v as any)} icon={Funnel} />
                    <span className="ml-auto font-body text-xs text-white/40">{filtered.length} usuários</span>
                </div>
                <div className="flex-1">
                    <DataTable
                        headers={["Usuário", "Plano", "Status", "Recebido", "Cobranças", "Cidade"]}
                        rows={filtered.map((u: AdminUser) => ({
                            key: u.id,
                            onClick: () => setSelected(u),
                            cells: [
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-accent/15 font-heading text-xs font-bold text-lime-accent">
                                        {u.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-heading text-sm font-bold text-white">{u.name}</p>
                                        <p className="truncate font-body text-[11px] text-white/45">{u.email}</p>
                                    </div>
                                </div>,
                                <Tag>{u.plan}</Tag>,
                                <StatusDot status={u.status} />,
                                <span className="font-mono text-xs text-white/85">{fmtBRL(u.totalReceived * 100)}</span>,
                                <span className="font-mono text-xs text-white/65">{u.chargesCount}</span>,
                                <span className="font-body text-xs text-white/55">{u.city}</span>,
                            ],
                        }))}
                    />
                </div>
            </div>

            {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

function UserDrawer({ user, onClose }: { user: AdminUser; onClose: () => void }) {
    return (
        <aside className="rounded-2xl border border-white/10 bg-[#0b0e11] p-4 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-accent/15 font-heading text-sm font-bold text-lime-accent">
                        {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                        <p className="font-heading text-base font-bold text-white">{user.name}</p>
                        <p className="font-body text-[11px] text-white/45">{user.email}</p>
                    </div>
                </div>
                <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/45 hover:bg-white/[0.06]">
                    <X size={14} weight="bold" />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat label="Recebido total" value={fmtBRL(user.totalReceived * 100)} />
                <Stat label="Cobranças" value={String(user.chargesCount)} />
                <Stat label="Plano" value={user.plan} />
                <Stat label="Status" value={user.status} />
            </div>

            <div className="mt-4">
                <p className="font-body text-[11px] font-bold uppercase tracking-wider text-white/40">Detalhes</p>
                <ul className="mt-2 space-y-1.5 font-body text-xs text-white/65">
                    <li><b className="text-white/85">Serviço:</b> {user.service}</li>
                    <li><b className="text-white/85">Cidade:</b> {user.city}</li>
                    <li><b className="text-white/85">CPF:</b> {user.cpf}</li>
                    <li><b className="text-white/85">Cadastro:</b> {fmtDateTime(user.joinedAt)}</li>
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

function ChargesApp() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>("all");
    const [method, setMethod] = useState<string>("all");
    const [type, setType] = useState<string>("all");
    const [selected, setSelected] = useState<AdminCharge | null>(null);

    const filtered = adminCharges.filter((c: AdminCharge) => {
        if (status !== "all" && c.status !== status) return false;
        if (method !== "all" && c.method !== method) return false;
        if (type !== "all" && c.type !== type) return false;
        if (search && !`${c.id} ${c.payerEmail} ${c.payerCpf} ${c.userName}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px] h-full items-start">
            <div className="flex flex-col h-full">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <SearchBox value={search} onChange={setSearch} placeholder="Buscar por ID, email, CPF..." />
                    <Pill options={["all", "Paga", "Pendente", "Expirada", "Reembolsada", "Fraude"]} value={status} onChange={setStatus} icon={Funnel} />
                    <Pill options={["all", "PIX", "PIX QR", "Boleto"]} value={method} onChange={setMethod} icon={Funnel} />
                    <Pill options={["all", "Cobrança", "Assinatura", "Reembolso"]} value={type} onChange={setType} icon={Funnel} />
                    <span className="ml-auto font-body text-xs text-white/40">{filtered.length} transações</span>
                </div>

                <div className="flex-1">
                    <DataTable
                        headers={["ID", "Cliente", "Vendedor", "Método", "Valor", "Status", "Data"]}
                        rows={filtered.map((c: AdminCharge) => ({
                            key: c.id,
                            onClick: () => setSelected(c),
                            cells: [
                                <span className="font-mono text-[11px] text-white/55">{c.id}</span>,
                                <div>
                                    <p className="font-heading text-xs font-semibold text-white">{c.payerName}</p>
                                    <p className="font-body text-[10px] text-white/40">{c.payerEmail}</p>
                                </div>,
                                <span className="font-body text-xs text-white/65">{c.userName}</span>,
                                <Tag>{c.method}</Tag>,
                                <span className="font-mono text-xs text-white/85">{fmtBRL(c.amount)}</span>,
                                <ChargeStatus status={c.status} />,
                                <span className="font-mono text-[10px] text-white/45">{fmtDateTime(c.createdAt)}</span>,
                            ],
                        }))}
                    />
                </div>
            </div>

            {selected && <ChargeDrawer charge={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

function ChargeDrawer({ charge, onClose }: { charge: AdminCharge; onClose: () => void }) {
    return (
        <aside className="rounded-2xl border border-white/10 bg-[#0b0e11] p-4 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-mono text-[11px] text-white/45">{charge.id}</p>
                    <p className="mt-0.5 font-heading text-2xl font-bold text-white">{fmtBRL(charge.amount)}</p>
                    <ChargeStatus status={charge.status} />
                </div>
                <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/45 hover:bg-white/[0.06]">
                    <X size={14} weight="bold" />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat label="Bruto" value={fmtBRL(charge.amount)} />
                <Stat label="Taxa" value={fmtBRL(charge.fee)} />
                <Stat label="Líquido" value={fmtBRL(charge.net)} highlight />
                <Stat label="Método" value={charge.method} />
            </div>

            <div className="mt-4 space-y-1.5 font-body text-xs text-white/65">
                <p><b className="text-white/85">Vendedor:</b> {charge.userName}</p>
                <p><b className="text-white/85">Cliente:</b> {charge.payerName}</p>
                <p><b className="text-white/85">Email:</b> {charge.payerEmail}</p>
                <p><b className="text-white/85">CPF:</b> {charge.payerCpf}</p>
                <p><b className="text-white/85">Serviço:</b> {charge.service}</p>
                <p><b className="text-white/85">Tipo:</b> {charge.type}</p>
                <p><b className="text-white/85">Criada em:</b> {fmtDateTime(charge.createdAt)}</p>
                {charge.paidAt && <p><b className="text-white/85">Paga em:</b> {fmtDateTime(charge.paidAt)}</p>}
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

function FinanceApp() {
    const totalReceita = revenueSeries.reduce((s, x) => s + x.value, 0) * 100;
    const custos = Math.round(totalReceita * 0.18);
    const lucro = totalReceita - custos;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {["Hoje", "7d", "30d", "90d", "Ano", "Tudo"].map((p, i) => (
                        <button key={p} className={`rounded-full border px-3 py-1.5 font-heading text-xs font-black transition-all ${i === 2 ? "border-lime-accent bg-lime-accent text-[#0a0a0a]" : "border-white/10 text-white/65 hover:bg-white/[0.06]"
                            }`}>{p}</button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <ActionBtn icon={DownloadSimple} label="CSV" small />
                    <ActionBtn icon={DownloadSimple} label="PDF" small />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <KpiCard label="Receita bruta" value={fmtBRL(totalReceita)} delta={9.4} icon={TrendUp} />
                <KpiCard label="Custos" value={fmtBRL(custos)} delta={-2.1} icon={TrendDown} />
                <KpiCard label="Lucro líquido" value={fmtBRL(lucro)} delta={11.7} icon={Sparkle} />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="Receita acumulada" icon={ChartLineUp}>
                    <LineChart data={revenueSeries.map((_, i) =>
                        revenueSeries.slice(0, i + 1).reduce((s, x) => s + x.value, 0)
                    )} />
                </Panel>
                <Panel title="Composição da receita" icon={ChartBar}>
                    <Donut segments={revenueByPlan.map((p) => ({ value: p.value, color: p.color, label: p.label }))} />
                </Panel>
                <Panel title="Margem (lucro / receita)" icon={Pulse}>
                    <Sparkbars data={revenueSeries.map((p, i) => 60 + Math.round(((revenueSeries[(i + 3) % 30].value / p.value) - 0.7) * 40))} />
                </Panel>
                <Panel title="Top categorias" icon={ListChecks}>
                    <BarsHorizontal data={[
                        { label: "Cobrança avulsa", value: 62, color: "#9EEA6C" },
                        { label: "Assinatura", value: 28, color: "#3B82F6" },
                        { label: "Upsell", value: 10, color: "#A78BFA" },
                    ]} />
                </Panel>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="Receita por fonte" icon={Database}>
                    <DataTable
                        headers={["Fonte", "Cobranças", "Bruto", "Taxa", "Líquido"]}
                        rows={[
                            { key: "1", cells: ["PIX QR Code", "412", fmtBRL(238_000_00), fmtBRL(4_760_00), fmtBRL(233_240_00)] },
                            { key: "2", cells: ["PIX chave", "318", fmtBRL(184_000_00), fmtBRL(3_680_00), fmtBRL(180_320_00)] },
                            { key: "3", cells: ["Boleto", "94", fmtBRL(62_000_00), fmtBRL(1_240_00), fmtBRL(60_760_00)] },
                        ]}
                    />
                </Panel>
                <Panel title="Custos por tipo" icon={Database}>
                    <DataTable
                        headers={["Tipo", "Recorrência", "Valor"]}
                        rows={[
                            { key: "1", cells: ["Gateway PIX", "Mensal", fmtBRL(8_400_00)] },
                            { key: "2", cells: ["Resend (email)", "Mensal", fmtBRL(390_00)] },
                            { key: "3", cells: ["Supabase", "Mensal", fmtBRL(1_250_00)] },
                            { key: "4", cells: ["Vercel", "Mensal", fmtBRL(720_00)] },
                            { key: "5", cells: ["Domínio + SSL", "Anual", fmtBRL(180_00)] },
                        ]}
                    />
                </Panel>
            </div>
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
    const [activeId, setActiveId] = useState(adminTickets[0].id);
    const ticket = adminTickets.find((t) => t.id === activeId)!;
    const [draft, setDraft] = useState("");

    const quickReplies = [
        "Reenviar recibo do último pagamento",
        "Reembolsar cobrança",
        "Resetar senha do usuário",
        "Reverter status de fraude",
    ];

    return (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr_240px]">
            {/* Lista */}
            <aside className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2">
                {adminTickets.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveId(t.id)}
                        className={`flex w-full flex-col gap-1 rounded-xl p-3 text-left transition-all ${activeId === t.id ? "bg-lime-accent/10 ring-1 ring-lime-accent/25" : "hover:bg-white/[0.04]"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-heading text-sm font-bold text-white">{t.user}</span>
                            {t.unread && <span className="h-2 w-2 rounded-full bg-lime-accent animate-pulse" />}
                        </div>
                        <span className="font-body text-[11px] text-white/55">{t.subject}</span>
                        <span className="font-body text-[10px] text-white/35">{t.preview}</span>
                    </button>
                ))}
            </aside>

            {/* Chat */}
            <div className="flex min-h-[480px] flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                        <p className="font-heading text-sm font-bold text-white">{ticket.subject}</p>
                        <p className="font-body text-[11px] text-white/45">{ticket.email}</p>
                    </div>
                    <ActionBtn icon={Eye} label="Acessar como cliente" small />
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto py-4 custom-scrollbar">
                    {ticket.messages.map((m, i) => (
                        <div key={i} className={`flex ${m.who === "admin" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 font-body text-sm ${m.who === "admin" ? "rounded-tr-sm bg-lime-accent/15 text-white" : "rounded-tl-sm bg-white/[0.06] text-white/85"
                                }`}>
                                {m.text}
                                <p className="mt-1 font-mono text-[9px] text-white/35">{fmtDateTime(m.at)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/[0.06] pt-3">
                    <div className="flex items-center gap-2">
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Escreva uma resposta..."
                            className="h-10 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-lime-accent/30"
                        />
                        <button className="rounded-xl bg-lime-accent px-4 py-2 font-heading text-sm font-black text-[#0a0a0a] transition-all active:scale-95">Enviar</button>
                    </div>
                </div>
            </div>

            {/* Ações rápidas */}
            <aside className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="mb-2 px-1 font-body text-[11px] font-bold uppercase tracking-wider text-white/40">Respostas rápidas</p>
                <ul className="space-y-1.5">
                    {quickReplies.map((r) => (
                        <li key={r}>
                            <button className="flex w-full items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left font-body text-xs text-white/75 transition-all hover:border-lime-accent/25 hover:bg-white/[0.06] active:scale-95">
                                <Lightning size={14} weight="duotone" className="text-lime-accent" />
                                {r}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
}

/* ================================================================== */
/* APP 7 — CONFIGURAÇÕES                                                */
/* ================================================================== */

function SettingsApp() {
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Dados gerais" icon={GearSix}>
                <div className="space-y-3">
                    <SettingRow label="Nome da plataforma" value="CloudePay" />
                    <SettingRow label="Domínio" value="cloudepay.com.br" />
                    <SettingRow label="Suporte" value="suporte@cloudepay.com.br" />
                    <SettingRow label="Fuso horário" value="America/Sao_Paulo (UTC−3)" />
                </div>
            </Panel>

            <Panel title="Chaves de API" icon={Lock}>
                <div className="space-y-3">
                    <KeyRow label="Public Key" value="pk_live" suffix="a91c" />
                    <KeyRow label="Secret Key" value="sk_live" suffix="•••• 7d2f" />
                    <KeyRow label="Webhook Secret" value="whsec_" suffix="•••• 0fa3" />
                    <p className="font-body text-[11px] text-white/40">Apenas os últimos 4 dígitos são exibidos por segurança.</p>
                </div>
            </Panel>

            <Panel title="Integrações" icon={Database}>
                <ul className="space-y-2">
                    <Integration name="AbacatePay (PIX)" status="ok" />
                    <Integration name="Resend (email)" status="ok" />
                    <Integration name="Supabase Auth" status="ok" />
                    <Integration name="Stripe (futuro)" status="pending" />
                </ul>
            </Panel>

            <Panel title="Taxas customizáveis" icon={ChartBar}>
                <div className="space-y-3">
                    <SettingRow label="Taxa padrão" value="2.0%" editable />
                    <SettingRow label="Taxa Plano Pro" value="1.5%" editable />
                    <SettingRow label="Taxa Business" value="1.0%" editable />
                    <SettingRow label="Taxa boleto" value="R$ 2,49 por boleto" editable />
                </div>
            </Panel>

            <Panel title="Templates de email" icon={ChatCircleDots} className="xl:col-span-2">
                <div className="grid gap-2 md:grid-cols-3">
                    {["Comprovante de pagamento", "Boas-vindas", "Recuperação de senha", "Cobrança expirada", "Notificação de venda", "Resumo semanal"].map((t) => (
                        <article key={t} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 hover:border-white/10 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="font-heading text-sm font-bold text-white">{t}</span>
                                <ActionBtn icon={Eye} label="Editar" small />
                            </div>
                            <p className="mt-1 font-body text-[11px] text-white/45">Variáveis: {`{{ nome }}, {{ valor }}, {{ link }}`}</p>
                        </article>
                    ))}
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

function KeyRow({ label, value, suffix }: { label: string; value: string; suffix: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
            <div>
                <p className="font-body text-[11px] text-white/45">{label}</p>
                <p className="font-mono text-sm text-white/85">{value}{suffix}</p>
            </div>
            <button className="rounded-md border border-white/10 px-2.5 py-1 font-body text-[11px] text-white/65 hover:bg-white/[0.06] transition-all">
                Revogar
            </button>
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
    const [search, setSearch] = useState("");
    const [type, setType] = useState<string>("all");
    const [status, setStatus] = useState<string>("all");

    const filtered = adminLogs.filter((l) => {
        if (type !== "all" && l.type !== type) return false;
        if (status !== "all" && l.status !== status) return false;
        if (search && !`${l.user} ${l.ip} ${l.action}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <SearchBox value={search} onChange={setSearch} placeholder="Buscar por email, IP, ação..." />
                <Pill options={["all", "auth", "payment", "webhook", "admin", "system"]} value={type} onChange={setType} icon={Funnel} />
                <Pill options={["all", "ok", "warn", "error"]} value={status} onChange={setStatus} icon={Funnel} />
                <ActionBtn icon={DownloadSimple} label="Exportar" small />
                <span className="ml-auto font-body text-xs text-white/40">{filtered.length} eventos</span>
            </div>

            <DataTable
                headers={["Timestamp", "Tipo", "Ação", "Usuário", "IP", "Status"]}
                rows={filtered.map((l) => ({
                    key: l.id,
                    cells: [
                        <span className="font-mono text-[11px] text-white/55">{fmtDateTime(l.timestamp)}</span>,
                        <Tag>{l.type}</Tag>,
                        <span className="font-body text-xs text-white/85">{l.action}</span>,
                        <span className="font-body text-xs text-white/65">{l.user}</span>,
                        <span className="font-mono text-[11px] text-white/45">{l.ip}</span>,
                        <LogStatus status={l.status} />,
                    ],
                }))}
            />
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

function Tag({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex rounded-md bg-white/[0.06] px-2 py-0.5 font-body text-[11px] font-bold text-white/75">{children}</span>
    );
}

function StatusDot({ status }: { status: string }) {
    const color = status === "Ativo" ? "bg-lime-accent shadow-[0_0_8px_rgba(158,234,108,0.5)]"
        : status === "Inativo" ? "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.5)]"
            : status === "Bloqueado" ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                : "bg-white/40";
    return (
        <span className="inline-flex items-center gap-1.5 font-body text-xs text-white/75">
            <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
            {status}
        </span>
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

function LogStatus({ status }: { status: "ok" | "warn" | "error" }) {
    const map = {
        ok: { color: "text-lime-accent", label: "OK" },
        warn: { color: "text-amber-300", label: "Atenção" },
        error: { color: "text-red-300", label: "Erro" },
    }[status];
    return <span className={`font-body text-[11px] font-black ${map.color}`}>{map.label}</span>;
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
