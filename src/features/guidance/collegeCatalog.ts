import {mergePublicContent} from '../../content/intelligence';
import { SCORECARD_COLLEGES } from "./scorecardColleges";
import { colleges } from "../wingmatch/path/collegeData";
import type { EngineeringMajorId, StudentProfile } from "./guidanceTypes";

export interface GuidanceCollege {
  id: string;
  scorecardId?: number;
  majorCoverage?: "ENGINEERING_GENERAL";
  sourceUrl?: string;
  tuitionInState?: number | null;
  tuitionOutOfState?: number | null;
  name: string;
  shortName: string;
  location: string;
  state: string;
  description: string;
  engineeringMajors: EngineeringMajorId[];
  admissionsUrl: string;
  engineeringUrl: string;
  sat25: number | null;
  sat50: number | null;
  sat75: number | null;
  act25: number | null;
  act50: number | null;
  act75: number | null;
  averageGpa: string;
  admissionRate: string;
  testingPolicy: string;
  testingPolicyNote: string;
  source: string;
  sourceYear: string;
}

const majors = {
  broad: [
    "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil",
    "industrial", "materials", "environmental", "robotics",
  ] as EngineeringMajorId[],
};

const meta: Record<string, Omit<GuidanceCollege, keyof Pick<GuidanceCollege,
  "id" | "name" | "shortName" | "location" | "sat25" | "sat50" | "sat75" |
  "act25" | "act50" | "act75" | "averageGpa" | "admissionRate" |
  "testingPolicy" | "testingPolicyNote" | "source" | "sourceYear"
