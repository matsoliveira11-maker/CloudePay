import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { formatCPF, isValidCPF, isValidEmail, sanitizeText } from "../lib/validators";
import { 
  User, 
  EnvelopeSimple, 
  LockSimple, 
  IdentificationCard, 
  ArrowRight,
  Scissors, 
  Camera, 
  Barbell, 
  GraduationCap, 
  PawPrint, 
  QrCode, 
  LinkSimple, 
  CurrencyDollar, 
  WhatsappLogo, 
  ShieldCheck,
  House
} from "phosphor-react";

export default function Signup() {
  const nav = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (sanitizeText(full_name).length < 3) e.full_name = "Informe seu nome completo.";
    if (!isValidEmail(email)) e.email = "Email inválido.";
    if (password.length < 6) e.password = "Senha precisa ter ao menos 6 caracteres.";
    if (!isValidCPF(cpf)) e.cpf = "CPF inválido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    const res = await api.signUp({
      full_name: sanitizeText(full_name, 80),
      email,
      password,
      cpf,
    });
    setLoading(false);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    refresh();
    const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    nav(fromPath || "/painel", { replace: true });
  }

  return (
    <AuthShell 
      title={(
        <>
          Criar sua conta no <br/>
          <span className="text-lime-accent">CloudePay.</span>
        </>
      )} 
      subtitle="Em menos de 30 segundos você terá seu link pronto para receber."
    >
      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-5" noValidate>
        <div className="space-y-3 sm:space-y-4">
          {/* Nome */}
          <div className="group space-y-1.5">
            <label className="text-[11px] sm:text-[13px] font-medium text-white/40 ml-1">Nome completo</label>
            <div className="relative">
              <User size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lime-accent transition-colors" />
              <input
                type="text"
                placeholder="Seu nome"
                className={`w-full rounded-lg sm:rounded-xl border ${errors.full_name ? "border-red-500/50" : "border-white/5"} bg-white/[0.03] py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 text-[13px] sm:text-sm text-white placeholder:text-white/20 focus:border-lime-accent/30 focus:bg-white/[0.05] focus:outline-none transition-all`}
                value={full_name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            {errors.full_name && <p className="text-[11px] text-red-400 ml-1">{errors.full_name}</p>}
          </div>

          {/* Email */}
          <div className="group space-y-1.5">
            <label className="text-[11px] sm:text-[13px] font-medium text-white/40 ml-1">E-mail</label>
            <div className="relative">
              <EnvelopeSimple size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lime-accent transition-colors" />
              <input
                type="email"
                placeholder="voce@exemplo.com"
                className={`w-full rounded-lg sm:rounded-xl border ${errors.email ? "border-red-500/50" : "border-white/5"} bg-white/[0.03] py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 text-[13px] sm:text-sm text-white placeholder:text-white/20 focus:border-lime-accent/30 focus:bg-white/[0.05] focus:outline-none transition-all`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-[11px] text-red-400 ml-1">{errors.email}</p>}
          </div>

          {/* Senha */}
          <div className="group space-y-1.5">
            <label className="text-[11px] sm:text-[13px] font-medium text-white/40 ml-1">Crie uma senha</label>
            <div className="relative">
              <LockSimple size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lime-accent transition-colors" />
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                className={`w-full rounded-lg sm:rounded-xl border ${errors.password ? "border-red-500/50" : "border-white/5"} bg-white/[0.03] py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 text-[13px] sm:text-sm text-white placeholder:text-white/20 focus:border-lime-accent/30 focus:bg-white/[0.05] focus:outline-none transition-all`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {errors.password && <p className="text-[11px] text-red-400 ml-1">{errors.password}</p>}
          </div>

          {/* CPF */}
          <div className="group space-y-1.5">
            <label className="text-[11px] sm:text-[13px] font-medium text-white/40 ml-1">Seu CPF</label>
            <div className="relative">
              <IdentificationCard size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lime-accent transition-colors" />
              <input
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                className={`w-full rounded-lg sm:rounded-xl border ${errors.cpf ? "border-red-500/50" : "border-white/5"} bg-white/[0.03] py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 text-[13px] sm:text-sm text-white placeholder:text-white/20 focus:border-lime-accent/30 focus:bg-white/[0.05] focus:outline-none transition-all`}
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                autoComplete="off"
              />
            </div>
            {errors.cpf && <p className="text-[11px] text-red-400 ml-1">{errors.cpf}</p>}
          </div>
        </div>

        {serverError && (
          <div className="rounded-lg sm:rounded-xl border border-red-500/20 bg-red-500/10 px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-sm text-red-400">
            {serverError}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-lime-accent py-3 sm:py-4 text-[13px] sm:text-sm font-heading font-bold text-[#0a0a0a] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "Criando..." : "Começar agora"}
          <ArrowRight size={16} weight="bold" />
        </button>

        <p className="text-center text-[13px] sm:text-sm text-white/40 font-body">
          Já tem conta?{" "}
          <Link to="/entrar" className="font-bold text-white hover:text-lime-accent transition-colors">
            Fazer login
          </Link>
        </p>

        <p className="mt-4 sm:mt-6 text-center text-[9px] sm:text-[10px] leading-snug sm:leading-relaxed text-white/20 font-body px-3 sm:px-8">
          Ao se cadastrar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string | React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative selection:bg-lime-accent/30 selection:text-lime-accent">
      {/* Background Grid & Glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-accent/10 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-brand-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
        {/* Left Chips (Desktop Only) */}
        <div className="absolute left-12 top-1/2 hidden -translate-y-1/2 flex-col gap-12 lg:flex">
          <FloatingChip icon={Scissors} label="Cabeleireiro" delay="0s" x={20} />
          <FloatingChip icon={Camera} label="Fotógrafo" delay="1s" x={-10} />
          <FloatingChip icon={Barbell} label="Personal" delay="0.5s" x={30} />
          <FloatingChip icon={GraduationCap} label="Professor" delay="1.5s" x={-20} />
          <FloatingChip icon={PawPrint} label="Pet Sitter" delay="0.8s" x={10} />
        </div>

        {/* Right Chips (Desktop Only) */}
        <div className="absolute right-12 top-1/2 hidden -translate-y-1/2 flex-col gap-10 items-end lg:flex">
          <FloatingChip icon={QrCode} label="PIX Instantâneo" delay="0.2s" x={-10} accent />
          <FloatingChip icon={LinkSimple} label="Link Único" delay="1.2s" x={15} />
          <FloatingChip icon={CurrencyDollar} label="Taxa 2%" delay="0.7s" x={-25} accent />
          <FloatingChip icon={WhatsappLogo} label="WhatsApp" delay="1.8s" x={10} />
          <FloatingChip icon={ShieldCheck} label="Seguro" delay="0.4s" x={-15} accent />
          <FloatingChip icon={House} label="Painel" delay="1s" x={20} />
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-[440px] sm:max-w-[480px]">
          <div className="rounded-2xl sm:rounded-[32px] border border-white/10 bg-[#121212]/80 p-4 sm:p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            <header className="text-center mb-4 sm:mb-8">
              <h1 className="text-[30px] leading-[0.95] sm:text-3xl font-heading font-extrabold tracking-tight text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 sm:mt-3 text-[12px] sm:text-sm text-white/50 font-body leading-snug sm:leading-relaxed max-w-[280px] sm:max-w-[300px] mx-auto">
                  {subtitle}
                </p>
              )}
            </header>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingChip({ 
  icon: Icon, 
  label, 
  delay = "0s", 
  x = 0, 
  accent = false 
}: { 
  icon: any, 
  label: string, 
  delay?: string, 
  x?: number, 
  accent?: boolean 
}) {
  return (
    <div 
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-white/60 shadow-xl backdrop-blur-sm animate-float-slow"
      style={{ animationDelay: delay, transform: `translateX(${x}px)` }}
    >
      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${accent ? "bg-lime-accent/20 text-lime-accent" : "bg-white/10 text-white/40"}`}>
        <Icon size={12} weight="duotone" />
      </div>
      {label}
    </div>
  );
}


