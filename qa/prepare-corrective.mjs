import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const sha=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(fs.readFileSync('qa/SOURCE-MANIFEST.json'));
const current=JSON.parse(fs.readFileSync('qa/CORRECTIVE-MANIFEST.json'));
assert.equal(baseline.sourceFingerprint,current.baselineSourceFingerprint);
assert.deepEqual(current.changedFiles.map(x=>x.path).sort(),['src/design/golden-horizon/interactions.css','src/features/analytics/AssessmentDialog.tsx','src/features/analytics/research-report.css']);
const root=path.resolve('qa/corrective');fs.mkdirSync(root,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'altwing-corrective-'));
try{
  const unpack=spawnSync('tar',['-xzf','qa/frozen-candidate.tar.gz','-C',temp]);assert.equal(unpack.status,0);
  for(const r of baseline.sourceFiles){const b=fs.readFileSync(path.join(temp,'candidate',r.path));assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256);}
  for(const r of current.changedFiles){const b=fs.readFileSync(path.join('qa/corrective-overlays',r.path));assert.equal(sha(b),r.after);assert.equal(sha(fs.readFileSync(path.join(temp,'candidate',r.path))),r.before);fs.writeFileSync(path.join(temp,'candidate',r.path),b);}
  fs.renameSync(path.join(temp,'candidate'),path.join(root,'source'));
}finally{fs.rmSync(temp,{recursive:true,force:true});}
for(const r of current.sourceFiles){const b=fs.readFileSync(path.join(root,'source',r.path));assert.equal(b.length,r.bytes);assert.equal(sha(b),r.sha256,'Unexpected corrective change: '+r.path);}
const rows=current.sourceFiles.map(({bytes,path,sha256})=>({bytes,path,sha256}));assert.equal(sha(JSON.stringify(rows)),current.sourceFingerprint);
fs.mkdirSync(path.join(root,'verification'),{recursive:true});fs.mkdirSync(path.join(root,'evidence'),{recursive:true});
fs.copyFileSync('qa/CORRECTIVE-MANIFEST.json',path.join(root,'evidence/SOURCE-MANIFEST.json'));
const template=fs.readFileSync('qa/corrective-acceptance.template.mjs','utf8');
fs.writeFileSync(path.join(root,'verification/acceptance.config.mjs'),template.replaceAll('__ALTWING_CORRECTIVE_ROOT__',root));
console.log(JSON.stringify({sourceFiles:current.sourceFiles.length,changedFiles:current.changedFiles.map(r=>r.path),sourceFingerprint:current.sourceFingerprint,baselinePreserved:true,productionChanged:false}));
