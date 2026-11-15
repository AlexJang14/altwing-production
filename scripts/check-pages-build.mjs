import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {API_ORIGIN,pagesTarget} from '../deployment/domain.mjs';
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const requested=process.argv.find(arg=>arg.startsWith('--target='))?.split('=')[1];
for(const name of requested?[requested]:['custom','legacy','preview']){
 const target=pagesTarget(name),dir=target.outDir,html=readFileSync(`${dir}/index.html`,'utf8');
 assert.ok(!/__SITE_|%BASE_URL%/.test(html),'All deployment placeholders must be replaced');
 assert.ok(html.includes(`<link rel="canonical" href="${target.canonical}"`));
 for(const name of ['og:url','og:image','og:title','og:description','twitter:card','twitter:image'])assert.ok(html.includes(`"${name}"`),`Missing ${name}`);
 assert.ok(html.includes(`${target.canonical}brand/altwing-penguin.png`));
 assert.ok(existsSync(`${dir}/.nojekyll`));
 assert.equal(existsSync(`${dir}/CNAME`),name==='custom','Only the custom-domain build includes CNAME');
 if(name==='custom')assert.equal(readFileSync(`${dir}/CNAME`,'utf8').trim(),'altwing.org');
 if(name==='preview'){assert.ok(html.includes('noindex,nofollow'));assert.ok(readFileSync(`${dir}/robots.txt`,'utf8').includes('Disallow: /'));}
 assert.ok(readFileSync(`${dir}/robots.txt`,'utf8').includes(`${target.canonical}sitemap.xml`));
 const sitemap=readFileSync(`${dir}/sitemap.xml`,'utf8');assert.ok(!sitemap.includes('#'));assert.ok(sitemap.includes(`<loc>${target.canonical}</loc>`));
 let references=0;
 function check(reference,from){
  if(/^(https?:|data:|#|mailto:)/.test(reference))return;
  const base=new URL(from.replaceAll(path.sep,'/').replace(`${dir}/`,''),target.canonical);
  const resolved=new URL(reference,base);
  assert.ok(resolved.pathname.startsWith(target.base),`Outside deploy base: ${reference} from ${from}`);
  const relative=decodeURIComponent(resolved.pathname.slice(target.base.length));
  assert.ok(existsSync(path.join(dir,relative||'index.html')),`Missing ${reference} referenced by ${from}`);references++;
 }
 const all=files(dir),js=all.filter(file=>file.endsWith('.js')).map(file=>readFileSync(file,'utf8')).join('\n');
 assert.ok(js.includes(API_ORIGIN),'Keep the existing backend endpoint');
 assert.ok(js.includes(`${target.base}brand/altwing-penguin.png`),'Runtime brand image must use the correct deployment base');
 for(const name of ['EngineeringMatch','EngineeringExplorer','CounselorHub','MyUniversePage','ExploreAerospace','BuildEngine','Projects','PrivacyPage','SiteMap','AnalyticsPage','ProgressTransfer'])assert.ok(all.some(file=>path.basename(file).startsWith(`${name}-`)),`Missing lazy feature ${name}`);
 for(const file of all){
  const text=/\.(?:html|css|js)$/.test(file)?readFileSync(file,'utf8'):'';
  if(file.endsWith('.html'))for(const match of text.matchAll(/(?:src|href)="([^"]+)"/g))check(match[1],file);
  if(file.endsWith('.css'))for(const match of text.matchAll(/url\(["']?([^\s)"']+)["']?\)/g))check(match[1],file);
  if(file.endsWith('.js'))for(const match of text.matchAll(/(?:from\s*|import\()["'](\.[^"']+)["']/g))check(match[1],file);
 }
 console.log(`PASS: ${name} build (${target.base}), ${all.length} files, ${references} local asset/module references, all feature chunks, metadata, sitemap, CNAME policy and unchanged backend`);
}
