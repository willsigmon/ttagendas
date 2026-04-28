/**
 * Canonical Two Twelve meeting agenda — the 5-segment template every
 * chapter starts from. Each chapter can edit per-week locally; if a
 * week has no overrides the print view falls back to these defaults.
 */

export interface AgendaItem {
  id: string;
  group: AgendaGroup;
  glyph: string;
  label: string;
  spotlight?: "spotlight" | "mentor";
}

export type AgendaGroup =
  | "Welcome"
  | "Connect"
  | "Business"
  | "Referrals"
  | "Closing";

export const DEFAULT_AGENDA: AgendaItem[] = [
  { id: "arrivals",       group: "Welcome",   glyph: "◊", label: "Arrivals & Open Networking" },
  { id: "welcome",        group: "Welcome",   glyph: "★", label: "Welcome & Introductions" },
  { id: "overview",       group: "Welcome",   glyph: "◉", label: "Overview of Two Twelve Referral Network" },

  { id: "exchange-cards", group: "Connect",   glyph: "▦", label: "Exchange Business Cards" },
  { id: "thirty-sec",     group: "Connect",   glyph: "▷", label: "30-Second Profiles" },

  { id: "vc-report",      group: "Business",  glyph: "◆", label: "Vice Chair Report" },
  { id: "ta-report",      group: "Business",  glyph: "◆", label: "Team Admin Report" },
  { id: "follow-up",      group: "Business",  glyph: "➜", label: "Referral Follow-Up" },
  { id: "spotlight",      group: "Business",  glyph: "★", label: "Member Spotlight", spotlight: "spotlight" },
  { id: "mentor",         group: "Business",  glyph: "❆", label: "Mentor Moment", spotlight: "mentor" },

  { id: "referrals-pass", group: "Referrals", glyph: "➜", label: "Passing of Referrals & Testimonials" },
  { id: "bizchat-book",   group: "Referrals", glyph: "✉", label: "Book a BizChat" },

  { id: "announcements",  group: "Closing",   glyph: "✎", label: "Announcements & How to Apply" },
  { id: "affirmation",    group: "Closing",   glyph: "✦", label: "Closing Affirmation" },
  { id: "adjourn",        group: "Closing",   glyph: "◊", label: "Meeting Adjourned & Open Networking" },
];

export const AGENDA_GROUPS: AgendaGroup[] = [
  "Welcome",
  "Connect",
  "Business",
  "Referrals",
  "Closing",
];

export const GLYPH_CHOICES: Array<{ char: string; name: string }> = [
  { char: "◊", name: "Diamond outline" },
  { char: "◆", name: "Diamond solid" },
  { char: "★", name: "Star solid" },
  { char: "◉", name: "Bullseye" },
  { char: "▦", name: "Square dotted" },
  { char: "▷", name: "Triangle right" },
  { char: "➜", name: "Heavy arrow" },
  { char: "✉", name: "Envelope" },
  { char: "✎", name: "Pencil" },
  { char: "✦", name: "Star four-point" },
  { char: "❆", name: "Floral heart" },
];

export interface ChapterPreset {
  id: string;
  name: string;
  shortName: string;
  motif: string;
  tagline: string;
  accent: string;
  meetingDay: string;
  meetingTime: string;
  venue: string;
  chair: string;
  viceChair: string;
  tms: string;
  teamAdmin: string;
  areaMentor: string;
}

export const CHAPTER_PRESETS: ChapterPreset[] = [
  {
    id: "elevated-referral",
    name: "Elevated Referral Alliance",
    shortName: "ERA",
    motif: "Updraft",
    tagline: "Rising referrals, rising businesses.",
    accent: "#59BFEF",
    meetingDay: "Thursday",
    meetingTime: "8:00 AM",
    venue: "TBD",
    chair: "",
    viceChair: "",
    tms: "",
    teamAdmin: "",
    areaMentor: "",
  },
  {
    id: "rdu-heatwave",
    name: "RDU HeatWave",
    shortName: "RDU",
    motif: "Heatwave",
    tagline: "The Raleigh-Durham team boiling at 212°.",
    accent: "#F0A653",
    meetingDay: "Thursday",
    meetingTime: "8:00 AM",
    venue: "TBD",
    chair: "",
    viceChair: "",
    tms: "",
    teamAdmin: "",
    areaMentor: "",
  },
  {
    id: "common-ground",
    name: "Common Ground Connectors",
    shortName: "CGC",
    motif: "Wave",
    tagline: "Where category-exclusive meets community-first.",
    accent: "#6BBE5A",
    meetingDay: "Thursday",
    meetingTime: "8:00 AM",
    venue: "TBD",
    chair: "",
    viceChair: "",
    tms: "",
    teamAdmin: "",
    areaMentor: "",
  },
  {
    id: "blank",
    name: "Blank chapter",
    shortName: "",
    motif: "",
    tagline: "",
    accent: "#59BFEF",
    meetingDay: "Thursday",
    meetingTime: "",
    venue: "",
    chair: "",
    viceChair: "",
    tms: "",
    teamAdmin: "",
    areaMentor: "",
  },
];

export function nextMeetingDateET(meetingDay: string | null | undefined): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const p: Record<string, string> = {};
  for (const x of parts) p[x.type] = x.value;
  const today = new Date(`${p.year}-${p.month}-${p.day}T00:00:00`);

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const targetIdx = days.indexOf((meetingDay ?? "thursday").toLowerCase().replace(/s$/, ""));
  const target = targetIdx >= 0 ? targetIdx : 4;
  const todayIdx = today.getDay();
  const diff = todayIdx === target ? 0 : (target - todayIdx + 7) % 7;
  today.setDate(today.getDate() + diff);

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatMeetingDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
