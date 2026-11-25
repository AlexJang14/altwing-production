import {COPYRIGHT_NOTICE} from '../../deployment/public-information.mjs';
import { useRef, useState } from 'react';
import { routeTo, type AppView } from '../lib/routes';

export const JOURNEY = [
  { number: '01', label: 'Find My Wing', short: 'Discover', view: 'match', description: 'Try 8 scenarios and find engineering fields to explore.' },
  { number: '02', label: 'Explore Engineering', short: 'Explore', view: 'explore', description: 'Understand 14 fields, their subjects, and the problems they solve.' },
  { number: '03', label: 'Try Projects', short: 'Experiment', view: 'projects', description: 'Run a guided experiment and save what you learn.' },
  { number: '04', label: 'Unlock Opportunities', short: 'Plan ahead', view: 'colleges', description: 'Compare universities and find programs on official websites.' },
] as const;

export function Penguin({ className = '' }: { className?: string }) {
  return <img className={`aw-penguin ${className}`} src="/brand/altwing-penguin.png" alt="AltWing penguin guide" width="1536" height="1024" />;
}

export function Brand() {
  return <a className="aw-brand" href="#/" aria-label="AltWing home"><Penguin /><span>Alt<span>Wing</span></span></a>;
}

export function SiteHeader({ view, tab }: { view: AppView; tab: string }) {
  const [open, setOpen] = useState(false),menuButton=useRef<HTMLButtonElement>(null);
  const active = view === 'major' || view === 'aerospace' ? 'explore' : view === 'aerospace-build' ? 'projects' : view === 'programs' || view === 'counselor' && ['COLLEGES','OPPORTUNITIES'].includes(tab) ? 'colleges' : view;
  return <header className="aw-header">
    <div className="aw-header-inner">
      <Brand />
      <button ref={menuButton} type="button" className="aw-menu-toggle" aria-expanded={open} aria-controls="aw-main-nav" onClick={() => setOpen(!open)}>{open ? 'Close ×' : 'Menu ☰'}</button>
      <nav id="aw-main-nav" className={`aw-main-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation" onClick={() => setOpen(false)} onKeyDown={event => { if(event.key === 'Escape'){setOpen(false);menuButton.current?.focus();} }}>
        {JOURNEY.map(item => <a key={item.view} href={routeTo(item.view)} aria-current={active === item.view ? 'page' : undefined}><span>{item.number}</span>{item.label}</a>)}
        <a className="aw-universe-link" href="#/universe" aria-current={view === 'universe' ? 'page' : undefined}><span aria-hidden="true">✦</span> My Universe</a>
        <a className="aw-map-link" href="#/sitemap" aria-current={view === 'sitemap' ? 'page' : undefined}>Site map</a>
      </nav>
    </div>
  </header>;
}

export function JourneyContext({ view, tab }: { view: AppView; tab: string }) {
  if(view === 'home') return null;
  const step = view === 'match' ? 0 : view === 'explore' || view === 'major' || view === 'aerospace' ? 1 : view === 'projects' || view === 'aerospace-build' ? 2 : view === 'colleges' || view === 'programs' || view === 'counselor' ? 3 : -1;
  const title = view === 'programs' || tab === 'OPPORTUNITIES' && view === 'counselor' ? 'Student programs' : step >= 0 ? JOURNEY.find((_,index) => index === step)?.label : view === 'universe' ? 'My Universe · progress & rewards' : view === 'privacy' ? 'Privacy' : view === 'analytics' ? 'Site analytics' : view === 'research' ? 'Research & Methodology' : view === 'credits' ? 'Third-Party Credits and Licenses' : view === 'terms' ? 'Terms of Use' : view === 'progress-transfer' ? 'Transfer saved progress' : 'Site map';
  return <div className="aw-context"><div><a href="#/">Home</a><span aria-hidden="true">/</span><strong>{title}</strong>{step >= 0 && <small>STEP {step + 1} OF 4 · Explore in any order</small>}</div><nav className="aw-journey-shortcuts" aria-label="Journey shortcuts">{step > 0 && <a href={routeTo(JOURNEY.find((_,index)=>index===step-1)?.view ?? 'match')}>← Previous step</a>}{step >= 0 && <a href={routeTo(JOURNEY.find((_,index)=>index===step+1)?.view ?? 'universe')}>Next: {JOURNEY.find((_,index)=>index===step+1)?.label ?? 'My Universe'} →</a>}<a href="#/sitemap">Site map</a></nav></div>;
}

export function PageLoading() {
  return <main className="aw-loading" role="status"><Penguin /><span className="aw-eyebrow">YOUR GUIDE IS ON THE WAY</span><h1>Preparing your next discovery.</h1><p>You can take this at your own pace.</p><div className="aw-loading-track"><i /></div></main>;
}

export function SiteFooter() {
  return <footer className="aw-footer"><div><Penguin /><strong>Your path. Your pace.</strong><p>Every explorer starts somewhere. Your next step can be small.</p></div><nav aria-label="Footer navigation"><a href="#/">Home</a><a href="#/sitemap">Site map & getting started</a><a href="#/universe">My saved progress</a><a href="#/privacy">Privacy</a><a href="research.html">Research & Methodology</a><a href="credits.html">Credits & licenses</a><a href="terms.html">Terms of Use</a><a href="#/progress-transfer">Transfer saved progress</a></nav><small>Progress is saved in this browser. Export project records to keep a copy.</small><small>{COPYRIGHT_NOTICE}</small></footer>;
}
