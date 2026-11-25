// Actual handler + separate SQLite connections; synthetic records only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import ts from 'typescript';

const nativeRequire=createRequire(import.meta.url);
const statements=name=>fs.readFileSync('drizzle/'+name,'utf8').split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);
function baseline(db){for(const name of ['0000_reflective_shockwave.sql','0001_impact_measurement.sql'])for(const sql of statements(name))db.prepare(sql).run();}
function runtime(db){
  const env={DB:{prepare(sql){return {args:[],bind(...args){this.args=args;return this;},async run(){const r=db.prepare(sql).run(...this.args);return {meta:{changes:r.changes}};},async all(){return {results:db.prepare(sql).all(...this.args)};}};}},ANALYTICS_INGEST_SECRET:'synthetic-atomic-test',ANALYTICS_ALLOWED_ORIGINS:'https://altwing.org'};
  const cache=new Map();
  function load(file){const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute).exports;const module={exports:{}};cache.set(absolute,module);
    const js=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    const require=name=>name==='cloudflare:workers'?{env}:name==='next/headers'?{headers:async()=>new Headers()}:name.startsWith('.')?load(path.resolve(path.dirname(absolute),name)+'.ts'):nativeRequire(name);
    new Function('require','module','exports',js)(require,module,module.exports);return module.exports;}
  const ingest=load('app/api/analytics/events/route.ts'),{signVisit}=load('lib/analytics-capability.ts');
  return async function send(session,major='mechanical',extra={}){
    const body={id:crypto.randomUUID(),session_id:session,event:'Recommended Field Explored',properties:{page:'major',major},...extra};
    const response=await ingest.POST(new Request('https://backend.test/api/analytics/events',{method:'POST',headers:{Origin:'https://altwing.org','Content-Type':'application/json','X-AltWing-Visit':await signVisit(session,env.ANALYTICS_INGEST_SECRET)},body:JSON.stringify(body)}));
    return {status:response.status,...await response.json()};
  };
}

