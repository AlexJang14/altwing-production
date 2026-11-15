import { ADDITIONAL_OPPORTUNITIES } from "./additionalOpportunities";
import type { EngineeringMajorId, OpportunityCategory, StudentProfile } from "./guidanceTypes";

export interface GuidanceOpportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  location: string;
  state?: string;
  format: "IN PERSON" | "ONLINE" | "HYBRID" | "VARIES";
  status: "OPEN" | "UPCOMING" | "WATCH";
  timing: string;
  eligibility: string;
  cost: string;
  needsGradeCheck?: boolean;
  costBand: "FREE_PAID" | "UP_TO_500" | "FEES" | "UNKNOWN";
  description: string;
  majors: EngineeringMajorId[];
  grades: Array<"9" | "10" | "11" | "12">;
  officialUrl: string;
  lastVerified: string;
}

const allMajors: EngineeringMajorId[] = [
  "aerospace", "mechanical", "electrical", "computer", "chemical", "biomedical",
  "civil", "industrial", "materials", "environmental", "nuclear", "robotics", "software", "petroleum",
];

const CURATED_OPPORTUNITIES: GuidanceOpportunity[] = [
  {
    id: "gtri-2027",
    title: "2027 STEM@GTRI High School Summer Internship",
    organization: "Georgia Tech Research Institute",
    category: "INTERNSHIP",
    location: "Georgia",
    state: "GA",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "2027 pre-application launch is planned for Dec. 11, 2026.",
    eligibility: "Georgia high-school students; current posting says at least 16 by Apr. 4, 2027, graduating classes 2027–2029, plus listed U.S.-person requirements.",
    cost: "Paid internship",
    costBand: "FREE_PAID",
    description: "Five-week engineering and STEM research internship in GTRI labs, with projects that can include robotics, drones, radar, prototyping, electronics, and applied research.",
    majors: allMajors,
    grades: ["10", "11", "12"],
    officialUrl: "https://gtri.gatech.edu/stem/high-school-summer-internship",
    lastVerified: "2026-10-25",
  },
  {
    id: "stanford-shtem-2027",
    title: "Stanford SHTEM Summer Internship 2027",
    organization: "Stanford Compression Forum",
    category: "RESEARCH",
    location: "Stanford, California",
    state: "CA",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "Application expected to open Dec. 7, 2026 and close Feb. 21, 2027; program expected June 21–Aug. 6, 2027.",
    eligibility: "Current high-school juniors or seniors in 2026–27; U.S. citizens or permanent residents; age requirements apply.",
    cost: "Expected $95 application fee + $2,500 tuition; financial assistance described by the program.",
    costBand: "FEES",
    description: "Seven-week interdisciplinary research experience spanning engineering, computing, science, design, biology, neuroscience, and related fields.",
    majors: ["electrical", "computer", "software", "mechanical", "biomedical", "robotics", "materials", "industrial"],
    grades: ["11", "12"],
    officialUrl: "https://compression.stanford.edu/outreach/shtem-summer-internships-high-schoolers",
    lastVerified: "2026-10-25",
  },
  {
    id: "gmu-assip-2027",
    title: "Aspiring Scientists Summer Internship Program (ASSIP) 2027",
    organization: "George Mason University",
    category: "RESEARCH",
    location: "Fairfax, Virginia",
    state: "VA",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "2027 application opens Dec. 7, 2026 and closes Feb. 12, 2027.",
    eligibility: "Competitive research program for high-school and undergraduate students; final 2027 mentor/project details are posted by the program.",
    cost: "$25 application fee; accepted interns enroll in 3 credits with listed tuition, with financial-need waivers available.",
    costBand: "FEES",
    description: "Students work with faculty researchers on original STEM research and present results at a research symposium.",
    majors: allMajors,
    grades: ["10", "11", "12"],
    officialUrl: "https://science.gmu.edu/assip",
    lastVerified: "2026-10-25",
  },
  {
    id: "ut-sees-watch",
    title: "UT Austin / NASA SEES High School Internship",
    organization: "UT Austin Center for Space Research",
    category: "INTERNSHIP",
    location: "Austin, Texas + virtual projects",
    state: "TX",
    format: "HYBRID",
    status: "WATCH",
    timing: "The official page currently describes the 2026 cycle; monitor the site for a 2027 application update.",
    eligibility: "The 2026 cycle accepted current sophomores or juniors, required age 16 by the on-site start date, and required U.S. citizenship. Re-check the 2027 rules when posted.",
    cost: "Program structure varies by project; review the next official cycle for current cost/scholarship details.",
    costBand: "UNKNOWN",
    description: "NASA-supported research experience using mission and Earth-observation data across aerospace, remote sensing, mission design, drones, engineering, and science.",
    majors: ["aerospace", "mechanical", "electrical", "computer", "software", "environmental", "robotics"],
    grades: ["10", "11"],
    officialUrl: "https://csr.utexas.edu/education-outreach/high-school-internships/sees/",
    lastVerified: "2026-10-25",
  },
  {
    id: "nasa-stem-gateway",
    title: "NASA STEM Gateway — Grades 9–12 Opportunities",
    organization: "NASA",
    category: "SUMMER PROGRAM",
    location: "Multiple NASA centers / online",
    format: "VARIES",
    status: "OPEN",
    timing: "NASA STEM Gateway lists current internships, challenges, research experiences, and pre-college STEM opportunities as they open.",
    eligibility: "Eligibility varies by opportunity. Use each official listing for grade, age, citizenship, and location requirements.",
    cost: "Varies by opportunity",
    costBand: "UNKNOWN",
    description: "NASA's official portal for current STEM experiences, including engineering design, space science, research, challenges, and internships.",
    majors: ["aerospace", "mechanical", "electrical", "computer", "software", "materials", "environmental", "robotics"],
    grades: ["9", "10", "11", "12"],
    officialUrl: "https://www.nasa.gov/stem-content/nasa-stem-gateway/",
    lastVerified: "2026-10-25",
  },
  {
    id: "jhu-engineering-innovation",
    title: "Johns Hopkins Engineering Innovation Research Program",
    organization: "Johns Hopkins University",
    category: "SUMMER PROGRAM",
    location: "Baltimore, Maryland + online options",
    state: "MD",
    format: "HYBRID",
    status: "WATCH",
    timing: "Summer 2027 dates and application details are posted through Engineering Innovation as they are finalized.",
    eligibility: "Current high-school sophomores or juniors for the research program; residential age requirements apply.",
    cost: "Tuition-based college-credit program; current program notes say no financial aid for the research program.",
    costBand: "FEES",
    description: "Six-week engineering research experience working alongside Johns Hopkins researchers, with college credit and multiple participation formats.",
    majors: allMajors,
    grades: ["10", "11"],
    officialUrl: "https://ei.jhu.edu/programs/engineering-innovation-research-program/",
    lastVerified: "2026-10-25",
  },
  {
    id: "science-olympiad-2027",
    title: "Science Olympiad 2027 — Division C",
    organization: "Science Olympiad",
    category: "COMPETITION",
    location: "School teams across the U.S.",
    format: "IN PERSON",
    status: "OPEN",
    timing: "2027 Division C event slate is published; local and invitational tournament schedules vary.",
    eligibility: "High-school Division C participation normally occurs through a registered school team.",
    cost: "Team/school registration varies",
    costBand: "UNKNOWN",
    description: "2027 engineering-related events include Boomilever, Electric Vehicle, Mission Possible, Wright Stuff, Engineering CAD, Circuit Lab, Hovercraft, Thermodynamics, and more.",
    majors: allMajors,
    grades: ["9", "10", "11", "12"],
    officialUrl: "https://www.soinc.org/events/2027-division-c-events",
    lastVerified: "2026-10-25",
  },

  {
    id: "afrl-scholars-2027",
    title: "AFRL Scholars Program — Summer 2027",
    organization: "Air Force Research Laboratory / USRA",
    category: "INTERNSHIP",
    location: "Multiple U.S. research locations",
    format: "IN PERSON",
    status: "OPEN",
    timing: "Summer 2027 full-time internship application is open through Jan. 11, 2027.",
    eligibility: "Upper-level high-school students may apply; official program requires U.S. citizenship and age 16+ by the application deadline. Individual projects can add requirements.",
    cost: "Stipend-paid internship",
    costBand: "FREE_PAID",
    description: "Project-based STEM internships inside Air Force research environments, with opportunities spanning aerospace, autonomy, materials, electronics, computing, sensors, and engineering research.",
    majors: ["aerospace", "mechanical", "electrical", "computer", "software", "materials", "robotics"],
    grades: ["11", "12"],
    officialUrl: "https://afrlscholars.usra.edu/",
    lastVerified: "2026-10-25",
  },
  {
    id: "cmu-sams-2027",
    title: "Carnegie Mellon Summer Academy for Math and Science (SAMS) 2027",
    organization: "Carnegie Mellon University",
    category: "SUMMER PROGRAM",
    location: "Pittsburgh, Pennsylvania",
    state: "PA",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "Six-week residential program June 26–Aug. 7, 2027; application deadline Feb. 1, 2027.",
    eligibility: "Students must be in 11th grade at application and at least 16 by June 26, 2027; U.S. citizen or permanent resident requirements apply.",
    cost: "No out-of-pocket tuition; financial documentation is part of the application review.",
    costBand: "FREE_PAID",
    description: "Rigorous STEM summer experience designed to deepen mathematics and science preparation while building a diverse, collaborative technical community.",
    majors: allMajors,
    grades: ["11"],
    officialUrl: "https://www.cmu.edu/pre-college/academic-programs/sams.html",
    lastVerified: "2026-10-25",
  },
  {
    id: "stanford-aimi-2027",
    title: "Stanford AIMI Summer Research Internship 2027",
    organization: "Stanford Center for Artificial Intelligence in Medicine & Imaging",
    category: "RESEARCH",
    location: "Stanford / program format per 2027 listing",
    state: "CA",
    format: "VARIES",
    status: "UPCOMING",
    timing: "Application opens Nov. 10, 2026 and closes Feb. 1, 2027.",
    eligibility: "High-school program focused on mentored health-AI research; confirm the 2027 application page for complete age, residency, and participation requirements.",
    cost: "Check official 2027 program page for current cost or stipend details",
    costBand: "UNKNOWN",
    description: "Mentored research at the intersection of AI, engineering, medical imaging, and healthcare using real-world technical problems and data.",
    majors: ["biomedical", "computer", "software", "electrical", "industrial"],
    grades: ["10", "11", "12"],
    officialUrl: "https://aimi.stanford.edu/education/summer-research-internship",
    lastVerified: "2026-10-25",
  },
  {
    id: "stonybrook-simons-2027",
    title: "Simons Summer Research Program 2027",
    organization: "Stony Brook University",
    category: "RESEARCH",
    location: "Stony Brook, New York",
    state: "NY",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "Program runs June 28–Aug. 6, 2027; application link is scheduled to post Nov. 15, 2026.",
    eligibility: "High-school juniors are nominated by their schools. Students join faculty research groups in science, math, and engineering.",
    cost: "Check the official 2027 application for current participation and housing details",
    costBand: "UNKNOWN",
    description: "Six-week faculty-mentored research experience where students contribute to active research, analyze data, and present a research poster.",
    majors: allMajors,
    grades: ["11"],
    officialUrl: "https://www.stonybrook.edu/simons/",
    lastVerified: "2026-10-25",
  },
  {
    id: "bu-rise-2027",
    title: "Boston University RISE Internship / Practicum 2027",
    organization: "Boston University",
    category: "RESEARCH",
    location: "Boston, Massachusetts",
    state: "MA",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "Applications open Dec. 17, 2026; deadline Feb. 3, 2027; six-week program June 27–Aug. 6, 2027.",
    eligibility: "For students entering senior year in fall 2027; U.S. citizens and legal permanent residents. Summer 2027 is test-optional.",
    cost: "Tuition-based program; financial aid application is available and shares the application deadline.",
    costBand: "FEES",
    description: "University-level research with tracks that include biomedical engineering, electrical and computer engineering, mechanical engineering, chemistry, computing, environment, and other STEM areas.",
    majors: ["biomedical", "electrical", "computer", "software", "mechanical", "chemical", "environmental", "materials"],
    grades: ["11"],
    officialUrl: "https://www.bu.edu/summer/high-school-programs/rise-internship-practicum/",
    lastVerified: "2026-10-25",
  },
  {
    id: "gatech-iexperience-2027",
    title: "Georgia Tech iExperience Summer Program 2027",
    organization: "Georgia Tech H. Milton Stewart School of Industrial and Systems Engineering",
    category: "SUMMER PROGRAM",
    location: "Atlanta, Georgia",
    state: "GA",
    format: "IN PERSON",
    status: "WATCH",
    timing: "One-week Summer 2027 program; official page says dates, eligibility, and application information will be announced soon.",
    eligibility: "High-school STEM exploration program; monitor the official 2027 posting for grade and application requirements.",
    cost: "2027 cost information not yet posted",
    costBand: "UNKNOWN",
    description: "Hands-on introduction to industrial and systems engineering through logistics, sports analytics, AI, disaster preparedness, design challenges, and data-driven decision making.",
    majors: ["industrial", "computer", "mechanical", "civil", "environmental"],
    grades: ["9", "10", "11", "12"],
    officialUrl: "https://case.isye.gatech.edu/engagement-initiatives/iexperience",
    lastVerified: "2026-10-25",
  },
  {
    id: "nist-ship-2027",
    title: "NIST Summer High School Internship Program (SHIP) 2027",
    organization: "National Institute of Standards and Technology",
    category: "INTERNSHIP",
    location: "Gaithersburg, Maryland or Boulder, Colorado",
    format: "IN PERSON",
    status: "WATCH",
    timing: "The official page says 2027 applications are expected in mid-October 2026 with applications due near the end of January 2027; program dates are TBD.",
    eligibility: "U.S. citizens; high-school junior or senior at application; minimum 3.0 unweighted GPA; permanent residence within 50 miles of the host campus; full seven-week commitment.",
    cost: "Unpaid educational internship",
    costBand: "FREE_PAID",
    description: "Seven-week research experience working with NIST scientists on projects across measurement science, engineering, computing, materials, physics, and related technical fields.",
    majors: ["mechanical", "electrical", "computer", "chemical", "materials", "industrial", "robotics"],
    grades: ["11", "12"],
    officialUrl: "https://www.nist.gov/ship",
    lastVerified: "2026-10-25",
  },

  {
    id: "navy-seap-2027",
    title: "Science and Engineering Apprentice Program (SEAP) 2027",
    organization: "Office of Naval Research / Navy laboratories",
    category: "INTERNSHIP",
    location: "25+ participating Navy laboratories across the U.S.",
    format: "IN PERSON",
    status: "OPEN",
    timing: "Summer 2027 application is open through Nov. 30, 2026; eight-week summer placement.",
    eligibility: "U.S. citizens; academically strong high-school students interested in STEM. Laboratory-specific requirements can vary.",
    cost: "Paid stipend: $4,000 first-year interns / $4,500 returning interns",
    costBand: "FREE_PAID",
    description: "Eight-week paid research apprenticeship in Navy laboratories working directly with scientists and engineers.",
    majors: allMajors,
    grades: ["10", "11", "12"],
    officialUrl: "https://www.onr.navy.mil/education-outreach/k-12-programs/seap",
    lastVerified: "2026-10-25",
  },
  {
    id: "lockheed-high-school-2027",
    title: "Lockheed Martin Summer 2027 High School Internship",
    organization: "Lockheed Martin",
    category: "INTERNSHIP",
    location: "Selected U.S. Lockheed Martin facilities",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "Applications open Nov. 2, 2026 through Jan. 3, 2027; summer internships run June–August 2027.",
    eligibility: "At least 16 at internship start; currently enrolled in a local high school and within commuting distance of a participating facility; graduating seniors are not eligible for the high-school program.",
    cost: "Paid internship; compensation varies by location/role",
    costBand: "FREE_PAID",
    description: "Industry internship with on-the-job training, mentoring, professional development, and exposure to aerospace and advanced technology work.",
    majors: ["aerospace", "mechanical", "electrical", "computer", "software", "materials", "industrial", "robotics"],
    grades: ["10", "11"],
    officialUrl: "https://www.lockheedmartin.com/en-us/careers/candidates/students-early-careers/high-school.html",
    lastVerified: "2026-10-25",
  },
  {
    id: "wright-scholar-2027",
    title: "Wright Scholar Research Assistant Program 2027",
    organization: "Air Force Research Laboratory",
    category: "INTERNSHIP",
    location: "Wright-Patterson Air Force Base, Ohio",
    state: "OH",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "Application period Nov. 1, 2026–Jan. 10, 2027; program June 7–July 30, 2027.",
    eligibility: "U.S. citizen; high-school junior or senior; age 16 by June 1, 2027; minimum 3.5 GPA; background check required.",
    cost: "Paid research-assistant program; see official posting for current compensation details",
    costBand: "FREE_PAID",
    description: "AFRL STEM research experience exposing high-school students to real engineering and science work in defense research laboratories.",
    majors: ["aerospace", "mechanical", "electrical", "computer", "software", "materials", "chemical", "robotics"],
    grades: ["11", "12"],
    officialUrl: "https://wpafbstem.com/Wright_Scholar/Wright_scholar.html",
    lastVerified: "2026-10-25",
  },
  {
    id: "utah-engineering-research-2027",
    title: "University of Utah High School Summer Research Internship 2027",
    organization: "University of Utah Price College of Engineering",
    category: "RESEARCH",
    location: "Salt Lake City, Utah",
    state: "UT",
    format: "IN PERSON",
    status: "WATCH",
    timing: "Summer-long engineering research internship; monitor the official page for the 2027 application window.",
    eligibility: "Official page states students graduating in 2028 can apply; technical readiness varies by lab/project.",
    cost: "No cost to participate; unpaid; housing not provided",
    costBand: "FREE_PAID",
    description: "Students join an engineering research lab, work on a faculty-led project, and present at an end-of-program symposium.",
    majors: allMajors,
    grades: ["11"],
    officialUrl: "https://www.price.utah.edu/k12/high-school-summer-research-internship",
    lastVerified: "2026-10-25",
  },
  {
    id: "columbia-shape-2027",
    title: "Columbia SHAPE Summer High School Academic Program for Engineers 2027",
    organization: "Columbia Engineering",
    category: "SUMMER PROGRAM",
    location: "New York, New York",
    state: "NY",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "Summer 2027 applications open in November; sessions July 5–23 and July 26–Aug. 13, 2027.",
    eligibility: "Rising sophomores, juniors, seniors, and recent graduates with demonstrated STEM interest.",
    cost: "Tuition-based program; financial aid/scholarship information is available from the program",
    costBand: "FEES",
    description: "Three-week college-level project courses in engineering, robotics, computer science, biomedical engineering, design, workshops, and company visits.",
    majors: ["mechanical", "electrical", "computer", "software", "biomedical", "robotics", "industrial"],
    grades: ["9", "10", "11", "12"],
    officialUrl: "https://outreach.engineering.columbia.edu/content/shape-summer-high-school-academic-program-engineers",
    lastVerified: "2026-10-25",
  },
  {
    id: "columbia-eng-2027",
    title: "Columbia Engineering the Next Generation (ENG) 2027",
    organization: "Columbia Engineering",
    category: "RESEARCH",
    location: "New York, New York",
    state: "NY",
    format: "IN PERSON",
    status: "WATCH",
    timing: "Six-week summer research program; monitor the official 2027 application cycle.",
    eligibility: "Program encourages rising seniors with an interest in engineering/research; local partner-school or track requirements may apply.",
    cost: "Paid stipend",
    costBand: "FREE_PAID",
    description: "Six-week authentic engineering research experience with Columbia faculty and graduate-student mentors plus research and college-prep workshops.",
    majors: ["mechanical", "electrical", "computer", "software", "biomedical", "civil", "industrial", "materials", "environmental", "robotics"],
    grades: ["11"],
    officialUrl: "https://outreach.engineering.columbia.edu/eng",
    lastVerified: "2026-10-25",
  },
  {
    id: "uchicago-stem-lab-2027",
    title: "UChicago PME Summer STEM Lab Internship 2027",
    organization: "University of Chicago Pritzker School of Molecular Engineering",
    category: "RESEARCH",
    location: "Chicago, Illinois",
    state: "IL",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "Summer 2027 applications open in March; six-week research program.",
    eligibility: "Must attend a Chicago high school and be at least 16 by the first program day.",
    cost: "Paid internship",
    costBand: "FREE_PAID",
    description: "Six-week research-lab internship with a research bootcamp, mentoring, science communication, and college-application support.",
    majors: ["chemical", "materials", "biomedical", "electrical", "computer", "software", "environmental"],
    grades: ["10", "11", "12"],
    officialUrl: "https://pme.uchicago.edu/academics/stem-education-community-outreach/k-12-student-programs/after-school-stem-lab-internship",
    lastVerified: "2026-10-25",
  },
  {
    id: "ornl-ngsi-2027",
    title: "Oak Ridge Next Generation STEM Internship (NGSI) 2027",
    organization: "Oak Ridge National Laboratory",
    category: "INTERNSHIP",
    location: "Oak Ridge, Tennessee",
    state: "TN",
    format: "IN PERSON",
    status: "OPEN",
    timing: "Applications are open through Feb. 26, 2027; program begins June 7, 2027.",
    eligibility: "Local-county eligibility applies; high-school juniors, seniors, and eligible recent graduates can apply under the posted rules.",
    cost: "$500/week stipend for full-time participation",
    costBand: "FREE_PAID",
    description: "Hands-on STEM internship with ORNL researchers across computing, energy, materials, engineering, and national-lab research.",
    majors: allMajors,
    grades: ["10", "11", "12"],
    officialUrl: "https://www.ornl.gov/next-generation-stem-internship/",
    lastVerified: "2026-10-25",
  },
  {
    id: "ncstate-residential-2027",
    title: "NC State Engineering Residential Camps 2027",
    organization: "NC State College of Engineering",
    category: "SUMMER PROGRAM",
    location: "Raleigh, North Carolina",
    state: "NC",
    format: "IN PERSON",
    status: "WATCH",
    timing: "Official site says updated Summer 2027 camp offerings are forthcoming.",
    eligibility: "Designed for rising 11th- and 12th-grade students; workshop-specific requirements vary.",
    cost: "Program fee varies by 2027 workshop; check official posting",
    costBand: "UNKNOWN",
    description: "Residential engineering camps that let students explore a specific engineering field in depth while experiencing campus life.",
    majors: allMajors,
    grades: ["10", "11"],
    officialUrl: "https://tep.engr.ncsu.edu/k-12-student-programs/rising-11-12-residential-camps/",
    lastVerified: "2026-10-25",
  },
  {
    id: "ncstate-nuclear-2027",
    title: "NC State Young Investigators’ Summer Program in Nuclear Engineering 2027",
    organization: "NC State Nuclear Engineering",
    category: "SUMMER PROGRAM",
    location: "Raleigh, North Carolina",
    state: "NC",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "Two 2027 sessions: June 14–25 and July 12–23; application opens Feb. 2 and deadline is Apr. 30.",
    eligibility: "Rising juniors, rising seniors, and graduating seniors.",
    cost: "$3,000 all-inclusive residential program",
    costBand: "FEES",
    description: "Two-week nuclear-engineering experience with lectures, labs, projects, field trips, radiation applications, materials, security, and energy topics.",
    majors: ["nuclear", "materials", "mechanical", "electrical", "chemical"],
    grades: ["10", "11", "12"],
    officialUrl: "https://ne.ncsu.edu/pre-college-programs/",
    lastVerified: "2026-10-25",
  },
  {
    id: "ut-mite-2027",
    title: "UT Austin My Introduction to Engineering (MITE) 2027",
    organization: "UT Austin Cockrell School of Engineering",
    category: "SUMMER PROGRAM",
    location: "Austin, Texas",
    state: "TX",
    format: "IN PERSON",
    status: "OPEN",
    timing: "Session 1 runs June 13–17, 2027; registration deadline Mar. 1, 2027.",
    eligibility: "Current high-school juniors who will begin senior year after Summer 2027; applicants nationwide are invited.",
    cost: "$500 residential program",
    costBand: "UP_TO_500",
    description: "Five-day immersive engineering camp with team design work, hands-on activities, engineering exploration, college-life exposure, and admissions guidance.",
    majors: allMajors,
    grades: ["11"],
    officialUrl: "https://stemstarts.utexas.edu/program/my-introduction-to-engineering-session-1/",
    lastVerified: "2026-10-25",
  },
  {
    id: "tsa-engineering-2027",
    title: "Technology Student Association — High School Engineering Events",
    organization: "Technology Student Association",
    category: "COMPETITION",
    location: "School/state/national TSA",
    format: "IN PERSON",
    status: "OPEN",
    timing: "The 2027–2028 national high-school competitive event guide is published; state offerings can differ.",
    eligibility: "Participation generally runs through a TSA chapter; check Georgia TSA for state-level availability and deadlines.",
    cost: "Chapter/event fees vary",
    costBand: "UNKNOWN",
    description: "Engineering Design, Drone Challenge (UAV), Technology Problem Solving, coding, manufacturing, transportation, and other technical competitions.",
    majors: allMajors,
    grades: ["9", "10", "11", "12"],
    officialUrl: "https://tsaweb.org/competitions/high-school",
    lastVerified: "2026-10-25",
  },
  {
    id: "cmu-cee-2027",
    title: "CMU Pre-College Civil & Environmental Engineering 2027",
    organization: "Carnegie Mellon University",
    category: "SUMMER PROGRAM",
    location: "Pittsburgh, Pennsylvania",
    state: "PA",
    format: "IN PERSON",
    status: "UPCOMING",
    timing: "June 26–July 24, 2027; scholarship deadline Feb. 1 and basic application deadline Mar. 1, 2027.",
    eligibility: "Current sophomores or juniors; age 16 by program start; at least 3.0 GPA; one year of high-school physics or chemistry required before the program.",
    cost: "Tuition-based pre-college program; limited need-based scholarship opportunities are available.",
    costBand: "FEES",
    description: "Four-week hands-on program spanning infrastructure, sustainability, environmental engineering, intelligent systems, data, and a team design challenge.",
    majors: ["civil","environmental","industrial","materials","software","computer"],
    grades: ["10","11"],
    officialUrl: "https://www.cmu.edu/pre-college/academic-programs/cee.html",
    lastVerified: "2026-10-25",
  },
  {
    id: "princeton-llp-2027",
    title: "Princeton Laboratory Learning Program 2027",
    organization: "Princeton University Science Outreach",
    category: "RESEARCH",
    location: "Princeton, New Jersey",
    state: "NJ",
    format: "IN PERSON",
    status: "WATCH",
    timing: "2027 information is scheduled for February; the program page lists a mid-February application opening for the next cycle.",
    eligibility: "Local New Jersey high-school students only; typically age 16+ and U.S. citizens, with local housing and transportation required. Confirm the final 2027 posting.",
    cost: "Free research experience; housing and transportation are not provided.",
    costBand: "FREE_PAID",
    description: "Full-time local summer research placements in ongoing Princeton science or engineering projects under faculty and research-staff supervision.",
    majors: allMajors,
    grades: ["10","11","12"],
    officialUrl: "https://scienceoutreach.princeton.edu/laboratory-learning-program",
    lastVerified: "2026-10-25",
  },

];

