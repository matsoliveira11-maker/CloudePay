import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/5 border-t-lime-accent" />
      </div>
    );
  }
  if (!profile) {
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  // ISOLAMENTO TOTAL: Se for admin, não pode acessar rotas de vendedor
  const adminEmails = ["matsoliveira11@gmail.com", "mats.oliveira11@gmail.com"];
  const isAdmin = profile.email && adminEmails.includes(profile.email.toLowerCase());

  if (isAdmin) {
    return <Navigate to="/one-above-all-2000" replace />;
  }

  return <>{children}</>;
}
