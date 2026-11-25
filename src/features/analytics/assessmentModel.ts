import {ASSESSMENT_QUESTIONS as V2_QUESTIONS} from './assessmentV2';
export const ASSESSMENT_VERSION='impact-v3' as const;
export const ASSESSMENT_VERSIONS=['impact-v3','impact-v2'] as const;
export type AssessmentVersion=typeof ASSESSMENT_VERSIONS[number];
export function isAssessmentVersion(value:unknown):value is AssessmentVersion{return ASSESSMENT_VERSIONS.includes(value as AssessmentVersion);}
export const SUBMISSION_NOTICE="By clicking Submit responses, you choose to share your five answers and any story privately with AltWing’s authorized administrators. The story is optional. This is separate from usage analytics. Your results and rewards stay yours.";
export const ASSESSMENT_PROTOCOLS={
 'impact-v2':{label:'Earlier wording',consent:'Separate feedback checkbox',notice:'I choose to send my five answers and any optional story privately to AltWing’s authorized administrators. This permission is separate from automatic usage statistics.'},
 'impact-v3':{label:'Plain-language wording',consent:'Explicit Submit responses action',notice:SUBMISSION_NOTICE},
} as const;
export const STORY_MAX_WORDS=500;
export const STORY_MAX_CHARACTERS=5000;
export type AssessmentSource='wingmatch'|'project';
export type DimensionId='opportunity'|'reasoning'|'discovery'|'motivation'|'readiness';
type AssessmentQuestion={id:DimensionId;title:string;question:string;studentTitle?:string;options:readonly (readonly [string,string])[]};
export const ASSESSMENT_QUESTIONS:readonly AssessmentQuestion[]=[
  {id:'opportunity',title:'Opportunity Access',studentTitle:'Your chances to try engineering',question:'Before today, how many chances did you have to try an engineering activity like this one?',options:[['never','None'],['once','Once'],['two_three','Two or three times'],['four_five','Four or five times'],['more_five','More than five times'],['not_sure','Not sure']]},
  {id:'reasoning',title:'Engineering Reasoning',studentTitle:'Thinking through your choices',question:'How often did you think about the pros and cons of your options before making a choice?',options:[['never','Never'],['rarely','Rarely'],['sometimes','Sometimes'],['often','Often'],['almost_always','Almost always'],['not_applicable','This doesn’t apply to me']]},
  {id:'discovery',title:'Career Self-Discovery',studentTitle:'Finding work you might enjoy',question:'How much did your choices help you learn what engineering work you might enjoy or dislike?',options:[['not_at_all','Not at all'],['a_little','A little'],['moderate','Some'],['quite_a_bit','Quite a bit'],['a_great_deal','A lot'],['not_applicable','This doesn’t apply to me']]},
  {id:'motivation',title:'Independent Learning Motivation',studentTitle:'Exploring on your own',question:'Compared with before this activity, how interested are you in exploring engineering outside your schoolwork?',options:[['much_less','Much less interested'],['somewhat_less','A little less interested'],['same','About the same'],['somewhat_more','A little more interested'],['much_more','Much more interested'],['not_applicable','This doesn’t apply to me']]},
  {id:'readiness',title:'Action Readiness',studentTitle:'Your next step',question:'How clear are you about one activity you could try next to explore engineering?',options:[['not_clear','Not at all clear'],['slightly','A little clear'],['moderately','Fairly clear'],['very','Very clear'],['completely','Completely clear'],['not_applicable','This doesn’t apply to me']]},
] as const;
export function assessmentQuestions(version:AssessmentVersion=ASSESSMENT_VERSION):readonly AssessmentQuestion[]{return version==='impact-v2'?V2_QUESTIONS:ASSESSMENT_QUESTIONS;}
export type AssessmentAnswers=Record<DimensionId,string>;
export function validAssessmentAnswers(value:unknown,version:AssessmentVersion=ASSESSMENT_VERSION):value is AssessmentAnswers{
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const answers=value as Record<string,unknown>;
  return Object.keys(answers).length===5&&assessmentQuestions(version).every(q=>q.options.some(([code])=>code===answers[q.id]));
}
export function storyWordCount(value:string){return value.trim()?value.trim().split(/\s+/u).length:0;}
export const STORY_QUESTION='Think of one moment in AltWing that stood out to you. What happened, why did it matter to you, and how, if at all, did it change the way you think about engineering or your future?';
export const STORY_PROMPTS=[['BEFORE','What did you think or expect before this experience?'],['THE MOMENT','Which specific decision, challenge, or discovery stood out?'],['WHAT COMES NEXT','What, if anything, might you think about or do differently?']] as const;
export type AssessmentSubmission={id:string;session_id:string;version:AssessmentVersion;source:AssessmentSource;answers:AssessmentAnswers;story:string;quote_permission:boolean;feedback_permission:true};
export type AssessmentEvent='offered'|'started'|'dismissed'|'field_explored'|'project_started'|'project_completed'|'lab_started'|'proof_saved';
export type AssessmentEventSubmission={id:string;session_id:string;version:AssessmentVersion;source:AssessmentSource;event:AssessmentEvent;activity?:string};
export type AssessmentDimension={id:DimensionId;title:string;question:string;responses:number;applicable:number;excluded:number;choices:{value:string;label:string;count:number;percent:number|null}[];firstTime?:{count:number;known:number;notSure:number;percent:number|null}};
export type ImpactStory={id:string;version:string;source:string;submittedAt:string;text:string;quotePermission:boolean};
export type AssessmentCohort={offers:number;started:number;responses:number;responseRate:number|null;fieldExplored:number;projectStarted:number;projectCompleted:number;projectPaired:number;projectCompletionRate:number|null;labStarted:number;proofSaved:number;labPaired:number;proofRate:number|null};
export type BehaviorCounts={field_explorations:number;project_starts:number;project_completions:number;project_conversions:number;lab_starts:number;proofs_saved:number;lab_conversions:number};
export type AssessmentReport={
  generatedAt:string;range:{from:string;to:string;allTime:boolean};version:AssessmentVersion;source:'all'|AssessmentSource;responses:number;stories:number;unlinkedResponses:number;
  dimensions:AssessmentDimension[];cohort:AssessmentCohort;
  completion:{starts:number;responses:number;rate:number|null};
  completionTrends:{month:string;starts:number;responses:number;rate:number|null}[];
  trends:{month:string;responses:number;dimension:DimensionId;value:string;count:number}[];
  cohortTrends:{month:string;offers:number;responses:number;rate:number|null}[];
  versions:{version:string;source:string;responses:number}[];
  behavior:BehaviorCounts;behaviorAvailableSince:string|null;permittedStories:ImpactStory[];
  methodology:string[];demo?:boolean;
};
