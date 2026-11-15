import {useId,useState} from 'react';
import {submitImpactFeedback} from './analytics';
import {IMPACT_VERSION} from './impactTypes';
import './impact.css';
export function RatingQuestion({label,value,onChange,max=5,optional=false}:{label:string;value:number|null;onChange:(value:number|null)=>void;max?:number;optional?:boolean}){
  const id=useId();return <label className="impact-question" htmlFor={id}><span>{label}</span><select id={id} value={value??''} onChange={e=>onChange(e.target.value===''?null:Number(e.target.value))}><option value="">{optional?'Skip this question':'Choose a rating'}</option>{Array.from({length:max===10?11:5},(_,i)=>max===10?i:i+1).map(rating=><option key={rating} value={rating}>{rating}{max===5?rating===1?' · Not at all':rating===5?' · Very much':'':rating===0?' · Not likely':rating===10?' · Extremely likely':''}</option>)}</select></label>;
}
export default function ImpactSurvey({before=null,source='wingmatch',demo=false}:{before?:number|null;source?:'wingmatch'|'site';demo?:boolean}){
  const [id]=useState(()=>crypto.randomUUID());
  const [satisfaction,setSatisfaction]=useState<number|null>(null),[helpfulness,setHelpfulness]=useState<number|null>(null),[recommendation,setRecommendation]=useState<number|null>(null),[after,setAfter]=useState<number|null>(null);
  const [testimonial,setTestimonial]=useState(''),[permission,setPermission]=useState(false),[quote,setQuote]=useState(false),[status,setStatus]=useState<'idle'|'sending'|'saved'>('idle'),[error,setError]=useState('');
  async function submit(event:React.FormEvent){
    event.preventDefault();if(status==='sending')return;setError('');
    if(!satisfaction||!helpfulness||recommendation===null||!after||!permission){setError('Choose the four ratings and confirm that you want to share this optional feedback.');return;}
    setStatus('sending');
    try{
      if(!demo)await submitImpactFeedback({id,version:IMPACT_VERSION,source,satisfaction,helpfulness,recommendation,understanding_before:before,understanding_after:after,testimonial,quote_permission:quote&&Boolean(testimonial.trim()),feedback_permission:true});
      setTestimonial('');setStatus('saved');
    }catch(e){setError((e as Error).message);setStatus('idle');}
  }
  if(status==='saved')return <section className="impact-survey" role="status"><h2>Thank you for helping AltWing improve.</h2><p>{demo?'Preview only: no feedback was sent.':'Your anonymous feedback was saved to AltWing’s database.'} {quote?'You allowed anonymous quoting. An administrator should still review it for identifying details.':'No permission to quote your feedback publicly was granted.'}</p></section>;
  return <section className="impact-survey"><span className="aw-eyebrow">OPTIONAL · ABOUT ONE MINUTE</span><h2>Did this help you explore?</h2><p>Your answers help improve AltWing. They do not affect your result or progress. No name, email, school or academic scores are requested.</p><form onSubmit={submit}>
    <div className="impact-survey-grid"><RatingQuestion label="How satisfied are you with this experience? (1–5)" value={satisfaction} onChange={setSatisfaction}/><RatingQuestion label="How helpful was it for exploring engineering careers? (1–5)" value={helpfulness} onChange={setHelpfulness}/><RatingQuestion label="How well do you understand your engineering interests now? (1–5)" value={after} onChange={setAfter}/><RatingQuestion label="How likely are you to recommend AltWing? (0–10)" value={recommendation} onChange={setRecommendation} max={10}/></div>
    {before!==null&&<p>Your optional before rating was {before}/5. Only paired ratings are used to describe self-reported change.</p>}
    <label className="impact-question">Optional anonymous testimonial<textarea maxLength={1000} rows={3} value={testimonial} onChange={e=>{setTestimonial(e.target.value);if(!e.target.value.trim())setQuote(false);}} placeholder="What helped, or what could be better? Do not include names, school names, contact details or links."/></label>
    <label className="impact-check"><input type="checkbox" checked={permission} onChange={e=>setPermission(e.target.checked)}/>I choose to send these anonymous ratings and any testimonial to AltWing’s authorized administrators for feedback analysis. This is separate from automatic usage statistics.</label>
    <label className="impact-check"><input type="checkbox" checked={quote} disabled={!testimonial.trim()} onChange={e=>setQuote(e.target.checked)}/>Separately, I permit AltWing to quote my testimonial anonymously in public impact reports, resumes, applications or competitions. This permission is optional.</label>
    <p className="impact-small">Written feedback is private to authorized administrators unless quoting permission is selected. Testimonial text is removed during retention cleanup after one year; anonymized numeric feedback may be retained for lifetime reporting. Avoid personal details. <a href="#/privacy">Privacy details</a></p>
    {error&&<p role="alert">{error}</p>}<button className="aw-button" type="submit" disabled={status==='sending'}>{status==='sending'?'Saving feedback…':demo?'Try feedback submission (preview only)':'Send optional feedback'}</button>
  </form></section>;
}
