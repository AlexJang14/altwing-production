import "./mission-visual.css";


interface MissionVisualOption {
  id: string;
  title: string;
}


interface MissionVisualProps {
  sceneId: string;

  options: MissionVisualOption[];

  activeOptionId:
    | string
    | null;

  selectedOptionId:
    | string
    | null;

  onHover:
    (
      id:
        string
        | null,
    ) => void;

  onChoose:
    (
      id: string,
    ) => void;
}


interface SceneMetric {
  label: string;
  value: string;
  tone?:
    | "warning"
    | "good";
}


interface SceneMeta {
  system: string;

  status: string;

  summary: string;

  metrics: SceneMetric[];
}


const SCENE_META:
  Record<
    string,
    SceneMeta
  > = {

    "guided-entry": {
      system:
        "GUIDED ENTRY",

      status:
        "OFF-NOMINAL ATMOSPHERE",

      summary:
        "ARES-7 is heating above prediction and its projected landing point is long of the target.",

      metrics: [
        {
          label:
            "VELOCITY",

          value:
            "5.5 km/s",
        },

        {
          label:
            "HEAT FLUX",

          value:
            "1.18× PRED",

          tone:
            "warning",
        },

        {
          label:
            "DOWNRANGE ERROR",

          value:
            "+4.2 km",
        },
      ],
    },


    "range-trigger": {
      system:
        "PARACHUTE RANGE TRIGGER",

      status:
        "DEPLOY WINDOW OPEN",

      summary:
        "ARES-7 is inside the qualified supersonic parachute corridor. Deployment timing changes both landing range and altitude margin.",

      metrics: [
        {
          label:
            "ALTITUDE",

          value:
            "11.0 km",
        },

        {
          label:
            "MACH",

          value:
            "1.75",
        },

        {
          label:
            "RANGE ERROR",

          value:
            "+2.8 km",

          tone:
            "warning",
        },
      ],
    },


    "navigation-acquisition": {
      system:
        "NAVIGATION ACQUISITION",

      status:
        "STATE ESTIMATE FORMING",

      summary:
        "After heat-shield separation, radar, IMU, and downward imagery must agree on where ARES-7 actually is.",

      metrics: [
        {
          label:
            "RADAR",

          value:
            "LOCK",
          tone:
            "good",
        },

        {
          label:
            "IMU",

          value:
            "VALID",
          tone:
            "good",
        },

        {
          label:
            "VISION",

          value:
            "ACQUIRING",
        },
      ],
    },


    "terrain-relative-navigation": {
      system:
        "TERRAIN RELATIVE NAVIGATION",

      status:
        "HAZARD AVOIDANCE ACTIVE",

      summary:
        "ARES-7 has matched the terrain below to its onboard map. The original aim point is hazardous, but safer reachable sites remain.",

      metrics: [
        {
          label:
            "MAP MATCH",

          value:
            "96%",
          tone:
            "good",
        },

        {
          label:
            "SAFE SITES",

          value:
            "3",
        },

        {
          label:
            "DIVERT",

          value:
            "1.6 km",
        },
      ],
    },


    "powered-descent": {
      system:
        "POWERED DESCENT",

      status:
        "ENGINE CLUSTER ACTIVE",

      summary:
        "ARES-7 has separated from the backshell and is braking under rocket power. Thrust, fuel, and stopping distance now compete.",

      metrics: [
        {
          label:
            "ALTITUDE",

          value:
            "2.1 km",
        },

        {
          label:
            "VERT SPEED",

          value:
            "85 m/s",

          tone:
            "warning",
        },

        {
          label:
            "PROPELLANT",

          value:
            "34%",
        },
      ],
    },


    "fault-management": {
      system:
        "FAULT MANAGEMENT",

      status:
        "RADAR CHANNEL SUSPECT",

      summary:
        "One radar-velocity channel is producing intermittent outliers while IMU and vision remain mutually consistent.",

      metrics: [
        {
          label:
            "RADAR CH-B",

          value:
            "OUTLIERS",

          tone:
            "warning",
        },

        {
          label:
            "IMU",

          value:
            "VALID",

          tone:
            "good",
        },

        {
          label:
            "VISION",

          value:
            "VALID",

          tone:
            "good",
        },
      ],
    },


    "terminal-descent": {
      system:
        "TERMINAL DESCENT",

      status:
        "TOUCHDOWN CORRIDOR",

      summary:
        "ARES-7 is tens of meters above the safe site. Lateral velocity remains and the surface has a slight slope.",

      metrics: [
        {
          label:
            "ALTITUDE",

          value:
            "42 m",
        },

        {
          label:
            "LATERAL V",

          value:
            "2.4 m/s",

          tone:
            "warning",
        },

        {
          label:
            "SLOPE",

          value:
            "6.2°",
        },
      ],
    },


    "landing-commit": {
      system:
        "LANDING COMMIT",

      status:
        "FINAL METERS",

      summary:
        "Dust is degrading the camera, but radar and IMU remain valid. The landing target is locked and large retargets are no longer desirable.",

      metrics: [
        {
          label:
            "ALTITUDE",

          value:
            "8.5 m",
        },

        {
          label:
            "VISION",

          value:
            "DEGRADED",

          tone:
            "warning",
        },

        {
          label:
            "RADAR + IMU",

          value:
            "VALID",

          tone:
            "good",
        },
      ],
    },
  };


