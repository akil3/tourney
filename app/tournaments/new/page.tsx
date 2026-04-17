"use client";
import { useState, useEffect } from "react"; import { useRouter } from "next/navigation"; import { Input } from "@/components/ui/Input"; import { Select } from "@/components/ui/Select"; import { Button } from "@/components/ui/Button"; import { Card } from "@/components/ui/Card"; import { useRole } from "@/lib/hooks/useRole";
const formatOptions = [{ value: "POOL_PLAY", label: "Pool Play + Elimination" }, { value: "SINGLE_ELIMINATION", label: "Single Elimination" }, { value: "DOUBLE_ELIMINATION", label: "Double Elimination" }, { value: "ROUND_ROBIN", label: "Round Robin" }];

export default function NewTournamentPage() {
  const router = useRouter(); const { isSuperAdmin, isLoading } = useRole(); const [loading, setLoading] = useState(false); const [error, setError] = useState("");

  useEffect(() => { if (!isLoading && !isSuperAdmin) router.push("/"); }, [isLoading, isSuperAdmin, router]);
  if (isLoading) return <div className="text-[15px] text-[var(--text-muted)]">Loading...</div>;
  if (!isSuperAdmin) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setError(""); setLoading(true); const fd = new FormData(e.currentTarget); const body = { name: fd.get("name"), venue: fd.get("venue") || null, format: fd.get("format"), settings: { setsToWin: Number(fd.get("setsToWin")) || 2, pointsToWin: Number(fd.get("pointsToWin")) || 25, decidingSetPoints: Number(fd.get("decidingSetPoints")) || 15, winBy: Number(fd.get("winBy")) || 2, pointCap: fd.get("pointCap") ? Number(fd.get("pointCap")) : null, poolCount: Number(fd.get("poolCount")) || 2, advancePerPool: Number(fd.get("advancePerPool")) || 2 } }; const res = await fetch("/api/tournaments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (!res.ok) { const data = await res.json(); setError(data.error || "Failed"); setLoading(false); return; } const t = await res.json(); router.push(`/tournaments/${t.id}`); }
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display text-[clamp(36px,5vw,52px)] tracking-wider text-[var(--text-primary)] leading-none mb-8">CREATE TOURNAMENT</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card><h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-4">Basic Info</h2><div className="flex flex-col gap-4"><Input id="name" name="name" label="Tournament Name" placeholder="Spring Classic 2026" required /><Input id="venue" name="venue" label="Venue" placeholder="Main Gym / Sand Courts / Grass Field" /><Select id="format" name="format" label="Format" options={formatOptions} /></div></Card>
        <Card><h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-4">Scoring Rules</h2><div className="grid grid-cols-2 gap-4"><Input id="setsToWin" name="setsToWin" label="Sets to Win" type="number" defaultValue={2} min={1} max={5} /><Input id="pointsToWin" name="pointsToWin" label="Points per Set" type="number" defaultValue={25} min={1} /><Input id="decidingSetPoints" name="decidingSetPoints" label="Deciding Set" type="number" defaultValue={15} min={1} /><Input id="winBy" name="winBy" label="Win By" type="number" defaultValue={2} min={1} max={5} /><Input id="pointCap" name="pointCap" label="Point Cap" type="number" placeholder="No cap" /></div></Card>
        <Card><h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-4">Pool Settings</h2><p className="text-[13px] text-[var(--text-muted)] mb-4">Only applies to Pool Play format</p><div className="grid grid-cols-2 gap-4"><Input id="poolCount" name="poolCount" label="Pools" type="number" defaultValue={2} min={1} max={8} /><Input id="advancePerPool" name="advancePerPool" label="Advance Per Pool" type="number" defaultValue={2} min={1} max={8} /></div></Card>
        {error && <p className="text-[14px] text-[var(--destructive)]">{error}</p>}
        <div className="flex gap-3 justify-end"><Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Tournament"}</Button></div>
      </form>
    </div>
  );
}
