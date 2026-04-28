"use client";

import {
  AGENDA_GROUPS,
  DEFAULT_AGENDA,
  formatMeetingDateLong,
  type RosterMember,
  type TeamPreset,
} from "@/lib/agenda-defaults";

interface PrintProps {
  team: TeamPreset;
  meetingDate: string;
  spotlightName: string;
  spotlightProfession: string;
  upcoming: [string, string, string];
  mentorName: string;
  tipText: string;
  roster: RosterMember[];
  stats: TeamPreset["stats"];
  venue: TeamPreset["venue"];
}

const dash = (s: string) => (s.trim() ? s : "—");

export function AgendaPrintView({
  team,
  meetingDate,
  spotlightName,
  spotlightProfession,
  upcoming,
  mentorName,
  tipText,
  roster,
  stats,
  venue,
}: PrintProps) {
  const meetingDateLong = formatMeetingDateLong(meetingDate);
  const decoratedAgenda = DEFAULT_AGENDA.map((it) => {
    if (it.label === "Member Spotlight" && spotlightName.trim()) {
      return { ...it, label: `Member Spotlight — ${spotlightName.trim()}` };
    }
    if (it.label === "Mentor Moment" && mentorName.trim()) {
      return { ...it, label: `Mentor Moment — ${mentorName.trim()}` };
    }
    return it;
  });

  return (
    <div
      className="print-doc"
      style={
        {
          ["--accent" as string]: team.accent,
          ["--accent-soft" as string]: team.accentSoft,
        } as React.CSSProperties
      }
    >
      {/* ============================================================
        PAGE 1 — Agenda + Spotlight + Leadership + Tip + About + Venue
       ============================================================ */}
      <div className="page">
        <header className="hdr">
          <div className="hdr__id">
            <div className="hdr__name">
              {team.prefix} <span className="hdr__motif">{team.motif}</span>
            </div>
            <div className="hdr__sub">Two Twelve Referral Network</div>
            <div className="hdr__meta">
              {meetingDateLong.toUpperCase()} · {team.meetingTime.toUpperCase()} · {venue.name.toUpperCase()}
            </div>
          </div>
          <div className="hdr__url">
            <div className="hdr__url-big">{team.url}</div>
            <div className="hdr__url-label">Visit the team</div>
          </div>
        </header>

        <div className="stats">
          {[
            ["Members", stats.members],
            ["Guests", stats.guests],
            ["BizChats", stats.bizchats],
            ["Referrals", stats.referrals],
            ["Total GIs", stats.gis],
            ["Closed Revenue", stats.revenue],
          ].map(([label, value]) => (
            <div key={label} className="stat">
              <div className="stat__v">{value}</div>
              <div className="stat__l">{label}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div className="col-main">
            <div className="sec sec--accent">Meeting Agenda</div>
            <ul className="agenda">
              {AGENDA_GROUPS.map((group) => {
                const inGroup = decoratedAgenda.filter((it) => it.group === group);
                return (
                  <li key={group} className="agenda__group">
                    <div className="agenda__group-label">{group}</div>
                    {inGroup.map((it, i) => (
                      <div key={i} className="agenda__row">
                        <span className="agenda__glyph">{it.glyph}</span>
                        <span className="agenda__text">{it.label}</span>
                      </div>
                    ))}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="col-side">
            <div className="sec">Member Spotlight</div>
            <div className="spotlight">
              <div className="spotlight__hero">
                <div className="spotlight__hero-label">This Week</div>
                <div className="spotlight__hero-name">{dash(spotlightName)}</div>
                <div className="spotlight__hero-prof">{dash(spotlightProfession)}</div>
              </div>
              <div className="spotlight__upcoming">
                {(["Next", "2 Wks", "3 Wks"] as const).map((label, i) => (
                  <div key={label} className="spotlight__up">
                    <div className="spotlight__up-label">{label}</div>
                    <div className="spotlight__up-name">{dash(upcoming[i])}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sec">Leadership</div>
            <div className="leaders">
              <div className="leader">
                <span className="leader__role">Team Chair</span>
                <span className="leader__name">{dash(team.chair)}</span>
              </div>
              <div className="leader">
                <span className="leader__role">Vice Chair</span>
                <span className="leader__name">{dash(team.viceChair)}</span>
              </div>
              <div className="leader">
                <span className="leader__role">Team Admin</span>
                <span className="leader__name">{dash(team.teamAdmin)}</span>
              </div>
            </div>

            <div className="tip">
              <div className="tip__label">Referral Tip of the Week</div>
              <div className="tip__text">{tipText.trim() || "—"}</div>
            </div>
          </div>
        </div>

        <div className="about">
          <strong>211° is hot. 212° makes steam.</strong>{" "}
          {team.about.lead.replace(/^211° is hot\. 212° makes steam\.\s*/, "")}
        </div>
        <div className="about__pills">
          {team.about.pills.map((p) => (
            <span key={p.title} className="about__pill">
              <strong>{p.title}</strong> {p.body}
            </span>
          ))}
          <span className="about__url">{team.url}</span>
        </div>

        <div className="venue">
          <strong>{venue.name}</strong>
          {venue.address ? (
            <>
              <span className="venue__dot">◆</span>
              {venue.address}
            </>
          ) : null}
          {venue.note ? (
            <>
              <span className="venue__dot">◆</span>
              {venue.note}
            </>
          ) : null}
        </div>
      </div>

      {/* ============================================================
        PAGE 2 — Worksheets + Notes + Roster
       ============================================================ */}
      <div className="page">
        <div className="two-col">
          <div className="col-main">
            <div className="sec sec--accent">Connections to Make This Week</div>
            <div className="wpanel wpanel--accent">
              <div className="wprompt">
                Listen for names &amp; companies. Write them down.
                <br />
                Take this back to your office and <strong>make that introduction.</strong>
              </div>
              <ol className="wlines">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="wline" />
                ))}
              </ol>
              <div className="wnudge">Every name here is a relationship waiting to happen.</div>
            </div>
          </div>
          <div className="col-side">
            <div className="sec">BizChats Next Week</div>
            <div className="wpanel">
              <div className="wprompt">
                Who are you meeting 1-on-1 this week?
                <br />
                <strong>Book it before you leave.</strong>
              </div>
              <ol className="wlines">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="wline" />
                ))}
              </ol>
              <div className="wnudge">Relationships are built between meetings, not during them.</div>
            </div>
          </div>
        </div>

        <div className="sec sec--accent">Notes &amp; Key Takeaways</div>
        <div className="wpanel wpanel--grow">
          <div className="wprompt">
            What stood out today? What can you act on <strong>this week</strong>?
          </div>
          <ol className="wlines">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="wline" />
            ))}
          </ol>
          <div className="wnudge">The ink you put here is worth more than the agenda on the other side.</div>
        </div>

        <div className="ornament">◆ ◆ ◆</div>

        <div className="sec">Member Roster</div>
        <p className="roster-note">
          Public agenda copy lists members by seat only. Full contact details stay in the team directory.
        </p>
        <div className="roster-panel">
          {roster.length > 0 ? (
            <table className="roster">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Profession</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((m, i) => (
                  <tr key={i}>
                    <td className="roster__name">{m.name}</td>
                    <td className="roster__prof">{m.profession}</td>
                    <td>{m.company}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="roster-empty">
              Roster not set yet — chair can paste members in the builder.
            </p>
          )}
        </div>

        <div className="foot">
          <span>{meetingDateLong}</span>
          <span className="foot__brand">two twelve° referral networks</span>
          <span className="foot__url">{team.url}</span>
        </div>
      </div>

      {/* Print stylesheet — adapted from rduheatwave.team/agenda.css,
          themed per team via --accent. */}
      <style>{`
        .print-doc {
          font-family: 'Plus Jakarta Sans', 'Poppins', system-ui, sans-serif;
          color: #1a1412;
          font-size: 9.5pt;
          line-height: 1.5;
        }
        .print-doc strong { font-weight: 700; }
        .print-doc * { box-sizing: border-box; }

        .page {
          background: #ffffff;
          color: #231914;
          width: 8.5in;
          min-height: 11in;
          padding: 0.5in;
          margin: 0 auto 24px;
          page-break-after: always;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 2px 20px rgba(0,0,0,0.12);
          border-radius: 3px;
        }
        .page:last-child { page-break-after: avoid; margin-bottom: 0; }

        .hdr {
          display: flex;
          align-items: center;
          gap: 12pt;
          padding: 6pt 6pt 6pt;
          border-bottom: 1.5pt solid rgba(156,119,72,0.22);
        }
        .hdr__id { flex: 1; }
        .hdr__name {
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 28pt;
          letter-spacing: 3pt;
          color: #231914;
          line-height: 1;
          font-weight: 800;
        }
        .hdr__motif { color: var(--accent); }
        .hdr__sub {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 8.5pt;
          color: #9c7748;
          letter-spacing: 2pt;
          text-transform: uppercase;
          margin-top: 2pt;
        }
        .hdr__meta {
          margin-top: 4pt;
          font-size: 7pt;
          font-weight: 600;
          letter-spacing: 0.35pt;
          color: #5c4a3d;
        }
        .hdr__url { text-align: right; flex-shrink: 0; }
        .hdr__url-big {
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 14pt;
          letter-spacing: 1pt;
          color: var(--accent);
          font-weight: 700;
        }
        .hdr__url-label {
          font-size: 6.5pt;
          letter-spacing: 1.5pt;
          color: #8a7361;
          text-transform: uppercase;
          margin-top: 2pt;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 6pt;
          padding: 8pt 4pt 6pt;
        }
        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2pt;
          padding: 6pt 5pt 5pt;
          background: linear-gradient(180deg, rgba(248,244,240,0.98), rgba(239,229,220,0.96));
          border: 0.75pt solid var(--accent-soft);
          border-radius: 4pt;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
          min-width: 0;
        }
        .stat__v {
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 14pt;
          color: #2b1d16;
          line-height: 1;
          font-weight: 800;
        }
        .stat__l {
          font-size: 6pt;
          text-transform: uppercase;
          color: #786354;
          letter-spacing: 1pt;
          text-align: center;
        }

        .two-col {
          display: flex;
          gap: 20pt;
          margin-top: 6pt;
          flex: 1;
        }
        .col-main { flex: 1.15; display: flex; flex-direction: column; }
        .col-side { flex: 0.85; display: flex; flex-direction: column; }

        .sec {
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 11pt;
          letter-spacing: 2pt;
          color: #9c7748;
          border-bottom: 0.75pt solid rgba(156,119,72,0.22);
          padding-bottom: 3pt;
          margin-bottom: 6pt;
          margin-top: 10pt;
          text-transform: uppercase;
          font-weight: 700;
        }
        .sec:first-child { margin-top: 0; }
        .sec--accent { color: var(--accent); }

        .agenda {
          list-style: none;
          margin: 0;
          padding: 5pt 6pt;
          background: linear-gradient(180deg, rgba(244,238,232,0.98), rgba(235,226,217,0.96));
          border-radius: 4pt;
          border: 0.5pt solid rgba(185,145,84,0.22);
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .agenda__group { padding: 0; margin: 0; }
        .agenda__group-label {
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 8.5pt;
          letter-spacing: 1.5pt;
          color: var(--accent);
          text-transform: uppercase;
          padding: 7pt 6pt 2pt;
          font-weight: 700;
        }
        .agenda__group:first-child .agenda__group-label { padding-top: 2pt; }
        .agenda__row {
          display: flex;
          align-items: center;
          padding: 5pt 8pt;
          gap: 6pt;
          border-radius: 2pt;
          line-height: 1.15;
        }
        .agenda__row:nth-child(even) { background: rgba(138,109,59,0.06); }
        .agenda__glyph {
          color: var(--accent);
          font-size: 9pt;
          min-width: 14pt;
          text-align: center;
          line-height: 1;
        }
        .agenda__text {
          flex: 1;
          font-weight: 500;
          font-size: 8.5pt;
          color: #231914;
          letter-spacing: 0.2pt;
        }

        .spotlight {
          background: linear-gradient(180deg, rgba(247,238,229,0.98), rgba(238,228,219,0.96));
          border: 0.75pt solid var(--accent-soft);
          border-radius: 4pt;
          padding: 10pt 12pt 12pt;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
        }
        .spotlight__hero {
          text-align: center;
          padding: 8pt 0 10pt;
          border-bottom: 0.5pt solid rgba(156,119,72,0.22);
          margin-bottom: 8pt;
        }
        .spotlight__hero-label {
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 6.5pt;
          letter-spacing: 1.5pt;
          color: var(--accent);
          opacity: 0.55;
          text-transform: uppercase;
          margin-bottom: 4pt;
          font-weight: 700;
        }
        .spotlight__hero-name {
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 20pt;
          color: var(--accent);
          letter-spacing: 1.5pt;
          line-height: 1.1;
          font-weight: 800;
        }
        .spotlight__hero-prof {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 9.5pt;
          color: #5c4a3d;
          font-style: italic;
          margin-top: 2pt;
        }
        .spotlight__upcoming {
          display: flex;
          gap: 4pt;
          justify-content: space-between;
        }
        .spotlight__up { text-align: center; flex: 1; }
        .spotlight__up-label {
          font-size: 5.5pt;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
          color: #8a7361;
        }
        .spotlight__up-name {
          font-size: 6.8pt;
          font-weight: 600;
          color: #5c4a3d;
          line-height: 1.3;
        }

        .leaders {
          background: linear-gradient(180deg, rgba(244,238,232,0.98), rgba(235,226,217,0.96));
          border-radius: 4pt;
          padding: 5pt 8pt;
          border: 0.5pt solid rgba(185,145,84,0.18);
        }
        .leader {
          display: flex;
          justify-content: space-between;
          padding: 6pt 0;
          font-size: 8.5pt;
          border-bottom: 0.5pt solid rgba(138,109,59,0.08);
        }
        .leader:last-child { border-bottom: none; }
        .leader__role {
          color: #8a7361;
          font-size: 7pt;
          text-transform: uppercase;
          letter-spacing: 0.5pt;
        }
        .leader__name { font-weight: 600; color: #231914; }

        .tip {
          background: linear-gradient(180deg, rgba(247,238,229,0.98), rgba(238,228,219,0.96));
          border-radius: 4pt;
          padding: 10pt 12pt;
          margin-top: 10pt;
          border: 0.75pt solid var(--accent-soft);
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .tip__label {
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 11pt;
          letter-spacing: 2pt;
          color: var(--accent);
          margin-bottom: 6pt;
          text-align: center;
          padding-bottom: 5pt;
          font-weight: 700;
        }
        .tip__text {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 12pt;
          font-style: italic;
          line-height: 1.55;
          color: #5c4a3d;
          text-align: center;
        }

        .about {
          margin-top: 10pt;
          border-top: 0.75pt solid rgba(156,119,72,0.22);
          text-align: center;
          padding: 10pt 16pt 4pt;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 9.5pt;
          font-style: italic;
          line-height: 1.5;
          color: #5c4a3d;
        }
        .about strong {
          font-style: normal;
          color: #9c7748;
          font-size: 10.5pt;
        }
        .about__pills {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5pt;
          padding: 0 16pt 9pt;
          border-bottom: 0.75pt solid rgba(156,119,72,0.22);
          flex-wrap: wrap;
        }
        .about__pill {
          display: inline-flex;
          align-items: center;
          gap: 3pt;
          padding: 3pt 7pt;
          border-radius: 999pt;
          background: rgba(234,224,214,0.96);
          color: #231914;
          font-size: 7pt;
          font-weight: 600;
          letter-spacing: 0.3pt;
        }
        .about__pill strong { color: var(--accent); font-size: 7pt; }
        .about__url {
          color: var(--accent);
          font-weight: 700;
          font-size: 8pt;
          letter-spacing: 0.5pt;
        }

        .venue {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5pt;
          padding: 6pt 0 0;
          margin-top: 8pt;
          font-size: 6.5pt;
          color: #8a7361;
          letter-spacing: 0.3pt;
          flex-wrap: wrap;
          text-align: center;
        }
        .venue strong { color: #231914; }
        .venue__dot { color: var(--accent); }

        .wpanel {
          background: linear-gradient(180deg, rgba(244,238,232,0.98), rgba(235,226,217,0.96));
          border-radius: 6pt;
          padding: 8pt 10pt;
          border: 0.5pt solid rgba(185,145,84,0.18);
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .wpanel--accent {
          background: linear-gradient(180deg, rgba(247,238,229,0.98), rgba(238,228,219,0.96));
          border-color: var(--accent-soft);
        }
        .wpanel--grow { margin-bottom: 8pt; }
        .wprompt {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 10pt;
          font-style: italic;
          color: #5c4a3d;
          margin-bottom: 6pt;
          line-height: 1.5;
          padding-bottom: 4pt;
          border-bottom: 0.75pt solid rgba(138,109,59,0.22);
        }
        .wprompt strong { color: var(--accent); font-style: normal; font-size: 10.5pt; }
        .wnudge {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 8pt;
          font-style: italic;
          color: var(--accent);
          opacity: 0.55;
          text-align: center;
          margin-top: 6pt;
          padding-top: 4pt;
        }
        .wlines {
          list-style: none;
          counter-reset: writeline;
          margin: 0;
          padding: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .wline {
          counter-increment: writeline;
          display: flex;
          align-items: flex-end;
          padding: 6pt 0 2pt;
          border-bottom: 0.75pt solid rgba(138,109,59,0.3);
          min-height: 22pt;
        }
        .wline::before {
          content: counter(writeline);
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 9pt;
          color: var(--accent);
          opacity: 0.55;
          min-width: 12pt;
          font-weight: 700;
        }

        .ornament {
          text-align: center;
          padding: 8pt 0 4pt;
          color: var(--accent);
          opacity: 0.46;
          font-size: 7pt;
          letter-spacing: 6pt;
        }

        .roster-note {
          margin: 0 0 4pt;
          color: #8a7361;
          font-size: 6.8pt;
          font-style: italic;
        }
        .roster-panel {
          background: linear-gradient(180deg, rgba(244,238,232,0.98), rgba(235,226,217,0.96));
          border-radius: 4pt;
          padding: 4pt 6pt;
          border: 0.5pt solid rgba(185,145,84,0.18);
        }
        .roster-empty {
          margin: 6pt 0;
          padding: 12pt;
          text-align: center;
          color: #8a7361;
          font-style: italic;
          font-size: 8pt;
        }
        .roster {
          width: 100%;
          border-collapse: collapse;
          font-size: 7.5pt;
        }
        .roster th {
          font-family: 'Bebas Neue', 'Poppins', sans-serif;
          font-size: 7.5pt;
          letter-spacing: 1.5pt;
          color: #9c7748;
          padding: 4pt 5pt;
          text-align: left;
          border-bottom: 1pt solid rgba(156,119,72,0.22);
          font-weight: 700;
        }
        .roster td {
          padding: 4pt 5pt;
          border-bottom: 0.5pt solid rgba(138,109,59,0.08);
          color: #231914;
        }
        .roster tr:nth-child(even) td { background: rgba(138,109,59,0.05); }
        .roster__name { font-weight: 600; }
        .roster__prof { color: #8a7361; }

        .foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 6pt;
          margin-top: auto;
          border-top: 0.75pt solid rgba(156,119,72,0.22);
          font-size: 6.5pt;
          color: #8a7361;
        }
        .foot__brand { letter-spacing: 1pt; text-transform: uppercase; }
        .foot__url { color: var(--accent); font-weight: 700; }

        @media print {
          @page { size: letter; margin: 0.5in; }
          html, body { background: #ffffff !important; }
          .page {
            box-shadow: none;
            border-radius: 0;
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: auto;
          }
          .page:not(:last-child) { page-break-after: always; }
        }
      `}</style>
    </div>
  );
}
