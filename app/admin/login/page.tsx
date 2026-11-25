import {redirect} from 'next/navigation';
import {analyticsAuthorization} from '../../../lib/analytics-server';
import AnalyticsAccessPanel from '../../../src/features/analytics/AnalyticsAccessPanel';
import '../../../src/features/analytics/analytics.css';
export const dynamic='force-dynamic';
export const metadata={title:'Private administrator sign-in',robots:{index:false,follow:false}};
export default async function AdminLoginPage(){
  const access=await analyticsAuthorization();
  if(access===200)redirect('/admin');
  return <main className="aw-analytics-page"><h1>Private administrator sign-in</h1><AnalyticsAccessPanel status={access===401?'login':'forbidden'}/></main>;
}