const NODE_POSITIONS = [
  {
    x: 185,
    y: 310,
  },

  {
    x: 500,
    y: 105,
  },

  {
    x: 815,
    y: 310,
  },
];



const ENTRY_NODE_POSITIONS = [
  {
    x: 250,
    y: 330,
  },

  {
    x: 500,
    y: 330,
  },

  {
    x: 750,
    y: 330,
  },
];


function EntryVisual() {

  return (
    <g
      className="aw6-entry-v5"
      aria-hidden="true"
    >

      <defs>

        <linearGradient
          id="aw6V5Metal"
          x1="0"
          x2="1"
        >
          <stop
            offset="0%"
            stopColor="#46515d"
          />

          <stop
            offset="18%"
            stopColor="#c4ccd3"
          />

          <stop
            offset="45%"
            stopColor="#f5f6f7"
          />

          <stop
            offset="72%"
            stopColor="#909ba5"
          />

          <stop
            offset="100%"
            stopColor="#37414b"
          />
        </linearGradient>


        <linearGradient
          id="aw6V5Dark"
          x1="0"
          x2="1"
        >
          <stop
            offset="0%"
            stopColor="#121920"
          />

          <stop
            offset="50%"
            stopColor="#59646f"
          />

          <stop
            offset="100%"
            stopColor="#0d141b"
          />
        </linearGradient>


        <filter
          id="aw6V5Glow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur
            stdDeviation="6"
            result="blur"
          />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

      </defs>


      {/* 1 — INCOMING */}

      <text
        className="aw6-v5-step"
        x="66"
        y="48"
      >
        1 · ARES-7 ENTERING MARS
      </text>


      <path
        className="aw6-v5-incoming"
        d="
          M 910 38
          C 795 72
            680 118
            575 176
          C 530 201
            492 217
            452 232
        "
      />


      {/* MARS */}

      <path
        className="aw6-v5-mars"
        d="
          M 30 356
          Q 500 278
            970 356
          L 970 420
          L 30 420
          Z
        "
        fill="url(#aw6Mars)"
      />


      <ellipse
        className="aw6-v5-crater"
        cx="154"
        cy="355"
        rx="38"
        ry="9"
      />

      <ellipse
        className="aw6-v5-crater"
        cx="832"
        cy="355"
        rx="51"
        ry="11"
      />


      {/* IDEAL TARGET PATH */}

      <path
        className="aw6-v5-ideal"
        d="
          M 450 230
          C 458 259
            470 285
            486 309
        "
      />


      {/* CURRENT PROJECTED PATH — OVERSHOOTS */}

      <path
        className="aw6-v5-current"
        d="
          M 450 230
          C 521 252
            608 278
            705 309
        "
      />


      {/* TARGET */}

      <g
        className="aw6-v5-target"
        transform="translate(486 314)"
      >

        <circle
          className="outer"
          r="22"
        />

        <circle
          className="inner"
          r="6"
        />

        <text
          x="0"
          y="-31"
          textAnchor="middle"
        >
          TARGET
        </text>

      </g>


      {/* CURRENT PROJECTED LANDING */}

      <g
        className="aw6-v5-overshoot"
        transform="translate(705 314)"
      >

        <circle
          r="15"
        />

        <line
          x1="-10"
          y1="-10"
          x2="10"
          y2="10"
        />

        <line
          x1="10"
          y1="-10"
          x2="-10"
          y2="10"
        />

        <text
          className="label"
          x="0"
          y="-27"
          textAnchor="middle"
        >
          CURRENT PREDICTION
        </text>

        <text
          className="long"
          x="0"
          y="31"
          textAnchor="middle"
        >
          +4.2 km LONG
        </text>

      </g>


      {/* ARES-7 */}

      <g
        className="aw6-v5-vehicle"
        transform="
          translate(446 178)
          rotate(24)
        "
      >

        {/* HEATING */}

        <path
          className="aw6-v5-heat"
          d="
            M -29 -61
            C -49 -25
              -47 43
              -22 103
          "
          fill="none"
          stroke="#ff7046"
          strokeWidth="14"
          strokeLinecap="round"
          filter="url(#aw6V5Glow)"
        />


        {/* BODY */}

        <path
          d="
            M 0 -78
            C -18 -65
              -25 -42
              -26 -17
            L -23 69
            C -22 86
              -14 99
              -7 105
            L 7 105
            C 14 99
              22 86
              23 69
            L 26 -17
            C 25 -42
              18 -65
              0 -78
            Z
          "
          fill="url(#aw6V5Metal)"
          stroke="#edf2f6"
          strokeWidth="1.5"
        />


        {/* FRONT FLAPS */}

        <path
          d="
            M -23 -40
            L -49 -25
            L -52 -7
            L -23 -14
            Z
          "
          fill="url(#aw6V5Dark)"
          stroke="#929faa"
        />

        <path
          d="
            M 23 -40
            L 49 -25
            L 52 -7
            L 23 -14
            Z
          "
          fill="url(#aw6V5Dark)"
          stroke="#929faa"
        />


        {/* REAR FLAPS */}

        <path
          d="
            M -23 44
            L -52 68
            L -47 93
            L -16 75
            Z
          "
          fill="url(#aw6V5Dark)"
          stroke="#8996a2"
        />

        <path
          d="
            M 23 44
            L 52 68
            L 47 93
            L 16 75
            Z
          "
          fill="url(#aw6V5Dark)"
          stroke="#8996a2"
        />


        {/* SENSOR WINDOWS */}

        <circle
          cx="-9"
          cy="-34"
          r="2.5"
          fill="#061729"
          stroke="#7bc8ff"
        />

        <circle
          cx="9"
          cy="-34"
          r="2.5"
          fill="#061729"
          stroke="#7bc8ff"
        />


        <text
          x="0"
          y="7"
          textAnchor="middle"
          fill="#202a34"
          fontSize="8"
          fontWeight="900"
        >
          ARES-7
        </text>


        {/* ENGINE SKIRT */}

        <path
          d="
            M -15 82
            L 15 82
            L 19 99
            Q 0 108
              -19 99
            Z
          "
          fill="url(#aw6V5Dark)"
          stroke="#929da7"
        />


        {/* ENGINE BELLS */}

        <path
          d="
            M -16 96
            C -18 107
              -18 115
              -15 120
            Q -8 124
              -3 119
            L -7 96
            Z
          "
          fill="#0f151c"
          stroke="#8e9aa5"
        />

        <path
          d="
            M -6 96
            C -8 108
              -6 117
              0 122
            C 6 117
              8 108
              6 96
            Z
          "
          fill="#0c1218"
          stroke="#a1abb5"
        />

        <path
          d="
            M 7 96
            L 3 119
            Q 8 124
              15 120
            C 18 115
              18 107
              16 96
            Z
          "
          fill="#0f151c"
          stroke="#8e9aa5"
        />

      </g>


      {/* 2 — THE PROBLEM */}

      <g
        className="aw6-v5-problem"
        transform="translate(78 121)"
      >

        <text
          className="step"
          x="0"
          y="0"
        >
          2 · PROBLEM
        </text>

        <text
          className="heat"
          x="0"
          y="24"
        >
          TOO MUCH HEATING
        </text>

        <text
          className="range"
          x="0"
          y="47"
        >
          + FLYING PAST TARGET
        </text>

      </g>


      {/* 3 — DECISION */}

      <text
        className="aw6-v5-question"
        x="500"
        y="278"
        textAnchor="middle"
      >
        3 · WHAT SHOULD ARES-7 PROTECT FIRST?
      </text>

    </g>
  );
}


