export const STATUSES=['UNVERIFIED','PASS','FAIL'];
export const WORKFLOWS=[
 {id:'full',phase:'pre',title:'1 · Complete frontend and saved work',setup:'Use one fresh local browser profile for D01–D03, then keep it for routes, programs and saved project/reward checks. The standalone demo cannot prove the real WingMatch completion transition.',cases:['D01','D02','D03','D09','D10','D11'],target:null},
 {id:'assessment',phase:'pre',title:'2 · Assessment, consent and keyboard',setup:'Open Assessment once. Check question/radio behavior while advancing; inspect the optional story, private-sharing notice, optional quotation permission and counters together. Close/reopen as directed. Use one blank-story submission and one additional demo run for written feedback; neither sends data.',cases:['D04','A02','D05','D07','A07','A01','D06','D08'],target:'assessment'},
 {id:'reports',phase:'pre',title:'3 · Reports, CSV and PDFs',setup:'Use the same Research report fixture period for distributions, stories, CSV and default A4/Letter printing. Then enable permitted quotes and test empty/alternate periods. Inspect downloaded PDFs; do not repeat WingMatch.',cases:['P01','P02','P03','P04','P05','P06'],target:'research'},
 {id:'mobile',phase:'pre',title:'4 · Mobile, zoom and reduced motion',setup:'Reuse the assessment on the available physical phones; test orientation, keyboard, labels and scroll in one session. Then check complete-frontend menu/saved work. Emulation supplements physical-device checks; missing coverage stays UNVERIFIED.',cases:['M01','M02','M03','M04','A04','A05'],target:'assessment'},
 {id:'accessibility',phase:'pre',title:'5 · Screen reader and contrast',setup:'Reuse the assessment for announcements and measured contrast. Keyboard behavior was checked in workflow2; do not call those tests screen-reader or rendered-contrast proof.',cases:['A03','A06'],target:'assessment'},
 {id:'auth',phase:'pre',title:'6 · Existing administrators, read-only',setup:'Use separate profiles and each person’s own ChatGPT account on the existing dashboard. Reuse those sessions for I01/I03; use signed-out/unlisted profiles for I02. No initialization, new feedback or settings writes.',cases:['I01','I03','I02'],target:'access'},
 {id:'live',phase:'post',title:'7 · Approved production release',setup:'Only after final approval and actual publication: verify the exact release, reuse legitimate participant activity and independent administrator sessions, then reconcile storage, reports and privacy. Never seed fake testimonials or test statistics.',cases:['L01','L02','L03','L04','L05','L06','L07'],target:null},
];
export function parseCases(markdown){
 return markdown.split('\n').filter(line=>/^\| [DMAPIL]\d{2} \|/.test(line)).map(line=>{
  const cells=line.split('|').slice(1,-1).map(s=>s.trim());
  if(cells.length!==3)throw Error('Unexpected manual test table shape.');
  const [id,steps,expected]=cells;return {id,steps,expected,phase:id.startsWith('L')?'post':'pre'};
 });
}
const cap=(value,max=5000)=>typeof value==='string'?value.slice(0,max):'';
export const blankResult=()=>({status:'UNVERIFIED',notes:'',evidenceReference:'',screenshot:null,recordedAt:null});
export function freshRecord(subject,ids){return {schema:1,candidate:subject.candidate,plan:subject.plan,reviewer:'',environment:'',sourceManifest:'',postLive:false,productionReference:'',cases:Object.fromEntries(ids.map(id=>[id,blankResult()])),permissions:{mascot:blankResult(),exceptions:blankResult()}};}
function cleanResult(value){
 if(!value||typeof value!=='object')return blankResult();
 const shot=value.screenshot&&typeof value.screenshot==='object'?value.screenshot:null;
 const recordedAt=typeof value.recordedAt==='string'&&Number.isFinite(Date.parse(value.recordedAt))?value.recordedAt:null;
 const status=STATUSES.includes(value.status)&&recordedAt?value.status:'UNVERIFIED';
 return {status,notes:cap(value.notes),evidenceReference:cap(value.evidenceReference,1000),recordedAt:status==='UNVERIFIED'?null:recordedAt,screenshot:shot?{name:cap(shot.name,240),type:cap(shot.type,60),size:Number.isFinite(shot.size)?Math.max(0,shot.size):0}:null};
}
function cleanPermission(value){const r=cleanResult(value);return r.status==='PASS'&&!r.evidenceReference.trim()&&!r.screenshot?.name?.trim()?{...r,status:'UNVERIFIED',recordedAt:null}:r;}
export function restoreRecord(raw,subject,ids){
 const fresh=freshRecord(subject,ids);
 try{const saved=JSON.parse(raw);if(saved.schema!==1||saved.candidate!==subject.candidate||saved.plan!==subject.plan)return fresh;
  return {...fresh,reviewer:cap(saved.reviewer,160),environment:cap(saved.environment,500),sourceManifest:cap(saved.sourceManifest,160),postLive:saved.postLive===true,productionReference:cap(saved.productionReference,250),cases:Object.fromEntries(ids.map(id=>[id,cleanResult(saved.cases?.[id])])),permissions:{mascot:cleanPermission(saved.permissions?.mascot),exceptions:cleanPermission(saved.permissions?.exceptions)}};
 }catch{return fresh;}
}
export function progress(results,ids){const counts={PASS:0,FAIL:0,UNVERIFIED:0};for(const id of ids)counts[STATUSES.includes(results[id]?.status)?results[id].status:'UNVERIFIED']++;return {...counts,total:ids.length,reviewed:counts.PASS+counts.FAIL};}
export function recordResult(old,patch,now=new Date().toISOString()){
 return cleanResult({...old,...patch,...('status' in patch?{recordedAt:patch.status==='UNVERIFIED'?null:now}:{})});
}
export function recordPermission(old,patch,now=new Date().toISOString()){return cleanPermission(recordResult(old,patch,now));}
export function persistentRecord(record){return {...record,cases:Object.fromEntries(Object.entries(record.cases).map(([id,r])=>[id,cleanResult(r)])),permissions:Object.fromEntries(Object.entries(record.permissions).map(([id,r])=>[id,cleanPermission(r)]))};}
function csvCell(value){let s=String(value??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function exportReport(record,cases,subject,screenshots={},now=new Date().toISOString()){
 const clean=persistentRecord(record),rows=cases.map(c=>({...c,...clean.cases[c.id],screenshotData:screenshots[c.id]??null}));
 return {format:'AltWing manual acceptance',schema:1,exportedAt:now,candidate:subject,reviewer:clean.reviewer,environment:clean.environment,sourceManifest:clean.sourceManifest,postLiveAcknowledged:clean.postLive,productionReference:clean.productionReference,progress:{pre:progress(clean.cases,cases.filter(c=>c.phase==='pre').map(c=>c.id)),post:progress(clean.cases,cases.filter(c=>c.phase==='post').map(c=>c.id))},cases:rows,permissions:Object.fromEntries(Object.entries(clean.permissions).map(([id,r])=>[id,{...r,screenshotData:screenshots['rights-'+id]??null}])),limits:['Statuses are manual reviewer assertions, not independently verified tests.','Fresh/unperformed cases are UNVERIFIED.','No production deployment or ownership clearance is performed by this page.','Screenshots are local attachments; only metadata/notes/statuses are saved in this browser.','Production-only cases cannot be executed against an undeployed candidate.']};
}
export function reportCsv(report){
 const header=['id','phase','status','steps','expected_result','actual_result_or_error','evidence_reference','screenshot_filename','recorded_at_utc','reviewer','environment','candidate_hash','plan_hash','production_reference'];
 const rows=report.cases.map(c=>[c.id,c.phase,c.status,c.steps,c.expected,c.notes,c.evidenceReference,c.screenshot?.name??'',c.recordedAt,report.reviewer,report.environment,report.candidate.candidate,report.candidate.plan,report.productionReference]);
 for(const [id,r]of Object.entries(report.permissions))rows.push(['rights-'+id,'copyright',r.status,'Inspect the relevant rights evidence','Do not infer others’ permission from founder authorization',r.notes,r.evidenceReference,r.screenshot?.name??'',r.recordedAt,report.reviewer,report.environment,report.candidate.candidate,report.candidate.plan,'']);
 return [header,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');
}