export const GUIDANCE_OPPORTUNITIES: GuidanceOpportunity[] = [...CURATED_OPPORTUNITIES,...ADDITIONAL_OPPORTUNITIES];

function freeOrPaid(opportunity: GuidanceOpportunity) { return opportunity.costBand === "FREE_PAID"; }
function lowCost(opportunity: GuidanceOpportunity) { return freeOrPaid(opportunity) || opportunity.costBand === "UP_TO_500"; }
export function verificationLabel(opportunity: GuidanceOpportunity, now = new Date()) {
  const age = now.getTime() - new Date(`${opportunity.lastVerified}T00:00:00Z`).getTime();
  return age > 14 * 86400000 || age < -86400000 ? "REVIEW NEEDED" : "SOURCE CHECK RECORDED";
}

const INTEREST_TERMS: Record<string, string[]> = {
  Building: ["prototype", "design", "manufacturing", "mechanical", "build"],
  Coding: ["software", "coding", "computer", "data", "computational"],
  Chemistry: ["chemical", "chemistry", "materials", "molecular"],
  Biology: ["biology", "biomedical", "health", "neuro", "bio"],
  Environment: ["environment", "climate", "water", "sustainability"],
  Data: ["data", "analytics", "computational", "model"],
  Robotics: ["robot", "autonomous", "drone", "mechatronic"],
  Space: ["space", "aerospace", "satellite", "nasa"],
  Energy: ["energy", "nuclear", "power", "petroleum"],
  Software: ["software", "computer", "programming", "ai"],
  Geology: ["geology", "subsurface", "petroleum", "earth"],
  Infrastructure: ["civil", "infrastructure", "transportation", "water"],
};

