import {spawnSync} from 'node:child_process';
import {mkdirSync,openSync,closeSync,writeFileSync} from 'node:fs';
const directory='.sites-runtime/migration-validation';mkdirSync(directory,{recursive:true});
const commands=[
 ['source-security','npm',['run','security:source']],
 ['submission','npm',['run','test:submission']],
 ['analytics','npm',['run','test:analytics']],
 ['administrator-access','npm',['run','test:admin-access']],
 ['educational-impact','npm',['run','test:impact']],
 ['cloudflare-privacy','npm',['run','test:cloudflare']],
 ['impact-preview-build','npm',['run','build:impact-preview']],
 ['impact-preview','npm',['run','test:impact-preview']],
 ['migration','npm',['run','test:migration']],
 ['release-policy','npm',['run','test:release']],
 ['types','npm',['run','typecheck']],
 ['lint','npm',['run','lint']],
 ['engineering-balance','npm',['run','guidance:balance']],
 ['legacy-wing-balance','python3',['scripts/check-wingmatch-v5-balance.py']],
 ['guidance-freshness','npm',['run','guidance:freshness']],
 ['legacy-source-audit','python3',['scripts/final-altwing-qa.py']],
 ['backend-build','npm',['run','build']],
 ['custom-pages-build','npm',['run','build:pages']],
 ['legacy-pages-build','npm',['run','build:pages:legacy']],
 ['preview-pages-build','npm',['run','build:pages:preview']],
 ['progress-bridge-build','npm',['run','build:progress-bridge']],
 ['pages-assets','npm',['run','test:pages']],
 ['progress-bridge','npm',['run','test:progress-bridge']],
];
const results=[];
for(const [name,command,args]of commands){
 const log=`${directory}/${name}.log`,fd=openSync(log,'w'),started=Date.now();
 const result=spawnSync(command,args,{stdio:['ignore',fd,fd]});closeSync(fd);
 const entry={name,command:[command,...args].join(' '),passed:result.status===0,exitCode:result.status,signal:result.signal,durationMs:Date.now()-started,log};
 if(result.error)entry.error=result.error.message;
 results.push(entry);console.log(`${entry.passed?'PASS':'FAIL'} ${name} (${log})`);
}
const failed=results.filter(entry=>!entry.passed).map(entry=>entry.name);
writeFileSync(`${directory}/results.json`,JSON.stringify({checkedAt:new Date().toISOString(),productionChanged:false,results,failed},null,2)+'\n');
console.log(`Completed all ${results.length} checks; ${failed.length} failed. No deployment was attempted.`);
if(failed.length)process.exit(1);
