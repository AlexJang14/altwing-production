import {defineConfig} from 'vite';
import path from 'node:path';
export default defineConfig({root:path.resolve('preview/color-lab/lab'),base:'./',publicDir:false,plugins:[{
 name:'self-contained-color-lab',enforce:'post',generateBundle(_options,bundle){
  const html=Object.values(bundle).find(v=>v.type==='asset'&&v.fileName==='index.html');if(!html||html.type!=='asset')throw Error('Color Lab document missing');let document=String(html.source);
  for(const item of Object.values(bundle)){
   if(item.type==='chunk'){if(!item.isEntry)throw Error('Color Lab must be self-contained');document=document.replace(/<script\b[^>]*src="[^"]+"[^>]*><\/script>/,()=>`<script type="module">${item.code.replace(/<\/script/gi,'<\\/script')}</script>`);delete bundle[item.fileName];}
   else if(item.fileName.endsWith('.css')){document=document.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/,()=>`<style>${String(item.source).replace(/<\/style/gi,'<\\/style')}</style>`);delete bundle[item.fileName];}
  }
  html.source=document;
 }
}],build:{outDir:path.resolve('.sites-runtime/color-lab'),emptyOutDir:true,assetsInlineLimit:Infinity,cssCodeSplit:false,rolldownOptions:{output:{codeSplitting:false}}}});
