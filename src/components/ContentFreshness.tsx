import {freshness} from '../content/intelligence';
export default function ContentFreshness({kind,id}:{kind:'college'|'opportunity';id:string}){
 const info=freshness(kind,id);if(!info)return null;
 return <div className="content-freshness"><div>{info.labels.map(label=><span key={label}>{label}</span>)}</div><small>{info.lastVerified?(info.verification==='legacy_reviewed'?'Prior source review: ':'Last verified'+(info.verification==='partially_verified'?' · selected fields':'')+': ')+info.lastVerified:'Last verified: not yet independently checked'} · <a href={info.sourceUrl} target="_blank" rel="noreferrer">Official source</a>{kind==='opportunity'&&info.applicationUrl!==info.sourceUrl&&<> · <a href={info.applicationUrl} target="_blank" rel="noreferrer">Application information</a></>}</small>{info.verification==='partially_verified'&&<small>Verified fields: {info.verifiedFields.join(', ')}. Other details retain their earlier qualifications.</small>}</div>;
}
