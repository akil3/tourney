import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isTournamentAdmin } from "@/lib/auth-helpers";
import { generateSingleElimination, TeamSeed } from "@/lib/generators/single-elimination";
import { generateDoubleElimination } from "@/lib/generators/double-elimination";
import { generateRoundRobin } from "@/lib/generators/round-robin";
import { generatePoolPlay } from "@/lib/generators/pool-play";
import { DEFAULT_SETTINGS, TournamentSettings } from "@/lib/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!(await isTournamentAdmin(session.user.id, id))) {
    return NextResponse.json({ error: "Tournament admin required" }, { status: 403 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { teams: { orderBy: { seed: "asc" } } },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  if (tournament.teams.length < 2) {
    return NextResponse.json({ error: "Need at least 2 teams" }, { status: 400 });
  }

  // Clear existing matches, pools, brackets
  await prisma.match.deleteMany({ where: { tournamentId: id } });
  await prisma.standing.deleteMany({ where: { pool: { tournamentId: id } } });
  await prisma.team.updateMany({ where: { tournamentId: id }, data: { poolId: null } });
  await prisma.pool.deleteMany({ where: { tournamentId: id } });
  await prisma.bracket.deleteMany({ where: { tournamentId: id } });

  const settings: TournamentSettings = {
    ...DEFAULT_SETTINGS,
    ...JSON.parse(tournament.settings || "{}"),
  };

  const teams: TeamSeed[] = tournament.teams.map((t: { id: string; seed: number | null }, i: number) => ({
    id: t.id,
    seed: t.seed ?? i + 1,
  }));

  switch (tournament.format) {
    case "SINGLE_ELIMINATION": {
      const bracket = await prisma.bracket.create({
        data: { tournamentId: id, name: "Main Bracket", type: "SINGLE" },
      });
      const matchInserts = generateSingleElimination(teams, id, bracket.id);
      await createMatchesWithLinks(matchInserts);
      break;
    }

    case "DOUBLE_ELIMINATION": {
      const bracket = await prisma.bracket.create({
        data: { tournamentId: id, name: "Main Bracket", type: "DOUBLE" },
      });
      const matchInserts = generateDoubleElimination(teams, id, bracket.id);
      await createMatchesWithLinks(matchInserts);
      break;
    }

    case "ROUND_ROBIN": {
      const pool = await prisma.pool.create({
        data: { tournamentId: id, name: "Round Robin", sortOrder: 0 },
      });
      // Assign all teams to the pool
      for (const team of tournament.teams) {
        await prisma.team.update({ where: { id: team.id }, data: { poolId: pool.id } });
      }
      const matchInserts = generateRoundRobin(teams, id, pool.id);
      for (const m of matchInserts) {
        await prisma.match.create({
          data: {
            tournamentId: m.tournamentId,
            poolId: pool.id,
            bracketType: m.bracketType,
            round: m.round,
            matchNumber: m.matchNumber,
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            status: m.status,
            winnerId: m.winnerId,
          },
        });
      }
      // Create standing entries
      for (const team of tournament.teams) {
        await prisma.standing.create({
          data: { poolId: pool.id, teamId: team.id },
        });
      }
      break;
    }

    case "POOL_PLAY": {
      const poolData = generatePoolPlay(teams, id, {
        poolCount: settings.poolCount,
        advancePerPool: settings.advancePerPool,
      });

      for (let i = 0; i < poolData.length; i++) {
        const pd = poolData[i];
        const pool = await prisma.pool.create({
          data: { tournamentId: id, name: pd.name, sortOrder: i },
        });

        // Assign teams to pool
        for (const team of pd.teams) {
          await prisma.team.update({ where: { id: team.id }, data: { poolId: pool.id } });
        }

        // Create pool matches
        for (const m of pd.matches) {
          await prisma.match.create({
            data: {
              tournamentId: m.tournamentId,
              poolId: pool.id,
              bracketType: "POOL",
              round: m.round,
              matchNumber: m.matchNumber,
              homeTeamId: m.homeTeamId,
              awayTeamId: m.awayTeamId,
              status: m.status,
              winnerId: m.winnerId,
            },
          });
        }

        // Create standing entries
        for (const team of pd.teams) {
          await prisma.standing.create({
            data: { poolId: pool.id, teamId: team.id },
          });
        }
      }
      break;
    }
  }

  // Update tournament status
  await prisma.tournament.update({
    where: { id },
    data: { status: "IN_PROGRESS" },
  });

  return NextResponse.json({ success: true });
}

async function createMatchesWithLinks(
  matchInserts: ReturnType<typeof generateSingleElimination>
) {
  // First pass: create all matches
  const createdIds: string[] = [];
  for (const m of matchInserts) {
    const created = await prisma.match.create({
      data: {
        tournamentId: m.tournamentId,
        bracketId: m.bracketId || null,
        bracketType: m.bracketType,
        round: m.round,
        matchNumber: m.matchNumber,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        status: m.status,
        winnerId: m.winnerId,
      },
    });
    createdIds.push(created.id);
  }

  // Second pass: wire up nextMatchId
  for (let i = 0; i < matchInserts.length; i++) {
    const nextIdx = matchInserts[i].nextMatchIndex;
    if (nextIdx !== undefined && createdIds[nextIdx]) {
      await prisma.match.update({
        where: { id: createdIds[i] },
        data: { nextMatchId: createdIds[nextIdx] },
      });
    }
  }

  // Advance BYE winners
  for (let i = 0; i < matchInserts.length; i++) {
    if (matchInserts[i].status === "BYE" && matchInserts[i].winnerId) {
      const nextIdx = matchInserts[i].nextMatchIndex;
      if (nextIdx !== undefined && createdIds[nextIdx]) {
        const isHomeSlot = matchInserts[i].matchNumber % 2 === 0;
        await prisma.match.update({
          where: { id: createdIds[nextIdx] },
          data: isHomeSlot
            ? { homeTeamId: matchInserts[i].winnerId }
            : { awayTeamId: matchInserts[i].winnerId },
        });
      }
    }
  }
}
