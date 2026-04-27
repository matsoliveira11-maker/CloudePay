import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  prefix?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, prefix, className, id, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1.5 block text-[14px] font-heading font-semibold text-neutral-700">{label}</span>
      )}
      <div
        className={twMerge(
          "flex items-center rounded-xl border bg-white transition focus-within:ring-4",
          error
            ? "border-red-400 focus-within:ring-red-100"
            : "border-neutral-200 focus-within:border-brand-500 focus-within:ring-brand-100"
        )}
      >
        {prefix && (
          <span className="pl-3 pr-1 text-sm text-neutral-500 select-none">{prefix}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            "h-12 w-full rounded-xl bg-transparent px-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none",
            prefix ? "pl-1" : "",
            className
          )}
          {...rest}
        />
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-neutral-500">{hint}</span>
      ) : null}
    </label>
  );
});

export default Input;
