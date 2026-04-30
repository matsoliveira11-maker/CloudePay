import { ReactNode } from "react";
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  const baseClass = `rounded-2xl border border-neutral-800 bg-[#0a0a0a] overflow-hidden ${
    hover ? "transition-all duration-300 hover:border-neutral-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50" : ""
  } ${className}`;

  return <div className={baseClass}>{children}</div>;
}
