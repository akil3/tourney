import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeMatchState } from "@/lib/scoring";
import { processMatchResult } from "@/lib/progression";
import { DEFAULT_SETTINGS, TournamentSettings, SetScore } from "@/lib/types";
import { auth } from "@/lib/auth";
import { isTournamentAdmin } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const { matchId } = await params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      winner: true,
      pool: true,
      tournament: true,
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!(await isTournamentAdmin(session.user.id, id))) {
    return NextResponse.json({ error: "Tournament admin required" }, { status: 403 });
  }

  const body = await request.json();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const settings: TournamentSettings = {
    ...DEFAULT_SETTINGS,
    ...JSON.parse(match.tournament.settings || "{}"),
  };

  // Update sets
  const sets: SetScore[] = body.sets ?? JSON.parse(match.sets || "[]");
  const state = computeMatchState(sets, settings);

  const updateData: Record<string, unknown> = {
    sets: JSON.stringify(sets),
    homeScore: state.homeSetsWon,
    awayScore: state.awaySetsWon,
  };

  if (state.isComplete) {
    updateData.status = "COMPLETED";
    updateData.winnerId =
      state.winner === "home" ? match.homeTeamId : match.awayTeamId;
  } else if (sets.some((s: SetScore) => s.home > 0 || s.away > 0)) {
    updateData.status = "IN_PROGRESS";
  }

  // Allow explicit status/court/time updates
  if (body.status) updateData.status = body.status;
  if (body.court !== undefined) updateData.court = body.court;
  if (body.scheduledTime !== undefined) {
    updateData.scheduledTime = body.scheduledTime ? new Date(body.scheduledTime) : null;
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: updateData,
    include: { homeTeam: true, awayTeam: true, winner: true, tournament: true },
  });

  // Process bracket progression if match just completed
  if (updated.status === "COMPLETED" && updated.winnerId) {
    await processMatchResult(matchId);
  }

  return NextResponse.json(updated);
}
