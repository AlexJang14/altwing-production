import {submitImpactFeedback} from '../analytics/analytics';
import {IMPACT_VERSION} from '../analytics/impactTypes';
import {
  useEffect,
  useState,
} from "react";

import posthog, {
  isPostHogConfigured,
} from "../../posthog";

import "./wingmatch-feedback.css";
import "../analytics/impact.css";


const FEEDBACK_PENDING_KEY =
  "altwing-wingmatch-feedback-pending-v1";

const GUIDE_PENDING_KEY =
  "altwing-post-wing-guide-pending-v1";

const SELECTED_WING_KEY =
  "altwing-selected-wing-v1";

const GUIDE_COMPLETE_EVENT =
  "altwing:post-wing-guide-complete";


type Score =
  | 1
  | 2
  | 3
  | 4
  | 5;


interface SavedWing {
  id: string;
  name?: string;
  recommendedWing?: string;
  selectedAt?: string;
  source?: string;
}


function readSavedWing():
  SavedWing | null {

  try {
    const raw =
      localStorage.getItem(
        SELECTED_WING_KEY,
      );

    if (!raw) {
      return null;
    }

    return JSON.parse(
      raw,
    ) as SavedWing;

  } catch {
    return null;
  }
}


function submittedKey(
  selectedAt: string,
) {
  return (
    "altwing-wingmatch-feedback-submitted-v1:" +
    selectedAt
  );
}


function openedKey(
  selectedAt: string,
) {
  return (
    "altwing-wingmatch-feedback-opened-v1:" +
    selectedAt
  );
}


function deferKey(
  selectedAt: string,
) {
  return (
    "altwing-wingmatch-feedback-deferred-v1:" +
    selectedAt
  );
}


interface RatingProps {
  question: string;
  low: string;
  high: string;
  value: Score | null;
  onChange: (
    score: Score,
  ) => void;
}


function Rating({
  question,
  low,
  high,
  value,
  onChange,
}: RatingProps) {

  const scores:
    Score[] = [
      1,
      2,
      3,
      4,
      5,
    ];

  return (
    <fieldset className="awfb-question">

      <legend>
        {question}
      </legend>

      <div className="awfb-scale">

        {scores.map(
          (score) => (
            <button
              type="button"
              key={score}
              className={
                value === score
                  ? "is-selected"
                  : ""
              }
              aria-pressed={
                value === score
              }
              onClick={() =>
                onChange(
                  score,
                )
              }
            >
              {score}
            </button>
          ),
        )}

      </div>

      <div className="awfb-labels">
        <span>{low}</span>
        <span>{high}</span>
      </div>

    </fieldset>
  );
}


