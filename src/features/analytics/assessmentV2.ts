export const ASSESSMENT_VERSION='impact-v2' as const;
export const STORY_MAX_WORDS=500;
export const STORY_MAX_CHARACTERS=5000;
export type AssessmentSource='wingmatch'|'project';
export type DimensionId='opportunity'|'reasoning'|'discovery'|'motivation'|'readiness';
type AssessmentQuestion={id:DimensionId;title:string;question:string;options:readonly (readonly [string,string])[]};
export const ASSESSMENT_QUESTIONS:readonly AssessmentQuestion[]=[
  {id:'opportunity',title:'Opportunity Access',question:'Before today, how many opportunities have you had to try an engineering experience similar to this one?',options:[['never','Never'],['once','Once'],['two_three','Two or three times'],['four_five','Four or five times'],['more_five','More than five times'],['not_sure','Not sure']]},
  {id:'reasoning',title:'Engineering Reasoning',question:'During the mission, how often did you consider what you might gain or give up before making a decision?',options:[['never','Never'],['rarely','Rarely'],['sometimes','Sometimes'],['often','Often'],['almost_always','Almost always'],['not_applicable','Not applicable to this experience']]},
  {id:'discovery',title:'Career Self-Discovery',question:'How much did the decisions you made help you discover which types of engineering work you would or would not enjoy?',options:[['not_at_all','Not at all'],['a_little','A little'],['moderate','A moderate amount'],['quite_a_bit','Quite a bit'],['a_great_deal','A great deal'],['not_applicable','Not applicable to this experience']]},
  {id:'motivation',title:'Independent Learning Motivation',question:'Compared with before this experience, how interested are you in exploring engineering beyond your school assignments?',options:[['much_less','Much less interested'],['somewhat_less','Somewhat less interested'],['same','About the same'],['somewhat_more','Somewhat more interested'],['much_more','Much more interested'],['not_applicable','Not applicable to my situation']]},
  {id:'readiness',title:'Action Readiness',question:'If you wanted to explore engineering further, how clear are you about a specific activity you could try next?',options:[['not_clear','Not at all clear'],['slightly','Slightly clear'],['moderately','Moderately clear'],['very','Very clear'],['completely','Completely clear'],['not_applicable','Not applicable to my situation']]},
] as const;
export type AssessmentAnswers=Record<DimensionId,string>;
export function validAssessmentAnswers(value:unknown):value is AssessmentAnswers{
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const answers=value as Record<string,unknown>;
  return Object.keys(answers).length===5&&ASSESSMENT_QUESTIONS.every(q=>q.options.some(([code])=>code===answers[q.id]));
}
export function storyWordCount(value:string){return value.trim()?value.trim().split(/\s+/u).length:0;}
export const STORY_QUESTION='Think of one moment in AltWing that stood out to you. What happened, why did it matter to you, and how, if at all, did it change the way you think about engineering or your future?';
export const STORY_PROMPTS=[['BEFORE','What did you think or expect before this experience?'],['THE MOMENT','Which specific decision, challenge, or discovery stood out?'],['WHAT COMES NEXT','What, if anything, might you think about or do differently?']] as const;
export type AssessmentSubmission={id:string;session_id:string;version:typeof ASSESSMENT_VERSION;source:AssessmentSource;answers:AssessmentAnswers;story:string;quote_permission:boolean;feedback_permission:true};
export type AssessmentEvent='offered'|'started'|'dismissed'|'field_explored'|'project_started'|'project_completed'|'lab_started'|'proof_saved';
export type AssessmentEventSubmission={id:string;session_id:string;version:typeof ASSESSMENT_VERSION;source:AssessmentSource;event:AssessmentEvent;activity?:string};
export type AssessmentDimension={id:DimensionId;title:string;question:string;responses:number;applicable:number;excluded:number;choices:{value:string;label:string;count:number;percent:number|null}[];firstTime?:{count:number;known:number;notSure:number;percent:number|null}};
export type ImpactStory={id:string;version:string;source:string;submittedAt:string;text:string;quotePermission:boolean};
export type AssessmentCohort={offers:number;started:number;responses:number;responseRate:number|null;fieldExplored:number;projectStarted:number;projectCompleted:number;projectPaired:number;projectCompletionRate:number|null;labStarted:number;proofSaved:number;labPaired:number;proofRate:number|null};
export type BehaviorCounts={field_explorations:number;project_starts:number;project_completions:number;project_conversions:number;lab_starts:number;proofs_saved:number;lab_conversions:number};
export type AssessmentReport={
  generatedAt:string;range:{from:string;to:string;allTime:boolean};version:typeof ASSESSMENT_VERSION;source:'all'|AssessmentSource;responses:number;stories:number;unlinkedResponses:number;
  dimensions:AssessmentDimension[];cohort:AssessmentCohort;
  completion:{starts:number;responses:number;rate:number|null};
  completionTrends:{month:string;starts:number;responses:number;rate:number|null}[];
  trends:{month:string;responses:number;dimension:DimensionId;value:string;count:number}[];
  cohortTrends:{month:string;offers:number;responses:number;rate:number|null}[];
  versions:{version:string;source:string;responses:number}[];
  behavior:BehaviorCounts;behaviorAvailableSince:string|null;permittedStories:ImpactStory[];
  methodology:string[];demo?:boolean;
};
