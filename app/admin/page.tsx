"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Trophy, Swords, Zap, UsersRound, UserCheck, TrendingUp, Activity, Clock } from "lucide-react";
import Link from "next/link";

interface Stats {
  userCount: number;
  tournamentCount: number;
  activeTournaments: number;
  draftTournaments: number;
  completedTournaments: number;
  matchCount: number;
  completedMatches: number;
  liveMatches: number;
  pendingMatches: number;
  teamCount: number;
  playerCount: number;
  matchCompletionRate: number;
  avgTeamsPerTournament: number;
  recentMatches: { id: string; homeTeam: { name: string } | null; awayTeam: { name: string } | null; winner: { name: string } | null; homeScore: number; awayScore: number; sets: string; tournament: { name: string } }[];
  liveMatchDetails: { id: string; homeTeam: { name: string } | null; awayTeam: { name: string } | null; sets: string; tournament: { name: string } }[];
  tournaments: { id: string; name: string; status: string; format: string; _count: { teams: number; matches: number } }[];
  recentUsers: { id: string; name: string | null; email: string; role: string; createdAt: string }[];
}

const statusVariant = { DRAFT: "pending" as const, IN_PROGRESS: "in-progress" as const, COMPLETED: "completed" as const };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { fetch("/api/admin/stats").then(r => r.json()).then(setStats); }, []);

  if (!stats) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Activity size={32} className="mx-auto text-[var(--accent)] animate-pulse mb-3" />
        <p className="text-[var(--text-secondary)] text-[14px]">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ═══ LIVE TICKER ═══ */}
      {stats.liveMatches > 0 && (
        <div className="bg-[var(--accent)] rounded-2xl p-4 overflow-hidden relative">
          <div className="absolute top-3 right-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-bold text-[var(--text-invert)] uppercase tracking-widest">Live Now</span>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-1">
            {stats.liveMatchDetails.map(m => {
              const sets = JSON.parse(m.sets || "[]") as { home: number; away: number }[];
              const currentSet = sets.length > 0 ? sets[sets.length - 1] : null;
              return (
                <div key={m.id} className="bg-[var(--text-invert)]/15 backdrop-blur rounded-xl px-4 py-3 min-w-[220px] shrink-0">
                  <p className="text-[10px] font-bold text-[var(--text-invert)]/80 uppercase tracking-widest mb-2">{m.tournament.name}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[14px] font-semibold text-[var(--text-invert)] truncate">{m.homeTeam?.name ?? "TBD"}</span>
                    <span className="font-display text-[24px] text-[var(--text-invert)] tracking-wider">{currentSet ? `${currentSet.home}:${currentSet.away}` : "0:0"}</span>
                    <span className="text-[14px] font-semibold text-[var(--text-invert)] truncate">{m.awayTeam?.name ?? "TBD"}</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-invert)]/70 text-center mt-1">Set {sets.length || 1}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ HERO STATS ROW ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Active</p>
              <p className="font-display text-[56px] leading-none tracking-wider text-[var(--accent)] mt-1">{stats.activeTournaments}</p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">{stats.draftTournaments} draft &middot; {stats.completedTournaments} done</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
              <Zap size={18} className="text-[var(--accent)]" />
            </div>
          </div>
          {/* Accent stripe at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]" style={{ opacity: stats.activeTournaments > 0 ? 1 : 0.2 }} />
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Matches</p>
              <p className="font-display text-[56px] leading-none tracking-wider text-[var(--text-primary)] mt-1">{stats.matchCount}</p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">{stats.liveMatches} live &middot; {stats.pendingMatches} pending</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center">
              <Swords size={18} className="text-[var(--text-secondary)]" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Teams</p>
              <p className="font-display text-[56px] leading-none tracking-wider text-[var(--text-primary)] mt-1">{stats.teamCount}</p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">{stats.playerCount} players</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center">
              <UsersRound size={18} className="text-[var(--text-secondary)]" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Users</p>
              <p className="font-display text-[56px] leading-none tracking-wider text-[var(--text-primary)] mt-1">{stats.userCount}</p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-1">registered accounts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center">
              <Users size={18} className="text-[var(--text-secondary)]" />
            </div>
          </div>
        </Card>
      </div>

      {/* ═══ COMPLETION RATE BAR ═══ */}
      {stats.matchCount > 0 && (
        <Card className="!p-3 sm:!p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[var(--accent)]" />
              <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Match Completion</span>
            </div>
            <span className="font-display text-[28px] tracking-wider text-[var(--accent)] leading-none">{stats.matchCompletionRate}%</span>
          </div>
          <div className="w-full bg-[var(--bg-muted)] rounded-full h-2.5 overflow-hidden">
            <div className="bg-[var(--accent)] h-full rounded-full transition-all duration-700" style={{ width: `${stats.matchCompletionRate}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--text-secondary)] mt-1.5">
            <span>{stats.completedMatches} completed</span>
            <span>{stats.pendingMatches + stats.liveMatches} remaining</span>
          </div>
        </Card>
      )}

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Results — spans 3 cols */}
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em]">Recent Results</h2>
              <Badge>{stats.completedMatches} total</Badge>
            </div>
            {stats.recentMatches.length === 0 ? (
              <p className="text-[14px] text-[var(--text-secondary)] py-8 text-center">No completed matches yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentMatches.map(m => {
                  const sets = JSON.parse(m.sets || "[]") as { home: number; away: number }[];
                  const homeWon = m.winner?.name === m.homeTeam?.name;
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--bg-base)] transition-colors">
                      {/* Score card */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-1 min-w-0 text-right">
                          <p className={`text-[14px] truncate ${homeWon ? "font-bold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>{m.homeTeam?.name ?? "TBD"}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`font-display text-[24px] tracking-wider ${homeWon ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>{m.homeScore}</span>
                          <span className="text-[var(--text-secondary)] text-[12px]">:</span>
                          <span className={`font-display text-[24px] tracking-wider ${!homeWon ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>{m.awayScore}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] truncate ${!homeWon ? "font-bold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>{m.awayTeam?.name ?? "TBD"}</p>
                        </div>
                      </div>
                      {/* Set scores */}
                      <div className="hidden sm:flex gap-1 shrink-0">
                        {sets.map((s, i) => (
                          <span key={i} className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded">
                            {s.home}-{s.away}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right column — spans 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tournaments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em]">Tournaments</h2>
              <Link href="/admin/tournaments" className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">View all →</Link>
            </div>
            {stats.tournaments.length === 0 ? (
              <p className="text-[14px] text-[var(--text-secondary)] py-4 text-center">No tournaments</p>
            ) : (
              <div className="space-y-2">
                {stats.tournaments.map(t => {
                  const completedCount = stats.recentMatches.filter(m => m.tournament.name === t.name).length;
                  const progress = t._count.matches > 0 ? Math.round((completedCount / t._count.matches) * 100) : 0;
                  return (
                    <Link key={t.id} href={`/tournaments/${t.id}`} className="block">
                      <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--bg-muted)] transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{t.name}</p>
                            <Badge variant={statusVariant[t.status as keyof typeof statusVariant] ?? "pending"}>{t.status.replace("_", " ")}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)] mt-0.5">
                            <span>{t._count.teams} teams</span>
                            <span>{t._count.matches} matches</span>
                            <span className="capitalize">{t.format.replace("_", " ").toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Users */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em]">Recent Users</h2>
              <Link href="/admin/users" className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">View all →</Link>
            </div>
            {stats.recentUsers.length === 0 ? (
              <p className="text-[14px] text-[var(--text-secondary)] py-4 text-center">No users</p>
            ) : (
              <div className="space-y-1">
                {stats.recentUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-secondary)] font-display text-[14px] tracking-wider shrink-0">
                        {(u.name?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{u.name || u.email.split("@")[0]}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] truncate">{u.email}</p>
                      </div>
                    </div>
                    <Badge>{u.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick KPIs */}
          <Card className="!p-3 sm:!p-4">
            <h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-3">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-muted)] rounded-xl p-3 text-center">
                <p className="font-display text-[28px] tracking-wider text-[var(--text-primary)] leading-none">{stats.avgTeamsPerTournament}</p>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Avg Teams/Tourney</p>
              </div>
              <div className="bg-[var(--bg-muted)] rounded-xl p-3 text-center">
                <p className="font-display text-[28px] tracking-wider text-[var(--text-primary)] leading-none">{stats.playerCount}</p>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Total Players</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
