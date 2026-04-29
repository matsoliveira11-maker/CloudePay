import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle, 
  ArrowSquareOut,
  Warning
} from "phosphor-react";

export default function Settings() {
  const { profile } = useAuth();

  const handleConnectMP = () => {
    const clientId = (import.meta as any).env.VITE_MP_CLIENT_ID;
    const redirectUri = encodeURIComponent((import.meta as any).env.VITE_REDIRECT_URI);
    
    // URL simplificada
    const authUrl = `https://auth.mercadopago.com.br/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${redirectUri}&scope=read,write,offline_access&state=${profile?.id}`;
    
    window.location.href = authUrl;
  };

  const isConnected = !!profile?.mp_access_token;

  return (
    <Shell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-10">
          <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 dark:text-white/30 font-body mb-1 uppercase tracking-widest">Painel de Controle</p>
          <h1 className="text-[28px] sm:text-[36px] leading-tight font-heading font-black text-[#0a0a0a] dark:text-white uppercase tracking-tighter">
            Meu Perfil
          </h1>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* SEÇÃO: CONTA */}
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/5 rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-[#0a0a0a] dark:text-white border border-neutral-200 dark:border-white/10 shadow-inner">
                <User size={24} weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-black text-[#0a0a0a] dark:text-white uppercase tracking-tight">Informações Pessoais</h2>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-white/30 font-bold uppercase tracking-wide">Dados da sua conta CloudePay</p>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div className="bg-neutral-50 dark:bg-white/[0.02] rounded-2xl p-4 border border-neutral-100 dark:border-white/[0.03]">
                <label className="text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-2 block">Nome de exibição</label>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#9EEA6C] flex items-center justify-center text-[12px] font-black text-[#0a0a0a] uppercase shadow-sm">
                    {profile?.full_name?.charAt(0)}
                  </div>
                  <p className="text-[14px] sm:text-[16px] text-[#0a0a0a] dark:text-white font-heading font-extrabold">{profile?.full_name}</p>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-white/[0.02] rounded-2xl p-4 border border-neutral-100 dark:border-white/[0.03]">
                <label className="text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-2 block">E-mail de acesso</label>
                <p className="text-[14px] sm:text-[15px] text-neutral-600 dark:text-white/60 font-body">{profile?.email}</p>
              </div>

              <div className="bg-[#9EEA6C]/5 rounded-2xl p-4 border border-[#9EEA6C]/10">
                <label className="text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-widest text-[#9EEA6C]/60 mb-2 block">Link da sua página</label>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] sm:text-[14px] text-[#0a0a0a] dark:text-white font-heading font-bold lowercase tracking-tight">
                    cloudepay.app/<span className="text-[#9EEA6C]">{profile?.slug}</span>
                  </p>
                  <button className="text-[#9EEA6C] hover:brightness-110 transition-all p-1.5 rounded-lg bg-white dark:bg-white/5 border border-[#9EEA6C]/20 shadow-sm">
                    <ArrowSquareOut size={16} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO: PAGAMENTO */}
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/5 rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] h-40 w-40 rounded-full bg-[#009EE3]/5 blur-[60px]" />
            
            <div className="flex items-center gap-3 mb-6 sm:mb-8 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#009EE3]/10 flex items-center justify-center text-[#009EE3] border border-[#009EE3]/20 shadow-inner">
                <CreditCard size={24} weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-black text-[#0a0a0a] dark:text-white uppercase tracking-tight">Pagamentos</h2>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-white/30 font-bold uppercase tracking-wide">Integração Mercado Pago</p>
              </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
              {!isConnected ? (
                <div className="space-y-6 sm:space-y-8">
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 sm:p-5 flex gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Warning size={20} weight="fill" className="text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-[12px] sm:text-[13px] font-heading font-black text-amber-600 dark:text-amber-500 uppercase tracking-tight mb-1">CONEXÃO PENDENTE</h3>
                      <p className="text-[11px] sm:text-[12px] text-amber-600/70 dark:text-amber-500/40 leading-relaxed font-medium">
                        Conecte sua conta para começar a vender. O dinheiro cai direto no seu Mercado Pago e CloudePay faz o split automático.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleConnectMP}
                      className="group relative w-full overflow-hidden bg-[#009EE3] hover:brightness-110 text-white rounded-2xl py-4 font-heading font-black uppercase tracking-[0.2em] text-[11px] sm:text-[12px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#009EE3]/20 active:scale-[0.98]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <ArrowSquareOut size={20} weight="bold" />
                      Conectar Mercado Pago
                    </button>
                    <p className="text-[9px] text-center text-neutral-300 dark:text-white/10 uppercase font-heading font-black tracking-[0.3em] flex items-center justify-center gap-2">
                      <ShieldCheck size={14} weight="bold" className="text-emerald-500" /> Ambiente Criptografado
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[28px] p-6 sm:p-8 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                        <CheckCircle size={36} weight="bold" className="text-white" />
                      </div>
                      <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-[#009EE3] border-4 border-white dark:border-[#121212] flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    </div>
                    <h3 className="text-[16px] sm:text-[18px] text-emerald-600 dark:text-emerald-400 font-heading font-black uppercase tracking-tight">GATEWAY ATIVO</h3>
                    <p className="text-[11px] sm:text-[12px] text-emerald-600/50 dark:text-emerald-400/30 max-w-[200px] mt-2 font-medium">Suas vendas estão sendo processadas via Mercado Pago.</p>
                  </div>

                  <button 
                    onClick={handleConnectMP}
                    className="w-full text-[10px] font-heading font-black text-neutral-400 hover:text-[#009EE3] dark:text-white/20 dark:hover:text-[#009EE3] uppercase tracking-[0.2em] transition-colors py-2 border-t border-neutral-100 dark:border-white/5"
                  >
                    Trocar de conta conectada
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-10 p-5 sm:p-6 bg-[#0a0a0a] dark:bg-white/5 rounded-[28px] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#9EEA6C]/10 flex items-center justify-center text-[#9EEA6C]">
              <ShieldCheck size={20} weight="bold" />
            </div>
            <div>
              <p className="text-[13px] font-heading font-black text-white uppercase tracking-tight leading-none">Segurança Total</p>
              <p className="text-[11px] text-white/40 font-medium mt-1">Seus tokens são criptografados e nunca expostos.</p>
            </div>
          </div>
          <button className="text-[10px] font-heading font-black text-white/40 hover:text-red-400 uppercase tracking-widest transition-colors">
            Sair da conta
          </button>
        </div>
      </div>
    </Shell>
  );
}
