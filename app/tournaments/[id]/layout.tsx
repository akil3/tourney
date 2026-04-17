import { TournamentTabs } from "@/components/navigation/TournamentTabs";

export default async function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8">
        <TournamentTabs tournamentId={id} />
      </div>
      <div className="py-6 sm:py-8">{children}</div>
    </div>
  );
}
