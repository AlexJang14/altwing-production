import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {readFileSync} from 'node:fs';
import {acceptanceSubject} from './preview/impact/acceptanceBuild.mjs';
export default defineConfig({
  root:path.resolve('preview/impact'),base:'./',publicDir:false,
  define:{__ALTWING_ACCEPTANCE_SUBJECT__:JSON.stringify(acceptanceSubject()),__ALTWING_PRODUCTION_ANALYTICS__:'false',__ALTWING_API_ORIGIN__:JSON.stringify(''),__ALTWING_PREVIEW_MASCOT__:JSON.stringify('data:image/png;base64,'+readFileSync('public/brand/altwing-penguin.png').toString('base64'))},
  plugins:[react(),{name:'self-contained-impact-preview',enforce:'post',generateBundle(_options,bundle){
    const html=Object.values(bundle).find(item=>item.type==='asset'&&item.fileName.endsWith('.html'));
    if(!html||html.type!=='asset')throw Error('Missing preview HTML.');
    let text=String(html.source);
    for(const item of Object.values(bundle)){
      if(item.type==='chunk'){
        const chunk=item;if(!chunk.isEntry)throw Error('Preview must have no external JavaScript imports.');
        text=text.replace(/<script\b[^>]*src="[^"]+"[^>]*><\/script>/,()=>`<script type="module">${chunk.code.replace(/<\/script/gi,'<\\/script')}</script>`);delete bundle[item.fileName];
      }else if(item.fileName.endsWith('.css')){
        text=text.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/,()=>`<style>${String(item.source).replace(/<\/style/gi,'<\\/style')}</style>`);delete bundle[item.fileName];
      }
    }
    const notices=['react','react-dom','scheduler'].map(name=>readFileSync(`node_modules/${name}/LICENSE`,'utf8')).join('\n\n');
    if(notices.includes('-->'))throw Error('Unexpected HTML comment delimiter in a preview notice.');
    html.source=text.replace('</body>',`<!-- Retained software copyright and permission notices\n${notices}\n-->\n</body>`);
  }}],
  build:{outDir:path.resolve('.sites-runtime/impact-preview'),emptyOutDir:true,assetsInlineLimit:Infinity,cssCodeSplit:false},
});
