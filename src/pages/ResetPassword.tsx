import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="logo-mark relative inline-flex h-9 w-9 items-center justify-center">
        <img src="/logo.png" alt="CloudePay Logo" className="h-9 w-9 object-contain drop-shadow-sm" />
      </span>
      <span className="text-xl font-semibold tracking-[-0.045em] text-[#4c0519]">
        Cloude<span className="text-[#e11d48]">Pay</span>
      </span>
    </div>
  );
}

type PageState = "loading" | "ready" | "done" | "invalid";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    // The ONLY valid way to reach this page is via a PASSWORD_RECOVERY event.
    // supabase-js automatically processes the access_token from the URL hash.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[ResetPassword] Auth event:", event, "Session:", !!session);
      if (event === "PASSWORD_RECOVERY") {
        // Valid recovery token — show form
        setPageState("ready");
      } else if (event === "SIGNED_IN" && session) {
        // Signed in normally — if they weren't in recovery, still allow
        // (covers edge case where token was already exchanged)
        setPageState("ready");
      }
    });

    // Timeout: if no recovery event fires in 5s, the link is invalid/expired
    const timeout = setTimeout(() => {
      setPageState((prev) => {
        if (prev === "loading") return "invalid";
        return prev;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem. Tente novamente.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    
    if (updateError) {
      console.error("[ResetPassword] updateUser error:", updateError);
      setError(`Erro: ${updateError.message}. Solicite um novo link de redefinição.`);
      setLoading(false);
      return;
    }

    // Success! Sign out cleanly so the user makes a fresh login with the new password
    await supabase.auth.signOut();
    setPageState("done");
    setTimeout(() => navigate("/entrar"), 3000);
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

          {pageState === "loading" && (
            <div className="py-8 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#fecdd3] border-t-[#e11d48]" />
              <p className="mt-5 text-sm font-medium text-[#881337]">
                Verificando link de redefinição...
              </p>
            </div>
          )}

          {pageState === "invalid" && (
            <div className="py-4 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1f2]">
                <svg className="h-7 w-7 text-[#e11d48]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" />
                </svg>
              </span>
              <h1 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[#4c0519]">
                Link inválido ou expirado
              </h1>
              <p className="mt-3 text-sm text-[#881337]">
                Os links de redefinição expiram em 1 hora. Solicite um novo.
              </p>
              <Link
                to="/entrar"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#e11d48] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Solicitar novo link
              </Link>
            </div>
          )}

          {pageState === "done" && (
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
                Sua senha foi salva com sucesso.<br />
                Redirecionando para o login...
              </p>
            </div>
          )}

          {pageState === "ready" && (
            <>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#4c0519]">
                Redefinir senha
              </h1>
              <p className="mt-2 text-sm text-[#881337]">
                Digite sua nova senha. Mínimo de 6 caracteres.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="nova-senha" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9f1239]">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="nova-senha"
                      type={showPass ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="auth-input pr-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#9f1239] hover:bg-[#fff1f2]"
                      aria-label={showPass ? "Ocultar" : "Mostrar"}
                    >
                      {showPass ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3 21 21M10.6 6.1A10 10 0 0 1 22 12c-1 2-2.5 3.7-4.4 4.9M6.7 6.7C4.6 7.9 3 9.8 2 12c1.8 3.6 5.5 6 10 6 1.6 0 3.1-.3 4.4-.9" />
                          <path d="M14 14a3 3 0 0 1-4-4" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmar-senha" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9f1239]">
                    Confirmar senha
                  </label>
                  <input
                    id="confirmar-senha"
                    type={showPass ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Repita a nova senha"
                    className="auth-input"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="cta-button mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e11d48] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(225,29,72,0.4)] transition hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                        <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Salvando...
                    </>
                  ) : "Salvar nova senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
