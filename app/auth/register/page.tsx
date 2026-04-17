"use client";
import { useState } from "react"; import { signIn } from "next-auth/react"; import { useRouter } from "next/navigation"; import Link from "next/link"; import { Input } from "@/components/ui/Input"; import { Button } from "@/components/ui/Button"; import { Flame } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter(); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); setError(""); setLoading(true); const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) }); if (!res.ok) { const data = await res.json(); setError(data.error || "Registration failed"); setLoading(false); return; } const result = await signIn("credentials", { email, password, redirect: false }); setLoading(false); if (result?.error) setError("Account created but sign-in failed."); else { router.push("/"); router.refresh(); } }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-base)]">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><div className="w-14 h-14 bg-[var(--accent)] rounded-2xl flex items-center justify-center shadow-[var(--shadow-glow)]"><Flame size={28} className="text-white" strokeWidth={2.5} /></div></div>
        <h1 className="font-display text-[48px] tracking-wider text-[var(--text-primary)] text-center leading-none mb-1">CREATE ACCOUNT</h1>
        <p className="text-[15px] text-[var(--text-muted)] text-center mb-8">Get started with Tourney</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="name" label="Full name" type="text" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          {error && <p className="text-[14px] text-[var(--destructive)]">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? "Creating..." : "Create Account"}</Button>
        </form>
        <p className="text-[14px] text-[var(--text-muted)] text-center mt-6">Already have an account?{" "}<Link href="/auth/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold">Sign in</Link></p>
      </div>
    </div>
  );
}
