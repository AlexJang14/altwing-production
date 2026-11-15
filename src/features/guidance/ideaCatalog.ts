import type { EngineeringMajorId } from "./guidanceTypes";

export type GuidanceIdeaType = "RESEARCH" | "EXTRACURRICULAR";

export interface GuidanceIdea {
  id: string;
  majorId: EngineeringMajorId;
  type: GuidanceIdeaType;
  title: string;
  summary: string;
  startingPoint: string;
}

const entries: Record<EngineeringMajorId, { research: string[][]; activities: string[][] }> = {
  aerospace: {
    research: [
      ["Orbital debris target selection", "Compare risk-first vs. reuse-aware removal strategies using public orbital data.", "Start with public orbital-element catalogs and a transparent scoring model."],
      ["Mars mobility mapping", "Test whether terrain resolution changes which rover routes look safest or most efficient.", "Start with NASA Mars topography/elevation datasets and route-cost metrics."],
      ["Aircraft efficiency tradeoffs", "Explore how simplified wing/loading assumptions change range, endurance, or stability tradeoffs.", "Start with a spreadsheet or Python model using public aerodynamic relationships."],
    ],
    activities: [
      ["Aerospace design journal", "Publish short explainers comparing real aerospace tradeoffs and your own calculations.", "Turn each post into a documented portfolio artifact."],
      ["Rocket / flight team", "Join or start a supervised rocketry, model aircraft, drone, or aerospace design group.", "Connect the activity to a competition or public demo."],
    ],
  },
  mechanical: {
    research: [
      ["Vibration isolation study", "Compare materials or geometries for reducing vibration in a small mechanical system.", "Measure acceleration with a phone or low-cost sensor and analyze frequency response."],
      ["Passive cooling optimization", "Test which geometry or surface configuration removes heat most effectively without active cooling.", "Use temperature sensors and a controlled heat source with safe operating limits."],
      ["Mechanism efficiency", "Compare linkage or gear configurations for force, speed, and motion tradeoffs.", "Model in CAD first, then validate with a simple prototype if available."],
    ],
    activities: [
      ["CAD redesign series", "Choose everyday objects and redesign one component for weight, strength, repairability, or manufacturing.", "Document constraints and before/after decisions."],
      ["Mechanical teardown club", "Analyze how safe household mechanisms work and publish engineering diagrams.", "Focus on design reasoning rather than destruction."],
    ],
  },
  electrical: {
    research: [
      ["Solar power tracking", "Compare simple control strategies for extracting useful power as lighting conditions change.", "Use a small solar cell, safe low-voltage electronics, and logged power data."],
      ["Sensor noise study", "Quantify how filtering choices change the accuracy and responsiveness of a sensor signal.", "Use public sensor datasets or a microcontroller sensor."],
      ["Power reliability model", "Model how component redundancy changes failure risk in a small electrical system.", "Use probability simulations rather than high-voltage hardware."],
    ],
    activities: [
      ["Circuit challenge library", "Create beginner-friendly circuit challenges with schematics and explanations.", "Publish simulations or low-voltage builds."],
      ["School energy audit", "Measure safe, accessible electrical usage patterns and propose evidence-based conservation ideas.", "Work with school staff before collecting any facility data."],
    ],
  },
  computer: {
    research: [
      ["Edge-AI tradeoff study", "Measure the accuracy, latency, and memory tradeoffs of smaller models on limited hardware.", "Use public datasets and openly available models."],
      ["Embedded anomaly detection", "Compare simple algorithms for detecting unusual sensor behavior in real time.", "Use synthetic or public sensor streams."],
      ["Network resilience simulation", "Test how routing strategies respond when nodes or links fail.", "Build a simulation rather than experimenting on real networks."],
    ],
    activities: [
      ["Open-source hardware project", "Build a small embedded tool and publish the code, wiring diagram, and design decisions.", "Keep the project focused on one useful problem."],
      ["Coding-for-community project", "Create a lightweight software tool for a club, teacher, nonprofit, or school process.", "Interview users first and measure whether it actually helps."],
    ],
  },
  chemical: {
    research: [
      ["Process energy optimization", "Model how temperature, flow, or recovery assumptions affect energy use in a simplified process.", "Use published process data or a safe simulation—no hazardous chemistry needed."],
      ["Adsorption comparison", "Compare safe household or classroom materials for removing a benign dye or contaminant proxy from water.", "Use teacher-approved materials and quantitative concentration measurements."],
      ["Reaction kinetics modeling", "Fit simple kinetic models to published reaction-rate datasets and compare assumptions.", "Work from open datasets instead of conducting hazardous reactions."],
    ],
    activities: [
      ["Process-flow explainer", "Turn a real manufacturing or energy process into a clear flow diagram and identify engineering tradeoffs.", "Use authoritative public sources and cite every assumption."],
      ["Green process challenge", "Redesign a familiar process to reduce waste, energy, or water use.", "Quantify the proposed improvement rather than only describing it."],
    ],
  },
  biomedical: {
    research: [
      ["Wearable signal quality", "Compare filtering methods for motion-corrupted heart-rate or activity signals using public datasets.", "Use de-identified public data; do not make medical diagnoses."],
      ["Prosthetic design tradeoffs", "Model how geometry and material choices affect weight, strength, or range of motion in an assistive device.", "Keep the work mechanical and non-clinical unless supervised."],
      ["Medical-device usability", "Study how interface choices affect task completion in a simulated health-device workflow.", "Use mock interfaces and consented usability testing, not real patient data."],
    ],
    activities: [
      ["Assistive design sprint", "Interview users or community partners and prototype a low-risk accessibility aid.", "Focus on usability, iteration, and documented feedback."],
      ["Bioengineering explainer series", "Translate one medical-device engineering concept per week for students.", "Separate engineering explanation from medical advice."],
    ],
  },
  civil: {
    research: [
      ["Intersection delay model", "Use public traffic counts to compare signal timing or intersection-design scenarios.", "Model changes without interfering with real traffic systems."],
      ["Stormwater risk mapping", "Identify where impervious surfaces and terrain could increase runoff risk in a local area.", "Use public GIS/elevation data and a transparent risk index."],
      ["Bridge vibration analysis", "Analyze public or simulated structural vibration data to compare damping assumptions.", "Use computational or scale-model methods."],
    ],
    activities: [
      ["Neighborhood infrastructure map", "Document accessibility, drainage, crossings, or transportation issues and propose evidence-based improvements.", "Use public spaces and avoid collecting private information."],
      ["Structural model team", "Build and test scale structures for load-to-weight efficiency.", "Connect it to Science Olympiad, TSA, or a school showcase."],
    ],
  },
  industrial: {
    research: [
      ["Queue optimization", "Model waiting time in a school, clinic, or service system under different staffing rules.", "Use anonymous counts or synthetic data."],
      ["Scheduling under constraints", "Compare algorithms for assigning limited rooms, machines, or volunteers to competing tasks.", "Measure delay, utilization, and fairness."],
      ["Supply-chain resilience", "Simulate how delays at one supplier affect cost and completion time across a small network.", "Use public or synthetic supply-chain data."],
    ],
    activities: [
      ["School process redesign", "Choose a frustrating school process and map its bottlenecks before proposing a better workflow.", "Measure before/after performance if the school adopts a change."],
      ["Operations dashboard", "Build a simple dashboard for a club or event to track inventory, schedules, or volunteer capacity.", "Use the dashboard to support real decisions."],
    ],
  },
  materials: {
    research: [
      ["Composite strength comparison", "Compare how fiber orientation or layered structure changes strength-to-weight in safe sample materials.", "Use teacher-approved materials or simulation."],
      ["Corrosion-data analysis", "Analyze public corrosion datasets to identify environmental factors associated with faster degradation.", "Keep experiments non-hazardous or computational."],
      ["Thermal insulation study", "Compare safe insulating materials using repeatable temperature-decay measurements.", "Control thickness, geometry, and initial temperature."],
    ],
    activities: [
      ["Materials failure archive", "Collect public engineering failure cases and explain the material mechanism behind each one.", "Cite engineering reports rather than sensational summaries."],
      ["Material selection challenge", "Pick a real product and justify a material choice using cost, strength, temperature, and sustainability constraints.", "Create a decision matrix and defend the tradeoff."],
    ],
  },
  environmental: {
    research: [
      ["Urban heat mapping", "Combine public temperature or satellite data with land-cover information to identify heat-island patterns.", "Use NASA/NOAA/local open data where possible."],
      ["Water-quality trend analysis", "Analyze public monitoring data to find seasonal or geographic patterns in water-quality indicators.", "Use official environmental datasets rather than collecting unsafe samples."],
      ["Air-quality exposure model", "Compare public air-quality readings with traffic, weather, or land-use variables.", "Use aggregate public data and avoid individual health claims."],
    ],
    activities: [
      ["Local sustainability audit", "Measure a school or community resource issue and propose a quantified engineering response.", "Coordinate with staff before collecting operational data."],
      ["Environmental data newsletter", "Publish short data-backed explainers about local air, water, heat, or waste trends.", "Link every chart to its original public dataset."],
    ],
  },
  nuclear: {
    research: [
      ["Radiation shielding simulation", "Compare how simplified shielding assumptions affect modeled attenuation using published reference data.", "Keep the project computational; do not source radioactive materials."],
      ["Grid reliability with nuclear", "Model how different generation mixes affect reliability and carbon intensity under changing demand.", "Use public energy-system datasets."],
      ["Reactor thermal systems", "Study simplified heat-removal tradeoffs using non-nuclear thermal models or published datasets.", "Focus on energy transfer rather than reactor construction details."],
    ],
    activities: [
      ["Energy systems comparison", "Build a transparent comparison of generation technologies using reliability, cost, land, and emissions data.", "Use government or academic sources and disclose assumptions."],
      ["Nuclear engineering explainer", "Create accessible explainers about radiation, energy, safety systems, and engineering careers.", "Keep content educational and source-based."],
    ],
  },
  robotics: {
    research: [
      ["Path-planning benchmark", "Compare route-planning algorithms under obstacles, uncertainty, or limited compute.", "Use simulation or a small safe robot platform."],
      ["Sensor fusion study", "Compare how combining two noisy sensors changes localization accuracy.", "Use public datasets or low-cost sensors."],
      ["Autonomy failure analysis", "Create controlled failure cases and compare how different recovery rules affect task completion.", "Keep testing in simulation or a safe workspace."],
    ],
    activities: [
      ["Robotics challenge team", "Join or form a robotics team focused on one measurable capability rather than a flashy demo.", "Track iteration history and test results."],
      ["Autonomy mini-project", "Build a small system that senses, decides, and acts, then document its failure cases.", "Make reliability and testing part of the project story."],
    ],
  },
  software: {
    research: [
      ["Reliability under load", "Compare how two software architectures behave as simulated traffic grows.", "Build a small benchmark with repeatable workloads and track latency, errors, and resource use."],
      ["Bug prediction from code signals", "Test whether simple code metrics can help identify files that are more likely to contain defects.", "Use an open-source repository and public issue history; avoid claiming causation from correlation."],
      ["Recommendation-system fairness", "Measure whether a ranking or recommendation algorithm systematically favors certain groups or categories under controlled inputs.", "Create synthetic test cases, define fairness metrics, and document tradeoffs rather than claiming one universal definition of fairness."],
    ],
    activities: [
      ["Build for a real user", "Create a focused web or mobile tool for a teacher, club, nonprofit, or local group, then iterate from feedback.", "Track user problems, versions, bugs, and measurable improvements—not just final screenshots."],
      ["Open-source contribution trail", "Contribute documentation, tests, bug fixes, or features to a student-friendly open-source project.", "Keep a public log explaining the issue, your change, review feedback, and what you learned."],
    ],
  },
  petroleum: {
    research: [
      ["Reservoir recovery simulation", "Compare how permeability, pressure, or well placement changes recovery in a simplified reservoir model.", "Use public educational datasets or a safe computational model; keep the project analytical rather than operational."],
      ["Drilling efficiency tradeoffs", "Model how depth, rate of penetration, downtime, and energy use affect a simplified drilling-cost scenario.", "Use published or synthetic data and clearly state assumptions."],
      ["Produced-water management", "Compare treatment or reuse scenarios for produced water using public environmental and engineering data.", "Focus on water volumes, treatment efficiency, cost, and environmental tradeoffs using public sources."],
    ],
    activities: [
      ["Energy systems case-study series", "Analyze how reservoir, drilling, production, economics, and environmental constraints interact in real energy projects.", "Use public technical reports and separate engineering evidence from advocacy."],
      ["Subsurface modeling project", "Build a simple visualization or simulation of pressure, flow, or resource movement underground.", "Use open geology or energy datasets and document the limits of your model."],
    ],
  },
};

export const GUIDANCE_IDEAS: GuidanceIdea[] = Object.entries(entries).flatMap(
  ([majorId, value]) => [
    ...value.research.map(([title, summary, startingPoint], index) => ({
      id: `${majorId}-research-${index + 1}`,
      majorId: majorId as EngineeringMajorId,
      type: "RESEARCH" as const,
      title,
      summary,
      startingPoint,
    })),
    ...value.activities.map(([title, summary, startingPoint], index) => ({
      id: `${majorId}-activity-${index + 1}`,
      majorId: majorId as EngineeringMajorId,
      type: "EXTRACURRICULAR" as const,
      title,
      summary,
      startingPoint,
    })),
  ],
);
