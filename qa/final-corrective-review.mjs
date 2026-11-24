import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const out='qa/final-reports';
const read=file=>JSON.parse(fs.readFileSync(file));
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const ready=read('qa/FINAL-REVIEW-READY.json');
if(process.argv.includes('--enforce')){
  const r=read(path.join(out,'results.json'));
  assert.deepEqual(r.progress,ready.expectedCaseTotals);
  assert.deepEqual(r.remainingCases,ready.expectedUnverifiedCases);
  assert.ok(Object.values(r.correctiveRegressions).every(x=>x.status==='PASS'));
  assert.equal(r.productionBuilds.status,'PASS');
  console.log('PASS: four confirmed regressions resolved; seven unperformed manual scopes remain UNVERIFIED. No production approval inferred.');
  process.exit(0);
}
const input='qa/review-input';
const r=read(path.join(input,'results.json'));
assert.equal(r.sourceFingerprint,ready.sourceFingerprint);
assert.equal(r.qaCommit,ready.browserQaCommit);
assert.equal(Number(r.runId),ready.browserRun);
fs.mkdirSync(out,{recursive:true});
fs.cpSync(input,out,{recursive:true});
fs.copyFileSync(path.join(input,'results.json'),path.join(out,'pre-visual-review-results.json'));
const pdf=read('qa/FINAL-PDF-VISUAL-REVIEW.json');
const access=read('qa/FINAL-ACCESSIBILITY-REVIEW.json');
assert.equal(pdf.sourceFingerprint,r.sourceFingerprint);
assert.equal(access.sourceFingerprint,r.sourceFingerprint);
for(const f of pdf.pdfs){
  assert.equal(hash(path.join(out,f.path)),f.sha256);
  assert.deepEqual(f.inspectedPages,Array.from({length:f.pages},(_,i)=>i+1));
  assert.equal(read(path.join(out,f.path.replace('.pdf','-geometry.json'))).geometryStatus,'PASS');
}
assert.equal(pdf.totalInspectedPdfPages,21);
for(const s of access.screenshots){assert.equal(hash(path.join(out,s.path)),s.sha256);assert.equal(s.inspected,true);}
for(const f of access.renderedMeasurements.files){
  assert.equal(hash(path.join(out,f.path)),f.sha256);
  assert.ok(read(path.join(out,f.path)).measurements.every(m=>m.status==='PASS'&&m.contrastRatio>=m.minimum));
}
for(const f of access.axe){assert.equal(hash(path.join(out,f.path)),f.sha256);assert.equal(read(path.join(out,f.path)).violations.length,0);}
for(const [id,result]of Object.entries({...pdf.cases,A06:access})){
  assert.equal(result.status,'PASS');
  r.cases[id].observations.push({engine:id==='A06'?'rendered-contrast-and-visual-review':'visual-review-of-actual-browser-PDFs',status:'PASS',atUTC:result.reviewedAtUTC||pdf.reviewedAtUTC,detail:result.observed,evidenceReference:id==='A06'?'FINAL-ACCESSIBILITY-REVIEW.json':'FINAL-PDF-VISUAL-REVIEW.json'});
  r.cases[id].status='PASS';r.cases[id].executionStatus='EXECUTED';
  r.cases[id].evidenceOrigin='Actual Chromium/Firefox execution plus separately attributed measured/visual review';
}
r.correctiveRegressions.P03.scope='Actual Chromium/Gecko print colors and PDFs; all 21 default A4/Letter pages visually inspected and readable.';
r.correctiveRegressions.P04.scope='Actual PDF geometry and visual review of every A4/Letter default page in both browsers; no orphaned headings or clipped rows.';
r.correctiveRegressions.A06.scope='Valid named progress role, underlined Privacy link, zero axe violations, all 60 rendered contrast measurements passed, visible keyboard focus reviewed. Actual screen readers remain separate A03 UNVERIFIED.';
r.progress=Object.fromEntries(['PASS','FAIL','UNVERIFIED'].map(s=>[s,Object.values(r.cases).filter(c=>c.status===s).length]));
r.remainingCases=Object.entries(r.cases).filter(([,c])=>c.status!=='PASS').map(([id])=>id);
r.finalReviewAtUTC=pdf.reviewedAtUTC;
r.finalReviewEvidenceCommit=process.env.GITHUB_SHA||null;
r.finalReviewWorkflowRun=process.env.GITHUB_RUN_ID||null;
r.productionBuilds=read('qa/production-build-results.json');
r.manualScopeDecision={status:'PENDING',remainingCases:r.remainingCases,proposal:'Defer physical iPhone/Android, OS keyboard/touch, NVDA/VoiceOver, real OS/browser zoom and genuine signed-in unlisted-account coverage explicitly in the final owner release decision. These cases retain UNVERIFIED, not PASS. New live endpoint denial remains L05.',noWaiverInferred:true};
r.releaseDecision='HOLD FOR OWNER RELEASE/SCOPE DECISION — four known regressions resolved. Unperformed manual coverage and production-only checks remain explicit. No publication authorized by this report.';
r.evidenceRuns=[{run:45482814358,scope:'Original 19 PASS / 4 FAIL / 8 UNVERIFIED retained unmodified'},{run:45498111815,scope:'Actual corrected rotation, keyboard, survey and motion regression results; first native Firefox print failure preserved'},{run:45499900337,scope:'Successful corrected report/accessibility execution and actual Chromium/Gecko PDFs'},{run:process.env.GITHUB_RUN_ID,scope:'Evidence-only reconciliation and non-publishing production-target builds; no browser rerun'}];
const prior='qa/reused-dialog';
if(fs.existsSync(prior)){
  const previous=read(path.join(prior,'results.json'));
  assert.equal(previous.sourceFingerprint,'722519753d43d3a26c5181cff2397516e2d1f7ed1e2908ec4a52f6c01e360638');
  for(const [id,row]of Object.entries(r.cases))if(row.sourceFingerprint===previous.sourceFingerprint||id==='M01'){
    for(const obs of row.observations||[]){
      if(obs.screenshot&&fs.existsSync(path.join(prior,obs.screenshot))){const target=path.join(out,'prior-corrective',obs.screenshot);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(prior,obs.screenshot),target);obs.screenshot='prior-corrective/'+obs.screenshot;}
    }
  }
  for(const name of ['chromium-mobile-bounds.json','firefox-mobile-bounds.json','firefox-native-print.json','firefox-native-print.log'])if(fs.existsSync(path.join(prior,name)))fs.copyFileSync(path.join(prior,name),path.join(out,'prior-corrective',name));
  for(const name of ['firefox-Letter-default.pdf','firefox-Letter-default-geometry.json'])if(fs.existsSync(path.join(prior,'pdf',name))){const target=path.join(out,'prior-corrective','pdf',name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(prior,'pdf',name),target);}
}
for(const name of ['FINAL-PDF-VISUAL-REVIEW.json','FINAL-ACCESSIBILITY-REVIEW.json','FINAL-REVIEW-READY.json','production-build-results.json','production-pages.log','production-backend.log'])if(fs.existsSync('qa/'+name))fs.copyFileSync('qa/'+name,path.join(out,name));
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(r,null,2)+'\n');
const record=read(path.join(input,'guide-record.json'));
record.reviewer='Actual Playwright/WebDriver evidence, assistant visual PDF/contrast review, and separately labeled owner administrator observations';
record.sourceManifest=r.sourceFingerprint;
record.evidenceRuns=r.evidenceRuns;
record.ownerDecisions={mascot:'APPROVED initial-release exception on November24; underlying reference rights remain UNVERIFIED',manualCoverage:r.manualScopeDecision,productionApproval:'NOT GRANTED'};
record.permissions.mascot={...record.permissions.mascot,status:'UNVERIFIED',notes:'Underlying reference-image rights remain unknown. Existing November18 grant and November24 initial-release policy exception are recorded; no new mascot approval is requested, no clearance or third-party permission inferred.',evidenceReference:'docs/rights/MASCOT-RELEASE-EXCEPTION-2026-11-24.json'};
for(const [id,row]of Object.entries(r.cases))record.cases[id]={...record.cases[id],status:row.status,notes:JSON.stringify({origin:row.evidenceOrigin,observations:row.observations}).slice(0,6000),evidenceReference:'results.json — '+id,recordedAt:row.status==='UNVERIFIED'?null:r.finalReviewAtUTC};
record.postLive=false;
for(const id of ['L01','L02','L03','L04','L05','L06','L07'])assert.equal(record.cases[id].status,'UNVERIFIED');
fs.writeFileSync(path.join(out,'guide-record.json'),JSON.stringify(record,null,2)+'\n');
fs.writeFileSync(path.join(out,'acceptance-results.json'),JSON.stringify(record,null,2)+'\n');
const guide=fs.readFileSync(path.join(input,'AltWing-Browser-Acceptance-Results.html'),'utf8');
const safe=v=>JSON.stringify(v).replaceAll('<','\\u003c');
const key=`altwing-manual-acceptance-v1:${record.candidate}:${record.plan}`;
const seed='<script>try{const k='+safe(key)+',n='+safe(record)+';const old=JSON.parse(localStorage.getItem(k)||"null");if(old&&old.candidate===n.candidate&&old.plan===n.plan){for(const id of Object.keys(n.cases)){if(old.cases?.[id]?.recordedAt&&old.cases[id].recordedAt>'+safe(r.finalReviewAtUTC)+')n.cases[id]=old.cases[id];}}localStorage.setItem(k,JSON.stringify(n));}catch(e){console.error("Acceptance result restoration failed",e);}</script>';
assert.ok(guide.includes('</head>'));
fs.writeFileSync(path.join(out,'AltWing-Browser-Acceptance-Results.html'),guide.replace('</head>',seed+'</head>'));
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const rows=Object.entries(r.cases).map(([id,c])=>`<tr><th>${esc(id)}</th><td>${esc(c.status)}</td><td>${esc(c.evidenceOrigin)}<details><summary>Actual observations</summary><pre>${esc(JSON.stringify(c,null,2))}</pre></details></td></tr>`).join('');
fs.writeFileSync(path.join(out,'report.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AltWing final corrective acceptance</title><style>body{font:16px/1.6 system-ui;background:#101216;color:#f7f2e6;margin:3vw}a{color:#45d9ff}h1{color:#e6bb65}table{border-collapse:collapse;width:100%}th,td{border:1px solid #777;padding:12px;text-align:left;vertical-align:top}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>AltWing · Final corrective acceptance</h1><p><strong>24 PASS · 0 FAIL · 7 UNVERIFIED</strong>. All four confirmed defects pass their executed regression checks. This is not 31 completed tests.</p><p>Original19 PASS, original failures and prior corrective observations are preserved separately. I01/I03 are owner-reported PASS with browser/device not supplied. Physical devices, screen readers, OS zoom and a genuine unlisted account have not been tested.</p><p><a href="results.json">Consolidated results.json</a> · <a href="AltWing-Browser-Acceptance-Results.html">Updated interactive acceptance workflow</a> · <a href="AltWing-Launch-Preview.html">Actual corrected complete application</a> · <a href="FINAL-PDF-VISUAL-REVIEW.json">21-page actual PDF visual review</a> · <a href="FINAL-ACCESSIBILITY-REVIEW.json">Rendered accessibility evidence</a> · <a href="production-build-results.json">Non-publishing production builds</a> · <a href="historical/results.json">Original failed evidence</a></p><p>Source: <code>${esc(r.sourceFingerprint)}</code><br>Executed browser commit: <code>${esc(r.qaCommit)}</code><br>Review-only commit: <code>${esc(process.env.GITHUB_SHA)}</code></p><h2>Known-defect results</h2><pre>${esc(JSON.stringify(r.correctiveRegressions,null,2))}</pre><h2>Outstanding scope decision</h2><pre>${esc(JSON.stringify(r.manualScopeDecision,null,2))}</pre><p>Seven L01–L07 production checks remain UNVERIFIED, including real new survey storage, new report authorization, historical preparation and Cloudflare Visits. Production DB recoverability remains UNVERIFIED and previously acknowledged. No production, database, schedule, domain or administrator permission changes.</p><table><tr><th>Case</th><th>Status</th><th>Evidence</th></tr>${rows}</table><h2>Actual PDFs, every default page inspected</h2>${pdf.pdfs.map(f=>`<p><a href="${esc(f.path)}">${esc(f.engine)} · ${esc(f.paper)} · ${f.pages} pages</a></p>`).join('')}</html>`);
const summary='## AltWing final corrective evidence\n\n**24 PASS · 0 FAIL · 7 UNVERIFIED**\n\n| Confirmed defect | Actual regression result |\n|---|---|\n| M01 Firefox rotation | PASS, Chromium/Firefox emulation; physical phone portion remains UNVERIFIED |\n| A06 semantics, link and contrast | PASS, zero axe violations, 60 rendered contrast measurements; actual screen readers remain A03 UNVERIFIED |\n| P03 print contrast | PASS, all21 actual Chromium/Gecko A4/Letter pages visually readable |\n| P04 pagination | PASS, actual PDF geometry and every-page visual inspection |\n\nI01/I03: owner-reported PASS for both administrators; historical preparation not performed. Original19 PASS and all original failed evidence retained.\n\n**Remaining UNVERIFIED:** '+r.remainingCases.join(', ')+'. These are not waived by a green workflow. The final owner decision must explicitly accept any proposed manual-coverage deferral. L01–L07 stay production-only.\n\nDownload the artifact for report.html, results.json, the populated interactive acceptance guide, corrected actual application, actual PDFs, original failures and build logs. No production/database/schedule changes.\n';
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
console.log(summary);
