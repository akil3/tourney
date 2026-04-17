import { auth } from "./auth";
import { prisma } from "./prisma";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "superadmin") {
    throw new Error("Forbidden: super admin required");
  }
  return session;
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === "superadmin";
}

export async function isTournamentAdmin(
  userId: string,
  tournamentId: string
): Promise<boolean> {
  // Super admins are admins of all tournaments
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === "superadmin") return true;

  const admin = await prisma.tournamentAdmin.findUnique({
    where: { userId_tournamentId: { userId, tournamentId } },
  });
  return !!admin;
}

export async function requireTournamentAdmin(tournamentId: string) {
  const session = await requireAuth();
  const isAdmin = await isTournamentAdmin(session.user.id, tournamentId);
  if (!isAdmin) {
    throw new Error("Forbidden: tournament admin required");
  }
  return session;
}
