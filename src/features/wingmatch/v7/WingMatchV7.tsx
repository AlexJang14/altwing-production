import {
  useEffect,
  useMemo,
  useState,
} from "react";

import MissionVisual from "../v6/MissionVisual";
import posthog, {
  isPostHogConfigured,
} from "../../../posthog";
import {
  posthogLog,
} from "../../../posthog-logs";
import "./wingmatch-v7.css";


interface WingMatchV7Props {
  onExit: () => void;
}


type WingId =
  | "gnc"
  | "avionics"
  | "structures"
  | "thermal"
  | "propulsion"
  | "mission-design";


interface Wing {
  id: WingId;
  short: string;
  name: string;
  description: string;
}


interface MissionOption {
  id: string;
  title: string;
  description: string;
  consequence: string;

  scores:
    Partial<
      Record<
        WingId,
        number
      >
    >;
}


interface MissionScene {
  id: string;
  chapter: string;
  phase: string;
  situation: string;
  question: string;
  options: MissionOption[];
}


type WingMatchCinematicKind =
  | "heat"
  | "signal"
  | "fuel"
  | "stress"
  | "avionics"
  | "trajectory"
  | "final"
  | "mission";




type Ares7VehicleMode =
  | "entry"
  | "descent"
  | "landing";


function Ares7Vehicle({
  mode,
  engines = false,
  legs = false,
  hot = false,
  className = "",
}: {
  mode: Ares7VehicleMode;
  engines?: boolean;
  legs?: boolean;
  hot?: boolean;
  className?: string;
}) {

  return (
    <div
      className={
        `awv7-v3-vehicle awv7-v3-vehicle-${mode} ${className}`
      }
      aria-hidden="true"
    >

      <svg
        viewBox="0 0 160 320"
        role="presentation"
      >

        <defs>

          <linearGradient
            id="ares7Metal"
            x1="0"
            x2="1"
          >
            <stop
              offset="0%"
              stopColor="#687383"
            />

            <stop
              offset="18%"
              stopColor="#dce3e8"
            />

            <stop
              offset="43%"
              stopColor="#f5f7f8"
            />

            <stop
              offset="68%"
              stopColor="#9da8b2"
            />

            <stop
              offset="100%"
              stopColor="#4b5562"
            />
          </linearGradient>


          <linearGradient
            id="ares7DarkMetal"
            x1="0"
            x2="1"
          >
            <stop
              offset="0%"
              stopColor="#202936"
            />

            <stop
              offset="50%"
              stopColor="#65717e"
            />

            <stop
              offset="100%"
              stopColor="#151c26"
            />
          </linearGradient>


          <linearGradient
            id="ares7Heat"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#fff5b3"
            />

            <stop
              offset="32%"
              stopColor="#ff9b36"
            />

            <stop
              offset="68%"
              stopColor="#ff4b27"
            />

            <stop
              offset="100%"
              stopColor="#8a1420"
              stopOpacity="0"
            />
          </linearGradient>


          <linearGradient
            id="ares7Plume"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#ffffff"
            />

            <stop
              offset="14%"
              stopColor="#b7dcff"
            />

            <stop
              offset="42%"
              stopColor="#ffd06b"
            />

            <stop
              offset="72%"
              stopColor="#ff7a25"
            />

            <stop
              offset="100%"
              stopColor="#ff4721"
              stopOpacity="0"
            />
          </linearGradient>


          <filter
            id="ares7Glow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >

            <feGaussianBlur
              stdDeviation="7"
              result="blur"
            />

            <feMerge>
              <feMergeNode
                in="blur"
              />

              <feMergeNode
                in="SourceGraphic"
              />
            </feMerge>

          </filter>

        </defs>


        {hot && (
          <g
            className="awv7-v3-plasma"
            filter="url(#ares7Glow)"
          >

            <path
              d="
                M80 3
                C29 30 14 90 21 160
                C26 222 44 264 80 286
                C116 264 134 222 139 160
                C146 90 131 30 80 3
                Z
              "
              fill="none"
              stroke="#ff7840"
              strokeWidth="10"
              opacity=".46"
            />

            <path
              d="
                M38 78
                C9 128 9 221 49 298
                C23 244 11 173 22 109
                Z
              "
              fill="url(#ares7Heat)"
              opacity=".62"
            />

            <path
              d="
                M122 78
                C151 128 151 221 111 298
                C137 244 149 173 138 109
                Z
              "
              fill="url(#ares7Heat)"
              opacity=".58"
            />

          </g>
        )}


        {/* AEROSPACE BODY */}

        <path
          className="awv7-v3-body"
          d="
            M80 10
            C62 20 51 38 48 61
            L42 204
            C41 228 48 248 60 259
            L100 259
            C112 248 119 228 118 204
            L112 61
            C109 38 98 20 80 10
            Z
          "
          fill="url(#ares7Metal)"
          stroke="#eef3f7"
          strokeWidth="1.6"
        />


        {/* NOSE CERAMIC / SENSOR SECTION */}

        <path
          d="
            M80 10
            C63 21 54 39 51 60
            C65 54 95 54 109 60
            C106 39 97 21 80 10
            Z
          "
          fill="#dce3e8"
          opacity=".9"
        />


        {/* FORWARD FLAPS */}

        <path
          className="awv7-v3-flap awv7-v3-flap-forward-left"
          d="
            M49 77
            L18 96
            L15 119
            L48 110
            Z
          "
          fill="url(#ares7DarkMetal)"
          stroke="#9aa8b6"
        />

        <path
          className="awv7-v3-flap awv7-v3-flap-forward-right"
          d="
            M111 77
            L142 96
            L145 119
            L112 110
            Z
          "
          fill="url(#ares7DarkMetal)"
          stroke="#9aa8b6"
        />


        {/* AFT FLAPS */}

        <path
          className="awv7-v3-flap awv7-v3-flap-aft-left"
          d="
            M44 182
            L11 218
            L18 252
            L55 230
            Z
          "
          fill="url(#ares7DarkMetal)"
          stroke="#909eac"
        />

        <path
          className="awv7-v3-flap awv7-v3-flap-aft-right"
          d="
            M116 182
            L149 218
            L142 252
            L105 230
            Z
          "
          fill="url(#ares7DarkMetal)"
          stroke="#909eac"
        />


        {/* PANEL RINGS */}

        <path
          d="M47 91 C64 96 96 96 113 91"
          fill="none"
          stroke="#697683"
          strokeWidth="1"
          opacity=".7"
        />

        <path
          d="M44 139 C63 145 97 145 116 139"
          fill="none"
          stroke="#697683"
          strokeWidth="1"
          opacity=".62"
        />

        <path
          d="M43 190 C62 197 98 197 117 190"
          fill="none"
          stroke="#697683"
          strokeWidth="1"
          opacity=".62"
        />


        {/* CENTER PANEL SEAM */}

        <path
          d="M80 42 L80 239"
          fill="none"
          stroke="#ffffff"
          strokeWidth=".7"
          opacity=".28"
        />


        {/* SENSOR PORTS */}

        <circle
          cx="63"
          cy="69"
          r="3.1"
          fill="#0b1b2c"
          stroke="#79c5ff"
          strokeWidth="1"
        />

        <circle
          cx="97"
          cy="69"
          r="3.1"
          fill="#0b1b2c"
          stroke="#79c5ff"
          strokeWidth="1"
        />


        {/* RCS PORTS */}

        <g
          fill="#212936"
          stroke="#b6c1ca"
          strokeWidth=".6"
        >

          <circle
            cx="48"
            cy="129"
            r="2.5"
          />

          <circle
            cx="112"
            cy="129"
            r="2.5"
          />

          <circle
            cx="47"
            cy="157"
            r="2.5"
          />

          <circle
            cx="113"
            cy="157"
            r="2.5"
          />

        </g>


        {/* VEHICLE MARKING */}

        <text
          x="80"
          y="121"
          textAnchor="middle"
          fill="#26313d"
          fontSize="8"
          fontWeight="900"
          letterSpacing="1.4"
        >
          ARES-7
        </text>

        <text
          x="80"
          y="132"
          textAnchor="middle"
          fill="#4b5661"
          fontSize="4.6"
          fontWeight="700"
          letterSpacing=".8"
        >
          MARS LANDER
        </text>


        {/* ENGINE SKIRT */}

        <path
          d="
            M58 249
            L102 249
            L108 269
            C95 276 65 276 52 269
            Z
          "
          fill="url(#ares7DarkMetal)"
          stroke="#9ca8b3"
          strokeWidth="1"
        />


        {/* ENGINE BELLS */}

        <g
          className="awv7-v3-engine-cluster"
        >

          <path
            d="
              M58 263
              C55 272 53 281 52 289
              C57 293 66 293 71 289
              C70 281 68 272 66 263
              Z
            "
            fill="#151b23"
            stroke="#87929d"
          />

          <path
            d="
              M75 262
              C72 273 70 284 70 293
              C76 297 84 297 90 293
              C90 284 88 273 85 262
              Z
            "
            fill="#111820"
            stroke="#9aa5af"
          />

          <path
            d="
              M94 263
              C92 272 90 281 89 289
              C94 293 103 293 108 289
              C107 281 105 272 102 263
              Z
            "
            fill="#151b23"
            stroke="#87929d"
          />

        </g>


        {legs && (
          <g
            className="awv7-v3-landing-legs"
          >

            <path
              d="
                M55 225
                L30 280
                L23 294
              "
              fill="none"
              stroke="#bac5cf"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <path
              d="
                M105 225
                L130 280
                L137 294
              "
              fill="none"
              stroke="#bac5cf"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <ellipse
              cx="21"
              cy="297"
              rx="13"
              ry="4"
              fill="#909ca7"
            />

            <ellipse
              cx="139"
              cy="297"
              rx="13"
              ry="4"
              fill="#909ca7"
            />

          </g>
        )}


        {engines && (
          <g
            className="awv7-v3-engine-plumes"
            filter="url(#ares7Glow)"
          >

            <path
              d="
                M53 287
                C49 304 52 313 61 319
                C70 311 70 302 66 287
                Z
              "
              fill="url(#ares7Plume)"
            />

            <path
              d="
                M71 291
                C68 309 72 318 80 320
                C88 318 92 309 89 291
                Z
              "
              fill="url(#ares7Plume)"
            />

            <path
              d="
                M94 287
                C90 302 90 311 99 319
                C108 313 111 304 107 287
                Z
              "
              fill="url(#ares7Plume)"
            />

          </g>
        )}

      </svg>

    </div>
  );
}



