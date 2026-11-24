import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {inspectPdf} from './pdf-inspection.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
export async function nativeFirefoxPrint({playwright,pdfjs,origin,out}){
  // Standard WebDriver Print Page supplies an actual Gecko PDF. Playwright's
  // page.pdf only supports Chromium; no Chromium PDF is relabelled Firefox.
  const probe=http.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
  let logs='',session=null,proc;
  const result={transport:'Standard WebDriver Print Page via installed geckodriver',browser:'firefox',status:'UNVERIFIED',files:[],productionContact:false};
  const endpoint='http://127.0.0.1:'+port;
  const call=async(method,uri,body)=>{const response=await fetch(endpoint+uri,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(45000)});const payload=await response.json();if(!response.ok||payload.value?.error)throw Error('WebDriver '+uri+': '+JSON.stringify(payload.value).slice(0,1000));return payload.value;};
  try{
    const version=spawnSync('geckodriver',['--version'],{encoding:'utf8'});assert.equal(version.status,0,'Installed GitHub runner geckodriver required');result.driverVersion=version.stdout.split('\n')[0];
    proc=spawn('geckodriver',['--host','127.0.0.1','--port',String(port)],{stdio:['ignore','pipe','pipe']});
    proc.stdout.on('data',b=>{logs+=b.toString();});proc.stderr.on('data',b=>{logs+=b.toString();});
    let ready=false;for(let n=0;n<80;n++){try{await call('GET','/status');ready=true;break;}catch{await delay(150);}}assert.ok(ready,'Geckodriver did not become ready');
    const started=await call('POST','/session',{capabilities:{alwaysMatch:{browserName:'firefox','moz:firefoxOptions':{binary:playwright.firefox.executablePath(),args:['-headless'],prefs:{'network.proxy.type':1,'network.proxy.http':'127.0.0.1','network.proxy.http_port':1,'network.proxy.ssl':'127.0.0.1','network.proxy.ssl_port':1,'network.proxy.no_proxies_on':'localhost,127.0.0.1','datareporting.healthreport.uploadEnabled':false,'datareporting.policy.dataSubmissionEnabled':false,'toolkit.telemetry.enabled':false}}}}});
    session=started.sessionId;result.browserVersion=started.capabilities.browserVersion;const prefix='/session/'+session;
    const js=async(script,args=[])=>call('POST',prefix+'/execute/sync',{script,args});
    await call('POST',prefix+'/url',{url:origin+'/AltWing-Launch-Acceptance.html'});
    for(let n=0;n<80;n++){if(await js('return !!document.querySelector(".impact-preview-nav")'))break;await delay(100);}
    await js('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim()==="Research report").click();');
    let reportReady=false;for(let n=0;n<80;n++){if(await js('return !!document.querySelector(".research-print-report")')){reportReady=true;break;}await delay(100);}assert.ok(reportReady,'Real React report did not render in Firefox WebDriver');
    await js('window.print=()=>{window.__qaPrintRequested=true;};Array.from(document.querySelectorAll("button")).find(b=>b.textContent.trim()==="Print / save impact report as PDF").click();');
    assert.equal(await js('return document.body.dataset.altwingPrintReport'),'research');
    for(const [paper,width,height]of[['A4',21,29.7],['Letter',21.59,27.94]]){
      const encoded=await call('POST',prefix+'/print',{orientation:'portrait',scale:1,background:true,page:{width,height},margin:{top:1.4,bottom:1.4,left:1.4,right:1.4},shrinkToFit:false});
      const bytes=Buffer.from(encoded,'base64'),name='firefox-'+paper+'-default';assert.equal(bytes.subarray(0,5).toString(),'%PDF-');fs.writeFileSync(path.join(out,'pdf',name+'.pdf'),bytes);
      result.files.push(await inspectPdf(pdfjs,bytes,name,out));
    }
    result.status='PASS';
  }catch(e){result.status=e.code==='ERR_ASSERTION'?'FAIL':'UNVERIFIED';result.error=String(e.stack||e).slice(0,3500);}
  finally{if(session)await call('DELETE','/session/'+session).catch(()=>{});if(proc)proc.kill();fs.writeFileSync(path.join(out,'firefox-native-print.json'),JSON.stringify(result,null,2)+'\n');fs.writeFileSync(path.join(out,'firefox-native-print.log'),logs.slice(-16000));}
  return result;
}
