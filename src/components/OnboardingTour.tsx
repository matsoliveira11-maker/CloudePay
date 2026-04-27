import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, House, Lightning, Package, QrCode, Receipt, Rocket, Shield, Sparkle, User, X } from "phosphor-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route?: string;
  targetId?: string;
  actionLabel?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao CloudePay",
    description: "Vamos te guiar por cada area importante de forma simples e objetiva.",
    icon: Sparkle,
    route: "/painel",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Aqui voce acompanha resultados, status e movimentacao das cobrancas.",
    icon: House,
    route: "/painel",
    targetId: "tour-dashboard",
  },
  {
    id: "products",
    title: "Produtos",
    description: "Cadastre produtos para gerar cobrancas mais rapido e com menos erros.",
    icon: Package,
    route: "/produtos",
    targetId: "tour-products",
    actionLabel: "Abrir produtos",
  },
  {
    id: "new-charge",
    title: "Nova cobranca",
    description: "Este e o atalho para criar um novo link PIX em segundos.",
    icon: QrCode,
    route: "/painel",
    targetId: "tour-new-charge",
    actionLabel: "Testar criacao",
  },
  {
    id: "charges",
    title: "Historico",
    description: "Veja rapidamente cobrancas pagas, pendentes e expiradas.",
    icon: Receipt,
    route: "/painel",
    targetId: "tour-charges",
  },
  {
    id: "profile",
    title: "Perfil publico",
    description: "Configure seu link unico e os dados que o cliente vai visualizar.",
    icon: User,
    route: "/configuracoes",
    targetId: "tour-profile",
    actionLabel: "Abrir perfil",
  },
  {
    id: "security",
    title: "Seguranca",
    description: "Seus dados e cobrancas ficam sob seu controle com fluxo protegido.",
    icon: Shield,
    route: "/painel",
  },
  {
    id: "ready",
    title: "Tudo pronto",
    description: "Agora voce pode usar a plataforma com autonomia. Vamos comecar.",
    icon: Rocket,
    route: "/painel",
  },
];

