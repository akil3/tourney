"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; }

const variants: Record<Variant, string> = {
  primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
  secondary: "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-muted)]",
  ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]",
  destructive: "bg-[var(--destructive-soft)] text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white",
};

const sizes: Record<Size, string> = { sm: "px-3 py-1.5 text-[13px]", md: "px-5 py-2.5 text-[14px]", lg: "px-6 py-3 text-[15px]" };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, ...props }, ref) => (
    <button ref={ref} className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-wide transition-all duration-200 min-h-[44px] sm:min-h-0 disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled} {...props} />
  )
);
Button.displayName = "Button";
