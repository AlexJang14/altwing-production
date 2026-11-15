import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {createRequire} from 'node:module';
const nativeRequire=createRequire(import.meta.url);
function loader(){
  const cache=new Map();
  function load(file){
    const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute).exports;
    const module={exports:{}};cache.set(absolute,module);
    const output=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    const require=name=>name.startsWith('.')?load(path.resolve(path.dirname(absolute),name)+'.ts'):nativeRequire(name);
    new Function('require','module','exports',output)(require,module,module.exports);return module.exports;
  }
  return load;
}
function store(values={}){
  const data=new Map(Object.entries(values));
  return {data,get length(){return data.size;},key:i=>[...data.keys()][i]??null,getItem:key=>data.get(key)??null,setItem:(key,value)=>{data.set(key,String(value));},removeItem:key=>{data.delete(key);}};
}
const load=loader(),backup=load('src/lib/progressBackup.ts'),routes=load('src/lib/routes.ts');
const data={
  'altwing-player-progress-v1':JSON.stringify({xp:150,missions:['first-flight']}),
  'altwing-guidance-profile-v1':JSON.stringify({grade:'11',gpa:'3.7'}),
  'altwing-project-v1:solar':JSON.stringify({reflection:'My revised design',runs:[{power:42}]}),
  'altwing-cosmic-packs-v1':'["first-discovery"]',
  'altwing-analytics-consent-v1':'no',
};
for(const wing of ['propulsion','gnc','structures','thermal','avionics','mission-design']){
  data[`altwing-build-draft-v1:${wing}`]=JSON.stringify({stageIndex:3,prediction:'test'});
  data[`altwing-build-proof-${wing}`]=JSON.stringify({saved:true});
  data[`altwing-wing-path-v1:${wing}`]='{"complete":true}';
}
const original=store({...data,'altwing-visit-session-v1':'PRIVATE-ID','other-app-session':'SECRET','auth-token':'SECRET'});
const document=backup.createProgressBackup(backup.snapshotProgress(original),'https://junjang06.github.io');
const parsed=backup.parseProgressBackup(JSON.stringify(document));
assert.deepEqual({...parsed.entries},data,'Every saved record, including all six lab wings, must survive a round trip');
assert.ok(!JSON.stringify(document).includes('PRIVATE-ID'));assert.ok(!JSON.stringify(document).includes('SECRET'));
for(const key of ['__proto__','constructor','altwing-visit-session-v1','altwing-analytics-session-v1','altwing-build-draft-v1:<script>']){
  assert.equal(backup.isProgressKey(key),false);
  assert.throws(()=>backup.parseProgressBackup(JSON.stringify({...document,entries:{[key]:'bad'}})));
}
for(const value of ['not json','[]',JSON.stringify({...document,version:2}),JSON.stringify({...document,entries:[]}),JSON.stringify({...document,entries:{'altwing-player-progress-v1':42}}),JSON.stringify({...document,createdAt:'invalid'})])assert.throws(()=>backup.parseProgressBackup(value));
assert.throws(()=>backup.parseProgressBackup(' '.repeat(backup.MAX_BACKUP_BYTES+1)));
assert.equal(original.getItem('auth-token'),'SECRET','Export must not change source data');
globalThis.localStorage=store({'altwing-player-progress-v1':'existing'});
let storage=load('src/lib/storage.ts');
let result=storage.restoreLocalEntries(parsed.entries);
assert.equal(result.kept,1);assert.equal(localStorage.getItem('altwing-player-progress-v1'),'existing');
assert.equal(localStorage.getItem('altwing-project-v1:solar'),data['altwing-project-v1:solar']);
result=storage.restoreLocalEntries(parsed.entries,true);
assert.equal(result.restored,Object.keys(data).length);assert.equal(localStorage.getItem('altwing-player-progress-v1'),data['altwing-player-progress-v1']);
const disk=store({'altwing-player-progress-v1':'original'});let failed=false;
globalThis.localStorage={...disk,setItem(key,value){if(key==='altwing-cosmic-packs-v1'&&!failed){failed=true;throw Error('quota');}disk.setItem(key,value);}};
storage=loader()('src/lib/storage.ts');
assert.throws(()=>storage.restoreLocalEntries({'altwing-player-progress-v1':'replacement','altwing-cosmic-packs-v1':'new'},true));
assert.deepEqual(Object.fromEntries(disk.data),{'altwing-player-progress-v1':'original'},'A failed import must roll back writes');
let writes=0;
globalThis.localStorage={getItem:()=>null,setItem(){if(++writes>1)throw Error('access revoked');},removeItem(){throw Error('access revoked');}};
storage=loader()('src/lib/storage.ts');
assert.throws(()=>storage.restoreLocalEntries({'altwing-player-progress-v1':'a','altwing-cosmic-packs-v1':'b'}),/Some items may have changed/,'Do not promise atomic rollback if the browser revokes storage access');
globalThis.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},get length(){throw Error('blocked');}};
storage=loader()('src/lib/storage.ts');
assert.throws(()=>storage.snapshotLocal());
assert.equal(storage.writeLocal('altwing-project-v1:bridge','session draft'),false);
assert.equal(storage.snapshotLocal().sessionOnly,true);
assert.equal(backup.createProgressBackup(storage.snapshotLocal().entries,'https://altwing.org').entries['altwing-project-v1:bridge'],'session draft');
assert.throws(()=>storage.restoreLocalEntries(data));
assert.equal(storage.readLocal('altwing-project-v1:bridge'),'session draft');
const {cleanHomeAddress}=load('src/lib/domainRouting.ts');
for(const hash of ['#/','#/home','#'])assert.equal(cleanHomeAddress(hash,'/','?campaign=test'),'/?campaign=test');
for(const hash of ['', '#/projects?project=solar','#/aerospace-build?wing=gnc','#/colleges?major=civil','#/home?tab=PLAN','#main-content'])assert.equal(cleanHomeAddress(hash,'/',''),null);
for(const view of ['home','match','explore','universe','aerospace','aerospace-build','projects','sitemap','major','colleges','programs','privacy','analytics','progress-transfer'])assert.equal(routes.parseRoute(routes.routeTo(view)).view,view);
for(const wing of ['propulsion','gnc','structures','thermal','avionics','mission-design'])assert.equal(routes.parseRoute(routes.routeTo('aerospace-build',{wing})).wing,wing);
assert.equal(routes.parseRoute('#/counselor?major=civil&tab=COLLEGES').view,'colleges');
assert.equal(routes.parseRoute('#/projects?project=solar').project,'solar');
console.log('PASS: private full-progress round trip, six lab wings, conflict preservation, explicit replacement, quota rollback, blocked/session-only storage, unsafe backup rejection, homepage cleanup and all existing routes');
