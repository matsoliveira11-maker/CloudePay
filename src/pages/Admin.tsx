import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  ChartBar
} from "phosphor-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const ADMIN_EMAILS = ["matsoliveira11@gmail.com"];
// @ts-ignore
const MASTER_SECRET_TOKEN = import.meta.env.VITE_MASTER_TOKEN; 

export default function Admin() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterToken, setMasterToken] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [tokenError, setTokenError] = useState(false);

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <UserCircle size={64} weight="duotone" className="mx-auto text-white/20 mb-6" />
          <h1 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-4">Acesso de Fundador</h1>
          <p className="text-white/40 font-body text-sm leading-relaxed mb-8">
            Para acessar a Torre de Comando, você precisa primeiro autenticar sua conta de administrador.
          </p>
          <Link 
            to="/entrar" 
            state={{ from: { pathname: '/admin' } }}
            className="inline-flex items-center gap-3 bg-white text-[#0a0a0a] px-8 py-4 rounded-2xl font-heading font-black uppercase text-[12px] tracking-widest hover:brightness-110 transition-all active:scale-95"
          >
            Entrar no Sistema <ArrowRight weight="bold" />
          </Link>
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

  // Preparar dados para o gráfico
  const chartData = stats?.rawCharges
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

  return (
    <Shell>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* HEADER FUNDADOR */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-6 rounded-full bg-lime-accent flex items-center justify-center">
                <Globe size={14} weight="bold" className="text-[#0a0a0a]" />
              </div>
              <p className="text-[10px] font-heading font-black text-lime-accent uppercase tracking-[0.2em]">Torre de Comando Master</p>
            </div>
            <h1 className="text-[32px] sm:text-[42px] font-heading font-black text-white uppercase tracking-tighter leading-none">
              Founder <span className="text-white/20">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <div className="text-right">
              <p className="text-[10px] font-heading font-black text-white/20 uppercase">Status Global</p>
              <p className="text-sm font-heading font-black text-[#9EEA6C] uppercase">Operação Saudável</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#9EEA6C]/10 flex items-center justify-center text-[#9EEA6C] border border-[#9EEA6C]/20">
              <Database size={20} weight="duotone" />
            </div>
          </div>
        </div>

        {/* METRICAS CHAVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Volume Total (GMV)", value: formatBRL(stats?.gmv || 0), icon: CurrencyCircleDollar, color: "text-white" },
            { label: "Receita CloudePay (1%)", value: formatBRL(stats?.revenue || 0), icon: ChartLineUp, color: "text-[#9EEA6C]" },
            { label: "Base de Usuários", value: stats?.users || 0, icon: Users, color: "text-white" },
            { label: "Taxa de Conversão", value: `${(stats?.conversions || 0).toFixed(1)}%`, icon: TrendUp, color: "text-[#9EEA6C]" },
          ].map((m, i) => (
            <div key={i} className="group bg-white/[0.03] border border-white/5 p-6 rounded-[28px] hover:bg-white/[0.05] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${m.color}`}>
                  <m.icon size={20} weight="duotone" />
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-[#9EEA6C] shadow-[0_0_10px_#9EEA6C]" />
              </div>
              <p className="text-[10px] font-heading font-black text-white/20 uppercase tracking-widest mb-1">{m.label}</p>
              <p className={`text-2xl font-heading font-black ${m.color} tracking-tight`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* GRAFICOS DE CRESCIMENTO */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight">Fluxo de Caixa Global</h3>
                <p className="text-[12px] text-white/30 font-body">Últimos 7 dias de operação real</p>
              </div>
              <ChartBar size={24} weight="duotone" className="text-white/10" />
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9EEA6C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9EEA6C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#ffffff30', fontSize: 10}} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '16px'}}
                    itemStyle={{color: '#9EEA6C', fontSize: '12px'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#9EEA6C" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorVolume)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8">
            <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight mb-8">Status de Transações</h3>
            <div className="space-y-6">
              {[
                { label: "Pagas", count: stats?.rawCharges?.filter((c:any) => c.status === 'paid').length || 0, color: "bg-[#9EEA6C]" },
                { label: "Pendentes", count: stats?.rawCharges?.filter((c:any) => c.status === 'pending').length || 0, color: "bg-yellow-500/50" },
                { label: "Expiradas", count: stats?.rawCharges?.filter((c:any) => c.status === 'expired').length || 0, color: "bg-white/10" },
              ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[11px] font-heading font-black text-white/40 uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-heading font-black text-white">{item.count}</p>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${stats?.totalCharges ? (item.count / stats.totalCharges) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-heading font-black text-[#9EEA6C] uppercase tracking-widest mb-1">Previsão de Crescimento</p>
              <p className="text-2xl font-heading font-black text-white">+24.8% <span className="text-[10px] text-white/20 ml-1">v/s mês ant.</span></p>
            </div>
          </div>
        </div>

        {/* LISTA DE CLIENTES E TRANSAÇÕES */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* CLIENTES */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight">Base de Clientes</h3>
            </div>
            <div className="divide-y divide-white/5">
              {profiles.slice(0, 5).map(p => (
                <div key={p.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <p className="text-[14px] font-heading font-black text-white uppercase">{p.full_name || "Sem nome"}</p>
                      <p className="text-[11px] text-white/30 font-body">{p.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-heading font-black text-white/20 uppercase">Membro desde</p>
                    <p className="text-[11px] text-white/40 font-body">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ÚLTIMAS TRANSAÇÕES GLOBAIS */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight">Fluxo de Caixa Master</h3>
            </div>
            <div className="divide-y divide-white/5">
              {charges.slice(0, 5).map(c => (
                <div key={c.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${c.status === 'paid' ? 'bg-[#9EEA6C]' : 'bg-white/10'}`} />
                    <div>
                      <p className="text-[13px] font-heading font-black text-white uppercase tracking-tight">{formatBRL(c.amount_cents)}</p>
                      <p className="text-[10px] text-white/30 font-body">por {c.profiles?.full_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end text-white/30">
                      <Clock size={12} />
                      <p className="text-[11px] font-body">{new Date(c.created_at).toLocaleTimeString()}</p>
                    </div>
                    <p className="text-[10px] font-heading font-black text-lime-accent uppercase mt-1">
                      Taxa: {formatBRL(c.fee_cents)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
