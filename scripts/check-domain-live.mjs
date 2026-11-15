// Read-only probe. Run again after DNS/Pages/HTTPS cutover with --expect-migrated.
import {spawnSync} from 'node:child_process';
import {SITE_ORIGIN,LEGACY_ORIGIN,LEGACY_BASE,API_ORIGIN} from '../deployment/domain.mjs';
const expectMigrated=process.argv.includes('--expect-migrated');
let failures=0;
for(const [name,url,expectedOrigin]of [
  ['legacy root',`${LEGACY_ORIGIN}${LEGACY_BASE}`,SITE_ORIGIN],
  ['new root',`${SITE_ORIGIN}/`,SITE_ORIGIN],
  ['www alias','https://www.altwing.org/',SITE_ORIGIN],
  ['canonical sitemap',`${SITE_ORIGIN}/sitemap.xml`,SITE_ORIGIN],
  ['social image',`${SITE_ORIGIN}/brand/altwing-penguin.png`,SITE_ORIGIN],
]){
 const result=spawnSync('curl',['--silent','--show-error','--location','--max-redirs','8','--max-time','20','--output','/dev/null','--write-out','%{http_code} %{url_effective} %{num_redirects}',url],{encoding:'utf8'});
 const [status,finalUrl,redirects]=result.stdout.trim().split(' ');
 const passed=result.status===0&&status==='200'&&finalUrl?.startsWith(expectedOrigin+'/')&&(name!=='legacy root'||Number(redirects)>0);
 console.log(JSON.stringify({name,url,status:status??null,finalUrl:finalUrl??null,redirects:Number(redirects)||0,passed,error:result.status===0?undefined:result.stderr.trim()}));
 if(!passed)failures++;
}
// Check exact production CORS preflight without creating analytics records.
for(const origin of [SITE_ORIGIN,'https://www.altwing.org']){
 const result=spawnSync('curl',['--silent','--show-error','--max-time','20','--request','OPTIONS','--header',`Origin: ${origin}`,'--header','Access-Control-Request-Method: POST','--dump-header','-','--output','/dev/null',`${API_ORIGIN}/api/analytics/session`],{encoding:'utf8'});
 const allowed=result.status===0&&result.stdout.toLowerCase().includes(`access-control-allow-origin: ${origin}\r\n`);
 console.log(JSON.stringify({name:'backend CORS',origin,passed:allowed}));if(!allowed)failures++;
}
console.log(`${failures} checks are not yet satisfied. URL fragments are browser-only and need separate browser Back/Forward/deep-link QA.`);
if(expectMigrated&&failures)process.exit(1);
