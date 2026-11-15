import {trackEvent} from '../../../analytics/analytics';
import { readBuildDraft } from "./buildDraft";
import { writeLocal, downloadText } from "../../../../lib/storage";
import ThermalLab
  from "../labs/ThermalLab";

import AvionicsLab
  from "../labs/AvionicsLab";

import MissionDesignLab
  from "../labs/MissionDesignLab";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getWingBuild,
  type WingId,
} from "../catalog/buildCatalog";

import PropulsionLab
  from "../labs/PropulsionLab";

import GNCLab
  from "../labs/GNCLab";

import StructuresLab
  from "../labs/StructuresLab";

import {
  awardCosmicPack,
  openCosmicPack,
  type CosmicPack,
  type CosmicPackOpenResult,
} from "../../../progression/cosmic-packs";

import {
  PackReveal,
} from "../../../progression/CosmicPackVault";
import posthog, {
  isPostHogConfigured,
} from "../../../../posthog";
import {
  posthogLog,
} from "../../../../posthog-logs";

import "./build-engine.css";


interface Props {
  wingId: WingId;
  onBack: () => void;
}


const STAGES = [
  "MISSION",
  "PREDICT",
  "EXPERIMENT",
  "COMPARE",
  "REVISE",
  "DEFEND",
  "PROOF",
] as const;


type Stage =
  typeof STAGES[number];


const STAGE_COACH:
  Record<
    Stage,
    {
      eyebrow: string;
      title: string;
      body: string;
    }
  > = {

  MISSION: {
    eyebrow:
      "MISSION COACH",

    title:
      "Understand the problem before solving it.",

    body:
      "First identify what failed, what is constrained, and what evidence you actually have. Good engineering starts by defining the problem clearly.",
  },


  PREDICT: {
    eyebrow:
      "BEFORE YOU TEST",

    title:
      "Make a prediction you can challenge.",

    body:
      "Write what you expect and why. Predicting first prevents you from changing the story after you already know the result.",
  },


  EXPERIMENT: {
    eyebrow:
      "RUN THE TEST",

    title:
      "Change one thing and watch the evidence.",

    body:
      "Use the model to test your idea. Do not hunt for a perfect answer — look for evidence that supports or contradicts your prediction.",
  },


  COMPARE: {
    eyebrow:
      "BUILD CHECKPOINT",

    title:
      "Prediction versus evidence.",

    body:
      "Compare what you expected with what actually happened. Explaining the difference is more valuable than simply being right.",
  },


  REVISE: {
    eyebrow:
      "ENGINEERING IS ITERATION",

    title:
      "Use the result to improve your decision.",

    body:
      "Changing your first idea is not failure. Revision shows that you used evidence instead of defending an answer just because it was yours.",
  },


  DEFEND: {
    eyebrow:
      "MAKE THE CASE",

    title:
      "A decision is stronger when you can defend it.",

    body:
      "Explain the evidence, tradeoff, and limitation behind your final choice. Someone else should be able to understand why your decision makes sense.",
  },


  PROOF: {
    eyebrow:
      "PROOF OF FLIGHT",

    title:
      "Turn the work into evidence.",

    body:
      "Your final result should show what you tried, what changed, and why your final reasoning is stronger than where you started.",
  },
};


