import type { EngineeringMajorId, GuidanceTab } from '../features/guidance/guidanceTypes';
import { ENGINEERING_MAJOR_MAP } from '../features/guidance/engineeringMajors';
import type { WingId } from '../features/wingmatch/build/catalog/buildCatalog';
export type AppView = 'home' | 'match' | 'explore' | 'counselor' | 'universe' | 'aerospace' | 'aerospace-build' | 'projects' | 'sitemap' | 'major' | 'colleges' | 'programs' | 'privacy' | 'analytics' | 'progress-transfer' | 'research' | 'credits' | 'terms';
const views: AppView[] = ['home','match','explore','counselor','universe','aerospace','aerospace-build','projects','sitemap','major','colleges','programs','privacy','analytics','progress-transfer','research','credits','terms'];
const tabs: GuidanceTab[] = ['PLAN','COLLEGES','OPPORTUNITIES','CAREERS','IDEAS'];
const wings: WingId[] = ['propulsion','gnc','structures','thermal','avionics','mission-design'];
export function parseRoute(hash: string) {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(query);
  const rawMajor = params.get('major');
  return {
    view: path === 'counselor' ? (params.get('tab') === 'COLLEGES' ? 'colleges' : params.get('tab') === 'OPPORTUNITIES' ? 'programs' : 'major') as AppView : views.includes(path as AppView) ? path as AppView : 'home' as AppView,
    major: rawMajor && Object.hasOwn(ENGINEERING_MAJOR_MAP, rawMajor) ? rawMajor as EngineeringMajorId : null,
    tab: path === 'colleges' ? 'COLLEGES' as GuidanceTab : path === 'programs' ? 'OPPORTUNITIES' as GuidanceTab : tabs.includes(params.get('tab') as GuidanceTab) ? params.get('tab') as GuidanceTab : 'PLAN' as GuidanceTab,
    wing: wings.includes(params.get('wing') as WingId) ? params.get('wing') as WingId : 'propulsion' as WingId,
    project: params.get('project') ?? '',
  };
}
export function routeTo(view: AppView, values: Record<string, string> = {}) {
  const query = new URLSearchParams(values).toString();
  return `#/${view === 'home' ? '' : view}${query ? `?${query}` : ''}`;
}
