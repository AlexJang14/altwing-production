import {ENGINEERING_MAJORS} from '../../src/features/guidance/engineeringMajors';
import {ENGINEERING_MATCH_QUESTIONS} from '../../src/features/guidance/engineeringMatchData';
export interface GoldenScene{id:string;group:string;name:string;route?:string;mission?:number;scene?:string;lab?:string;}
export const GOLDEN_SCENES:GoldenScene[]=[
 {id:'home',group:'Start',name:'Homepage',route:'#/'},
 {id:'match',group:'Find My Wing',name:'Mission briefing',route:'#/match'},
 ...ENGINEERING_MATCH_QUESTIONS.map((q,i)=>({id:'mission-'+i,group:'Find My Wing',name:`Scenario ${i+1} · ${q.sceneId.replaceAll('-',' ')}`,route:'#/match',mission:i})),
 {id:'explore',group:'Engineering',name:'Engineering Explorer · all 14 fields',route:'#/explore'},
 ...ENGINEERING_MAJORS.map(m=>({id:'field-'+m.id,group:'Engineering field guides',name:m.name,route:'#/major?major='+m.id})),
 {id:'careers',group:'Guidance & opportunities',name:'Career exploration',route:'#/major?major=mechanical&tab=CAREERS'},
 {id:'ideas',group:'Guidance & opportunities',name:'Project ideas',route:'#/major?major=mechanical&tab=IDEAS'},
 {id:'colleges',group:'Guidance & opportunities',name:'College Explorer',route:'#/colleges'},
 {id:'programs',group:'Guidance & opportunities',name:'Programs & Opportunities',route:'#/programs'},
 {id:'projects',group:'Projects',name:'Try Projects · catalog',route:'#/projects'},
 ...['solar','cooling','bridge'].map(id=>({id:'project-'+id,group:'Projects',name:id[0].toUpperCase()+id.slice(1)+' project workspace',route:'#/projects?project='+id})),
 {id:'aerospace',group:'Aerospace',name:'Six engineering wings',route:'#/aerospace'},
 ...['propulsion','gnc','structures','thermal','avionics','mission-design'].flatMap(id=>[
  {id:'wing-'+id,group:'Aerospace journeys',name:id.replace('-',' ')+' · full journey',route:'#/aerospace-build?wing='+id},
  {id:'lab-'+id,group:'Simulations · direct review',name:id.replace('-',' ')+' · actual lab controls',scene:'lab',lab:id},
 ]),
 {id:'universe',group:'Progress & rewards',name:'My Universe · saved progress',route:'#/universe'},
 {id:'rewards',group:'Progress & rewards',name:'Cosmic Pack reveal · synthetic cards',scene:'rewards'},
 {id:'assessment',group:'Assessment & reports',name:'Assessment + Beyond the Flight · demo submission',scene:'assessment'},
 {id:'dashboard',group:'Assessment & reports',name:'Full private dashboard · synthetic fixtures',scene:'dashboard'},
 {id:'research-report',group:'Assessment & reports',name:'Versioned report, stories, CSV & print · demo',scene:'research-report'},
 {id:'login',group:'Assessment & reports',name:'Administrator login · appearance only',scene:'login'},
 {id:'denied',group:'Assessment & reports',name:'Access denied / 404 · appearance only',scene:'denied'},
 {id:'loading',group:'States & information',name:'Loading state',scene:'loading'},
 {id:'error',group:'States & information',name:'Recoverable error state',scene:'error'},
 ...['sitemap','privacy','research','credits','terms','progress-transfer'].map(id=>({id,group:'States & information',name:id.replace('-',' '),route:'#/'+id})),
];
