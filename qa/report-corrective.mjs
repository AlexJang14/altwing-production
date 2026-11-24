import fs from 'node:fs';
import path from 'node:path';
const out='qa/corrective-reports',resultRoot='qa/AltWing-Browser-QA/results';
if(process.argv.includes('--enforce')){
  const r=JSON.parse(fs.readFileSync(path.join(out,'results.json')));
  const errors=Object.values(r.currentBrowserCases).filter(x=>x.status==='FAIL');
  const regressions=r.correctiveRegressions;
  const expected=['D01','D02','D03','D04','D05','D06','D07','D08','A01','A02','A05','A07','P01','P02','P05','P06'];
  const missing=expected.filter(id=>r.currentBrowserCases[id]?.status!=='PASS');
  console.log(JSON.stringify({actualProgress:r.progress,correctiveRegressions:regressions,failedCurrentCases:errors.length,incompleteAutomatedCases:missing,visualPdfReview:'Required separately; generated files alone never provide visual PASS',productionChanged:false},null,2));
  process.exit(errors.length||missing.length||Object.values(regressions).some(v=>v.status!=='PASS')?1:0);
}
fs.mkdirSync(out,{recursive:true});
const dirs=fs.existsSync(resultRoot)?fs.readdirSync(resultRoot).filter(d=>fs.statSync(path.join(resultRoot,d)).isDirectory()).sort():[];
const latest=dirs.at(-1),folder=latest?path.join(resultRoot,latest):null;
const baselinePath='qa/prior-evidence/results.json';
const old=fs.existsSync(baselinePath)?JSON.parse(fs.readFileSync(baselinePath)):null;
const manifest=JSON.parse(fs.readFileSync('qa/CORRECTIVE-MANIFEST.json'));
const raw=folder&&fs.existsSync(path.join(folder,'results.json'))?JSON.parse(fs.readFileSync(path.join(folder,'results.json'))):{cases:Object.fromEntries((old?Object.keys(old.cases):[]).map(id=>[id,{status:'UNVERIFIED',executionStatus:'NOT_RUN',observations:[]}])) ,engines:[],executionError:'No corrective browser results were produced.'};
if(folder)fs.cpSync(folder,out,{recursive:true});
fs.mkdirSync(path.join(out,'historical'),{recursive:true});
for(const p of ['results.json','original-browser-results.json','PDF-VISUAL-REVIEW.json','guide-record.json'])if(fs.existsSync('qa/prior-evidence/'+p))fs.copyFileSync('qa/prior-evidence/'+p,path.join(out,'historical',p));
for(const file of ['qa/corrective-browser.log','qa/corrective-build.json','qa/CORRECTIVE-MANIFEST.json','qa/OWNER-ADMIN-ACCEPTANCE.json'])if(fs.existsSync(file))fs.copyFileSync(file,path.join(out,path.basename(file)));
// Preserve the actual failed screenshots, geometry and PDFs without duplicating
// an entire source/QA package or repeating earlier successful executions.
for(const p of ['screenshots/chromium-A06-failure.jpg','screenshots/firefox-A06-failure.jpg','mobile-followup/screenshots/firefox-M01-failure.jpg','mobile-followup/firefox-mobile-bounds.json','pdf/chromium-A4-default.pdf','pdf/chromium-Letter-default.pdf']){
  const src='qa/prior-evidence/'+p;if(fs.existsSync(src)){const dest=path.join(out,'historical',p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);}
}
const cases=structuredClone(old?.cases||raw.cases);
for(const [id,row]of Object.entries(raw.cases))if(row.observations?.some(o=>o.status!=='UNVERIFIED'||!['I01','I02','I03'].includes(id))){cases[id]={...row,evidenceOrigin:'Executed against the corrective candidate',sourceFingerprint:manifest.sourceFingerprint};}
for(const id of ['D09','D10','D11'])if(old?.cases[id]?.status==='PASS')cases[id]={...old.cases[id],evidenceOrigin:'Reused historical PASS for unchanged route/data/project logic; not rerun',sourceFingerprint:old.sourceFingerprint,reuseReason:'Only assessment-scoped CSS, progress semantics and research-print CSS changed. Route, opportunity, project, scoring, rewards, storage and backend sources are byte-identical.'};
const owner=JSON.parse(fs.readFileSync('qa/OWNER-ADMIN-ACCEPTANCE.json'));
for(const [id,row]of Object.entries(owner.cases))cases[id]={...row,executionStatus:'OWNER_REPORTED',observations:[{origin:owner.origin,status:row.status,detail:row.observed,receivedAtUTC:owner.receivedAtUTC,browserDevice:owner.browserDevice}],evidenceOrigin:'Owner-reported existing production administrator test; authentication/export-access implementation unchanged'};
const checks=raw.engines.flatMap(e=>(e.correctiveAssertions||[]).map(x=>({...x,engine:e.engine})));
const forBoth=id=>['chromium','firefox'].every(engine=>checks.some(x=>x.id===id&&x.engine===engine&&x.status==='PASS'));
const correctiveRegressions={
  M01:{status:forBoth('M01-close-control-after-rotation')?'PASS':'UNVERIFIED',scope:'Actual Chromium/Firefox emulated viewport rotation; physical-device portions remain unperformed'},
  A06:{status:forBoth('A06-ARIA-and-private-link')?'PASS':'UNVERIFIED',scope:'Valid progress semantics, underlined Privacy link and zero axe violations; incomplete contrast/manual coverage retained in case observations'},
  P03:{status:forBoth('P03/P04-print-CSS')&&raw.firefoxNativePrint?.status==='PASS'?'PASS':'UNVERIFIED',scope:'White print background/dark foreground in both browsers and actual Chromium/Gecko PDF generation; visual inspection remains separate'},
  P04:{status:raw.firefoxNativePrint?.status==='PASS'&&raw.cases.P03?.observations?.some(o=>o.engine==='chromium'&&o.detail?.a4?.geometry?.geometryStatus==='PASS')?'PASS':'UNVERIFIED',scope:'Actual PDF heading/print-area geometry and break rules; every-page visual review remains UNVERIFIED until separately performed'}
};
const report={...raw,cases,currentBrowserCases:raw.cases,sourceFingerprint:manifest.sourceFingerprint,changedFiles:manifest.changedFiles,historicalSourceFingerprint:old?.sourceFingerprint,historicalAcceptanceRun:45482814358,historicalProgress:old?.progress,originalNineteenPassCases:old?Object.entries(old.cases).filter(([,v])=>v.status==='PASS').map(([id])=>id):[],ownerReportedAcceptance:owner,correctiveRegressions,productionChanged:false,productionDatabaseAccess:false,qaCommit:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID};
report.progress=Object.fromEntries(['PASS','FAIL','UNVERIFIED'].map(s=>[s,Object.values(cases).filter(v=>v.status===s).length]));
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(out,'current-browser-results.json'),JSON.stringify(raw,null,2)+'\n');
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const rows=Object.entries(cases).map(([id,r])=>`<tr><th>${esc(id)}</th><td>${esc(r.status)}</td><td>${esc(r.evidenceOrigin)}</td><td><details><summary>Actual observations</summary><pre>${esc(JSON.stringify(r,null,2))}</pre></details></td></tr>`).join('');
const pdfs=fs.existsSync(path.join(out,'pdf'))?fs.readdirSync(path.join(out,'pdf')).filter(n=>n.endsWith('.pdf')):[];
fs.writeFileSync(path.join(out,'report.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AltWing corrective acceptance</title><style>body{font:16px/1.6 system-ui;background:#101216;color:#f7f2e6;margin:3vw}a{color:#45d9ff}h1{color:#e6bb65}td,th{border:1px solid #777;padding:12px;vertical-align:top;text-align:left}table{border-collapse:collapse;width:100%}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>AltWing · Corrective acceptance</h1><p><strong>${esc(JSON.stringify(report.progress))}</strong></p><p>Only three product files changed. The original 19 PASS cases and all four failed records are retained separately. No production, database, domain, schedule or administrator permission changes.</p><p>Correction assertions and full manual acceptance have different scopes. A passing generated-PDF assertion is not a visual review; emulated devices are not physical-device results.</p><pre>${esc(JSON.stringify(correctiveRegressions,null,2))}</pre><p><a href="results.json">Consolidated results.json</a> · <a href="current-browser-results.json">New browser observations only</a> · <a href="historical/results.json">Original 19 PASS / 4 FAIL / 8 UNVERIFIED</a> · <a href="AltWing-Launch-Preview.html">Corrected actual application</a> · <a href="AltWing-Browser-Acceptance-Results.html">Acceptance workflow</a></p><p>QA commit: <code>${esc(process.env.GITHUB_SHA)}</code><br>Source: <code>${esc(manifest.sourceFingerprint)}</code></p><table><tr><th>Case</th><th>Status</th><th>Evidence origin</th><th>Observations</th></tr>${rows}</table><h2>Actual browser PDFs</h2>${pdfs.map(n=>`<p><a href="pdf/${esc(n)}">${esc(n)}</a></p>`).join('')}</html>`);
const summary=`## AltWing corrective browser acceptance\n\n**${report.progress.PASS} PASS · ${report.progress.FAIL} FAIL · ${report.progress.UNVERIFIED} UNVERIFIED**\n\nOnly the four failed cases and affected dialog/report regressions are executed. Original nineteen PASS records remain historical evidence; unchanged D09/D10/D11 evidence is explicitly reused. I01/I03 are owner-reported PASS; no browser/device was invented.\n\n| Correction | Automated defect checks |\n|---|---|\n`+Object.entries(correctiveRegressions).map(([id,r])=>`| ${id} | ${r.status} |`).join('\n')+'\n\nActual PDF visual review remains required; generated/text-only checks never count as visual PASS. Physical-device, screen-reader, zoom and genuine unlisted-account gaps remain explicit. No production/database changes.\n';
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);console.log(summary);
