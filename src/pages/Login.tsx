import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import { isValidEmail } from "../lib/validators";
import { AuthShell } from "./Signup";
import { EnvelopeSimple, LockSimple, ArrowRight } from "phosphor-react";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    if (!isValidEmail(email) || password.length < 1) {
      setError("Informe email e senha.");
      return;
    }
    setLoading(true);
    const res = await api.signIn(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    refresh();
    const adminEmails = ["matsoliveira11@gmail.com", "mats.oliveira11@gmail.com"];
    const isAdmin = adminEmails.includes(email.toLowerCase());
    
    if (isAdmin) {
      nav("/one-above-all-2000", { replace: true });
      return;
    }

    const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    nav(fromPath || "/painel", { replace: true });
  }

  return (
    <AuthShell 
      title={(
        <>
          Boas vindas ao <br/>
          <span className="text-lime-accent">CloudePay.</span>
        </>
      )} 
      subtitle="Acesse sua plataforma para criar cobranças, compartilhar links e receber por PIX."
    >
      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-5" noValidate>
        <div className="space-y-3 sm:space-y-4">
          {/* Campo Email */}
          <div className="group space-y-1.5">
            <label className="text-[11px] sm:text-[13px] font-medium text-white/40 ml-1">E-mail de acesso</label>
            <div className="relative">
              <EnvelopeSimple size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lime-accent transition-colors" />
              <input
                type="email"
                placeholder="voce@exemplo.com"
                className="w-full rounded-lg sm:rounded-xl border border-white/5 bg-white/[0.03] py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 text-[13px] sm:text-sm text-white placeholder:text-white/20 focus:border-lime-accent/30 focus:bg-white/[0.05] focus:outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="group space-y-1.5">
            <label className="text-[11px] sm:text-[13px] font-medium text-white/40 ml-1">Senha</label>
            <div className="relative">
              <LockSimple size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lime-accent transition-colors" />
              <input
                type="password"
                placeholder="sua senha"
                className="w-full rounded-lg sm:rounded-xl border border-white/5 bg-white/[0.03] py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-3 sm:pr-4 text-[13px] sm:text-sm text-white placeholder:text-white/20 focus:border-lime-accent/30 focus:bg-white/[0.05] focus:outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg sm:rounded-xl border border-red-500/20 bg-red-500/10 px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-sm text-red-400 animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-lime-accent py-3 sm:py-4 text-[13px] sm:text-sm font-heading font-bold text-[#0a0a0a] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "Acessando..." : "Acessar plataforma"}
          <ArrowRight size={16} weight="bold" />
        </button>

        {/* Separador */}
        <div className="relative flex items-center py-1.5 sm:py-2">
          <div className="flex-grow border-t border-dashed border-white/10"></div>
          <span className="flex-shrink mx-3 sm:mx-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide sm:tracking-widest text-white/20">ou</span>
          <div className="flex-grow border-t border-dashed border-white/10"></div>
        </div>

        <Link 
          to="/cadastro" 
          className="flex w-full items-center justify-center rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.02] py-3 sm:py-4 text-[13px] sm:text-sm font-heading font-bold text-white hover:bg-white/5 transition-all active:scale-[0.98]"
        >
          Criar uma nova conta
        </Link>

        <p className="mt-4 sm:mt-8 text-center text-[10px] sm:text-[11px] leading-snug sm:leading-relaxed text-white/30 font-body px-2 sm:px-4">
          Criando uma conta, você concorda com todos os nossos <br />
          <a href="#" className="text-white/50 underline underline-offset-2 hover:text-white transition">termos e condições</a>.
        </p>
      </form>
    </AuthShell>
  );
}


