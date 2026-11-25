import {notFound} from 'next/navigation';
import {analyticsAuthorization} from '../../lib/analytics-server';
import AnalyticsDashboard from '../../src/features/analytics/AnalyticsDashboard';
export const dynamic='force-dynamic';
export const metadata={title:'AltWing private dashboard',robots:{index:false,follow:false}};
export default async function AdminPage(){
  if(await analyticsAuthorization()!==200)notFound();
  return <AnalyticsDashboard/>;
}
