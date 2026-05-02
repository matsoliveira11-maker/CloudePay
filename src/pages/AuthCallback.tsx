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
        <img src="/logo.png" alt="CloudePay Logo" className="h-9 w-9 object-contain drop-shadow-sm" />
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
            redirect_uri: window.location.origin + "/auth/callback",
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
