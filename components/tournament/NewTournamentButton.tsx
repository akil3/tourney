"use client";

import Link from "next/link";
import { useRole } from "@/lib/hooks/useRole";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function NewTournamentButton() {
  const { isSuperAdmin } = useRole();
  if (!isSuperAdmin) return null;
  return (
    <Link href="/tournaments/new">
      <Button><Plus size={16} strokeWidth={2.5} /> New</Button>
    </Link>
  );
}
