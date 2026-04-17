import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "superadmin" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const [
    userCount, tournamentCount, activeTournaments, draftTournaments, completedTournaments,
    matchCount, completedMatches, liveMatches, pendingMatches,
    teamCount, playerCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: "IN_PROGRESS" } }),
    prisma.tournament.count({ where: { status: "DRAFT" } }),
    prisma.tournament.count({ where: { status: "COMPLETED" } }),
    prisma.match.count(),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.match.count({ where: { status: "IN_PROGRESS" } }),
    prisma.match.count({ where: { status: "PENDING" } }),
    prisma.team.count(),
    prisma.player.count(),
  ]);

  const recentMatches = await prisma.match.findMany({
    where: { status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: { homeTeam: true, awayTeam: true, winner: true, tournament: { select: { name: true } } },
  });

  const liveMatchDetails = await prisma.match.findMany({
    where: { status: "IN_PROGRESS" },
    include: { homeTeam: true, awayTeam: true, tournament: { select: { name: true } } },
  });

  const tournaments = await prisma.tournament.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { _count: { select: { teams: true, matches: true } } },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({
    userCount, tournamentCount, activeTournaments, draftTournaments, completedTournaments,
    matchCount, completedMatches, liveMatches, pendingMatches,
    teamCount, playerCount,
    recentMatches, liveMatchDetails, tournaments, recentUsers,
    matchCompletionRate: matchCount > 0 ? Math.round((completedMatches / matchCount) * 100) : 0,
    avgTeamsPerTournament: tournamentCount > 0 ? Math.round(teamCount / tournamentCount) : 0,
  });
}
