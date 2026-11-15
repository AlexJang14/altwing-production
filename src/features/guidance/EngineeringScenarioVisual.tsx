import type { EngineeringSceneId, MatchOption, MatchQuestion } from "./engineeringMatchData";
import "./engineering-scenario-visual.css";

interface EngineeringScenarioVisualProps {
  question: MatchQuestion;
  activeOption: MatchOption | null;
  selectedOptionId: string | null;
}

function CommonDefs() {
  return (
    <defs>
      <linearGradient id="esvMetal" x1="0" x2="1">
        <stop offset="0%" stopColor="#26324d" />
        <stop offset="30%" stopColor="#9fb3dc" />
        <stop offset="52%" stopColor="#f3f6ff" />
        <stop offset="76%" stopColor="#8195bd" />
        <stop offset="100%" stopColor="#1c2740" />
      </linearGradient>
      <linearGradient id="esvBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2f6de8" />
        <stop offset="100%" stopColor="#79b8ff" />
      </linearGradient>
      <linearGradient id="esvOrange" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffd176" />
        <stop offset="100%" stopColor="#ff6d57" />
      </linearGradient>
      <linearGradient id="esvGround" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1c2a48" />
        <stop offset="100%" stopColor="#0c1428" />
      </linearGradient>
      <linearGradient id="esvWater" x1="0" x2="1">
        <stop offset="0%" stopColor="#173a68" />
        <stop offset="50%" stopColor="#2b7ec0" />
        <stop offset="100%" stopColor="#123050" />
      </linearGradient>
      <linearGradient id="esvEarth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#338fd8" />
        <stop offset="44%" stopColor="#1e507f" />
        <stop offset="100%" stopColor="#0b1731" />
      </linearGradient>
      <radialGradient id="esvGlow">
        <stop offset="0%" stopColor="#8fbcff" stopOpacity=".5" />
        <stop offset="100%" stopColor="#8fbcff" stopOpacity="0" />
      </radialGradient>
      <filter id="esvShadow" x="-80%" y="-80%" width="260%" height="260%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity=".36" />
      </filter>
      <filter id="esvGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}

function StormRelay({ active }: { active: number }) {
  return (
    <g className="esv-scene">
      <path d="M0 405 C160 335 285 362 420 320 S730 286 1000 350 L1000 520 L0 520Z" fill="url(#esvGround)" />
      <path d="M0 430 C220 384 350 418 505 378 S810 354 1000 400" className="esv-terrain-edge" />
      <g opacity=".7">
        <path d="M44 121 q34-44 74 0 q34-34 70 0 q-6 28-41 29H73q-35-1-29-29Z" className="esv-storm-cloud" />
        <path d="M776 82 q34-44 74 0 q34-34 70 0 q-6 28-41 29h-74q-35-1-29-29Z" className="esv-storm-cloud" />
        <path d="M130 162 l-12 27 h17 l-11 26" className="esv-lightning" />
      </g>

      <g transform="translate(275 225)" filter="url(#esvShadow)" className={active === 2 ? "esv-focus" : ""}>
        <rect x="-54" y="-20" width="108" height="40" rx="18" fill="url(#esvMetal)" className="esv-object-stroke" />
        <rect x="-22" y="8" width="44" height="26" rx="8" className="esv-drone-cargo" />
        {[[-86,-24],[-86,24],[86,-24],[86,24]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><line x1={x<0?24:-24} y1={y<0?12:-12} x2="0" y2="0" className="esv-drone-arm"/><ellipse rx="28" ry="7" className="esv-rotor"/></g>)}
        <circle r="7" className="esv-drone-eye" />
      </g>

      <g transform="translate(760 286)" filter="url(#esvShadow)">
        <rect x="-75" y="-78" width="150" height="92" rx="8" className="esv-building-solid" />
        <path d="M-88 -78 L0 -135 L88 -78Z" className="esv-roof" />
        <rect x="-17" y="-46" width="34" height="60" className="esv-door" />
        <path d="M-8 -97 h16 M0 -105 v16" className="esv-clinic-cross" />
        <text x="0" y="41" className="esv-scene-label">CLINIC</text>
      </g>

      <g className={active === 1 ? "esv-focus" : ""}>
        <path d="M455 387 C520 352 571 348 631 363" className="esv-road" />
        <path d="M553 365 l23 -39 23 39" className="esv-bridge" />
        <line x1="555" y1="363" x2="596" y2="363" className="esv-bridge" />
        <line x1="568" y1="345" x2="581" y2="365" className="esv-warning-slash" />
      </g>

      <g className={active === 0 ? "esv-focus" : ""}>
        <path d="M306 220 C405 160 536 174 690 246" className="esv-route-primary" />
        <path d="M304 228 C432 264 540 281 680 286" className="esv-route-secondary" />
        <circle cx="474" cy="182" r="9" className="esv-beacon" /><circle cx="596" cy="205" r="9" className="esv-beacon" />
      </g>
      <g className={active === 3 ? "esv-focus" : ""} transform="translate(365 322)">
        <rect x="-60" y="-30" width="120" height="60" rx="12" className="esv-hud-card" />
        <text x="-43" y="-7" className="esv-hud-mini">MED PAYLOAD</text>
        <rect x="-42" y="3" width="84" height="10" rx="5" className="esv-hud-track" />
        <rect x="-42" y="3" width="55" height="10" rx="5" className="esv-hud-fill" />
      </g>
    </g>
  );
}

function ColdChain({ active }: { active: number }) {
  return (
    <g className="esv-scene">
      <rect x="88" y="85" width="824" height="320" rx="30" className="esv-room" />
      <path d="M88 337 H912" className="esv-floor" />
      <g transform="translate(498 235)" filter="url(#esvShadow)">
        <rect x="-150" y="-132" width="300" height="264" rx="26" className="esv-fridge-body" />
        <rect x="-118" y="-102" width="236" height="162" rx="18" className={active===1?"esv-fridge-window esv-focus":"esv-fridge-window"} />
        <path d="M-98 -50 H98 M-98 6 H98" className="esv-shelf" />
        {[-72,-42,-12,18,48,78].map((x,i)=><g key={x} transform={`translate(${x} ${i%2?-17:32})`}><rect x="-8" y="-20" width="16" height="28" rx="4" className="esv-vial"/><rect x="-6" y="-25" width="12" height="6" rx="2" className="esv-vial-cap"/></g>)}
        <rect x="-78" y="80" width="156" height="26" rx="9" className="esv-fridge-panel" />
        <circle cx="-54" cy="93" r="6" className="esv-good-light" /><circle cx="-32" cy="93" r="6" className="esv-warning-light" />
        <text x="18" y="98" className="esv-temp-text">6.8°C</text>
      </g>
      <g className={active===0?"esv-focus":""} transform="translate(185 202)">
        <rect x="-68" y="-58" width="136" height="116" rx="18" className="esv-sensor-panel" />
        <text x="-48" y="-28" className="esv-hud-mini">SENSOR CHECK</text>
        <text x="-48" y="3" className="esv-sensor-a">A  8.4°C</text>
        <text x="-48" y="34" className="esv-sensor-b">B  5.9°C</text>
      </g>
      <g className={active===3?"esv-focus":""} transform="translate(810 226)">
        <rect x="-74" y="-82" width="148" height="164" rx="18" className="esv-generator" />
        <circle cy="-23" r="29" className="esv-generator-gauge" />
        <path d="M0 -23 l17 -13" className="esv-gauge-hand" />
        <path d="M-24 31 h48 M-24 48 h48" className="esv-generator-vents" />
        <path d="M0 -66 l-15 30 h17 l-15 31" className="esv-power-mark" />
      </g>
      <g className={active===2?"esv-focus":""}>
        <path d="M350 115 C390 70 610 70 650 115" className="esv-cooling-loop" />
        <circle cx="394" cy="87" r="8" className="esv-cool-dot" /><circle cx="606" cy="87" r="8" className="esv-cool-dot" />
      </g>
    </g>
  );
}

function FactoryDrift({ active }: { active: number }) {
  return (
    <g className="esv-scene">
      <rect x="54" y="74" width="892" height="342" rx="26" className="esv-factory-room" />
      <path d="M96 330 H903" className="esv-conveyor-base" />
      <rect x="92" y="300" width="814" height="32" rx="10" className="esv-conveyor-belt" />
      {[155,250,345,440,535,630,725,820].map((x,i)=><g key={x} className={i>5?"esv-part-group is-bad":"esv-part-group"}><rect x={x} y="276" width="56" height="24" rx="5" className="esv-factory-part"/><path d={`M${x+9} 288 h38`} className="esv-part-line"/></g>)}
      <g transform="translate(390 220)" filter="url(#esvShadow)" className={active===1?"esv-focus":""}>
        <rect x="-58" y="58" width="116" height="40" rx="9" className="esv-robot-base" />
        <circle cy="42" r="30" className="esv-robot-joint" />
        <path d="M0 15 L45 -42 L93 -8" className="esv-robot-arm" />
        <circle cx="45" cy="-42" r="17" className="esv-robot-joint" />
        <circle cx="93" cy="-8" r="13" className="esv-robot-joint" />
        <path d="M93 -8 l28 -11 M93 -8 l27 13" className="esv-gripper" />
      </g>
      <g transform="translate(680 145)" className={active===2?"esv-focus":""}>
        <rect x="-60" y="-46" width="120" height="92" rx="16" className="esv-vision-camera" />
        <circle r="27" className="esv-camera-lens" /><circle r="12" className="esv-camera-glass" />
        <path d="M0 46 V118" className="esv-scan-line" /><path d="M-48 118 H48" className="esv-scan-base" />
      </g>
      <g transform="translate(175 165)" className={active===0?"esv-focus":""}>
        <rect x="-58" y="-62" width="116" height="124" rx="15" className="esv-material-hopper" />
        <path d="M-42 -31 H42 L22 15 H-22Z" className="esv-hopper-fill" />
        {[[-22,-11],[0,-5],[22,-18],[-8,7],[18,9]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={6+i%3} className="esv-material-pellet"/>)}
      </g>
      <g className={active===3?"esv-focus":""} transform="translate(744 365)">
        <rect x="-130" y="-38" width="260" height="76" rx="14" className="esv-data-console" />
        <path d="M-102 15 l35 -18 35 7 34 -26 35 15 37 -10 34 12" className="esv-data-chart" />
        <text x="-105" y="-15" className="esv-hud-mini">PROCESS VARIATION</text>
      </g>
    </g>
  );
}

function FloodWater({ active }: { active: number }) {
  return (
    <g className="esv-scene">
      <path d="M0 365 C135 330 220 386 350 352 S635 319 1000 368 L1000 520 H0Z" fill="url(#esvWater)" opacity=".72" />
      <g transform="translate(510 215)" filter="url(#esvShadow)">
        <rect x="-190" y="-110" width="380" height="210" rx="22" className="esv-water-plant" />
        {[[-115,-32],[-32,-32],[52,-32],[135,-32]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="38" className={active===0&&i===0?"esv-water-tank esv-focus":"esv-water-tank"}/><path d={`M${x-24} ${y} h48`} className="esv-tank-water"/></g>)}
        <path d="M-77 -32 h7 M6 -32 h8 M90 -32 h7" className="esv-plant-pipe" />
        <rect x="-164" y="43" width="328" height="34" rx="11" className="esv-control-strip" />
      </g>
      <g className={active===1?"esv-focus":""}>
        {[190,240,290].map((y,i)=><g key={y}><circle cx="225" cy={y} r="9" className="esv-sample-node"/><path d={`M234 ${y} C270 ${y} 285 ${220+i*6} 320 ${220+i*6}`} className="esv-sample-link"/></g>)}
        <text x="175" y="169" className="esv-scene-label">FIELD SAMPLES</text>
      </g>
      <g className={active===2?"esv-focus":""} transform="translate(805 208)">
        <rect x="-82" y="-70" width="164" height="140" rx="18" className="esv-network-panel" />
        {[[-42,-22],[0,-35],[40,-12],[-20,28],[35,30]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="8" className="esv-network-node"/>)}
        <path d="M-42 -22 L0 -35 L40 -12 L35 30 L-20 28Z M0 -35 L-20 28" className="esv-network-link" />
      </g>
      <g className={active===3?"esv-focus":""}>
        <path d="M80 346 l55 -56 55 56" className="esv-flood-barrier" /><path d="M94 346 H176" className="esv-flood-barrier" />
        <path d="M70 373 C110 351 152 364 202 353" className="esv-flow-arrow" />
      </g>
    </g>
  );
}

function OrbitalSafeMode({ active }: { active: number }) {
  return (
    <g className="esv-scene">
      {[[90,80],[160,130],[820,96],[904,162],[754,48],[526,75],[362,54]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%3===0?2.7:1.5} className="esv-star"/>)}
      <path d="M0 448 Q500 265 1000 448 L1000 520 H0Z" fill="url(#esvEarth)" />
      <path d="M0 434 Q500 254 1000 434" className="esv-earth-glow" />
      <path d="M116 345 C260 132 600 96 874 314" className={active===1?"esv-orbit-path esv-focus":"esv-orbit-path"} />
      <g transform="translate(500 225)" filter="url(#esvShadow)">
        <rect x="-62" y="-52" width="124" height="104" rx="20" fill="url(#esvMetal)" className="esv-object-stroke" />
        <rect x="-28" y="-20" width="56" height="40" rx="8" className="esv-sat-core" />
        <path d="M-62 -28 L-226 -76 L-226 8 L-62 28 M62 -28 L226 -76 L226 8 L62 28" className={active===3?"esv-solar-panel esv-focus":"esv-solar-panel"} />
        {[-195,-156,-117,117,156,195].map((x)=><line key={x} x1={x} y1="-65" x2={x} y2="10" className="esv-panel-grid"/>)}
        <path d="M-12 -52 V-100 M12 -52 V-100" className="esv-antenna" /><path d="M-35 -102 Q0 -132 35 -102" className="esv-antenna-dish" />
      </g>
      <g className={active===0?"esv-focus":""} transform="translate(236 178)">
        <circle r="55" fill="url(#esvGlow)"/><circle r="12" className="esv-beacon"/><path d="M15 -4 Q120 -60 218 24" className="esv-signal-beam" />
      </g>
      <g className={active===2?"esv-focus":""} transform="translate(780 320)">
        <rect x="-105" y="-48" width="210" height="96" rx="16" className="esv-code-console" />
        <text x="-80" y="-20" className="esv-hud-mini">SAFE MODE</text>
        <path d="M-80 2 h76 M-80 20 h120 M-80 38 h93" className="esv-code-lines" />
      </g>
    </g>
  );
}

function SubsurfaceEnergy({ active }: { active: number }) {
  return (
    <g className="esv-scene">
      <rect x="0" y="0" width="1000" height="150" className="esv-sky" />
      <path d="M0 145 C180 124 332 162 492 140 S760 120 1000 148 L1000 520 H0Z" className="esv-soil" />
      <path d="M0 245 C180 212 318 270 500 240 S780 216 1000 250" className="esv-strata a" />
      <path d="M0 335 C180 304 360 362 548 330 S800 314 1000 345" className="esv-strata b" />
      <g transform="translate(505 123)" filter="url(#esvShadow)">
        <path d="M-54 0 L0 -105 L54 0 M-39 -22 H39 M-28 -45 H28 M-17 -68 H17" className="esv-derrick" />
        <rect x="-66" y="0" width="132" height="16" rx="5" className="esv-derrick-base" />
      </g>
      <path d="M505 139 V434" className={active===2?"esv-wellbore esv-focus":"esv-wellbore"} />
      <path d="M505 426 C615 386 706 383 821 401" className={active===1?"esv-reservoir-flow esv-focus":"esv-reservoir-flow"} />
      <g className={active===0?"esv-focus":""}>
        <path d="M177 387 C270 330 400 355 482 402 C392 448 275 455 177 387Z" className="esv-reservoir-body" />
        {[[230,382],[291,365],[350,390],[410,405]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="7" className="esv-pressure-dot"/>)}
        <path d="M230 382 C285 350 344 367 410 405" className="esv-pressure-line" />
      </g>
      <g transform="translate(820 190)" className={active===3?"esv-focus":""}>
        <rect x="-90" y="-66" width="180" height="132" rx="18" className="esv-monitor-panel" />
        <text x="-68" y="-37" className="esv-hud-mini">PRESSURE TREND</text>
        <path d="M-64 30 l28 -18 26 8 26 -32 26 16 28 -28" className="esv-monitor-chart" />
        <path d="M-64 42 H64" className="esv-chart-axis" />
      </g>
    </g>
  );
}

function HospitalPump({ active }: { active: number }) {
  return (
    <g className="esv-scene">
      <rect x="55" y="78" width="890" height="342" rx="28" className="esv-hospital-room" />
      <g transform="translate(515 236)" filter="url(#esvShadow)">
        <rect x="-114" y="-142" width="228" height="284" rx="30" className="esv-pump-body" />
        <rect x="-78" y="-103" width="156" height="82" rx="14" className="esv-pump-screen" />
        <path d="M-62 -58 l22 -12 20 18 18 -30 31 17 27 -9" className={active===0?"esv-pump-wave esv-focus":"esv-pump-wave"} />
        <circle cy="42" r="42" className={active===2?"esv-pump-dial esv-focus":"esv-pump-dial"} />
        <path d="M0 42 l22 -18" className="esv-dial-hand" />
        <rect x="-64" y="104" width="128" height="15" rx="7" className="esv-pump-slot" />
      </g>
      <g transform="translate(208 216)" className={active===1?"esv-focus":""}>
        <rect x="-92" y="-82" width="184" height="164" rx="18" className="esv-code-console" />
        <text x="-70" y="-48" className="esv-hud-mini">EVENT LOG</text>
        <path d="M-70 -15 h116 M-70 6 h80 M-70 27 h130 M-70 48 h94" className="esv-code-lines" />
        <circle cx="60" cy="-48" r="8" className="esv-warning-light" />
      </g>
      <g transform="translate(805 220)" className={active===3?"esv-focus":""}>
        <circle cy="-48" r="34" className="esv-user-head" />
        <path d="M-58 69 C-52 2 52 2 58 69" className="esv-user-body" />
        <rect x="-72" y="79" width="144" height="36" rx="12" className="esv-workflow-card" />
        <text x="0" y="102" textAnchor="middle" className="esv-hud-mini">NURSE WORKFLOW</text>
      </g>
      <path d="M629 228 C720 233 747 264 760 345" className="esv-iv-tube" />
    </g>
  );
}

function HeatwaveCity({ active }: { active: number }) {
  return (
    <g className="esv-scene">
      <rect width="1000" height="520" className="esv-heat-sky" />
      <circle cx="840" cy="92" r="50" className="esv-sun" /><circle cx="840" cy="92" r="82" className="esv-sun-glow" />
      <path d="M0 402 H1000 V520 H0Z" className="esv-city-ground" />
      {[88,168,256,344,438,548,658,762].map((x,i)=><g key={x} className={active===1&&i<4?"esv-focus":""}><rect x={x} y={336-(i%4)*42} width={64+(i%2)*10} height={66+(i%4)*42} rx="6" className="esv-building-tower"/>{[0,1,2].map(r=><g key={r}>{[0,1].map(c=><rect key={c} x={x+14+c*23} y={350-(i%4)*42+r*24} width="10" height="12" rx="2" className="esv-window"/>)}</g>)}</g>)}
      <g className={active===0?"esv-focus":""} transform="translate(225 150)">
        <rect x="-118" y="-56" width="236" height="112" rx="16" className="esv-grid-console" />
        <text x="-94" y="-28" className="esv-hud-mini">GRID LOAD</text>
        <path d="M-92 28 l28 -22 23 16 28 -44 31 34 28 -13 28 18" className="esv-grid-chart" />
        <text x="70" y="-25" className="esv-warning-number">96%</text>
      </g>
      <g className={active===2?"esv-focus":""} transform="translate(515 442)">
        <path d="M-260 0 C-155 -28 -60 22 30 -8 S170 -24 260 0" className="esv-demand-network" />
        {[-210,-90,30,145,235].map((x,i)=><g key={x}><circle cx={x} cy={i%2?-7:7} r="11" className="esv-demand-node"/><text x={x} y={(i%2?-7:7)+4} textAnchor="middle" className="esv-node-number">{i+1}</text></g>)}
      </g>
      <g className={active===3?"esv-focus":""} transform="translate(842 220)">
        <path d="M-70 18 q36-74 72-6 q36-68 72 6 q-72 72-144 0Z" className="esv-leaf" />
        <path d="M2 -10 V78" className="esv-leaf-stem" />
        <text x="2" y="102" textAnchor="middle" className="esv-scene-label">COOLING / SHADE</text>
      </g>
    </g>
  );
}

function Scene({ id, active }: { id: EngineeringSceneId; active: number }) {
  switch (id) {
    case "storm-relay": return <StormRelay active={active} />;
    case "cold-chain": return <ColdChain active={active} />;
    case "factory-drift": return <FactoryDrift active={active} />;
    case "flood-water": return <FloodWater active={active} />;
    case "orbital-safe-mode": return <OrbitalSafeMode active={active} />;
    case "subsurface-energy": return <SubsurfaceEnergy active={active} />;
    case "hospital-pump": return <HospitalPump active={active} />;
    case "heatwave-city": return <HeatwaveCity active={active} />;
  }
}

export default function EngineeringScenarioVisual({ question, activeOption, selectedOptionId }: EngineeringScenarioVisualProps) {
  const activeIndex = Math.max(0, question.options.findIndex((option) => option.id === activeOption?.id));

  return (
    <section className="esv-shell" aria-label={`${question.system} engineering scenario graphic`}>
      <div className="esv-header">
        <div><span>ALTWING RESPONSE SIMULATION</span><strong>{question.system}</strong></div>
        <div className="esv-status"><i />{question.status}</div>
      </div>

      <div className="esv-body">
        <aside className="esv-metrics">
          <div className="esv-mission-clock"><span>MISSION CLOCK</span><strong>+{String(question.id.replace("q", "")).padStart(2, "0")}:00</strong></div>
          {question.metrics.map((metric) => (
            <div key={metric.label} className={`esv-metric ${metric.tone ? `is-${metric.tone}` : ""}`}>
              <span>{metric.label}</span><strong>{metric.value}</strong>
            </div>
          ))}
        </aside>

        <div className="esv-canvas">
          <svg viewBox="0 0 1000 520" role="img" aria-label={question.summary}>
            <CommonDefs />
            <Scene id={question.sceneId} active={activeIndex} />
            <rect x="18" y="18" width="964" height="484" rx="24" className="esv-frame" />
            <path d="M34 68 H114 M886 68 H966 M34 452 H114 M886 452 H966" className="esv-frame-ticks" />
          </svg>
        </div>
      </div>

      <div className={`esv-response ${activeOption ? "is-active" : ""}`}>
        <div><span>{selectedOptionId ? "SIMULATED CONSEQUENCE" : "MISSION BRIEF"}</span><b>{activeOption ? `OPTION ${activeIndex + 1}` : "LIVE SYSTEM"}</b></div>
        <p>{activeOption?.preview ?? question.summary}</p>
      </div>
    </section>
  );
}
