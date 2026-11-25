import fs from 'node:fs';
import path from 'node:path';

// Record only packages actually present in emitted chunks, without local paths.
export function bundleRights(){let needsRscNotice=false;return {name:'altwing-bundle-rights',generateBundle(_options,bundle){
  const found=new Map();
  for(const item of Object.values(bundle))if(item.type==='chunk')for(const id of Object.keys(item.modules)){
    const clean=id.replaceAll('\\','/').split('?')[0],pos=clean.lastIndexOf('/node_modules/');if(pos<0)continue;
    const match=clean.slice(pos+14).match(/^(@[^/]+\/[^/]+|[^/]+)/);if(!match)continue;
    try{const p=JSON.parse(fs.readFileSync(path.join(clean.slice(0,pos+14),match[1],'package.json'),'utf8'));const key=p.name+'@'+p.version;found.set(key,{name:p.name,version:p.version,license:p.license??null});}catch{throw Error('Cannot identify a bundled dependency for the rights inventory.');}
  }
  this.emitFile({type:'asset',fileName:'BUNDLED-PACKAGES.json',source:JSON.stringify({scope:'Packages with modules in emitted chunks; build tools and unused optional dependencies are excluded.',packages:[...found.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.version.localeCompare(b.version))},null,2)+'\n'});
  needsRscNotice=[...found.values()].some(p=>p.name==='@vitejs/plugin-rsc');
},writeBundle(options){
  if(needsRscNotice){const file=path.join(options.dir,'BUNDLED-LICENSES.txt');fs.appendFileSync(file,'\n## Supplemental @vitejs/plugin-rsc@0.5.26 notice recovered from its upstream tag\nSource: https://github.com/vitejs/vite-plugin-react/blob/plugin-rsc@0.5.26/LICENSE\n\n'+fs.readFileSync('docs/rights/PLUGIN-RSC-LICENSE.txt','utf8')+'\n## Vendored React Server DOM notice\n'+fs.readFileSync('node_modules/@vitejs/plugin-rsc/dist/vendor/react-server-dom/LICENSE','utf8'));}
}};}
