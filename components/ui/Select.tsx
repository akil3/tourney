"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; options: { value: string; label: string }[]; }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>}
      <select ref={ref} id={id} className={`bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none transition-all min-h-[48px] sm:min-h-0 ${error ? "border-[var(--destructive)]" : ""} ${className}`} {...props}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="text-[13px] text-[var(--destructive)]">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";