function SensorVisual() {

  return (
    <g className="aw6-science aw6-range-trigger">

      <path
        className="aw6-science-mars"
        d="
          M 20 355
          Q 500 302 980 355
          L 980 420
          L 20 420
          Z
        "
      />


      <text
        className="aw6-science-caption"
        x="500"
        y="42"
        textAnchor="middle"
      >
        SUPERSONIC PARACHUTE DEPLOYMENT CORRIDOR
      </text>


      <rect
        className="aw6-range-window"
        x="255"
        y="88"
        width="490"
        height="170"
        rx="28"
      />


      <text
        className="aw6-range-window-label"
        x="500"
        y="112"
        textAnchor="middle"
      >
        QUALIFIED DEPLOY WINDOW
      </text>


      <text
        className="aw6-range-edge"
        x="192"
        y="180"
        textAnchor="middle"
      >
        TOO EARLY
      </text>

      <text
        className="aw6-range-edge"
        x="808"
        y="180"
        textAnchor="middle"
      >
        TOO LATE
      </text>


      <path
        className="aw6-range-flight"
        d="
          M 885 55
          C 760 88
            630 128
            505 185
          C 420 224
            360 266
            306 319
        "
      />


      <g
        className="aw6-range-parachute"
        transform="translate(500 172)"
      >

        <path
          d="
            M -82 0
            Q 0 -74 82 0
            Q 50 -13 20 0
            Q 0 -14 -20 0
            Q -50 -13 -82 0
            Z
          "
          fill="#eef3f6"
          stroke="#8fa4b8"
          strokeWidth="2"
        />

        <path
          d="M -62 4 L -18 79"
        />

        <path
          d="M 62 4 L 18 79"
        />

        <path
          d="M -20 4 L -8 79"
        />

        <path
          d="M 20 4 L 8 79"
        />

        <g
          transform="translate(0 95)"
        >
          <path
            d="
              M 0 -24
              C -15 -17 -18 2 -15 23
              L 15 23
              C 18 2 15 -17 0 -24
              Z
            "
            fill="#dfe6ec"
            stroke="#8fa0af"
            strokeWidth="2"
          />

          <text
            x="0"
            y="7"
            textAnchor="middle"
            className="aw6-science-tiny-dark"
          >
            ARES-7
          </text>
        </g>

      </g>


      <line
        className="aw6-range-marker"
        x1="500"
        y1="118"
        x2="500"
        y2="312"
      />

      <circle
        className="aw6-range-marker-dot"
        cx="500"
        cy="313"
        r="7"
      />

      <text
        className="aw6-science-label"
        x="500"
        y="337"
        textAnchor="middle"
      >
        CURRENT RANGE-TRIGGER SOLUTION
      </text>

    </g>
  );
}


