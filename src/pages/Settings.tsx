import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import Shell from "../components/Shell";
import { LinkIcon, ArrowIcon } from "../components/Icons";

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9f1239]">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-[#9f1239]/80">{hint}</p>}
    </div>
  );
}

// --- Page Component ---

export default function Settings() {
  const { profile, refresh } = useAuth();
  const [loading, setLoading] = useState(false);


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
      alert("Perfil atualizado!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleConnectMP = () => {
    const clientId = (import.meta as any).env.VITE_MP_CLIENT_ID;
    const redirectUri = (import.meta as any).env.VITE_REDIRECT_URI;
    const authUrl = `https://auth.mercadopago.com.br/authorization?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read%20write%20offline_access&state=${profile?.id}`;
    window.location.href = authUrl;
  };

  const isConnected = !!profile?.mp_access_token;

  return (
    <Shell>
      <div className="space-y-5 sm:space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e11d48]">Meu perfil</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.065em] text-[#4c0519] sm:text-5xl">Sua conta, seus dados.</h1>
          <p className="mt-4 max-w-[560px] text-base leading-7 text-[#881337]">Atualize suas informações, seu slug público e conecte sua conta do Mercado Pago.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="rounded-3xl border border-[#fecdd3] bg-white p-4 shadow-[0_14px_36px_rgba(136,19,55,0.06)] sm:p-6 sm:shadow-[0_18px_50px_rgba(136,19,55,0.07)]">
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#4c0519]">Informações pessoais</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleUpdate}>
              <Field label="Nome completo" id="perfil-nome">
                <input className="auth-input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </Field>
              <Field label="Email" id="perfil-email">
                <input className="auth-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </Field>
              <Field label="Slug da conta" id="perfil-slug" hint="Esse é seu endereço público de cobrança.">
                <input className="auth-input" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </Field>
              <Field label="Link público" id="perfil-link">
                <input className="auth-input" readOnly value={`${window.location.origin}/${formData.slug}`} />
              </Field>
              <div className="md:col-span-2">
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-[#e11d48] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(225,29,72,0.28)] transition hover:-translate-y-0.5">
                  {loading ? "Atualizando..." : "Atualizar dados"} <ArrowIcon />
                </button>
              </div>
            </form>
          </section>
          <section className="rounded-3xl border border-[#fecdd3] bg-[#4c0519] p-4 text-white shadow-[0_18px_50px_rgba(76,5,25,0.18)] sm:p-6 sm:shadow-[0_24px_70px_rgba(76,5,25,0.2)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#fb7185]"><LinkIcon className="h-5 w-5" /></span>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">Conectar Mercado Pago</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">Conecte sua conta para receber pagamentos PIX com confirmação automática, webhook validado e conciliação no painel.</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-white/75">
              <p>Status: <span className="font-semibold text-[#fb7185]">{isConnected ? "conectado" : "não conectado"}</span></p>
              <p className="mt-1">Conta: {isConnected ? "autorizada" : "aguardando autorização"}</p>
            </div>
            <button type="button" onClick={handleConnectMP} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-[#4c0519] transition hover:-translate-y-0.5">
              {isConnected ? "Trocar conta" : "Conectar conta"} <ArrowIcon />
            </button>
          </section>
        </div>
      </div>
    </Shell>
  );
}
