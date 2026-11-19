import type { ReactNode } from "react";

const POINTS = [
  "Live classes with teachers who know your name",
  "Doubt solving whenever you get stuck",
  "Practice and plans built around your exam",
];

interface Props {
  children: ReactNode;
  heading?: string;
  eyebrow?: string;
  labelledBy: string;
}

/** Two-column page frame shared by the new-student and returning-student flows. */
export function PageShell({ children, labelledBy, eyebrow = "Learn with Vedantu", heading = "Learning that gives you the attention you deserve." }: Props) {
  return (
    <main className="page">
      <div className="shell">
        <section className="card" aria-labelledby={labelledBy}>{children}</section>
        <aside className="panel" aria-label="Why Vedantu">
          <div className="panel-inner">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{heading}</h2>
            <ul>
              {POINTS.map((p) => (
                <li key={p}>
                  <span className="tick" aria-hidden="true">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
