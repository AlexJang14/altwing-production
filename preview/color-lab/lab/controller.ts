import {KICK_PALETTES,KICK_CORE,KICK_INTENSITY_NAMES,kickPalette,kickIntensity,kickContrast,contrastRatio,type KickPaletteId} from '../../../src/design/kickColorTokens';
type LabHost=Window & typeof globalThis;
export function mountColorLab(doc:Document,host:LabHost,homepageDocument:string){
 const el=<T=HTMLElement>(id:string)=>{const node=doc.getElementById(id);if(!node)throw Error('Missing Color Lab control: '+id);return node as T;};
 const state:{palette:KickPaletteId;comparison:KickPaletteId;intensity:number;mobile:boolean;compare:boolean}={palette:'ion-blue',comparison:'control',intensity:3,mobile:false,compare:false};
 const frames=[el<HTMLIFrameElement>('frame-a'),el<HTMLIFrameElement>('frame-b')];
 const range=el<HTMLInputElement>('intensity'),select=el<HTMLSelectElement>('comparison-palette');
 el('palettes').innerHTML=KICK_PALETTES.map((p,i)=>`<label class="palette-choice" style="--chip:${p.color}"><input type="radio" name="kick-palette" value="${p.id}"${i===0?' checked':''}><span class="palette-dot" aria-hidden="true"></span><span class="palette-info"><strong>${p.name}</strong><code>${p.color}</code></span><span class="palette-check" aria-hidden="true">✓</span></label>`).join('');
 const radios=[...doc.querySelectorAll<HTMLInputElement>('input[name="kick-palette"]')];
 select.innerHTML=KICK_PALETTES.map(p=>`<option value="${p.id}">${p.name} · ${p.color}</option>`).join('');select.value=state.comparison;
 const send=(index:number)=>frames[index].contentWindow?.postMessage({kind:'altwing-color-lab:theme',palette:index===0?state.palette:state.comparison,intensity:state.intensity},'*');
 const resize=()=>{const width=state.mobile?390:1440,height=state.mobile?844:1000;for(const [i,id]of ['a','b'].entries()){
  if(i===1&&!state.compare)continue;const surface=el('surface-'+id),stage=el('stage-'+id),available=surface.clientWidth;if(!available)continue;
  const scale=Math.min(1,available/width);stage.style.width=width*scale+'px';stage.style.height=height*scale+'px';frames[i].style.width=width+'px';frames[i].style.height=height+'px';frames[i].style.transform=`scale(${scale})`;
 }};
 const ensureFrame=(index:number)=>{if(!frames[index].dataset.started){frames[index].dataset.started='true';frames[index].srcdoc=homepageDocument;}send(index);};
 const button=(id:string,pressed:boolean)=>el(id).setAttribute('aria-pressed',String(pressed));
 const metric=(label:string,ratio:number)=>`<span>${label}</span><strong>${ratio.toFixed(2)}:1 <small class="${ratio>=4.5?'contrast-pass':'contrast-fail'}">${ratio>=4.5?'AA PASS':'AA FAIL'}</small></strong>`;
 const render=()=>{
  const selected=kickPalette(state.palette),other=kickPalette(state.comparison),ratios=kickContrast(selected.color);
  doc.body.style.setProperty('--lab-active',selected.color);el('selection-name').textContent=selected.name;el('selection-note').textContent=selected.note;el('selection-hex').textContent=selected.color;
  radios.forEach(r=>{r.checked=r.value===state.palette;});range.value=String(state.intensity);range.setAttribute('aria-valuetext',`${state.intensity}, ${KICK_INTENSITY_NAMES[state.intensity]}`);
  el('intensity-output').textContent=`${state.intensity} / ${KICK_INTENSITY_NAMES[state.intensity]}`;
  el('intensity-note').textContent=state.palette==='control'?'The control stays exactly Black & Gold at every intensity.':'Presence changes; the exact accent hue stays the same.';
  el('comparison-controls').hidden=!state.compare;el('frame-b-card').hidden=!state.compare;el('canvases').classList.toggle('is-comparing',state.compare);
  button('desktop',!state.mobile);button('mobile',state.mobile);button('single',!state.compare);button('compare',state.compare);
  for(const [i,p]of [selected,other].entries()){
   const id=i===0?'a':'b';el('frame-'+id+'-name').textContent=p.name;el('frame-'+id+'-hex').textContent=p.color;el('frame-'+id+'-dot').style.backgroundColor=p.color;el('frame-'+id+'-size').textContent=state.mobile?'390 × 844':'1440 × 1000';frames[i].title=`Actual AltWing homepage — ${p.name}, ${state.mobile?'mobile':'desktop'}`;
  }
  el('contrast-obsidian').style.setProperty('--sample-color',selected.color);el('contrast-graphite').style.setProperty('--sample-color',selected.color);
  el('ratio-obsidian').innerHTML=metric('Accent on Obsidian',ratios.accentOnObsidian);el('ratio-graphite').innerHTML=metric('Accent on Graphite',ratios.accentOnGraphite);
  el('contrast-cta').style.setProperty('--sample-color',selected.color);el('ratio-cta').innerHTML=metric('Obsidian label on accent',ratios.obsidianOnAccent);
  el('ratio-pearl').innerHTML=metric('Warm Pearl on Obsidian',ratios.pearlOnObsidian);
  el('avoid-pearl').innerHTML=`Warm Pearl on this accent: <strong>${ratios.pearlOnAccent.toFixed(2)}:1</strong> — ${ratios.pearlOnAccent>=4.5?'meets':'fails'} 4.5:1. The filled CTA uses Obsidian labels.`;
  el('status').textContent=`${selected.name}. ${KICK_INTENSITY_NAMES[state.intensity]} intensity. ${state.mobile?'Mobile':'Desktop'}${state.compare?', compared with '+other.name:''}.`;
  ensureFrame(0);if(state.compare)ensureFrame(1);resize();
 };
 for(const radio of radios)radio.addEventListener('change',()=>{if(radio.checked){state.palette=kickPalette(radio.value).id;render();}});
 range.addEventListener('input',()=>{state.intensity=kickIntensity(range.value);render();});
 select.addEventListener('change',()=>{state.comparison=kickPalette(select.value).id;render();});
 el('desktop').addEventListener('click',()=>{state.mobile=false;render();});el('mobile').addEventListener('click',()=>{state.mobile=true;render();});
 el('single').addEventListener('click',()=>{state.compare=false;render();});el('compare').addEventListener('click',()=>{state.compare=true;render();});
 el('home').addEventListener('click',()=>{for(const frame of frames)if(frame.dataset.started)frame.contentWindow?.postMessage({kind:'altwing-preview-home'},'*');});
 const message=(event:MessageEvent)=>{
  const index=frames.findIndex(frame=>frame.contentWindow===event.source);if(index<0||!event.data)return;
  if(event.data.kind==='altwing-color-lab:ready')send(index);
  if(state.compare&&event.data.kind==='altwing-color-lab:scroll'&&typeof event.data.y==='number'&&Number.isFinite(event.data.y))frames[1-index].contentWindow?.postMessage({kind:'altwing-color-lab:scroll-to',y:Math.max(0,event.data.y)},'*');
 };
 host.addEventListener('message',message);for(const [i,frame]of frames.entries())frame.addEventListener('load',()=>send(i));
 const observer=new host.ResizeObserver(resize);observer.observe(el('surface-a'));observer.observe(el('surface-b'));
 el('contrast-table-body').innerHTML=KICK_PALETTES.map(p=>`<tr><th scope="row"><i style="background:${p.color}" aria-hidden="true"></i>${p.name}<code>${p.color}</code></th><td>${contrastRatio(p.color,KICK_CORE.obsidian).toFixed(2)}:1</td><td>${contrastRatio(p.color,KICK_CORE.graphite).toFixed(2)}:1</td><td>${contrastRatio(KICK_CORE.obsidian,p.color).toFixed(2)}:1</td></tr>`).join('');
 render();return()=>{observer.disconnect();host.removeEventListener('message',message);};
}