>>> = {
  gatech: {
    state: "GA",
    description: "A public technology-focused university in Atlanta with one of the broadest undergraduate engineering portfolios in the U.S.",
    engineeringMajors: ["aerospace", ...majors.broad, "nuclear"],
    admissionsUrl: "https://admission.gatech.edu/first-year/",
    engineeringUrl: "https://coe.gatech.edu/academics/undergraduate-academics",
  },
  michigan: {
    state: "MI",
    description: "A large research university with deep engineering design teams, laboratories, and multiple pathways across traditional and emerging engineering fields.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "industrial", "materials", "environmental", "nuclear", "robotics"],
    admissionsUrl: "https://admissions.umich.edu/apply/first-year-applicants",
    engineeringUrl: "https://majors.engin.umich.edu/",
  },
  mit: {
    state: "MA",
    description: "A highly selective science and engineering university known for hands-on research, undergraduate research, and technically rigorous programs.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "civil", "materials", "environmental", "nuclear"],
    admissionsUrl: "https://mitadmissions.org/apply/firstyear/",
    engineeringUrl: "https://engineering.mit.edu/education/undergraduate/",
  },
  stanford: {
    state: "CA",
    description: "A highly selective research university whose engineering school combines traditional engineering with computing, design, entrepreneurship, and interdisciplinary research.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "materials", "environmental"],
    admissionsUrl: "https://admission.stanford.edu/apply/first-year/",
    engineeringUrl: "https://engineering.stanford.edu/students-academics/academics/undergraduate-degree-programs",
  },
  purdue: {
    state: "IN",
    description: "A major public engineering university with extensive undergraduate design, research, and industry connections across many engineering disciplines.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "industrial", "materials", "environmental", "nuclear"],
    admissionsUrl: "https://admissions.purdue.edu/apply/",
    engineeringUrl: "https://engineering.purdue.edu/Engr/Academics/Undergraduate",
  },
  uiuc: {
    state: "IL",
    description: "A large public research university with a highly technical engineering ecosystem, especially strong in computing, electronics, materials, and core engineering fields.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "industrial", "materials", "environmental", "nuclear"],
    admissionsUrl: "https://www.admissions.illinois.edu/apply/freshman",
    engineeringUrl: "https://grainger.illinois.edu/academics/undergraduate/majors-and-minors",
  },
  tamu: {
    state: "TX",
    description: "A large public engineering college with extensive laboratories, industry recruiting, design organizations, and a wide selection of engineering majors.",
    engineeringMajors: ["petroleum", "aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "industrial", "materials", "nuclear"],
    admissionsUrl: "https://admissions.tamu.edu/apply/freshman",
    engineeringUrl: "https://engineering.tamu.edu/academics/degrees/index.html",
  },
  utaustin: {
    state: "TX",
    description: "A flagship public university whose Cockrell School of Engineering offers strong undergraduate programs and research in core engineering fields.",
    engineeringMajors: ["petroleum", "aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "environmental"],
    admissionsUrl: "https://admissions.utexas.edu/apply/freshman/",
    engineeringUrl: "https://cockrell.utexas.edu/academics/undergraduate-education/undergraduate-programs",
  },
  berkeley: {
    state: "CA",
    description: "A highly selective public research university with engineering programs spanning computing, energy, infrastructure, materials, bioengineering, and aerospace.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "industrial", "materials", "environmental", "nuclear"],
    admissionsUrl: "https://admissions.berkeley.edu/apply-to-berkeley/freshmen/",
    engineeringUrl: "https://engineering.berkeley.edu/academics/majors-and-minors/",
  },
  cornell: {
    state: "NY",
    description: "An Ivy League university with a broad engineering college and strong undergraduate project teams, research, and interdisciplinary study.",
    engineeringMajors: ["mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "industrial", "materials", "environmental"],
    admissionsUrl: "https://admissions.cornell.edu/how-to-apply/first-year-applicants",
    engineeringUrl: "https://www.engineering.cornell.edu/majors-minors",
  },
  cmu: {
    state: "PA",
    description: "A research university known for engineering, computing, robotics, AI, and interdisciplinary technical work.",
    engineeringMajors: ["mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "materials", "robotics"],
    admissionsUrl: "https://www.cmu.edu/admission/admission/undergraduate-admission/how-to-apply",
    engineeringUrl: "https://engineering.cmu.edu/education/undergraduate-programs/index.html",
  },
  duke: {
    state: "NC",
    description: "A selective research university with an engineering school emphasizing design, biomedical engineering, computing, and interdisciplinary problem solving.",
    engineeringMajors: ["mechanical", "electrical", "computer", "software", "biomedical", "civil", "environmental"],
    admissionsUrl: "https://admissions.duke.edu/apply/",
    engineeringUrl: "https://pratt.duke.edu/academics/undergrad/majors-minors/",
  },
  ucla: {
    state: "CA",
    description: "A selective public research university with engineering programs across aerospace, computing, bioengineering, infrastructure, materials, and chemical systems.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "materials"],
    admissionsUrl: "https://admission.ucla.edu/apply/freshman",
    engineeringUrl: "https://www.seasoasa.ucla.edu/undergraduate-programs/",
  },
  ucsd: {
    state: "CA",
    description: "A public research university with strengths in engineering, computing, bioengineering, structural engineering, and interdisciplinary science.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "materials", "robotics"],
    admissionsUrl: "https://admissions.ucsd.edu/first-year/",
    engineeringUrl: "https://jacobsschool.ucsd.edu/academics/undergraduate-majors",
  },
  vatech: {
    state: "VA",
    description: "A large public engineering university with broad undergraduate options, hands-on design teams, research, and strong industry connections.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "industrial", "materials", "environmental"],
    admissionsUrl: "https://www.vt.edu/admissions/undergraduate/apply.html",
    engineeringUrl: "https://eng.vt.edu/academics/undergraduate-students/explore-engineering.html",
  },
  ncstate: {
    state: "NC",
    description: "A public research university with a broad engineering college, strong industry ties, and extensive undergraduate research and design opportunities.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "chemical", "biomedical", "civil", "industrial", "materials", "environmental", "nuclear"],
    admissionsUrl: "https://admissions.ncsu.edu/apply/first-year/",
    engineeringUrl: "https://engr.ncsu.edu/academics/undergrad/majors/",
  },
  ucf: {
    state: "FL",
    description: "A large public university in Orlando with strong access to aerospace, simulation, defense, and technology employers in Central Florida.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "civil", "industrial", "environmental"],
    admissionsUrl: "https://www.ucf.edu/admissions/undergraduate/apply/",
    engineeringUrl: "https://www.cecs.ucf.edu/academics/undergraduate-programs/",
  },
  calpoly: {
    state: "CA",
    description: "A public polytechnic university known for learn-by-doing engineering education and undergraduate design work.",
    engineeringMajors: ["aerospace", "mechanical", "electrical", "computer", "software", "biomedical", "civil", "industrial", "materials", "environmental"],
    admissionsUrl: "https://www.calpoly.edu/admissions/first-year-student",
    engineeringUrl: "https://ceng.calpoly.edu/undergraduate-programs/",
  },
};


const extraMeta: typeof meta = {
  erau: { state: "FL", description: "A technology-focused university with strong aerospace, mechanical, electrical, computing, and autonomous-systems pathways.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","robotics"], admissionsUrl: "https://erau.edu/admissions/undergraduate", engineeringUrl: "https://erau.edu/degrees/engineering" },
  caltech: { state: "CA", description: "A small, intensely research-oriented science and engineering university with deep undergraduate access to laboratories and faculty.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","materials","environmental"], admissionsUrl: "https://www.admissions.caltech.edu/apply", engineeringUrl: "https://www.eas.caltech.edu/academics/undergraduate-studies" },
  cuboulder: { state: "CO", description: "A flagship public research university with aerospace, mechanical, electrical, computing, environmental, and materials-related engineering pathways.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","civil","environmental","materials"], admissionsUrl: "https://www.colorado.edu/admissions/first-year", engineeringUrl: "https://www.colorado.edu/engineering/academics/undergraduate-programs" },
  maryland: { state: "MD", description: "A large public research engineering school near Washington, D.C., with aerospace, computing, bioengineering, infrastructure, and materials options.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","materials","environmental","robotics"], admissionsUrl: "https://admissions.umd.edu/apply/freshman-applicants", engineeringUrl: "https://eng.umd.edu/academics/undergraduate" },
  pennstate: { state: "PA", description: "A large engineering university with extensive undergraduate design teams, research, industry recruiting, and broad major choice.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","materials","environmental","nuclear"], admissionsUrl: "https://admissions.psu.edu/info/future/firstyear/", engineeringUrl: "https://www.engr.psu.edu/academics/undergraduate/majors.aspx" },
  "ohio-state": { state: "OH", description: "A major public research university with broad engineering, computing, manufacturing, biomedical, and infrastructure pathways.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","materials","environmental"], admissionsUrl: "https://undergrad.osu.edu/apply/freshmen-columbus", engineeringUrl: "https://engineering.osu.edu/academics/undergraduate" },
  minnesota: { state: "MN", description: "A large public research university with strong chemical, mechanical, aerospace, electrical, computing, biomedical, civil, and materials programs.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","materials","environmental"], admissionsUrl: "https://admissions.tc.umn.edu/admissions/freshman-admission", engineeringUrl: "https://cse.umn.edu/college/majors" },
  usc: { state: "CA", description: "A private research university whose Viterbi School combines engineering, computing, design, and strong industry access in Los Angeles.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","environmental","robotics"], admissionsUrl: "https://admission.usc.edu/prospective-students/how-to-apply/first-year-students/", engineeringUrl: "https://viterbiadmission.usc.edu/undergraduate-programs/" },
  florida: { state: "FL", description: "A flagship public university with broad engineering offerings and research across aerospace, computing, energy, health, and infrastructure.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","environmental","nuclear"], admissionsUrl: "https://admissions.ufl.edu/apply/freshman", engineeringUrl: "https://www.eng.ufl.edu/academics/undergraduate/" },
  auburn: { state: "AL", description: "A public engineering university known for hands-on design, aerospace, manufacturing, computing, and industry-connected undergraduate programs.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","civil","industrial","materials"], admissionsUrl: "https://www.auburn.edu/admissions/prospective-students/freshmen/index.php", engineeringUrl: "https://eng.auburn.edu/programs/undergraduate/" },
  alabama: { state: "AL", description: "A large public university with aerospace, mechanical, electrical, computing, chemical, civil, and materials engineering options.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","civil","materials"], admissionsUrl: "https://admissions.ua.edu/apply/", engineeringUrl: "https://eng.ua.edu/academics/undergraduate/" },
  iowastate: { state: "IA", description: "A large land-grant engineering college with broad undergraduate majors, research, design teams, and strong manufacturing and aerospace connections.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","civil","industrial","materials","environmental"], admissionsUrl: "https://www.iastate.edu/admission-and-aid/admissions/first-year-students", engineeringUrl: "https://www.engineering.iastate.edu/academics/undergraduate-programs/" },
  asu: { state: "AZ", description: "A very large engineering school with wide major choice across robotics, computing, energy, sustainability, aerospace, and core engineering fields.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","materials","environmental","robotics"], admissionsUrl: "https://admission.asu.edu/apply/first-year", engineeringUrl: "https://engineering.asu.edu/degrees/undergraduate/" },
  arizona: { state: "AZ", description: "A public research university with engineering strengths in aerospace, mining, optical/electrical systems, biomedical, environmental, and computing fields.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","materials","environmental"], admissionsUrl: "https://www.arizona.edu/admissions/first-year", engineeringUrl: "https://engineering.arizona.edu/majors" },
  rpi: { state: "NY", description: "A technology-focused research university with broad engineering, computing, materials, biomedical, and design pathways.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","materials","environmental","nuclear","robotics"], admissionsUrl: "https://admissions.rpi.edu/undergraduate/apply", engineeringUrl: "https://eng.rpi.edu/academics/undergraduate" },
  mst: { state: "MO", description: "A STEM-focused public university with unusually broad engineering coverage including aerospace, mining, nuclear, petroleum, materials, and core engineering fields.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","civil","industrial","materials","environmental","nuclear","petroleum","robotics"], admissionsUrl: "https://futurestudents.mst.edu/admissions/freshmen/", engineeringUrl: "https://futurestudents.mst.edu/academic-programs/" },
  princeton: { state: "NJ", description: "A highly selective research university with small undergraduate engineering programs and strong access to faculty research across engineering and applied science.", engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","materials","environmental","industrial"], admissionsUrl: "https://admission.princeton.edu/apply", engineeringUrl: "https://engineering.princeton.edu/undergraduate-studies" },
};

