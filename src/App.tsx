import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Products from "./pages/Products";
import Admin from "./pages/Admin";
import PublicCharge from "./pages/PublicCharge";
import FixedQRCode from "./pages/FixedQRCode";
import AuthCallback from "./pages/AuthCallback";
import OnboardingTour from "./components/OnboardingTour";

import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <OnboardingTour />
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/cadastro" element={<Signup />} />
          <Route path="/entrar" element={<Login />} />

          <Route
            path="/painel"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/one-above-all-2000"
            element={<Admin />}
          />

          {/* Página pública de cobrança fixa via QR Code: /:slug/pagar */}
          <Route path=":slug/pagar" element={<FixedQRCode />} />

          {/* Rota de retorno do Mercado Pago */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Página pública de cobrança avulsa: /:slug/:chargeId */}
          <Route path=":slug/:chargeId" element={<PublicCharge />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
