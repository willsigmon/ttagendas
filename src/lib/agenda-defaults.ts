/**
 * Canonical Two Twelve meeting agenda — the 5-segment template every
 * team starts from. Layout & visual design intentionally mirrors
 * rduheatwave.team/agenda so teams share a printed identity.
 */

export interface AgendaItem {
  group: AgendaGroup;
  glyph: string;
  label: string;
}

export type AgendaGroup =
  | "Welcome"
  | "Connect"
  | "Business"
  | "Referrals"
  | "Closing";

export const AGENDA_GROUPS: AgendaGroup[] = [
  "Welcome",
  "Connect",
  "Business",
  "Referrals",
  "Closing",
];

export const DEFAULT_AGENDA: AgendaItem[] = [
  { group: "Welcome",   glyph: "◊", label: "Arrivals & Open Networking" },
  { group: "Welcome",   glyph: "★", label: "Welcome & Introductions" },
  { group: "Welcome",   glyph: "◉", label: "Overview of Two Twelve Referral Network" },

  { group: "Connect",   glyph: "▦", label: "Exchange Business Cards" },
  { group: "Connect",   glyph: "▷", label: "30-Second Profiles" },

  { group: "Business",  glyph: "◆", label: "Vice Chair Report" },
  { group: "Business",  glyph: "◆", label: "Team Admin Report" },
  { group: "Business",  glyph: "➜", label: "Referral Follow-Up" },
  { group: "Business",  glyph: "★", label: "Member Spotlight" },
  { group: "Business",  glyph: "❆", label: "Mentor Moment" },

  { group: "Referrals", glyph: "➜", label: "Passing of Referrals & Testimonials" },
  { group: "Referrals", glyph: "✉", label: "Book a BizChat" },

  { group: "Closing",   glyph: "✎", label: "Announcements & How to Apply" },
  { group: "Closing",   glyph: "✦", label: "Closing Affirmation" },
  { group: "Closing",   glyph: "◊", label: "Meeting Adjourned & Open Networking" },
];

export interface RosterMember {
  name: string;
  profession: string;
  company: string;
}

export interface TeamPreset {
  id: string;
  /** Full team name. */
  name: string;
  /** Short tag like "ERA" / "RDU" / "CGC". */
  shortName: string;
  /** Display word printed in the team accent color (e.g. "Heatwave"). */
  motif: string;
  /** Display word printed before the motif (e.g. "RDU"). */
  prefix: string;
  /** Hex accent — primary color used for headings, glyphs, accent text. */
  accent: string;
  /** Soft accent for borders / 18% opacity boxes. */
  accentSoft: string;
  /** Page link printed bottom-right of page 2. */
  url: string;
  meetingDay: string;
  meetingTime: string;
  venue: { name: string; address: string; note: string };
  chair: string;
  viceChair: string;
  teamAdmin: string;
  about: { lead: string; pills: Array<{ title: string; body: string }> };
  roster: RosterMember[];
  /** Snapshot stats — chair edits per-week if they want, defaults shown otherwise. */
  stats: { members: string; guests: string; bizchats: string; referrals: string; gis: string; revenue: string };
}

const SHARED_AGENDA: Pick<TeamPreset, "about"> = {
  about: {
    lead: "211° is hot. 212° makes steam. If you know BNI, some of the structure will feel familiar. Two Twelve pushes further with permission-based referrals, BizChats, gratitude incentives, and a 24-hour follow-up ethic.",
    pills: [
      { title: "Permission", body: "Specific, warm introductions" },
      { title: "Gratitude", body: "Referral effort gets recognized" },
      { title: "Accountability", body: "Follow up fast and bring value" },
    ],
  },
};

