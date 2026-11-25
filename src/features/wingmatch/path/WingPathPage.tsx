import {preferredScrollBehavior} from '../../../design/golden-horizon/motion';
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  WingId,
} from "../build/catalog/buildCatalog";

import {
  awardCosmicPack,
} from "../../progression/cosmic-packs";

import PackReadyBanner
  from "../../home/PackReadyBanner";

import posthog, {
  isPostHogConfigured,
} from "../../../posthog";

import "./wing-path-page.css";


type Score =
  | 1
  | 2
  | 3
  | 4
  | 5;


type PathWingId =
  | "avionics"
  | "gnc"
  | "propulsion"
  | "structures"
  | "thermal"
  | "mission-design";


type NextStep =
  | "compete"
  | "build"
  | "college";


interface Resource {
  name: string;
  source: string;
  why: string;
  url: string;
}


interface WingMeta {
  name: string;
  short: string;

  headline: string;
  description: string;

  skills: string[];

  projectTitle: string;
  projectBody: string;

  competitions:
    Resource[];
}


interface Props {
  onBack: () => void;

  onOpenUniverse?:
    () => void;

  onStartBuild?:
    (
      wingId:
        WingId,
    ) => void;
}


const TECHRISE =
  "https://www.nasa.gov/stmd-flight-opportunities/access-flight-tests/techrise/";

const STUDENT_LAUNCH =
  "https://www.nasa.gov/learning-resources/nasa-student-launch/";

const TSA =
  "https://tsaweb.org/competitions/-in-category/categories/all-high-school-competitions";

const SCI_OLY =
  "https://www.soinc.org/events/2027-division-c-events";


const COLLEGES:
  Resource[] = [

  {
    name:
      "Georgia Tech",

    source:
      "B.S. Aerospace Engineering",

    why:
      "Explore the actual BSAE curriculum, labs, controls, structures, propulsion, electronics, and design options.",

    url:
      "https://catalog.gatech.edu/programs/aerospace-engineering-bs/",
  },

  {
    name:
      "MIT",

    source:
      "Aeronautics & Astronautics",

    why:
      "Explore Course 16 topics including structures, propulsion, signals, control, estimation, software, and autonomous systems.",

    url:
      "https://aeroastro.mit.edu/education/undergraduate-degrees-requirements/",
  },

  {
    name:
      "Purdue",

    source:
      "Aeronautics & Astronautics",

    why:
      "Explore aerospace systems design, astrodynamics, autonomy and control, propulsion, and structures specializations.",

    url:
      "https://engineering.purdue.edu/AAE/academics/undergraduate",
  },

  {
    name:
      "University of Michigan",

    source:
      "Aerospace Engineering",

    why:
      "Explore propulsion, autonomous systems and control, computation, space systems, and structures.",

    url:
      "https://aero.engin.umich.edu/undergraduate/",
  },
];


