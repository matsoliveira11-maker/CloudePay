import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { 
  User, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle, 
  ArrowSquareOut,
  Warning,
  PencilSimple,
  X,
  FloppyDisk,
  Link as LinkIcon
} from "phosphor-react";

// Função simples para formatar CPF na tela
function formatCPF(val: string) {
  const digits = val.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").slice(0, 14);
}

export default function Settings() {
  const { profile, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    cpf: "",
    slug: "",
    password: "",
  });

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        cpf: formatCPF(profile.cpf || ""),
        slug: profile.slug || "",
        password: "", // Mantém em branco, só altera se digitar
      });
    }
  }, [profile, isEditing]);

  const handleConnectMP = () => {
    const clientId = (import.meta as any).env.VITE_MP_CLIENT_ID;
    const redirectUri = (import.meta as any).env.VITE_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      alert("Erro de configuração: Variáveis de ambiente não encontradas na Vercel.");
      return;
    }

    const encodedRedirect = encodeURIComponent(redirectUri);
    const authUrl = `https://auth.mercadopago.com.br/authorization?client_id=${clientId}&response_type=code&redirect_uri=${encodedRedirect}&scope=read%20write%20offline_access&state=${profile?.id}`;
    
    window.location.href = authUrl;
  };

  const handleSave = async () => {
    if (!profile) return;
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // 1. Tratamento de Slug: forçar minúsculas e trocar espaços/caracteres por traços
      let finalSlug = formData.slug.trim().toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // 2. Verificar se o slug está disponível
      if (finalSlug && finalSlug !== profile.slug) {
        const isAvailable = await api.isSlugAvailable(finalSlug, profile.id);
        if (!isAvailable) {
          throw new Error("Este link público já está em uso por outra conta. Escolha outro.");
        }
      }

      // 3. Modificações de Auth (Senha / Email)
      const emailChanged = formData.email !== profile.email;
      const passwordChanged = formData.password.trim() !== "";
      
      if (emailChanged || passwordChanged) {
        const authRes = await api.updateAuthCredentials(
          emailChanged ? formData.email : undefined,
          passwordChanged ? formData.password : undefined
        );
        if (!authRes.ok) {
          throw new Error(`Erro ao atualizar credenciais: ${authRes.error}`);
        }
      }

      // 4. Salvar tudo no Profile
      const patch = {
        full_name: formData.full_name.trim(),
        cpf: formData.cpf.replace(/\D/g, ""),
        slug: finalSlug || null,
        ...(emailChanged ? { email: formData.email } : {})
      };

      const res = await api.updateProfile(profile.id, patch);
      if (!res.ok) throw new Error(`Erro ao salvar dados do perfil: ${res.error}`);

      setSuccess("Dados atualizados com sucesso!");
      setIsEditing(false);
      await refresh();

    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao tentar salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
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
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/5 rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-sm flex flex-col relative">
            <div className="flex items-start justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-[#0a0a0a] dark:text-white border border-neutral-200 dark:border-white/10 shadow-inner">
                  <User size={24} weight="duotone" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-black text-[#0a0a0a] dark:text-white uppercase tracking-tight">Informações Pessoais</h2>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-white/30 font-bold uppercase tracking-wide">Dados da sua conta CloudePay</p>
                </div>
              </div>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-500 hover:text-[#0a0a0a] dark:text-white/60 dark:hover:text-white transition-colors"
                  title="Editar Dados"
                >
                  <PencilSimple size={16} weight="bold" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  title="Cancelar Edição"
                >
                  <X size={16} weight="bold" />
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-heading font-extrabold flex items-center gap-2">
                <Warning size={16} weight="bold" /> {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[11px] font-heading font-extrabold flex items-center gap-2">
                <CheckCircle size={16} weight="bold" /> {success}
              </div>
            )}

            {!isEditing ? (
              // MODO DE VISUALIZAÇÃO
              <div className="space-y-6 flex-1">
                <div className="bg-neutral-50 dark:bg-white/[0.02] rounded-2xl p-4 border border-neutral-100 dark:border-white/[0.03]">
                  <label className="text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-2 block">Nome de exibição</label>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#9EEA6C] flex items-center justify-center text-[12px] font-black text-[#0a0a0a] uppercase shadow-sm shrink-0">
                      {profile?.full_name?.charAt(0)}
                    </div>
                    <p className="text-[14px] sm:text-[16px] text-[#0a0a0a] dark:text-white font-heading font-extrabold truncate">
                      {profile?.full_name}
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-white/[0.02] rounded-2xl p-4 border border-neutral-100 dark:border-white/[0.03] grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-2 block">CPF</label>
                    <p className="text-[12px] sm:text-[14px] text-[#0a0a0a] dark:text-white font-heading font-bold">{formatCPF(profile?.cpf || "") || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-widest text-neutral-400 dark:text-white/20 mb-2 block">E-mail de acesso</label>
                    <p className="text-[12px] sm:text-[14px] text-[#0a0a0a] dark:text-white font-heading font-bold truncate">{profile?.email}</p>
                  </div>
                </div>

                <div className="bg-[#9EEA6C]/5 rounded-2xl p-4 border border-[#9EEA6C]/10">
                  <label className="text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-widest text-[#9EEA6C]/60 mb-2 flex items-center gap-1.5">
                    <LinkIcon size={12} weight="bold" /> Link da sua página
                  </label>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] sm:text-[14px] text-[#0a0a0a] dark:text-white font-heading font-bold lowercase tracking-tight truncate">
                      cloudepay.app/<span className="text-[#9EEA6C]">{profile?.slug || "seu-link"}</span>
                    </p>
                    {profile?.slug && (
                      <button 
                        onClick={() => window.open(`/${profile.slug}`, '_blank')}
                        className="text-[#9EEA6C] hover:brightness-110 transition-all p-1.5 rounded-lg bg-white dark:bg-white/5 border border-[#9EEA6C]/20 shadow-sm shrink-0"
                      >
                        <ArrowSquareOut size={16} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // MODO DE EDIÇÃO
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-[10px] font-heading font-black uppercase tracking-widest text-neutral-500 dark:text-white/40 mb-1.5 block">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#0a0a0a] dark:text-white focus:border-[#9EEA6C] outline-none transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-heading font-black uppercase tracking-widest text-neutral-500 dark:text-white/40 mb-1.5 block">CPF</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                      className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#0a0a0a] dark:text-white focus:border-[#9EEA6C] outline-none transition-colors"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-heading font-black uppercase tracking-widest text-neutral-500 dark:text-white/40 mb-1.5 block">E-mail</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#0a0a0a] dark:text-white focus:border-[#9EEA6C] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#9EEA6C]/5 border border-[#9EEA6C]/20 rounded-xl">
                  <label className="text-[10px] font-heading font-black uppercase tracking-widest text-[#9EEA6C] mb-1.5 block">Seu Link Público Único</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-black/20 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus-within:border-[#9EEA6C] transition-colors">
                    <span className="text-[13px] font-medium text-neutral-400 dark:text-white/30 hidden sm:inline">cloudepay.app/</span>
                    <span className="text-[13px] font-medium text-neutral-400 dark:text-white/30 sm:hidden">/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                      placeholder="minha-loja"
                      className="w-full bg-transparent text-[13px] font-bold text-[#0a0a0a] dark:text-white outline-none"
                    />
                  </div>
                  <p className="text-[9px] text-neutral-500 dark:text-white/40 mt-1.5">Apenas letras minúsculas, números e traços. Ex: minha-loja-123</p>
                </div>

                <div>
                  <label className="text-[10px] font-heading font-black uppercase tracking-widest text-neutral-500 dark:text-white/40 mb-1.5 block">Nova Senha</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Deixe em branco para não alterar"
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#0a0a0a] dark:text-white focus:border-[#9EEA6C] outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-[#9EEA6C] text-[#0a0a0a] font-heading font-extrabold uppercase text-[12px] py-3 rounded-xl hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? "Salvando..." : <><FloppyDisk size={18} weight="bold" /> Salvar Alterações</>}
                </button>
              </div>
            )}
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
          <button 
            onClick={handleLogout}
            className="text-[10px] font-heading font-black text-white/40 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </Shell>
  );
}