export default function BuildEngine({
  wingId,
  onBack,
}: Props) {

  const build =
    useMemo(
      () =>
        getWingBuild(
          wingId,
        ),
      [
        wingId,
      ],
    );


  const buildStorageId =
    `${build.wingId}-${build.buildTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;


  useEffect(()=>{trackEvent('Mission Started',{wing:build.wingId});},[build.wingId]);
  const draftKey = `altwing-build-draft-v1:${buildStorageId}`;
  const [initialDraft] = useState(() => readBuildDraft(draftKey));

  const launchedFromPath = (() => {try {return sessionStorage.getItem("altwing-build-origin-v1") === "path";} catch {return false;}})();


  const pathBuildKey =
    `altwing-wing-path-build-v1:${build.wingId}`;


  const [
    stageIndex,
    setStageIndex,
  ] =
    useState(initialDraft.stageIndex);


  const [
    prediction,
    setPrediction,
  ] =
    useState(initialDraft.prediction);


  const [
    experiment,
    setExperiment,
  ] =
    useState(initialDraft.experiment);


  const [
    comparison,
    setComparison,
  ] =
    useState(initialDraft.comparison);


  const [
    revision,
    setRevision,
  ] =
    useState(initialDraft.revision);


  const [
    defense,
    setDefense,
  ] =
    useState(initialDraft.defense);


  const [
    saved,
    setSaved,
  ] =
    useState(false);


  const [
    earnedPack,
    setEarnedPack,
  ] =
    useState<
      CosmicPack | null
    >(
      null
    );


  const [
    packOpenResult,
    setPackOpenResult,
  ] =
    useState<
      CosmicPackOpenResult | null
    >(
      null
    );


  useEffect(() => {
    writeLocal(draftKey, JSON.stringify({version:1,stageIndex,prediction,experiment,comparison,revision,defense}));
  }, [draftKey,stageIndex,prediction,experiment,comparison,revision,defense]);

  const stage:
    Stage =
      STAGES[
        stageIndex
      ];


  const progress =
    (
      (
        stageIndex + 1
      ) /
      STAGES.length
    ) *
    100;


  const predictionDone =
    prediction.trim()
      .length >= 15;


  const experimentDone =
    experiment.trim()
      .length >= 10;


  const comparisonDone =
    comparison.trim()
      .length >= 15;


  const revisionDone =
    revision.trim()
      .length >= 15;


  const defenseDone =
    defense.trim()
      .length >= 15;


  const finalDecisionDone =
    wingId === "propulsion"
      ? experiment.includes(
          "Final test selection:"
        )
      : wingId === "gnc"
        ? experiment.includes(
            "Final navigation estimate:"
          )
        : wingId === "structures"
          ? experiment.includes(
              "Final structure decision:"
            )
          : wingId === "thermal"
            ? experiment.includes(
                "Final thermal decision:"
              )
            : wingId === "avionics"
              ? experiment.includes(
                  "Final avionics diagnosis:"
                )
              : (
                  build.wingName ===
                    "Mission Design" ||
                  wingId ===
                    "mission-design"
                )
                ? experiment.includes(
                    "Final mission architecture:"
                  )
                : experimentDone;


  const evidenceItems = [
    {
      label:
        "Prediction recorded",
      done:
        predictionDone,
    },

    {
      label:
        "Experiment completed",
      done:
        experimentDone,
    },

    {
      label:
        "Evidence compared",
      done:
        comparisonDone,
    },

    {
      label:
        "Design revised",
      done:
        revisionDone,
    },

    {
      label:
        "Final decision made",
      done:
        finalDecisionDone,
    },

    {
      label:
        "Engineering defense written",
      done:
        defenseDone,
    },
  ];


  const evidenceComplete =
    evidenceItems.every(
      item =>
        item.done,
    );


  function next() {

    /*
     * The outer Wing Path has five meaningful
     * checkpoints:
     *
     * DISCOVER → TRY → BUILD → PROVE → LAUNCH
     *
     * Inside BuildEngine, completing COMPARE is
     * the point where the student has actually
     * tested something and interpreted evidence.
     *
     * That earns the BUILD checkpoint.
     */
    if (
      stage === "COMPARE" &&
      launchedFromPath
    ) {

      const wasAlreadyComplete =
        localStorage.getItem(
          pathBuildKey,
        ) === "1";


      writeLocal(
        pathBuildKey,
        "1",
      );


      window.dispatchEvent(
        new CustomEvent(
          "altwing:path-build-complete",
          {
            detail: {
              wingId:
                build.wingId,

              buildId:
                buildStorageId,
            },
          },
        ),
      );


      const packAward =
        awardCosmicPack(
          `path:${build.wingId}:build`,
          "BUILDER",
          `${build.wingName} Path · Build Checkpoint`,
        );


      /*
       * sourceId prevents duplicate farming.
       * If a previously earned Pack is still
       * unopened, it can be surfaced again.
       */
      if (
        !packAward.pack.openedAt
      ) {

        setEarnedPack(
          packAward.pack,
        );
      }


      if (
        !wasAlreadyComplete &&
        isPostHogConfigured
      ) {

        posthog.capture(
          "wing_path_checkpoint_completed",
          {
            path_version:
              "v1",

            wing_id:
              build.wingId,

            build_id:
              buildStorageId,

            checkpoint:
              "build",

            stage:
              "compare",
          },
        );
      }
    }


    setStageIndex(
      current =>
        Math.min(
          current + 1,
          STAGES.length - 1,
        ),
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  function previous() {

    setStageIndex(
      current =>
        Math.max(
          current - 1,
          0,
        ),
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  function openEarnedPack() {

    if (!earnedPack) {
      return;
    }


    const result =
      openCosmicPack(
        earnedPack.id
      );


    setEarnedPack(
      null
    );


    if (result) {

      setPackOpenResult(
        result
      );
    }
  }


  function saveProof() {
    if (!evidenceComplete) return;
    trackEvent('Mission Completed',{wing:build.wingId});

    if (isPostHogConfigured) {
      posthog.capture(
        "build_proof_saved",
        {
          build_id: buildStorageId,
          wing_id: build.wingId,
        },
      );
    }

    posthogLog.info(
      "build proof saved",
      {
        build_id: buildStorageId,
        evidence_item_count: evidenceItems.length,
        wing_id: build.wingId,
      },
    );

    const record = {
      buildId:
        buildStorageId,

      wingId:
        build.wingId,

      wingName:
        build.wingName,

      buildTitle:
        build.buildTitle,

      prediction,

      experiment,

      comparison,

      revision,

      defense,

      completedAt:
        new Date()
          .toISOString(),

      sources:
        build.sources,
    };


    writeLocal(
      `altwing-build-proof-${buildStorageId}`,
      JSON.stringify(
        record,
      ),
    );


    window.dispatchEvent(
      new CustomEvent(
        "altwing:build-progress",
        {
          detail:
            record,
        },
      ),
    );


    const packAward =
      awardCosmicPack(
        `proof:${buildStorageId}`,
        "EVIDENCE",
        `${build.wingName} · ${build.buildTitle} Proof of Flight`,
      );


    setSaved(
      true,
    );


    /*
     * Wing Path completion bridge.
     *
     * A Path cannot unlock its certificate
     * until the actual BuildEngine Proof of
     * Flight has been saved.
     */
    writeLocal(
      `altwing-wing-path-proof-v1:${build.wingId}`,
      "1",
    );


    window.dispatchEvent(
      new CustomEvent(
        "altwing:path-proof-saved",
        {
          detail: {
            wingId:
              build.wingId,
          },
        },
      ),
    );


    /*
     * If this Proof already earned and opened
     * its Pack previously, don't award another.
     *
     * If the Pack exists but is still unopened,
     * remind the student about it.
     */
    if (
      !packAward.pack.openedAt
    ) {

      setEarnedPack(
        packAward.pack
      );
    }
  }


  if (
    packOpenResult
  ) {

    return (
      <PackReveal
        result={
          packOpenResult
        }
        onClose={() =>
          setPackOpenResult(
            null
          )
        }
      />
    );
  }


  if (
    earnedPack
  ) {

    return (
      <main className="be-shell">

        <section className="be-pack-earned">

          <span className="be-pack-kicker">
            PROOF OF FLIGHT COMPLETE
          </span>


          <div className="be-pack-mascot">

            <img
              src="/brand/altwing-penguin.png"
              alt=""
            />

          </div>


          <span className="be-pack-signal">
            REWARD SIGNAL RECEIVED
          </span>


          <h1>
            Engineering Pack
            <br />
            earned.
          </h1>


          <p>
            You earned this by completing
            <strong>
              {" "}
              {build.buildTitle}
            </strong>
            {" "}
            and saving your engineering
            evidence.
          </p>


          <div className="be-pack-object">

            <div className="be-pack-object-top">

              <span>
                ALTWING
              </span>

              <b>
                ENGINEERING
              </b>

            </div>


            <div className="be-pack-emblem">
              ✦
            </div>


            <strong>
              DEEP SPACE
              <br />
              PACK
            </strong>


            <small>
              3 COSMIC SIGNALS
            </small>

          </div>


          <div className="be-pack-actions">

            <button
              type="button"
              className="be-pack-open"
              onClick={
                openEarnedPack
              }
            >
              OPEN NOW →
            </button>


            <button
              type="button"
              className="be-pack-later"
              onClick={() =>
                setEarnedPack(
                  null
                )
              }
            >
              SAVE FOR LATER
            </button>

          </div>


          <small className="be-pack-note">
            One Pack per completed Build.
            Replaying the same Build will
            not create another reward.
          </small>

        </section>

      </main>
    );
  }


  if (saved) {

    return (
      <main className="be-shell">

        <section className="module-toolbar">



          <strong>
            PROOF OF FLIGHT
          </strong>

        </section>


        <section className="be-proof">

          <span className="be-kicker">
            BUILD COMPLETE
          </span>


          <h1>
            You did more than
            read about{" "}
            {build.wingName}.
          </h1>


          <p>
            You made a prediction,
            tested an idea,
            compared evidence,
            revised your thinking,
            and defended a final
            engineering decision.
          </p>


          <div className="be-proof-grid">

            <article>
              <span>
                WING
              </span>

              <strong>
                {
                  build.wingName
                }
              </strong>
            </article>


            <article>
              <span>
                BUILD
              </span>

              <strong>
                {
                  build.buildTitle
                }
              </strong>
            </article>


            <article>
              <span>
                SOURCES
              </span>

              <strong>
                {
                  build.sources.length
                }{" "}
                primary
              </strong>
            </article>

          </div>


          <section className="be-proof-note">

            <span>
              YOUR FINAL DECISION
            </span>

            <p>
              {
                defense ||
                "No final defense recorded."
              }
            </p>

          </section>


          <button type="button" className="release-secondary" onClick={() => downloadText(`altwing-${build.wingId}-record.txt`, [build.buildTitle, "Student exploration record · simplified simulation", prediction, experiment, comparison, revision, defense, build.modelDisclosure].join("\n\n"))}>Export my exploration record</button>
          <button
            type="button"
            className="be-primary"
            onClick={
              onBack
            }
          >
            RETURN TO ALTWING →
          </button>

        </section>

      </main>
    );
  }


  return (
    <main className="be-shell">

      <section className="module-toolbar">

        <button
          type="button"
          onClick={
            onBack
          }
        >
          ← EXIT BUILD
        </button>





        <strong>
          {
            build.wingName
          }
        </strong>

      </section>


      <div className="be-progress">

        <span
          style={{
            width:
              `${progress}%`,
          }}
        />

      </div>


      <section className="be-content">
        <aside className="build-draft-note"><strong>Your pace. Your work.</strong><p>Written notes and submitted lab evidence save in this browser. You can pause and resume. Individual simulation controls reset when you leave; your submitted evidence stays recorded.</p><button type="button" className="release-secondary" onClick={() => downloadText(`altwing-${build.wingId}-draft.txt`, [build.buildTitle, `Prediction: ${prediction}`, `Recorded simulation evidence: ${experiment}`, `Comparison: ${comparison}`, `Revision: ${revision}`, `Reasoning: ${defense}`, build.modelDisclosure].join("\n\n"))}>Export my notes</button></aside>


        <div className="be-stage-heading">

          <div>

            <span className="be-kicker">
              {
                stage
              }
              {" · "}
              {stageIndex + 1}
              {" / "}
              {STAGES.length}
            </span>


            <h1>
              {
                build.buildTitle
              }
            </h1>

          </div>


          <div className="be-wing-tag">
            {
              build.wingName
            }
          </div>

        </div>


        <aside
          className={[
            "be-mission-coach",
            stage === "COMPARE"
              ? "is-checkpoint"
              : "",
          ].join(
            " ",
          )}
        >

          <div className="be-mission-coach-mark">

            <img
              src="/brand/altwing-penguin.png"
              alt=""
            />

          </div>


          <div className="be-mission-coach-copy">

            <span>
              {
                STAGE_COACH[
                  stage
                ].eyebrow
              }
            </span>

            <strong>
              {
                STAGE_COACH[
                  stage
                ].title
              }
            </strong>

            <p>
              {
                STAGE_COACH[
                  stage
                ].body
              }
            </p>


            {stage === "COMPARE" &&
              launchedFromPath && (

              <small>
                COMPLETE THIS STEP TO EARN
                YOUR BUILD CHECKPOINT +
                COSMIC PACK
              </small>

            )}

          </div>

        </aside>


        {stage === "MISSION" && (

          <section className="be-panel">

            <span className="be-label">
              YOUR MISSION
            </span>


            <h2>
              {
                build.mission
              }
            </h2>


            <p className="be-big-question">
              {
                build.beginnerQuestion
              }
            </p>


            <div className="be-concepts">

              {build.concepts.map(
                concept => (
                  <span
                    key={
                      concept
                    }
                  >
                    {
                      concept
                    }
                  </span>
                ),
              )}

            </div>


            <aside className="be-disclosure">

              <strong>
                SIMPLIFIED LEARNING MODEL
              </strong>

              <p>
                {
                  build.modelDisclosure
                }
              </p>

            </aside>

          </section>
        )}


        {stage === "PREDICT" && (

          <section className="be-panel">

            <span className="be-label">
              BEFORE YOU TEST
            </span>


            <h2>
              Make a prediction.
            </h2>


            <p>
              Engineers do not wait
              until after a result to
              decide what they expected.
              Write what you think will
              happen and why.
            </p>


            <textarea
              aria-label={`My ${stage.toLowerCase()} notes`}
              value={
                prediction
              }
              onChange={
                event =>
                  setPrediction(
                    event.target.value,
                  )
              }
              placeholder="I predict that..."
            />

          </section>
        )}


        {stage === "EXPERIMENT" && (

          <section className="be-panel">

            <span className="be-label">
              BUILD LAB
            </span>


            <h2>
              Change something.
              Observe what happens.
            </h2>


            <p>
              Change a parameter in the simplified simulation, compare the results, and submit your evidence. The model is for exploration, not real-world engineering validation.
            </p>


            {wingId ===
            "propulsion" ? (

              <PropulsionLab
                onEvidence={
                  setExperiment
                }
              />

            ) : wingId ===
              "gnc" ? (

              <GNCLab
                onEvidence={
                  setExperiment
                }
              />

            ) : wingId ===
              "structures" ? (

              <StructuresLab
                onEvidence={
                  setExperiment
                }
              />

            ) : wingId ===
              "thermal" ? (

              <ThermalLab
                onEvidence={
                  setExperiment
                }
              />

            ) : wingId ===
              "avionics" ? (

              <AvionicsLab
                onEvidence={
                  setExperiment
                }
              />

            ) : (
              build.wingName ===
                "Mission Design" ||
              wingId ===
                "mission-design"
            ) ? (

              <MissionDesignLab
                onEvidence={
                  setExperiment
                }
              />

            ) : (

              <>

                <div className="be-action-list">

                  {build.actions.map(
                    (
                      action,
                      index,
                    ) => (

                      <div
                        key={
                          action
                        }
                      >
                        <span>
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <strong>
                          {
                            action
                          }
                        </strong>
                      </div>

                    ),
                  )}

                </div>


                <textarea
              aria-label={`My ${stage.toLowerCase()} notes`}
                  value={
                    experiment
                  }
                  onChange={
                    event =>
                      setExperiment(
                        event.target.value,
                      )
                  }
                  placeholder="What did you change or test?"
                />

              </>

            )}

          </section>
        )}


        {stage === "COMPARE" && (

          <section className="be-panel">

            <span className="be-label">
              COMPARE
            </span>


            <h2>
              What changed?
            </h2>


            <p>
              Compare your prediction
              with the evidence. Look
              for tradeoffs rather than
              searching for a perfect
              answer.
            </p>


            <textarea
              aria-label={`My ${stage.toLowerCase()} notes`}
              value={
                comparison
              }
              onChange={
                event =>
                  setComparison(
                    event.target.value,
                  )
              }
              placeholder="My prediction was... but the result showed..."
            />

          </section>
        )}


        {stage === "REVISE" && (

          <section className="be-panel">

            <span className="be-label">
              ITERATE
            </span>


            <h2>
              Change the design.
            </h2>


            <p>
              Engineering usually gets
              better after the first
              attempt. What would you
              change now?
            </p>


            <textarea
              aria-label={`My ${stage.toLowerCase()} notes`}
              value={
                revision
              }
              onChange={
                event =>
                  setRevision(
                    event.target.value,
                  )
              }
              placeholder="For my second design, I would..."
            />

          </section>
        )}


        {stage === "DEFEND" && (

          <section className="be-panel">

            <span className="be-label">
              FINAL DECISION
            </span>


            <h2>
              Defend the tradeoff.
            </h2>


            <p>
              There may be several
              reasonable solutions.
              Explain why your final
              choice fits this mission.
            </p>


            <textarea
              aria-label={`My ${stage.toLowerCase()} notes`}
              value={
                defense
              }
              onChange={
                event =>
                  setDefense(
                    event.target.value,
                  )
              }
              placeholder="I chose this design because..."
            />

          </section>
        )}


        {stage === "PROOF" && (

          <section className="be-panel">

            <span className="be-label">
              PROOF OF FLIGHT
            </span>


            <h2>
              Keep evidence,
              not just completion.
            </h2>


            <p>
              Your Build record can
              preserve the thinking
              behind the final design.
            </p>


            <div className="be-proof-list">

              {evidenceItems.map(
                item => (

                  <div
                    key={
                      item.label
                    }
                    className={
                      item.done
                        ? "is-complete"
                        : "is-missing"
                    }
                  >
                    <span>
                      {
                        item.done
                          ? "✓"
                          : "○"
                      }
                    </span>

                    {
                      item.label
                    }
                  </div>

                ),
              )}

            </div>


            {!evidenceComplete && (

              <div className="be-proof-warning">

                Complete the unfinished
                evidence above before
                saving Proof of Flight.

              </div>

            )}


            <section className="be-sources">

              <div className="be-source-head">

                <span>
                  ENGINEERING BASIS
                </span>

                <strong>
                  {
                    build.sources.length
                  }{" "}
                  PRIMARY SOURCE
                  {build.sources.length !== 1
                    ? "S"
                    : ""}
                </strong>

              </div>


              {build.sources.map(
                source => (

                  <a
                    key={
                      source.url
                    }
                    href={
                      source.url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >

                    <div>

                      <span>
                        {
                          source.organization
                        }
                      </span>

                      <strong>
                        {
                          source.title
                        }
                      </strong>

                      <p>
                        {
                          source.purpose
                        }
                      </p>

                    </div>

                    <b>
                      ↗
                    </b>

                  </a>

                ),
              )}

            </section>

          </section>
        )}


        <footer className="be-navigation">

          <button
            type="button"
            className="be-secondary"
            disabled={
              stageIndex === 0
            }
            onClick={
              previous
            }
          >
            ← PREVIOUS
          </button>


          {stageIndex <
          STAGES.length - 1 ? (

            <button
              type="button"
              className="be-primary"
              onClick={
                next
              }
            >
              CONTINUE →
            </button>

          ) : (

            <button
              type="button"
              className="be-primary"
              disabled={
                !evidenceComplete
              }
              onClick={
                saveProof
              }
            >
              SAVE PROOF OF FLIGHT →
            </button>

          )}

        </footer>

      </section>

    </main>
  );
}
