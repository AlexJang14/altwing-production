import { useRef, useState } from 'react';
import type { EngineeringMajorId } from './guidanceTypes';
import { ENGINEERING_MAJOR_MAP } from './engineeringMajors';
import { useDialogFocus } from '../../lib/useDialogFocus';
import { Penguin } from '../../components/SiteShell';
import { recommendProjects } from '../projects/projectRecommendations';
import ProjectVisual from '../projects/ProjectVisual';
interface Props {majorId: EngineeringMajorId;onClose:()=>void;onOpenCounselor:(major:EngineeringMajorId)=>void;onOpenUniverse:()=>void;}
const STEPS=[
  {label:'YOUR RESULT',title:'A starting point. Room to change your mind.',body:'Your choices suggest three engineering directions. They are not grades or ability labels. Compare them and see which problems make you curious.'},
  {label:'EXPLORE A FIELD',title:'First, understand what the field does.',body:'Open Explore Engineering to compare 14 fields. A field guide explains what you study, the problems you solve, and possible careers. You can explore any field.'},
  {label:'TRY A PROJECT',title:'Then test one small idea.',body:'Choose a project, make a prediction, and run a simulated test. Change one input and compare. Use a full walkthrough, hints, or independent mode. There is no timer.'},
  {label:'SAVE & LOOK AHEAD',title:'Keep the discoveries. Choose your next step.',body:'My Universe keeps your projects, saved colleges and programs, and illustrated planet rewards. Your new pack is optional—open it whenever you want. Unlock Opportunities helps you look ahead.'},
];
export default function EngineeringPostMatchGuide({majorId,onClose,onOpenCounselor,onOpenUniverse}:Props){
  const [index,setIndex]=useState(0);
  const dialog=useRef<HTMLDivElement>(null);
  useDialogFocus(dialog,onClose);
  const step=STEPS[index],major=ENGINEERING_MAJOR_MAP[majorId],last=index===STEPS.length-1;
  const project=recommendProjects([{majorId}])[0].project;
  return <div className="aw-tutorial-backdrop"><div className="aw-tutorial" role="dialog" aria-modal="true" aria-labelledby="aw-tour-title" ref={dialog} tabIndex={-1}>
    <button type="button" className="aw-dialog-close" onClick={onClose}>Skip tutorial ×</button><div className="aw-tutorial-art">{index===2?<ProjectVisual id={project.id}/>:<Penguin/>}</div><div className="aw-tutorial-progress" aria-label={`Tutorial step ${index+1} of ${STEPS.length}`}>{STEPS.map((_,i)=><span key={i} className={i<=index?'is-active':''}/>)}</div><span className="aw-eyebrow">{index+1} OF {STEPS.length} · {step.label}</span><h2 id="aw-tour-title">{step.title}</h2><p>{step.body}</p>{index===0&&<div className="aw-tour-result">Your first direction to explore: <strong>{major.name}</strong></div>}
    <div className="aw-tutorial-actions">{index>0&&<button type="button" className="aw-text-button" onClick={()=>setIndex(index-1)}>← Back</button>}{!last?<button className="aw-button" type="button" onClick={()=>setIndex(index+1)}>Next: {STEPS[index+1].label.toLowerCase()} →</button>:<><button className="aw-button" type="button" onClick={()=>onOpenCounselor(majorId)}>Explore my field →</button><a className="aw-inline-link" href={`#/projects?project=${project.id}`}>Try {project.title.toLowerCase()} →</a><button type="button" className="aw-text-button" onClick={onOpenUniverse}>View my rewards</button><button type="button" className="aw-text-button" onClick={onClose}>See my full results</button></>}</div>
  </div></div>;
}