function Ares7VehicleLabel({
  phase,
}: {
  phase: string;
}) {

  return (
    <div
      className="awv7-v3-vehicle-label"
    >

      <span>
        ARES-7 MARS LANDER
      </span>

      <b>
        {phase}
      </b>

    </div>
  );
}



function GuidedEntryScienceVisual() {

  return (
    <div
      className="awv7-v3-stage awv7-v3-entry"
      aria-hidden="true"
    >

      <div className="awv7-v3-disclosure">
        FICTIONAL VEHICLE · SIMULATED TELEMETRY
      </div>


      <Ares7VehicleLabel
        phase="GUIDED ENTRY"
      />


      <svg
        className="awv7-v3-trajectory"
        viewBox="0 0 700 420"
        preserveAspectRatio="none"
      >

        <path
          className="reference"
          d="
            M675 27
            C590 60
             510 118
             446 185
            C390 244
             341 305
             307 370
          "
        />

        <path
          className="actual"
          d="
            M675 27
            C609 64
             556 119
             501 176
            C449 230
             410 274
             363 326
          "
        />

      </svg>


      <Ares7Vehicle
        mode="entry"
        hot
        className="awv7-v3-entry-vehicle"
      />


      <div className="awv7-v3-bank-vector">
        BANK CORRECTION
        <strong>
          ↶
        </strong>
      </div>


      <div className="awv7-v3-hud left">

        <div>
          <span>
            ENTRY VELOCITY
          </span>

          <b>
            5.5 km/s
          </b>
        </div>

        <div>
          <span>
            HEAT FLUX
          </span>

          <b className="warn">
            1.18× PRED
          </b>
        </div>

        <div>
          <span>
            DOWNRANGE ERROR
          </span>

          <b>
            +4.2 km
          </b>
        </div>

      </div>


      <div className="awv7-v3-mars" />

      <div className="awv7-v3-phase-chip">
        GUIDANCE CORRECTION ACTIVE
      </div>

    </div>
  );
}



function RangeTriggerScienceVisual() {

  return (
    <div
      className="awv7-v3-stage awv7-v3-range"
      aria-hidden="true"
    >

      <div className="awv7-v3-disclosure">
        FICTIONAL VEHICLE · SIMULATED TELEMETRY
      </div>


      <Ares7VehicleLabel
        phase="PARACHUTE RANGE TRIGGER"
      />


      <svg
        className="awv7-v3-parachute"
        viewBox="0 0 300 190"
      >

        <path
          className="canopy"
          d="
            M20 104
            C24 38
             75 10
             150 10
            C225 10
             276 38
             280 104
            C247 79
             208 67
             150 66
            C92 67
             53 79
             20 104
            Z
          "
        />


        <path
          d="M55 83 C82 41 111 28 150 26"
          className="panel"
        />

        <path
          d="M101 70 C115 39 132 27 150 26"
          className="panel"
        />

        <path
          d="M199 70 C185 39 168 27 150 26"
          className="panel"
        />

        <path
          d="M245 83 C218 41 189 28 150 26"
          className="panel"
        />


        <path
          d="M55 83 L129 177"
          className="line"
        />

        <path
          d="M103 69 L142 177"
          className="line"
        />

        <path
          d="M197 69 L158 177"
          className="line"
        />

        <path
          d="M245 83 L171 177"
          className="line"
        />

      </svg>


      <Ares7Vehicle
        mode="descent"
        className="awv7-v3-range-vehicle"
      />


      <div className="awv7-v3-hud left">

        <div>
          <span>
            ALTITUDE
          </span>

          <b>
            11.0 km
          </b>
        </div>

        <div>
          <span>
            VELOCITY
          </span>

          <b>
            420 m/s
          </b>
        </div>

        <div>
          <span>
            RANGE TRIGGER
          </span>

          <b className="good">
            ARMED
          </b>
        </div>

      </div>


      <div className="awv7-v3-mars" />

      <div className="awv7-v3-phase-chip">
        SUPERSONIC PARACHUTE DEPLOY
      </div>

    </div>
  );
}



function NavigationAcquisitionScienceVisual() {

  return (
    <div
      className="awv7-v3-stage awv7-v3-nav"
      aria-hidden="true"
    >

      <div className="awv7-v3-disclosure">
        FICTIONAL VEHICLE · SIMULATED TELEMETRY
      </div>


      <Ares7VehicleLabel
        phase="NAVIGATION ACQUISITION"
      />


      <Ares7Vehicle
        mode="descent"
        className="awv7-v3-nav-vehicle"
      />


      <div className="awv7-v3-heatshield">
        <div>
          HEAT SHIELD
        </div>
      </div>


      <div className="awv7-v3-scan-cone" />


      <div className="awv7-v3-terrain-grid">

        <i className="crater c1" />
        <i className="crater c2" />
        <i className="crater c3" />

        <i className="match m1" />
        <i className="match m2" />

      </div>


      <div className="awv7-v3-hud left">

        <div>
          <span>
            RADAR
          </span>

          <b className="good">
            VALID
          </b>
        </div>

        <div>
          <span>
            IMU
          </span>

          <b className="good">
            PROPAGATING
          </b>
        </div>

        <div>
          <span>
            VISION
          </span>

          <b className="warn">
            62% CONF
          </b>
        </div>

      </div>


      <div className="awv7-v3-phase-chip">
        MAP-RELATIVE STATE ACQUIRING
      </div>

    </div>
  );
}



function TerrainRelativeNavigationScienceVisual() {

  return (
    <div
      className="awv7-v3-stage awv7-v3-trn"
      aria-hidden="true"
    >

      <div className="awv7-v3-disclosure">
        ARES-7 · SIMULATED TERRAIN MAP
      </div>


      <Ares7VehicleLabel
        phase="TERRAIN-RELATIVE NAVIGATION"
      />


      <Ares7Vehicle
        mode="descent"
        className="awv7-v3-trn-vehicle"
      />


      <div className="awv7-v3-map">

        <div className="awv7-v3-hazard rocks">
          ROCK FIELD
        </div>

        <div className="awv7-v3-hazard slope">
          STEEP SLOPE
        </div>


        <div className="awv7-v3-footprint" />


        <div className="awv7-v3-target target-a">
          A
        </div>

        <div className="awv7-v3-target target-b">
          B
        </div>

        <div className="awv7-v3-target target-c">
          C
        </div>


        <div className="awv7-v3-map-crosshair">
          TARGET C
        </div>

      </div>


      <div className="awv7-v3-phase-chip">
        SAFE + REACHABLE TARGET LOCKED
      </div>

    </div>
  );
}



