export type EngineeringMajorId =
  | "aerospace"
  | "mechanical"
  | "electrical"
  | "computer"
  | "chemical"
  | "biomedical"
  | "civil"
  | "industrial"
  | "materials"
  | "environmental"
  | "nuclear"
  | "robotics"
  | "software"
  | "petroleum";

export type GuidanceTab =
  | "PLAN"
  | "COLLEGES"
  | "OPPORTUNITIES"
  | "CAREERS"
  | "IDEAS";

export type OpportunityCategory =
  | "INTERNSHIP"
  | "SUMMER PROGRAM"
  | "RESEARCH"
  | "COMPETITION"
  | "SCHOLARSHIP"
  | "MENTORSHIP";

export interface StudentProfile {
  grade: "" | "9" | "10" | "11" | "12";
  state: string;
  gpa: string;
  sat: string;
  act: string;
  locationPreference: "ANYWHERE" | "NEAR_HOME" | "ONLINE_OK";
  budgetPreference: "ANY" | "LOW_COST" | "FREE_PAID";
  interests: string[];
}

export interface EngineeringMajor {
  id: EngineeringMajorId;
  name: string;
  shortName: string;
  icon: string;
  tagline: string;
  description: string;
  solves: string[];
  subjects: string[];
  careers: string[];
  signals: string[];
  accent: string;
}

export interface EngineeringMatchResult {
  completedAt: string;
  decisionPatterns?: string[];
  rankings: Array<{
    majorId: EngineeringMajorId;
    score: number;
    signal: number;
  }>;
}

export interface SavedGuidance {
  collegeIds: string[];
  opportunityIds: string[];
  ideaIds: string[];
}
