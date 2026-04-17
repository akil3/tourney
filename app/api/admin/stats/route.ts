import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "superadmin" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const [userCount, tournamentCount, activeTournaments, matchCount, completedMatches, teamCount] = await Promise.all([
    prisma.user.count(),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: "IN_PROGRESS" } }),
    prisma.match.count(),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.team.count(),
  ]);

  const recentMatches = await prisma.match.findMany({
    where: { status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { homeTeam: true, awayTeam: true, winner: true, tournament: { select: { name: true } } },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({ userCount, tournamentCount, activeTournaments, matchCount, completedMatches, teamCount, recentMatches, recentUsers });
}
