import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const html=readFileSync('progress-bridge-dist/index.html','utf8');
assert.equal(existsSync('progress-bridge-dist/CNAME'),false);
assert.ok(html.includes('noindex,nofollow'));assert.ok(html.includes("default-src 'none'"));
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
async function scenario(origin,blocked=false){
 const values=new Map([['altwing-player-progress-v1','{"xp":42}'],['altwing-analytics-consent-v1','no'],['altwing-visit-session-v1','SECRET-ID'],['other-site-token','SECRET-TOKEN']]);
 const button={},status={},links=[],blobs=[];let clicked=0;
 button.addEventListener=(name,handler)=>{assert.equal(name,'click');button.click=handler;};
 const storage={get length(){if(blocked)throw Error('blocked');return values.size;},key:i=>[...values.keys()][i],getItem:key=>values.get(key)??null};
 const document={getElementById:id=>id==='export'?button:status,createElement:tag=>{assert.equal(tag,'a');const link={click(){clicked++;}};links.push(link);return link;}};
 runInNewContext(script,{document,location:{origin},localStorage:storage,TextEncoder,Blob,URL:{createObjectURL:blob=>{blobs.push(blob);return 'blob:local';},revokeObjectURL(){}},setTimeout:callback=>callback()});
 if(origin!=='https://junjang06.github.io'){assert.equal(button.disabled,true);assert.equal(button.click,undefined);return;}
 button.click();
 if(blocked){assert.equal(clicked,0);assert.ok(status.textContent.includes('could not read'));return;}
 assert.equal(clicked,1);assert.equal(links[0].download,'altwing-progress-backup.json');
 const text=await blobs[0].text(),backup=JSON.parse(text);
 assert.equal(backup.entries['altwing-player-progress-v1'],'{"xp":42}');assert.equal(backup.entries['altwing-analytics-consent-v1'],'no');
 assert.ok(!text.includes('SECRET'));assert.equal(values.get('altwing-player-progress-v1'),'{"xp":42}');
}
await scenario('https://junjang06.github.io');await scenario('https://altwing.org');await scenario('https://junjang06.github.io',true);
console.log('PASS: standalone recovery bridge executes without network APIs, exports original-origin progress only, excludes identifiers, preserves source data, and handles blocked storage');