function WingMatchFeedback() {
  const [submissionId]=useState(()=>crypto.randomUUID());
  const [submitting,setSubmitting]=useState(false),[feedbackPermission,setFeedbackPermission]=useState(false),[quotePermission,setQuotePermission]=useState(false);

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    submitted,
    setSubmitted,
  ] =
    useState(false);

  const [
    understanding,
    setUnderstanding,
  ] =
    useState<Score | null>(
      null,
    );

  const [
    direction,
    setDirection,
  ] =
    useState<Score | null>(
      null,
    );

  const [
    action,
    setAction,
  ] =
    useState<Score | null>(
      null,
    );

  const [
    reflection,
    setReflection,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");


  function openIfReady() {

    const wing =
      readSavedWing();

    if (!wing?.selectedAt) {
      return;
    }

    const pending =
      localStorage.getItem(
        FEEDBACK_PENDING_KEY,
      );

    if (
      pending !==
      wing.selectedAt
    ) {
      return;
    }

    /*
     * Never overlap with
     * PostWingGuide.
     */
    if (
      localStorage.getItem(
        GUIDE_PENDING_KEY,
      )
    ) {
      return;
    }

    if (
      localStorage.getItem(
        submittedKey(
          wing.selectedAt,
        ),
      )
    ) {
      localStorage.removeItem(
        FEEDBACK_PENDING_KEY,
      );

      return;
    }

    /*
     * NOT NOW hides it only for
     * the current browser session.
     */
    if (
      sessionStorage.getItem(
        deferKey(
          wing.selectedAt,
        ),
      )
    ) {
      return;
    }

    setOpen(
      true,
    );

    const openKey =
      openedKey(
        wing.selectedAt,
      );

    if (
      isPostHogConfigured &&
      !localStorage.getItem(
        openKey,
      )
    ) {

      posthog.capture(
        "wingmatch_feedback_opened",
        {
          feedback_version:
            "v1",

          selected_wing_id:
            wing.id,

          recommended_wing_id:
            wing.recommendedWing ??
            null,
        },
      );

      localStorage.setItem(
        openKey,
        "1",
      );
    }
  }


  useEffect(
    () => {

      const handleGuideComplete =
        () => {
          window.setTimeout(
            openIfReady,
            250,
          );
        };

      window.addEventListener(
        GUIDE_COMPLETE_EVENT,
        handleGuideComplete,
      );

      const timer =
        window.setTimeout(
          openIfReady,
          900,
        );

      return () => {
        window.removeEventListener(
          GUIDE_COMPLETE_EVENT,
          handleGuideComplete,
        );

        window.clearTimeout(
          timer,
        );
      };

    },
    [],
  );


  async function submitFeedback() {
    if(submitting)return;
    if(understanding===null||direction===null||action===null){setError('Please answer the three rating questions.');return;}
    if(!feedbackPermission){setError('Please confirm that you choose to share this optional anonymous feedback.');return;}
    const wing=readSavedWing();if(!wing?.selectedAt){setError('We could not connect this feedback to your WingMatch result.');return;}
    setSubmitting(true);setError('');
    try{
      await submitImpactFeedback({id:submissionId,version:IMPACT_VERSION,source:'legacy-wingmatch',legacy_understanding:understanding,legacy_direction:direction,legacy_action:action,testimonial:reflection.trim().slice(0,400),feedback_permission:true,quote_permission:quotePermission&&Boolean(reflection.trim())});
      try{localStorage.setItem(submittedKey(wing.selectedAt),'1');localStorage.removeItem(FEEDBACK_PENDING_KEY);}catch{/* A successful database save does not depend on local storage. */}
      setSubmitted(true);setReflection('');
    }catch(error){setError((error as Error).message);}finally{setSubmitting(false);}
  }


  function notNow() {

    const wing =
      readSavedWing();

    if (wing?.selectedAt) {
      sessionStorage.setItem(
        deferKey(
          wing.selectedAt,
        ),
        "1",
      );
    }

    setOpen(
      false,
    );
  }


  if (!open) {
    return null;
  }


  if (submitted) {
    return (
      <div className="awfb-overlay">

        <section
          className="awfb-card awfb-thanks"
          role="dialog"
          aria-modal="true"
        >

          <span className="awfb-kicker">
            FEEDBACK RECEIVED
          </span>

          <div className="awfb-star">
            ✦
          </div>

          <h2>
            Thanks for helping
            AltWing improve.
          </h2>

          <p>
            Your anonymous feedback
            was added to the WingMatch
            impact data.
          </p>

          <button
            type="button"
            className="awfb-submit"
            onClick={() =>
              setOpen(
                false,
              )
            }
          >
            DONE
          </button>

        </section>

      </div>
    );
  }


  return (
    <div className="awfb-overlay">

      <section
        className="awfb-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="awfb-title"
      >

        <div className="awfb-top">

          <span className="awfb-kicker">
            20 SECOND CHECK-IN
          </span>

          <span className="awfb-tag">
            WINGMATCH FEEDBACK
          </span>

        </div>


        <h2 id="awfb-title">
          Did this mission
          change anything for you?
        </h2>

        <p className="awfb-intro">
          Three quick ratings help us
          measure whether AltWing
          actually helps students
          understand, choose, and act.
        </p>


        <Rating
          question="How much did this mission help you understand what aerospace engineers actually do?"
          low="Not at all"
          high="A lot"
          value={
            understanding
          }
          onChange={
            setUnderstanding
          }
        />


        <Rating
          question="How clear are you now about what part of aerospace interests you most?"
          low="Not clear yet"
          high="Very clear"
          value={
            direction
          }
          onChange={
            setDirection
          }
        />


        <Rating
          question="How likely are you to take a real next step in aerospace after this mission?"
          low="Very unlikely"
          high="Very likely"
          value={
            action
          }
          onChange={
            setAction
          }
        />


        <div className="awfb-reflection">

          <label
            htmlFor="awfb-reflection"
          >
            What changed for you,
            if anything?

            <span>
              OPTIONAL
            </span>
          </label>

          <textarea
            id="awfb-reflection"
            value={
              reflection
            }
            maxLength={400}
            onChange={(
              event,
            ) =>
              setReflection(
                event.target.value,
              )
            }
            placeholder="Something you learned, a field you noticed, or a next step you want to try..."
          />

          <div className="awfb-note">

            <span>
              Please don't include
              your name, email,
              or school.
            </span>

            <span>
              {reflection.length}/400
            </span>

          </div>

        </div>


        <label className="impact-check"><input type="checkbox" checked={feedbackPermission} onChange={e=>setFeedbackPermission(e.target.checked)}/>I choose to send these anonymous ratings and any written feedback to AltWing’s owner.</label>
        <label className="impact-check"><input type="checkbox" checked={quotePermission} disabled={!reflection.trim()} onChange={e=>setQuotePermission(e.target.checked)}/>Separately, I allow anonymous public quoting of my written feedback. This permission is optional.</label>
        {error && (
          <p
            className="awfb-error"
            role="alert"
          >
            {error}
          </p>
        )}


        <div className="awfb-actions">

          <button
            type="button"
            className="awfb-later"
            onClick={
              notNow
            }
          >
            NOT NOW
          </button>

          <button
            type="button"
            className="awfb-submit"
            disabled={submitting}
            onClick={
              submitFeedback
            }
          >
            {submitting?'SAVING…':'SUBMIT FEEDBACK →'}
          </button>

        </div>


        <small className="awfb-privacy">
          Anonymous product feedback.
          Ratings and the optional
          reflection are sent to AltWing’s database only when you choose to submit them.
        </small>

      </section>

    </div>
  );
}


export default WingMatchFeedback;
