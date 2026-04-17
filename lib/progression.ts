import { prisma } from "./prisma";
import { computeMatchState } from "./scoring";
import { TournamentSettings, DEFAULT_SETTINGS, SetScore } from "./types";

export async function processMatchResult(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match || match.status !== "COMPLETED" || !match.winnerId) return;

  const settings: TournamentSettings = {
    ...DEFAULT_SETTINGS,
    ...JSON.parse(match.tournament.settings || "{}"),
  };

  const sets: SetScore[] = JSON.parse(match.sets || "[]");
  const state = computeMatchState(sets, settings);

  // Update match scores
  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: state.homeSetsWon,
      awayScore: state.awaySetsWon,
    },
  });

  // Advance winner to next match
  if (match.nextMatchId) {
    const nextMatch = await prisma.match.findUnique({
      where: { id: match.nextMatchId },
    });

    if (nextMatch) {
      // Determine slot based on match number parity
      const isHomeSlot = match.matchNumber % 2 === 0;
      await prisma.match.update({
        where: { id: match.nextMatchId },
        data: isHomeSlot
          ? { homeTeamId: match.winnerId }
          : { awayTeamId: match.winnerId },
      });
    }
  }

  // Advance loser to losers bracket match (double elimination)
  if (match.loserNextMatchId) {
    const loserId =
      match.winnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
    if (loserId) {
      const loserMatch = await prisma.match.findUnique({
        where: { id: match.loserNextMatchId },
      });
      if (loserMatch) {
        const isHomeSlot = !loserMatch.homeTeamId;
        await prisma.match.update({
          where: { id: match.loserNextMatchId },
          data: isHomeSlot
            ? { homeTeamId: loserId }
            : { awayTeamId: loserId },
        });
      }
    }
  }

  // Update standings for pool matches
  if (match.poolId) {
    await updatePoolStandings(match.poolId);
  }
}

async function updatePoolStandings(poolId: string) {
  const matches = await prisma.match.findMany({
    where: { poolId, status: "COMPLETED" },
    include: { homeTeam: true, awayTeam: true },
  });

  const teams = await prisma.team.findMany({ where: { poolId } });

  for (const team of teams) {
    let wins = 0, losses = 0, setsWon = 0, setsLost = 0, pointsFor = 0, pointsAgainst = 0;
    let matchesPlayed = 0;

    for (const match of matches) {
      if (match.homeTeamId !== team.id && match.awayTeamId !== team.id) continue;
      matchesPlayed++;

      const isHome = match.homeTeamId === team.id;
      if (match.winnerId === team.id) wins++;
      else losses++;

      const sets: SetScore[] = JSON.parse(match.sets || "[]");
      for (const set of sets) {
        const myScore = isHome ? set.home : set.away;
        const theirScore = isHome ? set.away : set.home;
        if (myScore > theirScore) setsWon++;
        else if (theirScore > myScore) setsLost++;
        pointsFor += myScore;
        pointsAgainst += theirScore;
      }
    }

    await prisma.standing.upsert({
      where: { poolId_teamId: { poolId, teamId: team.id } },
      update: { matchesPlayed, wins, losses, setsWon, setsLost, pointsFor, pointsAgainst },
      create: { poolId, teamId: team.id, matchesPlayed, wins, losses, setsWon, setsLost, pointsFor, pointsAgainst },
    });
  }

  // Compute ranks
  const standings = await prisma.standing.findMany({
    where: { poolId },
    orderBy: [{ wins: "desc" }, { setsWon: "desc" }],
  });

  for (let i = 0; i < standings.length; i++) {
    await prisma.standing.update({
      where: { id: standings[i].id },
      data: { rank: i + 1 },
    });
  }
}