function PoweredDescentScienceVisual() {

  return (
    <div
      className="awv7-v3-stage awv7-v3-powered"
      aria-hidden="true"
    >

      <div className="awv7-v3-disclosure">
        FICTIONAL VEHICLE · SIMULATED TELEMETRY
      </div>


      <Ares7VehicleLabel
        phase="POWERED DESCENT"
      />


      <div className="awv7-v3-backshell">
        BACKSHELL
      </div>


      <Ares7Vehicle
        mode="descent"
        engines
        className="awv7-v3-powered-vehicle"
      />


      <div className="awv7-v3-hud left">

        <div>
          <span>
            ALTITUDE
          </span>

          <b>
            2.1 km
          </b>
        </div>

        <div>
          <span>
            SPEED
          </span>

          <b>
            85 m/s
          </b>
        </div>

        <div>
          <span>
            ENGINE CLUSTER
          </span>

          <b className="good">
            ACTIVE
          </b>
        </div>

      </div>


      <div className="awv7-v3-mars close" />

      <div className="awv7-v3-phase-chip">
        LANDING BURN ACTIVE
      </div>

    </div>
  );
}



function FaultManagementScienceVisual() {

  return (
    <div
      className="awv7-v3-stage awv7-v3-fault"
      aria-hidden="true"
    >

      <div className="awv7-v3-disclosure">
        ARES-7 AUTONOMOUS FAULT MANAGEMENT
      </div>


      <Ares7VehicleLabel
        phase="FAULT MANAGEMENT"
      />


      <Ares7Vehicle
        mode="descent"
        engines
        className="awv7-v3-fault-vehicle"
      />


      <div className="awv7-v3-sensor-orbit radar">
        <span>
          RADAR CH-2
        </span>

        <b>
          OUTLIERS
        </b>
      </div>


      <div className="awv7-v3-sensor-orbit imu">
        <span>
          IMU
        </span>

        <b>
          VALID
        </b>
      </div>


      <div className="awv7-v3-sensor-orbit vision">
        <span>
          VISION
        </span>

        <b>
          VALID
        </b>
      </div>


      <div className="awv7-v3-state-estimator">
        STATE ESTIMATOR
        <small>
          RADAR WEIGHT ↓
        </small>
      </div>


      <div className="awv7-v3-phase-chip danger">
        SENSOR DISAGREEMENT
      </div>

    </div>
  );
}



function TerminalDescentScienceVisual() {

  return (
    <div
      className="awv7-v3-stage awv7-v3-terminal"
      aria-hidden="true"
    >

      <div className="awv7-v3-disclosure">
        FICTIONAL VEHICLE · SIMULATED TELEMETRY
      </div>


      <Ares7VehicleLabel
        phase="TERMINAL DESCENT"
      />


      <Ares7Vehicle
        mode="landing"
        engines
        legs
        className="awv7-v3-terminal-vehicle"
      />


      <div className="awv7-v3-vector horizontal">
        ← VX 1.1 m/s
      </div>

      <div className="awv7-v3-vector vertical">
        VZ 4.8 m/s ↓
      </div>


      <div className="awv7-v3-hud left">

        <div>
          <span>
            ALTITUDE
          </span>

          <b>
            48 m
          </b>
        </div>

        <div>
          <span>
            LOCAL SLOPE
          </span>

          <b>
            6°
          </b>
        </div>

        <div>
          <span>
            NAV STATE
          </span>

          <b className="good">
            VALID
          </b>
        </div>

      </div>


      <div className="awv7-v3-ground slope-ground" />

      <div className="awv7-v3-phase-chip">
        TERMINAL GUIDANCE ACTIVE
      </div>

    </div>
  );
}



function LandingCommitScienceVisual() {

  return (
    <div
      className="awv7-v3-stage awv7-v3-commit"
      aria-hidden="true"
    >

      <div className="awv7-v3-disclosure">
        FICTIONAL VEHICLE · SIMULATED TELEMETRY
      </div>


      <Ares7VehicleLabel
        phase="LANDING COMMIT"
      />


      <Ares7Vehicle
        mode="landing"
        engines
        legs
        className="awv7-v3-commit-vehicle"
      />


      <div className="awv7-v3-dust dust-one" />
      <div className="awv7-v3-dust dust-two" />


      <div className="awv7-v3-lock">
        <i />

        <span>
          TARGET LOCKED
        </span>
      </div>


      <div className="awv7-v3-hud left">

        <div>
          <span>
            ALTITUDE
          </span>

          <b>
            12 m
          </b>
        </div>

        <div>
          <span>
            DOWNWARD CAMERA
          </span>

          <b className="warn">
            DEGRADED
          </b>
        </div>

        <div>
          <span>
            RADAR + IMU
          </span>

          <b className="good">
            VALID
          </b>
        </div>

      </div>


      <div className="awv7-v3-ground" />

      <div className="awv7-v3-phase-chip final">
        FINAL AUTONOMOUS COMMIT
      </div>

    </div>
  );
}


function WingMatchComic({
  sceneIndex,
}: {
  sceneIndex: number;
}) {

  switch (sceneIndex) {

    case 0:
      return (
        <GuidedEntryScienceVisual />
      );

    case 1:
      return (
        <RangeTriggerScienceVisual />
      );

    case 2:
      return (
        <NavigationAcquisitionScienceVisual />
      );

    case 3:
      return (
        <TerrainRelativeNavigationScienceVisual />
      );

    case 4:
      return (
        <PoweredDescentScienceVisual />
      );

    case 5:
      return (
        <FaultManagementScienceVisual />
      );

    case 6:
      return (
        <TerminalDescentScienceVisual />
      );

    case 7:
      return (
        <LandingCommitScienceVisual />
      );

    default:
      return (
        <GuidedEntryScienceVisual />
      );
  }
}


function getWingMatchCinematicKind(
  scene: MissionScene,
  sceneIndex: number,
  sceneCount: number,
): WingMatchCinematicKind {

  if (
    sceneIndex ===
    sceneCount - 1
  ) {
    return "final";
  }


  const text =
    [
      scene.chapter,
      scene.phase,
      scene.situation,
      scene.question,
    ]
      .join(" ")
      .toLowerCase();


  if (
    /sensor|signal|altitude|reading|navigation|data|uncertainty/
      .test(text)
  ) {
    return "signal";
  }


  if (
    /fuel|propellant|engine|thrust|burn/
      .test(text)
  ) {
    return "fuel";
  }


  if (
    /thermal|heat|heating|temperature/
      .test(text)
  ) {
    return "heat";
  }


  if (
    /structur|stress|load|force|impact/
      .test(text)
  ) {
    return "stress";
  }


  if (
    /avionic|electronic|software|power|voltage|fault|circuit/
      .test(text)
  ) {
    return "avionics";
  }


  if (
    /trajectory|path|orbit|landing|corridor|target|route/
      .test(text)
  ) {
    return "trajectory";
  }


  return "mission";
}


function getWingMatchCinematicCue(
  kind: WingMatchCinematicKind,
) {

  const cues:
    Record<
      WingMatchCinematicKind,
      string
    > = {

      heat:
        "THERMAL ALERT",

      signal:
        "SIGNAL CONFLICT",

      fuel:
        "PROPULSION WATCH",

      stress:
        "LOAD WARNING",

      avionics:
        "SYSTEM ALERT",

      trajectory:
        "TRAJECTORY UPDATE",

      final:
        "FINAL CALL",

      mission:
        "MISSION UPDATE",
    };


  return cues[kind];
}


function getWingMatchCinematicSummary(
  situation: string,
) {

  const pieces =
    situation.match(
      /[^.!?]+[.!?]+|[^.!?]+$/g,
    );


  if (!pieces) {
    return situation;
  }


  return pieces
    .slice(
      0,
      2,
    )
    .join(" ")
    .trim();
}



