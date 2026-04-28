import { ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, ...rest },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-heading font-semibold transition active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-brand-200";
  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-4 text-sm",
    lg: "h-13 px-5 text-base min-h-[52px]",
  }[size];
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    secondary: "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50",
    ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
  }[variant];

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={twMerge(base, sizes, variants, className)}
      {...rest}
    >
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
});

export default Button;
