"use client";
import { useState, useEffect, useCallback } from "react"; import { useParams } from "next/navigation"; import { Card } from "@/components/ui/Card"; import { Input } from "@/components/ui/Input"; import { Button } from "@/components/ui/Button"; import { Badge } from "@/components/ui/Badge"; import { Plus, Trash2, Users, ChevronDown } from "lucide-react";
interface Player { id: string; name: string; jerseyNumber: number | null; isCaptain: boolean; } interface Team { id: string; name: string; seed: number | null; players: Player[]; pool: { name: string } | null; }

export default function TeamsPage() {
  const params = useParams(); const tournamentId = params.id as string; const [teams, setTeams] = useState<Team[]>([]); const [newTeamName, setNewTeamName] = useState(""); const [loading, setLoading] = useState(true); const [expandedTeam, setExpandedTeam] = useState<string | null>(null); const [newPlayerName, setNewPlayerName] = useState("");
  const fetchTeams = useCallback(async () => { const res = await fetch(`/api/tournaments/${tournamentId}/teams`); setTeams(await res.json()); setLoading(false); }, [tournamentId]); useEffect(() => { fetchTeams(); }, [fetchTeams]);
  async function addTeam(e: React.FormEvent) { e.preventDefault(); if (!newTeamName.trim()) return; await fetch(`/api/tournaments/${tournamentId}/teams`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTeamName.trim() }) }); setNewTeamName(""); fetchTeams(); }
  async function removeTeam(teamId: string) { await fetch(`/api/tournaments/${tournamentId}/teams?teamId=${teamId}`, { method: "DELETE" }); fetchTeams(); }
  async function addPlayer(teamId: string) { if (!newPlayerName.trim()) return; await fetch(`/api/tournaments/${tournamentId}/teams/${teamId}/players`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newPlayerName.trim() }) }); setNewPlayerName(""); fetchTeams(); }
  async function removePlayer(teamId: string, playerId: string) { await fetch(`/api/tournaments/${tournamentId}/teams/${teamId}/players?playerId=${playerId}`, { method: "DELETE" }); fetchTeams(); }
  if (loading) return <div className="text-[15px] text-[var(--text-muted)]">Loading teams...</div>;
  return (
    <div>
      <h1 className="font-display text-[clamp(36px,5vw,52px)] tracking-wider text-[var(--text-primary)] leading-none mb-8">TEAMS <span className="text-[var(--accent)]">{teams.length}</span></h1>
      <form onSubmit={addTeam} className="flex gap-2 mb-6"><Input placeholder="Team name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="flex-1" /><Button type="submit" disabled={!newTeamName.trim()}><Plus size={16} /> Add</Button></form>
      {teams.length === 0 ? (<Card className="text-center py-12 border-dashed"><Users size={40} className="mx-auto text-[var(--text-muted)] mb-3" strokeWidth={1} /><p className="text-[15px] text-[var(--text-muted)]">No teams registered yet</p></Card>) : (
        <div className="space-y-2">{teams.map((team) => (
          <Card key={team.id} padding={false}>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-muted)] transition-colors rounded-t-2xl" onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}>
              <div className="flex items-center gap-3"><span className="font-display text-[20px] tracking-wider text-[var(--text-muted)] w-8 text-right">{team.seed ?? "-"}</span><span className="text-[15px] font-semibold text-[var(--text-primary)]">{team.name}</span>{team.pool && <Badge>{team.pool.name}</Badge>}<span className="text-[13px] text-[var(--text-muted)]">{team.players.length} players</span></div>
              <div className="flex items-center gap-1">
                <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${expandedTeam === team.id ? "rotate-180" : ""}`} />
                <button onClick={(e) => { e.stopPropagation(); removeTeam(team.id); }} className="text-[var(--text-muted)] hover:text-[var(--destructive)] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-[var(--destructive-soft)]"><Trash2 size={16} /></button>
              </div>
            </div>
            {expandedTeam === team.id && (<div className="border-t border-[var(--border)] px-4 py-3">
              <div className="space-y-1 mb-3">{team.players.map((player) => (<div key={player.id} className="flex items-center justify-between text-[14px] py-1.5"><div className="flex items-center gap-2">{player.jerseyNumber != null && <span className="font-display text-[16px] tracking-wider text-[var(--text-muted)]">#{player.jerseyNumber}</span>}<span className="text-[var(--text-secondary)]">{player.name}</span>{player.isCaptain && <Badge>C</Badge>}</div><button onClick={() => removePlayer(team.id, player.id)} className="text-[var(--text-muted)] hover:text-[var(--destructive)] transition-colors p-1 rounded-lg hover:bg-[var(--destructive-soft)]"><Trash2 size={14} /></button></div>))}</div>
              <form onSubmit={(e) => { e.preventDefault(); addPlayer(team.id); }} className="flex gap-2"><Input placeholder="Player name" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} className="flex-1" /><Button type="submit" size="sm" disabled={!newPlayerName.trim()}><Plus size={14} /></Button></form>
            </div>)}
          </Card>
        ))}</div>
      )}
    </div>
  );
}
