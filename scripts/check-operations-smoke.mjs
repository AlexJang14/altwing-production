// Read-only production smoke checks. Never submit survey, analytics, or administrator data.
// These checks DO NOT verify authenticated administrator grants or persistent DB writes.
import {writeFileSync,mkdirSync} from 'node:fs';
const SITE='https://altwing.org';
const ADMIN='https://altwing-engineering-pathways.theanna.chatgpt.site';
const results=[];
async function probe(label,url,{expect='ok',timeout=20000}={}){
  const started=Date.now();
  try {
    const response=await fetch(url,{method:'GET',redirect:'manual',headers:{'Cache-Control':'no-cache','User-Agent':'AltWing-Operations-ReadOnly-Smoke/1.0'},signal:AbortSignal.timeout(timeout)});
    const status=response.status;
    let passed=false,detail='';
    if(expect==='ok'){
      passed=status===200;
      detail='Expected HTTP 200';
    }else if(expect==='deny'){
      // Anonymous GET /admin must not render the protected dashboard.
      // A login redirect is still not proof of authorization.
      passed=[401,403,404].includes(status)||[301,302,303,307,308].includes(status);
      detail='Expected denial or authentication redirect; cannot prove unlisted-account denial';
    }
    const record={label,status,passed,detail,durationMs:Date.now()-started};
    results.push(record);
    console.log(JSON.stringify(record));
  }catch(error){
    const record={label,passed:false,error:String(error),durationMs:Date.now()-started};
    results.push(record);console.error(JSON.stringify(record));
  }
}
await probe('public home',SITE+'/');
await probe('public sitemap',SITE+'/sitemap.xml');
await probe('published mascot asset',SITE+'/brand/altwing-penguin.png');
await probe('anonymous private dashboard denied',ADMIN+'/admin',{expect:'deny'});
const passed=results.filter(x=>x.passed).length;
const report={checkedAt:new Date().toISOString(),readOnly:true,productionWrites:0,results,passed,failed:results.length-passed,
  notCovered:['Real signed-in unlisted account denial (I02)','Both actual administrator account grants and private exports','Real survey stored and retrieved in production database','Cloudflare Visits and consented production event ingestion','Physical devices, screen readers and browser zoom','Production database restore rehearsal']};
mkdirSync('.sites-runtime/operations-smoke',{recursive:true});
writeFileSync('.sites-runtime/operations-smoke/report.json',JSON.stringify(report,null,2)+'\n');
if(process.env.GITHUB_STEP_SUMMARY){
  const lines=['## AltWing read-only operations smoke','',`**${passed}/${results.length} HTTP checks passed.** No production records written.`,'','| Probe | HTTP | Result |','|---|---:|---|',
    ...results.map(x=>`| ${x.label} | ${x.status??'-'} | ${x.passed?'PASS':'FAIL'} |`),
    '','**Not covered:** Real identity authorization, real survey/database writes, private exports, analytics ingestion, physical devices, accessibility assistive technology, DB restore.'];
  const {appendFileSync}=await import('node:fs');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
}
if(passed!==results.length)process.exitCode=1;
