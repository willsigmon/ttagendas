import type { RosterMember, TeamPreset } from "./agenda-defaults";

export interface WeeklyAgendaState {
  teamId: string;
  meetingDate: string;
  spotlightName: string;
  spotlightProfession: string;
  upcoming: [string, string, string];
  mentorName: string;
  tipText: string;
  /** Optional override of the team's roster for this week. Empty = use preset. */
  roster: RosterMember[];
  /** Optional snapshot stats override for this week. Null = use preset. */
  stats: TeamPreset["stats"] | null;
  /** Optional venue override (e.g. one-off off-site week). */
  venueOverride: { name: string; address: string; note: string } | null;
}

const KEY_PREFIX = "ttagendas:";

function key(teamId: string, meetingDate: string): string {
  return `${KEY_PREFIX}${teamId}:${meetingDate}`;
}

export function loadWeekly(teamId: string, meetingDate: string): WeeklyAgendaState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(teamId, meetingDate));
    return raw ? (JSON.parse(raw) as WeeklyAgendaState) : null;
  } catch {
    return null;
  }
}

export function saveWeekly(state: WeeklyAgendaState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(state.teamId, state.meetingDate), JSON.stringify(state));
}

export function emptyWeekly(teamId: string, meetingDate: string): WeeklyAgendaState {
  return {
    teamId,
    meetingDate,
    spotlightName: "",
    spotlightProfession: "",
    upcoming: ["", "", ""],
    mentorName: "",
    tipText: "",
    roster: [],
    stats: null,
    venueOverride: null,
  };
}
