import {useCallback,useEffect,useRef,useState} from 'react';
import {analyticsEnabled,anonymousAssessmentVisit,submitImpactFeedback,trackAssessmentEvent} from './analytics';
import {ASSESSMENT_VERSION,STORY_MAX_CHARACTERS,STORY_MAX_WORDS,storyWordCount,validAssessmentAnswers,type AssessmentAnswers,type AssessmentSource} from './assessmentModel';
import {assessmentAttempt,markAssessment,mayAutomaticallyOffer,type AssessmentAttempt} from './assessmentState';
import AssessmentDialog from './AssessmentDialog';
import './assessment.css';
type Props={source?:AssessmentSource|'site';contextKey?:string;autoOpen?:boolean;demo?:boolean;before?:number|null};
// Defined only by the standalone review build. Hosted builds keep real transport.
declare const __ALTWING_SYNTHETIC_SUBMISSION__:boolean|undefined;
export default function ImpactSurvey({source='wingmatch',contextKey='current-experience',autoOpen=false,demo=false}:Props){
  const synthetic=demo||(typeof __ALTWING_SYNTHETIC_SUBMISSION__==='boolean'&&__ALTWING_SYNTHETIC_SUBMISSION__);
  const normalizedSource=source==='site'?'project':source,context=ASSESSMENT_VERSION+':'+normalizedSource+':'+contextKey;
  const [attempt]=useState<AssessmentAttempt>(()=>synthetic?{id:crypto.randomUUID(),visit:null,status:'new',updated:Date.now()}:assessmentAttempt(context));
  const current=useRef(attempt),[open,setOpen]=useState(()=>autoOpen&&(synthetic||mayAutomaticallyOffer(context))&&attempt.status!=='submitted');
  const [phase,setPhase]=useState(open?'celebration':'questions'),[step,setStep]=useState(0),[answers,setAnswers]=useState<Partial<AssessmentAnswers>>({});
  const [story,setStoryValue]=useState(''),[quote,setQuote]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[submitted,setSubmitted]=useState(attempt.status==='submitted');
  const started=useRef(false),sending=useRef(false);
  const returnHeading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{
    if(!open||submitted)return;
    if(!synthetic){current.current=assessmentAttempt(context,analyticsEnabled()?anonymousAssessmentVisit():null);markAssessment(context,current.current,'shown',autoOpen);trackAssessmentEvent({id:current.current.id,source:normalizedSource,event:'offered'});}
  },[open,submitted,context,normalizedSource,synthetic,autoOpen]);
  useEffect(()=>{if(!open||phase!=='celebration')return;const timer=setTimeout(()=>setPhase('questions'),2400);return()=>clearTimeout(timer);},[open,phase]);
  const close=useCallback(()=>{setOpen(false);requestAnimationFrame(()=>returnHeading.current?.focus());if(!synthetic){markAssessment(context,current.current,current.current.status==='submitted'?'submitted':'dismissed');if(current.current.status!=='submitted')trackAssessmentEvent({id:current.current.id,source:normalizedSource,event:'dismissed'});}},[context,synthetic,normalizedSource]);
  function answer(key:string,value:string){setAnswers(a=>({...a,[key]:value}));setError('');if(!started.current){started.current=true;if(!synthetic)trackAssessmentEvent({id:current.current.id,source:normalizedSource,event:'started'});}}
  async function submit(){
    if(sending.current||current.current.status==='submitted')return;
    if(!validAssessmentAnswers(answers)){setError('Answer all five questions before submitting. Your story is optional.');return;}
    if(storyWordCount(story)>STORY_MAX_WORDS||story.length>STORY_MAX_CHARACTERS){setError('Keep your story within 500 words and 5,000 characters, or leave it blank.');return;}
    sending.current=true;setSaving(true);setError('');
    try{
      // impact-v3: the explicit final Submit action accepts the displayed private-sharing notice.
      if(synthetic){
        // A short, labeled simulated request demonstrates loading without any
        // fetch, server write, saved survey record or production timer delay.
        await new Promise<void>(resolve=>window.setTimeout(resolve,320));
      }else{
        current.current=assessmentAttempt(context,anonymousAssessmentVisit());
        await submitImpactFeedback({id:current.current.id,version:ASSESSMENT_VERSION,source:normalizedSource,answers,story,quote_permission:quote&&Boolean(story.trim()),feedback_permission:true});
        markAssessment(context,current.current,'submitted');
      }
      current.current.status='submitted';
      setStoryValue('');setSubmitted(true);setPhase('saved');
    }catch(e){setError(e instanceof Error&&e.message?e.message:'Your responses could not be submitted. Your answers are still here; please try again.');}finally{sending.current=false;setSaving(false);}
  }
  return <section className="assessment-invitation"><div><span>{synthetic?'SYNTHETIC SURVEY PREVIEW':'YOUR EXPERIENCE MATTERS'}</span><h2 ref={returnHeading} tabIndex={-1}>{submitted?(synthetic?'Preview reflection complete.':'Your reflection is received.'):'Five questions. Your own perspective.'}</h2><p>{submitted?(synthetic?'No responses were sent to a server or saved to a database. Your result and reward remain available.':'Thank you. Your answers never change your result or reward.'):saving?'Your submission is in progress. Your earned result and reward remain available.':'An optional reflection on access, decisions, discovery, interest and next steps.'}</p>{synthetic&&!submitted&&<p className="assessment-preview-note">Submissions are simulated. No responses are sent to production.</p>}</div>{!submitted&&<button type="button" className="assessment-invite-button" onClick={()=>{setPhase(saving?'story':'questions');setOpen(true);}}>{saving?'View submission status':'Share my experience'} <span>↗</span></button>}{open&&<AssessmentDialog onClose={close} onSubmit={()=>void submit()} phase={phase} setPhase={setPhase} step={step} setStep={setStep} answers={answers} setAnswer={answer} story={story} setStory={v=>{setStoryValue(v);setError('');if(!v.trim())setQuote(false);}} quote={quote} setQuote={setQuote} saving={saving} error={error} demo={synthetic}/>}</section>;
}
