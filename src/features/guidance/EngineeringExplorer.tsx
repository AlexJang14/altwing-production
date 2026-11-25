import {preferredScrollBehavior} from '../../design/golden-horizon/motion';
import { useMemo, useState, type CSSProperties } from "react";
import { ENGINEERING_MAJORS } from "./engineeringMajors";
import { readEngineeringMatch } from "./guidanceStorage";
import type { EngineeringMajorId } from "./guidanceTypes";
import "./guidance.css";

interface EngineeringExplorerProps {
  onBack: () => void;
  onOpenCounselor: (majorId: EngineeringMajorId) => void;
  onStartMatch: () => void;
  onOpenAerospaceDeepDive: () => void;
}

export default function EngineeringExplorer({
  onBack,
  onOpenCounselor,
  onStartMatch,
  onOpenAerospaceDeepDive,
}: EngineeringExplorerProps) {
  const [query, setQuery] = useState("");
  const match = readEngineeringMatch();
  const topIds = match?.rankings.slice(0, 3).map((item) => item.majorId) ?? [];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return ENGINEERING_MAJORS;
    return ENGINEERING_MAJORS.filter((major) =>
      [major.name, major.description, ...major.subjects, ...major.careers, ...major.signals]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  return (
    <main className="guidance-page guidance-explorer-page">
      <section className="module-toolbar">
        <button type="button" onClick={onBack}>← Home</button>

        <button type="button" onClick={onStartMatch}>Find My Wing →</button>
      </section>

      <section className="explorer-hero">
        <span>02 · EXPLORE ENGINEERING</span>
        <h1>Don't Just Read.<br />Try the Work.</h1>
        <h2 className="aw-first-subtitle">Explore fields. Experience challenges.</h2>
        <p>
          Discover engineering disciplines and experience how engineers solve problems through interactive missions and hands-on labs.
        </p>
        <button type="button" className="aw-button aw-first-cta" onClick={() => document.getElementById('engineering-fields')?.scrollIntoView({behavior: preferredScrollBehavior(),block:'start'})}>Explore Engineering Fields</button>
        <label className="engineering-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search engineering directions" placeholder="Search chemistry, robots, health, structures, climate..."
          />
        </label>
      </section>

      {topIds.length > 0 && (
        <section className="explorer-match-strip">
          <div>
            <span>YOUR WINGMATCH SIGNAL</span>
            <strong>{topIds.map((id) => ENGINEERING_MAJORS.find((major) => major.id === id)?.shortName).join(" · ")}</strong>
          </div>
          <button type="button" onClick={() => onOpenCounselor(topIds[0])}>Open my field guide →</button>
        </section>
      )}

      <section className="engineering-card-grid" id="engineering-fields">
        {filtered.map((major) => {
          const matched = topIds.indexOf(major.id);
          return (
            <article
              key={major.id}
              className="engineering-major-card"
              style={{ "--major-accent": major.accent } as CSSProperties}
            >
              <div className="major-card-topline">
                <span className="major-card-icon">{major.icon}</span>
                {matched >= 0 && <b>YOUR #{matched + 1} SIGNAL</b>}
              </div>
              <h2>{major.name}</h2>
              <p>{major.tagline}</p>
              <div className="major-subjects">
                {major.subjects.slice(0, 4).map((subject) => <span key={subject}>{subject}</span>)}
              </div>
              <div className="major-card-actions">
                <button type="button" onClick={() => onOpenCounselor(major.id)}>
                  Explore major →
                </button>
                {major.id === "aerospace" && (
                  <button type="button" className="text-action" onClick={onOpenAerospaceDeepDive}>
                    Open aerospace deep dive
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