const WINGS: Wing[] = [
  {
    id: "gnc",
    short: "GNC",
    name: "Guidance, Navigation & Control",
    description:
      "Motion, trajectory, control, uncertainty, and how a vehicle responds.",
  },

  {
    id: "avionics",
    short: "AVIONICS",
    name: "Avionics",
    description:
      "Sensors, electronics, software signals, diagnostics, and information flow.",
  },

  {
    id: "structures",
    short: "STRUCTURES",
    name: "Structures",
    description:
      "Loads, mechanisms, physical limits, materials, and hardware survival.",
  },

  {
    id: "thermal",
    short: "THERMAL",
    name: "Thermal Engineering",
    description:
      "Heat, temperature limits, environmental margins, and energy management.",
  },

  {
    id: "propulsion",
    short: "PROPULSION",
    name: "Propulsion",
    description:
      "Thrust, fuel, power, performance margins, and vehicle capability.",
  },

  {
    id: "mission-design",
    short: "MISSION DESIGN",
    name: "Mission Design",
    description:
      "Balancing objectives, constraints, risk, resources, and the entire mission.",
  },
];


const SCENES: MissionScene[] = [

  // ========================================================
  // 01 — GUIDED ENTRY
  // ========================================================

  {
    id:
      "guided-entry",

    chapter:
      "ARES-7 / MARS EDL",

    phase:
      "MISSION 01 / GUIDED ENTRY",

    situation:
      "ARES-7 is running a simulated autonomous Mars entry. Atmospheric density is tracking above the reference model, so predicted heating and aerodynamic loading are rising while the vehicle is also drifting long of its target corridor.",

    question:
      "Which tradeoff would you choose during guided entry?",

    options: [
      {
        id:
          "entry-thermal-margin",

        title:
          "Reduce thermal loading",

        description:
          "Constrain the guidance response so predicted heat flux stays farther inside the simulated thermal-protection envelope, even if downrange error grows.",

        consequence:
          "ARES-7 preserves more thermal margin, but later phases inherit a larger navigation correction.",

        scores: {
          thermal: 2,
          gnc: 1,
        },
      },

      {
        id:
          "entry-range-control",

        title:
          "Reduce downrange error",

        description:
          "Use the available guided-entry authority to pull the predicted trajectory toward the landing corridor while remaining inside hard thermal and load constraints.",

        consequence:
          "ARES-7 exits entry closer to the planned corridor, but uses more of its remaining guidance margin.",

        scores: {
          gnc: 3,
        },
      },

      {
        id:
          "entry-structural-margin",

        title:
          "Reduce aerodynamic loading",

        description:
          "Favor a response that reduces simulated aerodynamic loading on the aeroshell, accepting a wider downstream landing corridor.",

        consequence:
          "Structural margin improves, but the vehicle gives later navigation phases less positional precision.",

        scores: {
          structures: 2,
          "mission-design": 1,
        },
      },
    ],
  },


  // ========================================================
  // 02 — RANGE TRIGGER
  // ========================================================

  {
    id:
      "range-trigger",

    chapter:
      "ARES-7 / MARS EDL",

    phase:
      "MISSION 02 / PARACHUTE RANGE TRIGGER",

    situation:
      "ARES-7 has slowed into its simulated supersonic parachute deployment corridor. The onboard navigation solution says the vehicle is still slightly long of the target. Deployment must remain inside a qualified Mach and load envelope.",

    question:
      "How would you decide when to deploy the parachute?",

    options: [
      {
        id:
          "navigation-trigger",

        title:
          "Use the navigation-based range trigger",

        description:
          "Let the onboard position estimate adjust parachute timing inside the qualified envelope to reduce predicted landing-range error.",

        consequence:
          "Deployment is tied to where ARES-7 predicts it will land rather than to one fixed clock time.",

        scores: {
          gnc: 2,
          "mission-design": 1,
        },
      },

      {
        id:
          "protect-opening-load",

        title:
          "Reduce parachute opening load",

        description:
          "Favor the lower-load part of the qualified deployment corridor, even if the vehicle travels farther downrange first.",

        consequence:
          "Parachute loading margin improves, but less altitude and time remain for downstream descent.",

        scores: {
          structures: 2,
          gnc: 1,
        },
      },

      {
        id:
          "buy-descent-time",

        title:
          "Buy more downstream altitude",

        description:
          "Deploy at the earliest acceptable point in the qualified corridor to preserve more altitude for navigation and descent.",

        consequence:
          "ARES-7 gains more downstream time margin while accepting a less favorable deployment condition.",

        scores: {
          "mission-design": 2,
          structures: 1,
        },
      },
    ],
  },


  // ========================================================
  // 03 — NAVIGATION ACQUISITION
  // ========================================================

  {
    id:
      "navigation-acquisition",

    chapter:
      "ARES-7 / MARS EDL",

    phase:
      "MISSION 03 / NAVIGATION ACQUISITION",

    situation:
      "The heat shield separates, exposing the downward-looking sensors. Radar, inertial propagation, and vision-based map matching begin producing a map-relative state estimate, but the first vision solution has lower confidence than the other measurements.",

    question:
      "How would you establish the lander's navigation state?",

    options: [
      {
        id:
          "cross-check-sensors",

        title:
          "Cross-check independent sensors",

        description:
          "Compare radar, inertial, and visual estimates and require the measurements to become mutually consistent before giving the new vision solution full weight.",

        consequence:
          "ARES-7 builds confidence from multiple independent measurements rather than trusting the first available estimate.",

        scores: {
          avionics: 2,
          gnc: 1,
        },
      },

      {
        id:
          "propagate-estimator",

        title:
          "Let the state estimator blend the evidence",

        description:
          "Continue propagating the inertial solution while gradually incorporating radar and visual measurements according to their confidence.",

        consequence:
          "Navigation remains continuous while new sensor information is incorporated without an abrupt jump in estimated state.",

        scores: {
          gnc: 3,
        },
      },

      {
        id:
          "delay-large-retarget",

        title:
          "Delay major retargeting until localization strengthens",

        description:
          "Keep the descent sequence moving but avoid large target changes until the map-relative solution becomes more reliable.",

        consequence:
          "ARES-7 protects mission-level decision margin, but gives itself less time for a large late divert.",

        scores: {
          "mission-design": 2,
          avionics: 1,
        },
      },
    ],
  },


  // ========================================================
  // 04 — TERRAIN-RELATIVE NAVIGATION
  // ========================================================

  {
    id:
      "terrain-relative-navigation",

    chapter:
      "ARES-7 / MARS EDL",

    phase:
      "MISSION 04 / TERRAIN-RELATIVE NAVIGATION",

    situation:
      "ARES-7 now has a valid map-relative position. Its original landing point overlaps mapped rocks and slope hazards, while several safer locations remain inside the vehicle's simulated reachable footprint.",

    question:
      "How would you choose among the reachable landing sites?",

    options: [
      {
        id:
          "safest-reachable",

        title:
          "Prioritize terrain hazard",

        description:
          "Select the lowest-hazard target that remains reachable within the vehicle's current divert capability.",

        consequence:
          "ARES-7 sacrifices some original targeting precision in exchange for stronger landing-safety margin.",

        scores: {
          "mission-design": 2,
          gnc: 1,
        },
      },

      {
        id:
          "minimum-divert",

        title:
          "Minimize divert cost",

        description:
          "Choose a hazard-cleared target requiring the smallest lateral maneuver and least additional propulsion demand.",

        consequence:
          "ARES-7 preserves more propulsion margin while accepting a smaller improvement in landing-site quality.",

        scores: {
          propulsion: 2,
          "mission-design": 1,
        },
      },

      {
        id:
          "highest-localization-confidence",

        title:
          "Favor the target supported by the strongest localization",

        description:
          "Prefer a safe target whose surrounding terrain gives the vision-navigation system the clearest and most confident map match.",

        consequence:
          "The navigation solution becomes easier to validate, but ARES-7 may give up a more attractive landing point.",

        scores: {
          gnc: 2,
          avionics: 1,
        },
      },
    ],
  },


  // ========================================================
  // 05 — POWERED DESCENT
  // ========================================================

  {
    id:
      "powered-descent",

    chapter:
      "ARES-7 / MARS EDL",

    phase:
      "MISSION 05 / POWERED DESCENT",

    situation:
      "ARES-7 separates from the parachute and backshell system and begins simulated powered descent. Its navigation state is valid, but thrust and propellant must now remove the remaining velocity while preserving enough stopping margin.",

    question:
      "How would you allocate the remaining powered-descent margin?",

    options: [
      {
        id:
          "buy-stopping-margin",

        title:
          "Buy more stopping margin",

        description:
          "Increase thrust earlier in the descent profile, accepting additional propellant use to reduce the risk of arriving low and fast.",

        consequence:
          "ARES-7 gains velocity margin but carries less discretionary propellant into terminal descent.",

        scores: {
          propulsion: 2,
          gnc: 1,
        },
      },

      {
        id:
          "conserve-propellant",

        title:
          "Conserve propellant inside the guidance corridor",

        description:
          "Remain longer in the validated descent corridor before increasing thrust, provided the predicted stopping constraints remain satisfied.",

        consequence:
          "Propellant reserve improves, but the later guidance solution has less room for modeling error.",

        scores: {
          gnc: 2,
          propulsion: 1,
        },
      },

      {
        id:
          "protect-engine-thermal-margin",

        title:
          "Reduce sustained engine heating",

        description:
          "Avoid the most thermally demanding sustained-thrust profile and accept a less direct descent solution.",

        consequence:
          "The propulsion hardware retains more temperature margin, but the trajectory becomes less efficient.",

        scores: {
          thermal: 2,
          propulsion: 1,
        },
      },
    ],
  },


  // ========================================================
  // 06 — FAULT MANAGEMENT
  // ========================================================

  {
    id:
      "fault-management",

    chapter:
      "ARES-7 / MARS EDL",

    phase:
      "MISSION 06 / FAULT MANAGEMENT",

    situation:
      "During powered descent, one simulated radar velocity channel begins producing intermittent outliers. Inertial propagation and vision-derived motion remain mutually consistent, so the flight computer must decide how much authority the questionable measurement should retain.",

    question:
      "How would you respond to the suspect sensor channel?",

    options: [
      {
        id:
          "deweight-outliers",

        title:
          "Deweight the inconsistent measurement",

        description:
          "Reduce the suspect channel's influence on the state estimate while continuing to compare it with healthy measurements.",

        consequence:
          "ARES-7 keeps the channel as weak evidence without allowing intermittent outliers to dominate navigation.",

        scores: {
          gnc: 2,
          avionics: 1,
        },
      },

      {
        id:
          "isolate-channel",

        title:
          "Isolate it and use the redundant path",

        description:
          "Remove the suspect measurement from active navigation and rely on validated redundant hardware and the remaining sensors.",

        consequence:
          "The system becomes easier to reason about but gives up potentially useful information from the degraded channel.",

        scores: {
          avionics: 3,
        },
      },

      {
        id:
          "restrict-late-diverts",

        title:
          "Restrict aggressive guidance until confidence recovers",

        description:
          "Keep descending but temporarily limit large retarget maneuvers while the navigation solution is less certain.",

        consequence:
          "ARES-7 protects system-level margin while sacrificing some late landing-site flexibility.",

        scores: {
          "mission-design": 2,
          avionics: 1,
        },
      },
    ],
  },


  // ========================================================
  // 07 — TERMINAL DESCENT
  // ========================================================

  {
    id:
      "terminal-descent",

    chapter:
      "ARES-7 / MARS EDL",

    phase:
      "MISSION 07 / TERMINAL DESCENT",

    situation:
      "ARES-7 is tens of meters above its selected safe site. Radar and inertial estimates agree, but a small lateral velocity remains and the local terrain is slightly sloped. Each option remains inside the simulated touchdown envelope.",

    question:
      "Which tradeoff would you choose during terminal descent?",

    options: [
      {
        id:
          "null-lateral-velocity",

        title:
          "Null lateral velocity first",

        description:
          "Use remaining control authority to remove horizontal motion before completing the final vertical descent.",

        consequence:
          "ARES-7 approaches touchdown with cleaner motion but uses additional guidance and thrust authority.",

        scores: {
          gnc: 3,
        },
      },

      {
        id:
          "soften-touchdown",

        title:
          "Spend thrust for a softer touchdown",

        description:
          "Use additional propulsion margin to reduce final vertical velocity before contact.",

        consequence:
          "Touchdown loads decrease, but the lander reaches the surface with less propellant reserve.",

        scores: {
          propulsion: 2,
          structures: 1,
        },
      },

      {
        id:
          "protect-gear-loads",

        title:
          "Reduce landing-gear loading",

        description:
          "Bias the final attitude and descent solution toward an orientation that keeps simulated landing-leg loads farther from structural limits.",

        consequence:
          "ARES-7 protects mechanical margin while accepting a less ideal final attitude and touchdown position.",

        scores: {
          structures: 2,
          gnc: 1,
        },
      },
    ],
  },


  // ========================================================
  // 08 — LANDING COMMIT
  // ========================================================

  {
    id:
      "landing-commit",

    chapter:
      "ARES-7 / MARS EDL",

    phase:
      "MISSION 08 / LANDING COMMIT",

    situation:
      "ARES-7 is in the final meters of simulated descent. Dust is degrading the downward camera, but radar and inertial state remain valid and the selected safe target is already locked. Large retarget maneuvers are no longer desirable.",

    question:
      "What would guide your final landing decision?",

    options: [
      {
        id:
          "freeze-target",

        title:
          "Hold the target using the validated state",

        description:
          "Stop unnecessary retargeting and complete descent using the validated radar and inertial solution unless a hard limit is crossed.",

        consequence:
          "ARES-7 reduces late decision churn and commits to a stable, well-supported landing solution.",

        scores: {
          gnc: 2,
          avionics: 1,
        },
      },

      {
        id:
          "softest-touchdown",

        title:
          "Spend reserve for the softest touchdown",

        description:
          "Use remaining propulsion margin to reduce final vertical velocity farther before surface contact.",

        consequence:
          "Mechanical touchdown loads fall, but most discretionary propellant margin is consumed.",

        scores: {
          propulsion: 2,
          structures: 1,
        },
      },

      {
        id:
          "protect-system-envelope",

        title:
          "Stay within the validated touchdown envelope",

        description:
          "Ignore the last bit of landing-position preference and prioritize staying comfortably inside validated vehicle limits through surface contact.",

        consequence:
          "ARES-7 finishes with stronger whole-system margin while giving up some final landing precision.",

        scores: {
          "mission-design": 2,
          structures: 1,
        },
      },
    ],
  },
];


