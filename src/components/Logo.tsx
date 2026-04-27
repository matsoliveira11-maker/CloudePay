import { Link } from "react-router-dom";

interface Props {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white" | "black";
  asLink?: boolean;
  iconOnly?: boolean;
}

export default function Logo({ size = "md", variant = "default", asLink = false, iconOnly = false }: Props) {
  const isWhite = variant === "white";
  const isBlack = variant === "black";

  const textSizes = { sm: "text-[18px]", md: "text-[22px]", lg: "text-[28px]" }[size];
  const iconSizes = { sm: 22, md: 26, lg: 32 }[size];

  const content = (
    <span className="inline-flex items-center gap-2">
      <CloudSymbol size={iconSizes} white={isWhite} black={isBlack} />
      {iconOnly ? null : (
        <span className={`font-heading font-extrabold tracking-tighter ${textSizes}`}>
          <span className={isWhite ? "text-white" : isBlack ? "text-black" : "text-link-blue"}>Cloude</span>
          <span className={isWhite ? "text-white/90" : isBlack ? "text-black" : "text-node-violet"}>Pay</span>
        </span>
      )}
    </span>
  );

  if (asLink) {
    return <Link to="/" className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]">{content}</Link>;
  }

  return content;
}

function CloudSymbol({ size = 26, white = false, black = false }: { size?: number; white?: boolean; black?: boolean }) {
  const cloud = white ? "#ffffff" : black ? "#0a0a0a" : "#3B82F6";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M13.5 24.5H30.5C35.7467 24.5 40 20.2467 40 15C40 9.75329 35.7467 5.5 30.5 5.5C29.7708 5.5 29.0618 5.58217 28.3812 5.73775C26.6996 2.36391 23.2068 0 19.15 0C13.8932 0 9.58 3.98287 9.06 9.1C8.07265 8.40852 6.87199 8 5.575 8C2.49626 8 0 10.4963 0 13.575C0 16.6537 2.49626 19.15 5.575 19.15H6.5C7.28756 22.2092 10.0666 24.5 13.5 24.5Z"
        fill={cloud}
      />
    </svg>
  );
}
