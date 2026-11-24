import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const headings=new Set(['Opportunity Access','Engineering Reasoning','Career Self-Discovery','Independent Learning Motivation','Action Readiness','Assessment completion','Behavioral outcomes','Methods and limitations']);
export async function inspectPdf(pdfjs,bytes,name,out){
  const doc=await pdfjs.getDocument({data:new Uint8Array(bytes),useSystemFonts:true,disableFontFace:true}).promise;
  let text='';const pages=[];const issues=[];
  try{for(let n=1;n<=doc.numPages;n++){
    const page=await doc.getPage(n),content=await page.getTextContent();
    const items=content.items.filter(x=>typeof x.str==='string'&&x.str.trim()).map(x=>({text:x.str,x:x.transform[4],y:x.transform[5],width:x.width,height:x.height}));
    text+=items.map(x=>x.text).join(' ')+'\n';
    const titles=items.filter(x=>headings.has(x.text.trim())&&x.height>=15);
    for(const h of titles){if(!items.some(i=>i.y<h.y-3&&i.text.trim()&&!headings.has(i.text.trim())))issues.push({page:n,type:'orphaned-heading',heading:h.text,y:h.y});}
    for(const i of items){if(i.x<30||i.y<30||i.x+i.width>page.view[2]-30||i.y+i.height>page.view[3]-30)issues.push({page:n,type:'text-outside-print-area',...i});}
    pages.push({page:n,width:page.view[2],height:page.view[3],items:items.length,headings:titles,textItems:items});
  }}finally{await doc.destroy();}
  assert.match(text,/DEMO FIXTURES/);assert.match(text,/Methods and limitations/);
  assert.ok(!text.includes('demonstrates private story layout'));
  const result={file:'pdf/'+name+'.pdf',sha256:createHash('sha256').update(bytes).digest('hex'),pages,issues,geometryStatus:issues.length?'FAIL':'PASS',visualStatus:'UNVERIFIED — inspect every rendered page; text/geometry alone are insufficient'};
  fs.writeFileSync(path.join(out,'pdf',name+'.txt'),text);fs.writeFileSync(path.join(out,'pdf',name+'-geometry.json'),JSON.stringify(result,null,2)+'\n');
  assert.equal(issues.length,0,'Actual PDF heading/print-area regression: '+JSON.stringify(issues.slice(0,4)));
  return result;
}
