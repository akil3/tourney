import { SetScore } from "./types";

export interface StandingEntry {
  teamId: string;
  teamName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  rank: number;
}

interface MatchData {
  homeTeamId: string | null;
  awayTeamId: string | null;
  winnerId: string | null;
  sets: string; // JSON string of SetScore[]
  status: string;
  homeTeam: { id: string; name: string } | null;
  awayTeam: { id: string; name: string } | null;
}

export function calculateStandings(matches: MatchData[]): StandingEntry[] {
  const teamMap = new Map<string, StandingEntry>();

  // Initialize teams from matches
  for (const match of matches) {
    if (match.homeTeam && !teamMap.has(match.homeTeam.id)) {
      teamMap.set(match.homeTeam.id, createEntry(match.homeTeam.id, match.homeTeam.name));
    }
    if (match.awayTeam && !teamMap.has(match.awayTeam.id)) {
      teamMap.set(match.awayTeam.id, createEntry(match.awayTeam.id, match.awayTeam.name));
    }
  }

  // Tally completed matches
  for (const match of matches) {
    if (match.status !== "COMPLETED" || !match.homeTeamId || !match.awayTeamId) continue;

    const home = teamMap.get(match.homeTeamId);
    const away = teamMap.get(match.awayTeamId);
    if (!home || !away) continue;

    const sets: SetScore[] = JSON.parse(match.sets || "[]");

    home.matchesPlayed++;
    away.matchesPlayed++;

    if (match.winnerId === match.homeTeamId) {
      home.wins++;
      away.losses++;
    } else {
      away.wins++;
      home.losses++;
    }

    // Count sets and points
    for (const set of sets) {
      if (set.home > set.away) {
        home.setsWon++;
        away.setsLost++;
      } else if (set.away > set.home) {
        away.setsWon++;
        home.setsLost++;
      }
      home.pointsFor += set.home;
      home.pointsAgainst += set.away;
      away.pointsFor += set.away;
      away.pointsAgainst += set.home;
    }
  }

  // Sort: wins desc, set ratio desc, point diff desc
  const entries = Array.from(teamMap.values());
  entries.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const aSetRatio = a.setsLost === 0 ? Infinity : a.setsWon / a.setsLost;
    const bSetRatio = b.setsLost === 0 ? Infinity : b.setsWon / b.setsLost;
    if (bSetRatio !== aSetRatio) return bSetRatio - aSetRatio;
    const aPointDiff = a.pointsFor - a.pointsAgainst;
    const bPointDiff = b.pointsFor - b.pointsAgainst;
    return bPointDiff - aPointDiff;
  });

  // Assign ranks
  entries.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  return entries;
}

function createEntry(teamId: string, teamName: string): StandingEntry {
  return {
    teamId,
    teamName,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    setsWon: 0,
    setsLost: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    rank: 0,
  };
}
