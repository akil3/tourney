import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isTournamentAdmin } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admins = await prisma.tournamentAdmin.findMany({
    where: { tournamentId: id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
  return NextResponse.json(admins);
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
  // Only super admins or existing tournament admins can add new admins
  if (!(await isTournamentAdmin(session.user.id, id))) {
    return NextResponse.json({ error: "Tournament admin required" }, { status: 403 });
  }

  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }

  const existing = await prisma.tournamentAdmin.findUnique({
    where: { userId_tournamentId: { userId: user.id, tournamentId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: "User is already an admin of this tournament" }, { status: 409 });
  }

  const admin = await prisma.tournamentAdmin.create({
    data: { userId: user.id, tournamentId: id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  return NextResponse.json(admin, { status: 201 });
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
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  await prisma.tournamentAdmin.delete({
    where: { userId_tournamentId: { userId, tournamentId: id } },
  });

  return NextResponse.json({ success: true });
}