function FuelVisual() {

  return (
    <g className="aw6-science aw6-nav-acquisition">

      <text
        className="aw6-science-caption"
        x="500"
        y="42"
        textAnchor="middle"
      >
        BUILD ONE TRUSTWORTHY STATE ESTIMATE
      </text>


      <path
        className="aw6-science-mars"
        d="
          M 20 360
          Q 500 306 980 360
          L 980 420
          L 20 420
          Z
        "
      />


      <g
        className="aw6-nav-lander"
        transform="translate(500 145)"
      >

        <path
          d="
            M 0 -50
            C -28 -36 -36 3 -28 52
            L 28 52
            C 36 3 28 -36 0 -50
            Z
          "
          fill="#dfe6ec"
          stroke="#9baab8"
          strokeWidth="2"
        />

        <text
          x="0"
          y="6"
          textAnchor="middle"
          className="aw6-science-tiny-dark"
        >
          ARES-7
        </text>

      </g>


      <g
        className="aw6-nav-heatshield"
        transform="translate(500 311)"
      >

        <path
          d="
            M -62 0
            Q 0 31 62 0
            L 47 21
            Q 0 50 -47 21
            Z
          "
        />

        <text
          x="0"
          y="63"
          textAnchor="middle"
          className="aw6-science-label"
        >
          HEAT SHIELD SEPARATED
        </text>

      </g>


      <g className="aw6-nav-sensor aw6-nav-radar">

        <rect
          x="85"
          y="105"
          width="185"
          height="76"
          rx="16"
        />

        <text
          x="177"
          y="134"
          textAnchor="middle"
        >
          RADAR
        </text>

        <text
          className="good"
          x="177"
          y="158"
          textAnchor="middle"
        >
          RANGE LOCK
        </text>

        <path
          d="M 271 145 L 430 157"
        />

      </g>


      <g className="aw6-nav-sensor aw6-nav-imu">

        <rect
          x="85"
          y="214"
          width="185"
          height="76"
          rx="16"
        />

        <text
          x="177"
          y="243"
          textAnchor="middle"
        >
          IMU
        </text>

        <text
          className="good"
          x="177"
          y="267"
          textAnchor="middle"
        >
          MOTION VALID
        </text>

        <path
          d="M 271 252 L 430 172"
        />

      </g>


      <g className="aw6-nav-sensor aw6-nav-vision">

        <rect
          x="730"
          y="159"
          width="185"
          height="76"
          rx="16"
        />

        <text
          x="822"
          y="188"
          textAnchor="middle"
        >
          VISION
        </text>

        <text
          x="822"
          y="212"
          textAnchor="middle"
        >
          MAP FEATURES
        </text>

        <path
          d="M 729 197 L 570 166"
        />

      </g>


      <g
        className="aw6-nav-state"
        transform="translate(500 205)"
      >

        <circle
          r="59"
        />

        <text
          x="0"
          y="-7"
          textAnchor="middle"
        >
          STATE
        </text>

        <text
          x="0"
          y="15"
          textAnchor="middle"
        >
          ESTIMATE
        </text>

      </g>

    </g>
  );
}


