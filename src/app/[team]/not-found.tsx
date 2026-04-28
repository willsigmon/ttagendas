import Link from "next/link";
import { CHAPTER_PRESETS } from "@/lib/agenda-defaults";

export default function TeamNotFound() {
  const chapters = CHAPTER_PRESETS.filter((p) => p.id !== "blank");
  return (
    <main className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="content" style={{ display: "grid", placeItems: "center", minHeight: "70dvh" }}>
        <div className="panel p-6" style={{ maxWidth: 480, textAlign: "center" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--brand-blue-deep)" }}>
            Chapter not found
          </p>
          <h1 className="display text-xl mt-1" style={{ color: "var(--ink)" }}>
            We don&apos;t have that team yet
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--ink-muted)" }}>
            Try one of the live chapters:
          </p>
          <ul className="mt-3 grid gap-2">
            {chapters.map((c) => (
              <li key={c.id}>
                <Link className="btn btn-ghost btn-sm" href={`/${c.shortName.toLowerCase()}`}>
                  {c.shortName} — {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link className="btn btn-primary btn-sm" href="/">
                Open the generic builder
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
