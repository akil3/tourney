"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>}
      <input ref={ref} id={id} className={`bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none transition-all min-h-[48px] sm:min-h-0 ${error ? "border-[var(--destructive)]" : ""} ${className}`} {...props} />
      {error && <p className="text-[13px] text-[var(--destructive)]">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
