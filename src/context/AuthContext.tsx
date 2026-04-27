import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import * as api from "../lib/api";
import type { Profile } from "../lib/mockBackend";

interface AuthCtx {
  profile: Profile | null;
  loading: boolean;
  onboardingStep: number;
  onboardingCompletedAt: string | null;
  onboardingSkippedAt: string | null;
  needsOnboarding: boolean;
  refresh: () => Promise<void>;
  updateOnboarding: (patch: { currentStep?: number; completed?: boolean; skipped?: boolean }) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingCompletedAt, setOnboardingCompletedAt] = useState<string | null>(null);
  const [onboardingSkippedAt, setOnboardingSkippedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setProfile(null);
        return;
      }

      const p = await api.getCurrentProfile();
      setProfile(p);
      setOnboardingStep(p?.onboarding_step ?? 0);
      setOnboardingCompletedAt(p?.onboarding_completed_at ?? null);
      setOnboardingSkippedAt(p?.onboarding_skipped_at ?? null);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  }, []);

  useEffect(() => {
    // Carregar sessão inicial
    refresh().finally(() => setLoading(false));

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refresh();
      } else {
        setProfile(null);
        setOnboardingStep(0);
        setOnboardingCompletedAt(null);
        setOnboardingSkippedAt(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await api.signOut();
    // O listener do onAuthStateChange cuidará de limpar o estado
  }, []);

  const updateOnboarding = useCallback(
    async (patch: { currentStep?: number; completed?: boolean; skipped?: boolean }) => {
      if (!profile) return;
      const state = await api.updateOnboardingState(profile.id, patch);
      if (!state) return;
      setOnboardingStep(state.currentStep);
      setOnboardingCompletedAt(state.completedAt);
      setOnboardingSkippedAt(state.skippedAt);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              onboarding_step: state.currentStep,
              onboarding_completed_at: state.completedAt,
              onboarding_skipped_at: state.skippedAt,
            }
          : prev
      );
    },
    [profile]
  );

  const needsOnboarding = !!profile && !onboardingCompletedAt;

  return (
    <Ctx.Provider
      value={{
        profile,
        loading,
        onboardingStep,
        onboardingCompletedAt,
        onboardingSkippedAt,
        needsOnboarding,
        refresh,
        updateOnboarding,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
