import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
const sha=text=>createHash('sha256').update(text).digest('hex');
const packages=[],notices=['ALTWING THIRD-PARTY NOTICES\n\nThese licenses apply to their respective third-party components only. They do not license AltWing proprietary code or establish rights in inherited content. Full locked inventory includes build tools and optional platform packages; BUNDLED-PACKAGES.json identifies modules actually emitted by each build. Missing notice files are explicitly recorded and are not copyright clearance.\n'];
function noticeFiles(dir,depth=0){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
 const p=path.join(dir,e.name);if(e.isDirectory())return !['node_modules','.git'].includes(e.name)?noticeFiles(p,depth+1):[];
 return /^(licen[sc]e|copying|notice|copyright|third.party)(?:$|[._-])/i.test(e.name)?[p]:[];
});}
for(const [location,p]of Object.entries(lock.packages).sort(([a],[b])=>a.localeCompare(b))){
 if(!location)continue;
 const installed=fs.existsSync(path.join(location,'package.json')),meta=installed?JSON.parse(fs.readFileSync(path.join(location,'package.json'),'utf8')):p;
 const name=meta.name??location.split('node_modules/').at(-1),files=installed?noticeFiles(location):[];
 const row={name,version:p.version,license:p.license??meta.license??null,location,installed,development:!!p.dev,optional:!!p.optional,source:typeof meta.repository==='string'?meta.repository:meta.repository?.url??p.resolved??null,notices:files.map(f=>({file:path.relative(location,f),sha256:sha(fs.readFileSync(f))})),status:!installed?'optional/not installed':files.length?'installed notice files retained':'notice file not found; review required'};
 packages.push(row);
 for(const file of files)notices.push(`\n${'='.repeat(72)}\n${name}@${p.version} — ${path.relative(location,file)}\nDeclared license: ${row.license}\nSource: ${row.source}\n${'='.repeat(72)}\n${fs.readFileSync(file,'utf8')}\n`);
}
notices.push('\nSITES VITE PLUGIN — scripts/vite/sites-vite-plugin.LICENSE\n'+fs.readFileSync('scripts/vite/sites-vite-plugin.LICENSE','utf8'));
notices.push('\nVITE CREATE-VITE TEMPLATE ASSETS — docs/rights/VITE-TEMPLATE-LICENSE.txt\n'+fs.readFileSync('docs/rights/VITE-TEMPLATE-LICENSE.txt','utf8'));
notices.push('\n@vitejs/plugin-rsc@0.5.26 — upstream repository LICENSE at tag plugin-rsc@0.5.26 (missing from package root); https://github.com/vitejs/vite-plugin-react/blob/plugin-rsc@0.5.26/LICENSE\n'+fs.readFileSync('docs/rights/PLUGIN-RSC-LICENSE.txt','utf8'));
// Locally hosted design fonts are assets, not npm packages. Preserve OFL texts
// through every backend/Pages regeneration without changing the locked inventory.
const fontDirectory='src/assets/black-gold/fonts';
if(fs.existsSync(fontDirectory))for(const name of fs.readdirSync(fontDirectory).filter(name=>name.endsWith('-OFL.txt')).sort())notices.push('\nALTWING DESIGN FONT — '+name+'\n'+fs.readFileSync(path.join(fontDirectory,name),'utf8'));
fs.writeFileSync('public/THIRD_PARTY_NOTICES.txt',notices.join('\n'));
fs.writeFileSync('public/dependency-inventory.json',JSON.stringify({lockfileSha256:sha(fs.readFileSync('package-lock.json')),scope:'All non-root package-lock entries, including unused tools and uninstalled optional platforms. Metadata and preserved notices are evidence, not blanket rights clearance.',packages},null,2)+'\n');
console.log(`Prepared ${packages.length} locked dependency records; ${packages.filter(p=>p.installed).length} installed. Individual missing notices remain visible.`);
