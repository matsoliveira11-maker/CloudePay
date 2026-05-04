import { LayoutDashboard, Package, Plus, UserRound, QrCode, Settings } from "lucide-react";
import { useState, useRef, useCallback } from "react";

const navItems = [
  { id: "dashboard", label: "Início",     icon: LayoutDashboard },
  { id: "cobrancas", label: "Cobranças",  icon: QrCode },
  { id: "produtos",  label: "Produtos",   icon: Package },
  { id: "config",    label: "Config",     icon: Settings },
  { id: "perfil",    label: "Perfil",     icon: UserRound },
];

const BASE_SIZE    = 48;
const MAX_SIZE     = 68;
const MAGNIFY_DIST = 140;

export default function Dock({ active, onNavigate, onCreate }: {
  active: string;
  onNavigate: (id: string) => void;
  onCreate: () => void;
}) {
  const dockRef    = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const itemRefs   = useRef<(HTMLButtonElement | null)[]>([]);

  // Track mouse position relative to dock items
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
    setHoveredId(null);
  }, []);

  // Calculate scale for magnification effect
  function getScale(index: number): number {
    if (mouseX === null) return 1;
    const el = itemRefs.current[index];
    if (!el) return 1;
    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const dist = Math.abs(mouseX - center);
    if (dist > MAGNIFY_DIST) return 1;
    const ratio = 1 - dist / MAGNIFY_DIST;
    const eased = Math.cos((1 - ratio) * Math.PI * 0.5); // cosine ease
    return 1 + eased * ((MAX_SIZE / BASE_SIZE) - 1);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50">
      {/* Fade mask */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-24"
        style={{ background: "linear-gradient(to top, var(--bg) 0%, transparent 100%)" }} />

      <div className="flex justify-center px-4 sm:px-6 pb-3 lg:pb-4">
        {/* Dock surface */}
        <div
          ref={dockRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          {/* Glass shelf */}
          <div
            className="absolute inset-0 rounded-[22px]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.58) 100%)",
              backdropFilter: "blur(50px) saturate(200%)",
              WebkitBackdropFilter: "blur(50px) saturate(200%)",
              border: "1px solid rgba(255,255,255,0.65)",
              boxShadow: [
                "0 0 0 0.5px rgba(0,0,0,0.04)",
                "0 2px 4px rgba(0,0,0,0.02)",
                "0 8px 24px -4px rgba(0,0,0,0.06)",
                "0 20px 48px -8px rgba(0,0,0,0.05)",
                "inset 0 1px 0 rgba(255,255,255,0.9)",
                "inset 0 -1px 0 rgba(0,0,0,0.02)",
              ].join(", "),
            }}
          />

          {/* Subtle top highlight (glass edge) */}
          <div
            className="absolute top-0 left-4 right-4 h-px rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
          />

          {/* Content */}
          <div className="relative flex items-end gap-0 px-2 pt-2 pb-2.5">

            {/* Brand icon (left anchor) */}
            <div className="flex flex-col items-center px-1.5 pb-0.5">
              <div
                className="flex items-center justify-center rounded-[12px] transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{
                  width: BASE_SIZE,
                  height: BASE_SIZE,
                  background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                  boxShadow: "0 2px 8px rgba(225,29,72,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M17 8.5a5 5 0 0 0-9.6-1.4A4 4 0 0 0 6 15h11a3.5 3.5 0 0 0 0-7Z"/>
                </svg>
              </div>
            </div>

            {/* Divider */}
            <div className="self-center w-px h-8 mx-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.08)" }} />

            {/* Nav items with magnification */}
            {navItems.map(({ id, label, icon: Icon }, i) => {
              const isActive = active === id;
              const isHovered = hoveredId === id;
              const scale = getScale(i);
              const size = BASE_SIZE * scale;

              return (
                <button
                  key={id}
                  ref={el => { itemRefs.current[i] = el; }}
                  onClick={() => onNavigate(id)}
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onTouchStart={() => setPressed(id)}
                  onTouchEnd={() => setPressed(null)}
                  className="relative flex flex-col items-center transition-none group"
                  style={{ paddingInline: "3px" }}
                >
                  {/* Tooltip (appears on hover, above dock) */}
                  <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap transition-all duration-150"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: `translateX(-50%) translateY(${isHovered ? 0 : 6}px)`,
                    }}
                  >
                    <div className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-white"
                      style={{
                        background: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}>
                      {label}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="flex justify-center -mt-px">
                      <div className="w-2 h-2 rotate-45" style={{ background: "rgba(0,0,0,0.75)" }} />
                    </div>
                  </div>

                  {/* Icon container with dynamic size */}
                  <div
                    className="flex items-center justify-center rounded-[12px] transition-colors duration-150"
                    style={{
                      width: size,
                      height: size,
                      transformOrigin: "bottom center",
                      background: isActive
                        ? "linear-gradient(145deg, rgba(225,29,72,0.12), rgba(225,29,72,0.05))"
                        : isHovered
                          ? "rgba(0,0,0,0.04)"
                          : "transparent",
                      transform: pressed === id ? "scale(0.85)" : undefined,
                      transition: pressed === id ? "transform 0.1s" : "none",
                    }}
                  >
                    <Icon
                      style={{
                        width: 20 + (scale - 1) * 6,
                        height: 20 + (scale - 1) * 6,
                        color: isActive ? "var(--accent)" : "var(--text-secondary)",
                        strokeWidth: isActive ? 2.1 : 1.7,
                        transition: "color 0.15s",
                      }}
                    />
                  </div>

                  {/* Label (visible when not magnifying or active) */}
                  <span
                    className="text-[10px] font-medium leading-none mt-0.5 transition-opacity duration-100"
                    style={{
                      color: isActive ? "var(--accent)" : "var(--text-tertiary)",
                      opacity: scale > 1.15 ? 0 : 1,
                    }}
                  >
                    {label}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <span
                      className="absolute -bottom-1.5 w-1 h-1 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </button>
              );
            })}

            {/* Divider */}
            <div className="self-center w-px h-8 mx-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.08)" }} />

            {/* CTA button */}
            <div className="relative flex flex-col items-center px-1">
              {/* Glow */}
              <div className="absolute -inset-3 rounded-full opacity-60 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(225,29,72,0.15) 0%, transparent 70%)",
                  filter: "blur(8px)",
                }} />

              <button
                onClick={onCreate}
                onMouseEnter={() => setHoveredId("create")}
                onMouseLeave={() => setHoveredId(null)}
                className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] active:scale-[0.9] transition-all duration-200 group/cta"
                style={{
                  background: "linear-gradient(145deg, #e11d48, #be123c)",
                  boxShadow: "0 3px 12px rgba(225,29,72,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                {/* Shimmer on hover */}
                <div className="absolute inset-0 rounded-[14px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-700" />
                </div>

                <Plus className="relative w-[18px] h-[18px] text-white" strokeWidth={2.5} />
                <span className="relative text-[12px] font-semibold text-white hidden sm:inline">Nova</span>
              </button>

              {/* Tooltip for CTA */}
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap transition-all duration-150"
                style={{
                  opacity: hoveredId === "create" ? 1 : 0,
                  transform: `translateX(-50%) translateY(${hoveredId === "create" ? 0 : 6}px)`,
                }}
              >
                <div className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-white"
                  style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
                  Criar cobrança
                </div>
                <div className="flex justify-center -mt-px">
                  <div className="w-2 h-2 rotate-45" style={{ background: "rgba(0,0,0,0.75)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Home indicator line (Apple style) */}
      <div className="flex justify-center pb-2 sm:hidden">
        <div className="w-[134px] h-[5px] rounded-full" style={{ background: "rgba(0,0,0,0.15)" }} />
      </div>
    </nav>
  );
}
