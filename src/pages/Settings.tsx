import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import Shell from "../components/Shell";
import { cn } from "../lib/utils";
import { Camera, ArrowRight, LinkBreak, CheckCircle, Globe, Envelope, User } from "phosphor-react";
import toast from "react-hot-toast";

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#8c8c8c]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#8c8c8c]">{hint}</p>}
    </div>
  );
}

export default function Settings() {
  const { profile, refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    slug: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        slug: profile.slug || "",
      });
    }
  }, [profile]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await api.updateProfile(profile.id, {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      });
      await refresh();
      toast.success("Perfil atualizado com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploading(true);
    const tid = toast.loading("Enviando imagem...");
    try {
      await api.uploadAvatar(profile.id, file);
      await refresh();
      toast.success("Logo atualizada!", { id: tid });
    } catch (err: any) {
      toast.error("Erro ao enviar: " + err.message, { id: tid });
    } finally {
      setUploading(false);
    }
  }

  const handleConnectMP = () => {
    const clientId = (import.meta as any).env.VITE_MP_CLIENT_ID;
    const redirectUri = window.location.origin + "/auth/callback";
    const authUrl = `https://auth.mercadopago.com.br/authorization?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read%20write%20offline_access&state=${profile?.id}`;
    window.location.href = authUrl;
  };

  const isConnected = !!profile?.mp_access_token;

  return (
    <Shell>
      <div className="space-y-8 a-fade pb-10">
        {/* Header Section */}
        <div>
           <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8c8c8c]">Personalização</p>
           <h1 className="text-[24px] lg:text-[28px] font-bold tracking-[-0.03em] text-[#1a1a2e] leading-tight mt-0.5">Configurações da Conta</h1>
           <p className="text-[14px] text-[#71717a] mt-1.5">Gerencie seus dados, sua marca e conexões de pagamento.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
          {/* Main Profile Settings */}
          <section className="a-up-1">
             <div className="rounded-[18px] bg-white p-6 lg:p-8 shadow-sm border border-[#e8e8ec]">
                
                {/* Branding Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                   <div className="relative group">
                      <div className="h-24 w-24 overflow-hidden rounded-[24px] border-4 border-[#f8f7f5] bg-white shadow-md transition-all group-hover:shadow-lg">
                          {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="Logo" className="h-full w-full object-cover" />
                          ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e11d48] to-[#be123c] text-2xl font-black text-white">
                                  {profile?.full_name?.slice(0, 2).toUpperCase()}
                              </div>
                          )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-[#e11d48] text-white shadow-lg transition hover:scale-110 active:scale-95">
                          <Camera size={18} weight="bold" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                      </label>
                   </div>
                   <div className="text-center sm:text-left">
                      <h2 className="text-[18px] font-bold text-[#1a1a2e]">Identidade Visual</h2>
                      <p className="text-[14px] text-[#8c8c8c] mt-1">Esta logo será exibida nos seus links de pagamento.</p>
                   </div>
                </div>

                <hr className="mb-8 border-[#e8e8ec]" />

                {/* Form Section */}
                <form className="grid gap-6 md:grid-cols-2" onSubmit={handleUpdate}>
                   <div className="md:col-span-2">
                      <h3 className="text-[15px] font-bold text-[#1a1a2e] mb-5">Dados Cadastrais</h3>
                   </div>
                   <Field label="Nome completo" id="perfil-nome">
                      <div className="relative">
                         <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c]" />
                         <input 
                           className="w-full bg-[#f8f7f5] border border-transparent rounded-xl py-3.5 pl-11 pr-4 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none" 
                           value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                      </div>
                   </Field>
                   <Field label="E-mail de contato" id="perfil-email">
                      <div className="relative">
                         <Envelope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c]" />
                         <input 
                           className="w-full bg-[#f8f7f5] border border-transparent rounded-xl py-3.5 pl-11 pr-4 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none" 
                           value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                   </Field>
                   <Field label="Slug personalizado" id="perfil-slug" hint="Ex: cloudepay.com.br/seu-nome">
                      <div className="relative">
                         <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c]" />
                         <input 
                           className="w-full bg-[#f8f7f5] border border-transparent rounded-xl py-3.5 pl-11 pr-4 text-[13px] font-bold focus:bg-white focus:border-[#e11d48] transition-all outline-none" 
                           value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                      </div>
                   </Field>
                   <Field label="Seu link público" id="perfil-link">
                      <input 
                        className="w-full bg-[#f8f7f5] border border-[#e8e8ec] rounded-xl py-3.5 px-4 text-[13px] font-medium text-[#8c8c8c] outline-none" 
                        readOnly value={`${window.location.origin}/${formData.slug}`} />
                   </Field>
                   <div className="md:col-span-2 pt-4">
                      <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#e11d48] px-8 py-4 text-[13px] font-bold text-white shadow-lg shadow-rose-100 hover:bg-[#be123c] transition-all active:scale-[0.97]">
                         {loading ? "Salvando..." : "Salvar Alterações"}
                         <ArrowRight size={16} weight="bold" />
                      </button>
                   </div>
                </form>
             </div>
          </section>

          {/* Connection Card */}
          <section className="a-up-2">
             <div className="rounded-[18px] bg-[#1a1a2e] p-8 text-white shadow-xl">
                <div className="h-12 w-12 flex items-center justify-center rounded-[14px] bg-white/10 text-[#e11d48] mb-6">
                   <LinkBreak size={24} weight="bold" />
                </div>
                <h2 className="text-[22px] font-bold tracking-tight mb-3">Gateway de Pagamento</h2>
                <p className="text-[14px] text-white/60 leading-relaxed mb-8">
                   Conecte sua conta do Mercado Pago para habilitar transações automáticas e recebimento instantâneo.
                </p>

                <div className="space-y-4 mb-8">
                   <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                         <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-amber-500")} />
                         <span className="text-[12px] font-medium text-white/80">Status da Conexão</span>
                      </div>
                      <span className={cn("text-[11px] font-bold uppercase tracking-wider", isConnected ? "text-emerald-500" : "text-amber-500")}>
                         {isConnected ? "Ativo" : "Pendente"}
                      </span>
                   </div>
                   {isConnected && (
                      <div className="flex items-center gap-2 px-4 text-emerald-500">
                         <CheckCircle size={14} weight="bold" />
                         <span className="text-[12px] font-bold uppercase tracking-wider">Conta Validada</span>
                      </div>
                   )}
                </div>

                <button 
                  type="button" 
                  onClick={handleConnectMP} 
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-[13px] font-bold transition-all active:scale-[0.97]",
                    isConnected ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-[#1a1a2e] hover:bg-gray-100 shadow-lg"
                  )}
                >
                   {isConnected ? "Alternar Conta" : "Conectar agora"}
                   <ArrowRight size={16} weight="bold" />
                </button>
             </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
