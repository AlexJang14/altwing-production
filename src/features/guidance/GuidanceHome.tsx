import { useState } from 'react';
import { readEngineeringMatch } from './guidanceStorage';
import { ENGINEERING_MAJOR_MAP } from './engineeringMajors';
import type { EngineeringMajorId, GuidanceTab } from './guidanceTypes';
import { JOURNEY, Penguin } from '../../components/SiteShell';
import { routeTo } from '../../lib/routes';
import ProjectVisual from '../projects/ProjectVisual';
import { PROJECTS } from '../projects/projectModel';
import './guidance.css';
interface Props {
  onStartMatch: () => void;
  onRetakeMatch: () => void;
  onExploreEngineering: () => void;
  onOpenCounselor: (major: EngineeringMajorId, tab?: GuidanceTab) => void;
  onOpenUniverse: () => void;
}
const DEMOS = [{id:'solar',label:'Solar energy',question:'Can one small tilt power a bigger idea?'},{id:'bridge',label:'Bridge design',question:'What makes a bridge bend less?'},{id:'cooling',label:'Cooling systems',question:'Can you help a system keep its cool?'}];
export default function GuidanceHome({onStartMatch,onRetakeMatch,onExploreEngineering,onOpenCounselor,onOpenUniverse}: Props) {
  const [demo,setDemo]=useState(0);
  const match=readEngineeringMatch();
  const majorId=match?.rankings[0]?.majorId;
  const major=majorId?ENGINEERING_MAJOR_MAP[majorId]:null;
  return <main className="aw-home">
    <section className="aw-hero">
      <div className="aw-hero-copy"><span className="aw-eyebrow"><i/> SMALL CURIOSITY. BIG POSSIBILITIES.</span><h1>Not everyone flies<br/>the same way.<br/><em>Find your own wing.</em></h1><p>Find your way into engineering with hands-on experiments, a friendly guide, and support that moves at <strong>your pace.</strong></p><div className="aw-hero-actions"><button className="aw-button" type="button" onClick={onStartMatch}>Find My Wing <span>↗</span></button><button className="aw-button aw-button-quiet" type="button" onClick={onExploreEngineering}>Explore the fields →</button></div><div className="aw-hero-reassurance"><span>8 scenarios · No timer</span><span>No experience needed</span><span>Free browser projects</span></div></div>
      <div className="aw-launch-scene"><div className="aw-scene-grid"/><div className="aw-scene-orbit aw-scene-orbit-one"/><div className="aw-scene-orbit aw-scene-orbit-two"/><span className="aw-scene-coordinate">YOUR NEXT DISCOVERY / 001</span><Penguin className="aw-hero-penguin"/><div className="aw-guide-speech"><span>MEET YOUR ALTWING GUIDE</span><strong>Small steps.<br/>Unexpected destinations.</strong></div><a className="aw-scene-satellite" href="#/universe"><span aria-hidden="true">✦</span><div><small>BUILD YOUR UNIVERSE</small><b>Collect discoveries →</b></div></a><div className="aw-interactive-demo"><div className="aw-demo-tabs" role="group" aria-label="Preview a project">{DEMOS.map((d,i)=><button key={d.id} type="button" aria-pressed={demo===i} onClick={()=>setDemo(i)}>{d.label}</button>)}</div><ProjectVisual id={DEMOS[demo].id}/><div><strong>{DEMOS[demo].question}</strong><a href={routeTo('projects',{project:DEMOS[demo].id})}>Try this experiment ↗</a></div></div></div>
    </section>
    <section className="aw-facts" aria-label="What you can explore"><span><b>14</b> engineering fields</span><span><b>3 + 6</b> starter projects & aerospace labs</span><span><b>663</b> university listings</span><span><b>42</b> program records</span></section>
    {major&&<section className="aw-resume"><div><span className="aw-eyebrow">WELCOME BACK, EXPLORER</span><h2>Keep following your curiosity.</h2><p>Your first suggested direction was {major.name}. Compare it, test it, or choose another.</p></div><div><button className="aw-button" type="button" onClick={()=>onOpenCounselor(major.id)}>Continue my field guide →</button><button className="aw-text-button" type="button" onClick={onRetakeMatch}>Retake Find My Wing</button></div></section>}
    <section className="aw-journey-section"><div className="aw-section-heading"><div><span className="aw-eyebrow">A STARTING POINT, NOT A FINISH LINE</span><h2>Four steps.<br/>A thousand possible directions.</h2></div><p>Follow the path, or jump in where you feel ready. Every step is open to you.</p></div><div className="aw-journey-grid">{JOURNEY.map(step=><a key={step.view} href={routeTo(step.view)}><span className="aw-step-number">{step.number}</span><small>{step.short}</small><h3>{step.label}</h3><p>{step.description}</p><b>Let’s go ↗</b></a>)}</div></section>
    <section className="aw-projects-section"><div className="aw-section-heading"><div><span className="aw-eyebrow">LESS GUESSING. MORE TRYING.</span><h2>What if you could<br/>test an interest?</h2></div><p>Make a prediction. Change one thing. See what happens. Each experiment has its own question and workspace.</p></div><div className="aw-home-projects">{PROJECTS.map(project=><article key={project.id}><ProjectVisual id={project.id}/><span className="aw-eyebrow">{project.field}</span><h3>{project.title}</h3><p>{project.question}</p><a className="aw-inline-link" href={routeTo('projects',{project:project.id})}>Open {project.title.toLowerCase()} →</a></article>)}</div><a className="aw-button aw-button-quiet" href="#/projects">See all projects & how they work →</a></section>
    <section className="aw-support-section"><Penguin/><div><span className="aw-eyebrow">DIFFERENT MINDS. DIFFERENT WAYS TO BEGIN.</span><h2>More guidance?<br/>More room to explore?<br/><em>You choose.</em></h2><p>Switch between a full walkthrough, a few hints, and independent exploration. Pause whenever you need. Your pace never changes the value of what you learn.</p><div><a className="aw-button" href="#/projects">Try a guided project →</a><a className="aw-inline-link" href="#/sitemap">Show me around first →</a></div></div></section>
    <section className="aw-next-horizon"><span className="aw-eyebrow">WHEN YOU’RE READY FOR THE NEXT HORIZON</span><h2>Turn “maybe” into<br/>a next step.</h2><p>Compare universities, check source-linked student programs, and keep the useful discoveries in one place.</p><div><button type="button" className="aw-button" onClick={()=>onOpenCounselor(majorId??'mechanical','COLLEGES')}>Browse colleges →</button><a className="aw-button aw-button-quiet" href="#/programs">Find student programs →</a><button type="button" className="aw-text-button" onClick={onOpenUniverse}>Open My Universe →</button></div><small>University directory includes a May 2025 snapshot. Check current eligibility, availability, and costs with official sources.</small></section>
  </main>;
}
