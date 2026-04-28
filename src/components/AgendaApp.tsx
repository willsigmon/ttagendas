"use client";

import { Printer, Save, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  TEAM_PRESETS,
  formatMeetingDateLong,
  nextMeetingDateET,
  type RosterMember,
  type TeamPreset,
} from "@/lib/agenda-defaults";
import {
  emptyWeekly,
  loadWeekly,
  saveWeekly,
  type WeeklyAgendaState,
} from "@/lib/storage";
import { AgendaPrintView } from "./AgendaPrintView";

type StatKey = keyof TeamPreset["stats"];

const STAT_FIELDS: Array<{ key: StatKey; label: string; placeholder: string }> = [
  { key: "members", label: "Members", placeholder: "e.g. 18" },
  { key: "guests", label: "Guests", placeholder: "e.g. 6" },
  { key: "bizchats", label: "BizChats", placeholder: "e.g. 12" },
  { key: "referrals", label: "Referrals", placeholder: "e.g. 9" },
  { key: "gis", label: "Total GIs", placeholder: "e.g. 34" },
  { key: "revenue", label: "Closed Revenue", placeholder: "e.g. $4,200" },
];

function readUrlDate(): string | null {
  if (typeof window === "undefined") return null;
  const date = new URL(window.location.href).searchParams.get("date");
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function syncDateInUrl(date: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("date", date);
  window.history.replaceState(null, "", url.toString());
}

function rosterToText(roster: RosterMember[]): string {
  return roster.map((m) => `${m.name} | ${m.profession} | ${m.company}`).join("\n");
}

function rosterFromText(text: string): RosterMember[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s*[|·]\s*/);
      return {
        name: parts[0] ?? "",
        profession: parts[1] ?? "",
        company: parts[2] ?? "",
      };
    })
    .filter((m) => m.name);
}

function emptyWeeklyWithRoster(team: TeamPreset, meetingDate: string): WeeklyAgendaState {
  const empty = emptyWeekly(team.id, meetingDate);
  return team.roster.length > 0 ? { ...empty, roster: [...team.roster] } : empty;
}

function weeklyForDate(team: TeamPreset, meetingDate: string): WeeklyAgendaState {
  return loadWeekly(team.id, meetingDate) ?? emptyWeeklyWithRoster(team, meetingDate);
}

function draftRosterText(state: WeeklyAgendaState, team: TeamPreset): string {
  const roster = state.roster.length > 0 ? state.roster : team.roster;
  return rosterToText(roster);
}

