import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { GUIDANCE_COLLEGES } from "./collegeCatalog";
import { GUIDANCE_OPPORTUNITIES } from "./opportunityCatalog";
import { GUIDANCE_IDEAS } from "./ideaCatalog";
import { ENGINEERING_MAJOR_MAP } from "./engineeringMajors";
import { readEngineeringMatch, readSavedGuidance } from "./guidanceStorage";
import type { SavedGuidance } from "./guidanceTypes";

export default function GuidanceVault() {
  const [saved, setSaved] = useState<SavedGuidance>(() => readSavedGuidance());

  useEffect(() => {
    const refresh = () => setSaved(readSavedGuidance());
    window.addEventListener("altwing:guidance-saved", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("altwing:guidance-saved", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const match = readEngineeringMatch();
  const topMajors = match?.rankings.slice(0, 3) ?? [];
  const savedColleges = useMemo(() => GUIDANCE_COLLEGES.filter((college) => saved.collegeIds.includes(college.id)), [saved.collegeIds]);
  const savedOpportunities = useMemo(() => GUIDANCE_OPPORTUNITIES.filter((opportunity) => saved.opportunityIds.includes(opportunity.id)), [saved.opportunityIds]);
  const savedIdeas = useMemo(() => GUIDANCE_IDEAS.filter((idea) => saved.ideaIds.includes(idea.id)), [saved.ideaIds]);
  const navigatorSteps = [
    { label: "WingMatch", done: topMajors.length > 0 },
    { label: "College", done: savedColleges.length > 0 },
    { label: "Opportunity", done: savedOpportunities.length > 0 },
    { label: "Idea", done: savedIdeas.length > 0 },
  ];
  const navigatorCount = navigatorSteps.filter((step) => step.done).length;

  return (
    <section className="guidance-vault">
      <div className="guidance-vault-heading">
        <span>MY GUIDANCE</span>
        <h2>Your decisions, not another forgotten browser tab.</h2>
        <p>WingMatch signals and anything you save in the field guides stay here on this device.</p>
      </div>

      <div className="guidance-navigator-card">
        <div>
          <span>PRIVATE NAVIGATOR</span>
          <strong>{navigatorCount} / {navigatorSteps.length} path signals saved</strong>
          <p>No appointment needed. Your exploration can start quietly here and turn into questions for a counselor, teacher, mentor, or family member only when you want it to.</p>
        </div>
        <div className="guidance-navigator-steps">
          {navigatorSteps.map((step) => (
            <div key={step.label} className={step.done ? "is-done" : ""}>
              <i />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {topMajors.length > 0 && (
        <div className="vault-wing-grid">
          {topMajors.map((item, index) => {
            const major = ENGINEERING_MAJOR_MAP[item.majorId];
            return (
              <article key={item.majorId} style={{ "--major-accent": major.accent } as CSSProperties}>
                <span>#{index + 1} WING SIGNAL</span>
                <strong>{major.name}</strong>
                <p>Suggested by your choices; not an ability score.</p><a href={`#/major?major=${major.id}`}>Reopen this direction →</a>
              </article>
            );
          })}
        </div>
      )}

      <div className="vault-saved-grid">
        <article>
          <div><span>SAVED COLLEGES</span><strong>{savedColleges.length}</strong></div>
          {savedColleges.length === 0 ? <p>Save colleges from Unlock Opportunities to build your comparison list.</p> : (
            <ul>{savedColleges.map((college) => <li key={college.id}><a href={college.engineeringUrl} target="_blank" rel="noreferrer">{college.shortName} ↗</a><span>{college.location}</span></li>)}</ul>
          )}
        </article>
        <article>
          <div><span>SAVED OPPORTUNITIES</span><strong>{savedOpportunities.length}</strong></div>
          {savedOpportunities.length === 0 ? <p>Save internships, research, summer programs, or competitions you want to revisit.</p> : (
            <ul>{savedOpportunities.map((opportunity) => <li key={opportunity.id}><a href={opportunity.officialUrl} target="_blank" rel="noreferrer">{opportunity.title} ↗</a><span>{opportunity.status} · {opportunity.lastVerified}</span></li>)}</ul>
          )}
        </article>
        <article>
          <div><span>SAVED IDEAS</span><strong>{savedIdeas.length}</strong></div>
          {savedIdeas.length === 0 ? <p>Save research and extracurricular directions that feel worth developing.</p> : (
            <ul>{savedIdeas.map((idea) => <li key={idea.id}><a href={`#/major?major=${idea.majorId}&tab=IDEAS`}>{idea.title} →</a><span>{idea.type}</span></li>)}</ul>
          )}
        </article>
      </div>
    </section>
  );
}
