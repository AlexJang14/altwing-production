import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {PUBLIC_PAGES,COPYRIGHT_NOTICE} from '../deployment/public-information.mjs';
import {pagesTarget} from '../deployment/domain.mjs';
const read=f=>fs.readFileSync(f,'utf8'),sha=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const inventory=JSON.parse(read('public/dependency-inventory.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(inventory.lockfileSha256,sha('package-lock.json'));
assert.equal(inventory.packages.length,Object.keys(lock.packages).length-1);
assert.equal(JSON.parse(read('package.json')).license,'UNLICENSED');assert.equal(lock.packages[''].license,'UNLICENSED');
const notices=read('public/THIRD_PARTY_NOTICES.txt');
for(const p of inventory.packages)for(const n of p.notices){assert.equal(sha(p.location+'/'+n.file),n.sha256);assert.ok(notices.includes(read(p.location+'/'+n.file)),`Notice must be retained without shortening: ${p.name}/${n.file}`);}
for(const f of ['scripts/vite/sites-vite-plugin.LICENSE','docs/rights/VITE-TEMPLATE-LICENSE.txt','docs/rights/PLUGIN-RSC-LICENSE.txt'])assert.ok(notices.includes(read(f)));
assert.ok(notices.includes('Lucide Icons and Contributors')&&notices.includes('Cole Bemis'),'Retain both ISC and Feather MIT notices');
assert.ok(!fs.existsSync('src/assets/hero.png'));assert.equal(sha('public/brand/altwing-penguin.png'),'ba5278a01945231847b44295d56e0617bf8a7b922c5bd26c00e685fcab76b975','Do not silently replace active branding');
assert.match(COPYRIGHT_NOTICE,/human-authored/);assert.match(PUBLIC_PAGES.research.sections[0].paragraphs.join(' '),/ChatGPT/);
assert.ok(read('docs/rights/RIGHTS-REVIEW.md').includes('no-go'));
const register=JSON.parse(read('docs/release-readiness/rights-register.json'));
// Copyright clearance and acceptance of a disclosed initial-release risk are
// separate decisions. Waiving a release blocker must never create clearance.
const missingRights=register.requiredEvidence.filter(e=>e.blocking!==false||e.rightsClearanceRequired===true).some(e=>e.status!=='PASS');
assert.equal(register.ownershipClearanceGate,missingRights?'FAIL':'PASS','Missing rights must not be silently marked cleared.');
const missingReleaseEvidence=register.requiredEvidence.filter(e=>e.blocking!==false).some(e=>e.status!=='PASS');
const exceptionEntries=register.requiredEvidence.filter(e=>e.releaseExceptionApproved===true);
for(const entry of exceptionEntries){
  assert.equal(entry.status,'UNVERIFIED','Risk acceptance cannot turn unknown rights into verified permission.');
  assert.equal(entry.rightsClearanceRequired,true);
  const exception=JSON.parse(read(entry.releasePolicyDecisionReference));
  assert.equal(exception.exceptionAccepted,true);
  assert.equal(exception.status,'APPROVED — INITIAL-RELEASE POLICY EXCEPTION');
  assert.equal(exception.underlyingReferenceRights,'UNVERIFIED');
  assert.equal(exception.thirdPartyPermissionInferred,false);
  assert.equal(exception.exclusiveCopyrightClaimed,false);
  assert.equal(exception.replacementAuthorized,false);
  assert.equal(sha(exception.asset),exception.assetSha256);
}
assert.equal(register.initialReleasePolicyGate,missingReleaseEvidence?'FAIL':exceptionEntries.length?'PASS_WITH_APPROVED_EXCEPTION':'PASS');
assert.equal(sha('docs/release-readiness/inherited-file-register.csv'),register.inheritedCsvSha256);
assert.ok(register.requiredEvidence.every(e=>e.documentPresent?e.evidenceReference&&e.evidenceSha256:e.status==='UNVERIFIED'),'A permission claim needs an actual evidence reference/hash, not a fabricated clearance flag.');
assert.equal(sha(register.founderAuthorization.evidenceReference),register.founderAuthorization.evidenceSha256);
assert.equal(register.founderAuthorization.status,'RECORDED_SCOPE_LIMITED');
assert.equal(register.founderAuthorization.independentOwnershipVerified,false);assert.equal(register.founderAuthorization.thirdPartyOrIndependentPermissionImplied,false);
assert.equal(register.founderAuthorization.productionApproval,false,'Scoped copyright authorization is not final release approval.');
assert.equal(register.contributionClasses.length,4);assert.ok(register.conditionalEvidence.every(e=>e.blocking===false&&e.status==='UNVERIFIED'));
const comparison=JSON.parse(read('docs/release-readiness/questionnaire-review.json'));
assert.equal(comparison.sourceFileSha256,sha(comparison.sourceFile),'Questionnaire review must match the actual unchanged wording registry.');
assert.equal(comparison.publicScopeComplete,true);assert.equal(comparison.allPossibleOrRestrictedFormsCleared,false);
assert.equal(comparison.productionChanged,false);assert.equal(comparison.questionnaireWordingChanged,false);
for(const name of ['custom','legacy','preview']){
 const target=pagesTarget(name);
 for(const [key,p]of Object.entries(PUBLIC_PAGES)){
  const html=read(`${target.outDir}/${key}.html`);assert.ok(html.includes(p.title.replaceAll('&','&amp;')),'Public title must be HTML-escaped');assert.ok(html.includes(`href="${target.canonical}${key}.html"`));
  assert.equal(html.includes('noindex,nofollow'),name==='preview');assert.ok(!/<script/i.test(html),'Informational pages do not inject tracking');assert.ok(html.includes('not a validated')||key!=='research');
  assert.ok(read(`${target.outDir}/sitemap.xml`).includes(`${key}.html`));
 }
 const bundled=JSON.parse(read(`${target.outDir}/BUNDLED-PACKAGES.json`)).packages,license=read(`${target.outDir}/BUNDLED-LICENSES.txt`);
 assert.ok(bundled.some(p=>p.name==='react'));
 for(const p of bundled){assert.ok(license.includes(p.name)&&license.includes(p.version),`Missing bundled attribution: ${p.name}`);assert.ok(inventory.packages.some(r=>r.name===p.name&&r.version===p.version));}
 assert.ok(license.includes('MIT License')&&license.includes('Meta Platforms'));
 for(const f of ['THIRD_PARTY_NOTICES.txt','dependency-inventory.json'])assert.equal(read(`${target.outDir}/${f}`),read('public/'+f));
}
// Worker bundles may include server-only libraries; do not assume frontend == server.
for(const environment of ['client','server'])if(fs.existsSync(`dist/${environment}/BUNDLED-PACKAGES.json`)){
 const data=JSON.parse(read(`dist/${environment}/BUNDLED-PACKAGES.json`)),text=read(`dist/${environment}/BUNDLED-LICENSES.txt`);
 for(const p of data.packages)assert.ok(text.includes(p.name)&&text.includes(p.version),`Worker ${environment}: attribution missing for ${p.name}`);
 if(data.packages.some(p=>p.name==='@vitejs/plugin-rsc'))assert.ok(text.includes(read('docs/rights/PLUGIN-RSC-LICENSE.txt')),'Recover missing package-root MIT notice from the pinned upstream tag');
}
console.log(`PASS: ${inventory.packages.length} dependency records and retained notice hashes; accurate AI/rights disclosures; original mascot preserved; unused hero removed; all three base-path public pages, metadata and actual-bundle notices. Approved mascot release-policy exception is separate from unresolved copyright clearance; browser/PDF acceptance remains unverified.`);