const LOADING_MESSAGES = [
  "Reading your eight mission decisions",
  "Comparing six aerospace engineering patterns",
  "Building your Wing signal",
];


function shuffle<T>(
  items: T[],
): T[] {

  const copy =
    [...items];

  for (
    let index =
      copy.length - 1;
    index > 0;
    index -= 1
  ) {

    const other =
      Math.floor(
        Math.random() *
        (index + 1),
      );

    [
      copy[index],
      copy[other],
    ] = [
      copy[other],
      copy[index],
    ];

  }

  return copy;
}


function calculateResults(
  answers:
    Record<
      string,
      string
    >,
) {

  /*
   * Choice-neutral calibration
   * --------------------------
   *
   * Different aerospace disciplines naturally appear
   * at different frequencies in Mars EDL.
   *
   * Instead of comparing raw totals or maximum possible
   * totals directly, compare each Wing against the score
   * it would EXPECT if a student chose among the available
   * options without a preference.
   *
   * This reduces structural advantage from:
   * - appearing in more scenes
   * - having more available score points
   *
   * This is an exploration signal, not an aptitude score
   * or a probability.
   */

  const totals:
    Record<
      WingId,
      number
    > = {
      gnc: 0,
      avionics: 0,
      structures: 0,
      thermal: 0,
      propulsion: 0,
      "mission-design": 0,
    };


  const expected:
    Record<
      WingId,
      number
    > = {
      gnc: 0,
      avionics: 0,
      structures: 0,
      thermal: 0,
      propulsion: 0,
      "mission-design": 0,
    };


  const variance:
    Record<
      WingId,
      number
    > = {
      gnc: 0,
      avionics: 0,
      structures: 0,
      thermal: 0,
      propulsion: 0,
      "mission-design": 0,
    };


  const evidenceCount:
    Record<
      WingId,
      number
    > = {
      gnc: 0,
      avionics: 0,
      structures: 0,
      thermal: 0,
      propulsion: 0,
      "mission-design": 0,
    };


  const matchedEvidenceCount:
    Record<
      WingId,
      number
    > = {
      gnc: 0,
      avionics: 0,
      structures: 0,
      thermal: 0,
      propulsion: 0,
      "mission-design": 0,
    };


  SCENES.forEach(
    (
      scene,
    ) => {

      const answerId =
        answers[
          scene.id
        ];


      /*
       * Only calibrate against scenes the student
       * has actually answered.
       *
       * This keeps intermediate calculations valid
       * as well as the final eight-scene result.
       */
      if (!answerId) {
        return;
      }


      const selectedOption =
        scene.options.find(
          (
            item,
          ) =>
            item.id ===
            answerId,
        );


      if (!selectedOption) {
        return;
      }


      WINGS.forEach(
        (
          wing,
        ) => {

          const availableScores =
            scene.options.map(
              (
                option,
              ) =>
                option.scores[
                  wing.id
                ] ?? 0,
            );


          const sceneMean =
            availableScores.reduce(
              (
                sum,
                value,
              ) =>
                sum + value,
              0,
            ) /
            availableScores.length;


          const sceneVariance =
            availableScores.reduce(
              (
                sum,
                value,
              ) =>
                sum +
                (
                  value -
                  sceneMean
                ) ** 2,
              0,
            ) /
            availableScores.length;


          expected[
            wing.id
          ] +=
            sceneMean;


          variance[
            wing.id
          ] +=
            sceneVariance;


          const bestAvailable =
            Math.max(
              ...availableScores,
            );


          if (
            bestAvailable >
            0
          ) {
            evidenceCount[
              wing.id
            ] += 1;
          }


          const earned =
            selectedOption.scores[
              wing.id
            ] ?? 0;


          totals[
            wing.id
          ] +=
            earned;


          if (
            earned >
            0
          ) {
            matchedEvidenceCount[
              wing.id
            ] += 1;
          }

        },
      );

    },
  );


  return WINGS
    .map(
      (
        wing,
      ) => {

        const standardDeviation =
          Math.sqrt(
            Math.max(
              variance[
                wing.id
              ],
              0,
            ),
          );


        /*
         * signalZ:
         *
         *  0   = around neutral-choice expectation
         * +1   = one SD above that baseline
         * +2   = notably stronger signal
         *
         * Do NOT interpret this as aptitude.
         */
        const signalZ =
          standardDeviation >
          0
            ? (
                totals[
                  wing.id
                ] -
                expected[
                  wing.id
                ]
              ) /
              standardDeviation
            : 0;


        /*
         * relative is only a display index.
         *
         * Logistic transform keeps it between 0–100.
         * 50 = neutral baseline.
         *
         * It is NOT a probability.
         */
        const relative =
          Math.round(
            100 /
            (
              1 +
              Math.exp(
                -signalZ,
              )
            ),
          );


        return {
          ...wing,

          score:
            totals[
              wing.id
            ],

          relative,

          signalZ:
            Math.round(
              signalZ *
              1000,
            ) /
            1000,

          evidenceCount:
            evidenceCount[
              wing.id
            ],

          matchedEvidenceCount:
            matchedEvidenceCount[
              wing.id
            ],
        };

      },
    )
    .sort(
      (
        a,
        b,
      ) =>
        b.signalZ -
        a.signalZ,
    );
}

