import { Link } from "react-router-dom";

interface Props {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  asLink?: boolean;
  iconOnly?: boolean;
}

export default function Logo({ size = "md", variant = "dark", asLink = false, iconOnly = false }: Props) {
  const textColor = variant === "light" ? "text-white" : "text-[#4c0519]";
  const scale = { sm: "scale-75", md: "scale-100", lg: "scale-125" }[size];
  
  const content = (
    <div className={`flex items-center gap-2.5 origin-left ${scale}`}>
      <span className="logo-mark relative inline-flex h-9 w-9 items-center justify-center">
        <img src="/logo.png" alt="CloudePay Logo" className="h-9 w-9 object-contain drop-shadow-sm" />
      </span>
      {!iconOnly && (
        <span className={`text-xl font-semibold tracking-[-0.045em] ${textColor}`}>
          Cloude<span className="text-[#e11d48]">Pay</span>
        </span>
      )}
    </div>
  );

  if (asLink) {
    return <Link to="/">{content}</Link>;
  }

  return content;
}
