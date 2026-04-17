"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Trash2, Users, Swords, ExternalLink } from "lucide-react";
import { useRole } from "@/lib/hooks/useRole";
import Link from "next/link";

interface TournamentItem { id: string; name: string; venue: string | null; format: string; status: string; _count: { teams: number; matches: number }; createdAt: string }

const statusOptions = [{ value: "DRAFT", label: "Draft" }, { value: "IN_PROGRESS", label: "In Progress" }, { value: "COMPLETED", label: "Completed" }];
const statusVariant = { DRAFT: "pending" as const, IN_PROGRESS: "in-progress" as const, COMPLETED: "completed" as const };

export default function AdminTournamentsPage() {
  const { isSuperAdmin } = useRole();
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchTournaments() {
    fetch("/api/tournaments").then(r => r.json()).then(data => { setTournaments(data); setLoading(false); });
  }
  useEffect(() => { fetchTournaments(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/tournaments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchTournaments();
  }

  async function deleteTournament(id: string, name: string) {
    if (!confirm(`Delete "${name}"? All teams, matches, and standings will be permanently removed.`)) return;
    await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
    fetchTournaments();
  }

  if (loading) return <p className="text-[var(--text-muted)]">Loading...</p>;

  return (
    <div>
      <h2 className="font-display text-[28px] tracking-wider text-[var(--text-primary)] leading-none mb-6">TOURNAMENTS <span className="text-[var(--accent)]">{tournaments.length}</span></h2>
      {tournaments.length === 0 ? <p className="text-[var(--text-muted)] text-center py-8">No tournaments created yet</p> : (
        <div className="space-y-2">
          {tournaments.map(t => (
            <Card key={t.id} padding={false}>
              <div className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/tournaments/${t.id}`} className="text-[15px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors truncate">{t.name}</Link>
                    <Link href={`/tournaments/${t.id}`}><ExternalLink size={12} className="text-[var(--text-muted)]" /></Link>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-[var(--text-muted)] mt-1">
                    <span className="flex items-center gap-1"><Users size={11} />{t._count.teams}</span>
                    <span className="flex items-center gap-1"><Swords size={11} />{t._count.matches}</span>
                    <span className="capitalize">{t.format.replace("_", " ").toLowerCase()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-2 py-1 text-[13px] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none">
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <Link href={`/admin/tournaments/${t.id}`}>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </Link>
                  {isSuperAdmin && (
                    <button onClick={() => deleteTournament(t.id, t.name)} className="text-[var(--text-muted)] hover:text-[var(--destructive)] transition-colors p-2 rounded-lg hover:bg-[var(--destructive-soft)]">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