const allMeta = { ...meta, ...extraMeta };

const CURATED_COLLEGES: GuidanceCollege[] = colleges
  .filter((college) => Boolean(allMeta[college.id]) && !["berkeley","ucla","ucsd"].includes(college.id))
  .map((college) => ({
    id: college.id,
    name: college.name,
    shortName: college.shortName,
    location: college.location,
    sat25: college.sat25,
    sat50: college.sat50,
    sat75: college.sat75,
    act25: college.act25,
    act50: college.act50,
    act75: college.act75,
    averageGpa: college.averageGpa,
    admissionRate: college.admissionRate,
    testingPolicy: college.testingPolicy,
    testingPolicyNote: college.testingPolicyNote,
    source: college.source,
    sourceYear: college.sourceYear,
    ...allMeta[college.id],
  })).concat([
  {
    id: "michigan-state", name: "Michigan State University", shortName: "Michigan State", location: "East Lansing, Michigan", state: "MI",
    description: "A large public research university with engineering pathways across mechanical, electrical, computer, chemical, civil, materials, environmental, and related fields.",
    engineeringMajors: ["mechanical","electrical","computer","software","chemical","biomedical","civil","materials","environmental","robotics"],
    admissionsUrl: "https://admissions.msu.edu/apply/first-year", engineeringUrl: "https://engineering.msu.edu/academics/undergraduate",
    sat25: 1100, sat50: 1210, sat75: 1320, act25: 25, act50: 28, act75: 31, averageGpa: "3.5–4.0 middle 50%", admissionRate: "Competitive holistic admission",
    testingPolicy: "OPTIONAL", testingPolicyNote: "MSU is test optional for the current posted cycle.", source: "Michigan State Undergraduate Admissions", sourceYear: "Fall 2026 profile / Fall 2027 application"
  },
  {
    id: "michigan-tech", name: "Michigan Technological University", shortName: "Michigan Tech", location: "Houghton, Michigan", state: "MI",
    description: "A public STEM-focused university with hands-on engineering, computing, research, and strong employer recruiting.",
    engineeringMajors: ["mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","materials","environmental","robotics"],
    admissionsUrl: "https://www.mtu.edu/admissions/apply/", engineeringUrl: "https://www.mtu.edu/engineering/undergraduate/",
    sat25: 1160, sat50: 1234, sat75: 1310, act25: 24, act50: 27, act75: 30, averageGpa: "3.86 average incoming GPA", admissionRate: "See current official admissions profile",
    testingPolicy: "OPTIONAL", testingPolicyNote: "Michigan Tech does not require SAT/ACT for most domestic first-year applicants; scores may help merit scholarship consideration.", source: "Michigan Tech Admissions + University Facts", sourceYear: "Fall 2026 incoming class"
  },
  {
    id: "berkeley-2026", name: "University of California, Berkeley", shortName: "UC Berkeley", location: "Berkeley, California", state: "CA",
    description: "A highly selective public research university with engineering programs spanning computing, energy, infrastructure, materials, bioengineering, and aerospace.",
    engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","industrial","materials","environmental","nuclear"],
    admissionsUrl: "https://admissions.berkeley.edu/apply-to-berkeley/freshmen/", engineeringUrl: "https://engineering.berkeley.edu/academics/majors-and-minors/",
    sat25: null, sat50: null, sat75: null, act25: null, act50: null, act75: null, averageGpa: "3.90–4.00 unweighted middle 50%", admissionRate: "11% first-year admit rate (2026)",
    testingPolicy: "NOT_USED", testingPolicyNote: "UC does not consider SAT/ACT in admission decisions for fall 2027.", source: "UC Berkeley Undergraduate Admissions", sourceYear: "2026 admitted class"
  },
  {
    id: "ucla-2026", name: "University of California, Los Angeles", shortName: "UCLA", location: "Los Angeles, California", state: "CA",
    description: "A highly selective public research university with a major-specific Samueli Engineering admissions process and broad engineering programs.",
    engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","materials"],
    admissionsUrl: "https://admission.ucla.edu/apply/freshman", engineeringUrl: "https://www.seasoasa.ucla.edu/undergraduate-programs/",
    sat25: null, sat50: null, sat75: null, act25: null, act50: null, act75: null, averageGpa: "3.95–4.00 unweighted middle 50% (Fall 2025)", admissionRate: "6.8% Samueli Engineering / 9.4% overall (Fall 2025)",
    testingPolicy: "NOT_USED", testingPolicyNote: "UC does not consider SAT/ACT in admission decisions for fall 2027.", source: "UCLA Undergraduate Admission", sourceYear: "Fall 2025 profile"
  },
  {
    id: "ucsd-2026", name: "University of California, San Diego", shortName: "UC San Diego", location: "La Jolla, California", state: "CA",
    description: "A public research university with strong engineering, computing, bioengineering, structural engineering, and interdisciplinary science programs.",
    engineeringMajors: ["aerospace","mechanical","electrical","computer","software","chemical","biomedical","civil","materials","robotics"],
    admissionsUrl: "https://admissions.ucsd.edu/first-year/", engineeringUrl: "https://jacobsschool.ucsd.edu/academics/undergraduate-majors",
    sat25: null, sat50: null, sat75: null, act25: null, act50: null, act75: null, averageGpa: "4.12–4.28 middle 50%", admissionRate: "27% first-year admit rate (Fall 2026)",
    testingPolicy: "NOT_USED", testingPolicyNote: "UC does not consider SAT/ACT in admission decisions for fall 2027.", source: "UC San Diego Undergraduate Admissions", sourceYear: "Fall 2026 profile"
  }
]);

