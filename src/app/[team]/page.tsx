import { notFound } from "next/navigation";
import { AgendaApp } from "@/components/AgendaApp";
import { TEAM_PRESETS, findTeamByAlias } from "@/lib/agenda-defaults";

export function generateStaticParams() {
  return TEAM_PRESETS.flatMap((p) => {
    const aliases = new Set<string>();
    aliases.add(p.id);
    aliases.add(p.shortName.toLowerCase());
    return Array.from(aliases).map((team) => ({ team }));
  });
}

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ team: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { team } = await params;
  const preset = findTeamByAlias(team);
  if (!preset) return { title: "Agenda Builder — two twelve°" };
  return {
    title: `${preset.shortName} Agenda — two twelve°`,
    description: `Weekly meeting agenda for ${preset.name}.`,
  };
}

export default async function TeamAgendaPage({ params }: PageProps) {
  const { team } = await params;
  const preset = findTeamByAlias(team);
  if (!preset) notFound();
  return <AgendaApp initialTeamId={preset.id} />;
}
