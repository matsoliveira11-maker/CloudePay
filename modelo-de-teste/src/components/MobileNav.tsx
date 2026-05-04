import { LayoutDashboard, Package, Plus, UserRound, QrCode } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { id: "dashboard", label: "Início", icon: LayoutDashboard },
  { id: "cobrancas", label: "Cobranças", icon: QrCode },
  { id: "produtos",  label: "Produtos", icon: Package },
  { id: "perfil",    label: "Perfil",   icon: UserRound },
];

export default function MobileNav({ active, onNavigate, onCreate }: {
  active: string;
  onNavigate: (id: string) => void;
  onCreate: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50">
      {/* Fade mask above dock */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 transition-opacity duration-300"
        style={{
          background: scrolled
            ? "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, transparent 100%)"
            : "transparent",
        }}
      />

      <div className="px-5 pb-3">
        {/* iOS Dock Style */}
        <div
          className="flex items-center justify-around px-2 py-2"
          style={{
            borderRadius: "22px",
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          {/* Left nav items */}
          {navItems.slice(0, 2).map(({ id, label, icon: Icon }) => (
            <DockItem
              key={id}
              active={active === id}
              onClick={() => onNavigate(id)}
              icon={<Icon className="w-[22px] h-[22px]" strokeWidth={active === id ? 2.2 : 1.8} />}
              label={label}
            />
          ))}

          {/* Center CTA — larger, elevated */}
          <div className="relative flex flex-col items-center">
            {/* Glow behind */}
            <div
              className="absolute inset-0 rounded-[18px] transition-opacity duration-300"
              style={{
                background: "radial-gradient(ellipse at center, rgba(225,29,72,0.25) 0%, transparent 70%)",
                filter: "blur(8px)",
                transform: "scale(1.4)",
              }}
            />
            <button
              onClick={onCreate}
              className="relative flex items-center justify-center w-[52px] h-[52px] rounded-[16px] active:scale-[0.88] transition-all duration-200"
              style={{
                background: "linear-gradient(145deg, #e11d48, #be123c)",
                boxShadow: "0 4px 16px rgba(225,29,72,0.4), 0 0 0 1px rgba(255,255,255,0.15) inset",
              }}
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2.8} />
            </button>
            <span className="text-[10px] font-medium text-[var(--accent)] mt-0.5">Nova</span>
          </div>

          {/* Right nav items */}
          {navItems.slice(2).map(({ id, label, icon: Icon }) => (
            <DockItem
              key={id}
              active={active === id}
              onClick={() => onNavigate(id)}
              icon={<Icon className="w-[22px] h-[22px]" strokeWidth={active === id ? 2.2 : 1.8} />}
              label={label}
            />
          ))}
        </div>

        {/* Home indicator — Apple style */}
        <div className="flex justify-center mt-2.5">
          <div
            className="w-[134px] h-[5px] rounded-full"
            style={{ background: "rgba(0,0,0,0.18)" }}
          />
        </div>
      </div>
    </nav>
  );
}

function DockItem({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  const [pressing, setPressing] = useState(false);

  return (
    <button
      onClick={onClick}
      onTouchStart={() => setPressing(true)}
      onTouchEnd={() => setPressing(false)}
      className="relative flex flex-col items-center gap-0.5 w-[60px] transition-transform duration-150"
      style={{
        transform: pressing ? "scale(0.82)" : active ? "scale(1.08)" : "scale(1)",
      }}
    >
      {/* Active indicator dot (iOS style) */}
      {active && (
        <span
          className="absolute -bottom-1 w-1 h-1 rounded-full"
          style={{ background: "var(--accent)" }}
        />
      )}

      {/* Icon container */}
      <div
        className="flex items-center justify-center w-[44px] h-[44px] rounded-[12px] transition-all duration-200"
        style={{
          background: active
            ? "linear-gradient(145deg, rgba(225,29,72,0.12), rgba(225,29,72,0.06))"
            : "transparent",
        }}
      >
        <span style={{ color: active ? "var(--accent)" : "var(--text-secondary)" }}>
          {icon}
        </span>
      </div>

      <span
        className="text-[10px] font-medium leading-none transition-colors"
        style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }}
      >
        {label}
      </span>
    </button>
  );
}
