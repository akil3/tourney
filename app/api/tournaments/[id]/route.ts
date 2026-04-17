import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isTournamentAdmin } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      teams: { include: { players: true, pool: true }, orderBy: { seed: "asc" } },
      pools: { include: { teams: true }, orderBy: { sortOrder: "asc" } },
      matches: {
        include: { homeTeam: true, awayTeam: true, winner: true },
        orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
      },
      brackets: true,
      admins: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { teams: true, matches: true } },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  return NextResponse.json(tournament);
}

export async function PUT(
  request: Request,
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

  const body = await request.json();

  const tournament = await prisma.tournament.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      venue: body.venue?.trim() || null,
      format: body.format,
      status: body.status,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      settings: body.settings ? JSON.stringify(body.settings) : undefined,
    },
  });

  return NextResponse.json(tournament);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Only super admins can delete tournaments" }, { status: 403 });
  }

  await prisma.tournament.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
