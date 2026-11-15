import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import ts from 'typescript';
import {LEGACY_ORIGIN,SITE_ORIGIN} from '../deployment/domain.mjs';
const policy=ts.transpileModule(readFileSync('src/lib/progressBackup.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const dir='progress-bridge-dist';mkdirSync(dir,{recursive:true});
const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Recover saved progress · AltWing</title><style>body{margin:0;background:#081124;color:#f5f7ff;font:17px/1.65 system-ui,sans-serif}main{max-width:720px;padding:48px 24px;margin:auto}h1{line-height:1.15}a{color:#b8d6ff}button{font:inherit;padding:12px 20px;border-radius:8px;cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid #ffb36c;outline-offset:4px}</style></head>
<body><main><p>ALTWING · SAVED PROGRESS</p><h1>Bring your discoveries with you.</h1><p>Use the browser and browser profile you used for the original AltWing website. This page reads saved AltWing data from the original GitHub address and downloads a private backup. It does not upload your work or change your saved data.</p><button id="export" type="button">Download my saved progress</button><p id="status" role="status"></p><p>Then open <a href="${SITE_ORIGIN}/#/progress-transfer" rel="noreferrer">AltWing’s progress transfer page</a> and restore the file.</p><p>The file may contain your profile and written reflections. Keep it private. Sign-in sessions and analytics identifiers are excluded. Changes held only in another open tab cannot be read here; export from that tab before closing it.</p></main>
<script type="module">
const policy=(()=>{const exports={};${policy}\nreturn exports;})();
const button=document.getElementById('export'),status=document.getElementById('status');
if(location.origin!==${JSON.stringify(LEGACY_ORIGIN)}){
  button.disabled=true;status.textContent='Open this recovery page on ${LEGACY_ORIGIN} to access your original saved progress.';
}else button.addEventListener('click',()=>{
  try{
    const value=policy.createProgressBackup(policy.snapshotProgress(localStorage),location.origin);
    const count=Object.keys(value.entries).length;
    if(!count){status.textContent='No saved AltWing data was found. Try the original browser profile or export from your original open AltWing tab.';return;}
    const blob=new Blob([JSON.stringify(value)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='altwing-progress-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent=count+' saved items exported. Keep the file private and restore it at altwing.org.';
  }catch{status.textContent='This browser could not read the original saved data. Enable site storage or try the original browser profile. Your saved data was not changed.';}
});
</script></body></html>`;
writeFileSync(`${dir}/index.html`,html);writeFileSync(`${dir}/.nojekyll`,'');
writeFileSync(`${dir}/README.txt`,[
  'AltWing original-origin progress recovery',
  '',
  'Publish index.html and .nojekyll to a SEPARATE GitHub Pages repository owned by junjang06.',
  'Suggested repository: altwing-progress-bridge; Pages branch: main, folder: /.',
  'Expected URL: https://junjang06.github.io/altwing-progress-bridge/',
  'Do not configure a custom domain for the bridge. No CNAME is included.',
  'Do not publish under /altwing/: that project will redirect to the new domain.',
  'Test with the original browser profile before cutover. Keep this bridge available after cutover.',
  'Only the exact original origin can export. This is a read-only, network-free localStorage exporter.',
  'Open-tab memory changes and browser data already cleared cannot be recovered here.',
].join('\n')+'\n');
console.log('Prepared standalone original-origin recovery bridge: progress-bridge-dist (no CNAME)');
