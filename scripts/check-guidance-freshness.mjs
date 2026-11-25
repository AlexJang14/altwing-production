import fs from "node:fs";
import path from "node:path";
import assert from 'node:assert/strict';
import ts from 'typescript';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

const files = ["src/features/guidance/opportunityCatalog.ts", "src/features/guidance/additionalOpportunities.ts"];
const source = files.map(file => fs.readFileSync(path.resolve(file), "utf8")).join("\n");
const dates = [...source.matchAll(/"?lastVerified"?\s*:\s*"(\d{4}-\d{2}-\d{2})"/g)].map((match) => match[1]);

if (dates.length === 0) {
  console.error("No opportunity verification dates found.");
  process.exit(1);
}

const now = new Date();
for(const date of dates){
  const parsed=new Date(`${date}T00:00:00Z`);
  assert.equal(parsed.toISOString().slice(0,10),date,'Source-check dates must be real calendar dates.');
  assert.ok(parsed.getTime()<=now.getTime(),'Do not future-date source checks.');
}
const stale = dates.filter((date) => {
  const ageMs = now.getTime() - new Date(`${date}T00:00:00Z`).getTime();
  return ageMs > 14 * 24 * 60 * 60 * 1000;
});

console.log(`Guidance opportunities: ${dates.length} source-check date records.`);
console.log(`Newest verification: ${dates.slice().sort().at(-1)}`);

if(stale.length)console.warn(`${stale.length} archived manual source-check dates are older than 14 days. They are not refreshed by a link check; current UI freshness comes from the validated public snapshot.`);

// Tie dates and the actual shipped records to the inspected-source evidence.
// This guards accidental drift/date-only refreshes; it is not a truth oracle.
const nativeRequire=createRequire(import.meta.url);
function load(file){if(file.endsWith('.json'))return {__esModule:true,default:JSON.parse(fs.readFileSync(file,'utf8'))};const module={exports:{}};const require=name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)+(name.endsWith('.json')?'':'.ts')):nativeRequire(name);new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(require,module,module.exports);return module.exports;}
const records=load(path.resolve(files[0])).BASE_GUIDANCE_OPPORTUNITIES;
const evidence=JSON.parse(fs.readFileSync('docs/release-readiness/OPPORTUNITY-VERIFICATION.json','utf8'));
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b,'en')).map(([k,v])=>[k,stable(v)])):value;
assert.equal(records.length,42);assert.equal(evidence.records.length,records.length);
assert.equal(new Set(evidence.records.map(r=>r.id)).size,records.length);
for(const record of records){
  const checked=evidence.records.find(r=>r.id===record.id);assert.ok(checked,`Missing official-source evidence for ${record.id}`);
  assert.ok(['VERIFIED','PARTIAL'].includes(checked.status),'Unavailable future fields must stay explicit, not be reported fully verified.');
  assert.ok(checked.officialSources.length&&checked.officialSources.every(s=>/^https?:\/\//.test(s.url)));
  assert.equal(record.lastVerified,checked.sourceCheckDate);
  const digest=createHash('sha256').update(JSON.stringify(stable(record))).digest('hex');
  assert.equal(digest,checked.appliedRecordSha256,`Record changed without reviewing its evidence: ${record.id}`);
}
console.log(`PASS: ${records.length} unique existing records match their official-source review evidence; partial/unannounced fields remain qualified.`);

const {spawnSync}=await import('node:child_process');const validated=spawnSync('python3',['-B','scripts/content-intelligence.py','validate'],{stdio:'inherit'});assert.equal(validated.status,0,'Current public snapshot must validate separately from historical source-check evidence.');
