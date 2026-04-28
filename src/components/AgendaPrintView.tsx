"use client";

import type { AgendaGroup, AgendaItem, ChapterPreset } from "@/lib/agenda-defaults";

export function AgendaPrintView({
  preset,
  meetingDate,
  meetingDateLong,
  spotlightName,
  spotlightCompany,
  mentorName,
  tipText,
  items,
  groups,
}: {
  preset: ChapterPreset;
  meetingDate: string;
  meetingDateLong: string;
  spotlightName: string | null;
  spotlightCompany: string | null;
  mentorName: string | null;
  tipText: string | null;
  items: AgendaItem[];
  groups: AgendaGroup[];
}) {
  const meetingMeta = `${meetingDateLong} • ${preset.meetingTime || "Time TBD"} • ${preset.venue || "Venue TBD"}`;
  const accent = preset.accent || "#59BFEF";

  const decorated = items.map((it) => {
    if (it.spotlight === "spotlight" && spotlightName) {
      return { ...it, label: `${it.label} — ${spotlightName}` };
    }
    if (it.spotlight === "mentor" && mentorName) {
      return { ...it, label: `${it.label} — ${mentorName}` };
    }
    return it;
  });

  return (
    <article
      className="agenda-page"
      data-meeting-date={meetingDate}
      style={{ ["--chapter-accent" as string]: accent } as React.CSSProperties}
    >
      <header className="agenda-page__head">
        <div className="agenda-page__brand">
          <span className="agenda-page__wordmark">
            <span className="agenda-page__two">two</span>
            <span className="agenda-page__twelve">
              twelve<span className="agenda-page__deg" aria-hidden>°</span>
            </span>
          </span>
          <span className="agenda-page__sub">Referral Networks</span>
        </div>
        <div className="agenda-page__title">
          <h1>{preset.name || "Two Twelve Chapter"}</h1>
          <p>{meetingMeta}</p>
          {preset.motif ? (
            <p className="agenda-page__flavor">
              <span className="agenda-page__motif" style={{ color: accent }}>
                {preset.motif}
              </span>
              <span className="agenda-page__tagline">{preset.tagline}</span>
            </p>
          ) : null}
        </div>
      </header>

      <section className="agenda-page__body">
        <div className="agenda-page__col">
          <h2 className="agenda-page__section">Meeting Agenda</h2>
          <ol className="agenda-list">
            {groups.map((group) => {
              const inGroup = decorated.filter((it) => it.group === group);
              if (inGroup.length === 0) return null;
              return (
                <li key={group} className="agenda-group">
                  <p className="agenda-group__label">{group}</p>
                  <ul>
                    {inGroup.map((it) => (
                      <li key={it.id} className="agenda-line">
                        <span className="agenda-line__glyph">{it.glyph}</span>
                        <span className="agenda-line__label">{it.label}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="agenda-page__side">
          {spotlightName ? (
            <div className="agenda-card">
              <p className="agenda-card__label">Member Spotlight</p>
              <p className="agenda-card__name">{spotlightName}</p>
              {spotlightCompany ? (
                <p className="agenda-card__sub">{spotlightCompany}</p>
              ) : null}
            </div>
          ) : null}

          <div className="agenda-card">
            <p className="agenda-card__label">Leadership</p>
            <ul className="agenda-leaders">
              <li><span>Chair</span><span>{preset.chair || "—"}</span></li>
              <li><span>Vice Chair</span><span>{preset.viceChair || "—"}</span></li>
              <li><span>Team Admin</span><span>{preset.teamAdmin || "—"}</span></li>
              <li><span>TMS</span><span>{preset.tms || "—"}</span></li>
              {preset.areaMentor ? (
                <li><span>Area Mentor</span><span>{preset.areaMentor}</span></li>
              ) : null}
            </ul>
          </div>

          {tipText ? (
            <div className="agenda-card agenda-card--tip">
              <p className="agenda-card__label">Tip of the Week</p>
              <p className="agenda-card__tip">{tipText}</p>
            </div>
          ) : null}
        </aside>
      </section>

      <footer className="agenda-page__foot">
        <span>{preset.shortName || "two twelve°"} · A two twelve° Referral Networks chapter</span>
        <span className="agenda-page__url">team.twotwelvenc.org</span>
      </footer>

      <style>{`
        .agenda-page {
          background: #FFFFFF;
          width: 100%;
          max-width: 8.5in;
          min-height: 11in;
          margin: 0 auto;
          box-shadow: var(--shadow-md);
          padding: 0.6in 0.7in;
          display: flex;
          flex-direction: column;
          gap: 18px;
          color: #1A1A1A;
          font-family: "Poppins", system-ui, sans-serif;
        }
        .agenda-page__head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid;
          border-image: linear-gradient(90deg, var(--chapter-accent, #59BFEF), #6BBE5A) 1;
        }
        .agenda-page__flavor {
          margin: 6px 0 0;
          display: flex;
          align-items: baseline;
          justify-content: flex-end;
          gap: 8px;
          font-size: 11px;
        }
        .agenda-page__motif {
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .agenda-page__tagline { color: #4F5A60; font-style: italic; }
        .agenda-page__brand {
          display: flex; flex-direction: column; gap: 2px;
          font-weight: 800; line-height: 0.95; letter-spacing: -0.025em;
        }
        .agenda-page__wordmark {
          display: inline-flex; align-items: baseline; gap: 6px; font-size: 28px;
        }
        .agenda-page__two { color: #59BFEF; }
        .agenda-page__twelve { color: #1A1A1A; position: relative; }
        .agenda-page__deg {
          color: #59BFEF; font-size: 0.55em; margin-left: 1px;
          vertical-align: super; line-height: 0;
        }
        .agenda-page__sub {
          font-size: 9px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: #6BBE5A;
        }
        .agenda-page__title { text-align: right; }
        .agenda-page__title h1 {
          margin: 0; font-weight: 800; font-size: 26px; letter-spacing: -0.02em;
        }
        .agenda-page__title p {
          margin: 2px 0 0; font-size: 11px; color: #4F5A60; font-weight: 500;
        }
        .agenda-page__body {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
          gap: 24px; flex: 1;
        }
        .agenda-page__section {
          margin: 0 0 8px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase; color: #4A9A3C;
        }
        .agenda-list {
          list-style: none; margin: 0; padding: 0;
          display: flex; flex-direction: column; gap: 14px;
        }
        .agenda-group__label {
          margin: 0 0 4px; font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: #59BFEF;
        }
        .agenda-group ul {
          list-style: none; margin: 0; padding: 0;
          display: flex; flex-direction: column; gap: 4px;
        }
        .agenda-line {
          display: flex; align-items: baseline; gap: 10px;
          font-size: 13px; line-height: 1.45; color: #1A1A1A;
        }
        .agenda-line__glyph {
          color: #6BBE5A; font-size: 12px; width: 14px;
          flex-shrink: 0; text-align: center;
        }
        .agenda-line__label { font-weight: 500; }
        .agenda-page__side { display: flex; flex-direction: column; gap: 12px; }
        .agenda-card {
          border: 1px solid rgba(26, 26, 26, 0.10);
          border-radius: 8px; padding: 12px 14px;
          background: linear-gradient(180deg, rgba(89, 191, 239, 0.05), rgba(255, 255, 255, 1));
          break-inside: avoid;
        }
        .agenda-card__label {
          margin: 0 0 4px; font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: #4F5A60;
        }
        .agenda-card__name {
          margin: 0; font-size: 18px; font-weight: 800;
          letter-spacing: -0.01em; color: #1A1A1A;
        }
        .agenda-card__sub { margin: 2px 0 0; font-size: 12px; color: #4F5A60; }
        .agenda-leaders { list-style: none; margin: 0; padding: 0; font-size: 12px; }
        .agenda-leaders li {
          display: flex; justify-content: space-between; gap: 12px;
          padding: 3px 0; border-top: 1px dashed rgba(26, 26, 26, 0.10);
        }
        .agenda-leaders li:first-child { border-top: none; }
        .agenda-leaders li span:first-child { color: #4F5A60; font-weight: 500; }
        .agenda-leaders li span:last-child { color: #1A1A1A; font-weight: 600; }
        .agenda-card--tip {
          background: linear-gradient(135deg, rgba(89, 191, 239, 0.08), rgba(107, 190, 90, 0.08));
        }
        .agenda-card__tip {
          margin: 0; font-size: 13px; line-height: 1.55;
          color: #1A1A1A; font-style: italic;
        }
        .agenda-page__foot {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 10px; border-top: 1px solid rgba(26, 26, 26, 0.10);
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #4F5A60;
        }
        .agenda-page__url { color: #59BFEF; font-weight: 700; }

        @media print {
          @page { size: letter; margin: 0; }
          html, body { background: #FFFFFF !important; }
          .agenda-page { box-shadow: none; margin: 0; max-width: 8.5in; min-height: 11in; }
        }
      `}</style>
    </article>
  );
}
