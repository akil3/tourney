// Auth type extensions
import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      image?: string | null;
    };
  }
}

// JWT type extension handled via callbacks in lib/auth.ts
// The role and id fields are added to the token in the jwt callback

// Tournament settings
export interface TournamentSettings {
  setsToWin: number;
  pointsToWin: number;
  decidingSetPoints: number;
  pointCap: number | null;
  winBy: number;
  poolCount: number;
  advancePerPool: number;
}

export const DEFAULT_SETTINGS: TournamentSettings = {
  setsToWin: 2,
  pointsToWin: 25,
  decidingSetPoints: 15,
  pointCap: null,
  winBy: 2,
  poolCount: 2,
  advancePerPool: 2,
};

// Set score
export interface SetScore {
  home: number;
  away: number;
}

// Standing with team info
export interface StandingWithTeam {
  id: string;
  teamId: string;
  teamName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  rank: number | null;
}
