import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { CircleNotch, CheckCircle, XCircle } from "phosphor-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function exchangeCode() {
      // Esperar o profile carregar se ainda não estiver pronto
      if (!profile) return;

      const code = searchParams.get("code");
      
      if (!code) {
        setStatus("error");
        setErrorMsg("Código de autorização não encontrado.");
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Erro de sessão Supabase: ${sessionError.message}`);
        }

        if (!session?.access_token) {
          throw new Error("Sessão não encontrada. Tente fazer logout e login novamente no CloudePay.");
        }

        const response = await fetch(`${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/mp-auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            code,
            redirect_uri: (import.meta as any).env.VITE_REDIRECT_URI
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const detail = errorData?.error || response.statusText;
          throw new Error(`O Servidor recusou a conexão: ${detail}`);
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
  }, [searchParams, profile]);

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
              onClick={() => navigate("/dashboard")}
              className="bg-white/10 hover:bg-white/20 text-white rounded-2xl px-8 py-3 font-heading font-bold uppercase text-xs transition-all"
            >
              Voltar ao Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
