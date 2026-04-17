import { TeamSeed, MatchInsert } from "./single-elimination";

export function generateRoundRobin(
  teams: TeamSeed[],
  tournamentId: string,
  poolId?: string
): MatchInsert[] {
  if (teams.length < 2) return [];

  // Pad to even number if needed (add a BYE placeholder)
  const paddedTeams = [...teams];
  const hasBye = teams.length % 2 !== 0;
  if (hasBye) {
    paddedTeams.push({ id: "__BYE__", seed: teams.length + 1 });
  }

  const n = paddedTeams.length;
  const rounds = n - 1;
  const matchesPerRound = n / 2;
  const matches: MatchInsert[] = [];
  let matchNum = 0;

  // Circle method: fix first team, rotate the rest
  const fixed = paddedTeams[0];
  const rotating = paddedTeams.slice(1);

  for (let round = 0; round < rounds; round++) {
    const currentOrder = [fixed, ...rotating];

    for (let i = 0; i < matchesPerRound; i++) {
      const home = currentOrder[i];
      const away = currentOrder[n - 1 - i];

      // Skip BYE matches
      if (home.id === "__BYE__" || away.id === "__BYE__") continue;

      matches.push({
        tournamentId,
        bracketId: "",
        bracketType: "POOL",
        round: round + 1,
        matchNumber: matchNum,
        homeTeamId: home.id,
        awayTeamId: away.id,
        status: "PENDING",
        winnerId: null,
      });
      matchNum++;
    }

    // Rotate: move last to second position
    rotating.unshift(rotating.pop()!);
  }

  // Assign poolId if provided
  if (poolId) {
    for (const match of matches) {
      (match as MatchInsert & { poolId?: string }).poolId = poolId;
    }
  }

  return matches;
}
