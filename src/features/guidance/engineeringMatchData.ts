import type { EngineeringMajorId } from "./guidanceTypes";

export type EngineeringSceneId =
  | "storm-relay"
  | "cold-chain"
  | "factory-drift"
  | "flood-water"
  | "orbital-safe-mode"
  | "subsurface-energy"
  | "hospital-pump"
  | "heatwave-city";

export interface MatchOption {
  id: string;
  label: string;
  detail: string;
  preview: string;
  patterns: string[];
  weights: Partial<Record<EngineeringMajorId, number>>;
}

export interface SceneMetric {
  label: string;
  value: string;
  tone?: "warning" | "good";
}

export interface MatchQuestion {
  id: string;
  sceneId: EngineeringSceneId;
  eyebrow: string;
  system: string;
  status: string;
  question: string;
  context: string;
  summary: string;
  metrics: SceneMetric[];
  options: MatchOption[];
}

export const ENGINEERING_MATCH_QUESTIONS: MatchQuestion[] = [
  {
    id: "q1",
    sceneId: "storm-relay",
    eyebrow: "SCENARIO 01 · STORM RELAY",
    system: "EMERGENCY DELIVERY NETWORK",
    status: "ROUTE CONFIDENCE LOW",
    question: "A storm has cut off a clinic. Your autonomous delivery drone has one battery cycle left. What do you do first?",
    context: "GPS is intermittent, one bridge may be damaged, and the medicine has to arrive within 28 minutes. There is no perfect answer—choose the move you would actually make.",
    summary: "A delivery drone must reach a clinic through a damaged transport network with incomplete navigation data.",
    metrics: [
      { label: "BATTERY", value: "41%", tone: "warning" },
      { label: "GPS", value: "INTERMITTENT", tone: "warning" },
      { label: "DEADLINE", value: "28 MIN" },
    ],
    options: [
      {
        id: "map-pass",
        label: "Spend two minutes mapping before committing.",
        detail: "Trade a little battery for a clearer picture of obstacles, wind, and access points.",
        preview: "The route becomes better understood, but the battery reserve shrinks.",
        patterns: ["measure before committing", "physical modeling", "work under uncertainty"],
        weights: { aerospace: 2, robotics: 2, electrical: 1, computer: 1, civil: 1 },
      },
      {
        id: "access-risk",
        label: "Treat ground access as the biggest unknown.",
        detail: "Recalculate around the damaged bridge and use the safest reachable handoff point.",
        preview: "The mission becomes less direct, but infrastructure risk is reduced.",
        patterns: ["protect system safety", "infrastructure thinking", "trade speed for reliability"],
        weights: { civil: 3, environmental: 1, industrial: 1, mechanical: 1 },
      },
      {
        id: "beacon-fusion",
        label: "Build a local navigation fix from the signals you still trust.",
        detail: "Fuse onboard sensing with temporary beacons instead of waiting for GPS to recover.",
        preview: "Navigation confidence rises without changing the physical route.",
        patterns: ["combine imperfect signals", "debug information first", "design around constraints"],
        weights: { electrical: 3, computer: 2, robotics: 2, software: 1, aerospace: 1 },
      },
      {
        id: "mission-repack",
        label: "Repack the mission around what absolutely must arrive.",
        detail: "Reduce payload, preserve reserve power, and sequence the delivery around the clinic's highest-priority need.",
        preview: "The mission becomes smaller and more reliable instead of maximizing everything at once.",
        patterns: ["optimize the whole system", "prioritize scarce resources", "design for people"],
        weights: { industrial: 3, mechanical: 1, biomedical: 1, software: 1 },
      },
    ],
  },
  {
    id: "q2",
    sceneId: "cold-chain",
    eyebrow: "SCENARIO 02 · COLD CHAIN",
    system: "MOBILE CLINIC STORAGE",
    status: "TEMPERATURE DRIFT",
    question: "A mobile clinic refrigerator is warming, but its two temperature sensors disagree. What is your first move?",
    context: "The backup generator is unstable and some medicine is much more temperature-sensitive than the rest.",
    summary: "A medical cold-chain system is drifting out of range while sensor data and backup power remain uncertain.",
    metrics: [
      { label: "SENSOR A", value: "8.4°C", tone: "warning" },
      { label: "SENSOR B", value: "5.9°C" },
      { label: "BACKUP", value: "UNSTABLE", tone: "warning" },
    ],
    options: [
      {
        id: "verify-sensors",
        label: "Verify the measurement before changing the system.",
        detail: "Use an independent reference and check whether one sensor is drifting or noisy.",
        preview: "You delay intervention briefly in exchange for trustworthy state information.",
        patterns: ["verify evidence first", "signal reasoning", "avoid false fixes"],
        weights: { electrical: 2, biomedical: 2, computer: 1, software: 1 },
      },
      {
        id: "thermal-path",
        label: "Trace where the heat is actually getting in.",
        detail: "Check insulation, airflow, door seals, and heat transfer before touching control settings.",
        preview: "The investigation shifts from the display to the physical thermal path.",
        patterns: ["trace physical causes", "test mechanisms", "measure before redesign"],
        weights: { mechanical: 2, materials: 2, chemical: 1, biomedical: 1 },
      },
      {
        id: "protect-stock",
        label: "Protect the most temperature-sensitive stock first.",
        detail: "Reorganize handling around stability windows while the root cause is still being diagnosed.",
        preview: "Patient risk drops even though the refrigerator problem is not solved yet.",
        patterns: ["design around human risk", "process thinking", "prioritize consequences"],
        weights: { chemical: 2, biomedical: 3, industrial: 1 },
      },
      {
        id: "load-schedule",
        label: "Rebuild the power schedule around the cooling load.",
        detail: "Shed noncritical loads and stabilize only the equipment needed to hold safe temperature.",
        preview: "The system becomes less capable overall, but critical cooling gets a larger safety margin.",
        patterns: ["allocate limited power", "system reliability", "operate with margin"],
        weights: { electrical: 2, industrial: 2, nuclear: 1, environmental: 1, mechanical: 1 },
      },
    ],
  },
  {
    id: "q3",
    sceneId: "factory-drift",
    eyebrow: "SCENARIO 03 · GHOST DEFECT",
    system: "AUTOMATED PRODUCTION CELL",
    status: "QUALITY LOSS",
    question: "An automated line starts producing bad parts even though the robot never reports a fault. Where do you look first?",
    context: "The first defects appeared after a new material batch arrived. Vision confidence also dropped slightly, but motor current looks normal.",
    summary: "A robotic production cell is drifting out of quality without a single obvious failure signal.",
    metrics: [
      { label: "DEFECT RATE", value: "7.8%", tone: "warning" },
      { label: "ROBOT", value: "NOMINAL", tone: "good" },
      { label: "VISION", value: "91%" },
    ],
    options: [
      {
        id: "material-batch",
        label: "Compare the defect pattern against the new material batch.",
        detail: "Test whether small changes in material properties explain when and where the defects appear.",
        preview: "The investigation focuses on the input material instead of the robot itself.",
        patterns: ["look for hidden physical variables", "failure analysis", "compare evidence across batches"],
        weights: { materials: 3, chemical: 2, industrial: 1 },
      },
      {
        id: "alignment",
        label: "Check whether the robot is accurately doing the motion it thinks it is doing.",
        detail: "Inspect calibration, coordinate frames, fixtures, and physical alignment under load.",
        preview: "The robot can be error-free in software while still being wrong in the real world.",
        patterns: ["connect digital commands to physical behavior", "calibration thinking", "prototype and test"],
        weights: { robotics: 3, mechanical: 2, computer: 1 },
      },
      {
        id: "replay-decisions",
        label: "Replay the system's decisions around the first bad units.",
        detail: "Compare logs, camera confidence, thresholds, and classification decisions before and after the drift began.",
        preview: "You look for a decision boundary that changed before the visible defect appeared.",
        patterns: ["trace logic through data", "reproduce edge cases", "debug complex systems"],
        weights: { software: 3, computer: 2, electrical: 1 },
      },
      {
        id: "instrument-line",
        label: "Instrument the whole line and find where variation first appears.",
        detail: "Track timing, process steps, measurements, and queues until the earliest divergence becomes visible.",
        preview: "The line becomes a measurable system instead of a collection of separate machines.",
        patterns: ["optimize end-to-end systems", "find bottlenecks", "use data to locate causes"],
        weights: { industrial: 3, electrical: 1, software: 1, mechanical: 1 },
      },
    ],
  },
  {
    id: "q4",
    sceneId: "flood-water",
    eyebrow: "SCENARIO 04 · AFTER THE FLOOD",
    system: "CITY WATER TREATMENT",
    status: "SOURCE WATER CHANGED",
    question: "After a flood, the treatment plant's water readings suddenly stop agreeing. What do you prioritize?",
    context: "Pumps are still working. Salinity and contamination may have changed, but the city cannot simply shut off water service.",
    summary: "A city water plant must maintain service while source-water chemistry, sensors, and demand are all changing at once.",
    metrics: [
      { label: "TURBIDITY", value: "+68%", tone: "warning" },
      { label: "FLOW", value: "92%", tone: "good" },
      { label: "DEMAND", value: "HIGH" },
    ],
    options: [
      {
        id: "sample-model",
        label: "Take independent samples and model treatment before changing dosage.",
        detail: "Confirm what changed in the water and how the current process will respond.",
        preview: "Treatment changes wait until chemistry is characterized with independent evidence.",
        patterns: ["model process behavior", "verify chemistry", "avoid uncontrolled changes"],
        weights: { environmental: 3, chemical: 3, materials: 1 },
      },
      {
        id: "sensor-reconcile",
        label: "Reconcile the sensor network before trusting any single reading.",
        detail: "Cross-check instruments, communications, calibration, and control-system data.",
        preview: "The plant first rebuilds confidence in its information layer.",
        patterns: ["combine imperfect signals", "systems debugging", "instrumentation thinking"],
        weights: { electrical: 2, computer: 2, software: 2, environmental: 1 },
      },
      {
        id: "service-priority",
        label: "Keep service alive by rerouting capacity around critical users.",
        detail: "Prioritize hospitals and essential demand while the plant operates below normal confidence.",
        preview: "The network is operated strategically rather than uniformly.",
        patterns: ["optimize constrained networks", "prioritize people", "system-level tradeoffs"],
        weights: { civil: 2, industrial: 3, environmental: 1 },
      },
      {
        id: "protect-intake",
        label: "Reduce what enters the plant before trying to treat everything downstream.",
        detail: "Change intake routing and physical barriers to limit sediment and debris load.",
        preview: "The solution attacks the physical boundary condition before downstream controls.",
        patterns: ["change the physical system", "design protective infrastructure", "reduce load at the source"],
        weights: { civil: 3, mechanical: 1, environmental: 2, materials: 1 },
      },
    ],
  },
  {
    id: "q5",
    sceneId: "orbital-safe-mode",
    eyebrow: "SCENARIO 05 · SAFE MODE",
    system: "RESEARCH SATELLITE",
    status: "ATTITUDE CONTROL DEGRADED",
    question: "A small research satellite is slowly tumbling and losing solar power. Which problem do you attack first?",
    context: "The star tracker is temporarily blind, one reaction wheel is near its limit, and the satellite still has several weaker sensors available.",
    summary: "A research satellite must recover a stable state with degraded sensing, limited actuation, and falling power margin.",
    metrics: [
      { label: "POWER", value: "36%", tone: "warning" },
      { label: "STAR TRACKER", value: "BLIND", tone: "warning" },
      { label: "WHEEL", value: "87% SAT" },
    ],
    options: [
      {
        id: "state-estimate",
        label: "Rebuild the satellite's state estimate from the sensors that still work.",
        detail: "Combine imperfect measurements so the controller knows where the spacecraft actually is.",
        preview: "The system gains better knowledge before making a large corrective move.",
        patterns: ["estimate before acting", "sensor fusion", "control under uncertainty"],
        weights: { aerospace: 3, electrical: 2, computer: 2, robotics: 1 },
      },
      {
        id: "momentum",
        label: "Change the actuator plan before the reaction wheel saturates completely.",
        detail: "Use the available hardware differently so the system keeps control authority.",
        preview: "Control margin improves by changing how physical actuators share the work.",
        patterns: ["preserve control authority", "physical system reasoning", "design around hardware limits"],
        weights: { aerospace: 2, mechanical: 2, robotics: 3, electrical: 1 },
      },
      {
        id: "safe-software",
        label: "Rewrite the safe-mode priorities around the power that remains.",
        detail: "Disable nonessential behaviors, change fault logic, and protect only what recovery needs.",
        preview: "The satellite becomes intentionally simpler so critical software can keep it alive.",
        patterns: ["simplify complex systems", "fault-tolerant logic", "resource-aware software"],
        weights: { software: 3, computer: 2, electrical: 1, aerospace: 1 },
      },
      {
        id: "protect-hardware",
        label: "Protect temperature and power margins even if science operations are lost.",
        detail: "Accept lower mission performance to keep hardware inside survivable limits.",
        preview: "Mission output drops, but component survival margin grows.",
        patterns: ["protect safety margins", "thermal and energy reasoning", "reliability over performance"],
        weights: { aerospace: 1, materials: 2, electrical: 2, nuclear: 1, industrial: 1 },
      },
    ],
  },
  {
    id: "q6",
    sceneId: "subsurface-energy",
    eyebrow: "SCENARIO 06 · BELOW THE SURFACE",
    system: "SUBSURFACE ENERGY TEST",
    status: "PRESSURE RESPONSE CHANGED",
    question: "An underground energy test suddenly shows lower pressure, changing fluid composition, and rising vibration. What do you investigate first?",
    context: "The site is still inside operating limits, but the trend could indicate several very different failure paths.",
    summary: "A deep subsurface energy system shows a coupled pressure, fluid, vibration, and environmental anomaly.",
    metrics: [
      { label: "PRESSURE", value: "−14%", tone: "warning" },
      { label: "VIBRATION", value: "+22%" },
      { label: "BOUNDARY", value: "SAFE", tone: "good" },
    ],
    options: [
      {
        id: "reservoir-model",
        label: "Update the underground flow model from the pressure history.",
        detail: "Ask whether the system below the surface is behaving differently than the original model predicted.",
        preview: "The diagnosis starts by treating the underground formation as a dynamic system.",
        patterns: ["infer hidden systems from data", "model flow", "reason from indirect evidence"],
        weights: { petroleum: 4, software: 1, industrial: 1 },
      },
      {
        id: "flow-test",
        label: "Reduce the rate and test how the fluid behavior changes.",
        detail: "Use controlled operating changes to separate a flow problem from a measurement or equipment problem.",
        preview: "A deliberate operating change becomes an experiment instead of an emergency reaction.",
        patterns: ["change one variable at a time", "process experimentation", "fluid reasoning"],
        weights: { petroleum: 3, chemical: 2, mechanical: 1 },
      },
      {
        id: "integrity-check",
        label: "Inspect the physical integrity of the high-stress components.",
        detail: "Look for vibration, corrosion, fatigue, or material damage before increasing load again.",
        preview: "The investigation shifts toward what the hardware may physically be surviving.",
        patterns: ["failure analysis", "materials under stress", "protect hardware integrity"],
        weights: { materials: 3, mechanical: 2, petroleum: 1 },
      },
      {
        id: "contain-monitor",
        label: "Tighten containment and environmental monitoring while diagnosis continues.",
        detail: "Create a larger safety buffer around the site before chasing maximum production.",
        preview: "Operational performance is temporarily sacrificed for environmental and containment margin.",
        patterns: ["protect boundaries first", "environmental risk", "operate conservatively under uncertainty"],
        weights: { environmental: 3, petroleum: 1, civil: 1, industrial: 1, chemical: 1 },
      },
    ],
  },
  {
    id: "q7",
    sceneId: "hospital-pump",
    eyebrow: "SCENARIO 07 · FALSE ALARM",
    system: "HOSPITAL INFUSION PUMP",
    status: "INTERMITTENT ALERTS",
    question: "An infusion pump keeps alarming even though the delivered flow usually looks normal. What do you examine first?",
    context: "The alarms are annoying enough that some staff have started bypassing them. No patient has been harmed yet.",
    summary: "A medical device has noisy alarms, uncertain measurements, and a human workflow beginning to adapt around the problem.",
    metrics: [
      { label: "FLOW ERROR", value: "±3.1%" },
      { label: "ALARMS", value: "12 / SHIFT", tone: "warning" },
      { label: "PATIENT", value: "STABLE", tone: "good" },
    ],
    options: [
      {
        id: "signal-noise",
        label: "Characterize the noisy measurement before touching the alarm threshold.",
        detail: "Separate real flow variation from sensor noise, drift, and electrical interference.",
        preview: "The system may be behaving correctly while its measurement chain is not.",
        patterns: ["separate signal from noise", "measurement reasoning", "avoid masking symptoms"],
        weights: { biomedical: 2, electrical: 3, computer: 1 },
      },
      {
        id: "event-replay",
        label: "Reproduce an alarm from the event logs and firmware state.",
        detail: "Find the exact software conditions that trigger the warning and test the edge case deliberately.",
        preview: "An intermittent complaint becomes a repeatable software test.",
        patterns: ["reproduce edge cases", "trace software state", "debug before patching"],
        weights: { software: 3, computer: 2, biomedical: 1 },
      },
      {
        id: "bench-calibration",
        label: "Bench-test the pump mechanism against a trusted flow reference.",
        detail: "Measure whether the physical pumping hardware is actually delivering what the controller expects.",
        preview: "The device is separated from the clinical environment and tested as a physical machine.",
        patterns: ["test physical performance", "calibration", "connect model to reality"],
        weights: { mechanical: 2, biomedical: 3, materials: 1 },
      },
      {
        id: "workflow-design",
        label: "Redesign the alarm workflow so unsafe bypassing is harder while the root cause is fixed.",
        detail: "Treat staff behavior as part of the engineered system rather than a separate problem.",
        preview: "The solution changes both technology and process to reduce immediate risk.",
        patterns: ["design for real users", "systems and workflow", "reduce human-factor risk"],
        weights: { industrial: 3, biomedical: 2, software: 1 },
      },
    ],
  },
  {
    id: "q8",
    sceneId: "heatwave-city",
    eyebrow: "SCENARIO 08 · HEATWAVE",
    system: "CITY RESILIENCE CONTROL ROOM",
    status: "MULTI-SYSTEM STRESS",
    question: "A record heatwave is stressing the power grid, rail lines, water demand, and cooling centers at once. Where do you intervene first?",
    context: "Every option helps one part of the city, but resources are too limited to maximize everything at the same time.",
    summary: "A city faces simultaneous heat-driven stress across energy, infrastructure, water, transportation, and public health.",
    metrics: [
      { label: "GRID LOAD", value: "96%", tone: "warning" },
      { label: "RAIL TEMP", value: "61°C", tone: "warning" },
      { label: "COOLING", value: "87% FULL" },
    ],
    options: [
      {
        id: "grid-stability",
        label: "Protect power stability before demand reaches the hard limit.",
        detail: "Use load shedding, storage, and local generation so one failure does not cascade across the city.",
        preview: "Some loads are intentionally reduced to preserve the electrical system as a whole.",
        patterns: ["prevent cascading failure", "energy systems", "operate near hard limits"],
        weights: { electrical: 3, nuclear: 2, software: 1, industrial: 1 },
      },
      {
        id: "hot-structures",
        label: "Find the physical assets closest to their temperature and stress limits.",
        detail: "Target rail, bridge, road, and structural segments where heat could become a safety problem first.",
        preview: "Inspection resources move toward the places where material behavior is most likely to change.",
        patterns: ["protect critical structures", "materials under environment", "risk-based inspection"],
        weights: { civil: 2, materials: 3, mechanical: 1 },
      },
      {
        id: "allocate-demand",
        label: "Use demand data to rebalance cooling centers, transit, and water capacity.",
        detail: "Move limited resources toward the neighborhoods and times where they create the largest benefit.",
        preview: "The city is treated as one constrained network instead of four independent departments.",
        patterns: ["optimize networks", "allocate scarce capacity", "system-level decisions"],
        weights: { industrial: 3, civil: 2, software: 1, environmental: 1 },
      },
      {
        id: "reduce-exposure",
        label: "Reduce heat exposure itself where vulnerable people are concentrated.",
        detail: "Combine water, shade, air-quality, and local environmental measures around the highest-risk areas.",
        preview: "The intervention focuses on human exposure rather than only infrastructure performance.",
        patterns: ["design around human outcomes", "environmental systems", "prevent harm at the source"],
        weights: { environmental: 3, civil: 2, chemical: 1, biomedical: 1 },
      },
    ],
  },
];