const WINGS:
  Record<
    PathWingId,
    WingMeta
  > = {

  avionics: {
    name:
      "Avionics",

    short:
      "AVIONICS",

    headline:
      "Don't just like Avionics. Test the work.",

    description:
      "Trace sensor evidence, isolate a fault, revise your diagnosis, and defend how the spacecraft should respond.",

    skills: [
      "sensor reasoning",
      "telemetry interpretation",
      "fault isolation",
      "redundancy",
      "engineering defense",
    ],

    projectTitle:
      "Build a redundant-sensor fault detector",

    projectBody:
      "Create three simulated sensors, inject one bad reading, and design logic that identifies which channel should no longer be trusted.",

    competitions: [
      {
        name:
          "NASA TechRise",

        source:
          "NASA",

        why:
          "A strong route for sensor, electronics, payload, and flight-experiment ideas.",

        url:
          TECHRISE,
      },

      {
        name:
          "Circuit Lab",

        source:
          "Science Olympiad",

        why:
          "Build deeper circuit and electronics reasoning that connects naturally to avionics.",

        url:
          SCI_OLY,
      },

      {
        name:
          "Drone Challenge",

        source:
          "TSA",

        why:
          "Combines electronics, programming, flight testing, wiring documentation, and engineering decisions.",

        url:
          TSA,
      },
    ],
  },


  gnc: {
    name:
      "Guidance, Navigation & Control",

    short:
      "GNC",

    headline:
      "Know where the vehicle is. Decide what it should do next.",

    description:
      "Estimate motion from imperfect information and defend a control decision under uncertainty.",

    skills: [
      "state estimation",
      "sensor fusion",
      "control reasoning",
      "trajectory thinking",
      "uncertainty",
    ],

    projectTitle:
      "Build a two-sensor navigation estimator",

    projectBody:
      "Simulate two noisy position sensors and compare simple averaging, weighted estimates, and rejection of a bad measurement.",

    competitions: [
      {
        name:
          "NASA TechRise",

        source:
          "NASA",

        why:
          "Good for flight sensing, navigation, controls, and experimental payload concepts.",

        url:
          TECHRISE,
      },

      {
        name:
          "Drone Challenge",

        source:
          "TSA",

        why:
          "A hands-on route into flight control, programming, sensors, testing, and iteration.",

        url:
          TSA,
      },

      {
        name:
          "Electric Vehicle",

        source:
          "Science Olympiad",

        why:
          "Adds controlled motion, measurement, design, and repeatable testing.",

        url:
          SCI_OLY,
      },
    ],
  },


  propulsion: {
    name:
      "Propulsion Engineering",

    short:
      "PROPULSION",

    headline:
      "An engine is a tradeoff. Test what the mission actually needs.",

    description:
      "Compare thrust, efficiency, fuel, mass, and mission consequences instead of searching for one magical engine.",

    skills: [
      "thrust reasoning",
      "propellant tradeoffs",
      "efficiency",
      "mission constraints",
      "trade studies",
    ],

    projectTitle:
      "Run a rocket-engine trade study",

    projectBody:
      "Compare several simplified engines using thrust, specific impulse, propellant mass, and mission duration, then defend one choice.",

    competitions: [
      {
        name:
          "NASA Student Launch",

        source:
          "NASA",

        why:
          "A deep team experience built around rocket design, testing, reviews, payloads, and launch.",

        url:
          STUDENT_LAUNCH,
      },

      {
        name:
          "NASA TechRise",

        source:
          "NASA",

        why:
          "Turns a science or technology idea into a constrained flight experiment.",

        url:
          TECHRISE,
      },

      {
        name:
          "Engineering Design",

        source:
          "TSA",

        why:
          "Rewards documented engineering design, prototyping, testing, and technical presentation.",

        url:
          TSA,
      },
    ],
  },


  structures: {
    name:
      "Structures & Mechanical Systems",

    short:
      "STRUCTURES",

    headline:
      "Make it light enough to fly and strong enough to survive.",

    description:
      "Balance load paths, geometry, mass, materials, and failure risk instead of maximizing only one number.",

    skills: [
      "load paths",
      "structural efficiency",
      "failure reasoning",
      "mass tradeoffs",
      "design revision",
    ],

    projectTitle:
      "Optimize a lightweight landing leg",

    projectBody:
      "Build several cardboard, balsa, or CAD structures and compare mass, deformation, and failure load.",

    competitions: [
      {
        name:
          "Boomilever",

        source:
          "Science Olympiad",

        why:
          "Directly rewards structural efficiency, load reasoning, testing, and iteration.",

        url:
          SCI_OLY,
      },

      {
        name:
          "Structural Design & Engineering",

        source:
          "TSA",

        why:
          "Connects design documentation with construction and destructive structural testing.",

        url:
          TSA,
      },

      {
        name:
          "Engineering Design",

        source:
          "TSA",

        why:
          "A broader path for developing and testing your own structural engineering solution.",

        url:
          TSA,
      },
    ],
  },


  thermal: {
    name:
      "Thermal Engineering",

    short:
      "THERMAL",

    headline:
      "A spacecraft survives only if heat has somewhere to go.",

    description:
      "Track heating and cooling, compare thermal strategies, and make decisions under power and mass constraints.",

    skills: [
      "energy balance",
      "temperature limits",
      "heat transfer",
      "thermal tradeoffs",
      "constraints",
    ],

    projectTitle:
      "Build a spacecraft thermal-balance model",

    projectBody:
      "Estimate heat entering and leaving a small spacecraft model, then compare insulation, radiator area, and power strategies.",

    competitions: [
      {
        name:
          "Thermodynamics",

        source:
          "Science Olympiad",

        why:
          "Directly develops heat, energy, temperature, measurement, and experimental reasoning.",

        url:
          SCI_OLY,
      },

      {
        name:
          "NASA TechRise",

        source:
          "NASA",

        why:
          "Payload experiments can involve environmental sensing, thermal protection, and flight conditions.",

        url:
          TECHRISE,
      },

      {
        name:
          "Engineering Design",

        source:
          "TSA",

        why:
          "Lets you turn a thermal problem into a documented prototype and test program.",

        url:
          TSA,
      },
    ],
  },


  "mission-design": {
    name:
      "Mission Design & Astrodynamics",

    short:
      "MISSION DESIGN",

    headline:
      "A mission is a system of tradeoffs, not a list of cool ideas.",

    description:
      "Balance science value, risk, resources, trajectory, time, mass, and mission success as one connected system.",

    skills: [
      "systems thinking",
      "mission architecture",
      "trade studies",
      "risk reasoning",
      "resource allocation",
    ],

    projectTitle:
      "Design a constrained Mars mission",

    projectBody:
      "Choose one science objective, a mass limit, a power limit, and a mission duration. Compare three architectures and defend one.",

    competitions: [
      {
        name:
          "NASA TechRise",

        source:
          "NASA",

        why:
          "Teams turn an idea into a feasible flight experiment with real design constraints.",

        url:
          TECHRISE,
      },

      {
        name:
          "NASA Student Launch",

        source:
          "NASA",

        why:
          "Teams move through design reviews, testing, readiness, launch, and post-flight analysis.",

        url:
          STUDENT_LAUNCH,
      },

      {
        name:
          "Mission Possible",

        source:
          "Science Olympiad",

        why:
          "A systems-style build where multiple mechanisms must work together reliably.",

        url:
          SCI_OLY,
      },
    ],
  },
};


