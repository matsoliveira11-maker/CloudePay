import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import type { Charge, Product } from "../lib/api";
import { formatBRL, maskBRLInput, parseBRLToCents, formatDateTime } from "../lib/format";
import { sanitizeText } from "../lib/validators";
import PaymentShareCard from "../components/PaymentShareCard";
import {
  QrCode,
  ArrowRight,
  ChartLineUp,
  Receipt,
  TrendUp,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  List,
  ChartPieSlice,
  Package,
  CurrencyCircleDollar,
  X,
} from "phosphor-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

export default function Dashboard() {
  const { profile } = useAuth();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdCharge, setCreatedCharge] = useState<Charge | null>(null);
  const [activeTab, setActiveTab] = useState("Esse mês");

  async function reload() {
    if (!profile) return;
    const [list, total] = await Promise.all([
      api.listChargesByProfile(profile.id),
      api.getMonthTotalCents(profile.id),
    ]);
    setCharges(list);
    setMonthTotal(total);
  }

  useEffect(() => {
    reload();
    const i = setInterval(reload, 5000);
    return () => clearInterval(i);
  }, [profile?.id]);

  const openCreate = useCallback(() => {
    setCreatedCharge(null);
    setShowCreateModal(true);
  }, []);

  const closeCreate = useCallback(() => {
    setShowCreateModal(false);
    setCreatedCharge(null);
  }, []);

  useEffect(() => {
    const handleOpenCreate = () => openCreate();
    window.addEventListener("open-create-charge", handleOpenCreate as EventListener);
    return () => window.removeEventListener("open-create-charge", handleOpenCreate as EventListener);
  }, [openCreate]);

  const paidCharges = charges.filter((c) => c.status === "paid");
  const pendingCharges = charges.filter((c) => c.status === "pending");

  // Dados para o gráfico de barras (últimos 7 dias)
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });

    return last7Days.map(day => {
      const dayCharges = charges.filter(c => 
        new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === day
      );
      const total = dayCharges.reduce((acc, curr) => acc + curr.amount_cents, 0) / 100;
      return { name: day, total };
    });
  }, [charges]);

  // Dados para o gráfico de pizza (Distribuição)
  const pieData = useMemo(() => [
    { name: 'Pago', value: charges.filter(c => c.status === 'paid').length, color: '#9EEA6C' },
    { name: 'Pendente', value: charges.filter(c => c.status === 'pending').length, color: '#fbbf24' },
    { name: 'Expirado', value: charges.filter(c => c.status === 'expired').length, color: '#404040' },
  ], [charges]);

  const tabs = ["Hoje", "Esse mês", "Últimos 30 dias", "Últimos 90 dias", "Todo o período"];

  // Líquido real do mês (já subtraindo a taxa de 2%)
  const monthNetTotal = monthTotal * 0.98;

  return (
    <Shell onNewCharge={openCreate}>
      <div id="tour-dashboard" className="mb-2 sm:mb-4">
        <p className="text-[9px] sm:text-[10px] font-medium text-neutral-400 dark:text-white/30 font-body mb-0.5">Olá,</p>
        <h1 className="text-[22px] sm:text-[24px] leading-[0.95] font-heading font-extrabold text-[#0a0a0a] dark:text-white uppercase tracking-tight">
          {profile?.full_name?.split(" ")[0]}
        </h1>
      </div>

      <div className="mb-3 sm:mb-5 flex flex-wrap gap-1.5 sm:gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`rounded-md sm:rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-heading font-bold uppercase tracking-wide transition-all ${
              activeTab === t
                ? "bg-[#9EEA6C] text-[#0a0a0a] shadow-md"
                : "bg-white dark:bg-white/5 text-neutral-400 dark:text-white/20 border border-neutral-100 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-white/[0.08]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <section className="grid gap-2 sm:gap-3 sm:grid-cols-3 mb-3 sm:mb-5">
        <StatCard
          label="Recebido no mês"
          value={formatBRL(monthNetTotal)}
          subValue="Líquido após taxa de 2%"
          info="Valor total líquido que já caiu na sua conta após todas as taxas (CloudePay + Mercado Pago)."
          icon={Receipt}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-500/10 dark:bg-emerald-500/5"
        />
        <StatCard
          label="Total de cobranças"
          value={charges.length.toString()}
          subValue={`${pendingCharges.length} pendente(s)`}
          info="Número total de links de pagamento que você gerou neste período."
          icon={List}
          iconColor="text-blue-500"
          bgColor="bg-blue-500/10 dark:bg-blue-500/5"
        />
        <StatCard
          label="Ticket médio"
          value={formatBRL(paidCharges.length > 0 ? (monthTotal / paidCharges.length) : 0)}
          subValue="Somente pagamentos confirmados"
          info="A média de valor das suas vendas que foram efetivamente pagas."
          icon={TrendUp}
          iconColor="text-[#0a0a0a]"
          bgColor="bg-[#9EEA6C]"
        />
      </section>

      <div className="grid gap-2 sm:gap-3 lg:grid-cols-[1.4fr_1fr] mb-3 sm:mb-5">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-gradient-to-br from-[#0c1a0c] to-[#050a05] p-4 sm:p-6 text-white shadow-xl border border-white/5">
          <div className="absolute right-[-20px] top-[-20px] h-80 w-80 rounded-full bg-[#9EEA6C]/10 blur-[100px]" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="mb-2 sm:mb-3 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-white/5 text-[#9EEA6C] border border-white/10 shadow-inner">
                <QrCode size={16} weight="duotone" />
              </div>
              <p className="text-[8px] sm:text-[9px] font-heading font-extrabold text-[#9EEA6C] uppercase tracking-wide mb-1.5 sm:mb-2">Nova cobrança</p>
              <h2 className="text-[20px] sm:text-[22px] leading-[1] font-heading font-extrabold tracking-tight mb-1.5 sm:mb-2">
                Gere um link PIX único <br /> para cada cliente.
              </h2>
              <p className="text-[11px] sm:text-[12px] text-white/55 font-body leading-snug max-w-[320px]">
                Defina o valor, escolha produto cadastrado ou cobrança avulsa e compartilhe em segundos.
              </p>
            </div>
            <button
              id="tour-new-charge"
              onClick={openCreate}
              className="mt-3 sm:mt-5 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-[#9EEA6C] px-3.5 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-[12px] font-heading font-extrabold text-[#0a0a0a] hover:brightness-110 transition-all active:scale-[0.98] w-fit shadow-lg shadow-[#9EEA6C]/20"
            >
              Criar cobrança <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-[28px] border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-4 sm:p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <List size={15} weight="bold" className="text-[#0a0a0a] dark:text-white" />
              <h3 className="font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[15px] sm:text-[16px] leading-tight">Métodos de pagamento</h3>
            </div>
            <InfoButton text="Aqui você vê o volume total transacionado por cada método de pagamento." />
          </div>

          <div className="space-y-2 sm:space-y-3 flex-1">
            <PaymentMethodItem label="Pix QR Code" value={formatBRL(monthTotal)} dotColor="bg-[#9EEA6C]" />
            <PaymentMethodItem
              label="Pix pendente"
              value={formatBRL(pendingCharges.reduce((acc, curr) => acc + curr.amount_cents, 0))}
              dotColor="bg-amber-400"
            />
            <PaymentMethodItem label="Cartão de crédito" value="R$ 0,00" dotColor="bg-neutral-200" />
          </div>

          <div className="pt-3 sm:pt-4 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[13px] sm:text-[15px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">Total Bruto</span>
            </div>
            <span className="text-[15px] sm:text-[17px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">{formatBRL(monthTotal)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:gap-3 lg:grid-cols-2 mb-3 sm:mb-5">
        <div className="rounded-2xl sm:rounded-[28px] border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <ChartLineUp size={16} weight="bold" className="text-neutral-300 dark:text-white/10" />
              <h3 className="font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[14px] sm:text-[15px]">Desempenho (últimos 7 dias)</h3>
            </div>
            <InfoButton text="Gráfico do volume total de cobranças geradas em cada um dos últimos 7 dias." />
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis hide />
                <ChartTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0a0a0a] border border-white/10 p-2 rounded-lg shadow-xl">
                          <p className="text-[10px] font-heading font-black text-[#9EEA6C] uppercase tracking-wider">{payload[0].payload.name}</p>
                          <p className="text-[14px] font-heading font-black text-white">{formatBRL(payload[0].value as number * 100)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#9EEA6C' : '#ffffff10'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
            <span className="text-[18px] sm:text-[20px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">{formatBRL(monthTotal)}</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 dark:text-white/20 uppercase tracking-wide">Volume total criado</span>
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-[28px] border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <ChartPieSlice size={16} weight="bold" className="text-neutral-300 dark:text-white/10" />
              <h3 className="font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[14px] sm:text-[15px]">Distribuição por status</h3>
            </div>
            <InfoButton text="Proporção entre cobranças Pagas, Pendentes e Expiradas." />
          </div>
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0a0a0a] border border-white/10 p-2 rounded-lg shadow-xl">
                          <p className="text-[10px] font-heading font-black text-white uppercase tracking-wider">{payload[0].name}</p>
                          <p className="text-[14px] font-heading font-black text-[#9EEA6C]">{payload[0].value} cobranças</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2">
            {pieData.map(item => (
              <div key={item.name} className="text-center">
                <div className={`text-[12px] font-heading font-black text-[#0a0a0a] dark:text-white`}>{item.value}</div>
                <div className="text-[8px] font-bold text-neutral-400 dark:text-white/20 uppercase tracking-wide">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <span id="historico" className="block h-0" />
      <section id="tour-charges" className="rounded-2xl sm:rounded-[28px] border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] shadow-sm overflow-hidden mb-4 sm:mb-8">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 px-3 sm:px-5 py-3 sm:py-4">
          <div>
            <h2 className="text-[15px] sm:text-[16px] leading-tight font-heading font-extrabold text-[#0a0a0a] dark:text-white">Histórico de cobranças</h2>
            <p className="text-[8px] sm:text-[9px] font-medium text-neutral-400 dark:text-white/20 mt-0.5 uppercase tracking-wide">
              Todas as cobranças criadas, pagas, pendentes ou expiradas.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-lg bg-[#9EEA6C] px-2.5 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-heading font-extrabold text-[#0a0a0a] hover:brightness-110 transition-all shadow-sm"
          >
            Nova cobrança
          </button>
        </div>

        {charges.length === 0 ? (
          <div className="px-4 sm:px-5 py-8 sm:py-10 text-center flex flex-col items-center">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-neutral-50 dark:bg-white/5 flex items-center justify-center mb-2 sm:mb-3 text-neutral-200 dark:text-white/5">
              <QrCode size={22} />
            </div>
            <p className="text-[11px] sm:text-[12px] text-neutral-500 dark:text-white/30 font-body max-w-xs leading-snug">
              Nenhuma cobrança ainda. <br /> Crie seu primeiro link de pagamento para começar.
            </p>
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-50 dark:border-white/[0.02] text-[9px] sm:text-[10px] font-heading font-extrabold uppercase tracking-[0.08em] text-neutral-400 dark:text-white/20">
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3">Serviço / Cliente</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3">Status</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Bruto</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-red-400/50">Taxa (2%)</th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-[#9EEA6C]">Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-white/[0.02]">
                {charges.map((c) => (
                  <tr key={c.id} className="group hover:bg-neutral-50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                      <div className="font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[12px] sm:text-[13px]">{c.service_name}</div>
                      <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-400 dark:text-white/30 font-body">
                        {formatDateTime(c.created_at)} · {c.payer_name || "Cliente Final"}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-right font-heading font-bold text-neutral-400 dark:text-white/30 text-[11px] sm:text-[12px]">
                      {formatBRL(c.amount_cents)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-right font-heading font-bold text-red-500/40 text-[11px] sm:text-[12px]">
                      -{formatBRL(c.fee_cents)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-right font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[12px] sm:text-[13px]">
                      {formatBRL(c.net_amount_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-white/5 md:hidden">
            {charges.map((c) => (
              <div key={c.id} className="px-3 py-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="truncate font-heading font-extrabold text-[#0a0a0a] dark:text-white text-[14px]">{c.service_name}</div>
                    <div className="mt-0.5 text-[11px] text-neutral-400 dark:text-white/30 font-body">
                      {formatDateTime(c.created_at)}
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                
                <div className="bg-neutral-50 dark:bg-white/[0.02] rounded-xl p-3 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-[9px] uppercase font-black text-neutral-400 dark:text-white/20 tracking-tighter">Bruto</div>
                    <div className="text-[11px] font-bold text-neutral-500 dark:text-white/40">{formatBRL(c.amount_cents)}</div>
                  </div>
                  <div className="text-center border-x border-neutral-100 dark:border-white/5">
                    <div className="text-[9px] uppercase font-black text-red-400 dark:text-red-500/30 tracking-tighter">Taxas</div>
                    <div className="text-[11px] font-bold text-red-400/50">-{formatBRL(c.fee_cents)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] uppercase font-black text-[#9EEA6C] tracking-tighter">Líquido</div>
                    <div className="text-[12px] font-black text-[#0a0a0a] dark:text-white">{formatBRL(c.net_amount_cents)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </section>

      {showCreateModal && (
        <CreateChargeFlowModal
          onClose={closeCreate}
          onCreated={(charge) => {
            setCreatedCharge(charge);
            reload();
          }}
          createdCharge={createdCharge}
        />
      )}
    </Shell>
  );
}

function InfoButton({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setShow(!show)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        className="text-neutral-300 dark:text-white/10 hover:text-[#9EEA6C] transition-colors"
      >
        <Info size={16} />
      </button>
      {show && (
        <div className="absolute right-0 top-6 z-50 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-1">
          <p className="text-[10px] text-white/70 font-medium leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, subValue, info, icon: Icon, iconColor, bgColor }: any) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <p className="text-[9px] sm:text-[10px] font-heading font-extrabold text-neutral-400 dark:text-white/20 uppercase tracking-[0.06em]">{label}</p>
            <InfoButton text={info} />
          </div>
          <h3 className="text-[20px] sm:text-[22px] leading-none font-heading font-extrabold text-[#0a0a0a] dark:text-white tracking-tight">{value}</h3>
          <p className="text-[9px] sm:text-[10px] text-neutral-400 dark:text-white/20 font-bold mt-1 uppercase tracking-wide">{subValue}</p>
        </div>
        <div className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl ${bgColor} ${iconColor} shadow-inner`}>
          <Icon size={18} weight="bold" />
        </div>
      </div>
    </div>
  );
}

function PaymentMethodItem({ label, value, dotColor }: { label: string; value: string; dotColor: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-1.5 w-1.5 rounded-full ${dotColor} shadow-sm`} />
        <span className="text-[12px] sm:text-[13px] font-medium text-neutral-500 dark:text-white/40 font-body">{label}</span>
      </div>
      <span className="text-[12px] sm:text-[13px] font-heading font-bold text-[#0a0a0a] dark:text-white">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "paid" | "expired" }) {
  const map = {
    paid: {
      label: "Pago",
      icon: CheckCircle,
      cls: "bg-[#9EEA6C]/10 text-[#006400] border-[#9EEA6C]/30 dark:bg-[#9EEA6C]/20 dark:text-[#9EEA6C] dark:border-[#9EEA6C]/10",
    },
    pending: {
      label: "Pendente",
      icon: Clock,
      cls: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/10",
    },
    expired: {
      label: "Cancelada",
      icon: XCircle,
      cls: "bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-white/5 dark:text-white/40 dark:border-white/5",
    },
  }[status];

  const Icon = map.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] sm:text-[10px] font-heading font-extrabold uppercase tracking-wide ${map.cls}`}>
      <Icon size={12} weight="bold" />
      {map.label}
    </span>
  );
}



type FlowStep = "choose" | "product" | "custom" | "share";

function CreateChargeFlowModal({
  onClose,
  onCreated,
  createdCharge,
}: {
  onClose: () => void;
  onCreated: (c: Charge) => void;
  createdCharge: Charge | null;
}) {
  const { profile } = useAuth();
  const [step, setStep] = useState<FlowStep>("choose");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const [amountStr, setAmountStr] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!profile) return;
    api.listProductsByProfile(profile.id).then(setProducts);
  }, [profile?.id]);

  useEffect(() => {
    if (createdCharge) {
      setStep("share");
    }
  }, [createdCharge]);

  const chargeUrl = useMemo(() => {
    if (!createdCharge || !profile?.slug) return "";
    return `${window.location.origin}/${profile.slug}/${createdCharge.id}`;
  }, [createdCharge, profile?.slug]);

  async function createFromProduct() {
    console.log("[createFromProduct] Iniciando...", { slug: profile?.slug, selectedProductId, profileId: profile?.id });

    if (!profile?.slug) {
      setErrors({ slug: "Você precisa configurar seu link público primeiro. Acesse Configurações." });
      return;
    }
    if (!selectedProductId) {
      setErrors({ product: "Selecione um produto para continuar." });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const charge = await api.createChargeFromProduct({
        profile_id: profile.id,
        slug: profile.slug,
        product_id: selectedProductId,
        payer_name: sanitizeText(payerName, 80) || null,
        payer_cpf: profile.cpf,
        payer_email: profile.email,
        notes: sanitizeText(notes, 100) || null,
      });
      console.log("[createFromProduct] Cobrança criada:", charge);
      onCreated(charge);
    } catch (error: any) {
      console.error("[createFromProduct] Erro:", error);
      setErrors({ general: `Erro: ${error?.message || "Tente novamente."}` });
    } finally {
      setLoading(false);
    }
  }

  async function createCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.slug) return;

    const ev: Record<string, string> = {};
    const cents = parseBRLToCents(amountStr);
    if (cents < 100) ev.amount = "Valor mínimo de R$ 1,00.";
    if (sanitizeText(serviceName).length < 2) ev.serviceName = "Descreva o serviço.";
    setErrors(ev);
    if (Object.keys(ev).length > 0) return;

    setLoading(true);
    const charge = await api.createCharge({
      profile_id: profile.id,
      slug: profile.slug,
      amount_cents: cents,
      service_name: sanitizeText(serviceName, 60),
      description: null,
      payer_name: sanitizeText(payerName, 80) || null,
      payer_cpf: profile.cpf,
      payer_email: profile.email,
      notes: sanitizeText(notes, 100) || null,
    });
    setLoading(false);
    onCreated(charge);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl max-h-[92vh] overflow-auto rounded-t-3xl sm:rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#121212] p-4 sm:p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] sm:text-[20px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">
            {step === "share" ? "Compartilhar cobrança" : "Nova cobrança"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-white/60"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {step !== "share" && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setStep("product")}
              className={`rounded-xl border px-3 py-2 text-[11px] font-heading font-extrabold transition ${
                step === "product"
                  ? "border-[#9EEA6C] bg-[#9EEA6C]/20 text-[#0a0a0a] dark:text-white"
                  : "border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-white/60"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Package size={14} weight="bold" /> Produto cadastrado
              </span>
            </button>
            <button
              onClick={() => setStep("custom")}
              className={`rounded-xl border px-3 py-2 text-[11px] font-heading font-extrabold transition ${
                step === "custom"
                  ? "border-[#9EEA6C] bg-[#9EEA6C]/20 text-[#0a0a0a] dark:text-white"
                  : "border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-white/60"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <CurrencyCircleDollar size={14} weight="bold" /> Cobrança avulsa
              </span>
            </button>
          </div>
        )}

        {step === "choose" && (
          <div className="rounded-xl border border-dashed border-neutral-200 dark:border-white/10 p-4 text-center text-[12px] text-neutral-500 dark:text-white/50">
            Escolha acima se deseja cobrar um produto cadastrado ou criar uma cobrança avulsa.
          </div>
        )}

        {step === "product" && (
          <div className="space-y-3">
            <div className="max-h-56 overflow-auto rounded-xl border border-neutral-200 dark:border-white/10">
              {products.length === 0 ? (
                <div className="p-4 text-[12px] text-neutral-500 dark:text-white/50">
                  Nenhum produto cadastrado. Cadastre um produto primeiro na aba Produtos.
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100 dark:divide-white/5">
                  {products.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setErrors((prev) => ({ ...prev, product: "" }));
                        }}
                        className={`w-full px-3 py-2.5 text-left ${
                          selectedProductId === p.id ? "bg-[#9EEA6C]/15" : "hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="text-[13px] font-heading font-extrabold text-[#0a0a0a] dark:text-white">{p.name}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-white/50">{formatBRL(p.amount_cents)}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              placeholder="Nome do cliente (opcional)"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5 text-[12px] text-[#0a0a0a] dark:text-white"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
            />
            <textarea
              placeholder="Observações (opcional)"
              className="w-full min-h-[84px] rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5 text-[12px] text-[#0a0a0a] dark:text-white resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {errors.product && <p className="text-[11px] text-red-500 font-heading font-extrabold">{errors.product}</p>}
            {errors.slug && (
              <p className="text-[11px] text-red-500 font-heading font-extrabold">
                {errors.slug} <Link to="/configuracoes" className="underline text-[#9EEA6C]">Configurar agora</Link>
              </p>
            )}
            {errors.general && <p className="text-[11px] text-red-500 font-heading font-extrabold">{errors.general}</p>}

            <button
              onClick={createFromProduct}
              disabled={loading || products.length === 0}
              className="w-full rounded-xl bg-[#9EEA6C] py-2.5 text-[12px] font-heading font-extrabold text-[#0a0a0a] disabled:opacity-50"
            >
              {loading ? "Gerando..." : "Gerar cobrança do produto"}
            </button>
          </div>
        )}

        {step === "custom" && (
          <form onSubmit={createCustom} className="space-y-3">
            <input
              autoFocus
              placeholder="R$ 0,00"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5 text-[18px] font-heading font-extrabold text-[#0a0a0a] dark:text-white"
              value={amountStr}
              onChange={(e) => setAmountStr(maskBRLInput(e.target.value))}
            />
            {errors.amount && <p className="text-[11px] text-red-500 font-heading font-extrabold">{errors.amount}</p>}

            <input
              placeholder="Descrição do serviço"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5 text-[12px] text-[#0a0a0a] dark:text-white"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
            {errors.serviceName && <p className="text-[11px] text-red-500 font-heading font-extrabold">{errors.serviceName}</p>}

            <input
              placeholder="Nome do cliente (opcional)"
              className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5 text-[12px] text-[#0a0a0a] dark:text-white"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
            />

            <textarea
              placeholder="Observações (opcional)"
              className="w-full min-h-[84px] rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5 text-[12px] text-[#0a0a0a] dark:text-white resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#9EEA6C] py-2.5 text-[12px] font-heading font-extrabold text-[#0a0a0a] disabled:opacity-50"
            >
              {loading ? "Gerando..." : "Gerar cobrança avulsa"}
            </button>
          </form>
        )}

        {step === "share" && createdCharge && (
          <PaymentShareCard charge={createdCharge} paymentUrl={chargeUrl} />
        )}
      </div>
    </div>
  );
}