export function rankOpportunities(majorId: EngineeringMajorId, profile: StudentProfile) {
  const state = profile.state.trim().toUpperCase();

  return GUIDANCE_OPPORTUNITIES
    .filter((opportunity) => opportunity.majors.includes(majorId))
    .filter((opportunity) => !profile.grade || (!opportunity.needsGradeCheck && opportunity.grades.includes(profile.grade)))
    .filter((opportunity) => profile.budgetPreference !== "FREE_PAID" || freeOrPaid(opportunity))
    .filter((opportunity) => profile.budgetPreference !== "LOW_COST" || lowCost(opportunity))
    .filter((opportunity) => {
      if (profile.locationPreference !== "NEAR_HOME" || !state) return true;
      return opportunity.state === state || opportunity.format === "ONLINE";
    })
    .map((opportunity) => {
      let score = 50;
      const reasons: string[] = ["Relevant to your selected engineering direction"];

      if (profile.grade && opportunity.grades.includes(profile.grade)) {
        score += 24;
        reasons.push(`Grade ${profile.grade} is listed; check full eligibility`);
      } else {
        score -= 18;
      }

      if (state && opportunity.state === state) {
        score += profile.locationPreference === "NEAR_HOME" ? 60 : 30;
        reasons.push("In your home state");
      }

      if (profile.locationPreference === "ONLINE_OK" && ["ONLINE", "HYBRID", "VARIES"].includes(opportunity.format)) {
        score += 18;
        reasons.push("Online / hybrid access");
      }

      if (profile.budgetPreference === "FREE_PAID" && freeOrPaid(opportunity)) {
        score += 25;
        reasons.push("Free, unpaid-no-fee, or paid opportunity");
      } else if (profile.budgetPreference === "LOW_COST" && lowCost(opportunity)) {
        score += 16;
        reasons.push("Listed program fee up to $500; extra expenses may apply");
      }

      const searchable = `${opportunity.title} ${opportunity.organization} ${opportunity.description} ${opportunity.eligibility}`.toLowerCase();
      const matchingInterests = profile.interests.filter((interest) =>
        (INTEREST_TERMS[interest] ?? []).some((term) => searchable.includes(term)),
      );
      if (matchingInterests.length > 0) {
        score += Math.min(24, matchingInterests.length * 8);
        reasons.push(`Matches your ${matchingInterests.slice(0, 2).join(" + ")} interests`);
      }

      if (opportunity.status === "OPEN") {
        score += 10;
        reasons.push("Catalog lists this as open; confirm the current cycle");
      } else if (opportunity.status === "UPCOMING") {
        score += 5;
      }

      return { opportunity, score, reasons };
    })
    .sort((a, b) => b.score - a.score || a.opportunity.title.localeCompare(b.opportunity.title));
}

