export const IMPACT_VERSION = 'impact-v1';
export type ImpactSubmission = {
  id: string; session_id: string; version: typeof IMPACT_VERSION;
  source: 'wingmatch' | 'legacy-wingmatch' | 'site';
  satisfaction?: number | null; helpfulness?: number | null; recommendation?: number | null;
  understanding_before?: number | null; understanding_after?: number | null;
  legacy_understanding?: number | null; legacy_direction?: number | null; legacy_action?: number | null;
  testimonial: string; quote_permission: boolean; feedback_permission: boolean;
};
export type ImpactCounters = {sessions:number;page_views:number;mission_starts:number;mission_completions:number;wingmatch_starts:number;wingmatch_completions:number;wingmatch_conversions:number};
export type ImpactReport = {
  generatedAt:string; range:{from:string;to:string;allTime:boolean};
  coverage:{activatedAt:string;earliestAvailable:string;note:string};
  totals:ImpactCounters; lifetime:ImpactCounters;
  daily:Array<ImpactCounters & {day:string}>;
  surveys:{responses:number;respondentSessions:number;paired:number;satisfaction:number|null;helpfulness:number|null;recommendation:number|null;before:number|null;after:number|null;change:number|null;legacyResponses:number;legacyUnderstanding?:number|null;legacyDirection?:number|null;legacyAction?:number|null};
  distributions:Array<{metric:string;rating:number;responses:number}>;
  feedback:Array<{id:string;source:string;createdAt:string;text:string;quotePermission:boolean}>;
  caveats:string[]; demo?:boolean;
};
