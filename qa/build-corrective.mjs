import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {brotliCompressSync,constants} from 'node:zlib';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve('qa/corrective'),source=path.join(root,'source'),hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync('qa/CORRECTIVE-MANIFEST.json'));
function run(args,extra={}){const r=spawnSync(process.execPath,args,{cwd:source,stdio:'inherit',env:{...process.env,...extra}});if(r.error)throw r.error;assert.equal(r.status,0,'Corrective build/check failed: '+args.join(' '));}
run(['node_modules/typescript/bin/tsc','--noEmit','--incremental','false']);
run(['node_modules/vite/bin/vite.js','build','--config','vite.gold-preview.config.ts']);
run(['node_modules/vite/bin/vite.js','build','--config',path.join(root,'verification/acceptance.config.mjs')]);
run(['node_modules/vite/bin/vite.js','build','--config','vite.pages.config.ts'],{ALTWING_PAGES_TARGET:'preview'});
const cwd=process.cwd();process.chdir(source);
const {writePublicInformation}=await import(pathToFileURL(path.join(source,'scripts/generate-public-information.mjs')));
writePublicInformation('pages-preview','https://alexjang14.github.io/altwing-production/',true);
fs.writeFileSync('pages-preview/.nojekyll','');
const {acceptanceSubject}=await import(pathToFileURL(path.join(source,'preview/impact/acceptanceBuild.mjs')));
const subject=acceptanceSubject();process.chdir(cwd);
for(const row of manifest.sourceFiles){const bytes=fs.readFileSync(path.join(source,row.path));assert.equal(hash(bytes),row.sha256,'Build altered protected source '+row.path);}
const files=[];function add(name,file){const bytes=fs.readFileSync(file);files.push({name,sha256:hash(bytes),data:bytes.toString('base64')});}
add('AltWing-Launch-Preview.html',path.join(source,'.sites-runtime/gold-homepage-preview/index.html'));
add('AltWing-Launch-Acceptance.html',path.join(root,'acceptance/index.html'));
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(e.isFile())add('altwing-production/'+path.relative(path.join(source,'pages-preview'),file).split(path.sep).join('/'),file);}}
walk(path.join(source,'pages-preview'));
for(const f of files.filter(f=>f.name.endsWith('.html')&&!f.name.startsWith('altwing-production/'))){const text=Buffer.from(f.data,'base64').toString();assert.ok(!text.includes('__VITE_PRELOAD__'));assert.ok(!/<script\b[^>]*\bsrc=/.test(text));}
const payload={sourceFingerprint:manifest.sourceFingerprint,candidate:subject.candidate,plan:'10e83aab830602262f80164de3fb9e3f1a046433fc76c3aadfb8c26685cf8ce0',files};
fs.writeFileSync('qa/corrective-browser-inputs.br',brotliCompressSync(Buffer.from(JSON.stringify(payload)),{params:{[constants.BROTLI_PARAM_QUALITY]:5}}));
fs.writeFileSync('qa/corrective-build.json',JSON.stringify({sourceFingerprint:manifest.sourceFingerprint,productFingerprint:subject.candidate,files:files.map(({name,sha256})=>({name,sha256})),sourceFilesUnchangedByBuild:true,productionChanged:false},null,2)+'\n');
console.log(JSON.stringify({builtActualApplication:true,sourceFingerprint:manifest.sourceFingerprint,productFingerprint:subject.candidate,embeddedOrServedFiles:files.length,productionChanged:false}));
