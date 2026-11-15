import type {ImpactReport} from './impactTypes';
export function csvCell(value:unknown){
  let text=value===null||value===undefined?'':String(value);
  let first=0;while(first<text.length&&(text.charCodeAt(first)<=32||text[first].trim()===''))first++;
  if(typeof value!=='number'&&(first<text.length&&'=+@-'.includes(text[first])||[9,10,13].includes(text.charCodeAt(0))))text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
}
const csv=(rows:unknown[][])=>rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
export function aggregateCsv(report:ImpactReport){
  return csv([
    ['AltWing impact report',report.demo?'DEMO FIXTURES — NOT REAL STATISTICS':'Recorded anonymous data'],
    ['Generated UTC',report.generatedAt],['Date range UTC',report.range.from,report.range.to],['Coverage',report.coverage.earliestAvailable],
    ['Metric','Value','Definition'],...Object.entries(report.totals).map(([key,value])=>[key,value,key==='sessions'?'Anonymous visit sessions started, not unique people':'Recorded occurrences; see methodology']),
    ['survey_responses',report.surveys.responses,'Voluntary responses, one per anonymous visit; not all visitors'],
    ['paired_responses',report.surveys.paired,'Before and after supplied on the same response'],
    ['satisfaction_1_to_5',report.surveys.satisfaction],['career_helpfulness_1_to_5',report.surveys.helpfulness],['recommendation_0_to_10',report.surveys.recommendation],
    ['paired_before_1_to_5',report.surveys.before],['paired_after_1_to_5',report.surveys.after],['paired_mean_change',report.surveys.change],
    ['Rating measure','Rating','Responses'],...report.distributions.map(row=>[row.metric,row.rating,row.responses]),
    ...report.caveats.map(note=>['Methodology',note]),
  ]);
}
export function privateFeedbackCsv(report:ImpactReport){
  return csv([['PRIVATE OWNER EXPORT — DO NOT SHARE UNPERMITTED TEXT',report.demo?'DEMO FIXTURES':'Recorded feedback'],['Received UTC','Questionnaire','Testimonial','Permission to quote publicly'],...report.feedback.map(row=>[row.createdAt,row.source,row.text,row.quotePermission?'Yes — review for identifying details before sharing':'No'])]);
}
export function permittedQuotes(report:ImpactReport){return report.feedback.filter(row=>row.quotePermission&&Boolean(row.text.trim()));}
