import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { CircleNotch, CheckCircle, XCircle } from "phosphor-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, reloadProfile } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function exchangeCode() {
      const code = searchParams.get("code");
      const state = searchParams.get("state"); // ID do perfil

      if (!code) {
        setStatus("error");
        setErrorMsg("Código de autorização não encontrado.");
        return;
      }

      try {
        const client_id = import.meta.env.VITE_MP_CLIENT_ID;
        const client_secret = import.meta.env.VITE_MP_CLIENT_SECRET;
        const redirect_uri = import.meta.env.VITE_REDIRECT_URI;

        // Trocar o CODE pelo ACCESS_TOKEN
        const response = await fetch("https://api.mercadopago.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            client_id,
            client_secret,
            grant_type: "authorization_code",
            code,
            redirect_uri
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro na troca do token");
        }

        const data = await response.json();
        
        // Salvar o token no perfil do usuário no Supabase
        const profileId = state || profile?.id;
        
        if (!profileId) {
            throw new Error("Sessão do usuário não encontrada.");
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            mp_access_token: data.access_token,
            mp_refresh_token: data.refresh_token,
            mp_user_id: data.user_id.toString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", profileId);

        if (updateError) throw updateError;

        setStatus("success");
        await reloadProfile();
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);

      } catch (err: any) {
        console.error("Auth Error:", err);
        setStatus("error");
        setErrorMsg(err.message || "Ocorreu um erro ao conectar sua conta.");
      }
    }

    exchangeCode();
  }, [searchParams]);

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
