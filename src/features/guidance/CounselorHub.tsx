import ContentFreshness from '../../components/ContentFreshness';
import '../../content/intelligence.css';
import {preferredScrollBehavior} from '../../design/golden-horizon/motion';
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ENGINEERING_MAJORS, ENGINEERING_MAJOR_MAP } from "./engineeringMajors";
import { rankColleges, academicInputIssues, readAcademicScores, type CollegeSort, type GuidanceCollege } from "./collegeCatalog";
import { rankOpportunities } from "./opportunityCatalog";
import { GUIDANCE_IDEAS } from "./ideaCatalog";
import { CAREER_SNAPSHOTS } from "./careerCatalog";
import PackReadyBanner from "../home/PackReadyBanner";
import { awardCosmicPack } from "../progression/cosmic-packs";
import {
  readSavedGuidance,
  readStudentProfile,
  saveSelectedMajor,
  saveStudentProfile,
  toggleSavedGuidance,
} from "./guidanceStorage";
import type {
  EngineeringMajorId,
  GuidanceTab,
  SavedGuidance,
  StudentProfile,
} from "./guidanceTypes";
import "./guidance.css";

interface CounselorHubProps {
  initialMajorId: EngineeringMajorId;
  initialTab: GuidanceTab;
  onNavigate: (major: EngineeringMajorId, tab: GuidanceTab) => void;
  onBack: () => void;
  onExploreMajors: () => void;
  onStartMatch: () => void;
  onOpenUniverse: () => void;
  onOpenAerospaceDeepDive: () => void;
}

const interestOptions = [
  "Building",
  "Coding",
  "Chemistry",
  "Biology",
  "Environment",
  "Data",
  "Robotics",
  "Space",
  "Energy",
  "Software",
  "Geology",
  "Infrastructure",
];

function gradePriorities(grade: StudentProfile["grade"]) {
  if (!grade) return ["Start with a small project—no experience or test scores required.", "Choose guided steps, hints, or independent exploration. You can change support at any time.", "Add your grade when you want to narrow program suggestions, or keep exploring privately."];
  if (grade === "9") return [
    "Explore broadly before locking into one engineering identity.",
    "Build strong math/science foundations and try one team-based STEM activity.",
    "Keep a simple evidence log of projects, competitions, and questions you care about.",
  ];
  if (grade === "10") return [
    "Narrow to two or three engineering directions and compare them through real experiences.",
    "Start one deeper project, competition, or research question that can grow for more than one semester.",
    "Plan junior-year rigor and identify summer programs early enough to meet winter deadlines.",
  ];
  if (grade === "11") return [
    "Prioritize 2027 summer applications, research, internships, and one high-depth engineering activity.",
    "Build a college list around program fit, academic context, cost, and opportunities—not rankings alone.",
    "Turn your strongest work into evidence: results, iterations, users, presentations, awards, or research outputs.",
  ];
  return [
    "Protect senior-year rigor while finishing applications and scholarship requirements.",
    "Use your strongest engineering evidence to explain what you explored, learned, and changed.",
    "Keep building after applications; meaningful work does not stop when you submit a college form.",
  ];
}

function profileValue(value: string) {
  return value.trim() || "Not added";
}

function testingPolicyLabel(college: GuidanceCollege) {
  if (college.testingPolicy === "NOT_USED") return "Test-free / not considered";
  if (college.testingPolicy === "OPTIONAL") return "Test optional";
  return college.testingPolicy || "See official policy";
}

function collegeStats(college: GuidanceCollege) {
  if (college.majorCoverage) {
    const stats: Array<{label:string;value:string}>=[];
    const money=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
    if (college.tuitionInState) stats.push({label:"SNAPSHOT TUITION · IN STATE",value:money(college.tuitionInState)});
    if (college.tuitionOutOfState) stats.push({label:"SNAPSHOT TUITION · OUT OF STATE",value:money(college.tuitionOutOfState)});
    if (college.act25 && college.act75) stats.push({label:"SNAPSHOT ACT 25–75",value:`${college.act25}–${college.act75}`});
    return [...stats,{label:"SOURCE RELEASE",value:"May 2025"}].slice(0,4);
  }
  const stats: Array<{ label: string; value: string }> = [];
  if (college.sat25 && college.sat75) stats.push({ label: "SAT 25–75", value: `${college.sat25}–${college.sat75}` });
  if (college.act25 && college.act75) stats.push({ label: "ACT 25–75", value: `${college.act25}–${college.act75}` });
  if (college.averageGpa && !/not reported|verify/i.test(college.averageGpa)) stats.push({ label: "PUBLISHED GPA", value: college.averageGpa });
  if (college.admissionRate && !/not reported|verify/i.test(college.admissionRate)) stats.push({ label: "ADMISSION CONTEXT", value: college.admissionRate });
  if (stats.length < 4) stats.push({ label: "TESTING", value: testingPolicyLabel(college) });
  if (stats.length < 4) stats.push({ label: "DATA CONTEXT", value: college.sourceYear });
  return stats.slice(0, 4);
}

