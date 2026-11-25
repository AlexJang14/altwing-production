import '../../../src/design/blackGoldTokens.css';
import '../../../src/design/golden-horizon/tokens.css';
import './style.css';
import appDocument from '../../../.sites-runtime/golden-horizon-frame/index.html?raw';
import {GOLDEN_SCENES} from '../scenes';
const frame=document.getElementById('app') as HTMLIFrameElement,select=document.getElementById('scene') as unknown as HTMLSelectElement,stage=document.getElementById('stage')!,surface=document.getElementById('surface')!,desktop=document.getElementById('desktop')!,mobile=document.getElementById('mobile')!;
let isMobile=false;
for(const group of [...new Set(GOLDEN_SCENES.map(s=>s.group))]){const optionGroup=document.createElement('optgroup');optionGroup.label=group;for(const scene of GOLDEN_SCENES.filter(s=>s.group===group)){const option=document.createElement('option');option.value=scene.id;option.textContent=scene.name;optionGroup.appendChild(option);}select.appendChild(optionGroup);}
function resize(){const width=isMobile?390:1440,height=isMobile?844:1000,scale=Math.min(1,surface.clientWidth/width);stage.style.width=width*scale+'px';stage.style.height=height*scale+'px';frame.style.width=width+'px';frame.style.height=height+'px';frame.style.transform=`scale(${scale})`;desktop.setAttribute('aria-pressed',String(!isMobile));mobile.setAttribute('aria-pressed',String(isMobile));}
function navigate(){frame.contentWindow?.postMessage({kind:'altwing-golden:scene',id:select.value},'*');document.getElementById('status')!.textContent=`${select.selectedOptions[0]?.textContent}. ${isMobile?'Mobile':'Desktop'} viewport.`;}
select.addEventListener('change',navigate);desktop.addEventListener('click',()=>{isMobile=false;resize();});mobile.addEventListener('click',()=>{isMobile=true;resize();});document.getElementById('home')!.addEventListener('click',()=>{select.value='home';navigate();});
window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.data?.kind==='altwing-golden:ready')navigate();});
const observer=new ResizeObserver(resize);observer.observe(surface);frame.srcdoc=appDocument;resize();