export const BASE_GUIDANCE_COLLEGES: GuidanceCollege[] = [...CURATED_COLLEGES,...SCORECARD_COLLEGES];
export const GUIDANCE_COLLEGES=mergePublicContent(BASE_GUIDANCE_COLLEGES,'college');

export type CollegeSort = "SCORE_FIT" | "MAJOR_LOCATION";
type AcademicMeasure = "SAT" | "ACT" | "GPA";
interface ScoreComparison { measure: AcademicMeasure; student: number; low: number; high: number; midpoint: number }

function validScore(value: string, min: number, max: number, step?: number) {
  const n = Number(value);
  return value.trim() && Number.isFinite(n) && n >= min && n <= max && (!step || Number.isInteger(n / step)) ? n : NaN;
}

export function readAcademicScores(profile: StudentProfile) {
  return { sat: validScore(profile.sat,400,1600,10), act: validScore(profile.act,1,36,1), gpa: validScore(profile.gpa,0,4) };
}

export function academicInputIssues(profile: StudentProfile) {
  const values = readAcademicScores(profile);
  return [
    profile.sat.trim() && !Number.isFinite(values.sat) ? "SAT total: enter 400–1600 in steps of 10. Invalid values are not used." : "",
    profile.act.trim() && !Number.isFinite(values.act) ? "ACT composite: enter a whole number from 1–36. Invalid values are not used." : "",
    profile.gpa.trim() && !Number.isFinite(values.gpa) ? "GPA: enter 0–4.0. Invalid values are not used." : "",
  ].filter(Boolean);
}

