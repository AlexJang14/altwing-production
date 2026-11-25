import {csvCell} from './impactExports';
import type {AssessmentReport} from './assessmentModel';
export function assessmentAggregateCsv(report:AssessmentReport){
  const rows:unknown[][]=[['AltWing research-informed assessment',report.demo?'DEMO FIXTURES — NOT REAL DATA':'Recorded responses'],['Questionnaire',report.version,'Source',report.source],['UTC response/offer date range',report.range.from,report.range.to],['Generated UTC',report.generatedAt],['Submitted responses in response window',report.responses],['Recorded offer cohort',report.cohort.offers],['Responses from that offer cohort',report.cohort.responses],['Offer-cohort response rate percent',report.cohort.responseRate],['Responses in response window with no recorded offer',report.unlinkedResponses],['Dimension','Option','Count','Applicable response denominator','Percent of applicable']];
  for(const dim of report.dimensions){rows.push(['Question',dim.id,dim.question]);for(const choice of dim.choices)rows.push([dim.title,choice.label,choice.count,dim.applicable,choice.percent]);if(dim.firstTime)rows.push(['First-time explorer percent',dim.firstTime.percent,'No prior opportunity count',dim.firstTime.count,'Known prior-experience denominator',dim.firstTime.known,'Not sure excluded',dim.firstTime.notSure]);}
  rows.push(['Offer cohort outcomes','Value'],...Object.entries(report.cohort).map(([key,value])=>[key,value]),['Global detailed behavior — separate from offer cohort','Value'],...Object.entries(report.behavior),['Historical response distributions','Month','Dimension','Option code','Count','Responses in month']);
  for(const row of report.trends)rows.push(['Trend',row.month,row.dimension,row.value,row.count,row.responses]);
  rows.push(['Start-cohort assessment completion','Recorded starts',report.completion.starts,'Submissions from those starts',report.completion.responses,'Completion rate percent',report.completion.rate],['Start-cohort completion history','UTC start month','Recorded starts','Submissions from those starts','Completion rate percent'],...report.completionTrends.map(row=>['Start-cohort trend',row.month,row.starts,row.responses,row.rate]));
  rows.push(['Offer-cohort response history','UTC offer month','Offers','Responses from offers','Response rate percent'],...report.cohortTrends.map(row=>['Offer-cohort trend',row.month,row.offers,row.responses,row.rate]));
  rows.push(['Questionnaire version','Experience source','Responses in response window'],...report.versions.map(v=>[v.version,v.source,v.responses]),...report.methodology.map(note=>['Methodology',note]));
  return rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
export function printImpactReport(target:'research'|'legacy'){
  const before=document.body.dataset.altwingPrintReport;document.body.dataset.altwingPrintReport=target;
  const restore=()=>{if(before===undefined)delete document.body.dataset.altwingPrintReport;else document.body.dataset.altwingPrintReport=before;};
  window.addEventListener('afterprint',restore,{once:true});
  try{window.print();}catch(error){restore();throw error;}
}