function StructureVisual() {

  return (
    <g className="aw6-science aw6-trn">

      <text
        className="aw6-science-caption"
        x="500"
        y="42"
        textAnchor="middle"
      >
        TERRAIN MAP · HAZARDS · REACHABLE SAFE SITES
      </text>


      <rect
        className="aw6-trn-map"
        x="60"
        y="72"
        width="880"
        height="285"
        rx="30"
      />


      <path
        className="aw6-trn-contour"
        d="
          M 89 270
          C 220 180 300 310 420 227
          C 540 145 620 274 760 180
          C 830 133 888 170 921 125
        "
      />

      <path
        className="aw6-trn-contour"
        d="
          M 107 142
          C 221 102 295 173 376 130
          C 470 80 601 131 685 104
          C 788 72 851 92 909 74
        "
      />


      <g className="aw6-trn-hazard">

        <circle
          cx="355"
          cy="199"
          r="57"
        />

        <text
          x="355"
          y="204"
          textAnchor="middle"
        >
          ROCK FIELD
        </text>

      </g>


      <g className="aw6-trn-hazard">

        <circle
          cx="710"
          cy="246"
          r="48"
        />

        <text
          x="710"
          y="251"
          textAnchor="middle"
        >
          STEEP
        </text>

      </g>


      <ellipse
        className="aw6-trn-reachable"
        cx="500"
        cy="212"
        rx="300"
        ry="121"
      />


      <g className="aw6-trn-original">

        <circle
          cx="355"
          cy="199"
          r="12"
        />

        <path
          d="
            M 347 191
            L 363 207
            M 363 191
            L 347 207
          "
        />

        <text
          x="355"
          y="277"
          textAnchor="middle"
        >
          ORIGINAL AIM POINT
        </text>

      </g>


      <g className="aw6-trn-safe">

        <circle
          cx="575"
          cy="161"
          r="24"
        />

        <circle
          cx="575"
          cy="161"
          r="7"
        />

        <text
          x="575"
          y="127"
          textAnchor="middle"
        >
          SAFE SITE A
        </text>

      </g>


      <g className="aw6-trn-safe">

        <circle
          cx="615"
          cy="292"
          r="20"
        />

        <circle
          cx="615"
          cy="292"
          r="6"
        />

        <text
          x="615"
          y="326"
          textAnchor="middle"
        >
          SAFE SITE B
        </text>

      </g>


      <g
        className="aw6-trn-vehicle"
        transform="translate(495 212)"
      >

        <path
          d="
            M 0 -21
            L 16 16
            L 0 9
            L -16 16
            Z
          "
        />

      </g>

    </g>
  );
}


function PowerVisual() {

  return (
    <g className="aw6-science aw6-powered-descent">

      <text
        className="aw6-science-caption"
        x="500"
        y="42"
        textAnchor="middle"
      >
        BACKSHELL SEPARATION → ROCKET-POWERED BRAKING
      </text>


      <path
        className="aw6-science-mars"
        d="
          M 20 370
          Q 500 318 980 370
          L 980 420
          L 20 420
          Z
        "
      />


      <g
        className="aw6-pd-backshell"
        transform="translate(245 117) rotate(-16)"
      >

        <path
          d="
            M -63 0
            Q 0 -45 63 0
            L 45 23
            Q 0 38 -45 23
            Z
          "
        />

        <path
          d="M -50 -5 Q 0 -62 50 -5"
        />

        <text
          x="0"
          y="59"
          textAnchor="middle"
          className="aw6-science-label"
        >
          BACKSHELL + CHUTE
        </text>

      </g>


      <path
        className="aw6-pd-separation"
        d="
          M 310 145
          C 385 164 411 181 447 205
        "
      />


      <g
        className="aw6-pd-lander"
        transform="translate(565 185)"
      >

        <path
          d="
            M 0 -70
            C -34 -52 -41 0 -32 61
            L 32 61
            C 41 0 34 -52 0 -70
            Z
          "
          fill="#e7ecef"
          stroke="#9aa8b5"
          strokeWidth="2"
        />

        <path
          d="M -32 37 L -59 65"
        />

        <path
          d="M 32 37 L 59 65"
        />

        <text
          x="0"
          y="2"
          textAnchor="middle"
          className="aw6-science-tiny-dark"
        >
          ARES-7
        </text>


        <g className="aw6-pd-engines">

          <path
            d="M -22 60 L -31 117 L -10 77 Z"
          />

          <path
            d="M 0 61 L -8 126 L 8 126 Z"
          />

          <path
            d="M 22 60 L 31 117 L 10 77 Z"
          />

        </g>

      </g>


      <line
        className="aw6-pd-altitude"
        x1="765"
        y1="113"
        x2="765"
        y2="347"
      />

      <text
        className="aw6-science-label"
        x="786"
        y="232"
      >
        STOPPING DISTANCE
      </text>


      <text
        className="aw6-pd-label"
        x="565"
        y="329"
        textAnchor="middle"
      >
        3-ENGINE LANDING BURN
      </text>

    </g>
  );
}


