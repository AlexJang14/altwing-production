import {mergePublicContent,contentRecord,contentStatus} from '../../content/intelligence';
import { ADDITIONAL_OPPORTUNITIES } from "./additionalOpportunities";
import type { EngineeringMajorId, OpportunityCategory, StudentProfile } from "./guidanceTypes";

export interface GuidanceOpportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  location: string;
  state?: string;
  format: "IN PERSON" | "ONLINE" | "HYBRID" | "VARIES" | "UNKNOWN";
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
    "id": "gtri-2027",
    "title": "2027 STEM@GTRI High School Summer Internship",
    "organization": "Georgia Tech Research Institute",
    "category": "INTERNSHIP",
    "location": "Georgia",
    "state": "GA",
    "format": "IN PERSON",
    "status": "UPCOMING",
    "timing": "Pre-application launch planned Dec. 11, 2026. Currently posted dates are approximate; final dates will be in the pre-application.",
    "eligibility": "Georgia residents attending a Georgia high school; graduating classes 2027–2029; citizenship or U.S.-person requirements. Posted age-16 deadline is Apr. 4, 2027, subject to the page’s approximate-date notice.",
    "cost": "Paid internship; housing is not provided and reliable local transportation is required.",
    "costBand": "FREE_PAID",
    "description": "Five-week engineering and STEM research internship in GTRI labs, with projects that can include robotics, drones, radar, prototyping, electronics, and applied research.",
    "majors": allMajors,
    "grades": ["10", "11", "12"],
    "officialUrl": "https://gtri.gatech.edu/stem/high-school-summer-internship",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "stanford-shtem-2027",
    "title": "Stanford SHTEM Summer Internship 2027",
    "organization": "Stanford Compression Forum",
    "category": "RESEARCH",
    "location": "Stanford, California",
    "state": "CA",
    "format": "IN PERSON",
    "status": "UPCOMING",
    "timing": "Applications expected Dec. 7, 2026–Feb. 21, 2027; seven-week program June 21–Aug. 6, 2027. Confirm final dates on the official page.",
    "eligibility": "Current grade 11 or 12 in 2026–27; at least 14 by June 20, 2027; U.S. citizen or permanent resident.",
    "cost": "Posted $95 nonrefundable application fee + $2,500 tuition, both subject to change; financial assistance may be requested. Housing and commuting are not provided.",
    "costBand": "FEES",
    "description": "Seven-week interdisciplinary research experience spanning engineering, computing, science, design, biology, neuroscience, and related fields.",
    "majors": ["electrical", "computer", "software", "mechanical", "biomedical", "robotics", "materials", "industrial"],
    "grades": ["11", "12"],
    "officialUrl": "https://compression.stanford.edu/outreach/shtem-summer-internships-high-schoolers",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "gmu-assip-2027",
    "title": "Aspiring Scientists Summer Internship Program (ASSIP) 2027",
    "organization": "George Mason University",
    "category": "RESEARCH",
    "location": "Fairfax, Virginia",
    "state": "VA",
    "format": "VARIES",
    "status": "UPCOMING",
    "timing": "2027 application opens Dec. 7, 2026 and closes Feb. 12, 2027; final program dates and mentors are still being updated.",
    "eligibility": "High-school and undergraduate students; age and participation requirements depend on the lab and mentor. The inspected age dates describe 2026; confirm 2027 rules before applying.",
    "cost": "Current page lists a $25 application fee and tuition for three credits, with need-based waivers; final 2027 tuition is not yet confirmed.",
    "costBand": "FEES",
    "description": "Students work with faculty researchers on original STEM research and present results at a research symposium.",
    "majors": allMajors,
    "grades": ["10", "11", "12"],
    "officialUrl": "https://science.gmu.edu/assip",
    "lastVerified": "2026-11-15",
    "needsGradeCheck": true
  },
  {
    "id": "ut-sees-watch",
    "title": "UT Austin / NASA SEES High School Internship",
    "organization": "UT Austin Center for Space Research",
    "category": "INTERNSHIP",
    "location": "Austin, Texas + virtual projects",
    "state": "TX",
    "format": "HYBRID",
    "status": "WATCH",
    "timing": "Inspected pages still describe the completed 2026 cycle. No 2027 application is announced there; continuation depends on future funding.",
    "eligibility": "The 2026 cycle required current sophomores/juniors, U.S. citizenship and age 16 by July 5, 2026. Those are historical rules; 2027 eligibility is not confirmed.",
    "cost": "The 2026 cycle included scholarships and fee-based on-site places; 2027 costs and travel assistance are not yet confirmed.",
    "costBand": "UNKNOWN",
    "description": "NASA-supported research experience using mission and Earth-observation data across aerospace, remote sensing, mission design, drones, engineering, and science.",
    "majors": ["aerospace", "mechanical", "electrical", "computer", "software", "environmental", "robotics"],
    "grades": ["10", "11"],
    "officialUrl": "https://csr.utexas.edu/education-outreach/high-school-internships/sees/",
    "lastVerified": "2026-11-15",
    "needsGradeCheck": true
  },
  {
    "id": "nasa-stem-gateway",
    "title": "NASA STEM Gateway — Grades 9–12 Opportunities",
    "organization": "NASA",
    "category": "SUMMER PROGRAM",
    "location": "Multiple NASA centers / online",
    "format": "VARIES",
    "status": "OPEN",
    "timing": "NASA’s opportunity directory is available; individual applications and deadlines vary by listing.",
    "eligibility": "Portal includes grades 9–12. Check each listing’s grade, age, citizenship and location rules; the portal itself is not an eligibility guarantee.",
    "cost": "Varies by individual listing; check the organizer’s details.",
    "costBand": "UNKNOWN",
    "description": "NASA’s official directory of internships, challenges, research and pre-college STEM experiences. It is a portal, not a single program.",
    "majors": ["aerospace", "mechanical", "electrical", "computer", "software", "materials", "environmental", "robotics"],
    "grades": ["9", "10", "11", "12"],
    "officialUrl": "https://www.nasa.gov/stem-content/nasa-stem-gateway/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "jhu-engineering-innovation",
    "title": "Johns Hopkins Engineering Innovation Research Program",
    "organization": "Johns Hopkins University",
    "category": "SUMMER PROGRAM",
    "location": "Baltimore, Maryland + online options",
    "state": "MD",
    "format": "HYBRID",
    "status": "WATCH",
    "timing": "The inspected research page mixes a 2026 session schedule with a 2027 residential-age notice. Confirm the full 2027 research timetable and application before applying.",
    "eligibility": "Current high-school sophomores/juniors with listed math/science preparation; residential age and visa rules also apply. Confirm the applicable 2027 requirements.",
    "cost": "Tuition and fees vary by format. The research page says this program has no financial aid; confirm current charges.",
    "costBand": "FEES",
    "description": "Six-week engineering research experience working alongside Johns Hopkins researchers, with college credit and multiple participation formats.",
    "majors": allMajors,
    "grades": ["10", "11"],
    "officialUrl": "https://ei.jhu.edu/programs/engineering-innovation-research-program/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "science-olympiad-2027",
    "title": "Science Olympiad 2027 — Division C",
    "organization": "Science Olympiad",
    "category": "COMPETITION",
    "location": "School teams across the U.S.",
    "format": "IN PERSON",
    "status": "OPEN",
    "timing": "The 2027 Division C event slate is published. Team registration and tournament dates are set by state/local organizers.",
    "eligibility": "Division C is the high-school grade 9–12 division, usually entered through a registered school team. Check team and tournament rules.",
    "cost": "Check the school/team and state organizer for registration, materials and travel costs.",
    "costBand": "UNKNOWN",
    "description": "2027 engineering-related events include Boomilever, Electric Vehicle, Mission Possible, Wright Stuff, Engineering CAD, Circuit Lab, Hovercraft, Thermodynamics, and more.",
    "majors": allMajors,
    "grades": ["9", "10", "11", "12"],
    "officialUrl": "https://www.soinc.org/events/2027-division-c-events",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "afrl-scholars-2027",
    "title": "AFRL Scholars Program — Summer 2027",
    "organization": "Air Force Research Laboratory / USRA",
    "category": "INTERNSHIP",
    "location": "Multiple U.S. research locations",
    "format": "IN PERSON",
    "status": "OPEN",
    "timing": "Summer 2027 full-time internship applications are open through Jan. 11, 2027; specific placement dates vary.",
    "eligibility": "Upper-level high-school students; U.S. citizenship and age 16+ by the deadline. California locations require age 18+. Site-specific requirements apply; a 3.0 GPA is encouraged rather than mandatory.",
    "cost": "Stipend-paid internship; participants arrange transportation to their worksite.",
    "costBand": "FREE_PAID",
    "description": "Project-based STEM internships inside Air Force research environments, with opportunities spanning aerospace, autonomy, materials, electronics, computing, sensors, and engineering research.",
    "majors": ["aerospace", "mechanical", "electrical", "computer", "software", "materials", "robotics"],
    "grades": ["11", "12"],
    "officialUrl": "https://afrlscholars.usra.edu/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "cmu-sams-2027",
    "title": "Carnegie Mellon Summer Academy for Math and Science (SAMS) 2027",
    "organization": "Carnegie Mellon University",
    "category": "SUMMER PROGRAM",
    "location": "Pittsburgh, Pennsylvania",
    "state": "PA",
    "format": "HYBRID",
    "status": "UPCOMING",
    "timing": "Applications open Dec. 1, 2026; SAMS deadline Feb. 1, 2027. Required virtual preparation June 21–22; residential program June 26–Aug. 7, 2027.",
    "eligibility": "Grade 11 at application; at least 16 by June 26, 2027; U.S. citizen or permanent resident. Required financial documentation and full attendance apply.",
    "cost": "Fully funded program; participants pay travel to and from Pittsburgh.",
    "costBand": "FREE_PAID",
    "description": "Rigorous STEM summer experience designed to deepen mathematics and science preparation while building a diverse, collaborative technical community.",
    "majors": allMajors,
    "grades": ["11"],
    "officialUrl": "https://www.cmu.edu/pre-college/academic-programs/sams.html",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "stanford-aimi-2027",
    "title": "Stanford AIMI Summer Research Internship 2027",
    "organization": "Stanford Center for Artificial Intelligence in Medicine & Imaging",
    "category": "RESEARCH",
    "location": "Online (Stanford-mentored)",
    "state": "CA",
    "format": "ONLINE",
    "status": "OPEN",
    "timing": "Applications open. Financial aid deadline Jan. 15, standard deadline Feb. 1, recommendations Feb. 8, 2027, at 11:59 p.m. PT. Sessions: June 14–25 or July 12–23.",
    "eligibility": "U.S. or international students entering grades 9–12 in Fall 2027, older than 14 by their session start, with strong independent programming skills and availability 9 a.m.–1 p.m. PDT weekdays.",
    "cost": "$3,000 tuition + $50 application fee. Need-based aid and fee waiver are available to eligible U.S. residents through a separate Jan. 15 application.",
    "costBand": "FEES",
    "description": "Mentored research at the intersection of AI, engineering, medical imaging, and healthcare using real-world technical problems and data.",
    "majors": ["biomedical", "computer", "software", "electrical", "industrial"],
    "grades": ["9", "10", "11"],
    "officialUrl": "https://aimi.stanford.edu/education/summer-research-internship",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "stonybrook-simons-2027",
    "title": "Simons Summer Research Program 2027",
    "organization": "Stony Brook University",
    "category": "RESEARCH",
    "location": "Stony Brook, New York",
    "state": "NY",
    "format": "IN PERSON",
    "status": "WATCH",
    "timing": "Program June 28–Aug. 6, 2027. Organizer says the form will be available Nov. 15; confirm availability. Nomination deadline Jan. 29, student deadline Feb. 5, recommendations Feb. 12.",
    "eligibility": "Current grade 11; U.S. citizen or permanent resident; at least 16 by June 28, 2027; school nomination required (up to three nominees per school).",
    "cost": "No program fee; an application fee applies. Students cover housing/meals or commuting; on-campus housing is estimated at $2,700 plus a meal plan.",
    "costBand": "UNKNOWN",
    "description": "Six-week faculty-mentored research experience where students contribute to active research, analyze data, and present a research poster.",
    "majors": allMajors,
    "grades": ["11"],
    "officialUrl": "https://www.stonybrook.edu/simons/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "bu-rise-2027",
    "title": "Boston University RISE Internship / Practicum 2027",
    "organization": "Boston University",
    "category": "RESEARCH",
    "location": "Boston, Massachusetts",
    "state": "MA",
    "format": "IN PERSON",
    "status": "UPCOMING",
    "timing": "Applications open Dec. 17, 2026; deadline Feb. 3, 2027, 11:59 p.m. ET. Residential June 27–Aug. 6 and commuter June 28–Aug. 6 dates are pending approval.",
    "eligibility": "Students entering senior year in Fall 2027; U.S. citizen or legal permanent resident. Summer 2027 tests are optional; check final admissions requirements.",
    "cost": "Tuition-based program; confirm final 2027 charges. Financial-aid materials must be submitted with the application by Feb. 3.",
    "costBand": "FEES",
    "description": "University-level research with tracks that include biomedical engineering, electrical and computer engineering, mechanical engineering, chemistry, computing, environment, and other STEM areas.",
    "majors": ["biomedical", "electrical", "computer", "software", "mechanical", "chemical", "environmental", "materials"],
    "grades": ["11"],
    "officialUrl": "https://www.bu.edu/summer/high-school-programs/rise-internship-practicum/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "gatech-iexperience-2027",
    "title": "Georgia Tech iExperience Summer Program 2027",
    "organization": "Georgia Tech H. Milton Stewart School of Industrial and Systems Engineering",
    "category": "SUMMER PROGRAM",
    "location": "Atlanta, Georgia",
    "state": "GA",
    "format": "IN PERSON",
    "status": "WATCH",
    "timing": "Summer 2027 one-week program at Georgia Tech; dates, eligibility and application details are not yet announced on the inspected page.",
    "eligibility": "For high-school students interested in STEM/industrial and systems engineering; final 2027 participation requirements are not yet posted.",
    "cost": "2027 cost and aid details are not yet posted.",
    "costBand": "UNKNOWN",
    "description": "Hands-on introduction to industrial and systems engineering through logistics, sports analytics, AI, disaster preparedness, design challenges, and data-driven decision making.",
    "majors": ["industrial", "computer", "mechanical", "civil", "environmental"],
    "grades": ["9", "10", "11", "12"],
    "officialUrl": "https://case.isye.gatech.edu/engagement-initiatives/iexperience",
    "lastVerified": "2026-11-15",
    "needsGradeCheck": true
  },
  {
    "id": "nist-ship-2027",
    "title": "NIST Summer High School Internship Program (SHIP) 2027",
    "organization": "National Institute of Standards and Technology",
    "category": "INTERNSHIP",
    "location": "Gaithersburg, Maryland or Boulder, Colorado",
    "format": "IN PERSON",
    "status": "OPEN",
    "timing": "2027 SHIP vacancy announcements are open; program June 21–Aug. 6, 2027. Check the linked official vacancy for its exact application deadline.",
    "eligibility": "U.S. citizen; current high-school junior/senior; unweighted GPA at least 3.0; permanent residence within 50 miles of Boulder or Gaithersburg; full seven-week commitment.",
    "cost": "Unpaid educational internship; students provide their own housing and transportation.",
    "costBand": "FREE_PAID",
    "description": "Seven-week research experience working with NIST scientists on projects across measurement science, engineering, computing, materials, physics, and related technical fields.",
    "majors": ["mechanical", "electrical", "computer", "chemical", "materials", "industrial", "robotics"],
    "grades": ["11", "12"],
    "officialUrl": "https://www.nist.gov/ship",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "navy-seap-2027",
    "title": "Science and Engineering Apprentice Program (SEAP) 2027",
    "organization": "Office of Naval Research / Navy laboratories",
    "category": "INTERNSHIP",
    "location": "Participating Navy laboratories across the U.S.",
    "format": "IN PERSON",
    "status": "OPEN",
    "timing": "Summer 2027 enrollment runs Sept. 15–Nov. 30, 2026; deadline 11:59 p.m. Central. Eight-week summer placement.",
    "eligibility": "Currently enrolled high-school students who have completed grade 9, normally age 16+ by internship start and U.S. citizens; graduating seniors may apply. Review each laboratory’s exceptions and requirements.",
    "cost": "Stipend: $4,000 new participants / $4,500 returning; housing, travel and health insurance are the student’s responsibility.",
    "costBand": "FREE_PAID",
    "description": "Summer laboratory research with Navy scientists and engineers, supported by an eight-week stipend.",
    "majors": allMajors,
    "grades": ["10", "11", "12"],
    "officialUrl": "https://www.navalsteminterns.us/internships/seap/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "lockheed-high-school-2027",
    "title": "Lockheed Martin Space Summer 2027 High School Internship",
    "organization": "Lockheed Martin",
    "category": "INTERNSHIP",
    "location": "Participating U.S. Lockheed Martin Space facilities; commuting required",
    "format": "IN PERSON",
    "status": "OPEN",
    "timing": "Official program page lists applications Nov. 2, 2026–Jan. 3, 2027 and summer work June–August 2027; confirm a live role in the careers portal.",
    "eligibility": "Age 16+ at internship start, currently enrolled in a local high school and within commuting distance of a participating facility. Seniors graduating in May are ineligible; role-specific requirements may apply.",
    "cost": "Compensation and any role-specific conditions must be checked in the individual official job posting.",
    "costBand": "UNKNOWN",
    "description": "Space-industry summer work with scientists and engineers, including workplace training and mentoring.",
    "majors": ["aerospace", "mechanical", "electrical", "computer", "software", "materials", "industrial", "robotics"],
    "grades": ["9", "10", "11"],
    "officialUrl": "https://www.lockheedmartin.com/en-us/careers/candidates/students-early-careers/high-school.html",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "wright-scholar-2027",
    "title": "Wright Scholar Research Assistant Program 2027",
    "organization": "Air Force Research Laboratory",
    "category": "INTERNSHIP",
    "location": "Wright-Patterson Air Force Base, Ohio",
    "state": "OH",
    "format": "IN PERSON",
    "status": "OPEN",
    "timing": "Applications Nov. 1, 2026–Jan. 10, 2027 at 5 p.m. Eastern; research June 7–July 30, 2027.",
    "eligibility": "U.S. citizen; current high-school junior or senior; age 16 by June 1, 2027; GPA 3.5+ verified by school officials and background check. See the official home-school alternative and attendance rules.",
    "cost": "Paid full-time research assistantship; students arrange and pay for housing, food and transportation.",
    "costBand": "FREE_PAID",
    "description": "An eight-week AFRL research assistantship pairing selected high-school students with research mentors.",
    "majors": ["aerospace", "mechanical", "electrical", "computer", "software", "materials", "chemical", "robotics"],
    "grades": ["11", "12"],
    "officialUrl": "https://wpafbstem.com/Wright_Scholar/Wright_scholar.html",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "utah-engineering-research-2027",
    "title": "University of Utah High School Summer Research Internship",
    "organization": "University of Utah Price College of Engineering",
    "category": "RESEARCH",
    "location": "Salt Lake City, Utah",
    "state": "UT",
    "format": "IN PERSON",
    "status": "WATCH",
    "timing": "Official page lists registration opening November 30 and research June 7–August 10, but does not label those dates with a year. Confirm the next cycle before planning.",
    "eligibility": "Current page limits applicants to rising seniors graduating in 2028; research readiness varies by lab. Confirm that these rules apply to the intended cycle.",
    "cost": "No participation fee; unpaid; housing is not provided.",
    "costBand": "FREE_PAID",
    "description": "Faculty-led engineering lab research with a final symposium presentation.",
    "majors": allMajors,
    "grades": ["11"],
    "officialUrl": "https://www.price.utah.edu/k12/high-school-summer-research-internship",
    "lastVerified": "2026-11-15",
    "needsGradeCheck": true
  },
  {
    "id": "columbia-shape-2027",
    "title": "Columbia SHAPE Summer High School Academic Program for Engineers 2027",
    "organization": "Columbia Engineering",
    "category": "SUMMER PROGRAM",
    "location": "New York, New York",
    "state": "NY",
    "format": "IN PERSON",
    "status": "UPCOMING",
    "timing": "Opening scheduled Nov. 16, 2026; priority Dec. 16; final application Mar. 5, 2027 and materials Mar. 12. Sessions July 5–23 and July 26–Aug. 13, 2027.",
    "eligibility": "Current grades 9–12 may apply as commuters. Residential applicants must be 16+; the official page lists additional domestic/international selection conditions.",
    "cost": "Tuition-based; Summer 2027 rates are not yet published. Need-based scholarships and application-fee waiver conditions are listed separately.",
    "costBand": "FEES",
    "description": "Three-week engineering project courses with electives, workshops and visits; commuter and residential options.",
    "majors": ["mechanical", "electrical", "computer", "software", "biomedical", "robotics", "industrial"],
    "grades": ["9", "10", "11", "12"],
    "officialUrl": "https://outreach.engineering.columbia.edu/content/shape-summer-high-school-academic-program-engineers",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "columbia-eng-2027",
    "title": "Columbia Engineering the Next Generation (ENG) 2027",
    "organization": "Columbia Engineering",
    "category": "RESEARCH",
    "location": "New York, New York",
    "state": "NY",
    "format": "IN PERSON",
    "status": "UPCOMING",
    "timing": "Page lists November 16 application opening and a Jan. 15, 2027 L4L deadline; six-week summer research. Confirm the current portal and track schedule.",
    "eligibility": "Current grade 11 students attending NYC schools. General track requires legal ability to work in NYC, prior work/volunteer experience and L4L/PENCIL enrollment. CS3 has separate Harlem residence/school requirements.",
    "cost": "Paid research: listed stipend $17/hour for 25 hours/week; track enrollment requirements apply.",
    "costBand": "FREE_PAID",
    "description": "Six-week research in Columbia engineering labs with mentoring and research/college-preparation workshops.",
    "majors": ["mechanical", "electrical", "computer", "software", "biomedical", "civil", "industrial", "materials", "environmental", "robotics"],
    "grades": ["11"],
    "officialUrl": "https://outreach.engineering.columbia.edu/eng",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "uchicago-stem-lab-2027",
    "title": "UChicago PME / After School Matters STEM Lab Internship",
    "organization": "University of Chicago Pritzker School of Molecular Engineering",
    "category": "RESEARCH",
    "location": "Chicago, Illinois",
    "state": "IL",
    "format": "IN PERSON",
    "status": "WATCH",
    "timing": "Summer 2027 application timing is inconsistent on the official page: early-2027 applications/February interviews versus a March opening. Confirm the schedule with the program.",
    "eligibility": "Chicago high-school students who will be at least 16 on the first program day; review partner application rules.",
    "cost": "Paid internship; the inspected page does not state a pay amount.",
    "costBand": "FREE_PAID",
    "description": "Six-week mentored molecular-engineering research with a bootcamp, science communication and college-application support.",
    "majors": ["chemical", "materials", "biomedical", "electrical", "computer", "software", "environmental"],
    "grades": ["9", "10", "11", "12"],
    "officialUrl": "https://pme.uchicago.edu/academics/stem-education-community-outreach/k-12-student-programs/after-school-stem-lab-internship",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "ornl-ngsi-2027",
    "title": "Oak Ridge Next Generation STEM Internship (NGSI) 2027",
    "organization": "Oak Ridge National Laboratory",
    "category": "INTERNSHIP",
    "location": "Oak Ridge, Tennessee",
    "state": "TN",
    "format": "IN PERSON",
    "status": "OPEN",
    "timing": "Summer 2027 applications and required recommendations due Feb. 26; listed program dates June 7–July 23, 2027, with extensions subject to program rules.",
    "eligibility": "Age 16+, U.S. citizen or permanent resident, GPA 3.0+, health insurance and eligible school/home-school enrollment in the ten listed Tennessee counties. Check the exact 2027–28 junior/senior or recent-graduate requirements.",
    "cost": "$500/week stipend for full-time participation.",
    "costBand": "FREE_PAID",
    "description": "On-site STEM research with ORNL scientists and engineers for eligible local students.",
    "majors": allMajors,
    "grades": ["10", "11", "12"],
    "officialUrl": "https://www.ornl.gov/next-generation-stem-internship/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "ncstate-residential-2027",
    "title": "NC State Engineering Residential Camps 2027",
    "organization": "NC State College of Engineering",
    "category": "SUMMER PROGRAM",
    "location": "Raleigh, North Carolina",
    "state": "NC",
    "format": "IN PERSON",
    "status": "WATCH",
    "timing": "Official page says updated 2027 offerings are forthcoming; displayed detailed dates/workshops still belong to 2026.",
    "eligibility": "Rising grades 11–12; recheck each 2027 workshop’s requirements when released.",
    "cost": "2027 price not confirmed; check the next official camp announcement.",
    "costBand": "UNKNOWN",
    "description": "Residential engineering workshops and campus experiences in Raleigh for rising juniors and seniors.",
    "majors": allMajors,
    "grades": ["10", "11"],
    "officialUrl": "https://tep.engr.ncsu.edu/k-12-student-programs/rising-11-12-residential-camps/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "ncstate-nuclear-2027",
    "title": "NC State Young Investigators’ Summer Program in Nuclear Engineering 2027",
    "organization": "NC State Nuclear Engineering",
    "category": "SUMMER PROGRAM",
    "location": "Raleigh, North Carolina",
    "state": "NC",
    "format": "IN PERSON",
    "status": "UPCOMING",
    "timing": "Sessions June 14–25 and July 12–23, 2027, with check-in the previous day and check-out the next day. Applications open Feb. 2 annually; deadline Apr. 30.",
    "eligibility": "Rising juniors, rising seniors, and graduating seniors.",
    "cost": "$3,000 residential fee includes dorm room, on-campus meals and industrial trips; no individual tuition scholarships are offered.",
    "costBand": "FEES",
    "description": "Two-week nuclear-engineering study through lectures, lab work, small-group projects and industrial visits.",
    "majors": ["nuclear", "materials", "mechanical", "electrical", "chemical"],
    "grades": ["10", "11", "12"],
    "officialUrl": "https://ne.ncsu.edu/pre-college-programs/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "ut-mite-2027",
    "title": "UT Austin My Introduction to Engineering (MITE) 2027",
    "organization": "UT Austin Cockrell School of Engineering",
    "category": "SUMMER PROGRAM",
    "location": "Austin, Texas",
    "state": "TX",
    "format": "IN PERSON",
    "status": "UPCOMING",
    "timing": "Applications open December 2026; deadline Feb. 28, 2027 at 11:59 p.m. Central. Sessions June 13–17 and July 25–29, 2027.",
    "eligibility": "Current high-school juniors who will enter senior year after summer 2027; eligible applicants must reside in the United States.",
    "cost": "$500 residential program fee; payment follows acceptance.",
    "costBand": "UP_TO_500",
    "description": "Five-day residential engineering exploration with a team project and university-admissions information.",
    "majors": allMajors,
    "grades": ["11"],
    "officialUrl": "https://cockrell.utexas.edu/connect/k-12-outreach/mite/",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "tsa-engineering-2027",
    "title": "Technology Student Association — High School Engineering Events",
    "organization": "Technology Student Association",
    "category": "COMPETITION",
    "location": "School/state/national TSA",
    "format": "IN PERSON",
    "status": "OPEN",
    "timing": "2027–2028 national events are published. Chapters may affiliate during the school year; state and conference entry deadlines vary.",
    "eligibility": "High-school TSA members participating through an eligible school-affiliated chapter; check the official event and state eligibility rules.",
    "cost": "Chapter membership and conference/event charges vary by state and entry; confirm with the advisor.",
    "costBand": "UNKNOWN",
    "description": "School-based engineering and technology competitions including design, robotics/drone challenges and technical problem solving.",
    "majors": allMajors,
    "grades": ["9", "10", "11", "12"],
    "officialUrl": "https://tsaweb.org/competitions/high-school",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "cmu-cee-2027",
    "title": "CMU Pre-College Civil & Environmental Engineering 2027",
    "organization": "Carnegie Mellon University",
    "category": "SUMMER PROGRAM",
    "location": "Pittsburgh, Pennsylvania",
    "state": "PA",
    "format": "IN PERSON",
    "status": "UPCOMING",
    "timing": "Applications open Dec. 1, 2026. Program June 26–July 24, 2027; scholarship deadline Feb. 1 and basic deadline Mar. 1, 2027 at 11:59 p.m. Eastern.",
    "eligibility": "Current sophomores or juniors; age 16 by program start; at least 3.0 GPA; one year of high-school physics or chemistry required before the program.",
    "cost": "2027 program: $9,975 residential / $7,481 commuter, plus $75 application fee. Need-based scholarships have separate eligibility and the Feb. 1 deadline.",
    "costBand": "FEES",
    "description": "Four-week civil/environmental engineering work across infrastructure, sustainability, data and a team design project.",
    "majors": ["civil", "environmental", "industrial", "materials", "software", "computer"],
    "grades": ["10", "11"],
    "officialUrl": "https://www.cmu.edu/pre-college/academic-programs/cee.html",
    "lastVerified": "2026-11-15"
  },
  {
    "id": "princeton-llp-2027",
    "title": "Princeton Laboratory Learning Program 2027",
    "organization": "Princeton University Science Outreach",
    "category": "RESEARCH",
    "location": "Princeton, New Jersey",
    "state": "NJ",
    "format": "IN PERSON",
    "status": "WATCH",
    "timing": "2027 information is announced for February 2027. The displayed Feb. 15–Mar. 15 application dates still say 2026; a 2027 application window is not confirmed.",
    "eligibility": "Current page requires local New Jersey high-school attendance and residence, age 16+ by June 15 and U.S. citizenship; check final 2027 and project rules, including graduate-age limits.",
    "cost": "No participation fee; students provide their own local housing and daily transportation.",
    "costBand": "FREE_PAID",
    "description": "Local, in-person science and engineering research supervised by Princeton researchers; project schedules vary.",
    "majors": allMajors,
    "grades": ["10", "11", "12"],
    "officialUrl": "https://scienceoutreach.princeton.edu/laboratory-learning-program",
    "lastVerified": "2026-11-15"
  }
];

export const BASE_GUIDANCE_OPPORTUNITIES: GuidanceOpportunity[] = [...CURATED_OPPORTUNITIES,...ADDITIONAL_OPPORTUNITIES];
export const GUIDANCE_OPPORTUNITIES=mergePublicContent(BASE_GUIDANCE_OPPORTUNITIES,'opportunity');

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

export function rankOpportunities(majorId: EngineeringMajorId, profile: StudentProfile, includeArchived=false) {
  const state = profile.state.trim().toUpperCase();

  return GUIDANCE_OPPORTUNITIES
    .filter(opportunity=>includeArchived||contentStatus(contentRecord('opportunity',opportunity.id))!=='archived')
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

