import { TeamSeed, MatchInsert, generateSingleElimination } from "./single-elimination";

export function generateDoubleElimination(
  teams: TeamSeed[],
  tournamentId: string,
  bracketId: string
): MatchInsert[] {
  // Generate winners bracket
  const winnersMatches = generateSingleElimination(teams, tournamentId, bracketId, "WINNERS");
  const n = teams.length;
  const rounds = Math.ceil(Math.log2(n));
  const allMatches = [...winnersMatches];

  // Generate losers bracket
  // Losers bracket has (rounds - 1) * 2 rounds for a standard double elim
  // But simplified: losers from each winners round drop into losers bracket
  const losersRounds = (rounds - 1) * 2;
  let matchNum = winnersMatches.length;

  for (let lr = 1; lr <= losersRounds; lr++) {
    // Matches per losers round halves every 2 rounds
    const matchesInRound = Math.pow(2, Math.max(0, rounds - 1 - Math.ceil(lr / 2)));
    for (let pos = 0; pos < matchesInRound; pos++) {
      allMatches.push({
        tournamentId,
        bracketId,
        bracketType: "LOSERS",
        round: lr,
        matchNumber: matchNum,
        homeTeamId: null,
        awayTeamId: null,
        status: "PENDING",
        winnerId: null,
      });
      matchNum++;
    }
  }

  // Grand finals
  allMatches.push({
    tournamentId,
    bracketId,
    bracketType: "GRAND_FINALS",
    round: 1,
    matchNumber: matchNum,
    homeTeamId: null,
    awayTeamId: null,
    status: "PENDING",
    winnerId: null,
  });

  return allMatches;
}
