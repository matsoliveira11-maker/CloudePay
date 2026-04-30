import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

// --- Icons ---

function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-white" : "text-[#4c0519]";
  return (
    <div className="flex items-center gap-2.5">
      <span className="logo-mark relative inline-flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="55%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <linearGradient id="logoGloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M20 2.4c2.7 0 4.5 2.4 7.4 3.5 2.9 1.1 6.4.3 8 2.4 1.6 2.1.3 5.4 1.4 8.3 1.1 2.9 4.3 4.6 4.3 7.4 0 2.7-3.2 4.5-4.3 7.4-1.1 2.9.2 6.2-1.4 8.3-1.6 2.1-5.1 1.3-8 2.4-2.9 1.1-4.7 3.5-7.4 3.5s-4.5-2.4-7.4-3.5c-2.9-1.1-6.4-.3-8-2.4-1.6-2.1-.3-5.4-1.4-8.3C2.1 28.5-1 26.7-1 24c0-2.7 3.2-4.5 4.3-7.4 1.1-2.9-.2-6.2 1.4-8.3 1.6-2.1 5.1-1.3 8-2.4C15.5 4.8 17.3 2.4 20 2.4Z"
            fill="url(#logoGrad)"
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
          <path
            d="M2 6c4 1 8 5 9 10"
            stroke="url(#logoGloss)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      <span className={`text-xl font-semibold tracking-[-0.045em] ${textColor}`}>
        Cloude<span className="text-[#e11d48]">Pay</span>
      </span>
    </div>
  );
}

// --- Component ---

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function exchangeCode() {
      const code = searchParams.get("code");
      const stateUserId = searchParams.get("state");

      if (!code) {
        setStatus("error");
        setErrorMsg("Código de autorização não encontrado.");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || stateUserId;

        if (!userId) {
          throw new Error("Usuário não identificado. Faça login novamente.");
        }

        const { data, error: funcError } = await supabase.functions.invoke('mp-auth', {
          body: {
            code,
            redirect_uri: (import.meta as any).env.VITE_REDIRECT_URI,
            userId
          }
        });

        if (funcError || data?.error) {
          throw new Error(funcError?.message || data?.error || "Erro na conexão.");
        }

        setStatus("success");
        await refresh();

        setTimeout(() => {
          navigate("/painel");
        }, 2000);

      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Erro desconhecido.");
      }
    }

    exchangeCode();
  }, []);

  return (
    <div className="min-h-screen bg-[#fffafa] text-[#4c0519] antialiased page-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#fecdd3] rounded-[2.5rem] p-12 text-center shadow-[0_32px_80px_rgba(76,5,25,0.12)]">
        <Logo variant="dark" />

        {status === "loading" && (
          <>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#fecdd3] border-t-[#e11d48] mx-auto mb-6" />
            <h2 className="text-2xl font-semibold tracking-tight text-[#4c0519]">Conectando...</h2>
            <p className="text-[#881337] mt-2">Estamos vinculando sua conta do Mercado Pago.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#9EEA6C]/20 flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-[#006400]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#4c0519]">Sucesso!</h2>
            <p className="text-[#881337] mt-2">Conta conectada. Redirecionando...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#4c0519]">Algo deu errado</h2>
            <p className="text-[#881337] mt-2 mb-8">{errorMsg}</p>
            <Link to="/painel" className="inline-flex rounded-full bg-[#4c0519] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#7f1235]">
              Voltar ao Painel
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
