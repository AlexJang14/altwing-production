import { readJSON, writeLocal } from '../../lib/storage';
export type Support = 'guided' | 'hints' | 'independent';
export const PROJECTS = [
  {id:'solar',field:'Electrical · Environmental',title:'Follow the sunlight',question:'How does panel angle change a simple solar power estimate?',parameter:'Angle away from direct sunlight',min:0,max:75,step:5,start:30,inputUnit:'°',unit:'W',output:'Estimated power',goal:'Compare the same panel at two angles. Explain why orientation matters.',model:'Power = 800 W/m² × 1.5 m² × 0.20 × cos(angle). Fixed sunlight, panel area and efficiency; no shade, heating, clouds, or electrical losses. This is an idealized estimate, not a measured panel.',hint:'Keep the panel and sunlight the same. Compare a panel facing the sunlight with one tilted away.',example:'For a different example, doubling panel area would double power if all the other assumptions stayed fixed.'},
  {id:'cooling',field:'Mechanical · Thermal',title:'Keep your cool',question:'How does cooling rate change temperature after ten minutes?',parameter:'Cooling rate constant',min:0.02,max:0.20,step:0.02,start:0.06,inputUnit:'/min',unit:'°C',output:'Temperature after 10 min',goal:'Compare two cooling rates and explain a limitation of the model.',model:'Temperature = 22 + (80 − 22) × exp(−rate × 10). The object starts at 80°C in constant 22°C surroundings. A simplified uniform-temperature model; no real heat, hardware, or safety conclusion.',hint:'Compare a small rate with a larger one. A larger rate moves the temperature toward the surroundings more quickly.',example:'If the surroundings were warmer, the object would approach a different final temperature. That is a separate variable to explore later.'},
  {id:'bridge',field:'Civil · Structures',title:'A stronger small bridge',question:'What do you gain—and use—when a beam gets thicker?',parameter:'Relative beam thickness',min:1,max:5,step:0.5,start:1.5,inputUnit:'×',unit:'index',output:'Relative deflection index',goal:'Find out how a thicker beam changes bending and material use.',model:'Relative deflection index = 100 / thickness³; relative material use = thickness. Fixed beam width, span, material, and load. An illustrative beam-bending relationship, not a load rating or a safe construction design.',hint:'Try a thicker beam. Watch both the deflection index and the material multiplier; a smaller deflection comes with more material.',example:'Doubling the load would increase deflection in this idealized relationship. Here, keep load fixed and change thickness only.'},
] as const;
export type Project = typeof PROJECTS[number];
export interface Run { input:number; output:number; at:string }
export interface Draft { version:1; stage:number; support:Support; prediction:string; comparison:string; revision:string; reflection:string; input:number; runs:Run[]; updatedAt:string; completedAt?:string }
export const STAGES=['Understand','Predict','Test','Compare','Revise','Reflect'] as const;
export function simulate(id:string,input:number):number {
  if(id==='solar') return Math.round(240*Math.cos(input*Math.PI/180)*100)/100;
  if(id==='cooling') return Math.round((22+58*Math.exp(-input*10))*100)/100;
  return Math.round(100/(input**3)*100)/100;
}
export function newDraft(project:Project):Draft {return {version:1,stage:0,support:'guided',prediction:'',comparison:'',revision:'',reflection:'',input:project.start,runs:[],updatedAt:''};}
export function readDraft(project:Project):Draft {
  const raw=readJSON<Partial<Draft> | null>(`altwing-project-v1:${project.id}`,null);
  const base=newDraft(project);
  if(!raw || raw.version!==1)return base;
  const validInput=(n:unknown):n is number=>typeof n==='number' && Number.isFinite(n) && n>=project.min && n<=project.max;
  const text=(x:unknown)=>typeof x==='string'?x.slice(0,10000):'';
  const runs=Array.isArray(raw.runs)?raw.runs.filter(x=>x && validInput(x.input) && Number.isFinite(x.output) && typeof x.at==='string').slice(-50):[];
  const draft:Draft={...base,stage:Number.isInteger(raw.stage)?Math.max(0,Math.min(5,raw.stage!)):0,support:['guided','hints','independent'].includes(String(raw.support))?raw.support!:'guided',prediction:text(raw.prediction),comparison:text(raw.comparison),revision:text(raw.revision),reflection:text(raw.reflection),input:validInput(raw.input)?raw.input:base.input,runs,updatedAt:text(raw.updatedAt)};
  if(typeof raw.completedAt==='string' && isComplete(draft))draft.completedAt=raw.completedAt;
  return draft;
}
export function isComplete(draft:Draft) {return Boolean(draft.prediction.trim() && draft.comparison.trim() && draft.revision.trim() && draft.reflection.trim() && new Set(draft.runs.map(r=>r.input)).size>=2);}
export function saveDraft(project:Project,draft:Draft) {return writeLocal(`altwing-project-v1:${project.id}`,JSON.stringify(draft));}
export function evidenceText(project:Project,draft:Draft) {
  return [`ALTWING · MY EXPLORATION RECORD`,project.title,`Status: ${draft.completedAt?'Learning loop recorded':'In progress'}`,`Saved: ${draft.updatedAt}`,`Support chosen: ${draft.support} (not an ability rating)`,`Question: ${project.question}`,`Prediction: ${draft.prediction}`,`SIMULATED TESTS (not physical measurements)`,...draft.runs.map((r,i)=>`${i+1}. Input ${r.input}${project.inputUnit} → ${r.output} ${project.unit} · ${r.at}`),`Comparison: ${draft.comparison}`,`Revision reasoning: ${draft.revision}`,`Reflection and next question: ${draft.reflection}`,`Model and limitations: ${project.model}`,`This is a student-authored exploration record, not an externally verified achievement or assessment of aptitude.`].join('\n\n');
}
