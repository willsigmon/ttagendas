"use client";

import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  Eye,
  EyeOff,
  History,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Share2,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  AGENDA_GROUPS,
  CHAPTER_PRESETS,
  DEFAULT_AGENDA,
  GLYPH_CHOICES,
  formatMeetingDateLong,
  nextMeetingDateET,
  type AgendaGroup,
  type AgendaItem,
  type ChapterPreset,
} from "@/lib/agenda-defaults";
import {
  loadAgenda,
  recentAgendas,
  saveAgenda,
  saveChapterDefaults,
  savedChapterDefaults,
  type AgendaState,
} from "@/lib/storage";
import { AgendaPrintView } from "./AgendaPrintView";

function buildInitialState(preset: ChapterPreset, meetingDate: string): AgendaState {
  return {
    preset,
    meetingDate,
    spotlightName: "",
    spotlightCompany: "",
    mentorName: "",
    tipText: "",
    notes: "",
    items: DEFAULT_AGENDA,
  };
}

function mergePresetWithSaved(preset: ChapterPreset): ChapterPreset {
  const overrides = savedChapterDefaults(preset.id);
  if (!overrides) return preset;
  return { ...preset, ...overrides };
}

function readUrlParams(): { presetId: string | null; date: string | null } {
  if (typeof window === "undefined") return { presetId: null, date: null };
  const url = new URL(window.location.href);
  const presetId = url.searchParams.get("chapter");
  const date = url.searchParams.get("date");
  return {
    presetId: presetId && CHAPTER_PRESETS.some((p) => p.id === presetId) ? presetId : null,
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
  };
}

function resolveInitial(forcedPresetId?: string): { presetId: string; meetingDate: string; state: AgendaState } {
  const { presetId: urlPresetId, date: urlDate } = readUrlParams();
  const presetId = forcedPresetId ?? urlPresetId ?? CHAPTER_PRESETS[0].id;
  const basePreset = CHAPTER_PRESETS.find((p) => p.id === presetId) ?? CHAPTER_PRESETS[0];
  const preset = mergePresetWithSaved(basePreset);
  const meetingDate = urlDate ?? nextMeetingDateET(basePreset.meetingDay);
  const stored = loadAgenda(presetId, meetingDate);
  const state = stored ? { ...stored, preset } : buildInitialState(preset, meetingDate);
  return { presetId, meetingDate, state };
}

