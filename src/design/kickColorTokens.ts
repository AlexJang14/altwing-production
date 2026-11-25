/** Preview candidates, not a chosen production theme. Hex values stay exact. */
export const KICK_CORE=Object.freeze({obsidian:'#101216',graphite:'#1B1E24',gold:'#E6BB65',pearl:'#F7F2E6'});
export const KICK_PALETTES=[
 {id:'ion-blue',name:'Ion Blue',color:'#45D9FF',note:'Precise · open · electric'},
 {id:'solar-coral',name:'Solar Coral',color:'#FF695C',note:'Warm · human · unexpected'},
 {id:'hyper-lime',name:'Hyper Lime',color:'#C5F45D',note:'Fresh · curious · forward'},
 {id:'nebula-violet',name:'Nebula Violet',color:'#A995FF',note:'Imaginative · calm · expansive'},
 {id:'cosmic-raspberry',name:'Cosmic Raspberry',color:'#FF547D',note:'Confident · expressive · energetic'},
 {id:'control',name:'Black & Gold',color:KICK_CORE.gold,note:'Control · the original direction'},
] as const;
export type KickPaletteId=typeof KICK_PALETTES[number]['id'];
export const KICK_INTENSITY_NAMES:Record<number,string>={2:'Quiet',3:'Balanced',4:'Distinct',5:'Expressive'};
export function kickPalette(id:unknown){return KICK_PALETTES.find(p=>p.id===id)??KICK_PALETTES[5];}
export function kickIntensity(value:unknown){const n=Number(value);return Number.isFinite(n)?Math.max(2,Math.min(5,Math.round(n))):3;}
function rgb(hex:string){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
export function contrastRatio(a:string,b:string){
 const luminance=(hex:string)=>rgb(hex).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function mixKickSurface(color:string,amount:number){const a=rgb(color),b=rgb(KICK_CORE.graphite);return '#'+a.map((v,i)=>Math.round(v*amount+b[i]*(1-amount)).toString(16).padStart(2,'0')).join('').toUpperCase();}
export function kickSettings(id:unknown,value:unknown){
 const palette=kickPalette(id),intensity=kickIntensity(value);
 const properties:Record<string,string>=palette.id==='control'?{}:{
  '--aw-kick-color':palette.color,
  '--aw-kick-selected-surface':mixKickSurface(palette.color,.06+(intensity-2)*.02),
  '--aw-kick-orbit-opacity':String(.34+(intensity-2)*.12),
 };
 return {palette,intensity,properties};
}
export function kickContrast(color:string){return {
 accentOnObsidian:contrastRatio(color,KICK_CORE.obsidian),
 accentOnGraphite:contrastRatio(color,KICK_CORE.graphite),
 obsidianOnAccent:contrastRatio(KICK_CORE.obsidian,color),
 pearlOnObsidian:contrastRatio(KICK_CORE.pearl,KICK_CORE.obsidian),
 pearlOnAccent:contrastRatio(KICK_CORE.pearl,color),
};}
