import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=path.resolve('qa/corrective/source');
const manifest=JSON.parse(fs.readFileSync('qa/CORRECTIVE-MANIFEST.json'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const row of manifest.sourceFiles)assert.equal(hash(fs.readFileSync(path.join(root,row.path))),row.sha256,row.path);
const checks=[];
for(const script of ['build:pages','build']){
  const p=spawnSync('npm',['run',script],{cwd:root,encoding:'utf8',env:{...process.env,CI:'true',WRANGLER_SEND_METRICS:'false'},maxBuffer:30_000_000});
  fs.writeFileSync(`qa/production-${script==='build'?'backend':'pages'}.log`,(p.stdout||'')+(p.stderr||''));
  console.log(`Non-publishing ${script}: ${p.status===0?'PASS':'FAIL'}`);
  checks.push({script,exitCode:p.status,status:p.status===0?'PASS':'FAIL',log:`production-${script==='build'?'backend':'pages'}.log`});
}
const generated=manifest.sourceFiles.filter(row=>hash(fs.readFileSync(path.join(root,row.path)))!==row.sha256).map(row=>row.path);
const permitted=new Set(['public/THIRD_PARTY_NOTICES.txt','public/dependency-inventory.json','public/credits.html','public/privacy.html','public/research.html','public/terms.html']);
assert.ok(generated.every(file=>permitted.has(file)),'Build changed non-generated product source: '+generated.join(', '));
const pages=path.join(root,'pages-dist');
const pageOutput=fs.existsSync(path.join(pages,'index.html'))&&fs.existsSync(path.join(pages,'CNAME'));
const workerOutput=fs.existsSync(path.join(root,'dist/server/wrangler.json'));
const report={sourceFingerprint:manifest.sourceFingerprint,inputSourceVerified:true,checks,generatedPublicNoticeOrInformationFiles:generated,generatedFileExplanation:'Existing build commands regenerate dependency notices and public information in the disposable CI checkout. Frozen source and corrective input manifest remain unchanged.',pagesOutputPresent:pageOutput,backendOutputPresent:workerOutput,productionChanged:false,databaseAccess:false,published:false};
if(pageOutput){assert.equal(fs.readFileSync(path.join(pages,'CNAME'),'utf8').trim(),'altwing.org');report.pagesIndexSha256=hash(fs.readFileSync(path.join(pages,'index.html')));}
report.status=checks.every(c=>c.status==='PASS')&&pageOutput&&workerOutput?'PASS':'FAIL';
fs.writeFileSync('qa/production-build-results.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.status!=='PASS')process.exitCode=1;