export function AgendaApp({ initialTeamId }: { initialTeamId?: string } = {}) {
  const team: TeamPreset = useMemo(() => {
    if (initialTeamId) {
      return TEAM_PRESETS.find((p) => p.id === initialTeamId) ?? TEAM_PRESETS[0];
    }
    return TEAM_PRESETS[0];
  }, [initialTeamId]);

  const initialDate = useMemo(() => readUrlDate() ?? nextMeetingDateET(team.meetingDay), [team.meetingDay]);

  const [meetingDate, setMeetingDate] = useState<string>(initialDate);
  const [state, setState] = useState<WeeklyAgendaState>(() => {
    return weeklyForDate(team, initialDate);
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Roster shown in textarea: prefer per-week override, else preset
  const rosterText = useMemo(() => draftRosterText(state, team), [state, team]);
  const [rosterDraft, setRosterDraft] = useState<string>(rosterText);

  function changeMeetingDate(value: string) {
    const nextState = weeklyForDate(team, value);
    setMeetingDate(value);
    syncDateInUrl(value);
    setState(nextState);
    setRosterDraft(draftRosterText(nextState, team));
    setSavedAt(null);
  }

  function patch<K extends keyof WeeklyAgendaState>(key: K, value: WeeklyAgendaState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    setSavedAt(null);
  }

  function patchUpcoming(idx: 0 | 1 | 2, value: string) {
    setState((s) => {
      const next: [string, string, string] = [...s.upcoming] as [string, string, string];
      next[idx] = value;
      return { ...s, upcoming: next };
    });
    setSavedAt(null);
  }

  function patchStat(key: StatKey, value: string) {
    setState((s) => ({
      ...s,
      stats: {
        ...(s.stats ?? team.stats),
        [key]: value,
      },
    }));
    setSavedAt(null);
  }

  function commitRoster() {
    const parsed = rosterFromText(rosterDraft);
    setState((s) => ({ ...s, roster: parsed }));
    setSavedAt(null);
  }

  function save() {
    const parsed = rosterFromText(rosterDraft);
    const toSave = { ...state, roster: parsed };
    saveWeekly(toSave);
    setState(toSave);
    setSavedAt(new Date().toLocaleTimeString("en-US"));
  }

  function copyShareLink() {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("date", meetingDate);
    navigator.clipboard.writeText(url.toString()).then(() => setSavedAt("Link copied!"));
  }

  function printNow() {
    window.print();
  }

  // Preview always uses live form values, not just saved state
  const previewRoster = rosterFromText(rosterDraft);
  const previewStats = state.stats ?? team.stats;

  return (
    <main className="builder">
      <aside className="builder__form no-print">
        <div className="builder__head">
          <p className="kicker" style={{ color: team.accent }}>{team.shortName} Agenda</p>
          <h1>Build this week&apos;s agenda</h1>
          <p className="lede">
            Fill the agenda details and stat boxes. Hit <strong>Print</strong> for a 2-page PDF.
            Your edits stay in this browser.
          </p>
          <div className="team-strip">
            {TEAM_PRESETS.map((t) => (
              <a
                key={t.id}
                href={`/${t.shortName.toLowerCase()}${meetingDate ? `?date=${meetingDate}` : ""}`}
                className={`team-pill ${t.id === team.id ? "team-pill--active" : ""}`}
                style={
                  t.id === team.id
                    ? { background: t.accent, color: "#fff", borderColor: t.accent }
                    : { borderColor: t.accentSoft, color: t.accent }
                }
              >
                {t.shortName}
              </a>
            ))}
          </div>
        </div>

        <label className="field">
          <span>Meeting date</span>
          <input
            type="date"
            value={meetingDate}
            onChange={(e) => changeMeetingDate(e.target.value)}
          />
          <small>{formatMeetingDateLong(meetingDate)}</small>
        </label>

        <div className="field-group">
          <h2>Meeting Stats</h2>
          <div className="stats-editor">
            {STAT_FIELDS.map((field) => (
              <label key={field.key} className="stat-field">
                <span>{field.label}</span>
                <input
                  value={previewStats[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) => patchStat(field.key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="field-group">
          <h2>Member Spotlight</h2>
          <input
            placeholder="Name (e.g. Carter Helms)"
            value={state.spotlightName}
            onChange={(e) => patch("spotlightName", e.target.value)}
          />
          <input
            placeholder="Profession (e.g. Personal Insurance)"
            value={state.spotlightProfession}
            onChange={(e) => patch("spotlightProfession", e.target.value)}
          />
          <div className="upcoming-grid">
            <input
              placeholder="Next week's spotlight"
              value={state.upcoming[0]}
              onChange={(e) => patchUpcoming(0, e.target.value)}
            />
            <input
              placeholder="2 weeks out"
              value={state.upcoming[1]}
              onChange={(e) => patchUpcoming(1, e.target.value)}
            />
            <input
              placeholder="3 weeks out"
              value={state.upcoming[2]}
              onChange={(e) => patchUpcoming(2, e.target.value)}
            />
          </div>
        </div>

        <label className="field">
          <span>Mentor Moment</span>
          <input
            placeholder="Mentor name"
            value={state.mentorName}
            onChange={(e) => patch("mentorName", e.target.value)}
          />
        </label>

        <label className="field">
          <span>Referral Tip of the Week</span>
          <textarea
            rows={3}
            placeholder={`e.g. "Don't ask for anyone — ask for one specific introduction."`}
            value={state.tipText}
            onChange={(e) => patch("tipText", e.target.value)}
          />
        </label>

        <details className="advanced">
          <summary>Roster ({previewRoster.length} member{previewRoster.length === 1 ? "" : "s"})</summary>
          <p className="hint">One per line: <code>Name | Profession | Company</code></p>
          <textarea
            rows={8}
            value={rosterDraft}
            onChange={(e) => setRosterDraft(e.target.value)}
            onBlur={commitRoster}
            placeholder="Carter Helms | Personal Insurance | Highstreet Ins & Financial Svcs"
          />
        </details>

        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={printNow}>
            <Printer size={15} /> Print 2-page PDF
          </button>
          <button type="button" className="btn" onClick={save}>
            <Save size={14} /> Save
          </button>
          <button type="button" className="btn btn-ghost" onClick={copyShareLink}>
            <Share2 size={14} /> Share link
          </button>
        </div>
        {savedAt ? <p className="status">{savedAt}</p> : null}

        <p className="footnote">
          To save as PDF: hit Print → choose <strong>“Save as PDF”</strong> → enable
          <strong> two-sided</strong> if printing for the room.
        </p>
      </aside>

      <section className="builder__preview">
        <AgendaPrintView
          team={team}
          meetingDate={meetingDate}
          spotlightName={state.spotlightName}
          spotlightProfession={state.spotlightProfession}
          upcoming={state.upcoming}
          mentorName={state.mentorName}
          tipText={state.tipText}
          roster={previewRoster}
          stats={previewStats}
          venue={state.venueOverride ?? team.venue}
        />
      </section>

      <style>{`
        .builder {
          min-height: 100dvh;
          background: #e8e0d8;
          display: grid;
          grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
        }
        @media (max-width: 980px) {
          .builder { grid-template-columns: 1fr; }
        }
        .builder__form {
          background: #f4eee8;
          border-right: 1px solid rgba(156,119,72,0.22);
          padding: 24px 22px 32px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          font-family: 'Plus Jakarta Sans', 'Poppins', system-ui, sans-serif;
          color: #231914;
          position: sticky;
          top: 0;
          align-self: start;
          max-height: 100dvh;
          overflow-y: auto;
        }
        @media (max-width: 980px) {
          .builder__form { position: static; max-height: none; border-right: none; border-bottom: 1px solid rgba(156,119,72,0.22); }
        }
        .builder__form .kicker {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 3pt;
          font-size: 11px;
          margin: 0;
          font-weight: 700;
        }
        .builder__form h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px;
          letter-spacing: 1.5pt;
          margin: 4px 0 6px;
          line-height: 1.05;
          font-weight: 800;
        }
        .builder__form h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 2pt;
          color: #9c7748;
          margin: 0 0 6px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .lede {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 14px;
          font-style: italic;
          color: #5c4a3d;
          margin: 0 0 10px;
          line-height: 1.45;
        }
        .lede strong { font-style: normal; color: #231914; }
        .team-strip {
          display: flex;
          gap: 6px;
          margin-top: 6px;
        }
        .team-pill {
          flex: 1;
          padding: 8px 10px;
          border-radius: 6px;
          border: 1.5px solid;
          background: #fff;
          text-align: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 1.5pt;
          font-weight: 700;
          text-decoration: none;
          transition: filter 0.15s ease;
        }
        .team-pill:hover { filter: brightness(1.05); }
        .team-pill--active { color: #fff; }

        .field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
        }
        .field > span {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 1.5pt;
          color: #9c7748;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .field small { color: #8a7361; font-size: 11px; font-style: italic; font-family: 'Cormorant Garamond', Georgia, serif; }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .upcoming-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }
        .upcoming-grid input { font-size: 11px; padding: 6px 8px; }
        .stats-editor {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }
        .stat-field {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .stat-field span {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 1.2pt;
          color: #9c7748;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .stat-field input {
          padding: 7px 8px;
          font-size: 12px;
        }

        input, textarea {
          font-family: inherit;
          font-size: 13px;
          padding: 8px 10px;
          border: 1px solid rgba(156,119,72,0.3);
          border-radius: 4px;
          background: #fff;
          color: #231914;
          width: 100%;
          line-height: 1.4;
        }
        input:focus, textarea:focus {
          outline: 2px solid var(--accent, #E8580C);
          outline-offset: -1px;
          border-color: transparent;
        }
        textarea { resize: vertical; }

        .advanced { background: #fff; border-radius: 6px; padding: 8px 10px; border: 1px solid rgba(156,119,72,0.18); }
        .advanced summary {
          cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 1.5pt;
          color: #9c7748;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .advanced[open] summary { margin-bottom: 6px; }
        .hint { font-size: 11px; color: #8a7361; margin: 4px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; }
        .hint code { font-family: monospace; background: #ece2d6; padding: 1px 4px; border-radius: 3px; font-size: 10px; font-style: normal; }

        .actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 9px 12px;
          border-radius: 4px;
          background: #fff;
          color: #231914;
          border: 1px solid rgba(156,119,72,0.3);
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 1.5pt;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: filter 0.15s ease;
        }
        .btn:hover { filter: brightness(0.97); }
        .btn-primary {
          background: ${team.accent};
          color: #fff;
          border-color: ${team.accent};
          flex: 1;
          justify-content: center;
        }
        .btn-ghost { background: transparent; }
        .status { font-size: 11px; color: #0F8C5C; margin: 0; font-style: italic; font-family: 'Cormorant Garamond', Georgia, serif; }
        .footnote {
          font-size: 11px;
          color: #5c4a3d;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          margin: 8px 0 0;
          padding-top: 8px;
          border-top: 1px dashed rgba(156,119,72,0.3);
          line-height: 1.45;
        }
        .footnote strong { font-style: normal; color: #231914; }

        .builder__preview {
          padding: 22px 16px 32px;
          overflow-x: auto;
        }

        @media print {
          .builder { display: block; background: #fff; grid-template-columns: 1fr; }
          .builder__form { display: none !important; }
          .builder__preview { padding: 0; overflow: visible; }
        }
      `}</style>
    </main>
  );
}
