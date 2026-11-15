import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

// A pre-existing advisory may be acknowledged only while its exact inputs and
// failure output match the reviewed baseline. Every unexpected failure blocks.
export function evaluateRelease(report,baseline,read=readFileSync){
  if(!Array.isArray(report.results)||!Array.isArray(baseline.requiredChecks))throw Error('Missing release-check results or policy.');
  const known=[],unexpected=[],names=new Set();
  for(const entry of report.results){
    if(names.has(entry.name)||typeof entry.passed!=='boolean')throw Error('Invalid or duplicate check result.');
    names.add(entry.name);
    if(entry.passed)continue;
    const allowance=baseline.advisories[entry.name];
    let matches=Boolean(allowance)&&entry.exitCode===1&&!entry.signal;
    if(matches){
      try{
        matches=Object.entries(allowance.files).every(([file,sha])=>createHash('sha256').update(read(file)).digest('hex')===sha);
        const output=String(read(entry.log));
        matches=matches&&allowance.requiredOutput.every(fragment=>output.includes(fragment));
      }catch{matches=false;}
    }
    (matches?known:unexpected).push({name:entry.name,reason:matches?allowance.reason:'Failure is not the unchanged reviewed advisory.'});
  }
  for(const name of baseline.requiredChecks)if(!names.has(name))unexpected.push({name,reason:'Required check did not run.'});
  return {known,unexpected,canDeploy:unexpected.length===0};
}
