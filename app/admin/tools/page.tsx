"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRole } from "@/lib/hooks/useRole";
import { AlertTriangle } from "lucide-react";

export default function ToolsPage() {
  const { isSuperAdmin } = useRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState("");

  if (!isSuperAdmin) return <p className="text-[var(--text-muted)]">Super admin access required</p>;

  async function seedAdmin(e: React.FormEvent) {
    e.preventDefault();
    setResult("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
    if (!res.ok) { const data = await res.json(); setResult(`Error: ${data.error}`); return; }
    // Promote to superadmin
    const user = await res.json();
    await fetch(`/api/admin/users/${user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "superadmin" }) });
    setResult(`Created superadmin: ${email}`);
    setEmail(""); setPassword(""); setName("");
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-[28px] tracking-wider text-[var(--text-primary)] leading-none mb-6">TOOLS</h2>

      <Card>
        <h3 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-4">Create Super Admin</h3>
        <form onSubmit={seedAdmin} className="flex flex-col gap-3">
          <Input id="name" label="Name" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
          <Input id="email" label="Email" type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <Button type="submit" className="self-start">Create Super Admin</Button>
          {result && <p className={`text-[13px] ${result.startsWith("Error") ? "text-[var(--destructive)]" : "text-[var(--success)]"}`}>{result}</p>}
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-[var(--destructive)]" />
          <h3 className="text-[13px] font-bold text-[var(--destructive)] uppercase tracking-[0.15em]">Danger Zone</h3>
        </div>
        <p className="text-[14px] text-[var(--text-muted)] mb-4">These actions are irreversible. Proceed with caution.</p>
        <Button variant="destructive" onClick={() => alert("Not implemented yet — use Prisma Studio for now: npx prisma studio")}>Reset All Tournament Data</Button>
      </Card>
    </div>
  );
}
