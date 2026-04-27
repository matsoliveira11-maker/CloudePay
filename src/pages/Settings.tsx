import { useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { 
  User, 
  CreditCard, 
  Storefront, 
  ShieldCheck, 
  CheckCircle, 
  ArrowSquareOut,
  Warning
} from "phosphor-react";

export default function Settings() {
  const { profile, reloadProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConnectMP = () => {
    const clientId = import.meta.env.VITE_MP_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URI);
    
    // URL de autorização do Mercado Pago
    // state: passamos o ID do perfil para saber quem está conectando no retorno
    const authUrl = `https://auth.mercadopago.com.br/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${redirectUri}&state=${profile?.id}`;
    
    window.location.href = authUrl;
  };

  const isConnected = !!profile?.mp_access_token;

  return (
    <Shell>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-black text-[#0a0a0a] dark:text-white uppercase tracking-tight">Configurações</h1>
          <p className="text-neutral-400 dark:text-white/40 text-sm">Gerencie seu perfil e conexões de pagamento.</p>
        </div>

        <div className="space-y-6">
          {/* SEÇÃO: CONTA */}
          <div className="bg-white dark:bg-white/5 border border-neutral-100 dark:border-white/5 rounded-[32px] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <User size={24} weight="bold" className="text-blue-500" />
              </div>
              <h2 className="text-xl font-heading font-bold text-[#0a0a0a] dark:text-white">Perfil</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-1 block">Nome Completo</label>
                <p className="text-neutral-600 dark:text-white/70 font-medium">{profile?.full_name}</p>
              </div>
              <div>
                <label className="text-[10px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-1 block">Email</label>
                <p className="text-neutral-600 dark:text-white/70 font-medium">{profile?.email}</p>
              </div>
              <div>
                <label className="text-[10px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-1 block">Slug do Link</label>
                <p className="text-neutral-600 dark:text-white/70 font-medium">cloudepay.app/{profile?.slug}</p>
              </div>
            </div>
          </div>

          {/* SEÇÃO: PAGAMENTO (O CORAÇÃO) */}
          <div className="bg-white dark:bg-white/5 border border-neutral-100 dark:border-white/5 rounded-[32px] p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#9EEA6C]/10 flex items-center justify-center">
                <CreditCard size={24} weight="bold" className="text-[#9EEA6C]" />
              </div>
              <h2 className="text-xl font-heading font-bold text-[#0a0a0a] dark:text-white">Pagamentos</h2>
            </div>

            {!isConnected ? (
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4">
                  <Warning size={24} weight="fill" className="text-amber-500 shrink-0" />
                  <div>
                    <h3 className="text-sm font-heading font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tight">Conexão Pendente</h3>
                    <p className="text-xs text-amber-600/80 dark:text-amber-500/60 leading-relaxed mt-1">
                      Você precisa conectar sua conta do Mercado Pago para receber pagamentos reais. 
                      O dinheiro das vendas cairá direto na sua conta.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleConnectMP}
                  className="w-full bg-[#009EE3] hover:bg-[#008ED1] text-white rounded-2xl py-4 font-heading font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98]"
                >
                  <ArrowSquareOut size={20} weight="bold" />
                  Conectar Mercado Pago
                </button>
                
                <p className="text-[10px] text-center text-neutral-400 dark:text-white/20 uppercase font-heading font-bold tracking-[0.2em]">
                  🔒 Conexão Segura via Mercado Pago
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle size={28} weight="bold" className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-emerald-600 dark:text-emerald-400 font-heading font-black uppercase tracking-tight">Mercado Pago Conectado</h3>
                      <p className="text-xs text-emerald-600/60 dark:text-emerald-400/40">Suas vendas agora são reais e automáticas.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={handleConnectMP}
                    className="text-[10px] font-heading font-black text-neutral-400 hover:text-neutral-600 dark:text-white/20 dark:hover:text-white/40 uppercase tracking-widest transition-colors"
                  >
                    Alterar ou reconectar conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
