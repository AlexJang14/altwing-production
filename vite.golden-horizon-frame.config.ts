import {mergeConfig} from 'vite';
import path from 'node:path';
import gold from './vite.gold-preview.config';
export default mergeConfig(gold,{root:path.resolve('preview/golden-horizon'),plugins:[{name:'golden-preview-adapters',enforce:'pre',transform(code,id){
 if(id.endsWith('/src/lib/domainRouting.ts'))return code.replace("if(window.location.protocol==='about:')return false;","if(!/^https?:$/.test(window.location.protocol))return false;");
 if(!id.endsWith('/src/features/analytics/ResearchImpactDashboard.tsx'))return null;
 return code.replace('<ResearchReportView report={state.data}/>','<ResearchReportView report={state.data} demoStories={state.data.demo?(state.data as AssessmentReport & {previewStories?:ImpactStory[]}).previewStories:undefined}/>');
}}],build:{outDir:path.resolve('.sites-runtime/golden-horizon-frame')}});
