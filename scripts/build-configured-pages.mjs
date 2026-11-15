import {spawnSync} from 'node:child_process';
import {appendFileSync} from 'node:fs';
import {PREVIEW_BASE,pagesTarget} from '../deployment/domain.mjs';
const base=(process.env.ALTWING_CONFIGURED_BASE??'').replace(/\/$/,'');
const name=base===''?'custom':base===PREVIEW_BASE.slice(0,-1)?'preview':null;
if(!name)throw Error(`Unexpected GitHub Pages base path: ${base}. Refusing to publish assets at the wrong address.`);
for(const args of [['scripts/build-pages.mjs',...(name==='preview'?['--preview']:[])],['scripts/check-pages-build.mjs',`--target=${name}`]]){
 const result=spawnSync(process.execPath,args,{stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status??1);
}
if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`directory=${pagesTarget(name).outDir}\ntarget=${name}\n`);