export const TEAM_PRESETS: TeamPreset[] = [
  {
    id: "elevated-referral",
    prefix: "Elevated Referral",
    motif: "Alliance",
    name: "Elevated Referral Alliance",
    shortName: "ERA",
    accent: "#0EA5E9",
    accentSoft: "rgba(14, 165, 233, 0.18)",
    url: "twotwelvereferrals.com",
    meetingDay: "Tuesday",
    meetingTime: "4:00 PM",
    venue: {
      name: "Relevate Real Estate, Inc.",
      address: "7501 Creedmoor Road Suite 102, Raleigh, NC",
      note: "Weekly professional networking focused on referral relationships and business connections.",
    },
    chair: "",
    viceChair: "",
    teamAdmin: "",
    ...SHARED_AGENDA,
    roster: [],
    stats: { members: "", guests: "", bizchats: "", referrals: "", gis: "", revenue: "" },
  },
  {
    id: "rdu-heatwave",
    prefix: "RDU",
    motif: "Heatwave",
    name: "RDU Heatwave",
    shortName: "RDU",
    accent: "#E8580C",
    accentSoft: "rgba(232, 88, 12, 0.18)",
    url: "rduheatwave.team",
    meetingDay: "Thursday",
    meetingTime: "8:00 AM",
    venue: {
      name: "Clouds Brewing",
      address: "1233 Front St, Raleigh NC",
      note: "Please stay for a drink after the meeting to support the brewery — they provide our space at no cost.",
    },
    chair: "Carter Helms",
    viceChair: "Craig Morrill",
    teamAdmin: "Will Sigmon",
    ...SHARED_AGENDA,
    roster: [
      { name: "Carter Helms",    profession: "Personal Insurance",     company: "Highstreet Ins & Financial Svcs" },
      { name: "Craig Morrill",   profession: "Financial Advisor",      company: "Summit Global Investments" },
      { name: "Dana Walsh",      profession: "Magazine Publisher",     company: "Stroll Magazine" },
      { name: "David Mercado",   profession: "HOA Management",         company: "William Douglas Management" },
      { name: "Nathan Senn",     profession: "Property Restoration",   company: "Franco Restorations" },
      { name: "Robert Courts",   profession: "Mortgage Lending",       company: "Advantage Lending" },
      { name: "Roni Payne",      profession: "Accounting / Tax",       company: "R. Payne Financial & Tax Solutions" },
      { name: "Rusty Sutton",    profession: "Digital Marketing",      company: "MonkeyFans Creative" },
      { name: "Shannida Ramsey", profession: "Property Management",    company: "Ram-Z Services LLC" },
      { name: "Sue Kerata",      profession: "Residential Real Estate", company: "Century 21 Triangle Group" },
      { name: "Will Sigmon",     profession: "Software Engineer",      company: "Will Sigmon Media Co." },
    ],
    stats: { members: "11", guests: "113", bizchats: "207", referrals: "49", gis: "158", revenue: "$115,331" },
  },
  {
    id: "common-ground",
    prefix: "Common Ground",
    motif: "Connectors",
    name: "Common Ground Connectors",
    shortName: "CGC",
    accent: "#0F8C5C",
    accentSoft: "rgba(15, 140, 92, 0.18)",
    url: "twotwelvereferrals.com",
    meetingDay: "Thursday",
    meetingTime: "8:00 AM",
    venue: { name: "Venue TBD", address: "", note: "Updated each week — check with the chair." },
    chair: "",
    viceChair: "",
    teamAdmin: "",
    ...SHARED_AGENDA,
    roster: [],
    stats: { members: "", guests: "", bizchats: "", referrals: "", gis: "", revenue: "" },
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

export function findTeamByAlias(alias: string): TeamPreset | null {
  const a = alias.toLowerCase();
  for (const p of TEAM_PRESETS) {
    if (teamRouteAliases(p).includes(a)) return p;
  }
  return null;
}

export function teamRouteAliases(team: TeamPreset): string[] {
  const aliases = new Set<string>([team.id.toLowerCase(), team.shortName.toLowerCase()]);
  if (team.id === "elevated-referral") aliases.add("agenda");
  return Array.from(aliases);
}
