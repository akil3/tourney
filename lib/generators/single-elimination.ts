export interface TeamSeed {
  id: string;
  seed: number;
}

export interface MatchInsert {
  tournamentId: string;
  bracketId: string;
  bracketType: string;
  round: number;
  matchNumber: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  status: string;
  winnerId: string | null;
  nextMatchIndex?: number; // index in the returned array for wiring nextMatchId
}

export function generateSingleElimination(
  teams: TeamSeed[],
  tournamentId: string,
  bracketId: string,
  bracketType: string = "WINNERS"
): MatchInsert[] {
  const n = teams.length;
  if (n < 2) return [];

  const rounds = Math.ceil(Math.log2(n));
  const bracketSize = Math.pow(2, rounds);
  const seeded = seedBracket(teams, bracketSize);
  const matches: MatchInsert[] = [];

  // Round 1
  let matchNum = 0;
  for (let i = 0; i < bracketSize; i += 2) {
    const home = seeded[i];
    const away = seeded[i + 1];
    const isBye = !home || !away;
    matches.push({
      tournamentId,
      bracketId,
      bracketType,
      round: 1,
      matchNumber: matchNum,
      homeTeamId: home?.id ?? null,
      awayTeamId: away?.id ?? null,
      status: isBye ? "BYE" : "PENDING",
      winnerId: isBye ? (home?.id ?? away?.id ?? null) : null,
    });
    matchNum++;
  }

  // Subsequent rounds
  for (let round = 2; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    for (let pos = 0; pos < matchesInRound; pos++) {
      matches.push({
        tournamentId,
        bracketId,
        bracketType,
        round,
        matchNumber: matchNum,
        homeTeamId: null,
        awayTeamId: null,
        status: "PENDING",
        winnerId: null,
      });
      matchNum++;
    }
  }

  // Wire nextMatchIndex: each match in round R at position P feeds into
  // the match at round R+1, position floor(P/2)
  let offset = 0;
  for (let round = 1; round < rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    const nextRoundOffset = offset + matchesInRound;
    for (let pos = 0; pos < matchesInRound; pos++) {
      const nextPos = Math.floor(pos / 2);
      matches[offset + pos].nextMatchIndex = nextRoundOffset + nextPos;
    }
    offset += matchesInRound;
  }

  return matches;
}

function seedBracket(teams: TeamSeed[], bracketSize: number): (TeamSeed | null)[] {
  // Standard tournament bracket seeding
  // For 8 slots: [1,8,5,4,3,6,7,2] so 1 plays 8, 4 plays 5, etc.
  const positions = getSeededPositions(bracketSize);
  const result: (TeamSeed | null)[] = new Array(bracketSize).fill(null);

  const sorted = [...teams].sort((a, b) => a.seed - b.seed);
  for (let i = 0; i < sorted.length; i++) {
    result[positions[i]] = sorted[i];
  }

  return result;
}

function getSeededPositions(size: number): number[] {
  if (size === 1) return [0];
  if (size === 2) return [0, 1];

  const prev = getSeededPositions(size / 2);
  const result: number[] = [];

  for (const pos of prev) {
    result.push(pos * 2);
    result.push(size - 1 - pos * 2);
  }

  return result;
}