function LandingVisual() {

  return (
    <g className="aw6-science aw6-fault-management">

      <text
        className="aw6-science-caption"
        x="500"
        y="42"
        textAnchor="middle"
      >
        THREE SENSORS · ONE BAD CHANNEL
      </text>


      <g className="aw6-fm-channel aw6-fm-bad">

        <rect
          x="85"
          y="90"
          width="230"
          height="82"
          rx="17"
        />

        <text
          x="200"
          y="120"
          textAnchor="middle"
        >
          RADAR CH-B
        </text>

        <text
          x="200"
          y="147"
          textAnchor="middle"
        >
          OUTLIERS
        </text>

      </g>


      <g className="aw6-fm-channel aw6-fm-good">

        <rect
          x="85"
          y="205"
          width="230"
          height="82"
          rx="17"
        />

        <text
          x="200"
          y="235"
          textAnchor="middle"
        >
          IMU
        </text>

        <text
          x="200"
          y="262"
          textAnchor="middle"
        >
          CONSISTENT
        </text>

      </g>


      <g className="aw6-fm-channel aw6-fm-good">

        <rect
          x="85"
          y="320"
          width="230"
          height="72"
          rx="17"
        />

        <text
          x="200"
          y="348"
          textAnchor="middle"
        >
          VISION
        </text>

        <text
          x="200"
          y="374"
          textAnchor="middle"
        >
          CONSISTENT
        </text>

      </g>


      <path
        className="aw6-fm-bad-line"
        d="
          M 316 131
          L 450 173
          L 478 125
          L 510 210
        "
      />

      <path
        className="aw6-fm-good-line"
        d="
          M 316 246
          C 393 242 438 230 510 220
        "
      />

      <path
        className="aw6-fm-good-line"
        d="
          M 316 356
          C 385 328 447 272 510 232
        "
      />


      <g
        className="aw6-fm-estimator"
        transform="translate(605 220)"
      >

        <circle
          r="78"
        />

        <text
          x="0"
          y="-7"
          textAnchor="middle"
        >
          STATE
        </text>

        <text
          x="0"
          y="17"
          textAnchor="middle"
        >
          ESTIMATOR
        </text>

      </g>


      <path
        className="aw6-fm-output"
        d="
          M 683 220
          L 850 220
        "
      />

      <g
        className="aw6-fm-vehicle"
        transform="translate(875 220)"
      >

        <path
          d="
            M 0 -44
            C -20 -31 -26 2 -20 40
            L 20 40
            C 26 2 20 -31 0 -44
            Z
          "
        />

      </g>


      <text
        className="aw6-science-label"
        x="605"
        y="326"
        textAnchor="middle"
      >
        WHICH MEASUREMENT SHOULD THE AUTONOMY TRUST?
      </text>

    </g>
  );
}


function FaultVisual() {

  return (
    <g className="aw6-science aw6-terminal-descent">

      <text
        className="aw6-science-caption"
        x="500"
        y="42"
        textAnchor="middle"
      >
        FINAL APPROACH · REMOVE SIDEWAYS MOTION
      </text>


      <path
        className="aw6-td-ground"
        d="
          M 20 357
          L 440 344
          L 980 371
          L 980 420
          L 20 420
          Z
        "
      />


      <line
        className="aw6-td-slope"
        x1="440"
        y1="344"
        x2="820"
        y2="363"
      />


      <g
        className="aw6-td-lander"
        transform="translate(505 178)"
      >

        <path
          d="
            M 0 -59
            C -30 -43 -35 2 -27 52
            L 27 52
            C 35 2 30 -43 0 -59
            Z
          "
          fill="#e4eaee"
          stroke="#9aa8b5"
          strokeWidth="2"
        />

        <path
          d="M -22 48 L -51 84"
        />

        <path
          d="M 22 48 L 51 84"
        />

        <path
          className="aw6-td-plume"
          d="M -15 51 L -29 128 L -2 62 Z"
        />

        <path
          className="aw6-td-plume"
          d="M 15 51 L 29 128 L 2 62 Z"
        />

      </g>


      <path
        className="aw6-td-lateral"
        d="
          M 420 135
          L 570 135
        "
      />

      <path
        className="aw6-td-arrow"
        d="
          M 570 135
          L 550 124
          M 570 135
          L 550 146
        "
      />


      <text
        className="aw6-td-warning"
        x="495"
        y="112"
        textAnchor="middle"
      >
        LATERAL VELOCITY 2.4 m/s →
      </text>


      <g className="aw6-td-dust">

        <ellipse
          cx="505"
          cy="333"
          rx="95"
          ry="21"
        />

        <ellipse
          cx="460"
          cy="318"
          rx="47"
          ry="14"
        />

        <ellipse
          cx="552"
          cy="316"
          rx="52"
          ry="15"
        />

      </g>


      <text
        className="aw6-science-label"
        x="760"
        y="333"
      >
        6.2° SLOPE
      </text>

    </g>
  );
}


