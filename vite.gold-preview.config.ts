import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {readFileSync} from 'node:fs';
const penguin='data:image/png;base64,'+readFileSync('public/brand/altwing-penguin.png').toString('base64');
export default defineConfig({
 root:path.resolve('preview/black-gold'),base:'./',publicDir:false,
 define:{__ALTWING_API_ORIGIN__:JSON.stringify(''),__ALTWING_PRODUCTION_ANALYTICS__:'false',__ALTWING_SYNTHETIC_SUBMISSION__:'true',__ALTWING_ASSET_BASE__:JSON.stringify('./'),__ALTWING_PREVIEW_MASCOT__:'globalThis.__ALTWING_PREVIEW_IMAGE_DATA__'},
 plugins:[{name:'preview-brand-embed',enforce:'pre',transform(code,id){if(id.endsWith('/src/lib/domainRouting.ts'))return code.replace('export function normalizeHomeAddress() {',"export function normalizeHomeAddress() { if(window.location.protocol==='about:')return false;");if(id.includes('/src/')&&/\.[jt]sx$/.test(id))return code.replaceAll('src="/brand/altwing-penguin.png"','src={globalThis.__ALTWING_PREVIEW_IMAGE_DATA__}').replaceAll("src='/brand/altwing-penguin.png'",'src={globalThis.__ALTWING_PREVIEW_IMAGE_DATA__}').replaceAll('"/brand/altwing-penguin.png"','globalThis.__ALTWING_PREVIEW_IMAGE_DATA__').replaceAll("'/brand/altwing-penguin.png'",'globalThis.__ALTWING_PREVIEW_IMAGE_DATA__');return null;}},react(),{name:'offline-gold-preview',enforce:'post',generateBundle:{
 // Plugin enforce alone does not order this hook after Vite's internal import
 // analysis. Finalize every lazy-load placeholder before embedding/deleting JS.
 order:'post',handler(_options,bundle){
  const entry=Object.values(bundle).find(item=>item.type==='asset'&&item.fileName==='index.html');if(!entry||entry.type!=='asset')throw Error('Preview HTML missing');let html=String(entry.source);
  for(const item of Object.values(bundle)){
   if(item.type==='chunk'){if(!item.isEntry)throw Error('No external JS in offline preview');if(item.code.includes('__VITE_PRELOAD__'))throw Error('Offline preview cannot embed unfinished lazy-load code');if(item.imports.length||item.dynamicImports.some(name=>name!==item.fileName))throw Error('Offline preview still depends on external JavaScript');html=html.replace(/<script\b[^>]*src="[^"]+"[^>]*><\/script>/,()=>`<script type="module">globalThis.__ALTWING_PREVIEW_IMAGE_DATA__=${JSON.stringify(penguin)};${item.code.replace(/<\/script/gi,'<\\/script')}</script>`);delete bundle[item.fileName];}
   else if(item.fileName.endsWith('.css')){html=html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/,()=>`<style>${String(item.source).replace(/<\/style/gi,'<\\/style')}</style>`);delete bundle[item.fileName];}
  }
  const notices=['node_modules/react/LICENSE','node_modules/react-dom/LICENSE','node_modules/scheduler/LICENSE','src/assets/black-gold/fonts/manrope-OFL.txt','src/assets/black-gold/fonts/spacegrotesk-OFL.txt'].map(file=>readFileSync(file,'utf8')).join('\n\n');
  html=html.replace('</body>',`<!-- Retained upstream notices\n${notices.replaceAll('-->','-- >')}\n-->\n</body>`);
  entry.source=html;
 }}}],build:{outDir:path.resolve('.sites-runtime/gold-homepage-preview'),emptyOutDir:true,assetsInlineLimit:Infinity,cssCodeSplit:false,rolldownOptions:{output:{codeSplitting:false}}}
});
