import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="logo-mark relative inline-flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
          <defs>
            <linearGradient id="logoGradRP" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="55%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
          <path
            d="M20 2.4c2.7 0 4.5 2.4 7.4 3.5 2.9 1.1 6.4.3 8 2.4 1.6 2.1.3 5.4 1.4 8.3 1.1 2.9 4.3 4.6 4.3 7.4 0 2.7-3.2 4.5-4.3 7.4-1.1 2.9.2 6.2-1.4 8.3-1.6 2.1-5.1 1.3-8 2.4-2.9 1.1-4.7 3.5-7.4 3.5s-4.5-2.4-7.4-3.5c-2.9-1.1-6.4-.3-8-2.4-1.6-2.1-.3-5.4-1.4-8.3C2.1 28.5-1 26.7-1 24c0-2.7 3.2-4.5 4.3-7.4 1.1-2.9-.2-6.2 1.4-8.3 1.6-2.1 5.1-1.3 8-2.4C15.5 4.8 17.3 2.4 20 2.4Z"
            fill="url(#logoGradRP)"
            transform="translate(0 -2)"
          />
          <path
            d="M14.5 16.8c1.5-2.6 4.4-4.3 7.6-4.3 4.9 0 8.9 3.9 8.9 8.7 0 4.9-4 8.7-8.9 8.7-3.2 0-6.1-1.6-7.6-4.3"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="14.4" cy="21.2" r="2.2" fill="#fff" />
        </svg>
      </span>
      <span className="text-xl font-semibold tracking-[-0.045em] text-[#4c0519]">
        Cloude<span className="text-[#e11d48]">Pay</span>
      </span>
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the recovery token in the URL fragment.
  // The supabase-js client automatically detects and exchanges it.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    // Also check if there's already a session (token already processed)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message || "Erro ao atualizar senha. Tente novamente.");
    } else {
      setDone(true);
      setTimeout(() => navigate("/painel"), 2000);
    }
  }

  return (
    <main className="auth-page relative min-h-screen overflow-hidden bg-white text-[#4c0519] antialiased">
      <div className="auth-aurora absolute inset-0 -z-10" aria-hidden="true" />
      <div className="auth-orb auth-orb-a absolute -left-24 top-20 h-72 w-72 rounded-full" aria-hidden="true" />
      <div className="auth-orb auth-orb-b absolute -right-32 bottom-10 h-[420px] w-[420px] rounded-full" aria-hidden="true" />

      <header className="relative z-10 border-b border-[#fecdd3]/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between gap-3 px-4 sm:px-6 md:h-20 md:px-9">
          <Link to="/" className="inline-flex"><Logo /></Link>
        </div>
      </header>

      <section className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[#fecdd3] bg-white p-8 shadow-[0_40px_100px_rgba(136,19,55,0.18)]">

          {done ? (
            <div className="py-4 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e11d48] text-white">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#4c0519]">
                Senha atualizada!
              </h1>
              <p className="mt-3 text-sm text-[#881337]">
                Redirecionando para o painel...
              </p>
            </div>
          ) : !sessionReady ? (
            <div className="py-4 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#fecdd3] border-t-[#e11d48]" />
              <p className="mt-4 text-sm text-[#881337]">Verificando link de redefinição...</p>
              <p className="mt-2 text-xs text-[#9f1239]">
                Se nada acontecer,{" "}
                <Link to="/entrar" className="font-semibold text-[#e11d48] hover:underline">
                  clique aqui para entrar
                </Link>.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#4c0519]">
                Redefinir senha
              </h1>
              <p className="mt-2 text-sm text-[#881337]">
                Digite sua nova senha abaixo.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="nova-senha" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9f1239]">
                    Nova senha
                  </label>
                  <input
                    id="nova-senha"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="confirmar-senha" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9f1239]">
                    Confirmar senha
                  </label>
                  <input
                    id="confirmar-senha"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Repita a nova senha"
                    className="auth-input"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 py-2 text-center text-sm font-semibold text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="cta-button mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e11d48] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(225,29,72,0.4)] transition hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {loading ? "Salvando..." : "Salvar nova senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