function FinalVisual() {

  return (
    <g className="aw6-science aw6-landing-commit">

      <text
        className="aw6-science-caption"
        x="500"
        y="42"
        textAnchor="middle"
      >
        FINAL METERS · TARGET LOCKED
      </text>


      <path
        className="aw6-science-mars"
        d="
          M 20 357
          Q 500 323 980 357
          L 980 420
          L 20 420
          Z
        "
      />


      <g
        className="aw6-lc-target"
        transform="translate(500 346)"
      >

        <circle
          r="42"
        />

        <circle
          r="22"
        />

        <circle
          r="5"
        />

      </g>


      <g
        className="aw6-lc-lander"
        transform="translate(500 174)"
      >

        <path
          d="
            M 0 -58
            C -29 -43 -35 2 -27 51
            L 27 51
            C 35 2 29 -43 0 -58
            Z
          "
          fill="#e5ebef"
          stroke="#9aa8b5"
          strokeWidth="2"
        />

        <path
          d="M -23 47 L -52 89"
        />

        <path
          d="M 23 47 L 52 89"
        />

        <path
          className="aw6-lc-plume"
          d="M -14 50 L -31 145 L -2 61 Z"
        />

        <path
          className="aw6-lc-plume"
          d="M 14 50 L 31 145 L 2 61 Z"
        />

      </g>


      <g className="aw6-lc-dust">

        <ellipse
          cx="500"
          cy="321"
          rx="158"
          ry="35"
        />

        <ellipse
          cx="425"
          cy="298"
          rx="77"
          ry="28"
        />

        <ellipse
          cx="577"
          cy="297"
          rx="82"
          ry="28"
        />

      </g>


      <g className="aw6-lc-camera">

        <rect
          x="80"
          y="105"
          width="210"
          height="94"
          rx="16"
        />

        <text
          x="185"
          y="138"
          textAnchor="middle"
        >
          CAMERA
        </text>

        <text
          className="warning"
          x="185"
          y="168"
          textAnchor="middle"
        >
          DUST DEGRADED
        </text>

      </g>


      <g className="aw6-lc-state">

        <rect
          x="710"
          y="105"
          width="210"
          height="94"
          rx="16"
        />

        <text
          x="815"
          y="138"
          textAnchor="middle"
        >
          RADAR + IMU
        </text>

        <text
          className="good"
          x="815"
          y="168"
          textAnchor="middle"
        >
          VALID
        </text>

      </g>


      <line
        className="aw6-lc-lock"
        x1="500"
        y1="235"
        x2="500"
        y2="343"
      />


      <text
        className="aw6-science-label"
        x="500"
        y="393"
        textAnchor="middle"
      >
        LANDING TARGET LOCKED · LARGE RETARGETS DISCOURAGED
      </text>

    </g>
  );
}


function SceneCore({
  sceneId,
}: {
  sceneId: string;
}) {

  switch (
    sceneId
  ) {

    case "guided-entry":
      return (
        <EntryVisual />
      );

    case "range-trigger":
      return (
        <SensorVisual />
      );

    case "navigation-acquisition":
      return (
        <FuelVisual />
      );

    case "terrain-relative-navigation":
      return (
        <StructureVisual />
      );

    case "powered-descent":
      return (
        <PowerVisual />
      );

    case "fault-management":
      return (
        <LandingVisual />
      );

    case "terminal-descent":
      return (
        <FaultVisual />
      );

    case "landing-commit":
      return (
        <FinalVisual />
      );

    default:
      return (
        <EntryVisual />
      );
  }
}


