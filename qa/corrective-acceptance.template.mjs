// Existing acceptance handoff for the isolated three-file corrective candidate. Original baseline remains frozen.
import {mergeConfig} from '__ALTWING_CORRECTIVE_ROOT__/source/node_modules/vite/dist/node/index.js';
import original from '__ALTWING_CORRECTIVE_ROOT__/source/vite.impact-preview.config.ts';
import {acceptanceSubject} from '__ALTWING_CORRECTIVE_ROOT__/source/preview/impact/acceptanceBuild.mjs';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const output='__ALTWING_CORRECTIVE_ROOT__/acceptance';
const subject=acceptanceSubject();
subject.originalPlan=subject.plan;
subject.plan='10e83aab830602262f80164de3fb9e3f1a046433fc76c3aadfb8c26685cf8ce0'; // Exact unchanged acceptance requirements; only product styling/semantics changed.
subject.scope+=' Same 38 exact cases for the final integrated source, including its real public-content snapshot. No manual results inferred. This build changes only the preview handoff.';
const manifestPath='__ALTWING_CORRECTIVE_ROOT__/evidence/SOURCE-MANIFEST.json';
const manifestHash=createHash('sha256').update(fs.readFileSync(manifestPath)).digest('hex');
const offline=original.plugins.find(p=>p.name==='self-contained-impact-preview');
offline.generateBundle={order:'post',handler:offline.generateBundle};
const oldRights='The creation screenshot and official OpenAI terms are now documented, and the deployed PNG matches the repository bytes. Account-holder permission for AltWing and any reference-image input rights remain unresolved. Review the latest provenance record and a dated grant or confirmation of prior permission. Keep the existing mascot and branding; no replacement is authorized.';
const newRights="The November 18 account-holder grant is already recorded. On November 24 the owner explicitly APPROVED the initial-release policy exception for retaining the unchanged penguin. No further mascot decision is requested. Reference-image sources and third-party permissions remain UNKNOWN/UNVERIFIED. The exception supplies no copyright clearance, third-party permission or exclusive copyright. Reopen only if genuinely new evidence changes the risk; no replacement is authorized.";
const oldInit="const [record,setRecord]=useState<RecordState>(()=>{try{return restoreRecord(localStorage.getItem(storageKey),subject,ids);}catch{return freshRecord(subject,ids);}});";
const newInit="const [record,setRecord]=useState<RecordState>(()=>{const enrich=(r:RecordState)=>({...r,environment:r.environment||navigator.userAgent,sourceManifest:r.sourceManifest||'"+manifestHash+"'});try{return enrich(restoreRecord(localStorage.getItem(storageKey),subject,ids));}catch{return enrich(freshRecord(subject,ids));}});";
const oldFooter='Finish pre-deployment tests and the specific rights evidence, then send the downloaded results for review and give final approval when ready. Post-deployment checks stay separate. This page never commits, pushes, migrates or deploys.';
const newFooter='Record only actual observations. Previously passed exact cases can be reused with their environment/evidence reference; do not rerun them just to fill this guide. Download JSON after each workflow so the assistant can reconcile your results. Seven post-deployment cases remain separate. Database recovery remains UNVERIFIED and acknowledged; Support is not a routine release prerequisite. No publication or final deployment approval is performed by this guide.';
let patched=false;
export default mergeConfig(original,{
 define:{__ALTWING_ACCEPTANCE_SUBJECT__:JSON.stringify(subject)},
 plugins:[{name:'final-acceptance-handoff',enforce:'pre',transform(code,id){
  if(id.endsWith('/preview/impact/preview.tsx'))return code+"\ndocument.body.classList.add('aw-theme-black-gold','aw-theme-golden-horizon');document.body.dataset.awKick='ion-blue';document.body.dataset.awKickLevel='3';\n";
  if(id.endsWith('/docs/release-readiness/MANUAL-BROWSER-TESTS.md')||id.endsWith('/docs/release-readiness/MANUAL-BROWSER-TESTS.md?raw'))return code.replace('Local assets load from `/altwing-production/`; the current mascot loads.','For a served build, assets load under `/altwing-production/`; the final standalone HTML embeds its assets. The current mascot loads in either mode.').replace('Refresh representative hash links and use Back/Forward.','Refresh representative hash links and use Back/Forward. In College Explorer, search Alabama A & M and inspect its selected-field verification and historical API cohort note. In Programs, inspect NASA STEM Gateway: name/organization are verified while the current cycle remains qualified. Confirm all 733 records were not labeled newly verified.').replace('Compare with the evidence table; try grade and strict-budget filters.','Compare with the retained source evidence; try grade and strict-budget filters. Check official/source/application links and the archived-cycle control; unknown deadlines must not become invented closing dates.');
  if(!id.endsWith('/preview/impact/AcceptanceGuide.tsx'))return null;
  for(const before of [oldRights,oldInit,oldFooter])if(code.split(before).length!==2)throw Error('Acceptance overlay target must match exactly once.');
  patched=true;
  return code.replace(oldRights,newRights).replace(oldInit,newInit).replace(oldFooter,newFooter)
   .replace('R01 · Active penguin’s original source and reuse permission','R01 · Remaining reference-image uncertainty')
   .replace('Browser, OS and device<input','Browser-reported environment; add device / screen reader<input')
   .replace('The standalone tabs use isolated demo fixtures. To test actual WingMatch integration, use the full local frontend from the supplied editable source:', 'Use <a href="./AltWing-Launch-Preview.html" target="_blank" rel="noreferrer">the corrected complete application</a> for real navigation, WingMatch, projects, rewards and reload checks. Use this checklist’s Assessment and Research report tabs for clearly marked synthetic submissions and print reports. If your browser blocks storage for local HTML, use the existing local-server alternative below:')
   .replace('{workflow.target&&<button','{workflow.id===\'full\'&&<p><a href="./AltWing-Launch-Preview.html" target="_blank" rel="noreferrer">Open the corrected complete application</a>. Start with D01–D03 in one session; keep it for D09–D11. Reuse an already performed exact case by recording its actual outcome and evidence.</p>}{workflow.target&&<button');
 },writeBundle(){
  if(!patched)throw Error('Acceptance handoff overlay was not applied.');
  const file=output+'/index.html';let html=fs.readFileSync(file,'utf8');
  if(html.includes('__VITE_PRELOAD__'))throw Error('Unfinished preview bundle');
  const notices=['src/assets/black-gold/fonts/manrope-OFL.txt','src/assets/black-gold/fonts/spacegrotesk-OFL.txt'].map(p=>fs.readFileSync(p,'utf8')).join('\n\n');
  html=html.replace('</body>','<!-- Existing font notices\n'+notices.replaceAll('-->','-- >')+'\n-->\n</body>');
  fs.writeFileSync(file,html);
  fs.writeFileSync('__ALTWING_CORRECTIVE_ROOT__/evidence/ACCEPTANCE-SUBJECT.json',JSON.stringify({...subject,sourceManifest:manifestPath,sourceManifestFileSha256:manifestHash,sourceModified:false,cases:38,preDeployment:31,postDeployment:7},null,2)+'\n');
 }}],
 build:{outDir:output,emptyOutDir:true}
});
