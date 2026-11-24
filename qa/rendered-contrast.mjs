import fs from 'node:fs';
import path from 'node:path';
import {inflateSync} from 'node:zlib';
import assert from 'node:assert/strict';
function pngPixels(bytes){
  let width,height,type,depth;const parts=[];
  for(let n=8;n<bytes.length;){const size=bytes.readUInt32BE(n),kind=bytes.toString('ascii',n+4,n+8),data=bytes.subarray(n+8,n+8+size);if(kind==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];type=data[9];}if(kind==='IDAT')parts.push(data);n+=size+12;}
  assert.equal(depth,8);assert.ok(type===2||type===6,'Expected Chromium/Firefox RGB(A) PNG');const channels=type===6?4:3,stride=width*channels,input=inflateSync(Buffer.concat(parts)),pixels=Buffer.alloc(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++){const filter=input[y*(stride+1)];for(let x=0;x<stride;x++){const a=x>=channels?pixels[y*stride+x-channels]:0,b=y?pixels[(y-1)*stride+x]:0,c=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0,v=input[y*(stride+1)+1+x];pixels[y*stride+x]=(v+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}}
  return{width,height,get(x,y){const n=(Math.max(0,Math.min(height-1,Math.round(y)))*width+Math.max(0,Math.min(width-1,Math.round(x))))*channels;return[pixels[n],pixels[n+1],pixels[n+2]];}};
}
const rgb=s=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
const luminance=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
export async function renderedContrast(page,out,engine,state,{focus=false}={}){
  const selector=focus?'.assessment-close:focus-visible,.assessment-privacy a:focus-visible,.assessment-options label:focus-within':'.assessment-dialog h2,.assessment-dimension,.assessment-context,.assessment-options label,.assessment-privacy,.assessment-privacy a,.assessment-error,.assessment-neutral,.assessment-share-notice,.assessment-primary:not(:disabled)';
  const nodes=await page.locator(selector).evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{tag:e.tagName,text:e.textContent.trim().slice(0,100),className:e.className,box:{x:r.x,y:r.y,width:r.width,height:r.height},foreground:s.color,fontSize:parseFloat(s.fontSize),fontWeight:parseInt(s.fontWeight)||400,outlineColor:s.outlineColor,outlineStyle:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),outlineOffset:parseFloat(s.outlineOffset),ariaHidden:!!e.closest('[aria-hidden=true]')};}).filter(x=>!x.ariaHidden&&x.box.width>0&&x.box.height>0&&x.box.y>=0&&x.box.y+x.box.height<=innerHeight));
  assert.ok(nodes.length,'No visible contrast/focus targets captured');
  const name=`${engine}-A06-${state}-rendered.png`,bytes=await page.screenshot({type:'png',animations:'disabled'});fs.writeFileSync(path.join(out,'screenshots',name),bytes);const picture=pngPixels(bytes);
  const measurements=nodes.map(n=>{
    const samples=new Map();for(let y=2;y<16;y++)for(let x=2;x<28;x++){const px=n.box.x+n.box.width*x/30,py=n.box.y+n.box.height*y/18;const value=picture.get(px,py).join(',');samples.set(value,(samples.get(value)||0)+1);}
    const dominant=[...samples].sort((a,b)=>b[1]-a[1])[0],background=dominant[0].split(',').map(Number),foreground=rgb(focus?n.outlineColor:n.foreground),ratio=contrast(foreground,background);
    const minimum=focus?3:n.fontSize>=24||(n.fontSize>=18.66&&n.fontWeight>=700)?3:4.5;
    return{...n,backgroundPixels:background,backgroundSampleCount:dominant[1],foreground,contrastRatio:ratio,minimum,status:ratio>=minimum&&(!focus||n.outlineStyle!=='none'&&n.outlineWidth>=2)?'PASS':'FAIL',screenshot:'screenshots/'+name};
  });
  fs.writeFileSync(path.join(out,`${engine}-A06-${state}-contrast.json`),JSON.stringify({method:'Rendered PNG background samples paired with foreground/outline style; screenshots retained for visual inspection. Not CSS-only or a WCAG certification.',measurements},null,2)+'\n');
  assert.ok(measurements.every(m=>m.status==='PASS'),'Rendered contrast/focus measurement below threshold: '+JSON.stringify(measurements.filter(m=>m.status==='FAIL')));
  return measurements;
}
