"use client";

import { useRole } from "@/lib/hooks/useRole";
import { Button } from "@/components/ui/Button";
import { Swords, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TournamentActions({ tournamentId, status, teamCount }: { tournamentId: string; status: string; teamCount: number }) {
  const { isAuthenticated } = useRole();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  if (!isAuthenticated) return null;

  async function handleGenerate() {
    setGenerating(true);
    await fetch(`/api/tournaments/${tournamentId}/generate`, { method: "POST" });
    setGenerating(false);
    router.refresh();
  }

  return (
    <>
      <Link href={`/tournaments/${tournamentId}/teams`}>
        <Button variant="secondary" className="w-full justify-start"><Users size={16} /> Manage Teams</Button>
      </Link>
      {status === "DRAFT" && teamCount >= 2 && (
        <Button onClick={handleGenerate} disabled={generating} className="w-full justify-start">
          <Swords size={16} /> {generating ? "Generating..." : "Generate Schedule"}
        </Button>
      )}
    </>
  );
}
