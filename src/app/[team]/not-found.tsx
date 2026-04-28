import Link from "next/link";
import { TEAM_PRESETS } from "@/lib/agenda-defaults";

export default function TeamNotFound() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "#e8e0d8" }}>
      <div style={{ maxWidth: 480, textAlign: "center", background: "#fff", padding: 28, borderRadius: 6, border: "1px solid rgba(156,119,72,0.22)" }}>
        <p style={{ fontFamily: "var(--font-display), sans-serif", letterSpacing: 3, fontSize: 12, color: "#9c7748", margin: 0, fontWeight: 700, textTransform: "uppercase" }}>
          Team not found
        </p>
        <h1 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 28, letterSpacing: 1.5, margin: "6px 0 4px" }}>
          We don&apos;t have that team yet
        </h1>
        <p style={{ fontFamily: "var(--font-serif), Georgia, serif", fontStyle: "italic", color: "#5c4a3d", marginBottom: 20 }}>
          Try one of these:
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {TEAM_PRESETS.map((t) => (
            <Link
              key={t.id}
              href={`/${t.shortName.toLowerCase()}`}
              style={{
                padding: "10px 14px",
                borderRadius: 4,
                border: `1.5px solid ${t.accent}`,
                color: "#fff",
                background: t.accent,
                textDecoration: "none",
                fontFamily: "var(--font-display), sans-serif",
                letterSpacing: 1.5,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {t.shortName}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