export default function OnboardingTour() {
  const { profile, needsOnboarding, onboardingStep, updateOnboarding } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetStatus, setTargetStatus] = useState<"idle" | "searching" | "found" | "missing">("idle");
  const [viewportWidth, setViewportWidth] = useState(1280);

  const step = tourSteps[currentStep];
  const isDark = theme === "dark";
  const isMobile = viewportWidth < 768;
  const Icon = step.icon;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!profile || !needsOnboarding) return;
    const timer = setTimeout(() => setIsOpen(true), 350);
    return () => clearTimeout(timer);
  }, [profile?.id, needsOnboarding]);

  useEffect(() => {
    if (!profile || !needsOnboarding) return;
    setCurrentStep(Math.min(Math.max(onboardingStep, 0), tourSteps.length - 1));
  }, [profile?.id, onboardingStep, needsOnboarding]);

  useEffect(() => {
    const handleOpenTour = () => {
      setCurrentStep(0);
      setTargetElement(null);
      setTargetStatus("idle");
      setIsOpen(true);
    };
    window.addEventListener("open-onboarding-tour", handleOpenTour as EventListener);
    return () => window.removeEventListener("open-onboarding-tour", handleOpenTour as EventListener);
  }, []);

  useEffect(() => {
    if (!isOpen || !step.route) return;
    if (location.pathname !== step.route) {
      navigate(step.route, { replace: true });
    }
  }, [isOpen, location.pathname, navigate, step.route]);

  useEffect(() => {
    const prev = document.querySelector(".tour-target-active");
    if (prev) prev.classList.remove("tour-target-active");

    if (!isOpen || !step.targetId) {
      setTargetElement(null);
      setTargetStatus("idle");
      return;
    }

    setTargetStatus("searching");
    let attempts = 0;
    let cancelled = false;
    const maxAttempts = 20;

    const lookup = () => {
      if (cancelled) return;
      const el = document.getElementById(step.targetId) as HTMLElement | null;
      if (el) {
        el.classList.add("tour-target-active");
        setTargetElement(el);
        setTargetStatus("found");
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        return;
      }
      attempts += 1;
      if (attempts >= maxAttempts) {
        setTargetElement(null);
        setTargetStatus("missing");
        return;
      }
      setTimeout(lookup, 120);
    };

    const timer = setTimeout(lookup, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      const active = document.querySelector(".tour-target-active");
      if (active) active.classList.remove("tour-target-active");
    };
  }, [isOpen, currentStep, location.pathname, step.targetId]);

  const progress = useMemo(
    () => `${Math.round(((currentStep + 1) / tourSteps.length) * 100)}%`,
    [currentStep]
  );

  const persistStep = async (index: number) => {
    await updateOnboarding({ currentStep: index });
  };

  const closeAsSkipped = async () => {
    await updateOnboarding({ skipped: true });
    setIsOpen(false);
  };

  const completeTour = async () => {
    await updateOnboarding({ completed: true, currentStep: tourSteps.length - 1 });
    setIsOpen(false);
  };

  const nextStep = async () => {
    if (currentStep < tourSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      await persistStep(next);
      return;
    }
    await completeTour();
  };

  const prevStep = async () => {
    if (currentStep === 0) return;
    const prev = currentStep - 1;
    setCurrentStep(prev);
    await persistStep(prev);
  };

  const goToCurrentArea = () => {
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      return;
    }
    if (step.route) navigate(step.route);
  };

  const runPrimaryAction = async () => {
    if (step.id === "products") {
      navigate("/produtos");
    } else if (step.id === "profile") {
      navigate("/configuracoes");
    } else if (step.id === "new-charge") {
      navigate("/painel");
      window.dispatchEvent(new CustomEvent("open-create-charge"));
    } else {
      goToCurrentArea();
    }
    await nextStep();
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <aside
        className={`pointer-events-auto fixed border shadow-2xl ${
          isDark ? "border-white/10 bg-[#121212]" : "border-neutral-200 bg-white"
        } ${
          isMobile
            ? "safe-bottom bottom-0 left-0 right-0 mx-2 mb-2 rounded-2xl p-4"
            : "bottom-4 right-4 w-[390px] rounded-3xl p-5"
        }`}
      >
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
          <div className="h-full rounded-full bg-[#9EEA6C] transition-all duration-300" style={{ width: progress }} />
        </div>

        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isDark ? "bg-[#9EEA6C]/20" : "bg-[#9EEA6C]/10"}`}>
              <Icon size={22} weight="bold" className="text-[#9EEA6C]" />
            </div>
            <div>
              <p className="text-[10px] font-heading font-bold uppercase tracking-wide text-[#9EEA6C]">
                Etapa {currentStep + 1} de {tourSteps.length}
              </p>
              <h3 className={`mt-1 text-[18px] font-heading font-extrabold leading-tight ${isDark ? "text-white" : "text-[#0a0a0a]"}`}>
                {step.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => void closeAsSkipped()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-white/70"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <p className={`text-[13px] leading-relaxed ${isDark ? "text-white/65" : "text-neutral-600"}`}>{step.description}</p>

        {step.targetId && (
          <div className={`mt-3 rounded-xl border px-3 py-2 text-[11px] font-heading font-bold uppercase tracking-wide ${
            targetStatus === "found"
              ? "border-[#9EEA6C]/40 bg-[#9EEA6C]/10 text-[#9EEA6C]"
              : targetStatus === "searching"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
              : "border-neutral-200 text-neutral-400 dark:border-white/10 dark:text-white/40"
          }`}>
            {targetStatus === "found" && "Area destacada na tela"}
            {targetStatus === "searching" && "Localizando area do passo atual..."}
            {targetStatus === "missing" && "Nao encontrei esta area. Toque em ir para area."}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={goToCurrentArea}
            className={`rounded-xl border px-3 py-2 text-[12px] font-heading font-bold transition-all ${
              isDark
                ? "border-white/10 text-white/70 hover:bg-white/5"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Ir para area
          </button>

          {step.actionLabel && (
            <button
              onClick={() => void runPrimaryAction()}
              className="flex items-center gap-2 rounded-xl bg-[#9EEA6C] px-3 py-2 text-[12px] font-heading font-extrabold text-[#0a0a0a] transition-all hover:brightness-110"
            >
              <Lightning size={14} weight="bold" />
              {step.actionLabel}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => void prevStep()}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-[12px] font-heading font-bold ${
              currentStep === 0
                ? "invisible"
                : isDark
                ? "border-white/10 text-white/70 hover:bg-white/5"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <ArrowLeft size={14} weight="bold" />
            Anterior
          </button>

          <button
            onClick={() => void nextStep()}
            className="ml-auto flex items-center gap-1 rounded-xl bg-[#9EEA6C] px-4 py-2 text-[12px] font-heading font-extrabold text-[#0a0a0a] transition-all hover:brightness-110"
          >
            {currentStep === tourSteps.length - 1 ? (
              <>
                <Check size={14} weight="bold" />
                Concluir
              </>
            ) : (
              <>
                Proximo
                <ArrowRight size={14} weight="bold" />
              </>
            )}
          </button>
        </div>

        <button
          onClick={() => void closeAsSkipped()}
          className={`mt-3 w-full text-[11px] font-heading font-bold uppercase tracking-wide transition-colors ${
            isDark ? "text-white/30 hover:text-white/50" : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Pular tutorial por enquanto
        </button>
      </aside>
    </div>
  );
}
