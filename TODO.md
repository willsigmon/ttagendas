# TODO — Two Twelve Agendas (ttagendas.vercel.app)

Live: https://ttagendas.vercel.app
Vercel project: `wsm-group/ttagendas` (https://vercel.com/wsm-group/ttagendas)

## Where things stand (2026-04-28)

- ✅ Standalone Next.js 16 + Tailwind 4 app, no Supabase, no auth, no DB
- ✅ Three teams baked in as presets: ERA / RDU / CGC + a "blank" fallback
- ✅ Routes: `/era`, `/rdu`, `/cgc` plus full slugs `/elevated-referral`, `/rdu-heatwave`, `/common-ground`
- ✅ Two-page parchment layout matching `rduheatwave.team/agenda` (cream + Bebas Neue + Cormorant + Plus Jakarta Sans)
- ✅ Per-team accent: ERA sky blue, RDU fire orange, CGC hunter green
- ✅ Live preview pane + browser-print → 2-page PDF
- ✅ localStorage persistence per `team:meeting-date`
- ✅ Roster paste editor (`Name | Profession | Company` one per line)
- ✅ Optional `?date=YYYY-MM-DD` URL param

## Continue here

### Pickup commands on the new machine

```bash
# Clone
gh repo clone wsigmon/ttagendas         # (or whatever the remote becomes — check `git remote -v`)
cd ttagendas

# Install + run
npm install
npm run dev    # http://localhost:3001

# Deploy
VERCEL_NO_PLUGIN=1 vercel --prod --yes
```

Vercel project is already linked under `wsm-group/ttagendas` — `.vercel/` is gitignored, so on a fresh clone re-link with:
```bash
VERCEL_NO_PLUGIN=1 vercel link --yes --project ttagendas --scope wsm-group
```

## Open punch list

### High value (do next)

- [ ] **Per-team data not persisted across browsers.** Today, RDU's roster is hard-coded in `src/lib/agenda-defaults.ts`. ERA & CGC have empty rosters until a chair pastes one — but that paste only saves to *that* chair's localStorage. If we want per-team server-side persistence, wire to Supabase (TT-CRM already has `weekly_agendas` and `team_members` tables) or to a tiny KV (Vercel KV / Upstash).
- [ ] **Stats are static.** RDU shows `11 / 113 / 207 / 49 / 158 / $115,331` from preset. ERA/CGC show all dashes. Either pull from RDU's `/api/stats` endpoint (if it's open) or let the chair edit them in the sidebar.
- [ ] **Spotlight rotation.** Right now the chair types each week. The original TT-CRM logic in `src/lib/agenda-defaults.ts > pickRotatedSpotlight` rotates through the roster anchored to a `rotation_start_date`. Port that and pre-fill the spotlight name from `roster[(weekIndex) % roster.length]`.
- [ ] **Save the Spotlight queue.** The 3 "upcoming" slots are manual today. Auto-derive from rotation as soon as the roster has names.
- [ ] **Better print fallback.** The 2-page preview *looks* correct but `@media print` was only spot-tested with curl. Open in Chrome → Cmd+P → Save as PDF on a real letter sheet to confirm pagination, especially with longer rosters that overflow page 2.

### Polish

- [ ] **Add ERA + CGC rosters.** Get the actual member lists and bake them into `TEAM_PRESETS` so chairs don't have to paste each week.
- [ ] **Per-team meta.** ERA/CGC show "Venue TBD" — fill in real venues + meeting times.
- [ ] **QR code on page 1.** RDU's reference has one in the top-right linking to the team site. We replaced it with text. Either generate inline (qrcode-svg lib at build time) or add as a per-team SVG asset.
- [ ] **Heatwave logo on page 1.** Reference uses `heatwave-logo.png` round avatar. Could hotlink or self-host per team.
- [ ] **Better mobile builder.** Sidebar is sticky on desktop, stacks on mobile, but the 8.5"-wide preview overflows on phones. Add `transform: scale()` for narrow viewports or a "preview at 50%" toggle.
- [ ] **About copy is generic.** The "211° is hot. 212° makes steam." paragraph is shared. Allow per-team override if a team wants their own pitch.
- [ ] **About pills crowd on narrow page widths.** They wrap to vertical via `flex-wrap`. Fine in print, ugly on screen between ~600-900px width.

### Out-of-scope but on the radar

- [ ] **Multi-week scheduler.** Chair fills out a quarter of agendas in advance and they auto-publish on the right week. Probably needs a real backend.
- [ ] **Chair-only edit vs. member-view.** Read-only printable URL `/era/print/2026-05-07` that anyone can hit, vs. `/era` (the editor).
- [ ] **Connect back to TT-CRM.** TT-CRM has `weekly_agendas`. If chairs use TT-CRM later, this standalone app should read/write the same Supabase row so they don't double-enter.
- [ ] **Custom domain.** Currently `ttagendas.vercel.app`. Could move to `agenda.twotwelvereferrals.com` or keep teams on their own (`era.team/agenda`, `cgc.team/agenda`).

## File map

```
src/
├── app/
│   ├── [team]/
│   │   ├── page.tsx          # /era /rdu /cgc — main entry
│   │   └── not-found.tsx     # unknown-team page
│   ├── page.tsx              # / → redirect to /era
│   ├── layout.tsx            # fonts (Bebas / Cormorant / Plus Jakarta)
│   └── globals.css           # minimal — most CSS lives in component <style>
├── components/
│   ├── AgendaApp.tsx         # sidebar form + live preview wrapper
│   └── AgendaPrintView.tsx   # the 2-page printable doc (all visual design)
└── lib/
    ├── agenda-defaults.ts    # TEAM_PRESETS, AGENDA_GROUPS, DEFAULT_AGENDA, helpers
    └── storage.ts            # localStorage load/save per team:date
```

## Reference

- Design source: https://rduheatwave.team/agenda
- Reference CSS pulled to `/tmp/rdu-agenda.css` on the old laptop — re-fetch with:
  ```bash
  curl https://rduheatwave.team/agenda.css -o /tmp/rdu-agenda.css
  ```
- TT-CRM (for shared data later): `/Users/wsig/GitHub MBA/TT-CRM` on the old laptop, on Vercel as `two-twelve-launch` at `team.twotwelvenc.org`