export function AgendaApp({ initialPresetId }: { initialPresetId?: string } = {}) {
  const [presetId, setPresetId] = useState<string>(() => resolveInitial(initialPresetId).presetId);
  const [meetingDate, setMeetingDate] = useState<string>(() => resolveInitial(initialPresetId).meetingDate);
  const [state, setState] = useState<AgendaState>(() => resolveInitial(initialPresetId).state);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [recent, setRecent] = useState<AgendaState[]>(() => {
    if (typeof window === "undefined") return [];
    const init = resolveInitial(initialPresetId);
    return recentAgendas(init.presetId).filter((r) => r.meetingDate !== init.meetingDate);
  });
  const [editingChapter, setEditingChapter] = useState(false);

  function selectPreset(nextPresetId: string) {
    const basePreset = CHAPTER_PRESETS.find((p) => p.id === nextPresetId) ?? CHAPTER_PRESETS[0];
    const preset = mergePresetWithSaved(basePreset);
    const stored = loadAgenda(nextPresetId, meetingDate);
    setPresetId(nextPresetId);
    setState(stored ? { ...stored, preset } : buildInitialState(preset, meetingDate));
    setSavedAt(null);
    setRecent(recentAgendas(nextPresetId).filter((r) => r.meetingDate !== meetingDate));
    syncUrl(nextPresetId, meetingDate);
  }

  function selectDate(nextDate: string) {
    const basePreset = CHAPTER_PRESETS.find((p) => p.id === presetId) ?? CHAPTER_PRESETS[0];
    const preset = mergePresetWithSaved(basePreset);
    const stored = loadAgenda(presetId, nextDate);
    setMeetingDate(nextDate);
    setState(stored ? { ...stored, preset } : buildInitialState(preset, nextDate));
    setSavedAt(null);
    setRecent(recentAgendas(presetId).filter((r) => r.meetingDate !== nextDate));
    syncUrl(presetId, nextDate);
  }

  function syncUrl(nextPresetId: string, nextDate: string) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("chapter", nextPresetId);
    url.searchParams.set("date", nextDate);
    window.history.replaceState(null, "", url.toString());
  }

  function patch<K extends keyof AgendaState>(key: K, value: AgendaState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    setSavedAt(null);
  }

  function patchPreset<K extends keyof ChapterPreset>(key: K, value: ChapterPreset[K]) {
    setState((s) => ({ ...s, preset: { ...s.preset, [key]: value } }));
    setSavedAt(null);
  }

  function patchItem(idx: number, p: Partial<AgendaItem>) {
    setState((s) => ({
      ...s,
      items: s.items.map((it, i) => (i === idx ? { ...it, ...p } : it)),
    }));
    setSavedAt(null);
  }

  function moveItem(idx: number, dir: -1 | 1) {
    setState((s) => {
      const next = [...s.items];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return s;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return { ...s, items: next };
    });
    setSavedAt(null);
  }

  function removeItem(idx: number) {
    setState((s) => ({ ...s, items: s.items.filter((_, i) => i !== idx) }));
    setSavedAt(null);
  }

  function addItem(group: AgendaGroup) {
    setState((s) => ({
      ...s,
      items: [
        ...s.items,
        {
          id: `custom-${Date.now()}`,
          group,
          glyph: "◆",
          label: "New agenda item",
        },
      ],
    }));
    setSavedAt(null);
  }

  function resetToDefault() {
    if (!confirm("Reset agenda items to the canonical Two Twelve template? Spotlight / mentor / tip stay as you have them.")) return;
    setState((s) => ({ ...s, items: DEFAULT_AGENDA }));
    setSavedAt(null);
  }

  function save() {
    saveAgenda(state);
    setSavedAt(new Date().toLocaleTimeString("en-US"));
    setRecent(recentAgendas(presetId).filter((r) => r.meetingDate !== meetingDate));
  }

  function saveChapterAsDefault() {
    saveChapterDefaults(state.preset.id, {
      chair: state.preset.chair,
      viceChair: state.preset.viceChair,
      tms: state.preset.tms,
      teamAdmin: state.preset.teamAdmin,
      areaMentor: state.preset.areaMentor,
      meetingDay: state.preset.meetingDay,
      meetingTime: state.preset.meetingTime,
      venue: state.preset.venue,
    });
    setEditingChapter(false);
    setSavedAt(new Date().toLocaleTimeString("en-US"));
  }

  function copyShareLink() {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("chapter", presetId);
    url.searchParams.set("date", meetingDate);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setSavedAt("Link copied!");
    });
  }

  function printNow() {
    window.print();
  }

  const officerSuggestions = useMemo(
    () =>
      [state.preset.chair, state.preset.viceChair, state.preset.tms, state.preset.teamAdmin]
        .filter((n): n is string => Boolean(n))
        .filter((n) => !/tbd|candidate|founding/i.test(n)),
    [state.preset],
  );

  const meetingDateLong = formatMeetingDateLong(meetingDate);

  return (
    <main className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="content">
        <header className="builder-head">
          <div>
            <p className="kicker">Agenda Builder</p>
            <h1 className="display-loud">Weekly Meeting Agenda</h1>
            <p className="lede">
              Standalone tool — no login. Pick a chapter, fill in the spotlight, mentor, and tip, then print.
              Your edits save to this browser.
            </p>
          </div>
          <div className="actions">
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              title="Toggle preview pane"
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={copyShareLink}
              title="Copy a link to this exact agenda"
            >
              <Share2 size={14} /> Share link
            </button>
            <button
              className="btn btn-sm"
              type="button"
              onClick={printNow}
            >
              <Printer size={14} /> Print
            </button>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={save}
            >
              <Save size={14} /> Save
            </button>
          </div>
        </header>

        <section className={`builder ${showPreview ? "builder--with-preview" : ""}`}>
          <div className="builder__form">
            <div className="panel p-4 lg:p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="label">Chapter</span>
                  <select
                    className="input"
                    value={presetId}
                    onChange={(e) => selectPreset(e.target.value)}
                  >
                    {CHAPTER_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="label">Meeting date</span>
                  <input
                    type="date"
                    className="input"
                    value={meetingDate}
                    onChange={(e) => selectDate(e.target.value)}
                  />
                  <span className="text-xs text-[var(--ink-muted)]">
                    <CalendarClock size={11} className="inline align-text-bottom" />{" "}
                    {meetingDateLong}
                  </span>
                </label>
                <div className="grid gap-1">
                  <span className="label">Status</span>
                  <div className="text-sm">
                    {savedAt ? (
                      <span className="text-[var(--green-deep)]">{savedAt}</span>
                    ) : (
                      <span className="text-[var(--ink-muted)]">Edits live in this browser only — Save or Print when ready.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel p-4 lg:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="display text-base text-[var(--ink)]">Chapter Details</h2>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">
                    Officers, meeting time, venue. These fill in automatically when you switch chapters.
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => setEditingChapter((v) => !v)}
                >
                  {editingChapter ? "Done" : "Edit"}
                </button>
              </div>
              {editingChapter ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="label">Chair</span>
                    <input className="input" value={state.preset.chair} onChange={(e) => patchPreset("chair", e.target.value)} />
                  </label>
                  <label className="grid gap-1">
                    <span className="label">Vice Chair</span>
                    <input className="input" value={state.preset.viceChair} onChange={(e) => patchPreset("viceChair", e.target.value)} />
                  </label>
                  <label className="grid gap-1">
                    <span className="label">Team Admin</span>
                    <input className="input" value={state.preset.teamAdmin} onChange={(e) => patchPreset("teamAdmin", e.target.value)} />
                  </label>
                  <label className="grid gap-1">
                    <span className="label">TMS</span>
                    <input className="input" value={state.preset.tms} onChange={(e) => patchPreset("tms", e.target.value)} />
                  </label>
                  <label className="grid gap-1">
                    <span className="label">Area Mentor</span>
                    <input className="input" value={state.preset.areaMentor} onChange={(e) => patchPreset("areaMentor", e.target.value)} />
                  </label>
                  <label className="grid gap-1">
                    <span className="label">Meeting Day</span>
                    <input className="input" value={state.preset.meetingDay} onChange={(e) => patchPreset("meetingDay", e.target.value)} />
                  </label>
                  <label className="grid gap-1">
                    <span className="label">Meeting Time</span>
                    <input className="input" value={state.preset.meetingTime} onChange={(e) => patchPreset("meetingTime", e.target.value)} />
                  </label>
                  <label className="grid gap-1 md:col-span-2">
                    <span className="label">Venue</span>
                    <input className="input" value={state.preset.venue} onChange={(e) => patchPreset("venue", e.target.value)} />
                  </label>
                  <div className="md:col-span-2">
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={saveChapterAsDefault}
                    >
                      <Save size={13} /> Remember chapter details for this browser
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="mt-3 grid gap-1 text-sm md:grid-cols-2">
                  <li><span className="text-[var(--ink-muted)]">Chair: </span>{state.preset.chair || "—"}</li>
                  <li><span className="text-[var(--ink-muted)]">Vice Chair: </span>{state.preset.viceChair || "—"}</li>
                  <li><span className="text-[var(--ink-muted)]">Team Admin: </span>{state.preset.teamAdmin || "—"}</li>
                  <li><span className="text-[var(--ink-muted)]">TMS: </span>{state.preset.tms || "—"}</li>
                  <li><span className="text-[var(--ink-muted)]">Area Mentor: </span>{state.preset.areaMentor || "—"}</li>
                  <li><span className="text-[var(--ink-muted)]">When: </span>{state.preset.meetingDay} {state.preset.meetingTime || "TBD"}</li>
                  <li className="md:col-span-2"><span className="text-[var(--ink-muted)]">Venue: </span>{state.preset.venue || "—"}</li>
                </ul>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="panel p-4 lg:p-5">
                <h2 className="display text-base text-[var(--ink)]">This Week&apos;s Spotlight</h2>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  Featured member. Shows up on the printed agenda.
                </p>
                <div className="mt-3 grid gap-3">
                  <input
                    className="input"
                    placeholder="Spotlight member name"
                    value={state.spotlightName}
                    onChange={(e) => patch("spotlightName", e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Their business / role (optional)"
                    value={state.spotlightCompany}
                    onChange={(e) => patch("spotlightCompany", e.target.value)}
                  />
                  {officerSuggestions.length ? (
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="text-[var(--ink-faint)]">Quick pick:</span>
                      {officerSuggestions.map((name) => (
                        <button
                          key={name}
                          type="button"
                          className="pill pill-cyan transition hover:opacity-80"
                          onClick={() => patch("spotlightName", name)}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="panel p-4 lg:p-5">
                <h2 className="display text-base text-[var(--ink)]">Mentor Moment</h2>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  Member sharing a referral tip or insight this week.
                </p>
                <div className="mt-3 grid gap-3">
                  <input
                    className="input"
                    placeholder="Mentor name"
                    value={state.mentorName}
                    onChange={(e) => patch("mentorName", e.target.value)}
                  />
                  {officerSuggestions.length ? (
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="text-[var(--ink-faint)]">Quick pick:</span>
                      {officerSuggestions.map((name) => (
                        <button
                          key={name}
                          type="button"
                          className="pill pill-green transition hover:opacity-80"
                          onClick={() => patch("mentorName", name)}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="panel p-4 lg:p-5">
              <h2 className="display text-base text-[var(--ink)]">Tip of the Week</h2>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">
                One-sentence prompt that prints in the right column. Quote-style preferred.
              </p>
              <textarea
                className="textarea mt-3 min-h-24 resize-y"
                placeholder={`Example: "Don't ask for anyone — ask for one specific introduction."`}
                value={state.tipText}
                onChange={(e) => patch("tipText", e.target.value)}
              />
            </div>

            <div className="panel p-4 lg:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="display text-base text-[var(--ink)]">Agenda Items</h2>
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">
                    Reorder, edit, or replace the canonical 5-segment agenda for this week.
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={resetToDefault}
                >
                  <RotateCcw size={13} /> Reset to template
                </button>
              </div>

              {AGENDA_GROUPS.map((group) => {
                const itemsInGroup = state.items
                  .map((it, idx) => ({ it, idx }))
                  .filter(({ it }) => it.group === group);
                return (
                  <div key={group} className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-green-deep)]">
                        {group}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => addItem(group)}
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    <ul className="mt-2 grid gap-2">
                      {itemsInGroup.length === 0 ? (
                        <li className="rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)] p-2 text-xs text-[var(--ink-muted)]">
                          No items in this section yet.
                        </li>
                      ) : null}
                      {itemsInGroup.map(({ it, idx }) => (
                        <li
                          key={it.id}
                          className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-2"
                        >
                          <select
                            className="input"
                            style={{ width: 60, padding: "6px 8px", textAlign: "center" }}
                            value={it.glyph}
                            onChange={(e) => patchItem(idx, { glyph: e.target.value })}
                            title="Glyph"
                          >
                            {GLYPH_CHOICES.map((g) => (
                              <option key={g.char} value={g.char}>
                                {g.char}
                              </option>
                            ))}
                          </select>
                          <input
                            className="input flex-1 min-w-40"
                            value={it.label}
                            onChange={(e) => patchItem(idx, { label: e.target.value })}
                          />
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => moveItem(idx, -1)}
                              aria-label="Move up"
                              disabled={idx === 0}
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => moveItem(idx, 1)}
                              aria-label="Move down"
                              disabled={idx === state.items.length - 1}
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => removeItem(idx)}
                              aria-label="Remove"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="panel p-4 lg:p-5">
              <h2 className="display text-base text-[var(--ink)]">Private Notes</h2>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">
                For the chair&apos;s eyes — talking points, reminders. Won&apos;t print.
              </p>
              <textarea
                className="textarea mt-3 min-h-24 resize-y"
                placeholder="Anything you want to remember for this meeting…"
                value={state.notes}
                onChange={(e) => patch("notes", e.target.value)}
              />
            </div>

            {recent.length > 0 ? (
              <div className="panel-soft p-4 lg:p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-muted)]">
                  <History size={14} /> Recent agendas for {state.preset.shortName || state.preset.name}
                </h2>
                <ul className="mt-3 grid gap-1 text-sm">
                  {recent.map((r) => (
                    <li
                      key={r.meetingDate}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2"
                    >
                      <span className="font-medium text-[var(--ink)]">
                        {formatMeetingDateLong(r.meetingDate)}
                      </span>
                      <span className="text-xs text-[var(--ink-muted)]">
                        {r.spotlightName || "—"}
                        {r.mentorName ? ` · mentor ${r.mentorName}` : ""}
                      </span>
                      <button
                        className="btn btn-ghost btn-sm shrink-0"
                        type="button"
                        onClick={() => selectDate(r.meetingDate)}
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {showPreview ? (
            <aside className="builder__preview">
              <div className="preview-shell">
                <AgendaPrintView
                  preset={state.preset}
                  meetingDate={meetingDate}
                  meetingDateLong={meetingDateLong}
                  spotlightName={state.spotlightName || null}
                  spotlightCompany={state.spotlightCompany || null}
                  mentorName={state.mentorName || null}
                  tipText={state.tipText || null}
                  items={state.items}
                  groups={AGENDA_GROUPS}
                />
              </div>
            </aside>
          ) : null}
        </section>
      </div>

      <style jsx>{`
        .builder-head {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (min-width: 900px) {
          .builder-head {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }
        .kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brand-blue-deep);
          margin: 0;
        }
        .display-loud {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          color: var(--ink);
          margin: 4px 0 6px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .lede {
          margin: 0;
          color: var(--ink-muted);
          font-size: 13px;
          max-width: 620px;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .builder {
          display: grid;
          gap: 16px;
        }
        .builder--with-preview {
          grid-template-columns: minmax(0, 1fr);
        }
        @media (min-width: 1200px) {
          .builder--with-preview {
            grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
            align-items: start;
          }
        }
        .builder__form {
          display: grid;
          gap: 14px;
          min-width: 0;
        }
        .builder__preview {
          position: sticky;
          top: 16px;
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
          padding: 0;
        }
        .preview-shell {
          padding: 8px;
          background: var(--bg-2);
          border-radius: var(--radius-lg);
          border: 1px solid var(--line);
        }

        @media print {
          .builder-head, .builder__form { display: none !important; }
          .app-shell, .content { padding: 0 !important; margin: 0 !important; }
          .atmosphere { display: none !important; }
          .builder { display: block !important; }
          .builder__preview {
            position: static !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .preview-shell {
            padding: 0 !important;
            background: #fff !important;
            border: none !important;
          }
        }
      `}</style>
    </main>
  );
}
