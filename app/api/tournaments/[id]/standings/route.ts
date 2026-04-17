import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const pools = await prisma.pool.findMany({
    where: { tournamentId: id },
    include: {
      standings: {
        include: { team: true },
        orderBy: { rank: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(pools);
}
