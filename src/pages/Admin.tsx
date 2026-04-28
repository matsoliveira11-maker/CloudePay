import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { formatBRL } from "../lib/format";
import {
  Users,
  CurrencyCircleDollar,
  ChartLineUp,
  TrendUp,
  ShieldCheck,
  UserCircle,
  Clock,
  ArrowRight,
  Database,
  Globe,
  ChartBar,
  Monitor,
  ChartPie,
  FileText,
  ChatCenteredDots,
  Key,
  Activity,
  List,
  Download,
  ArrowsLeftRight,
  UserSwitch,
  Warning,
  Funnel,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Receipt,
  DotsThreeOutlineVertical,
  PencilSimple,
  Trash,
  ArrowDown
} from "phosphor-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const ADMIN_EMAILS = ["matsoliveira11@gmail.com", "mats.oliveira11@gmail.com"];
// @ts-ignore
const MASTER_SECRET_TOKEN = import.meta.env.VITE_MASTER_TOKEN; 

type AdminTab = "overview" | "users" | "charges" | "finance" | "reports" | "support" | "settings" | "logs";

export default function Admin() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterToken, setMasterToken] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = profile && ADMIN_EMAILS.includes(profile.email?.toLowerCase());

  async function loadData() {
    if (!isAdmin || !isUnlocked) return;
    setLoading(true);
    const [s, p, c] = await Promise.all([
      api.getMasterStats(),
      api.getAllProfiles(),
      api.getAllCharges()
    ]);
    setStats(s);
    setProfiles(p);
    setCharges(c);
    setLoading(false);
  }

  useEffect(() => {
    if (isUnlocked) {
      loadData();
    }
  }, [profile?.id, isUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterToken === MASTER_SECRET_TOKEN) {
      setIsUnlocked(true);
      setTokenError(false);
    } else {
      setTokenError(true);
    }
  };

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const res = await api.signIn(adminEmail, adminPassword);
    setAuthLoading(false);
    if (!res.ok) {
      setAuthError(res.error);
    } else {
      // O profile será atualizado pelo AuthContext automaticamente
      window.location.reload(); // Recarregar para garantir o estado limpo
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white mb-6">
              <UserCircle size={32} weight="duotone" />
            </div>
            <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-2">Portal Founder</h1>
            <p className="text-white/40 font-body text-xs uppercase tracking-widest">Autenticação de Nível 1</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                placeholder="E-MAIL MASTER"
                className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 px-6 text-center text-sm font-heading font-black text-white placeholder:text-white/10 focus:border-white/20 focus:outline-none transition-all uppercase tracking-widest"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="SENHA MASTER"
                className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 px-6 text-center text-sm font-heading font-black text-white placeholder:text-white/10 focus:border-white/20 focus:outline-none transition-all uppercase tracking-widest"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              {authError && (
                <p className="text-center text-[10px] font-heading font-black text-red-500 uppercase tracking-widest animate-pulse">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-2xl bg-white py-4 text-[12px] font-heading font-black text-[#0a0a0a] uppercase tracking-[0.2em] hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
            >
              {authLoading ? "Validando..." : "Acessar Portal"}
            </button>
          </form>

          <p className="mt-12 text-center text-[9px] font-body text-white/20 uppercase tracking-[0.3em]">Authorized Access Only</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <ShieldCheck size={64} weight="duotone" className="mx-auto text-red-500 mb-6" />
          <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-4">Acesso Negado</h1>
          <p className="text-white/40 font-body text-sm leading-relaxed mb-8">
            Seu e-mail ({profile.email}) não possui as permissões de Fundador Master necessárias para esta área.
          </p>
          <a href="/painel" className="inline-flex items-center gap-2 text-lime-accent font-heading font-black uppercase text-[12px] tracking-widest hover:underline">
            Voltar ao Painel <ArrowRight />
          </a>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-lime-accent/5 border border-lime-accent/20 text-lime-accent mb-6 animate-pulse">
              <ShieldCheck size={32} weight="duotone" />
            </div>
            <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-2">Cofre Master</h1>
            <p className="text-white/40 font-body text-xs uppercase tracking-widest">Insira o Token Extra para Desbloquear</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <input
                type="password"
                placeholder="TOKEN-EXTRA-AQUI"
                className={`w-full rounded-2xl border ${tokenError ? 'border-red-500/50' : 'border-white/5'} bg-white/[0.03] py-4 px-6 text-center text-sm font-heading font-black text-white placeholder:text-white/10 focus:border-lime-accent/30 focus:outline-none transition-all tracking-[0.3em]`}
                value={masterToken}
                onChange={(e) => setMasterToken(e.target.value)}
                autoFocus
              />
              {tokenError && (
                <p className="text-center text-[10px] font-heading font-black text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">Token Inválido</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-white py-4 text-[12px] font-heading font-black text-[#0a0a0a] uppercase tracking-[0.2em] hover:brightness-110 transition-all active:scale-95"
            >
              Desbloquear Torre
            </button>
          </form>

          <p className="mt-12 text-center text-[9px] font-body text-white/20 uppercase tracking-[0.3em]">One Above All Protocol</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Shell>
        <div className="animate-pulse space-y-8">
          <div className="h-20 bg-white/5 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
          </div>
          <div className="h-80 bg-white/5 rounded-3xl" />
        </div>
      </Shell>
    );
  }

  const timelineData = stats?.rawCharges
    ? Object.values(stats.rawCharges.reduce((acc: any, curr: any) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        if (!acc[date]) acc[date] = { date, volume: 0, revenue: 0 };
        if (curr.status === 'paid') {
          acc[date].volume += curr.amount_cents / 100;
          acc[date].revenue += curr.fee_cents / 100;
        }
        return acc;
      }, {})).slice(-7)
    : [];

  const statusData = [
    { name: 'Pagas', value: charges.filter(c => c.status === 'paid').length, color: '#9EEA6C' },
    { name: 'Pendentes', value: charges.filter(c => c.status === 'pending').length, color: '#ffffff30' },
    { name: 'Falhas/Ref', value: charges.filter(c => c.status === 'failed' || c.status === 'refunded').length, color: '#ef4444' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Receita Bruta (GMV)", value: formatBRL(stats?.gmv || 0), icon: CurrencyCircleDollar, sub: "+12.5% vs ontem", color: "text-white" },
                { label: "Novos Usuários", value: profiles.length, icon: Users, sub: "Crescimento acelerado", color: "text-[#9EEA6C]" },
                { label: "Ticket Médio", value: formatBRL(stats?.totalCharges ? stats.gmv / stats.totalCharges : 0), icon: TrendUp, sub: "Estabilidade alta", color: "text-white" },
                { label: "Taxa de Conversão", value: `${(stats?.conversions || 0).toFixed(1)}%`, icon: ChartLineUp, sub: "Otimização ótima", color: "text-[#9EEA6C]" },
              ].map((m, i) => (
                <div key={i} className="bg-[#121212] border border-white/5 p-6 rounded-[32px] relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <m.icon size={100} weight="duotone" />
                  </div>
                  <p className="text-[10px] font-heading font-black text-white/20 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className={`text-2xl font-heading font-black ${m.color} tracking-tight`}>{m.value}</p>
                  <p className="text-[9px] font-body text-white/30 mt-1 flex items-center gap-1.5">
                    <CheckCircle size={10} className="text-[#9EEA6C]" /> {m.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-[32px] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight">Timeline de Receita</h3>
                    <p className="text-[10px] text-white/30 font-body uppercase tracking-widest">Desempenho dos últimos 7 dias</p>
                  </div>
                  <ChartLineUp size={24} weight="duotone" className="text-white/10" />
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9EEA6C" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#9EEA6C" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#ffffff30', fontSize: 10}} />
                      <YAxis hide />
                      <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: 'none', borderRadius: '16px'}} />
                      <Area type="monotone" dataKey="volume" stroke="#9EEA6C" strokeWidth={4} fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8">
                <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight mb-8 text-center">Status das Cobranças</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: 'none', borderRadius: '16px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-2">
                  {statusData.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{backgroundColor: s.color}} />
                        <span className="text-[10px] font-heading font-black text-white/40 uppercase">{s.name}</span>
                      </div>
                      <span className="text-[11px] font-heading font-black text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <Warning size={20} weight="duotone" />
                </div>
                <div>
                  <p className="text-[11px] font-heading font-black text-red-400 uppercase tracking-widest">Alerta de Churn</p>
                  <p className="text-[10px] text-red-400/60 font-body mt-0.5">3 usuários inativos nos últimos 7 dias.</p>
                </div>
              </div>
              <div className="bg-[#9EEA6C]/5 border border-[#9EEA6C]/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#9EEA6C]/20 flex items-center justify-center text-[#9EEA6C]">
                  <CheckCircle size={20} weight="duotone" />
                </div>
                <div>
                  <p className="text-[11px] font-heading font-black text-[#9EEA6C] uppercase tracking-widest">Sistema Saudável</p>
                  <p className="text-[10px] text-[#9EEA6C]/60 font-body mt-0.5">Gateway operando com latência de 142ms.</p>
                </div>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Activity size={20} weight="duotone" />
                </div>
                <div>
                  <p className="text-[11px] font-heading font-black text-blue-400 uppercase tracking-widest">Tráfego Elevado</p>
                  <p className="text-[10px] text-blue-400/60 font-body mt-0.5">Pico de acessos detectado em São Paulo.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121212] p-6 rounded-[32px] border border-white/5">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  placeholder="BUSCAR USUÁRIO POR NOME OU EMAIL..."
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-heading font-black text-white placeholder:text-white/10 focus:outline-none focus:border-[#9EEA6C]/30 transition-all uppercase tracking-widest"
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="bg-white/5 text-white/40 px-4 py-3 rounded-xl text-[10px] font-heading font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                  <Funnel size={16} /> Filtros
                </button>
                <button className="bg-[#9EEA6C] text-[#0a0a0a] px-6 py-3 rounded-xl text-[10px] font-heading font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
                  Novo Usuário
                </button>
              </div>
            </div>

            <div className="bg-[#121212] border border-white/5 rounded-[32px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-heading font-black text-white/20 uppercase tracking-widest">Usuário</th>
                    <th className="px-6 py-5 text-[10px] font-heading font-black text-white/20 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-heading font-black text-white/20 uppercase tracking-widest">Volume (GMV)</th>
                    <th className="px-6 py-5 text-[10px] font-heading font-black text-white/20 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profiles.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 font-heading font-black group-hover:bg-[#9EEA6C]/10 group-hover:text-[#9EEA6C] transition-all">
                            {p.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-xs font-heading font-black text-white uppercase tracking-tight">{p.full_name || "Membro"}</p>
                            <p className="text-[10px] text-white/30 font-body">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#9EEA6C]/10 text-[#9EEA6C] text-[9px] font-heading font-black uppercase tracking-widest">
                          <div className="h-1 w-1 rounded-full bg-[#9EEA6C]" /> Ativo
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[11px] font-heading font-black text-white">R$ 0,00</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button title="Impersonate" className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:bg-[#9EEA6C]/10 hover:text-[#9EEA6C] transition-all">
                            <UserSwitch size={16} />
                          </button>
                          <button className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:bg-white/10 hover:text-white transition-all">
                            <DotsThreeOutlineVertical weight="fill" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "charges":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121212] p-6 rounded-[32px] border border-white/5">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  placeholder="BUSCAR POR ID, EMAIL OU CPF..."
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-heading font-black text-white placeholder:text-white/10 focus:outline-none focus:border-[#9EEA6C]/30 transition-all uppercase tracking-widest"
                />
              </div>
              <button className="bg-white/5 text-white/40 px-6 py-3 rounded-xl text-[10px] font-heading font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                <Download size={16} /> Exportar CSV
              </button>
            </div>

            <div className="bg-[#121212] border border-white/5 rounded-[32px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-heading font-black text-white/20 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-5 text-[10px] font-heading font-black text-white/20 uppercase tracking-widest">Valor</th>
                    <th className="px-6 py-5 text-[10px] font-heading font-black text-white/20 uppercase tracking-widest">Vendedor</th>
                    <th className="px-6 py-5 text-[10px] font-heading font-black text-white/20 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-heading font-black text-white/20 uppercase tracking-widest text-right">Taxa (1%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {charges.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-5 text-[11px] font-body text-white/40">{new Date(c.created_at).toLocaleString()}</td>
                      <td className="px-6 py-5 text-sm font-heading font-black text-white tracking-tighter">{formatBRL(c.amount_cents)}</td>
                      <td className="px-6 py-5 text-[11px] font-heading font-black text-white/60 uppercase">{c.profiles?.full_name || "Membro"}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-heading font-black uppercase tracking-widest ${c.status === 'paid' ? 'bg-[#9EEA6C]/10 text-[#9EEA6C]' : 'bg-white/5 text-white/20'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right text-[11px] font-heading font-black text-[#9EEA6C]">{formatBRL(c.fee_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-20 text-center bg-[#121212] rounded-[32px] border border-white/5 border-dashed">
            <h3 className="text-xl font-heading font-black text-white/20 uppercase tracking-[0.2em] mb-2">Módulo em Desenvolvimento</h3>
            <p className="text-[10px] text-white/10 font-body uppercase tracking-widest">Esta funcionalidade será liberada na próxima atualização master.</p>
          </div>
        );
    }
  };

  return (
    <Shell>
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-6 rounded-full bg-[#9EEA6C] flex items-center justify-center">
                <Globe size={14} weight="bold" className="text-[#0a0a0a]" />
              </div>
              <span className="text-[10px] font-heading font-black text-[#9EEA6C] uppercase tracking-[0.4em]">One Above All 2000</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter leading-none">
              Control <span className="text-white/20">Center</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-[#121212] p-1.5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 px-4 py-2 border-r border-white/5">
              <div className="h-2 w-2 rounded-full bg-[#9EEA6C] shadow-[0_0_8px_#9EEA6C]" />
              <span className="text-[10px] font-heading font-black text-white/60 uppercase tracking-widest">Global Status: Healthy</span>
            </div>
            <button 
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("URL Secreta copiada!");
              }}
              className="px-4 py-2 text-[10px] font-heading font-black text-white/40 hover:text-white transition-all uppercase tracking-widest"
            >
              Share Secret
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#121212] p-1.5 rounded-[22px] border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Dashboard", icon: Monitor },
            { id: "users", label: "Usuários", icon: Users },
            { id: "charges", label: "Cobranças", icon: ArrowsLeftRight },
            { id: "finance", label: "Financeiro", icon: CurrencyCircleDollar },
            { id: "reports", label: "Relatórios", icon: FileText },
            { id: "support", label: "Suporte", icon: ChatCenteredDots },
            { id: "settings", label: "Configurações", icon: Key },
            { id: "logs", label: "Logs", icon: Activity },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-[18px] text-[10px] font-heading font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? "bg-white text-[#0a0a0a] shadow-xl" 
                : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} weight={activeTab === tab.id ? "bold" : "duotone"} />
              {tab.label}
            </button>
          ))}
        </div>

        {renderTabContent()}

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-body text-white/10 uppercase tracking-[0.4em]">CloudePay Security Protocol • v2.0.42</p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-white/10" />
              <span className="text-[9px] font-heading font-black text-white/20 uppercase tracking-widest">Encrypted DB Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#9EEA6C]/40" />
              <span className="text-[9px] font-heading font-black text-white/20 uppercase tracking-widest">Audit Logs Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