export default function CounselorHub({
  initialMajorId,
  initialTab,
  onNavigate,
  onBack,
  onExploreMajors,
  onStartMatch,
  onOpenUniverse,
  onOpenAerospaceDeepDive,
}: CounselorHubProps) {
  const [majorId, setMajorId] = useState<EngineeringMajorId>(initialMajorId);
  const tab = initialTab;
  const directory = tab === "COLLEGES" || tab === "OPPORTUNITIES";
  const setTab = (next: GuidanceTab) => onNavigate(majorId, next);
  const [profile, setProfile] = useState<StudentProfile>(() => readStudentProfile());
  const [saved, setSaved] = useState<SavedGuidance>(() => readSavedGuidance());
  const [collegeQuery, setCollegeQuery] = useState("");
  const [collegeLimit, setCollegeLimit] = useState(24);
  const [collegeSort,setCollegeSort] = useState<CollegeSort>("SCORE_FIT");
  const [opportunityQuery, setOpportunityQuery] = useState("");
  const [includeArchived,setIncludeArchived]=useState(false);
  const [collegeFilter, setCollegeFilter] = useState<"ALL" | "HOME" | "IN_RANGE" | "MAPPED" | "DIRECTORY">("ALL");
  const [opportunityFilter, setOpportunityFilter] = useState<"ALL" | "INTERNSHIP" | "SUMMER PROGRAM" | "RESEARCH" | "COMPETITION" | "SCHOLARSHIP" | "MENTORSHIP">("ALL");

  const inputIssues = academicInputIssues(profile);
  const academicScores = readAcademicScores(profile);
  const scoreInputs = [Number.isFinite(academicScores.sat) ? `SAT ${academicScores.sat}` : '',Number.isFinite(academicScores.act) ? `ACT ${academicScores.act}` : ''].filter(Boolean);
  const hasAcademicInput = Object.values(academicScores).some(Number.isFinite);
  const major = ENGINEERING_MAJOR_MAP[majorId];
  const careerSnapshot = CAREER_SNAPSHOTS[majorId];
  const collegeResults = useMemo(() => rankColleges(majorId, profile, collegeSort), [majorId, profile, collegeSort]);
  const comparableCollegeCount = collegeResults.filter(item=>item.academicFit.value !== null).length;
  const completeTestCount = scoreInputs.length === 2 ? collegeResults.filter(item=>item.academicFit.tests.length === 2).length : 0;
  const opportunityResults = useMemo(() => rankOpportunities(majorId, profile,includeArchived), [majorId, profile,includeArchived]);
  const ideas = useMemo(() => GUIDANCE_IDEAS.filter((idea) => idea.majorId === majorId), [majorId]);
  const researchIdeas = useMemo(() => ideas.filter((idea) => idea.type === "RESEARCH"), [ideas]);
  const activityIdeas = useMemo(() => ideas.filter((idea) => idea.type === "EXTRACURRICULAR"), [ideas]);
  const filteredCollegeResults = useMemo(() => {
    const query = collegeQuery.trim().toLowerCase();
    return collegeResults.filter(({ college, academicFit }) => {
      if (query && !`${college.name} ${college.location} ${college.description}`.toLowerCase().includes(query)) return false;
      if (collegeFilter === "MAPPED" && college.majorCoverage) return false;
      if (collegeFilter === "DIRECTORY" && !college.majorCoverage) return false;
      if (collegeFilter === "HOME" && (!profile.state || college.state !== profile.state)) return false;
      if (collegeFilter === "IN_RANGE" && !academicFit.atOrAboveTestRange) return false;
      return true;
    });
  }, [collegeResults, collegeFilter, collegeQuery, profile.state]);
  const filteredOpportunityResults = useMemo(
    () => opportunityResults.filter(({ opportunity }) => (opportunityFilter === "ALL" || opportunity.category === opportunityFilter) && `${opportunity.title} ${opportunity.organization} ${opportunity.location} ${opportunity.description}`.toLowerCase().includes(opportunityQuery.trim().toLowerCase())),
    [opportunityFilter, opportunityResults, opportunityQuery],
  );
  const savedCollegeResults = useMemo(
    () => collegeResults.filter(({ college }) => saved.collegeIds.includes(college.id)).slice(0, 4),
    [collegeResults, saved.collegeIds],
  );
  const topOpportunity = opportunityResults[0];
  const topCollege = collegeResults[0];

  const guidanceMilestoneComplete =
    saved.collegeIds.length > 0 &&
    saved.opportunityIds.length > 0 &&
    saved.ideaIds.length > 0;

  useEffect(() => {
    if (!guidanceMilestoneComplete) return;

    awardCosmicPack(
      "guidance-navigator-v1",
      "LEVEL",
      "Guidance Navigator Complete",
    );
  }, [guidanceMilestoneComplete]);

  function updateProfile<K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) {
    const next = { ...profile, [key]: value };
    setProfile(next);
    if (["sat","act","gpa"].includes(key)) setCollegeLimit(24);
    saveStudentProfile(next);
  }

  function chooseMajor(nextId: EngineeringMajorId) {
    setMajorId(nextId);
    onNavigate(nextId, tab);
    saveSelectedMajor(nextId);
    window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
  }

  function toggleSaved(type: keyof SavedGuidance, id: string) {
    setSaved(toggleSavedGuidance(type, id));
  }

  return (
    <main className="guidance-page counselor-page">
      <section className="module-toolbar">
        <button type="button" onClick={onBack}>← Home</button>

        <button type="button" onClick={onOpenUniverse}>My Universe →</button>
      </section>

      <section className="counselor-hero" style={{ "--major-accent": major.accent } as CSSProperties}>
        <div>
          <span>{directory ? '04 · UNLOCK OPPORTUNITIES' : 'YOUR NEXT STEP'}</span>
          <h1>{directory ? 'Find a Way Forward.' : tab === 'CAREERS' ? 'Engineering careers' : tab === 'IDEAS' ? 'Research & project ideas' : major.name}</h1>
          {directory && <h2 className="aw-first-subtitle">Every student deserves a next step.</h2>}
          {tab !== 'PLAN' && <strong className="aw-field-label">Exploring: {major.name}</strong>}
          <p>{directory ? 'Discover opportunities that fit your interests and goals. Explore scholarships, research, internships, and new ways to create your own path.' : major.description}</p>
          {directory && <button type="button" className="aw-button aw-first-cta" onClick={() => tab === 'OPPORTUNITIES' ? document.querySelector('.counselor-results-section')?.scrollIntoView({behavior: preferredScrollBehavior(),block:'start'}) : setTab('OPPORTUNITIES')}>Explore Opportunities</button>}
        </div>
        <div className="counselor-hero-actions">
          <select aria-label="Engineering direction" value={majorId} onChange={(event) => chooseMajor(event.target.value as EngineeringMajorId)}>
            {ENGINEERING_MAJORS.map((item) => (
              <option value={item.id} key={item.id}>{item.name}</option>
            ))}
          </select>
          <button type="button" onClick={onStartMatch}>Retake WingMatch</button>
          {!directory && <button type="button" onClick={onExploreMajors}>All majors</button>}
        </div>
      </section>

      <section className="counselor-private-note">
        <div>
          <span>PRIVATE EXPLORATION MODE</span>
          <strong>No appointment. No networking required to start.</strong>
        </div>
        <p>Explore majors, compare colleges, save programs, and build questions privately. Your optional profile stays in this browser.</p>
      </section>

      <PackReadyBanner />

      <section className={`counselor-layout ${directory ? "" : "counselor-layout-guide"}`}>
        {directory && <aside className="counselor-profile-card"><details className="aw-profile-disclosure"><summary>Personalize results <span>(optional)</span></summary>
          <div className="profile-card-heading">
            <span>YOUR PROFILE</span>
            <strong>Make the results relevant.</strong>
          </div>

          <label>
            <span>Grade</span>
            <select value={profile.grade} onChange={(event) => updateProfile("grade", event.target.value as StudentProfile["grade"])}>
              <option value="">Choose grade (optional)</option><option value="9">9th</option>
              <option value="10">10th</option>
              <option value="11">11th</option>
              <option value="12">12th</option>
            </select>
          </label>

          <label>
            <span>State</span>
            <input value={profile.state} maxLength={2} onChange={(event) => updateProfile("state", event.target.value.toUpperCase())} placeholder="e.g. GA" />
          </label>

          <div className="profile-score-grid">
            <label><span>GPA / 4.0 (optional)</span><input type="number" min="0" max="4" step="0.01" value={profile.gpa} onChange={(event) => updateProfile("gpa", event.target.value)} placeholder="3.90" /></label>
            <label><span>SAT total · 400–1600 (optional)</span><input type="number" min="400" max="1600" step="10" value={profile.sat} onChange={(event) => updateProfile("sat", event.target.value)} placeholder="1450" /></label>
            <label><span>ACT composite · 1–36 (optional)</span><input type="number" min="1" max="36" step="1" value={profile.act} onChange={(event) => updateProfile("act", event.target.value)} placeholder="33" /></label>
          </div>

          {inputIssues.length>0 && <div role="alert" className="release-input-error">{inputIssues.map(issue=><p key={issue}>{issue}</p>)}</div>}
          <p className="release-eligibility-note">SAT total: 400–1600 (each section: 200–800). ACT composite: 1–36. Scores are optional; placeholders are examples, not saved scores. Test scores drive this sort when entered. GPA-only sorting uses explicitly unweighted, comparable data.</p>
          <label>
            <span>Location preference</span>
            <select value={profile.locationPreference} onChange={(event) => updateProfile("locationPreference", event.target.value as StudentProfile["locationPreference"])}>
              <option value="ANYWHERE">Anywhere</option>
              <option value="NEAR_HOME">Prefer near home</option>
              <option value="ONLINE_OK">Online / hybrid is good</option>
            </select>
          </label>

          <label>
            <span>Opportunity cost preference</span>
            <select value={profile.budgetPreference} onChange={(event) => updateProfile("budgetPreference", event.target.value as StudentProfile["budgetPreference"])}>
              <option value="ANY">Show all</option>
              <option value="LOW_COST">Program fee up to $500</option>
              <option value="FREE_PAID">Free / paid program fee</option>
            </select>
          </label>

          <div className="profile-interests">
            <span>Interests</span>
            <div>
              {interestOptions.map((interest) => {
                const active = profile.interests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    aria-pressed={active} className={active ? "is-active" : ""}
                    onClick={() => updateProfile(
                      "interests",
                      active ? profile.interests.filter((item) => item !== interest) : [...profile.interests, interest],
                    )}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="profile-live-signal">
            <i /> BROWSE · {collegeResults.length} university leads · {opportunityResults.length} programs to check
          </div>
          <small>Your profile stays in this browser. Every change re-ranks this page immediately; AltWing never turns these inputs into an admission probability.</small>
        </details></aside>}

        <div className="counselor-main">
          {tab === "OPPORTUNITIES" && <section className="opportunity-ai-banner">
            <div className="opportunity-ai-mark"><span>→</span><i /></div>
            <div>
              <span>OPPORTUNITY MATCH · SOURCE-LINKED BETA</span>
              <h2>{opportunityResults.length} programs to investigate{profile.grade ? ` for Grade ${profile.grade}` : ""}.</h2>
              <p>Suggestions use rule-based matching and linked program records. Grade exclusions are applied when you add your grade; records with unknown grades are excluded when you select a grade. Age, citizenship, local residency, deadlines, and extra expenses still need checking with the official program.</p>
            </div>
            <button type="button" onClick={() => setTab("OPPORTUNITIES")}>See programs to check →</button>
          </section>}

          <nav className="counselor-tabs" aria-label="Guidance sections">
            {(["PLAN", "COLLEGES", "OPPORTUNITIES", "CAREERS", "IDEAS"] as GuidanceTab[]).map((item) => (
              <button type="button" key={item} aria-current={tab === item ? "page" : undefined} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>
                {item === "PLAN" ? "Field overview" : item === "IDEAS" ? "Research & ideas" : item === "OPPORTUNITIES" ? "Student programs" : item.charAt(0) + item.slice(1).toLowerCase()}
              </button>
            ))}
          </nav>

          {tab === "PLAN" && (
            <div className="counselor-panel-stack">
              <section className="next-step-release"><div><span>YOUR PATH. YOUR PACE.</span><h2>Try a small project before you choose a direction.</h2><p>Three browser-based experiments. Choose your support, pause anytime, and keep evidence of what you tried.</p></div><a className="release-button" href="#/projects">Start or resume a project →</a></section>
              <section className="counselor-brief">
                <span>YOUR FIELD GUIDE</span>
                <h2>{profile.grade ? `Grade ${profile.grade} · ` : ""}{major.shortName} · {profile.state || "Explore anywhere"}</h2>
                <p>
                  Your goal is not to collect random STEM activities. Build a coherent evidence trail: explore the field, choose one or two deeper experiences, and use what you learn to make better college and opportunity decisions.
                </p>
                <div className="brief-priority-grid">
                  {gradePriorities(profile.grade).map((priority, index) => (
                    <article key={priority}><b>0{index + 1}</b><p>{priority}</p></article>
                  ))}
                </div>
              </section>

              <section className="major-snapshot-grid">
                <article>
                  <span>WHAT YOU WOULD STUDY</span>
                  <div className="snapshot-tags">{major.subjects.map((subject) => <b key={subject}>{subject}</b>)}</div>
                </article>
                <article>
                  <span>PROBLEMS YOU COULD SOLVE</span>
                  <ul>{major.solves.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article>
                  <span>CAREER DIRECTIONS</span>
                  <ul>{major.careers.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              </section>

              <section className="profile-context-card">
                <div><span>GPA</span><strong>{profileValue(profile.gpa)}</strong></div>
                <div><span>SAT</span><strong>{profileValue(profile.sat)}</strong></div>
                <div><span>ACT</span><strong>{profileValue(profile.act)}</strong></div>
                <div><span>SAVED COLLEGES</span><strong>{saved.collegeIds.length}</strong></div>
                <div><span>SAVED OPPORTUNITIES</span><strong>{saved.opportunityIds.length}</strong></div>
              </section>

              <section className="counselor-next-grid">
                <article className="next-move-card is-primary">
                  <span>NEXT OPPORTUNITY TO CHECK</span>
                  <h3>{topOpportunity?.opportunity.title ?? "Build your opportunity list"}</h3>
                  <p>{topOpportunity?.opportunity.timing ?? "Add your grade and location to rank current opportunities."}</p>
                  <button type="button" onClick={() => setTab("OPPORTUNITIES")}>See programs to check →</button>
                </article>
                <article className="next-move-card">
                  <span>COLLEGE TO RESEARCH</span>
                  <h3>{topCollege?.college.name ?? "Compare engineering programs"}</h3>
                  <p>{topCollege?.reasons.slice(0, 2).join(" · ") ?? "Use program fit and published academic context—not a fake admission probability."}</p>
                  <button type="button" onClick={() => setTab("COLLEGES")}>Open college explorer →</button>
                </article>
                <article className="next-move-card">
                  <span>RESEARCH DIRECTION</span>
                  <h3>{researchIdeas[0]?.title ?? `${major.shortName} research idea`}</h3>
                  <p>{researchIdeas[0]?.summary ?? "Turn one engineering question into a testable investigation."}</p>
                  <button type="button" onClick={() => setTab("IDEAS")}>See research ideas →</button>
                </article>
                <article className="next-move-card">
                  <span>EXTRACURRICULAR DIRECTION</span>
                  <h3>{activityIdeas[0]?.title ?? `${major.shortName} project idea`}</h3>
                  <p>{activityIdeas[0]?.summary ?? "Choose one project where you can show iteration, evidence, and real impact."}</p>
                  <button type="button" onClick={() => setTab("IDEAS")}>See extracurricular ideas →</button>
                </article>
              </section>

              <section className="action-first-board">
                <div className="action-first-board-heading">
                  <div><span>START · EXPERIMENT · IMPROVE · PROVE</span><h2>Turn guidance into evidence.</h2></div>
                  <p>You do not need an acceptance letter to begin. Pick one next move and make the work visible.</p>
                </div>
                <div className="action-first-board-grid">
                  <article><b>01</b><strong>START</strong><p>{topOpportunity ? `Check ${topOpportunity.opportunity.title} and verify that you meet the official eligibility.` : `Choose ${researchIdeas[0]?.title ?? "one research question"} and define one measurable question.`}</p></article>
                  <article><b>02</b><strong>EXPERIMENT</strong><p>Do one real attempt: apply, prototype, simulate, analyze a dataset, interview a user, or test a design assumption.</p></article>
                  <article><b>03</b><strong>IMPROVE</strong><p>Record what failed or surprised you, then change one decision and run the next version.</p></article>
                  <article><b>04</b><strong>PROVE</strong><p>Keep the artifact: data, code, model, reflection, result, presentation, or documented iteration. Evidence beats a claim.</p></article>
                </div>
              </section>

              <section className="deadline-radar">
                <div className="deadline-radar-heading">
                  <div><span>PROGRAM WATCHLIST</span><h2>Programs to watch next.</h2></div>
                  <button type="button" onClick={() => setTab("OPPORTUNITIES")}>View all →</button>
                </div>
                <div className="deadline-list">
                  {opportunityResults.slice(0, 4).map(({ opportunity }) => (
                    <article key={opportunity.id}>
                      <div><b>{opportunity.status}</b><span>{opportunity.category}</span></div>
                      <strong>{opportunity.title}</strong>
                      <p>{opportunity.timing}</p>
                    </article>
                  ))}
                </div>
              </section>

              {majorId === "aerospace" && (
                <section className="deep-dive-banner">
                  <div>
                    <span>ALTWING ORIGINAL EXPERIENCE</span>
                    <h2>Aerospace has a full interactive deep dive.</h2>
                    <p>Your original Mars decision experience and six aerospace subfields are still here as AltWing's first completed specialty experience.</p>
                  </div>
                  <button type="button" onClick={onOpenAerospaceDeepDive}>Open aerospace experience →</button>
                </section>
              )}
            </div>
          )}

          {tab === "COLLEGES" && (
            <section className="counselor-results-section">
              <div className="results-heading">
                <div><span>COLLEGE EXPLORER</span><h2>Universities to explore for {major.shortName}.</h2></div>
                <p>Curated major links are supplemented by versioned College Scorecard records. Each record shows its own source and data context. Directory records report engineering graduates; they do not confirm this exact major is offered today. Historical tuition is not current net cost. Academic ranges are institution-level context, not admission chances.</p>
              </div>

              <section className="college-score-order" aria-label="University ordering">
                <label>Sort universities<select value={collegeSort} onChange={event=>{setCollegeSort(event.target.value as CollegeSort);setCollegeLimit(24);}}><option value="SCORE_FIT">Closest published score profile · live</option><option value="MAJOR_LOCATION">Major links & location</option></select></label>
                <div role="status" aria-live="polite"><strong>{collegeSort === 'SCORE_FIT' && hasAcademicInput ? `Updated for ${scoreInputs.length ? scoreInputs.join(' + ') : `unweighted GPA ${academicScores.gpa}`}` : collegeSort === 'SCORE_FIT' ? 'Add SAT, ACT, or comparable GPA to personalize the order.' : 'Ordered by major links & location.'}</strong><p>{collegeSort === 'SCORE_FIT' && hasAcademicInput ? `${comparableCollegeCount} universities have comparable data. ${scoreInputs.length === 2 ? `${completeTestCount} report both tests and appear before one-test comparisons. ` : ''}Closer published score profiles appear first${profile.locationPreference === 'NEAR_HOME' && profile.state ? ', within your home-state preference' : ''}.` : 'All universities remain available. Your selections update immediately.'}</p></div>
                <details className="college-score-method"><summary>How scores change this list</summary><p>SAT and ACT are compared separately with each college’s published median (or range midpoint). When both tests are entered, each contributes equally; comparisons with both tests available come before partial-data comparisons. No SAT–ACT conversion is used. Higher scores can bring higher published-score profiles forward. This is a browsing rule, not a college-quality ranking or an admission probability. Schools with no comparable data, including test-free schools, stay in the list without a score rank.</p></details>
              </section>
              <div className="result-toolbar">
                <label className="result-search"><span>⌕</span><input value={collegeQuery} onChange={(event) => {setCollegeQuery(event.target.value);setCollegeLimit(24);}} aria-label="Search colleges" placeholder="Search school or location..." /></label>
                <div className="result-filter-row">
                  {(["ALL", "HOME", "MAPPED", "DIRECTORY", "IN_RANGE"] as const).map((item) => (
                    <button type="button" key={item} className={collegeFilter === item ? "is-active" : ""} onClick={() => {setCollegeFilter(item);setCollegeLimit(24);}}>
                      {item === "ALL" ? "All universities" : item === "HOME" ? "My state" : item === "MAPPED" ? "Curated major links" : item === "DIRECTORY" ? "Engineering directory" : "Within / above test range"}
                    </button>
                  ))}
                </div>
              </div>

              {savedCollegeResults.length >= 2 && (
                <div className="saved-compare-strip">
                  <div><span>SAVED COMPARISON</span><strong>Compare your shortlist at a glance.</strong></div>
                  <div className="saved-compare-grid">
                    {savedCollegeResults.map(({ college, academicContext }) => (
                      <article key={college.id}>
                        <b>{college.shortName}</b>
                        <span>{college.location}</span>
                        <small>{college.sat25 && college.sat75 ? `SAT ${college.sat25}–${college.sat75}` : testingPolicyLabel(college)}</small>
                        <small>{!/not reported|verify/i.test(college.averageGpa) ? college.averageGpa : college.sourceYear}</small>
                        <em>{academicContext}</em>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {filteredCollegeResults.length === 0 && <div className="no-match-card"><h3>No colleges match this view.</h3><p>Clear the search or select All programs. You can explore without entering test scores.</p><button type="button" onClick={() => {setCollegeQuery("");setCollegeFilter("ALL");}}>Show all universities</button></div>}
              <div className="college-results-grid">
                {filteredCollegeResults.slice(0,collegeLimit).map(({ college, reasons, academicContext, academicFit }) => {
                  const isSaved = saved.collegeIds.includes(college.id);
                  return (
                    <article key={college.id} className="college-result-card">
                      <div className="result-card-topline">
                        <span>{college.location}</span>
                        <button type="button" className={isSaved ? "is-saved" : ""} onClick={() => toggleSaved("collegeIds", college.id)}>
                          {isSaved ? "★ SAVED" : "☆ SAVE"}
                        </button>
                      </div>
                      <span className="directory-label">{college.majorCoverage ? "ENGINEERING DIRECTORY · CONFIRM EXACT MAJOR" : "CURATED MAJOR LINK"}</span><h3>{college.name}</h3>
                      <p>{college.description}</p>
                      <div className="college-stat-grid">
                        {collegeStats(college).map((stat) => (
                          <div key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>
                        ))}
                      </div>
                      <div className="academic-context-chip">{academicContext}</div><p className="college-score-explanation">{academicFit.comparisons.length ? `Score comparison: ${academicFit.explanation}` : hasAcademicInput ? academicFit.explanation : "Add optional scores to compare the published academic profile."}</p>
                      <ul className="result-reasons">{reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}</ul>
                      <ContentFreshness kind="college" id={college.id}/><div className="source-note">Source context: {college.source} · {college.sourceYear}{college.sourceUrl && <> · <a href={college.sourceUrl} target="_blank" rel="noreferrer">Dataset provenance ↗</a></>}</div>
                      <div className="external-actions">
                        <a href={college.engineeringUrl} target="_blank" rel="noreferrer">{college.majorCoverage ? "University website ↗" : "Engineering programs ↗"}</a>
                        <a href={college.admissionsUrl} target="_blank" rel="noreferrer">{college.majorCoverage ? "Check current admissions ↗" : "Admissions ↗"}</a>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="directory-pagination"><p>Showing {Math.min(collegeLimit,filteredCollegeResults.length)} of {filteredCollegeResults.length} universities in this view.</p>{collegeLimit<filteredCollegeResults.length && <button type="button" className="release-secondary" onClick={()=>setCollegeLimit(n=>n+24)}>Show 24 more universities</button>}</div>
            </section>
          )}

          {tab === "OPPORTUNITIES" && (
            <section className="counselor-results-section">
              <div className="results-heading">
                <div><span>OPPORTUNITY MATCH · SOURCE-LINKED BETA</span><h2>Source-linked programs, with conditions to check.</h2></div>
                <p>These are research leads, not confirmed eligibility or acceptance. Check the official source for the current cycle, grade convention, age, residency, citizenship, prerequisites, and total costs. Program facts may change after the recorded source check.</p>
              </div>

              <label className="program-search"><span>Search programs, organizations, or locations</span><input value={opportunityQuery} onChange={e=>setOpportunityQuery(e.target.value)} placeholder="MIT, robotics, California…" /></label>
              <div className="result-filter-row opportunity-filter-row">
                {(["ALL", "INTERNSHIP", "SUMMER PROGRAM", "RESEARCH", "COMPETITION", "SCHOLARSHIP", "MENTORSHIP"] as const).map((item) => (
                  <button type="button" key={item} className={opportunityFilter === item ? "is-active" : ""} onClick={() => setOpportunityFilter(item)}>
                    {item === "ALL" ? "All" : item === "SUMMER PROGRAM" ? "Summer" : item.charAt(0) + item.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {filteredOpportunityResults.length === 0 && (
                <div className="no-match-card no-dead-end-card">
                  <span>NO DEAD ENDS</span>
                  <h3>No program in this catalog matches these filters. You still have a next move.</h3>
                  <p>Try a different filter, add your grade, or start a project that needs no application or special equipment.</p>
                  <div className="no-dead-end-actions">
                    <button type="button" onClick={() => setTab("IDEAS")}>Start a research direction →</button>
                    <a className="release-button" href="#/projects">Try a browser project →</a>
                  </div>
                </div>
              )}

              <section className="no-opportunity-required-strip">
                <div>
                  <span>NO OPPORTUNITY REQUIRED</span>
                  <strong>Don't wait to be selected before you start.</strong>
                  <p>If none of the programs below are realistic for you, use a self-directed path that still produces real engineering evidence.</p>
                </div>
                <div className="no-opportunity-required-options">
                  <button type="button" onClick={() => setTab("IDEAS")}><b>RESEARCH</b><span>{researchIdeas[0]?.title ?? "Start a testable engineering question"}</span></button>
                  <a className="release-button" href="#/projects">Start a guided browser project →</a>
                </div>
              </section>

              <label className="content-archive-filter"><input type="checkbox" checked={includeArchived} onChange={e=>setIncludeArchived(e.target.checked)}/>Include archived application cycles</label><div className="opportunity-results-grid">
                {filteredOpportunityResults.map(({ opportunity, reasons }) => {
                  const isSaved = saved.opportunityIds.includes(opportunity.id);
                  return (
                    <article key={opportunity.id} className="opportunity-result-card">
                      <div className="result-card-topline">
                        <div><b>{opportunity.category}</b><span className={`status-${opportunity.status.toLowerCase()}`}>{opportunity.status}</span></div>
                        <button type="button" className={isSaved ? "is-saved" : ""} onClick={() => toggleSaved("opportunityIds", opportunity.id)}>
                          {isSaved ? "★ SAVED" : "☆ SAVE"}
                        </button>
                      </div>
                      <h3>{opportunity.title}</h3>
                      <strong className="opportunity-org">{opportunity.organization}</strong>
                      <p>{opportunity.description}</p>
                      <div className="opportunity-facts">
                        <div><span>WHERE</span><strong>{opportunity.location}</strong></div>
                        <div><span>FORMAT</span><strong>{opportunity.format}</strong></div>
                        <div><span>TIMING</span><strong>{opportunity.timing}</strong></div>
                        <div><span>COST / PAY</span><strong>{opportunity.cost}</strong></div>
                      </div>
                      <div className="eligibility-box"><span>ELIGIBILITY</span><p>{opportunity.eligibility}</p></div>
                      <ul className="result-reasons">{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                      <ContentFreshness kind="opportunity" id={opportunity.id}/><p className="release-eligibility-note">{profile.grade && !opportunity.needsGradeCheck ? `Grade ${profile.grade} is included in the catalog. ` : "Grade eligibility needs checking. "}Full eligibility is not confirmed. Travel and housing may add costs.</p>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {tab === "CAREERS" && (
            <section className="counselor-results-section">
              <div className="results-heading">
                <div><span>CAREER OUTLOOK</span><h2>Where {major.shortName} can lead.</h2></div>
                <p>Career data is national context, not a salary promise. Pay and demand vary by role, location, industry, experience, and graduate education.</p>
              </div>

              <article className="career-hero-card">
                <div className="career-hero-copy">
                  <span>PRIMARY BLS OCCUPATION</span>
                  <h3>{careerSnapshot.occupation}</h3>
                  <p>{careerSnapshot.whatTheyDo}</p>
                  <a href={careerSnapshot.sourceUrl} target="_blank" rel="noreferrer">Official BLS source ↗</a>
                </div>
                <div className="career-stat-grid">
                  <div><span>MEDIAN PAY</span><strong>{careerSnapshot.medianPay}</strong><small>May 2025</small></div>
                  <div><span>JOB OUTLOOK</span><strong>{careerSnapshot.outlook}</strong><small>{careerSnapshot.outlookLabel}</small></div>
                  <div><span>TYPICAL ENTRY</span><strong>{careerSnapshot.education}</strong><small>National BLS classification</small></div>
                </div>
              </article>

              <div className="career-path-grid">
                {major.careers.map((career, index) => (
                  <article key={career}>
                    <span>0{index + 1}</span>
                    <strong>{career}</strong>
                    <p>{index === 0 ? "A direct path connected to this major." : "A related direction that can use the same engineering foundation."}</p>
                  </article>
                ))}
              </div>

              <div className="career-source-note">{careerSnapshot.source} · {careerSnapshot.dataYear}</div>
            </section>
          )}

          {tab === "IDEAS" && (
            <section className="counselor-results-section">
              <div className="results-heading">
                <div><span>MAKE YOUR OWN OPPORTUNITY</span><h2>Research and extracurricular directions.</h2></div>
                <p>These are starting points—not fake programs or guaranteed award ideas. Adapt them around a question you actually care about and document your process.</p>
              </div>

              <div className="idea-section-label">RESEARCH DIRECTIONS</div>
              <div className="idea-results-grid">
                {researchIdeas.map((idea) => {
                  const isSaved = saved.ideaIds.includes(idea.id);
                  return (
                    <article key={idea.id}>
                      <div className="result-card-topline"><span>RESEARCH</span><button type="button" className={isSaved ? "is-saved" : ""} onClick={() => toggleSaved("ideaIds", idea.id)}>{isSaved ? "★ SAVED" : "☆ SAVE"}</button></div>
                      <h3>{idea.title}</h3>
                      <p>{idea.summary}</p>
                      <div className="idea-start"><span>STARTING POINT</span><p>{idea.startingPoint}</p></div>
                    </article>
                  );
                })}
              </div>

              <div className="idea-section-label">EXTRACURRICULAR DIRECTIONS</div>
              <div className="idea-results-grid">
                {activityIdeas.map((idea) => {
                  const isSaved = saved.ideaIds.includes(idea.id);
                  return (
                    <article key={idea.id}>
                      <div className="result-card-topline"><span>EXTRACURRICULAR</span><button type="button" className={isSaved ? "is-saved" : ""} onClick={() => toggleSaved("ideaIds", idea.id)}>{isSaved ? "★ SAVED" : "☆ SAVE"}</button></div>
                      <h3>{idea.title}</h3>
                      <p>{idea.summary}</p>
                      <div className="idea-start"><span>MAKE IT REAL</span><p>{idea.startingPoint}</p></div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
