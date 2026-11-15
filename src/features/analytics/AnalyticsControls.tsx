import { useSyncExternalStore } from 'react';
import { analyticsEnabled, analyticsRevision, doNotTrack, setAnalyticsConsent, subscribeAnalytics } from './analytics';
export function AnalyticsPreference(){
  useSyncExternalStore(subscribeAnalytics,analyticsRevision);
  return <div className="aw-analytics-preference"><p>Anonymous site statistics: <strong>{doNotTrack()?'Blocked by your browser privacy preference':analyticsEnabled()?'Enabled':'Disabled'}</strong>.</p><button type="button" onClick={()=>setAnalyticsConsent(analyticsEnabled()?'no':'yes')} disabled={doNotTrack()}>{analyticsEnabled()?'Turn off usage statistics':'Allow anonymous usage statistics'}</button><p>This choice affects future events. Scores and written work are never included.</p></div>;
}
