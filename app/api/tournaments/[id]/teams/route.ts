import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isTournamentAdmin } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teams = await prisma.team.findMany({
    where: { tournamentId: id },
    include: { players: true, pool: true },
    orderBy: { seed: "asc" },
  });
  return NextResponse.json(teams);
}

export async function POST(
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

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  const teamCount = await prisma.team.count({ where: { tournamentId: id } });

  const team = await prisma.team.create({
    data: {
      name: body.name.trim(),
      tournamentId: id,
      captainId: body.captainId || null,
      seed: body.seed ?? teamCount + 1,
    },
    include: { players: true },
  });

  return NextResponse.json(team, { status: 201 });
}

export async function DELETE(
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

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }

  await prisma.team.delete({
    where: { id: teamId, tournamentId: id },
  });

  return NextResponse.json({ success: true });
}
