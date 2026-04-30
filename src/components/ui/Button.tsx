import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  to?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  to,
  onClick,
  type = "button",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black";

  const variantStyles = {
    primary: "bg-green-500 text-black hover:bg-green-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    secondary: "bg-white text-black hover:bg-neutral-200 hover:scale-[1.02]",
    outline: "border border-neutral-800 text-white hover:bg-neutral-900 hover:border-neutral-700",
    ghost: "text-neutral-400 hover:text-white hover:bg-neutral-900",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const finalClass = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={finalClass}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={finalClass} target={href.startsWith("http") ? "_blank" : "_self"} rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={finalClass}>
      {children}
    </button>
  );
}