function MissionVisual({
  sceneId,
  options,
  activeOptionId,
  selectedOptionId,
  onHover,
  onChoose,
}: MissionVisualProps) {

  const meta =
    SCENE_META[
      sceneId
    ] ??
    SCENE_META[
      "guided-entry"
    ];


  return (
    <section className="aw6-viz-shell">

      <header className="aw6-viz-header">

        <div>
          <span>
            ARES-7 FLIGHT MODEL
          </span>

          <strong>
            {meta.system}
          </strong>
        </div>

        <div className="aw6-viz-status">
          <i />
          {meta.status}
        </div>

      </header>


      <div className="aw6-viz-body">

        <aside className="aw6-viz-metrics">

          {meta.metrics.map(
            (
              metric,
            ) => (
              <div
                key={
                  metric.label
                }
                className={[
                  "aw6-viz-metric",

                  metric.tone
                    ? `aw6-viz-metric--${metric.tone}`
                    : "",
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    " ",
                  )}
              >

                <span>
                  {
                    metric.label
                  }
                </span>

                <strong>
                  {
                    metric.value
                  }
                </strong>

              </div>
            ),
          )}

        </aside>


        <div className="aw6-viz-canvas">

          <svg
            viewBox="0 0 1000 420"
            role="img"
            aria-label="Interactive mission model"
          >

            <defs>

              <linearGradient
                id="aw6Mars"
                x1="0"
                x2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#8f3f35"
                />

                <stop
                  offset="55%"
                  stopColor="#df7550"
                />

                <stop
                  offset="100%"
                  stopColor="#6e2e33"
                />
              </linearGradient>


              <radialGradient
                id="aw6Heat"
              >
                <stop
                  offset="0%"
                  stopColor="#ffc857"
                  stopOpacity=".72"
                />

                <stop
                  offset="50%"
                  stopColor="#ff6b6b"
                  stopOpacity=".30"
                />

                <stop
                  offset="100%"
                  stopColor="#ff6b6b"
                  stopOpacity="0"
                />
              </radialGradient>

            </defs>


            <g className="aw6-viz-grid">

              {[100, 200, 300].map(
                (y) => (
                  <line
                    key={`h-${y}`}
                    x1="40"
                    y1={y}
                    x2="960"
                    y2={y}
                  />
                ),
              )}

              {[
                200,
                400,
                600,
                800,
              ].map(
                (x) => (
                  <line
                    key={`v-${x}`}
                    x1={x}
                    y1="30"
                    x2={x}
                    y2="390"
                  />
                ),
              )}

            </g>


            <SceneCore
              sceneId={
                sceneId
              }
            />


            <g className="aw6-viz-links">

              {options.map(
                (
                  option,
                  index,
                ) => {

                  const point =
                    (
                      meta.system ===
                      "GUIDED ENTRY"
                        ? ENTRY_NODE_POSITIONS
                        : NODE_POSITIONS
                    )[
                      index
                    ];

                  const active =
                    activeOptionId ===
                    option.id;

                  return (
                    <path
                      key={
                        option.id
                      }
                      className={
                        active
                          ? "is-active"
                          : ""
                      }
                      d={`
                        M 500 225
                        Q ${point.x}
                          ${point.y - 80}
                          ${point.x}
                          ${point.y}
                      `}
                    />
                  );
                },
              )}

            </g>


            {options.map(
              (
                option,
                index,
              ) => {

                const point =
                  (
                      meta.system ===
                      "GUIDED ENTRY"
                        ? ENTRY_NODE_POSITIONS
                        : NODE_POSITIONS
                    )[
                    index
                  ];

                const active =
                  activeOptionId ===
                  option.id;

                const selected =
                  selectedOptionId ===
                  option.id;


                return (
                  <g
                    key={
                      option.id
                    }
                    className={[
                      "aw6-viz-node",

                      `aw6-viz-node--${index}`,

                      active
                        ? "is-active"
                        : "",

                      selected
                        ? "is-selected"
                        : "",
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(
                        " ",
                      )}
                    transform={`
                      translate(
                        ${point.x}
                        ${point.y}
                      )
                    `}
                    role="button"
                    tabIndex={
                      selectedOptionId
                        ? -1
                        : 0
                    }
                    aria-label={
                      `Choose ${option.title}`
                    }
                    onMouseEnter={() =>
                      onHover(
                        option.id,
                      )
                    }
                    onMouseLeave={() =>
                      onHover(
                        null,
                      )
                    }
                    onFocus={() =>
                      onHover(
                        option.id,
                      )
                    }
                    onBlur={() =>
                      onHover(
                        null,
                      )
                    }
                    onClick={() => {
                      if (
                        !selectedOptionId
                      ) {
                        onChoose(
                          option.id,
                        );
                      }
                    }}
                    onKeyDown={
                      (
                        event,
                      ) => {
                        if (
                          selectedOptionId
                        ) {
                          return;
                        }

                        if (
                          event.key ===
                            "Enter" ||
                          event.key ===
                            " "
                        ) {
                          event.preventDefault();

                          onChoose(
                            option.id,
                          );
                        }
                      }
                    }
                  >

                    <circle
                      className="aw6-viz-node-ring"
                      r="31"
                    />

                    <circle
                      className="aw6-viz-node-core"
                      r="9"
                    />

                    <text
                      className="aw6-viz-node-number"
                      x="0"
                      y="57"
                    >
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </text>




                  </g>
                );
              },
            )}

          </svg>

        </div>

      </div>



      <footer className="aw6-viz-footer">

        <span>
          {meta.summary}
        </span>

        <strong>
          {selectedOptionId
            ? "DECISION LOCKED"
            : activeOptionId
              ? "PROJECTED PATH"
              : "CHOOSE AN ENGINEERING PRIORITY"}
        </strong>

      </footer>

    </section>
  );
}


export default MissionVisual;
