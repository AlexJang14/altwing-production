import {preferredScrollBehavior} from '../../design/golden-horizon/motion';
import { trackEvent } from '../analytics/analytics';
import ImpactSurvey from '../analytics/ImpactSurvey';
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import posthog, { isPostHogConfigured } from "../../posthog";
import PackReadyBanner from "../home/PackReadyBanner";
import {
  awardCosmicPack,
} from "../progression/cosmic-packs";
import EngineeringScenarioVisual from "./EngineeringScenarioVisual";
import EngineeringPostMatchGuide from "./EngineeringPostMatchGuide";
import { ENGINEERING_MAJOR_MAP } from "./engineeringMajors";
import { ENGINEERING_MATCH_QUESTIONS } from "./engineeringMatchData";
import { saveEngineeringMatch, saveSelectedMajor } from "./guidanceStorage";
import type { EngineeringMajorId, EngineeringMatchResult } from "./guidanceTypes";
import "./guidance.css";
import { recommendProjects } from "../projects/projectRecommendations";
import { readJSON, writeLocal } from "../../lib/storage";

interface EngineeringMatchProps {
  onBack: () => void;
  onOpenCounselor: (majorId: EngineeringMajorId) => void;
  onOpenUniverse: () => void;
}

const INCIDENT_TIMES = ["00:17", "01:42", "03:05", "04:31", "06:12", "07:48", "09:26", "11:03"] as const;

const MATCH_BASELINES: Record<EngineeringMajorId, { mean: number; sd: number; offset: number }> = {
  aerospace: { mean: 2.500000, sd: 1.172604, offset: -0.009512 },
  mechanical: { mean: 4.250000, sd: 2.046338, offset: 0.025625 },
  electrical: { mean: 6.000000, sd: 2.669270, offset: 0.134600 },
  computer: { mean: 4.000000, sd: 2.000000, offset: 0.248706 },
  chemical: { mean: 3.000000, sd: 2.000000, offset: -0.120208 },
  biomedical: { mean: 4.000000, sd: 1.457738, offset: -0.006583 },
  civil: { mean: 4.000000, sd: 2.031010, offset: -0.107402 },
  industrial: { mean: 6.000000, sd: 3.000000, offset: -0.115425 },
  materials: { mean: 4.000000, sd: 2.645751, offset: -0.141716 },
  environmental: { mean: 4.000000, sd: 2.061553, offset: -0.077589 },
  nuclear: { mean: 1.000000, sd: 1.060660, offset: -0.062118 },
  robotics: { mean: 2.750000, sd: 2.046338, offset: 0.169807 },
  software: { mean: 4.750000, sd: 2.512469, offset: 0.044568 },
  petroleum: { mean: 2.250000, sd: 1.299038, offset: 0.017252 },
};

function calculateResult(answers: Record<string, string>): EngineeringMatchResult {
  const rawScores = Object.keys(ENGINEERING_MAJOR_MAP).reduce(
    (acc, key) => ({ ...acc, [key]: 0 }),
    {} as Record<EngineeringMajorId, number>,
  );
  const patternCounts = new Map<string, number>();

  ENGINEERING_MATCH_QUESTIONS.forEach((question) => {
    const selected = question.options.find((option) => option.id === answers[question.id]);
    if (!selected) return;

    Object.entries(selected.weights).forEach(([majorId, weight]) => {
      rawScores[majorId as EngineeringMajorId] += weight ?? 0;
    });

    selected.patterns.forEach((pattern) => {
      patternCounts.set(pattern, (patternCounts.get(pattern) ?? 0) + 1);
    });
  });

  const calibrated = (Object.entries(rawScores) as Array<[EngineeringMajorId, number]>)
    .map(([majorId, raw]) => {
      const baseline = MATCH_BASELINES[majorId];
      const score = ((raw - baseline.mean) / baseline.sd) + baseline.offset;
      return { majorId, raw, score };
    })
    .sort((a, b) => b.score - a.score || b.raw - a.raw || a.majorId.localeCompare(b.majorId));

  const topScore = calibrated[0]?.score ?? 0;
  const floorScore = calibrated[calibrated.length - 1]?.score ?? topScore - 1;
  const spread = Math.max(topScore - floorScore, 0.001);
  const decisionPatterns = [...patternCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([pattern]) => pattern);

  return {
    completedAt: new Date().toISOString(),
    decisionPatterns,
    rankings: calibrated.map(({ majorId, raw, score }) => ({
      majorId,
      score: raw,
      signal: Math.max(35, Math.round(35 + ((score - floorScore) / spread) * 65)),
    })),
  };
}

