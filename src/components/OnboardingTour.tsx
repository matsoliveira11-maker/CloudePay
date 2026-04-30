import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// --- Icons ---

function SparkleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}

function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// --- Component ---

interface TourStep {
  id: string;
  title: string;
  description: string;
  route?: string;
  targetId?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao CloudePay",
    description: "Vamos te guiar por cada área importante de forma simples e objetiva.",
    route: "/painel",
  },
  {
    id: "dashboard",
    title: "Painel de Controle",
    description: "Aqui você acompanha seus resultados, taxas e movimentação em tempo real.",
    route: "/painel",
    targetId: "tour-dashboard",
  },
  {
    id: "products",
    title: "Seus Produtos",
    description: "Cadastre seus serviços para gerar links de cobrança com um clique.",
    route: "/produtos",
    targetId: "tour-products",
  },
  {
    id: "profile",
    title: "Perfil Público",
    description: "Configure seu link único e os dados que o seu cliente vai visualizar.",
    route: "/configuracoes",
    targetId: "tour-profile",
  },
];

export default function OnboardingTour() {
  const { profile, needsOnboarding, onboardingStep, updateOnboarding } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!profile || !needsOnboarding) return;
    const timer = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, [profile?.id, needsOnboarding]);

  useEffect(() => {
    if (!profile || !needsOnboarding) return;
    setCurrentStep(Math.min(Math.max(onboardingStep, 0), tourSteps.length - 1));
  }, [profile?.id, onboardingStep, needsOnboarding]);

  const step = tourSteps[currentStep];

  const nextStep = async () => {
    if (currentStep < tourSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (tourSteps[next].route) navigate(tourSteps[next].route);
      await updateOnboarding({ currentStep: next });
    } else {
      await updateOnboarding({ completed: true });
      setIsOpen(false);
    }
  };

  const skipTour = async () => {
    await updateOnboarding({ skipped: true, completed: true });
    setIsOpen(false);
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] flex items-end justify-center p-4 sm:items-center sm:justify-end">
      <aside className="pointer-events-auto w-full max-w-sm rounded-[2rem] border border-[#fecdd3] bg-white p-6 shadow-[0_32px_80px_rgba(76,5,25,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f2] text-[#e11d48]">
            <SparkleIcon className="h-5 w-5" />
          </div>
          <button onClick={skipTour} className="rounded-lg p-2 text-[#881337]/40 hover:bg-[#fff1f2] hover:text-[#e11d48]">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#e11d48]">Passo {currentStep + 1} de {tourSteps.length}</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#4c0519]">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#881337]">{step.description}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button onClick={skipTour} className="text-xs font-semibold text-[#881337]/60 hover:text-[#e11d48]">Pular</button>
          <button
            onClick={nextStep}
            className="rounded-full bg-[#e11d48] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(225,29,72,0.24)] transition hover:-translate-y-0.5"
          >
            {currentStep === tourSteps.length - 1 ? "Começar agora" : "Próximo"}
          </button>
        </div>

        <div className="mt-5 flex gap-1.5">
          {tourSteps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i === currentStep ? "bg-[#e11d48]" : "bg-[#fecdd3]"}`} />
          ))}
        </div>
      </aside>
    </div>
  );
}
