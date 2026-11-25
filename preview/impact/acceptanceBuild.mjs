import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
export function acceptanceSubject(){
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.isFile()?[path.join(dir,e.name)]:[]);
 const files=['src','app','lib','db','worker','drizzle','public','deployment','content'].flatMap(walk).concat(['package.json','package-lock.json','.openai/hosting.json','vite.config.ts','vite.pages.config.ts','scripts/build-pages.mjs','scripts/run-framework.mjs','scripts/generate-public-information.mjs','scripts/vite/bundle-rights.mjs']).sort();
 const hash=createHash('sha256');for(const file of files)hash.update(file+'\0').update(fs.readFileSync(file)).update('\0');
 const plan=createHash('sha256');for(const file of ['docs/release-readiness/MANUAL-BROWSER-TESTS.md','docs/release-readiness/FOUNDER-AUTHORIZATION.md','docs/release-readiness/rights-register.json','preview/impact/acceptanceModel.mjs'])plan.update(fs.readFileSync(file)).update('\0');
 return {candidate:hash.digest('hex'),plan:plan.digest('hex'),baseline:'443f965f2c5f45b2199c24b0b5db800eb5fee60b',builtAt:new Date().toISOString(),scope:'Product source/configuration fingerprint; full source manifest is supplied separately. This hash is not a deployed revision or a manual test result.'};
}
