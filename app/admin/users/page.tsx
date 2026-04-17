"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Trash2, Shield, Search } from "lucide-react";
import { useRole } from "@/lib/hooks/useRole";

interface UserItem { id: string; name: string | null; email: string; role: string; createdAt: string; _count: { captainOf: number; adminOf: number } }

const roleOptions = ["player", "captain", "superadmin"];
const roleBadge: Record<string, "default" | "completed" | "in-progress"> = { player: "default", captain: "in-progress", superadmin: "completed" };

export default function UsersPage() {
  const { isSuperAdmin, userId } = useRole();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  function fetchUsers() {
    fetch("/api/admin/users").then(r => r.json()).then(data => { setUsers(data); setLoading(false); });
  }
  useEffect(() => { fetchUsers(); }, []);

  async function changeRole(id: string, role: string) {
    await fetch(`/api/admin/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    fetchUsers();
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
  }

  if (!isSuperAdmin) return <p className="text-[var(--text-muted)]">Super admin access required</p>;

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || (u.name?.toLowerCase() || "").includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-[28px] tracking-wider text-[var(--text-primary)] leading-none">USERS <span className="text-[var(--accent)]">{users.length}</span></h2>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-[13px] text-[var(--text-muted)]">
        <span><Badge variant="default">player</Badge> — view only</span>
        <span><Badge variant="in-progress">captain</Badge> — manages own team roster</span>
        <span><Badge variant="completed">superadmin</Badge> — full platform access</span>
        <span><Shield size={12} className="inline text-[var(--accent)]" /> — tournament admin (per-tournament, assigned in tournament settings)</span>
      </div>

      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? <p className="text-[var(--text-muted)]">Loading...</p> : (
        <div className="space-y-2">
          {filtered.map(user => (
            <Card key={user.id} padding={false}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-muted)] font-display text-[16px] tracking-wider">
                    {(user.name?.[0] || user.email[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">{user.name || "No name"}</p>
                      {user._count.adminOf > 0 && <Badge><Shield size={10} className="mr-1" />{user._count.adminOf} tourney</Badge>}
                    </div>
                    <p className="text-[13px] text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={user.role} onChange={e => changeRole(user.id, e.target.value)} disabled={user.id === userId} className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-2 py-1 text-[13px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {user.id !== userId && (
                    <button onClick={() => deleteUser(user.id, user.email)} className="text-[var(--text-muted)] hover:text-[var(--destructive)] transition-colors p-2 rounded-lg hover:bg-[var(--destructive-soft)]">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-[var(--text-muted)] text-center py-8">No users match your search</p>}
        </div>
      )}
    </div>
  );
}