if(!isMainThread){
  const db=new DatabaseSync(workerData.database);db.exec('PRAGMA busy_timeout=10000');
  const send=runtime(db);parentPort.postMessage({ready:true});
  parentPort.once('message',async()=>{try{parentPort.postMessage({result:await send(workerData.session)});}catch(e){parentPort.postMessage({error:String(e)});}finally{db.close();parentPort.close();}});
}else{
  const db=new DatabaseSync(':memory:');baseline(db);
  const now=Math.floor(Date.now()/1000),historical=crypto.randomUUID();
  db.prepare('INSERT INTO impact_totals(id) VALUES(1)').run();
  db.prepare('INSERT INTO impact_meta(id,activated_at,earliest_available,backfill_done,backfill_cursor) VALUES(1,?,?,1,0)').run(now,now);
  for(let i=0;i<2;i++)db.prepare('INSERT INTO analytics_events(id,session_id,event,created_at,page,major,origin) VALUES(?,?,?,?,?,?,?)').run(crypto.randomUUID(),historical,'Recommended Field Explored',now,'major','mechanical','https://altwing.org');
  db.prepare('INSERT INTO analytics_events(id,session_id,event,created_at,page,project,origin) VALUES(?,?,?,?,?,?,?)').run(crypto.randomUUID(),historical,'Mission Started',now,'projects','solar','https://altwing.org');
  db.prepare('INSERT INTO impact_surveys(id,session_id,version,source,created_at,testimonial,quote_permission,feedback_permission) VALUES(?,?,?,?,?,?,0,1)').run(crypto.randomUUID(),historical,'impact-v1','wingmatch',now,'SYNTHETIC historical story');
  const oldTables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(r=>r.name);
  assert.equal(oldTables.length,8);
  const snapshot=Object.fromEntries(oldTables.map(t=>[t,db.prepare('SELECT * FROM '+t+' ORDER BY rowid').all()]));
  assert.ok(Object.values(snapshot).every(rows=>rows.length>0),'Populate every old table, not just its schema');
  const oldDefinitions=db.prepare("SELECT name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY name").all();
  const migration=statements('0002_research_assessment.sql');
  assert.equal(migration.length,12);
  for(const sql of migration){assert.match(sql,/^CREATE\b/);db.prepare(sql).run();}
  for(const t of oldTables)assert.deepEqual(db.prepare('SELECT * FROM '+t+' ORDER BY rowid').all(),snapshot[t],'Migration preserves '+t);
  for(const row of oldDefinitions)assert.equal(db.prepare('SELECT sql FROM sqlite_master WHERE name=?').get(row.name).sql,row.sql);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name='analytics_recommended_field_once'").get().n,0);
  assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
  const knownDefinitions=new Map(db.prepare("SELECT name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'").all().map(row=>[row.name,row.sql]));
  function inspectPartialSchema(candidate){
    for(const row of candidate.prepare("SELECT name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'").all())assert.equal(row.sql,knownDefinitions.get(row.name),'STOP: unexpected object/definition '+row.name);
  }
  const send=runtime(db);
  assert.equal((await send(historical)).recorded,false,'Existing duplicate history blocks further duplicates without cleanup');
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM analytics_events WHERE session_id=? AND event='Recommended Field Explored'").get(historical).n,2);
  const session=crypto.randomUUID();assert.equal((await send(session)).recorded,true);assert.equal((await send(session)).recorded,false);
  assert.equal((await send(session,'civil')).recorded,true);assert.equal((await send(crypto.randomUUID())).recorded,true);
  const event={id:crypto.randomUUID(),event:'Page Viewed',properties:{page:'home'}};
  assert.equal((await send(session,'mechanical',event)).recorded,true);assert.equal((await send(session,'mechanical',event)).recorded,false);
  assert.equal(db.prepare("SELECT field_explorations AS n FROM impact_behavior_daily ORDER BY day DESC LIMIT 1").get().n,3);
  const noMigration=new DatabaseSync(':memory:');baseline(noMigration);
  const beforeSchema=runtime(noMigration),s=crypto.randomUUID();assert.equal((await beforeSchema(s)).recorded,true);assert.equal((await beforeSchema(s)).recorded,false);noMigration.close();

  // Model a statement-boundary interruption at every possible position. No
  // blind replay is safe; inspect exact known objects, then resume only an
  // identified unapplied suffix. Do not use IF NOT EXISTS to hide mismatches.
  for(let boundary=0;boundary<=migration.length;boundary++){
    const partial=new DatabaseSync(':memory:');baseline(partial);
    partial.prepare('INSERT INTO analytics_events(id,session_id,event,created_at,page) VALUES(?,?,?,?,?)').run('old-id','old-session','Page Viewed',now,'home');
    const before=partial.prepare('SELECT * FROM analytics_events').all();
    for(const sql of migration.slice(0,boundary))partial.prepare(sql).run();
    assert.deepEqual(partial.prepare('SELECT * FROM analytics_events').all(),before);
    inspectPartialSchema(partial);
    partial.prepare('INSERT INTO analytics_events(id,session_id,event,created_at,page) VALUES(?,?,?,?,?)').run('compatible-write','compatible-session','Page Viewed',now,'home');
    if(boundary>0)assert.throws(()=>partial.prepare(migration[0]).run(),/already exists/);
    for(const sql of migration.slice(boundary))partial.prepare(sql).run();
    assert.equal(partial.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
    assert.equal(partial.prepare('SELECT COUNT(*) AS n FROM analytics_events').get().n,2);partial.close();
  }
  const conflicting=new DatabaseSync(':memory:');baseline(conflicting);
  conflicting.exec('CREATE TABLE impact_assessments (id TEXT PRIMARY KEY)');
  assert.throws(()=>inspectPartialSchema(conflicting),/STOP: unexpected object\/definition impact_assessments/);
  conflicting.close();

  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'altwing-atomic-'));
  try{
    const database=path.join(tmp,'synthetic.sqlite'),shared=new DatabaseSync(database);shared.exec('PRAGMA journal_mode=WAL');baseline(shared);for(const sql of migration)shared.prepare(sql).run();
    const sharedSession=crypto.randomUUID(),workers=[];
    const results=await Promise.all(Array.from({length:8},()=>new Promise((resolve,reject)=>{
      const worker=new Worker(new URL(import.meta.url),{workerData:{database,session:sharedSession}});workers.push(worker);
      worker.on('error',reject);worker.on('message',m=>{if(m.error)reject(Error(m.error));else if(m.result)resolve(m.result);else if(m.ready&&workers.filter(w=>w.ready).length===7){worker.ready=true;for(const w of workers)w.postMessage('go');}else if(m.ready)worker.ready=true;});
      worker.on('exit',code=>{if(code)reject(Error('Worker exited '+code));});
    })));
    assert.ok(results.every(r=>r.status===202));assert.equal(results.filter(r=>r.recorded).length,1);
    assert.equal(shared.prepare('SELECT COUNT(*) AS n FROM analytics_events').get().n,1);
    assert.equal(shared.prepare('SELECT SUM(field_explorations) AS n FROM impact_behavior_daily').get().n,1);
    shared.close();await Promise.all(workers.map(w=>w.terminate()));
  }finally{fs.rmSync(tmp,{recursive:true,force:true});}
  db.close();
  console.log(JSON.stringify({status:'PASS',scope:'Synthetic local SQLite and actual ingestion handler only',oldTablesPreserved:8,oldDefinitionsPreserved:true,historicalDuplicateRowsPreserved:2,newSchemaStatements:12,partialBoundariesChecked:13,partialDefinitionsChecked:true,conflictingDefinitionRejected:true,concurrentHandlerConnections:8,concurrentRowsRecorded:1,oldSchemaCompatibility:true,productionRequests:0,databaseRecoveryVerified:false}));
}
