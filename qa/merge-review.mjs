import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {brotliDecompressSync} from 'node:zlib';
const out='qa/consolidated-reports';
if(process.argv.includes('--enforce')){
  const report=JSON.parse(fs.readFileSync(path.join(out,'results.json')));
  console.log(JSON.stringify({progress:report.progress,failedCases:Object.entries(report.cases).filter(([,v])=>v.status==='FAIL').map(([id])=>id),productionChanged:false},null,2));
  process.exit(Object.values(report.cases).some(v=>v.status==='FAIL')?1:0);
}
const ready=JSON.parse(fs.readFileSync('qa/READY.json'));
const report=JSON.parse(fs.readFileSync('qa/baseline/results.json'));
assert.equal(report.sourceFingerprint,ready.sourceFingerprint);
assert.equal(report.candidate,ready.productFingerprint);
const review=JSON.parse(fs.readFileSync('qa/PDF-VISUAL-REVIEW.json'));
assert.equal(review.sourceFingerprint,report.sourceFingerprint);
fs.mkdirSync(out,{recursive:true});fs.cpSync('qa/baseline',out,{recursive:true});
fs.copyFileSync('qa/baseline/results.json',path.join(out,'original-browser-results.json'));
for(const file of review.pdfs){assert.equal(createHash('sha256').update(fs.readFileSync(path.join(out,file.path))).digest('hex'),file.sha256);assert.deepEqual(file.inspectedPages,[1,2,3,4,5]);}
for(const [id,result] of Object.entries(review.cases)){
  report.cases[id].observations.push({engine:'visual-review-of-browser-PDF',status:result.status,atUTC:review.reviewedAtUTC,detail:result.observed,pdfs:review.pdfs});
  report.cases[id].status=result.status;report.cases[id].executionStatus='EXECUTED';
}
const root='qa/AltWing-Browser-QA/results';
const dirs=fs.existsSync(root)?fs.readdirSync(root).filter(d=>fs.statSync(path.join(root,d)).isDirectory()).sort():[];
const folder=dirs.at(-1)?path.join(root,dirs.at(-1)):null;
if(folder&&fs.existsSync(path.join(folder,'results.json'))){
  const diagnostic=JSON.parse(fs.readFileSync(path.join(folder,'results.json')));
  assert.equal(diagnostic.sourceFingerprint,report.sourceFingerprint);
  assert.deepEqual(diagnostic.focusedCaseIds,['M01']);
  fs.cpSync(folder,path.join(out,'mobile-followup'),{recursive:true});
  const row=diagnostic.cases.M01;
  report.cases.M01.priorObservations=report.cases.M01.observations;
  report.cases.M01.observations=row.observations.map(o=>({...o,screenshot:o.screenshot?'mobile-followup/'+o.screenshot:null}));
  report.cases.M01.status=row.status;
  report.cases.M01.executionStatus=row.executionStatus;
  report.cases.M01.diagnosticInterpretation='Original bounds assertion retained in original-browser-results.json. This follow-up records before/after viewport geometry with 350ms settling; responsive emulation never supplies physical-device PASS evidence.';
  report.mobileDiagnosticEnvironments=diagnostic.engines;
}else{
  report.cases.M01.diagnosticInterpretation='Follow-up did not produce results. Original failed bounds assertion remains open; inspect the job logs.';
}
report.evidenceRuns=[{run:45480635837,qaCommit:'cd6f6a6a9707b8b0d1a25f4d61016d91ead7be89',scope:'Complete Chromium/Firefox execution; 19 functional PASS results reused without rerunning'},{run:process.env.GITHUB_RUN_ID,qaCommit:process.env.GITHUB_SHA,scope:'Focused M01 diagnostics and reconciliation of actual visual PDF review'}];
report.reviewedAtUTC=new Date().toISOString();
report.progress=Object.fromEntries(['PASS','FAIL','UNVERIFIED'].map(status=>[status,Object.values(report.cases).filter(v=>v.status===status).length]));
report.remainingCases=Object.entries(report.cases).filter(([,v])=>v.status!=='PASS').map(([id])=>id);
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
fs.copyFileSync('qa/PDF-VISUAL-REVIEW.json',path.join(out,'PDF-VISUAL-REVIEW.json'));
if(fs.existsSync('qa/mobile-diagnostic.log'))fs.copyFileSync('qa/mobile-diagnostic.log',path.join(out,'mobile-diagnostic.log'));
const record=JSON.parse(fs.readFileSync('qa/baseline/guide-record.json'));
record.reviewer='Actual Playwright execution and separately recorded assistant visual PDF inspection';
record.evidenceRuns=report.evidenceRuns;
for(const [id,row]of Object.entries(report.cases)){
  record.cases[id]={...record.cases[id],status:row.status,notes:JSON.stringify({observations:row.observations,diagnosticInterpretation:row.diagnosticInterpretation}).slice(0,5000),evidenceReference:'results.json — '+id,recordedAt:row.status==='UNVERIFIED'?null:report.reviewedAtUTC};
}
fs.writeFileSync(path.join(out,'guide-record.json'),JSON.stringify(record,null,2)+'\n');
fs.writeFileSync(path.join(out,'acceptance-results.json'),JSON.stringify(record,null,2)+'\n');
const payload=JSON.parse(brotliDecompressSync(fs.readFileSync('qa/browser-inputs.br')));
const original=Buffer.from(payload.files.find(f=>f.name==='AltWing-Launch-Acceptance.html').data,'base64').toString();
const key=`altwing-manual-acceptance-v1:${payload.candidate}:${payload.plan}`,safe=v=>JSON.stringify(v).replaceAll('<','\\u003c');
const seed='<script>try{const k='+safe(key)+',n='+safe(record)+';const old=JSON.parse(localStorage.getItem(k)||"null");if(old&&old.candidate===n.candidate&&old.plan===n.plan){for(const id of Object.keys(n.cases)){if(old.cases?.[id]?.recordedAt&&old.cases[id].recordedAt>'+safe(report.reviewedAtUTC)+')n.cases[id]=old.cases[id];}}localStorage.setItem(k,JSON.stringify(n));}catch(e){console.error("Acceptance result restoration failed",e);}</script>';
fs.writeFileSync(path.join(out,'AltWing-Browser-Acceptance-Results.html'),original.replace('<head>','<head>'+seed));
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const rows=Object.entries(report.cases).map(([id,r])=>`<tr><th>${esc(id)}</th><td>${esc(r.status)}</td><td>${r.observations.map(o=>`<details><summary>${esc(o.engine)} · ${esc(o.status)}</summary><pre>${esc(JSON.stringify(o,null,2))}</pre>${o.screenshot?`<a href="${esc(o.screenshot)}">Screenshot</a>`:''}</details>`).join('')}</td></tr>`).join('');
fs.writeFileSync(path.join(out,'report.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AltWing actual acceptance results</title><style>body{font:16px/1.6 system-ui;background:#101216;color:#f7f2e6;margin:3vw}a{color:#45d9ff}h1{color:#e6bb65}table{border-collapse:collapse;width:100%}td,th{padding:12px;border:1px solid #777;text-align:left;vertical-align:top}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>AltWing · Actual acceptance results</h1><p><strong>${esc(JSON.stringify(report.progress))}</strong></p><p>Complete browser results are reused from run 45480635837. This follow-up runs only mobile bounds diagnostics and incorporates inspection of all ten actual A4/Letter PDF pages. No application source, production, database, domain, grants or schedules changed.</p><p><a href="results.json">results.json</a> · <a href="original-browser-results.json">Unmodified original browser evidence</a> · <a href="AltWing-Browser-Acceptance-Results.html">Populated acceptance workflow</a> · <a href="PDF-VISUAL-REVIEW.json">PDF visual review</a></p><p>Frozen source: <code>${esc(report.sourceFingerprint)}</code><br>QA evidence commit: <code>${esc(process.env.GITHUB_SHA)}</code></p><table><tr><th>Case</th><th>Status</th><th>Actual evidence</th></tr>${rows}</table><h2>Actual browser PDF files</h2><p>${review.pdfs.map(p=>`<a href="${esc(p.path)}">${esc(p.paper)} · ${p.pages} inspected pages</a>`).join('<br>')}</p></html>`);
const summary=`## AltWing consolidated acceptance results\n\n**${report.progress.PASS} PASS · ${report.progress.FAIL} FAIL · ${report.progress.UNVERIFIED} UNVERIFIED**\n\n19 completed functional cases reused from [full browser run](https://github.com/AlexJang14/altwing-production/actions/runs/45480635837). Only M01 is rerun here. All 10 actual browser PDF pages were inspected; readability failures are recorded separately from successful text/privacy assertions.\n\n| Case | Actual status |\n|---|---|\n`+Object.entries(report.cases).map(([id,r])=>`| ${id} | ${r.status} |`).join('\n')+'\n\nDownload the acceptance-results artifact for report.html, results.json, the populated acceptance workflow, original browser logs/screenshots/videos, focused geometry diagnostics and actual PDFs. Unperformed physical-device, screen-reader and real-account requirements remain UNVERIFIED. **No production or database changes. No release approval inferred.**\n';
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
console.log(summary);
