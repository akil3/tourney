"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Trophy, Swords, BarChart3, Zap, UsersRound } from "lucide-react";

interface Stats {
  userCount: number;
  tournamentCount: number;
  activeTournaments: number;
  matchCount: number;
  completedMatches: number;
  teamCount: number;
  recentMatches: { id: string; homeTeam: { name: string } | null; awayTeam: { name: string } | null; winner: { name: string } | null; homeScore: number; awayScore: number; tournament: { name: string } }[];
  recentUsers: { id: string; name: string | null; email: string; role: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="text-[15px] text-[var(--text-muted)]">Loading stats...</div>;

  const statCards = [
    { icon: Users, value: stats.userCount, label: "Users", color: "text-[var(--text-secondary)]", bg: "bg-[var(--bg-muted)]" },
    { icon: Trophy, value: stats.tournamentCount, label: "Tournaments", color: "text-[var(--text-secondary)]", bg: "bg-[var(--bg-muted)]" },
    { icon: Zap, value: stats.activeTournaments, label: "Active", color: "text-[var(--accent)]", bg: "bg-[var(--accent-soft)]" },
    { icon: UsersRound, value: stats.teamCount, label: "Teams", color: "text-[var(--text-secondary)]", bg: "bg-[var(--bg-muted)]" },
    { icon: Swords, value: stats.matchCount, label: "Matches", color: "text-[var(--text-secondary)]", bg: "bg-[var(--bg-muted)]" },
    { icon: BarChart3, value: stats.completedMatches, label: "Completed", color: "text-[var(--success)]", bg: "bg-[var(--success-soft)]" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {statCards.map(({ icon: Icon, value, label, color, bg }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}><Icon size={18} className={color} strokeWidth={1.5} /></div>
              <div><p className="font-display text-[28px] tracking-wider text-[var(--text-primary)] leading-none">{value}</p><p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mt-1">{label}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-4">Recent Matches</h2>
          {stats.recentMatches.length === 0 ? <p className="text-[14px] text-[var(--text-muted)]">No completed matches yet</p> : (
            <div className="space-y-3">
              {stats.recentMatches.map(m => (
                <div key={m.id} className="flex items-center justify-between text-[14px]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--text-primary)] truncate"><span className={m.winner?.name === m.homeTeam?.name ? "font-semibold" : ""}>{m.homeTeam?.name ?? "TBD"}</span> <span className="text-[var(--text-muted)]">vs</span> <span className={m.winner?.name === m.awayTeam?.name ? "font-semibold" : ""}>{m.awayTeam?.name ?? "TBD"}</span></p>
                    <p className="text-[12px] text-[var(--text-muted)]">{m.tournament.name}</p>
                  </div>
                  <span className="font-display text-[18px] tracking-wider text-[var(--accent)] ml-3">{m.homeScore}-{m.awayScore}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-4">Recent Users</h2>
          {stats.recentUsers.length === 0 ? <p className="text-[14px] text-[var(--text-muted)]">No users yet</p> : (
            <div className="space-y-3">
              {stats.recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between text-[14px]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--text-primary)] truncate">{u.name || u.email}</p>
                    <p className="text-[12px] text-[var(--text-muted)]">{u.email}</p>
                  </div>
                  <Badge>{u.role}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