function WingMatchV7({
  onExit,
}: WingMatchV7Props) {

  const [
    runNumber,
    setRunNumber,
  ] =
    useState(0);


  const [
    sceneIndex,
    setSceneIndex,
  ] =
    useState(0);


  const [
    selected,
    setSelected,
  ] =
    useState<
      MissionOption | null
    >(
      null,
    );


  const [
    cinematicOpen,
    setCinematicOpen,
  ] =
    useState(
      true,
    );



  const [
    hoveredOptionId,
    setHoveredOptionId,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const [
    answers,
    setAnswers,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({});


  const [
    previousDecision,
    setPreviousDecision,
  ] =
    useState<{
      title: string;
      consequence: string;
    } | null>(
      null,
    );


  const [
    mode,
    setMode,
  ] =
    useState<
      "mission"
      | "loading"
      | "result"
    >(
      "mission",
    );


  const [
    loadingStep,
    setLoadingStep,
  ] =
    useState(0);


  const [
    chosenWingId,
    setChosenWingId,
  ] =
    useState<
      WingId | null
    >(
      null,
    );


  const scenes =
    useMemo(
      () => {
        // runNumber intentionally invalidates the memo so each fresh run
        // gets a new presentation order without changing scoring weights.
        void runNumber;

        return SCENES.map(
          (
            scene,
          ) => ({
            ...scene,

            options:
              shuffle(
                scene.options,
              ),
          }),
        );
      },
      [
        runNumber,
      ],
    );


  const scene =
    scenes[
      sceneIndex
    ];


  const results =
    useMemo(
      () =>
        calculateResults(
          answers,
        ),
      [
        answers,
      ],
    );


  const recommendedWing =
    results[0];


  const selectedWing =
    results.find(
      (
        wing,
      ) =>
        wing.id ===
        (
          chosenWingId ??
          recommendedWing.id
        ),
    ) ??
    recommendedWing;


  const progress =
    (
      (
        sceneIndex +
        (selected ? 1 : 0)
      ) /
      scenes.length
    ) *
    100;


  useEffect(
    () => {

      if (
        mode !==
        "loading"
      ) {
        return;
      }


      // Entering loading mode restarts the timed
      // result-reveal sequence from its first frame.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingStep(
        0,
      );


      const timer1 =
        window.setTimeout(
          () =>
            setLoadingStep(
              1,
            ),
          850,
        );


      const timer2 =
        window.setTimeout(
          () =>
            setLoadingStep(
              2,
            ),
          1700,
        );


      const timer3 =
        window.setTimeout(
          () => {
            setChosenWingId(
              recommendedWing.id,
            );

            setMode(
              "result",
            );

            window.scrollTo({
              top: 0,
              behavior:
                "smooth",
            });
          },
          2850,
        );


      return () => {
        window.clearTimeout(
          timer1,
        );

        window.clearTimeout(
          timer2,
        );

        window.clearTimeout(
          timer3,
        );
      };

    },
    [
      mode,
      recommendedWing.id,
    ],
  );


  function choose(
    option:
      MissionOption,
  ) {

    // Preview only.
    // The learner can change their mind until
    // they commit by moving to the next scene.
    setSelected(
      option,
    );
  }


  function next() {

    if (!selected) {
      return;
    }


    /*
     * Build the committed state immediately.
     *
     * React state updates are asynchronous, so Mission 08
     * must calculate its final result from this object,
     * not from the previous render's answers.
     */
    const committedAnswers = {
      ...answers,

      [scene.id]:
        selected.id,
    };


    setAnswers(
      committedAnswers,
    );


    if (isPostHogConfigured) {
      posthog.capture(
        "wingmatch_decision_made",
        {
          scene_id:
            scene.id,

          option_id:
            selected.id,

          scene_number:
            sceneIndex + 1,

          displayed_position:
            scene.options.findIndex(
              (
                item,
              ) =>
                item.id ===
                selected.id,
            ) + 1,

          displayed_option_order:
            scene.options
              .map(
                (
                  item,
                ) =>
                  item.id,
              )
              .join(
                "|",
              ),

          run_number:
            runNumber + 1,

          scoring_version:
            "choice-neutral-z-v1",
        },
      );
    }


    setPreviousDecision({
      title:
        selected.title,

      consequence:
        selected.consequence,
    });


    if (
      sceneIndex ===
      scenes.length - 1
    ) {

      const finalResults =
        calculateResults(
          committedAnswers,
        );


      const finalRecommendedWing =
        finalResults[0];


      if (isPostHogConfigured) {
        posthog.capture(
          "wingmatch_completed",
          {
            decision_count:
              scenes.length,

            recommended_wing_id:
              finalRecommendedWing.id,

            scoring_version:
              "choice-neutral-z-v1",

            top_signal_z:
              finalRecommendedWing.signalZ,

            top_signal_index:
              finalRecommendedWing.relative,

            top_evidence_scenes:
              finalRecommendedWing.evidenceCount,

            top_matched_scenes:
              finalRecommendedWing.matchedEvidenceCount,
          },
        );
      }


      posthogLog.info(
        "wingmatch mission completed",
        {
          decision_count:
            scenes.length,

          recommended_wing_id:
            finalRecommendedWing.id,
        },
      );


      setMode(
        "loading",
      );


      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });


      return;
    }


    setCinematicOpen(
      true,
    );


    setSceneIndex(
      (
        current,
      ) =>
        current + 1,
    );


    setSelected(
      null,
    );


    setHoveredOptionId(
      null,
    );


    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }


  function goBack() {

    if (
      sceneIndex <= 0
    ) {
      return;
    }


    const targetIndex =
      sceneIndex - 1;


    /*
     * Going backward means the student
     * must make that decision again.
     *
     * We remove that answer and anything
     * after it instead of secretly keeping
     * a stale choice.
     */

    setAnswers(
      (
        current,
      ) => {

        const nextAnswers =
          {
            ...current,
          };


        scenes
          .slice(
            targetIndex,
          )
          .forEach(
            (
              item,
            ) => {

              delete nextAnswers[
                item.id
              ];

            },
          );


        return nextAnswers;
      },
    );


    /*
     * Restore the consequence from the
     * decision BEFORE the page we are
     * returning to.
     */

    if (
      targetIndex === 0
    ) {

      setPreviousDecision(
        null,
      );

    } else {

      const priorScene =
        scenes[
          targetIndex - 1
        ];


      const priorOptionId =
        answers[
          priorScene.id
        ];


      const priorOption =
        priorScene.options.find(
          (
            option,
          ) =>
            option.id ===
            priorOptionId,
        );


      if (priorOption) {

        setPreviousDecision({
          title:
            priorOption.title,

          consequence:
            priorOption.consequence,
        });

      } else {

        setPreviousDecision(
          null,
        );

      }
    }


    setCinematicOpen(
      true,
    );


    setSceneIndex(
      targetIndex,
    );


    setSelected(
      null,
    );


    setHoveredOptionId(
      null,
    );


    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }


  function restart() {

    setRunNumber(
      (
        current,
      ) =>
        current + 1,
    );

    setCinematicOpen(
      true,
    );


    setSceneIndex(
      0,
    );

    setSelected(
      null,
    );

    setHoveredOptionId(
      null,
    );

    setAnswers(
      {},
    );

    setPreviousDecision(
      null,
    );

    setChosenWingId(
      null,
    );

    setMode(
      "mission",
    );

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }


  function saveWing(
    wing:
      typeof results[number],
  ) {

    const payload = {
      id:
        wing.id,

      name:
        wing.name,

      short:
        wing.short,

      source:
        "wingmatch-v7",

      recommendedWing:
        recommendedWing.id,

      selectedAt:
        new Date()
          .toISOString(),
    };


    localStorage.setItem(
      "altwing-selected-wing-v1",
      JSON.stringify(
        payload,
      ),
    );


    /*
     * Show the post-Wing guide once for this newly
     * saved WingMatch result.
     */
    localStorage.setItem(
      "altwing-post-wing-guide-pending-v1",
      "1",
    );


    /*
     * Arm one feedback survey for
     * this exact saved WingMatch.
     */
    localStorage.setItem(
      "altwing-wingmatch-feedback-pending-v1",
      payload.selectedAt,
    );


    localStorage.setItem(
      "altwing-selected-wing",
      wing.id,
    );


    localStorage.setItem(
      "altwing-wingmatch-v7-result",
      JSON.stringify({
        answers,
        recommended:
          recommendedWing.id,

        selected:
          wing.id,

        results:
          results.map(
            (
              item,
            ) => ({
              id:
                item.id,

              score:
                item.score,
            }),
          ),
      }),
    );


    window.dispatchEvent(
      new CustomEvent(
        "altwing:selected-wing",
        {
          detail:
            payload,
        },
      ),
    );


    setChosenWingId(
      wing.id,
    );
  }


  function finishWingMatch() {

    if (isPostHogConfigured) {
      posthog.capture(
        "wingmatch_result_saved",
        {
          selected_wing_id: selectedWing.id,
          recommended_wing_id: recommendedWing.id,
        },
      );
    }

    /*
     * Save the Wing the student actually chose,
     * not necessarily the recommendation.
     */

    saveWing(
      selectedWing,
    );


    /*
     * Return to the AltWing home screen.
     * App.tsx already handles switching the
     * WingMatch view back to "home".
     */

    onExit();


    /*
     * Make sure home opens at the top.
     */

    window.setTimeout(
      () => {
        window.scrollTo({
          top: 0,
          behavior: "auto",
        });
      },
      0,
    );
  }


  // ========================================================
  // LOADING
  // ========================================================

  if (
    mode ===
    "loading"
  ) {

    return (
      <main className="awv7-shell awv7-loading">

        <header className="awv7-topbar">

          <div />

          <div className="awv7-brand">
            Alt<span>Wing</span>
          </div>

          <div />

        </header>


        <section className="awv7-loading-stage">

          <div className="awv7-flight-zone">

            <div className="awv7-flight-orbit" />

            <img
              src="/brand/altwing-penguin.png"
              alt=""
              className="awv7-flying-penguin"
            />

          </div>


          <span className="awv7-loading-kicker">
            WINGMATCH COMPLETE
          </span>


          <h1>
            Finding the best-fit
            <br />
            Wing for you...
          </h1>


          <p>
            Based on the engineering
            patterns you used across
            this mission run.
          </p>


          <div className="awv7-loading-steps">

            {LOADING_MESSAGES.map(
              (
                message,
                index,
              ) => (

                <div
                  key={
                    message
                  }
                  className={
                    index <=
                    loadingStep
                      ? "is-active"
                      : ""
                  }
                >

                  <span>
                    {index <
                    loadingStep
                      ? "✓"
                      : index ===
                        loadingStep
                        ? "●"
                        : "○"}
                  </span>

                  {
                    message
                  }

                </div>

              ),
            )}

          </div>


          <div className="awv7-loading-bar">
            <span
              style={{
                width:
                  `${(
                    (
                      loadingStep +
                      1
                    ) /
                    3
                  ) *
                  100}%`,
              }}
            />
          </div>

        </section>

      </main>
    );
  }


  // ========================================================
  // RESULT
  // ========================================================

  if (
    mode ===
    "result"
  ) {

    return (
      <main className="awv7-shell">

        <header className="awv7-topbar">

          <button
            type="button"
            onClick={onExit}
            className="awv7-exit"
          >
            ← ALTWING
          </button>


          <div className="awv7-brand">
            Alt<span>Wing</span>
          </div>


          <span className="awv7-result-label">
            RESULT
          </span>

        </header>


        <section className="awv7-result">

          <span className="awv7-kicker">
            YOUR STRONGEST SIGNAL TODAY
          </span>


          <h1>
            {
              recommendedWing.name
            }
          </h1>


          <p className="awv7-result-intro">
            This was the strongest
            engineering pattern in this
            mission run. The signal is
            calibrated to the choices
            available in each scene.
            Treat it as a direction to
            test — not a probability,
            permanent label, or aptitude
            score.
          </p>


          <section className="awv7-recommended">

            <div>

              <span>
                RECOMMENDED FROM THIS RUN
              </span>

              <h2>
                {
                  recommendedWing.short
                }
              </h2>

              <p>
                {
                  recommendedWing.description
                }
              </p>

            </div>


            <div
              className="awv7-result-mascot"
              data-wing={
                recommendedWing.id
              }
            >

              <div className="awv7-result-orbit" />

              <img
                src="/brand/altwing-penguin.png"
                alt="AltWing mascot"
              />

            </div>

          </section>


          <section className="awv7-result-options">

            <header>

              <span className="awv7-kicker">
                WHAT YOU COULD HAVE GOTTEN
              </span>

              <h2>
                You can choose a
                different Wing to explore.
              </h2>

              <p>
                Your strongest signal is
                only a recommendation.
                If another kind of
                engineering interests you
                more, choose it. AltWing
                will build your next path
                around that Wing instead.
              </p>

            </header>


            <div className="awv7-wing-grid">

              {results.map(
                (
                  wing,
                ) => {

                  const chosen =
                    selectedWing.id ===
                    wing.id;

                  const recommended =
                    recommendedWing.id ===
                    wing.id;


                  return (
                    <button
                      key={
                        wing.id
                      }
                      type="button"
                      className={[
                        "awv7-wing-card",

                        chosen
                          ? "is-selected"
                          : "",
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          " ",
                        )}
                      onClick={() => {
                        if (isPostHogConfigured) {
                          posthog.capture(
                            "wing_selected",
                            {
                              selected_wing_id: wing.id,
                              recommended_wing_id:
                                recommendedWing.id,
                            },
                          );
                        }

                        saveWing(
                          wing,
                        );
                      }}
                    >

                      <div className="awv7-wing-card-top">

                        <span>
                          {
                            wing.short
                          }
                        </span>

                        {recommended && (
                          <b>
                            RECOMMENDED
                          </b>
                        )}

                      </div>


                      <h3>
                        {
                          wing.name
                        }
                      </h3>


                      <p>
                        {
                          wing.description
                        }
                      </p>


                      <div className="awv7-wing-meter">

                        <span>
                          <i
                            style={{
                              width:
                                `${wing.relative}%`,
                            }}
                          />
                        </span>

                      </div>


                      <strong>
                        {chosen
                          ? "SELECTED ✓"
                          : "CHOOSE THIS WING →"}
                      </strong>

                    </button>
                  );
                },
              )}

            </div>

          </section>


          <section className="awv7-selected-path">

            <div>

              <span>
                YOUR NEXT WING
              </span>

              <h2>
                {
                  selectedWing.name
                }
              </h2>

              <p>
                AltWing will use this
                Wing for your projects,
                opportunities, and
                exploration path.
              </p>

            </div>


            <div className="awv7-result-actions">

              <button
                type="button"
                className="awv7-primary-action"
                onClick={
                  finishWingMatch
                }
              >
                SAVE{" "}
                {
                  selectedWing.short
                }{" "}
                & RETURN HOME →
              </button>


              <button
                type="button"
                className="awv7-secondary-action"
                onClick={restart}
              >
                REPLAY MISSION
              </button>

            </div>

          </section>

        </section>

      </main>
    );
  }


  // ========================================================
  // MISSION
  // ========================================================

  return (
    <main className="awv7-shell">

      <header className="awv7-topbar">

        <div className="awv7-nav-actions">

          <button
            type="button"
            onClick={onExit}
            className="awv7-exit"
          >
            EXIT
          </button>


          {sceneIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="awv7-back"
            >
              ← PREVIOUS
            </button>
          )}

        </div>


        <div className="awv7-brand">
          Alt<span>Wing</span>
        </div>


        <div className="awv7-count">
          {String(
            sceneIndex + 1,
          ).padStart(
            2,
            "0",
          )}
          {" / "}
          {String(
            scenes.length,
          ).padStart(
            2,
            "0",
          )}
        </div>

      </header>


      <div className="awv7-progress">

        <span
          style={{
            width:
              `${progress}%`,
          }}
        />

      </div>


      <section className="awv7-stage">

        <div className="awv7-story-header">

          <span>
            {
              scene.phase
            }
          </span>

          <strong>
            {
              scene.chapter
            }
          </strong>

        </div>


        {previousDecision && (
          <aside className="awv7-continuity">

            <span>
              FROM YOUR LAST DECISION
            </span>

            <strong>
              {
                previousDecision.title
              }
            </strong>

            <p>
              {
                previousDecision.consequence
              }
            </p>

          </aside>
        )}


        {cinematicOpen && (

          <div
            className={[
              "awv7-cinematic",

              `awv7-cinematic--${
                getWingMatchCinematicKind(
                  scene,
                  sceneIndex,
                  scenes.length,
                )
              }`,
            ].join(
              " ",
            )}
            role="dialog"
            aria-modal="true"
            aria-label={
              `Mission ${
                sceneIndex + 1
              } briefing`
            }
          >

            <div
              className="awv7-cine-space"
              aria-hidden="true"
            />

            <div
              className="awv7-cine-grid"
              aria-hidden="true"
            />

            <div
              className="awv7-cine-scan"
              aria-hidden="true"
            />




            <div className="awv7-cine-panel">

              <div className="awv7-cine-topline">

                <span>
                  ARES-7
                </span>

                <strong>
                  MISSION{" "}
                  {String(
                    sceneIndex + 1,
                  ).padStart(
                    2,
                    "0",
                  )}
                  {" / "}
                  {String(
                    scenes.length,
                  ).padStart(
                    2,
                    "0",
                  )}
                </strong>

              </div>


              <WingMatchComic
                sceneIndex={
                  sceneIndex
                }
              />


              <div className="awv7-cine-alert">

                <i />

                {
                  getWingMatchCinematicCue(
                    getWingMatchCinematicKind(
                      scene,
                      sceneIndex,
                      scenes.length,
                    ),
                  )
                }

              </div>


              <div className="awv7-cine-copy">

                <span>
                  {scene.chapter}
                  {" // "}
                  {scene.phase}
                </span>

                <p>
                  {
                    getWingMatchCinematicSummary(
                      scene.situation,
                    )
                  }
                </p>

                <h2>
                  {
                    scene.question
                  }
                </h2>

              </div>


              <button
                type="button"
                className="awv7-cine-take-control"
                onClick={() =>
                  setCinematicOpen(
                    false,
                  )
                }
              >
                MAKE THE CALL
                <span>
                  →
                </span>
              </button>


              <small className="awv7-cine-note">
                SIMPLIFIED EDUCATIONAL
                AEROSPACE MISSION
              </small>

            </div>

          </div>

        )}


        <p className="awv7-situation">
          {
            scene.situation
          }
        </p>


        <h1 className="awv7-question">
          {
            scene.question
          }
        </h1>


        <p className="awv7-rule">
          There is no perfect answer.
          Choose the tradeoff you would
          actually accept as mission
          control.
        </p>


        <MissionVisual
          sceneId={
            scene.id
          }
          options={
            scene.options
          }
          activeOptionId={
            selected?.id ??
            hoveredOptionId
          }
          selectedOptionId={
            selected?.id ??
            null
          }
          onHover={
            setHoveredOptionId
          }
          onChoose={
            (
              optionId,
            ) => {

              const option =
                scene.options.find(
                  (
                    item,
                  ) =>
                    item.id ===
                    optionId,
                );

              if (option) {
                choose(
                  option,
                );
              }

            }
          }
        />


        <div className="awv7-options">

          {scene.options.map(
            (
              option,
              index,
            ) => {

              const isSelected =
                selected?.id ===
                option.id;


              return (
                <button
                  key={
                    option.id
                  }
                  type="button"
                  className={[
                    "awv7-option",

                    isSelected
                      ? "is-selected"
                      : "",

                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      " ",
                    )}
                  onMouseEnter={() =>
                    setHoveredOptionId(
                      option.id,
                    )
                  }
                  onMouseLeave={() =>
                    setHoveredOptionId(
                      null,
                    )
                  }
                  onFocus={() =>
                    setHoveredOptionId(
                      option.id,
                    )
                  }
                  onBlur={() =>
                    setHoveredOptionId(
                      null,
                    )
                  }
                  onClick={() =>
                    choose(
                      option,
                    )
                  }
                >

                  <span className="awv7-option-number">
                    OPTION{" "}
                    {
                      index + 1
                    }
                  </span>


                  <strong>
                    {
                      option.title
                    }
                  </strong>


                  <p>
                    {
                      option.description
                    }
                  </p>


                  <b>
                    {isSelected
                      ? "SELECTED ✓"
                      : "CHOOSE →"}
                  </b>

                </button>
              );
            },
          )}

        </div>


        {selected && (
          <section className="awv7-decision">

            <div>

              <span>
                YOUR DECISION
              </span>

              <h2>
                {
                  selected.title
                }
              </h2>

              <p>
                {
                  selected.consequence
                }
              </p>

            </div>


            <button
              type="button"
              onClick={next}
            >
              {sceneIndex ===
              scenes.length - 1
                ? "ANALYZE MY WING →"
                : "CONTINUE MISSION →"}
            </button>

          </section>
        )}

      </section>

    </main>
  );
}


export default WingMatchV7;
