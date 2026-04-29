import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { CircleNotch, CheckCircle, XCircle } from "phosphor-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // CRÍTICO: Impede que o código OAuth seja usado mais de uma vez.
  // Códigos OAuth são de uso único — consumir 2x causa "invalid_grant".
  const hasRun = useRef(false);

  useEffect(() => {
    // Guard: só executa UMA vez, independente de re-renders do React
    if (hasRun.current) return;
    hasRun.current = true;

    async function exchangeCode() {
      const code = searchParams.get("code");
      // O state contém o userId que enviamos na URL de autorização
      const stateUserId = searchParams.get("state");

      if (!code) {
        setStatus("error");
        setErrorMsg("Código de autorização não encontrado na URL.");
        return;
      }

      try {
        // Tentar obter a sessão atual do Supabase
        const { data: { session } } = await supabase.auth.getSession();

        // Usar userId da sessão. Se não tiver (ex: janela anônima perdeu sessão),
        // usar o state que enviamos como parâmetro OAuth como fallback seguro.
        const userId = session?.user?.id || stateUserId;

        if (!userId) {
          throw new Error("Usuário não identificado. Faça login novamente no CloudePay.");
        }

        // Chamar a Edge Function via método oficial do Supabase (resolve CORS automaticamente)
        const { data, error: funcError } = await supabase.functions.invoke('mp-auth', {
          body: {
            code,
            redirect_uri: (import.meta as any).env.VITE_REDIRECT_URI,
            userId
          }
        });

        if (funcError) {
          throw new Error(`Erro na conexão: ${funcError.message}`);
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        setStatus("success");
        await refresh();

        setTimeout(() => {
          navigate("/painel");
        }, 2000);

      } catch (err: any) {
        console.error("Auth Error Detail:", err);
        setStatus("error");
        setErrorMsg(err.message || "Erro desconhecido na autenticação.");
      }
    }

    exchangeCode();
  }, []); // Array vazio = monta apenas uma vez

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[40px] p-12 text-center">
        {status === "loading" && (
          <>
            <CircleNotch size={64} weight="bold" className="text-[#9EEA6C] animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tight mb-2">Conectando...</h2>
            <p className="text-white/40 text-sm">Estamos vinculando sua conta do Mercado Pago.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} weight="bold" className="text-white" />
            </div>
            <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tight mb-2">Sucesso!</h2>
            <p className="text-white/40 text-sm">Sua conta foi conectada. Redirecionando...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} weight="bold" className="text-white" />
            </div>
            <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tight mb-2">Ops! Algo deu errado</h2>
            <p className="text-white/40 text-sm mb-8">{errorMsg}</p>
            <button
              onClick={() => navigate("/painel")}
              className="bg-white/10 hover:bg-white/20 text-white rounded-2xl px-8 py-3 font-heading font-bold uppercase text-xs transition-all"
            >
              Voltar ao Painel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