function readWing():
  PathWingId | null {

  try {

    const saved =
      localStorage.getItem(
        "altwing-selected-wing-v1",
      );


    if (saved) {

      const parsed =
        JSON.parse(
          saved,
        ) as {
          id?:
            string;
        };


      if (
        parsed.id &&
        parsed.id in WINGS
      ) {
        return (
          parsed.id as PathWingId
        );
      }
    }


    const legacy =
      localStorage.getItem(
        "altwing-selected-wing",
      );


    if (
      legacy &&
      legacy in WINGS
    ) {
      return (
        legacy as PathWingId
      );
    }

  } catch {
    return null;
  }


  return null;
}


function flag(
  key:
    string,
) {

  return (
    localStorage.getItem(
      key,
    ) === "1"
  );
}


function Rating({
  label,
  value,
  onChange,
}: {
  label:
    string;

  value:
    Score | null;

  onChange:
    (
      score:
        Score,
    ) => void;
}) {

  return (
    <div className="awpath-rating">

      <p>
        {label}
      </p>


      <div>

        {(
          [
            1,
            2,
            3,
            4,
            5,
          ] as Score[]
        ).map(
          score => (

            <button
              key={score}
              type="button"
              className={
                value === score
                  ? "selected"
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

    </div>
  );
}


export default function WingPathPage({
  onBack,
  onOpenUniverse,
  onStartBuild,
}: Props) {

  const wingId =
    readWing();


  const meta =
    wingId
      ? WINGS[
          wingId
        ]
      : null;


  const prefix =
    wingId
      ? `altwing-wing-path-v1:${wingId}`
      : "";


  const startedKey =
    `${prefix}:try`;

  const buildKey =
    wingId
      ? `altwing-wing-path-build-v1:${wingId}`
      : "";

  const proofKey =
    wingId
      ? `altwing-wing-path-proof-v1:${wingId}`
      : "";

  const launchKey =
    `${prefix}:launch`;

  const feedbackKey =
    `${prefix}:feedback`;

  const feedbackOpenedKey =
    `${prefix}:feedback-opened`;

  const nameKey =
    `${prefix}:certificate-name`;


  const [
    started,
    setStarted,
  ] =
    useState(
      () =>
        flag(
          startedKey,
        ),
    );


  const [
    nextStep,
    setNextStep,
  ] =
    useState<
      NextStep | null
    >(
      () => {

        const saved =
          localStorage.getItem(
            launchKey,
          );


        return (
          saved === "compete" ||
          saved === "build" ||
          saved === "college"
        )
          ? saved
          : null;
      },
    );


  const [
    understanding,
    setUnderstanding,
  ] =
    useState<
      Score | null
    >(
      null,
    );


  const [
    fit,
    setFit,
  ] =
    useState<
      Score | null
    >(
      null,
    );


  const [
    action,
    setAction,
  ] =
    useState<
      Score | null
    >(
      null,
    );


  const [
    reflection,
    setReflection,
  ] =
    useState("");


  const [
    feedbackSubmitted,
    setFeedbackSubmitted,
  ] =
    useState(
      () =>
        Boolean(
          localStorage.getItem(
            feedbackKey,
          ),
        ),
    );


  const [
    certificateName,
    setCertificateName,
  ] =
    useState(
      () =>
        localStorage.getItem(
          nameKey,
        ) ?? "",
    );


  const proofSaved =
    flag(
      proofKey,
    );


  const buildComplete =
    flag(
      buildKey,
    ) ||
    proofSaved;


  const tryComplete =
    started ||
    buildComplete ||
    proofSaved;


  const launchComplete =
    Boolean(
      nextStep,
    );


  const completed =
    1 +
    (
      tryComplete
        ? 1
        : 0
    ) +
    (
      buildComplete
        ? 1
        : 0
    ) +
    (
      proofSaved
        ? 1
        : 0
    ) +
    (
      launchComplete
        ? 1
        : 0
    );


  const certificateEarned =
    proofSaved &&
    launchComplete;


  useEffect(
    () => {

      if (
        !wingId ||
        !meta
      ) {
        return;
      }


      awardCosmicPack(
        `path:${wingId}:discover`,
        "MISSION",
        `${meta.short} Path · Discover`,
      );

    },
    [
      wingId,
      meta,
    ],
  );


  useEffect(
    () => {

      if (
        !certificateEarned ||
        !wingId ||
        feedbackSubmitted
      ) {
        return;
      }


      if (
        localStorage.getItem(
          feedbackOpenedKey,
        )
      ) {
        return;
      }


      localStorage.setItem(
        feedbackOpenedKey,
        "1",
      );


      if (
        isPostHogConfigured
      ) {

        posthog.capture(
          "path_feedback_opened",
          {
            wing_id:
              wingId,

            path_version:
              "v1",
          },
        );
      }

    },
    [
      certificateEarned,
      wingId,
      feedbackSubmitted,
      feedbackOpenedKey,
    ],
  );


  if (
    !wingId ||
    !meta
  ) {

    return (
      <main className="awpath-shell">

        <header className="awpath-nav">

          <button
            type="button"
            onClick={onBack}
          >
            ← HOME
          </button>

          <strong>
            Alt<span>Wing</span>
          </strong>

          <span />

        </header>


        <section className="awpath-empty">

          <span>
            NO WING SAVED
          </span>

          <h1>
            Find your Wing first.
          </h1>

          <p>
            WingMatch gives you a
            direction to test.
          </p>

          <button
            type="button"
            className="awpath-primary"
            onClick={onBack}
          >
            BACK HOME →
          </button>

        </section>

      </main>
    );
  }


  function startPath() {

    if (
      !wingId ||
      !meta
    ) {
      return;
    }


    if (!tryComplete) {

      localStorage.setItem(
        startedKey,
        "1",
      );

      setStarted(
        true,
      );


      awardCosmicPack(
        `path:${wingId}:try`,
        "MISSION",
        `${meta.short} Path · Try`,
      );


      if (
        isPostHogConfigured
      ) {

        posthog.capture(
          "wing_path_started",
          {
            wing_id:
              wingId,

            path_version:
              "v1",
          },
        );
      }
    }


    sessionStorage.setItem(
      "altwing-build-origin-v1",
      "path",
    );


    onStartBuild?.(
      wingId,
    );
  }


  function selectNext(
    choice:
      NextStep,
  ) {

    if (
      !wingId ||
      !meta ||
      !proofSaved
    ) {
      return;
    }


    localStorage.setItem(
      launchKey,
      choice,
    );


    setNextStep(
      choice,
    );


    awardCosmicPack(
      `path:${wingId}:launch`,
      "MISSION",
      `${meta.short} Path · Launch`,
    );


    if (
      isPostHogConfigured
    ) {

      posthog.capture(
        "path_next_step_selected",
        {
          wing_id:
            wingId,

          next_step:
            choice,

          path_version:
            "v1",
        },
      );


      posthog.capture(
        "wing_path_completed",
        {
          wing_id:
            wingId,

          next_step:
            choice,

          path_version:
            "v1",
        },
      );
    }


    window.setTimeout(
      () =>
        document
          .getElementById(
            "awpath-certificate",
          )
          ?.scrollIntoView({
            behavior: preferredScrollBehavior(),

            block:
              "start",
          }),
      120,
    );
  }


  function submitFeedback(
    event:
      FormEvent<
        HTMLFormElement
      >,
  ) {

    event.preventDefault();


    if (
      !wingId ||
      !understanding ||
      !fit ||
      !action
    ) {
      return;
    }


    const cleanReflection =
      reflection
        .trim()
        .slice(
          0,
          800,
        );


    const average =
      Number(
        (
          (
            understanding +
            fit +
            action
          ) /
          3
        ).toFixed(
          2,
        ),
      );


    const payload = {
      wing_id:
        wingId,

      path_version:
        "v1",

      understanding_score:
        understanding,

      fit_score:
        fit,

      next_step_score:
        action,

      average_score:
        average,

      reflection_provided:
        cleanReflection.length >
        0,

      reflection_text:
        cleanReflection ||
        null,

      selected_next_step:
        nextStep,
    };


    localStorage.setItem(
      feedbackKey,
      JSON.stringify(
        payload,
      ),
    );


    if (
      isPostHogConfigured
    ) {

      posthog.capture(
        "path_feedback_submitted",
        payload,
      );
    }


    setFeedbackSubmitted(
      true,
    );
  }


  const steps = [
    {
      code:
        "DISCOVER",

      title:
        "Find a direction worth testing.",

      description:
        "WingMatch gave you a direction — not a permanent label.",

      done:
        true,
    },

    {
      code:
        "TRY",

      title:
        "Enter the work.",

      description:
        "Start the engineering experience and make an initial prediction.",

      done:
        tryComplete,
    },

    {
      code:
        "BUILD",

      title:
        "Test and compare evidence.",

      description:
        "Run the model and compare what happened with what you expected.",

      done:
        buildComplete,
    },

    {
      code:
        "PROVE",

      title:
        "Revise, defend, and save Proof of Flight.",

      description:
        "Turn your reasoning into evidence you can explain later.",

      done:
        proofSaved,
    },

    {
      code:
        "LAUNCH",

      title:
        "Choose a real next step.",

      description:
        "Connect what you learned to a competition, project, or college program.",

      done:
        launchComplete,
    },
  ];


  const coach =
    !tryComplete
      ? {
          title:
            "You do not need to be good at this yet.",

          body:
            "Your first job is to find out whether you enjoy the thinking. Start the Path and make one engineering decision at a time.",
        }
      : !buildComplete
        ? {
            title:
              "Let the evidence disagree with you.",

            body:
              "A useful experiment can prove your first prediction wrong. That is information, not failure.",
          }
        : !proofSaved
          ? {
              title:
                "Now make the learning visible.",

              body:
                "Revise your first idea, defend your final choice, and save Proof of Flight.",
            }
          : !launchComplete
            ? {
                title:
                  "A Path matters when it changes what you do next.",

                body:
                  "Pick one direction. A focused next step is stronger than collecting ten random activities.",
              }
            : {
                title:
                  "You finished the Path.",

                body:
                  "Keep the proof, the reflection, and the next action. Those are more meaningful than the badge by itself.",
              };


  const primaryLabel =
    !proofSaved
      ? (
          tryComplete
            ? `CONTINUE MY ${meta.short} PATH`
            : `START MY ${meta.short} PATH`
        )
      : !launchComplete
        ? "CHOOSE MY NEXT STEP"
        : "VIEW MY CERTIFICATE";


  function primaryAction() {

    if (!proofSaved) {

      startPath();

      return;
    }


    const target =
      launchComplete
        ? "awpath-certificate"
        : "awpath-next-step";


    document
      .getElementById(
        target,
      )
      ?.scrollIntoView({
        behavior: preferredScrollBehavior(),

        block:
          "start",
      });
  }


  return (
    <main className="awpath-shell">

      <header className="awpath-nav">

        <button
          type="button"
          onClick={onBack}
        >
          ← HOME
        </button>


        <strong>
          Alt<span>Wing</span>
        </strong>


        <button
          type="button"
          disabled={
            !onOpenUniverse
          }
          onClick={
            onOpenUniverse
          }
        >
          MY UNIVERSE →
        </button>

      </header>


      <div className="awpath-wrap">

        <section className="awpath-hero">

          <div>

            <span className="awpath-eyebrow">
              {meta.short} PATH
            </span>

            <h1>
              {meta.headline}
            </h1>

            <p>
              {meta.description}
            </p>

          </div>


          <aside className="awpath-progress">

            <span>
              PATH PROGRESS
            </span>

            <strong>
              {completed} / 5
            </strong>

            <div>
              <i
                style={{
                  width:
                    `${(
                      completed /
                      5
                    ) * 100}%`,
                }}
              />
            </div>

            <small>
              Discover · Try · Build ·
              Prove · Launch
            </small>

          </aside>

        </section>


        <section className="awpath-action">

          <div className="awpath-discovered">

            <div>
              <span>
                DISCOVER COMPLETE ✓
              </span>

              <strong>
                You found a Wing worth testing.
              </strong>
            </div>

            <small>
              COSMIC PACK EARNED
            </small>

          </div>


          <button
            type="button"
            className="awpath-primary"
            onClick={
              primaryAction
            }
          >
            <span>
              {primaryLabel}
            </span>

            <b>
              →
            </b>
          </button>

        </section>


        <section className="awpath-coach">

          <img
            src="/brand/altwing-penguin.png"
            alt=""
          />

          <div>

            <span>
              MISSION COACH
            </span>

            <h2>
              {coach.title}
            </h2>

            <p>
              {coach.body}
            </p>

          </div>

        </section>


        <section className="awpath-steps">

          {steps.map(
            (
              step,
              index,
            ) => {

              const previousDone =
                index === 0 ||
                steps[
                  index - 1
                ].done;

              const current =
                !step.done &&
                previousDone;


              return (
                <article
                  key={
                    step.code
                  }
                  className={[
                    "awpath-step",

                    step.done
                      ? "complete"
                      : "",

                    current
                      ? "current"
                      : "",

                    !step.done &&
                    !current
                      ? "locked"
                      : "",
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      " ",
                    )}
                >

                  <b>
                    {
                      String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )
                    }
                  </b>


                  <div>

                    <span>
                      {step.code}
                    </span>

                    <h3>
                      {step.title}
                    </h3>

                    <p>
                      {step.description}
                    </p>

                  </div>


                  <strong>
                    {
                      step.done
                        ? "COMPLETE ✓"
                        : current
                          ? "CURRENT"
                          : "LOCKED"
                    }
                  </strong>

                </article>
              );
            },
          )}

        </section>


        <section className="awpath-rewards">

          <div>

            <span>
              COSMIC REWARDS
            </span>

            <strong>
              Every Path milestone earns
              something.
            </strong>

            <p>
              Open it now or keep it in
              My Universe.
            </p>

          </div>


          <PackReadyBanner />

        </section>


        {proofSaved && (

          <section
            id="awpath-next-step"
            className="awpath-next"
          >

            <header>

              <span>
                LAUNCH · 05
              </span>

              <h2>
                What should you do next?
              </h2>

              <p>
                Pick one direction. You do
                not need to do all three.
              </p>

            </header>


            <div className="awpath-next-grid">

              <article
                className={
                  nextStep ===
                  "compete"
                    ? "selected"
                    : ""
                }
              >

                <span>
                  COMPETE
                </span>

                <h3>
                  Put the skill under a real
                  deadline.
                </h3>

                <p>
                  Use a team, rules, testing,
                  and an outside audience to
                  push the work further.
                </p>


                <div className="awpath-resource-list">

                  {meta.competitions.map(
                    item => (

                      <a
                        key={
                          item.name
                        }
                        href={
                          item.url
                        }
                        target="_blank"
                        rel="noreferrer"
                      >

                        <small>
                          {item.source}
                        </small>

                        <strong>
                          {item.name}
                        </strong>

                        <p>
                          {item.why}
                        </p>

                        <b>
                          OFFICIAL INFO ↗
                        </b>

                      </a>

                    ),
                  )}

                </div>


                <button
                  type="button"
                  onClick={() =>
                    selectNext(
                      "compete",
                    )
                  }
                >
                  CHOOSE COMPETE →
                </button>

              </article>


              <article
                className={
                  nextStep ===
                  "build"
                    ? "selected"
                    : ""
                }
              >

                <span>
                  BUILD
                </span>

                <h3>
                  Turn one idea into your
                  own project.
                </h3>

                <p>
                  Go beyond the guided Path
                  and create something you
                  can test and improve.
                </p>


                <div className="awpath-project">

                  <small>
                    PROJECT STARTER
                  </small>

                  <strong>
                    {meta.projectTitle}
                  </strong>

                  <p>
                    {meta.projectBody}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    selectNext(
                      "build",
                    )
                  }
                >
                  CHOOSE BUILD →
                </button>

              </article>


              <article
                className={
                  nextStep ===
                  "college"
                    ? "selected"
                    : ""
                }
              >

                <span>
                  COLLEGE
                </span>

                <h3>
                  Find where this work lives
                  in real programs.
                </h3>

                <p>
                  These are research
                  starting points — not
                  admission predictions.
                </p>


                <div className="awpath-resource-list">

                  {COLLEGES.map(
                    item => (

                      <a
                        key={
                          item.name
                        }
                        href={
                          item.url
                        }
                        target="_blank"
                        rel="noreferrer"
                      >

                        <small>
                          {item.name}
                        </small>

                        <strong>
                          {item.source}
                        </strong>

                        <p>
                          {item.why}
                        </p>

                        <b>
                          VIEW CURRICULUM ↗
                        </b>

                      </a>

                    ),
                  )}

                </div>


                <button
                  type="button"
                  onClick={() =>
                    selectNext(
                      "college",
                    )
                  }
                >
                  CHOOSE COLLEGE RESEARCH →
                </button>

              </article>

            </div>


            {nextStep && (

              <div className="awpath-launch-complete">

                <span>
                  LAUNCH COMPLETE ✓
                </span>

                <strong>
                  You chose one real next
                  step.
                </strong>

                <p>
                  Focused action beats a
                  random list of activities.
                </p>

              </div>

            )}

          </section>

        )}


        {certificateEarned && (

          <section
            id="awpath-certificate"
            className="awpath-cert-section"
          >

            <header>

              <span>
                PATH COMPLETE
              </span>

              <h2>
                Keep the proof.
              </h2>

              <p>
                This records completion of
                a foundations experience.
                It does not claim
                professional mastery.
              </p>

            </header>


            <div className="awpath-certificate">

              <div className="awpath-cert-top">

                <strong>
                  Alt<span>Wing</span>
                </strong>

                <small>
                  FOUNDATIONS CERTIFICATE
                </small>

              </div>


              <p>
                CERTIFICATE OF COMPLETION
              </p>


              <h2>
                {meta.name}
                <br />
                Foundations
              </h2>


              <label>

                <span>
                  PRESENTED TO
                </span>

                <input
                  value={
                    certificateName
                  }
                  maxLength={
                    80
                  }
                  placeholder="Your name"
                  onChange={
                    event => {

                      const value =
                        event.target
                          .value;

                      setCertificateName(
                        value,
                      );

                      localStorage
                        .setItem(
                          nameKey,
                          value,
                        );
                    }
                  }
                />

              </label>


              <p className="awpath-cert-body">
                Completed an evidence-based
                aerospace exploration Path:
                predicted, tested, compared
                evidence, revised a decision,
                defended reasoning, created
                Proof of Flight, and selected
                a real next step.
              </p>


              <div className="awpath-skills">

                {meta.skills.map(
                  skill => (

                    <span
                      key={
                        skill
                      }
                    >
                      {skill}
                    </span>

                  ),
                )}

              </div>


              <footer>

                <div>
                  <span>
                    WING
                  </span>

                  <strong>
                    {meta.short}
                  </strong>
                </div>

                <div>
                  <span>
                    PATH
                  </span>

                  <strong>
                    5 / 5 COMPLETE
                  </strong>
                </div>

                <div>
                  <span>
                    EVIDENCE
                  </span>

                  <strong>
                    PROOF OF FLIGHT
                  </strong>
                </div>

              </footer>

            </div>


            <div className="awpath-cert-actions">

              <button
                type="button"
                className="awpath-primary"
                onClick={() =>
                  window.print()
                }
              >
                PRINT / SAVE PDF →
              </button>


              {onOpenUniverse && (

                <button
                  type="button"
                  className="awpath-secondary"
                  onClick={
                    onOpenUniverse
                  }
                >
                  OPEN MY UNIVERSE
                </button>

              )}

            </div>

          </section>

        )}


        {certificateEarned && (

          <section className="awpath-evidence">

            <span>
              YOUR EVIDENCE KIT
            </span>

            <h2>
              What did you actually do?
            </h2>

            <p>
              If you ever describe this
              experience in an application,
              interview, club, or portfolio,
              talk about the work — not just
              the certificate.
            </p>


            <div>

              <article>
                <b>
                  01 · QUESTION
                </b>

                <p>
                  You investigated a
                  simplified
                  {
                    " "
                  }
                  {meta.name}
                  {
                    " "
                  }
                  engineering problem.
                </p>
              </article>


              <article>
                <b>
                  02 · PROCESS
                </b>

                <p>
                  You predicted, tested,
                  compared evidence, revised,
                  and defended a decision.
                </p>
              </article>


              <article>
                <b>
                  03 · PROOF
                </b>

                <p>
                  You created Proof of Flight
                  showing the reasoning behind
                  your final result.
                </p>
              </article>


              <article>
                <b>
                  04 · ACTION
                </b>

                <p>
                  You chose
                  {
                    " "
                  }
                  <strong>
                    {nextStep}
                  </strong>
                  {
                    " "
                  }
                  as your next direction.
                </p>
              </article>

            </div>

          </section>

        )}


        {certificateEarned && (

          <section className="awpath-feedback">

            <header>

              <span>
                HOW WAS THIS PATH?
              </span>

              <h2>
                Help make the next Path
                better.
              </h2>

              <p>
                Three quick ratings and one
                optional reflection.
              </p>

            </header>


            {feedbackSubmitted
              ? (

                <div className="awpath-thanks">

                  <span>
                    FEEDBACK SAVED ✓
                  </span>

                  <h3>
                    Thank you.
                  </h3>

                  <p>
                    This gives AltWing real
                    evidence about whether the
                    experience is helping
                    students understand,
                    explore, and act.
                  </p>

                </div>

              )
              : (

                <form
                  onSubmit={
                    submitFeedback
                  }
                >

                  <Rating
                    label={`I understand what ${meta.name} engineers actually do.`}
                    value={
                      understanding
                    }
                    onChange={
                      setUnderstanding
                    }
                  />


                  <Rating
                    label={`This Path helped me test whether ${meta.name} fits me.`}
                    value={
                      fit
                    }
                    onChange={
                      setFit
                    }
                  />


                  <Rating
                    label="I know what I could do next."
                    value={
                      action
                    }
                    onChange={
                      setAction
                    }
                  />


                  <label className="awpath-reflection">

                    <span>
                      What changed your thinking
                      the most?
                      {
                        " "
                      }
                      <small>
                        OPTIONAL
                      </small>
                    </span>

                    <textarea
                      value={
                        reflection
                      }
                      maxLength={
                        800
                      }
                      placeholder="A result, tradeoff, surprise, or moment that changed your thinking..."
                      onChange={
                        event =>
                          setReflection(
                            event.target
                              .value,
                          )
                      }
                    />

                  </label>


                  <button
                    className="awpath-primary"
                    type="submit"
                    disabled={
                      !understanding ||
                      !fit ||
                      !action
                    }
                  >
                    SUBMIT FEEDBACK →
                  </button>

                </form>

              )}

          </section>

        )}

      </div>

    </main>
  );
}
