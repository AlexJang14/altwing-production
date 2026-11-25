import {analyticsAuthorization,analyticsDb,json} from '../../../../lib/analytics-server';
import {assessmentScope,readAssessmentReport} from '../../../../lib/assessment-reporting';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const access=await analyticsAuthorization();if(access!==200)return json({error:'Administrator sign-in is required.'},access);
  const scope=assessmentScope(new URL(request.url).searchParams);if(!scope)return json({error:'Choose a valid UTC range, source and questionnaire version.'},400);
  try{return json(await readAssessmentReport(analyticsDb(),scope));}catch{return json({error:'Assessment reporting is unavailable. Confirm its additive schema migration is applied.'},503);}
}
