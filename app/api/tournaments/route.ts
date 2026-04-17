import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { teams: true, matches: true } } },
  });
  return NextResponse.json(tournaments);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Only super admins can create tournaments" }, { status: 403 });
  }

  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Tournament name is required" }, { status: 400 });
  }

  const tournament = await prisma.tournament.create({
    data: {
      name: body.name.trim(),
      venue: body.venue?.trim() || null,
      format: body.format || "POOL_PLAY",
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      settings: JSON.stringify(body.settings || {}),
    },
  });

  // Auto-assign creator as tournament admin
  await prisma.tournamentAdmin.create({
    data: { userId: session.user.id, tournamentId: tournament.id },
  });

  return NextResponse.json(tournament, { status: 201 });
}
