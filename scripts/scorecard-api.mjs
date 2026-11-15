// Run only in Node/build tooling, never in the browser. Keep private keys out of VITE_*.
import fs from 'node:fs/promises';
const probe=process.argv.includes('--probe');
const key=process.env.COLLEGE_SCORECARD_API_KEY || (probe?'DEMO_KEY':'');
if(!key){console.error('Set COLLEGE_SCORECARD_API_KEY in your local shell, or use --probe for one public demo request. The shipped website uses a bundled snapshot and does not need a key.');process.exit(1);}
const fields=['id','school.name','school.city','school.state','school.school_url','latest.academics.program_percentage.engineering'];
const collected=[];
let total=0;
try {
  for(let page=0;page<100;page++) {
    const url=new URL('https://api.data.gov/ed/collegescorecard/v1/schools');
    const params={api_key:key,per_page:probe?'1':'100',page:String(page),'school.operating':'1','school.degrees_awarded.predominant':'3',_fields:fields.join(',')};
    Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
    const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
    if(!response.ok)throw new Error(`College Scorecard returned HTTP ${response.status}; no candidate file was replaced.`);
    const data=await response.json();
    if(!Array.isArray(data.results)||!Number.isFinite(data.metadata?.total))throw new Error('Unexpected API response shape.');
    total=data.metadata.total;
    for(const row of data.results){if(!Number.isFinite(row.id)||typeof row['school.name']!=='string')throw new Error('Invalid institution record.');collected.push(row);}
    if(probe||collected.length>=total)break;
  }
  if(probe)console.log(`Scorecard API connected: ${total} operating, bachelor-focused institution records; first response shape verified. DEMO_KEY is for development only.`);
  else {
    if(collected.length<total)throw new Error('Pagination incomplete; refusing partial candidate file.');
    const universities=collected.filter(r=>Number(r['latest.academics.program_percentage.engineering'])>0);
    const file=new URL('../docs/scorecard-api-candidate.json',import.meta.url);
    await fs.mkdir(new URL('../docs/',import.meta.url),{recursive:true});
    await fs.writeFile(file,JSON.stringify({retrievedAt:new Date().toISOString(),source:'https://api.data.gov/ed/collegescorecard/v1/schools',note:'Review candidate snapshot before importing. Broad engineering completion share does not prove specific-major availability. Latest variables may use different cohorts.',universities},null,2));
    console.log(`Saved ${universities.length} engineering university candidates to docs/scorecard-api-candidate.json for review. Website catalog unchanged.`);
  }
} catch(error){console.error(error instanceof Error?error.message:'Scorecard request failed.');process.exit(1);}