function comparableGpa(college: GuidanceCollege) {
  // A number in 'No comparable 4.0 average' is not an actual GPA statistic.
  if (/not |no comparable|unreported|verify/i.test(college.averageGpa) || !/unweighted|4\.0[- ](?:point|scale)/i.test(college.averageGpa)) return null;
  const numbers = college.averageGpa.match(/\d\.\d{1,2}/g)?.map(Number) ?? [];
  if (!numbers.length || numbers.some(n => n > 4)) return null;
  return {low:Math.min(...numbers),high:Math.max(...numbers)};
}

export function getCollegeAcademicFit(college: GuidanceCollege, profile: StudentProfile) {
  const scores = readAcademicScores(profile);
  const hasTests = Number.isFinite(scores.sat) || Number.isFinite(scores.act);
  const tests: ScoreComparison[] = [];
  if (college.testingPolicy !== "NOT_USED") {
    if (Number.isFinite(scores.sat) && college.sat25 && college.sat75) tests.push({measure:"SAT",student:scores.sat,low:college.sat25,high:college.sat75,midpoint:college.sat50 ?? (college.sat25+college.sat75)/2});
    if (Number.isFinite(scores.act) && college.act25 && college.act75) tests.push({measure:"ACT",student:scores.act,low:college.act25,high:college.act75,midpoint:college.act50 ?? (college.act25+college.act75)/2});
  }
  const gpaRange = comparableGpa(college);
  const gpa: ScoreComparison | null = Number.isFinite(scores.gpa) && gpaRange ? {measure:"GPA",student:scores.gpa,...gpaRange,midpoint:(gpaRange.low+gpaRange.high)/2} : null;
  // Never mix a GPA-only comparison into a test-score ordering.
  const comparisons = hasTests ? tests : gpa ? [gpa] : [];
  const distance = comparisons.length ? comparisons.reduce((sum,item) => sum + Math.abs(item.student-item.midpoint)/(item.measure === "SAT" ? 120 : item.measure === "ACT" ? 3 : .25),0)/comparisons.length : null;
  const value = distance === null ? null : 100/(1+distance);
  const missingTests = [Number.isFinite(scores.sat) && !tests.some(item=>item.measure === 'SAT') ? 'SAT' : '',Number.isFinite(scores.act) && !tests.some(item=>item.measure === 'ACT') ? 'ACT' : ''].filter(Boolean);
  return {
    value, comparisons, tests, gpa,
    atOrAboveTestRange: tests.length > 0 && tests.every(item => item.student >= item.low),
    explanation: comparisons.length ? comparisons.map(item => `${item.measure} ${item.student} · published ${item.measure === "GPA" ? "GPA midpoint" : "median / range midpoint"} ${Number(item.midpoint.toFixed(2))}`).join("; ") + (missingTests.length ? `; ${missingTests.join(' / ')} data unavailable` : '') : college.testingPolicy === "NOT_USED" && hasTests ? "SAT/ACT not used by this school; not ordered by test scores." : hasTests ? "No comparable published data for your entered test(s); not ordered by scores." : "No comparable unweighted GPA data; not ordered by GPA.",
  };
}

