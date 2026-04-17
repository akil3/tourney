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
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
      <TournamentTabs tournamentId={id} />
      <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
    </div>
  );
}
