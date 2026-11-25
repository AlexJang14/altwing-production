export default function AnalyticsAccessPanel({status,preview=false}:{status:'login'|'forbidden';preview?:boolean}){
  const login=status==='login';
  const label=login?'Sign in to view analytics':'Switch account';
  return <section className="aw-analytics-panel aw-analytics-access">
    <span className="aw-analytics-lock" aria-hidden="true">↗</span>
    <h2>{login?'Your site. Your insights.':'Administrator access required.'}</h2>
    <p>{login?'Sign in with an authorized administrator’s ChatGPT account to see analytics, educational impact and private feedback. Student pages stay open to everyone.':'This account is not authorized to view analytics or feedback. Switch to an authorized administrator’s account.'}</p>
    {preview?<button className="aw-button" type="button" disabled>{label} · preview only</button>:<a className="aw-button" href={login?'/signin-with-chatgpt?return_to=%2Fadmin':'/signout-with-chatgpt?return_to=%2Fadmin%2Flogin'} target="_top">{label} →</a>}
    <p>Each administrator signs in independently. Report and export access is checked securely on the server.</p>
  </section>;
}