export default function EngineeringMatch({
  onBack,
  onOpenCounselor,
  onOpenUniverse,
}: EngineeringMatchProps) {
  const [initialDraft] = useState(() => {
    const raw = readJSON<{started?: boolean; questionIndex?: number; answers?: Record<string,string>; result?: EngineeringMatchResult; beforeUnderstanding?: number} | null>("altwing-match-draft-v1", null);
    const answers: Record<string,string> = {};
    if (raw?.answers && typeof raw.answers === "object") ENGINEERING_MATCH_QUESTIONS.forEach(q => {if(q.options.some(o=>o.id===raw.answers?.[q.id])) answers[q.id]=raw.answers![q.id];});
    const validResult=raw?.result && Array.isArray(raw.result.rankings) && raw.result.rankings.length>0 && raw.result.rankings.every(r=>r && Object.hasOwn(ENGINEERING_MAJOR_MAP,r.majorId))?raw.result:null;
    return {started:raw?.started===true,questionIndex:Number.isInteger(raw?.questionIndex)?Math.max(0,Math.min(7,raw!.questionIndex!)):0,answers,result:validResult,beforeUnderstanding:Number.isInteger(raw?.beforeUnderstanding)&&raw!.beforeUnderstanding!>=1&&raw!.beforeUnderstanding!<=5?raw!.beforeUnderstanding!:null};
  });
  const [beforeUnderstanding]=useState<number|null>(initialDraft.beforeUnderstanding);
  const [started, setStarted] = useState(initialDraft.started);
  const [questionIndex, setQuestionIndex] = useState(initialDraft.questionIndex);
  const [answers, setAnswers] = useState<Record<string, string>>(initialDraft.answers);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const [result, setResult] = useState<EngineeringMatchResult | null>(initialDraft.result);
  const [guideOpen, setGuideOpen] = useState(false);
  const [assessmentResultKey,setAssessmentResultKey]=useState<string|null>(null);

  useEffect(() => { writeLocal("altwing-match-draft-v1", JSON.stringify({version:1,started,questionIndex,answers,result,beforeUnderstanding})); }, [started,questionIndex,answers,result,beforeUnderstanding]);
  const question = ENGINEERING_MATCH_QUESTIONS[questionIndex];
  const selectedOptionId = question ? answers[question.id] : undefined;
  const activeOptionId = hoveredOptionId ?? selectedOptionId ?? null;
  const activeOption = question?.options.find((option) => option.id === activeOptionId) ?? null;
  const progress = result
    ? 100
    : ((questionIndex + (selectedOptionId ? 1 : 0)) / ENGINEERING_MATCH_QUESTIONS.length) * 100;

  const topThree = useMemo(
    () => result?.rankings.slice(0, 3) ?? [],
    [result],
  );

  function chooseOption(optionId: string) {
    if (!question) return;
    setAnswers((current) => ({ ...current, [question.id]: optionId }));
  }

  function continueMatch() {
    if (!question || !selectedOptionId) return;

    if (questionIndex < ENGINEERING_MATCH_QUESTIONS.length - 1) {
      setHoveredOptionId(null);
      setQuestionIndex((current) => current + 1);
      window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
      return;
    }

    const nextResult = calculateResult(answers);
    setResult(nextResult);
    setGuideOpen(false);
    setAssessmentResultKey(nextResult.completedAt);
    saveEngineeringMatch(nextResult);
    trackEvent('WingMatch Completed');

    const topMajor = nextResult.rankings[0]?.majorId;
    if (topMajor) saveSelectedMajor(topMajor);

    awardCosmicPack(
      "engineering-scenario-match-v4-14",
      "MISSION",
      "Engineering Scenario WingMatch Complete",
    );

    if (isPostHogConfigured) {
      posthog.capture("engineering_match_completed", {
        top_major: topMajor,
        top_three: nextResult.rankings.slice(0, 3).map((item) => item.majorId),
        decision_patterns: nextResult.decisionPatterns,
        match_version: "engineering-scenario-v4-14",
      });
    }

    window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
  }


  if (!started && !result) {
    return (
      <main className="guidance-page scenario-prologue-page">
        <section className="module-toolbar">
          <button type="button" onClick={onBack}>← Home</button>

          <small>RESPONSE NETWORK · STANDBY</small>
        </section>

        <section className="scenario-prologue">
          <div className="scenario-prologue-copy">
            <span>01 · FIND MY WING</span>
            <h1>Discover How You Think.</h1>
            <h2 className="aw-first-subtitle">Every decision reveals a possibility.</h2>
            <p>
              Step into an interactive engineering mission, make your own decisions, and discover engineering fields that match how you approach problems.
            </p>
            <p className="release-eligibility-note">No timer. Your decisions save in this browser so you can pause and return. Scenario clocks are fictional mission context.</p><div className="scenario-prologue-rules">
              <article><b>01</b><strong>No major names</strong><span>The choices are intentionally mixed so you cannot reverse-engineer the result.</span></article>
              <article><b>02</b><strong>No right answer</strong><span>Choose the move you genuinely want to make first.</span></article>
              <article><b>03</b><strong>One connected shift</strong><span>Each incident reveals another way you approach engineering problems.</span></article>
            </div>
            <button type="button" className="guidance-primary-button scenario-begin-button" onClick={() => {setStarted(true);trackEvent('WingMatch Started');}}>Launch WingMatch</button>
          </div>

          <div className="scenario-prologue-visual" aria-hidden="true">
            <div className="prologue-globe"><i /><i /><i /></div>
            <div className="prologue-node node-a"><span>01</span><b>DRONE</b></div>
            <div className="prologue-node node-b"><span>02</span><b>COLD CHAIN</b></div>
            <div className="prologue-node node-c"><span>03</span><b>FACTORY</b></div>
            <div className="prologue-node node-d"><span>04</span><b>WATER</b></div>
            <div className="prologue-node node-e"><span>05</span><b>ORBIT</b></div>
            <div className="prologue-node node-f"><span>06</span><b>ENERGY</b></div>
            <div className="prologue-node node-g"><span>07</span><b>MEDICAL</b></div>
            <div className="prologue-node node-h"><span>08</span><b>GRID</b></div>
            <div className="prologue-scanline" />
          </div>
        </section>
      </main>
    );
  }

  if (result) {
    return (
      <main className="guidance-page guidance-match-page match-result-page">
        <section className="module-toolbar">
          <button type="button" onClick={onBack}>← Home</button>

          <button type="button" onClick={onOpenUniverse}>My Universe →</button>
        </section>

        {guideOpen && topThree[0] && (
          <EngineeringPostMatchGuide
            majorId={topThree[0].majorId}
            onClose={() => setGuideOpen(false)}
            onOpenCounselor={onOpenCounselor}
            onOpenUniverse={onOpenUniverse}
          />
        )}

        <section className="match-result-hero">
          <span>YOUR ENGINEERING SIGNAL</span>
          <h1>These are directions to test—not labels to accept.</h1>
          <p>
            Your result comes from how you handled eight ambiguous engineering situations. No answer directly equals a major, and every choice contributes evidence to several fields.
          </p>
        </section>

        <section className="aw-result-next"><img src="/brand/altwing-penguin.png" alt="Your AltWing penguin guide"/><div><span className="aw-eyebrow">YOU FOUND A STARTING POINT. WHAT’S NEXT?</span><h2>Explore a field. Then try one experiment.</h2><p>Your top three directions are suggestions to investigate. The next steps below turn them into something you can try.</p><div><a className="aw-button" href="#/explore">2 · Explore engineering →</a><a className="aw-inline-link" href="#/projects">3 · Try a project →</a><button className="aw-text-button" type="button" onClick={() => setGuideOpen(true)}>Replay the quick tutorial</button></div></div></section><PackReadyBanner />

        {result.decisionPatterns && result.decisionPatterns.length > 0 && (
          <section className="match-pattern-card">
            <span>HOW YOU KEPT APPROACHING PROBLEMS</span>
            <div>
              {result.decisionPatterns.map((pattern) => <b key={pattern}>{pattern}</b>)}
            </div>
          </section>
        )}

        <ImpactSurvey key={result.completedAt} contextKey={result.completedAt} autoOpen={assessmentResultKey===result.completedAt}/>
        <section className="match-result-grid">
          {topThree.map((item, index) => {
            const major = ENGINEERING_MAJOR_MAP[item.majorId];
            return (
              <article
                key={item.majorId}
                className={`match-result-card ${index === 0 ? "is-primary" : ""}`}
                style={{ "--major-accent": major.accent } as CSSProperties}
              >
                <div className="match-rank">0{index + 1}</div>
                <div className="match-major-icon">{major.icon}</div>
                <span>{index === 0 ? "FIRST DIRECTION TO EXPLORE" : "ANOTHER DIRECTION TO TRY"}</span>
                <h2>{major.name}</h2>
                <p>{major.tagline}</p>
                <p className="release-eligibility-note">Suggested by your decisions, not a measure of ability. Compare directions and try a project before committing.</p>
                <button type="button" onClick={() => onOpenCounselor(item.majorId)}>
                  Explore my {major.shortName} path →
                </button>
              </article>
            );
          })}
        </section>

        <section className="match-project-recommendations"><div><span>FROM YOUR CHOICES TO A FIRST PROJECT</span><h2>Try the work behind your direction.</h2><p>These starter simulations connect to concepts in your first suggested direction. They are not a complete test of any engineering field.</p></div><div className="match-project-grid">{recommendProjects(result.rankings).map(({project,reason},i)=><article key={project.id}><span>{i===0?"SUGGESTED FIRST STEP":"ANOTHER WAY TO EXPLORE"}</span><h3>{project.title}</h3><p>{project.question}</p><p>{reason}</p><a className="release-button" href={`#/projects?project=${project.id}`}>Try this project →</a></article>)}</div><a className="release-secondary" href="#/aerospace">Explore the six aerospace labs →</a></section>
        <section className="match-method-card">
          <div>
            <span>WHY THIS IS NOT A PERSONALITY TEST</span>
            <h2>The situations are mixed on purpose.</h2>
          </div>
          <p>
            A satellite decision can reveal software reasoning. A hospital-device problem can reveal mechanical thinking. A city problem can reveal data, electrical, civil, environmental, or systems instincts. AltWing standardizes the scoring across all 14 Wings and shows several directions rather than claiming one career is predetermined.
          </p>
        </section>

        <section className="match-result-actions">
          <div>
            <span>NEXT MOVE</span>
            <strong>Pick a field to understand. Then try a project.</strong>
            <small>No appointment. No awkward question. Save colleges, programs, research ideas, and opportunities privately on this device.</small>
          </div>
          <div className="match-result-action-buttons"><button type="button" className="guidance-ghost-button" onClick={()=>{setResult(null);setAnswers({});setQuestionIndex(0);setStarted(false);}}>Start a new WingMatch</button>
            <button type="button" className="guidance-ghost-button" onClick={() => setGuideOpen(true)}>How AltWing works</button>
            <button type="button" onClick={() => {
              const top = topThree[0]?.majorId;
              if (top) onOpenCounselor(top);
            }}>
              Open my field guide →
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="guidance-page guidance-match-page scenario-match-page">
      <section className="module-toolbar">
        <button type="button" onClick={onBack}>← Home</button>

        <small>MISSION {questionIndex + 1} / {ENGINEERING_MATCH_QUESTIONS.length}</small>
      </section>

      <div className="match-progress"><i style={{ width: `${progress}%` }} /></div>

      <section className="scenario-story-rail">
        <div><span>LIVE SHIFT</span><strong>{INCIDENT_TIMES[questionIndex]} · INCIDENT {questionIndex + 1}/8</strong></div>
        <p>The response network just routed a new system failure to your desk. Your previous decisions stay in the signal model.</p>
        <div className="scenario-story-dots">
          {ENGINEERING_MATCH_QUESTIONS.map((item, index) => (
            <i key={item.id} className={index < questionIndex ? "is-complete" : index === questionIndex ? "is-current" : ""} />
          ))}
        </div>
      </section>

      <section className="scenario-match-shell" key={question.id}>
        <div className="scenario-match-copy">
          <div className="match-question-copy">
            <span>{question.eyebrow}</span>
            <h1>{question.question}</h1>
            <p>{question.context}</p>
          </div>

          <div className="scenario-choice-note">
            <b>NO RIGHT ANSWER</b>
            <span>Choose the move you would genuinely want to make first. Select an option to preview the system response. Take your time; this is not a timed test.</span>
          </div>

          <div className="match-options scenario-options">
            {question.options.map((option, index) => (
              <button
                type="button"
                key={option.id}
                aria-pressed={selectedOptionId === option.id} className={selectedOptionId === option.id ? "is-selected" : ""}
                onMouseEnter={() => setHoveredOptionId(option.id)}
                onMouseLeave={() => setHoveredOptionId(null)}
                onFocus={() => setHoveredOptionId(option.id)}
                onBlur={() => setHoveredOptionId(null)}
                onClick={() => chooseOption(option.id)}
              >
                <span className="scenario-option-index">0{index + 1}</span>
                <div>
                  <strong>{option.label}</strong>
                  <p>{option.detail}</p>
                </div>
                <i>{selectedOptionId === option.id ? "SELECTED" : "CHOOSE"}</i>
              </button>
            ))}
          </div>
        </div>

        <EngineeringScenarioVisual
          question={question}
          activeOption={activeOption}
          selectedOptionId={selectedOptionId ?? null}
        />
      </section>

      <div className="match-nav-row scenario-match-nav">
        <button
          type="button"
          className="guidance-ghost-button"
          disabled={questionIndex === 0}
          onClick={() => {
            setHoveredOptionId(null);
            setQuestionIndex((current) => Math.max(0, current - 1));
            window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
          }}
        >
          ← Previous
        </button>
        <button
          type="button"
          className="guidance-primary-button"
          disabled={!selectedOptionId}
          onClick={continueMatch}
        >
          {questionIndex === ENGINEERING_MATCH_QUESTIONS.length - 1 ? "Reveal My Wings →" : "Lock Decision →"}
        </button>
      </div>
    </main>
  );
}
