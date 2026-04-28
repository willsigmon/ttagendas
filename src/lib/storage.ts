import type { AgendaItem, ChapterPreset } from "./agenda-defaults";

export interface AgendaState {
  preset: ChapterPreset;
  meetingDate: string;
  spotlightName: string;
  spotlightCompany: string;
  mentorName: string;
  tipText: string;
  notes: string;
  items: AgendaItem[];
}

const KEY_PREFIX = "two-twelve-agenda:";

export function storageKey(presetId: string, meetingDate: string): string {
  return `${KEY_PREFIX}${presetId}:${meetingDate}`;
}

export function loadAgenda(presetId: string, meetingDate: string): AgendaState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(presetId, meetingDate));
    if (!raw) return null;
    return JSON.parse(raw) as AgendaState;
  } catch {
    return null;
  }
}

export function saveAgenda(state: AgendaState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey(state.preset.id, state.meetingDate),
    JSON.stringify(state),
  );
}

export function recentAgendas(presetId: string, limit = 6): AgendaState[] {
  if (typeof window === "undefined") return [];
  const out: AgendaState[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k || !k.startsWith(`${KEY_PREFIX}${presetId}:`)) continue;
    try {
      const v = window.localStorage.getItem(k);
      if (v) out.push(JSON.parse(v) as AgendaState);
    } catch {
      // ignore
    }
  }
  return out
    .sort((a, b) => b.meetingDate.localeCompare(a.meetingDate))
    .slice(0, limit);
}

export function savedChapterDefaults(presetId: string): Partial<ChapterPreset> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${KEY_PREFIX}preset:${presetId}`);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ChapterPreset>;
  } catch {
    return null;
  }
}

export function saveChapterDefaults(presetId: string, defaults: Partial<ChapterPreset>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${KEY_PREFIX}preset:${presetId}`, JSON.stringify(defaults));
}