export function getAcademicContext(college: GuidanceCollege, profile: StudentProfile) {
  const fit = getCollegeAcademicFit(college,profile);
  if (fit.tests.length) return fit.tests.map(item => `${item.student > item.high ? "ABOVE" : item.student >= item.low ? "WITHIN" : "BELOW"} PUBLISHED ${item.measure} RANGE`).join(" · ");
  if (fit.gpa) return `${fit.gpa.student > fit.gpa.high ? "ABOVE" : fit.gpa.student >= fit.gpa.low ? "WITHIN" : "BELOW"} PUBLISHED UNWEIGHTED GPA CONTEXT`;
  if (college.testingPolicy === "NOT_USED") return "TEST-FREE · SCORES NOT USED";
  const scores = readAcademicScores(profile);
  return Number.isFinite(scores.sat) || Number.isFinite(scores.act) ? "NO COMPARABLE PUBLISHED TEST DATA" : "OFFICIAL PROFILE AVAILABLE · ADD SCORES FOR MORE CONTEXT";
}

export function rankColleges(majorId: EngineeringMajorId, profile: StudentProfile, sort: CollegeSort = "SCORE_FIT") {
  const state = profile.state.trim().toUpperCase();
  const scores = readAcademicScores(profile);
  const useAcademicFit = sort === "SCORE_FIT" && Object.values(scores).some(Number.isFinite);
  const preferHome = Boolean(state) && profile.locationPreference === "NEAR_HOME";
  return GUIDANCE_COLLEGES
    .filter(college => college.engineeringMajors.includes(majorId) || college.majorCoverage === "ENGINEERING_GENERAL")
    .map(college => {
      let score = 50 + (college.majorCoverage ? 0 : 25);
      const reasons = [college.majorCoverage ? "Engineering graduates reported; confirm this exact major" : "Curated link to a related undergraduate engineering pathway"];
      const sameState = Boolean(state) && state === college.state;
      if (sameState) {score += preferHome ? 85 : 42;reasons.push("In your home state");}
      else if (preferHome) score -= 28;
      const academicFit = getCollegeAcademicFit(college,profile);
      const academicContext = getAcademicContext(college,profile);
      if (!academicContext.startsWith("OFFICIAL")) reasons.push(academicContext.toLowerCase());
      return {college,score,reasons,academicContext,academicFit};
    })
    .sort((a,b) => {
      if (useAcademicFit) {
        if (preferHome) {const homeOrder = Number(b.college.state === state)-Number(a.college.state === state);if(homeOrder) return homeOrder;}
        if ((a.academicFit.value === null) !== (b.academicFit.value === null)) return a.academicFit.value === null ? 1 : -1;
        // Avoid rewarding incomplete data when the student entered both tests.
        const coverageOrder = b.academicFit.comparisons.length-a.academicFit.comparisons.length;
        if (coverageOrder) return coverageOrder;
        const fitOrder = (b.academicFit.value ?? 0)-(a.academicFit.value ?? 0);
        if (fitOrder) return fitOrder;
      }
      return b.score-a.score || a.college.name.localeCompare(b.college.name);
    });
}
