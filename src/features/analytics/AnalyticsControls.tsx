import { useSyncExternalStore } from 'react';
import { analyticsEnabled, analyticsRevision, doNotTrack, setAnalyticsConsent, subscribeAnalytics } from './analytics';
export function AnalyticsPreference(){
  useSyncExternalStore(subscribeAnalytics,analyticsRevision);
  return <div className="aw-analytics-preference"><p>Anonymous site statistics: <strong>{doNotTrack()?'Blocked by your browser privacy preference':analyticsEnabled()?'Enabled':'Disabled'}</strong>.</p><button type="button" onClick={()=>setAnalyticsConsent(analyticsEnabled()?'no':'yes')} disabled={doNotTrack()}>{analyticsEnabled()?'Turn off usage statistics':'Allow anonymous usage statistics'}</button><p>This controls automatic AltWing statistics and Cloudflare Web Analytics. Academic scores and written work are excluded from automatic tracking. Optional feedback is sent only when you explicitly submit it. If Cloudflare was disabled in this open page, it can resume on the next full page load; navigation and progress are not interrupted.</p></div>;
}
