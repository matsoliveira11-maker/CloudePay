import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  borderTop?: boolean;
}

export default function Section({ children, id, className = "", borderTop = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`py-16 sm:py-24 lg:py-32 ${borderTop ? "border-t border-neutral-900" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
