import {useCallback,useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {useDialogFocus} from '../../lib/useDialogFocus';
import {motionDuration} from '../../design/golden-horizon/motion';
import {assessmentMascot} from './assessmentMascot';
import {ASSESSMENT_QUESTIONS,STORY_MAX_CHARACTERS,STORY_MAX_WORDS,STORY_PROMPTS,STORY_QUESTION,SUBMISSION_NOTICE,storyWordCount,validAssessmentAnswers,type AssessmentAnswers} from './assessmentModel';

export type AssessmentDialogProps={onClose:()=>void;onSubmit:()=>void;phase:string;setPhase:(p:string)=>void;step:number;setStep:(n:number)=>void;answers:Partial<AssessmentAnswers>;setAnswer:(key:string,value:string)=>void;story:string;setStory:(v:string)=>void;quote:boolean;setQuote:(v:boolean)=>void;saving:boolean;error:string;demo?:boolean};

export default function AssessmentDialog({onClose,onSubmit,phase,setPhase,step,setStep,answers,setAnswer,story,setStory,quote,setQuote,saving,error,demo=false}:AssessmentDialogProps){
  const dialog=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),errorHeading=useRef<HTMLParagraphElement>(null);
  const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null),closingRef=useRef(false);
  const [closing,setClosing]=useState(false),[direction,setDirection]=useState('forward');
  const id=useId(),question=ASSESSMENT_QUESTIONS[step],words=storyWordCount(story);
  const requestClose=useCallback(()=>{
    if(closingRef.current)return;
    const duration=motionDuration('--gh-motion-exit',160);
    if(!duration){onClose();return;}
    closingRef.current=true;setClosing(true);
    closeTimer.current=setTimeout(onClose,duration);
  },[onClose]);
  useEffect(()=>()=>{if(closeTimer.current!==null)clearTimeout(closeTimer.current);},[]);
  useDialogFocus(dialog,requestClose,true);
  useEffect(()=>{
    const content=dialog.current?.querySelector('.assessment-content');if(content)content.scrollTop=0;
    heading.current?.focus({preventScroll:true});
  },[phase,step]);
  useEffect(()=>{if(error)errorHeading.current?.focus();},[error]);
  useEffect(()=>{
    const overlay=dialog.current?.parentElement;if(!overlay)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const others=[...document.body.children].filter(el=>el!==overlay&&el instanceof HTMLElement).map(el=>({el:el as HTMLElement,inert:(el as HTMLElement).inert,hidden:el.getAttribute('aria-hidden')}));
    others.forEach(({el})=>{el.inert=true;el.setAttribute('aria-hidden','true');});
    return()=>{document.body.style.overflow=previous;others.forEach(({el,inert,hidden})=>{el.inert=inert;if(hidden===null)el.removeAttribute('aria-hidden');else el.setAttribute('aria-hidden',hidden);});};
  },[]);
  function goStep(next:number){setDirection(next<step?'backward':'forward');setStep(next);}
  function goPhase(next:string){setDirection(next==='questions'&&phase==='story'?'backward':'forward');setPhase(next);}
  if(typeof document==='undefined')return null;
  return createPortal(<div className={'assessment-overlay'+(closing?' is-closing':'')}>
    <div ref={dialog} tabIndex={-1} className={'assessment-dialog'+(phase==='story'?' assessment-story-mode':'')} role="dialog" aria-modal="true" aria-labelledby={id+'-title'} aria-describedby={id+'-privacy'}>
      <button type="button" className="assessment-close" onClick={requestClose} aria-label="Close assessment and return to earned results">×</button>
      <aside className="assessment-art" aria-hidden="true"><div className="assessment-orbit"/><img src={assessmentMascot} alt=""/><span>ALTWING / FIELD NOTES</span><p>Your next chapter<br/>is yours to choose.</p></aside>
      <div className="assessment-content">
        {demo&&<div className="assessment-demo">SYNTHETIC SUBMISSION MODE · No data is sent</div>}
        <p className="assessment-eyebrow">{phase==='celebration'?'MISSION COMPLETE':phase==='story'?'OPTIONAL IMPACT STORY':phase==='saved'?(demo?'PREVIEW COMPLETE':'REFLECTION RECEIVED'):`YOUR EXPERIENCE / ${String(step+1).padStart(2,'0')} OF 05`}</p>
        {phase==='celebration'?<div className="assessment-panel" key="celebration">
          <h2 ref={heading} tabIndex={-1} id={id+'-title'}>A flight worth<br/>reflecting on.</h2>
          <p>Your results are ready and your earned reward is saved. Take a short, optional look back at your experience.</p>
          <p>Closing this window takes you straight to your results.</p>
          <button type="button" className="assessment-primary" onClick={()=>goPhase('questions')}>Reflect on my mission <span>→</span></button>
        </div>:phase==='saved'?<div className="assessment-panel assessment-receipt" key="saved" role="status">
          <span className="assessment-receipt-mark" aria-hidden="true">✓</span>
          <h2 ref={heading} tabIndex={-1} id={id+'-title'}>Thank you for<br/>sharing your view.</h2>
          <p>{demo?'Preview complete. Nothing was sent or stored.':'Your responses were saved.'} Negative experiences, uncertainty and no change are equally useful.</p>
          <p>{demo?'This was a synthetic submission. It did not contact a server or create a database record.':quote?'You separately permitted anonymous quotation. Administrators must review identifying details before sharing.':'You did not allow public quotes. Your responses stay private.'}</p>
          <button type="button" className="assessment-primary" onClick={requestClose}>Return to my results <span>→</span></button>
        </div>:<form aria-busy={saving} onSubmit={e=>{e.preventDefault();if(phase==='story')onSubmit();}}>
          <div className="assessment-panel" key={phase+':'+step} data-direction={direction}>
            {phase==='questions'?<>
              <div className="assessment-progress" role="progressbar" aria-label="Assessment progress" aria-valuemin={1} aria-valuemax={ASSESSMENT_QUESTIONS.length} aria-valuenow={step+1} aria-valuetext={`Question ${step+1} of ${ASSESSMENT_QUESTIONS.length}`}>{ASSESSMENT_QUESTIONS.map((q,i)=><span key={q.id} className={i<=step?'is-active':''}/>)}</div>
              <p className="assessment-dimension">{question.studentTitle??question.title}</p>
              <p className="assessment-context">Think about the AltWing activity you just finished.</p>
              <h2 ref={heading} tabIndex={-1} id={id+'-title'}>{question.question}</h2>
              <fieldset className="assessment-options" aria-labelledby={id+'-title'} disabled={saving}>
                <legend className="assessment-sr-only">Choose one response</legend>
                {question.options.map(([code,label])=><label key={code} className={answers[question.id]===code?'is-selected':''}><input type="radio" name={id+'-'+question.id} value={code} checked={answers[question.id]===code} onChange={()=>setAnswer(question.id,code)}/><span>{label}</span><i aria-hidden="true"/></label>)}
              </fieldset>
              <div className="assessment-actions">{step>0?<button type="button" className="assessment-back" disabled={saving} onClick={()=>goStep(step-1)}>← Back</button>:<span/>}<button type="button" className="assessment-primary" disabled={saving||!answers[question.id]} onClick={()=>step<4?goStep(step+1):goPhase('story')}>{step<4?'Continue':'Continue to optional story'} <span>→</span></button></div>
            </>:<>
              <h2 ref={heading} tabIndex={-1} id={id+'-title'}>Beyond the Flight.</h2>
              <p className="assessment-story-question">{STORY_QUESTION}</p>
              <details className="assessment-prompts"><summary>Three optional reflection prompts</summary>{STORY_PROMPTS.map(([label,prompt])=><p key={label}><strong>{label}</strong>{prompt}</p>)}</details>
              <label className="assessment-story-label" htmlFor={id+'-story'}>Your story <span>Optional · leave blank if you prefer</span></label>
              <textarea id={id+'-story'} className="assessment-story" rows={6} maxLength={STORY_MAX_CHARACTERS} value={story} disabled={saving} onChange={e=>setStory(e.target.value)} aria-describedby={id+'-story-help'}/>
              <div className="assessment-word-count" aria-live="polite">{words} / {STORY_MAX_WORDS} words · {story.length} / {STORY_MAX_CHARACTERS} characters</div>
              <p id={id+'-story-help'} className="assessment-neutral">Negative experiences and no change are equally valuable. Please leave out names, schools, contact details and links.</p>
              {story.trim()&&<label className="assessment-consent"><input type="checkbox" checked={quote} disabled={saving} onChange={e=>setQuote(e.target.checked)}/><span>I allow AltWing to quote my story anonymously in public impact reports or applications. This is optional.</span></label>}
              <p className="assessment-share-notice" id={id+'-submit-notice'}>{demo?'Submit preview simulates sharing your five answers and optional story. No responses are sent to AltWing or saved to a database. Quotation permission is demonstrated only; no public-use permission is recorded.':SUBMISSION_NOTICE}</p>
              {!validAssessmentAnswers(answers)&&<p className="assessment-error">Answer all five questions to submit.</p>}
              {(words>STORY_MAX_WORDS||story.length>STORY_MAX_CHARACTERS)&&<p className="assessment-error" role="alert">Keep your story to 500 words or fewer and 5,000 characters, or leave it blank to submit just your answers.</p>}
              <div className="assessment-submission-status" role="status" aria-live="polite" aria-atomic="true">{saving&&<><span className="assessment-spinner" aria-hidden="true"/>{demo?'Running synthetic submission… No data is sent.':'Submitting your responses securely…'}</>}</div>
              <div className="assessment-actions"><button type="button" className="assessment-back" disabled={saving} onClick={()=>{goStep(4);goPhase('questions');}}>← Review answers</button><button type="submit" className="assessment-primary" aria-describedby={id+'-submit-notice'} disabled={saving||!validAssessmentAnswers(answers)||words>STORY_MAX_WORDS||story.length>STORY_MAX_CHARACTERS}>{saving?(demo?'Simulating…':'Saving…'):demo?'Submit preview':'Submit responses'} <span>→</span></button></div>
            </>}
          </div>
          {error&&<p ref={errorHeading} tabIndex={-1} className="assessment-error" role="alert">{error}</p>}
        </form>}
        <p className="assessment-privacy" id={id+'-privacy'}>Optional reflection. Your results and rewards remain available. No name or school is requested. <a href="#/privacy" onClick={onClose}>Privacy details</a></p>
      </div>
    </div>
  </div>,document.body);
}
