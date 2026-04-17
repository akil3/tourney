type BadgeVariant = "default" | "completed" | "in-progress" | "pending" | "destructive";

const variants: Record<BadgeVariant, string> = {
  default: "bg-[var(--bg-muted)] text-[var(--text-secondary)]",
  completed: "bg-[var(--success-soft)] text-[var(--success)]",
  "in-progress": "bg-[var(--accent-soft)] text-[var(--accent)] live-pulse",
  pending: "bg-[var(--bg-muted)] text-[var(--text-muted)]",
  destructive: "bg-[var(--destructive-soft)] text-[var(--destructive)]",
};

interface BadgeProps { variant?: BadgeVariant; children: React.ReactNode; className?: string; }

export function Badge({ variant = "default", className = "", children }: BadgeProps) {
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-widest uppercase ${variants[variant]} ${className}`}>{children}</span>;
}
