"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Trash2, Plus, Shield, ArrowLeft, UserPlus, Info } from "lucide-react";
import Link from "next/link";

interface Admin { id: string; user: { id: string; name: string | null; email: string; role: string }; createdAt: string }
interface Tournament { id: string; name: string; venue: string | null; format: string; status: string; settings: string }

export default function ManageTournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [tRes, aRes] = await Promise.all([
      fetch(`/api/tournaments/${tournamentId}`),
      fetch(`/api/tournaments/${tournamentId}/admins`),
    ]);
    setTournament(await tRes.json());
    setAdmins(await aRes.json());
  }, [tournamentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!newAdminEmail.trim()) return;
    const res = await fetch(`/api/tournaments/${tournamentId}/admins`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newAdminEmail.trim() }) });
    if (!res.ok) { const data = await res.json(); setError(data.error); return; }
    setSuccess(`Added ${newAdminEmail.trim()} as tournament admin`);
    setNewAdminEmail("");
    fetchData();
  }

  async function removeAdmin(userId: string, email: string) {
    if (!confirm(`Remove ${email} as tournament admin?`)) return;
    await fetch(`/api/tournaments/${tournamentId}/admins?userId=${userId}`, { method: "DELETE" });
    fetchData();
  }

  async function updateTournament(field: string, value: string) {
    setSaving(true);
    await fetch(`/api/tournaments/${tournamentId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) });
    setSaving(false);
    fetchData();
  }

  if (!tournament) return <p className="text-[var(--text-muted)]">Loading...</p>;

  return (
    <div>
      <Link href="/admin/tournaments" className="flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4 transition-colors">
        <ArrowLeft size={14} /> Back to tournaments
      </Link>
      <h2 className="font-display text-[28px] tracking-wider text-[var(--text-primary)] leading-none mb-6">{tournament.name.toUpperCase()}</h2>

      <div className="space-y-4">
        {/* Tournament Admins — most important, first */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-[var(--accent)]" />
            <h3 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em]">Tournament Admins</h3>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] mb-4">
            Tournament admins can manage teams, generate schedules, and score matches for this tournament. They do NOT need to be superadmins — any registered user can be made a tournament admin.
          </p>

          <form onSubmit={addAdmin} className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <UserPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input placeholder="Enter user's email to add as admin" value={newAdminEmail} onChange={e => { setNewAdminEmail(e.target.value); setError(""); setSuccess(""); }} className="pl-10" />
            </div>
            <Button type="submit" size="sm" disabled={!newAdminEmail.trim()}><Plus size={14} /> Add Admin</Button>
          </form>
          {error && <p className="text-[13px] text-[var(--destructive)] mb-3">{error}</p>}
          {success && <p className="text-[13px] text-[var(--success)] mb-3">{success}</p>}

          {admins.length === 0 ? (
            <div className="bg-[var(--bg-muted)] rounded-xl p-4 flex items-start gap-3">
              <Info size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[var(--text-secondary)]">No tournament admins assigned yet. Add at least one admin so they can manage teams and score matches. The user must first register an account.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {admins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-3 bg-[var(--bg-muted)] rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
                      <Shield size={14} className="text-[var(--accent)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{admin.user.name || admin.user.email}</p>
                      <p className="text-[12px] text-[var(--text-muted)] truncate">{admin.user.email} &middot; <Badge>{admin.user.role}</Badge></p>
                    </div>
                  </div>
                  <button onClick={() => removeAdmin(admin.user.id, admin.user.email)} className="text-[var(--text-muted)] hover:text-[var(--destructive)] transition-colors p-2 rounded-lg hover:bg-[var(--destructive-soft)]">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Edit Tournament Settings */}
        <Card>
          <h3 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-4">Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Name</label>
              <input defaultValue={tournament.name} onBlur={e => { if (e.target.value !== tournament.name) updateTournament("name", e.target.value); }} className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none w-full" />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Venue</label>
              <input defaultValue={tournament.venue || ""} onBlur={e => updateTournament("venue", e.target.value)} className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none w-full" />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Status</label>
              <select value={tournament.status} onChange={e => updateTournament("status", e.target.value)} className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none w-full">
                <option value="DRAFT">Draft</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Format</label>
              <p className="text-[15px] text-[var(--text-primary)] capitalize py-3">{tournament.format.replace(/_/g, " ").toLowerCase()}</p>
            </div>
          </div>
          {saving && <p className="text-[12px] text-[var(--accent)] mt-2">Saving...</p>}
        </Card>
      </div>
    </div>
  );
}
