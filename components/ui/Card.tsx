import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> { padding?: boolean; glow?: boolean; }

export function Card({ padding = true, glow = false, className = "", children, ...props }: CardProps) {
  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-sm)] ${padding ? "p-4 sm:p-5" : ""} ${glow ? "shadow-[var(--shadow-glow)] border-[var(--accent)]" : ""} transition-all duration-200 ${className}`} {...props}>
      {children}
    </div>
  );
}
