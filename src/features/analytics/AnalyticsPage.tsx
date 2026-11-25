// Legacy public hash routes cannot be authorized by the server. The real
// dashboard is rendered only by the protected backend /admin server route.
export function AnalyticsDeniedNotice(){return <section className="aw-analytics-panel"><h1>Access denied</h1><p>This page is not available.</p><a href="#/">Return to AltWing</a></section>;}
export default function AnalyticsPage(){return <main className="aw-analytics-page"><AnalyticsDeniedNotice/></main>;}
