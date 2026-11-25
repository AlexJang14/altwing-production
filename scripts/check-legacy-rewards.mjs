// Existing universe/reward regression checks. Synthetic in-memory state only;
// actual React server markup is not a browser interaction or accessibility test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const nativeRequire=createRequire(import.meta.url),store=new Map(),events=[];
let writes=0;
globalThis.localStorage={
  get length(){return store.size;},key:i=>[...store.keys()][i]??null,
  getItem:key=>store.get(key)??null,setItem:(key,value)=>{writes++;store.set(key,String(value));},
  removeItem:key=>store.delete(key),
};
globalThis.window={dispatchEvent:event=>{events.push(event);return true;}};
globalThis.CustomEvent=class {constructor(type,options){this.type=type;this.detail=options?.detail;}};
globalThis.fetch=()=>{throw Error('Reward regression checks must not make network requests.');};

function moduleLoader(){
  const cache=new Map();
  return function load(file){
    const absolute=path.resolve(file);if(cache.has(absolute))return cache.get(absolute).exports;
    const module={exports:{}};cache.set(absolute,module);
    const require=name=>{
      if(name.endsWith('/posthog'))return {default:{capture(){throw Error('Unexpected telemetry in isolated rewards test.');}},isPostHogConfigured:false};
      if(name.endsWith('.css'))return {};
      if(!name.startsWith('.'))return nativeRequire(name);
      const base=path.resolve(path.dirname(absolute),name);
      return load(fs.existsSync(base)?base:fs.existsSync(base+'.ts')?base+'.ts':base+'.tsx');
    };
    const output=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    new Function('require','module','exports',output)(require,module,module.exports);
    return module.exports;
  };
}
const read=file=>fs.readFileSync(file,'utf8'),load=moduleLoader();
const routes=load('src/lib/routes.ts');
assert.equal(routes.parseRoute('#/universe').view,'universe');
// Structural anchors only: actual rendering and transactions are checked below.
assert.match(read('src/App.tsx'),/const\s+MyUniversePage\s*=\s*lazy\(\(\)\s*=>\s*import\(['"]\.\/features\/progression\/MyUniversePage['"]\)\)/);
assert.match(read('src/App.tsx'),/route\.view\s*===\s*['"]universe['"]\)\s*page\s*=\s*<MyUniversePage\b/);
assert.match(read('src/features/progression/MyUniversePage.tsx'),/import\s+MyUniversePanel\s+from\s+['"]\.\/MyUniversePanel['"]/);
assert.match(read('src/features/progression/MyUniversePage.tsx'),/<MyUniversePanel\s*\/>/);
const panelSource=read('src/features/progression/MyUniversePanel.tsx');
for(const name of ['CosmicPackVault','CosmicAtlas']){
  assert.match(panelSource,new RegExp(`import\\s+${name}\\s+from\\s+['"]\\./${name}['"]`));
  assert.match(panelSource,new RegExp(`<${name}\\b`));
}
console.log('PASS: universe route → page → panel → actual vault/atlas wiring.');

const packs=load('src/features/progression/cosmic-packs.ts'),cosmic=load('src/features/progression/cosmic.ts');
const renderPanel=loader=>renderToStaticMarkup(createElement(loader('src/features/progression/MyUniversePanel.tsx').default));
function noCompetitiveClaims(html,state){
  const visible=html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  assert.doesNotMatch(visible,/leader\s?board|verified\s+(?:student|account)|global\s+rank(?:ing)?|student\s+rankings?|submit\s+(?:my\s+)?score/i,`${state}: do not claim a competitive or verified student leaderboard.`);
  assert.doesNotMatch(html,/(?:href|action)=["'][^"']*leaderboard/i,`${state}: do not offer a nonexistent leaderboard destination.`);
}
const empty=renderPanel(load);
assert.match(empty,/class="cosmic-pack-vault"/,'Empty state must render the real vault.');
assert.match(empty,/NO PACKS READY/);
assert.match(empty,/aria-pressed="true"[^>]*>Open packs/);
assert.match(empty,/My planet collection/);
noCompetitiveClaims(empty,'empty');
assert.deepEqual(packs.readCosmicPackInventory().packs,[]);
const emptyBefore=[...store],emptyWrites=writes;
assert.equal(packs.openCosmicPack('qa:missing-pack'),null,'Missing pack IDs must be rejected.');
assert.deepEqual([...store],emptyBefore,'A missing pack must not write storage.');
assert.equal(writes,emptyWrites);
console.log('PASS: real empty-vault rendering and missing-pack rejection without storage writes.');

const award=packs.awardCosmicPack('qa:legacy-readiness:project','BUILDER','Isolated QA project');
assert.equal(award.awarded,true);
assert.equal(packs.readCosmicPackInventory().packs.length,1);
const afterAward=[...store],awardWrites=writes,awardEvents=events.filter(e=>e.type===packs.COSMIC_PACK_AWARDED_EVENT).length;
assert.equal(awardEvents,1);
const duplicate=packs.awardCosmicPack('qa:legacy-readiness:project','BUILDER','Isolated QA project');
assert.equal(duplicate.awarded,false,'Repeated reward source must not issue a second pack.');
assert.equal(duplicate.pack.id,award.pack.id);
assert.deepEqual([...store],afterAward);
assert.equal(writes,awardWrites,'A duplicate award must not rewrite localStorage.');
assert.equal(events.filter(e=>e.type===packs.COSMIC_PACK_AWARDED_EVENT).length,awardEvents);
const ready=renderPanel(load);
assert.match(ready,/class="cosmic-pack-vault"/);
assert.match(ready,/>1 ready<\/b>/);
assert.match(ready,/OPEN PACK<\/button>/,'The real unopened vault must offer its opening control.');
assert.ok(!ready.includes('NO PACKS READY'));
noCompetitiveClaims(ready,'unopened');
console.log('PASS: one persisted award per source, no duplicate event/write, and real unopened-pack rendering.');

const opened=packs.openCosmicPack(award.pack.id);
assert.ok(opened);
assert.equal(opened.cards.length,3,'An existing builder pack reveals three catalog objects.');
assert.ok(Number.isFinite(Date.parse(opened.pack.openedAt)));
const collection=cosmic.readCosmicCollection();
for(const card of opened.cards){
  assert.ok(cosmic.CELESTIAL_OBJECTS.some(object=>object.id===card.object.id),'Every reveal must identify a real catalog object.');
  assert.ok(collection.discoveredIds.includes(card.object.id),'Every revealed object must persist in the collection.');
}
const persistedInventory=JSON.parse(store.get('altwing-cosmic-packs-v1'));
assert.equal(persistedInventory.packs[0].openedAt,opened.pack.openedAt);
assert.deepEqual(JSON.parse(store.get('altwing-cosmic-atlas-v1')),collection);
const afterOpening=[...store],openedWrites=writes,openedEvents=events.filter(e=>e.type===packs.COSMIC_PACK_OPENED_EVENT).length;
assert.equal(openedEvents,1);
assert.equal(packs.openCosmicPack(award.pack.id),null,'Already-opened packs must not open twice.');
assert.equal(packs.openCosmicPack('qa:still-missing'),null);
assert.deepEqual([...store],afterOpening,'Rejected openings must not alter saved inventory or collection.');
assert.equal(writes,openedWrites);
assert.equal(events.filter(e=>e.type===packs.COSMIC_PACK_OPENED_EVENT).length,openedEvents);

// A fresh module cache reads the serialized store rather than relying on an
// earlier module's in-memory storage cache. This does not simulate a browser reload.
const reloaded=moduleLoader(),readBack=reloaded('src/features/progression/cosmic-packs.ts');
assert.deepEqual(readBack.readCosmicPackInventory(),persistedInventory);
assert.deepEqual(reloaded('src/features/progression/cosmic.ts').readCosmicCollection(),collection);
const collected=renderPanel(reloaded);
assert.match(collected,/class="cosmic-atlas\b/,'Opened state defaults to the real collection component.');
assert.match(collected,/aria-pressed="true"[^>]*>My planet collection/);
for(const card of opened.cards)assert.ok(collected.includes(`data-cosmic="${card.object.id}"`),'Persisted discovered objects must appear in the real atlas markup.');
noCompetitiveClaims(collected,'collection');
console.log('PASS: three valid persisted discoveries; missing/reopened packs rejected; fresh-module readback and real collection rendering.');
console.log('PASS: all three rendered universe states omit competitive/verified student leaderboard claims.');
console.log('LIMIT: isolated transactions and React server markup only; browser interaction, animations, keyboard/touch accessibility and live data were not tested.');
