import { notFound } from "next/navigation";
import { AgendaApp } from "@/components/AgendaApp";
import { CHAPTER_PRESETS } from "@/lib/agenda-defaults";

export function generateStaticParams() {
  return CHAPTER_PRESETS.filter((p) => p.id !== "blank").flatMap((p) => {
    const aliases = new Set<string>();
    aliases.add(p.id);
    if (p.shortName) aliases.add(p.shortName.toLowerCase());
    return Array.from(aliases).map((team) => ({ team }));
  });
}

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ team: string }>;
}

const ALIAS_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const p of CHAPTER_PRESETS) {
    if (p.id === "blank") continue;
    map[p.id.toLowerCase()] = p.id;
    if (p.shortName) map[p.shortName.toLowerCase()] = p.id;
  }
  return map;
})();

export async function generateMetadata({ params }: PageProps) {
  const { team } = await params;
  const presetId = ALIAS_MAP[team.toLowerCase()];
  const preset = CHAPTER_PRESETS.find((p) => p.id === presetId);
  if (!preset) return { title: "Agenda Builder — two twelve°" };
  return {
    title: `${preset.shortName || preset.name} Agenda — two twelve°`,
    description: `Weekly meeting agenda builder for ${preset.name}. ${preset.tagline}`.trim(),
  };
}

export default async function TeamAgendaPage({ params }: PageProps) {
  const { team } = await params;
  const presetId = ALIAS_MAP[team.toLowerCase()];
  if (!presetId) notFound();
  return <AgendaApp initialPresetId={presetId} />;
}
