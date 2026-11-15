import RouteBoundary from './components/RouteBoundary';
import { trackNavigation, trackPage } from './features/analytics/analytics';
import './features/analytics/analytics.css';
import { lazy, Suspense, useEffect, useSyncExternalStore } from 'react';
import './App.css';
import { writeLocal } from './lib/storage';
import StorageNotice from './components/StorageNotice';
import { JourneyContext, PageLoading, SiteFooter, SiteHeader } from './components/SiteShell';
import GuidanceHome from './features/guidance/GuidanceHome';
import type { EngineeringMajorId, GuidanceTab } from './features/guidance/guidanceTypes';
import { readEngineeringMatch, readSelectedMajor, saveSelectedMajor } from './features/guidance/guidanceStorage';
import { parseRoute, routeTo, type AppView } from './lib/routes';
import {normalizeHomeAddress} from './lib/domainRouting';
import {startCloudflareBeacon} from './features/analytics/cloudflareBeacon';
const EngineeringMatch = lazy(() => import('./features/guidance/EngineeringMatch'));
const EngineeringExplorer = lazy(() => import('./features/guidance/EngineeringExplorer'));
const CounselorHub = lazy(() => import('./features/guidance/CounselorHub'));
const MyUniversePage = lazy(() => import('./features/progression/MyUniversePage'));
const ExploreAerospace = lazy(() => import('./features/explore/ExploreAerospace'));
const BuildEngine = lazy(() => import('./features/wingmatch/build/engine/BuildEngine'));
const Projects = lazy(() => import('./features/projects/Projects'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));
const SiteMap = lazy(() => import('./components/SiteMap'));
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'));
const ProgressTransfer = lazy(() => import('./features/migration/ProgressTransfer'));
function subscribe(listener: () => void) {
  const changed=()=>{normalizeHomeAddress();listener();};
  window.addEventListener('hashchange', changed);
  return () => window.removeEventListener('hashchange', changed);
}
function App() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  const route = parseRoute(hash);
  useEffect(()=>{if(normalizeHomeAddress())window.dispatchEvent(new Event('hashchange'));},[]);
  useEffect(startCloudflareBeacon,[]);
  useEffect(() => {trackPage(hash);},[hash]);
  useEffect(() => {document.addEventListener('click',trackNavigation);return()=>document.removeEventListener('click',trackNavigation);},[]);
  const selectedMajor = route.major ?? readSelectedMajor() ?? readEngineeringMatch()?.rankings[0]?.majorId ?? 'mechanical';
  function openView(view: AppView) { window.location.hash = routeTo(view); }
  function startNewMatch() { writeLocal("altwing-match-draft-v1", "null"); openView("match"); }
  function openCounselor(major: EngineeringMajorId, tab: GuidanceTab = 'PLAN') {
    saveSelectedMajor(major);
    window.location.hash = routeTo(tab === 'COLLEGES' ? 'colleges' : tab === 'OPPORTUNITIES' ? 'programs' : 'major', {major, ...(tab === 'PLAN' ? {} : {tab})});
  }
  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'instant'});
    const titles: Partial<Record<AppView,string>> = {home:'Your path. Your pace.',match:'Find My Wing',explore:'Explore Engineering',major:'Engineering Field Guide',colleges:'Unlock Opportunities',programs:'Student Programs',counselor:'Engineering Field Guide',projects:'Try Projects',universe:'My Universe',sitemap:'Site Map',privacy:'Privacy',analytics:'Analytics',aerospace:'Aerospace Labs','aerospace-build':'Aerospace Experiment','progress-transfer':'Transfer saved progress'};
    document.title = `AltWing · ${titles[route.view]}`;
  }, [hash, route.view]);
  let page;
  if (route.view === 'match') page = <EngineeringMatch onBack={() => openView('home')} onOpenCounselor={openCounselor} onOpenUniverse={() => openView('universe')} />;
  else if (route.view === 'explore') page = <EngineeringExplorer onBack={() => openView('home')} onOpenCounselor={openCounselor} onStartMatch={() => openView('match')} onOpenAerospaceDeepDive={() => openView('aerospace')} />;
  else if (['counselor','major','colleges','programs'].includes(route.view)) page = <CounselorHub key={`${selectedMajor}-${route.tab}`} initialMajorId={selectedMajor} initialTab={route.tab} onNavigate={openCounselor} onBack={() => openView('home')} onExploreMajors={() => openView('explore')} onStartMatch={startNewMatch} onOpenUniverse={() => openView('universe')} onOpenAerospaceDeepDive={() => openView('aerospace')} />;
  else if (route.view === 'universe') page = <MyUniversePage onBack={() => openView('home')} onStartMission={() => openView('explore')} />;
  else if (route.view === 'aerospace') page = <ExploreAerospace onBack={() => openView('explore')} onTryWing={wing => { window.location.hash = routeTo('aerospace-build', {wing}); }} />;
  else if (route.view === 'aerospace-build') page = <BuildEngine key={route.wing} wingId={route.wing} onBack={() => openView('aerospace')} />;
  else if (route.view === 'projects') page = <Projects key={route.project} projectId={route.project} />;
  else if (route.view === 'privacy') page = <PrivacyPage />;
  else if (route.view === 'analytics') page = <AnalyticsPage />;
  else if (route.view === 'sitemap') page = <SiteMap />;
  else if (route.view === 'progress-transfer') page = <ProgressTransfer />;
  else page = <GuidanceHome onRetakeMatch={startNewMatch} onStartMatch={() => openView('match')} onExploreEngineering={() => openView('explore')} onOpenCounselor={openCounselor} onOpenUniverse={() => openView('universe')} />;
  return <><a className="skip-link" href="#main-content" onClick={event => {event.preventDefault();const main = document.querySelector<HTMLElement>('main');main?.setAttribute('tabindex','-1');main?.focus();}}>Skip to content</a><SiteHeader view={route.view} tab={route.tab}/><div className="aw-app-body"><StorageNotice/><JourneyContext view={route.view} tab={route.tab}/><RouteBoundary key={hash}><Suspense fallback={<PageLoading/>}>{page}</Suspense></RouteBoundary><SiteFooter/></div></>;
}
export default App;
