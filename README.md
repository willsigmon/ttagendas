# two twelve° Agenda Builder (standalone)

A no-login, browser-only weekly meeting agenda builder for two twelve° referral chapters.
All edits live in the browser's localStorage. No database, no auth.

Built so a chapter chair can:
1. Pick their chapter (ERA / RDU / CGC / blank).
2. Fill in this week's spotlight, mentor, and tip of the week.
3. Print a clean letter-size agenda or copy a share link.

## Local dev

```
npm install
npm run dev    # http://localhost:3001
```

## Deploy

```
vercel
```

URL params:
- `?chapter=elevated-referral` — preselect ERA
- `?date=2026-05-07` — preselect a meeting date
