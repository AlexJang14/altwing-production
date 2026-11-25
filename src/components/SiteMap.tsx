import { JOURNEY, Penguin } from './SiteShell';
import { routeTo } from '../lib/routes';
import { ENGINEERING_MAJORS } from '../features/guidance/engineeringMajors';
import { PROJECTS } from '../features/projects/projectModel';

export default function SiteMap() {
  return <main className="aw-map-page"><section className="aw-map-intro"><Penguin /><span className="aw-eyebrow">A CLEAR PATH THROUGH ALTWING</span><h1>One map.<br /><em>Your next move.</em></h1><p>Start with step one, or jump to what you need. Nothing here requires a quiz result, an application, or prior engineering experience.</p></section>
    <section className="aw-map-journey" aria-label="Recommended journey">{JOURNEY.map((step, i) => <article key={step.view}><span className="aw-step-number">{step.number}</span><div><span className="aw-eyebrow">{step.short}</span><h2><a href={routeTo(step.view)}>{step.label} →</a></h2><p>{step.description}</p>{i === 3 && <a className="aw-inline-link" href="#/programs">Browse student programs →</a>}</div></article>)}</section>
    <div className="aw-map-details"><section><h2>Explore engineering fields</h2><p>Each field has its own overview, careers, and ideas.</p><div>{ENGINEERING_MAJORS.map(major => <a key={major.id} href={routeTo('major', {major:major.id})}>{major.name} →</a>)}</div></section><section><h2>Choose an experiment</h2><p>Each project opens its own workspace.</p><div>{PROJECTS.map(project => <a key={project.id} href={routeTo('projects',{project:project.id})}>{project.title} →</a>)}<a href="#/aerospace">Six aerospace labs →</a></div><h2>Your saved space</h2><div><a href="#/universe">My Universe · projects, saved items & planet rewards →</a><a href="#/colleges">University directory →</a><a href="#/programs">Summer, research & student programs →</a></div></section></div>
    <section className="aw-map-details"><div><h2>About this experience</h2><p><a href="#/research">Research & Methodology</a> · <a href="#/credits">Third-Party Credits and Licenses</a> · <a href="#/terms">Terms of Use</a></p></div></section>
    <section className="aw-coach-note"><Penguin /><div><h2>Not sure where to begin?</h2><p>Try Find My Wing. Choose what you would investigate in eight scenarios, see a few suggested fields, and follow the short guide to your first experiment. There is no timer.</p><a className="aw-button" href="#/match">Start with Find My Wing →</a></div></section>
  </main>;
}
