const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validSessionId(value:unknown):value is string{return typeof value==='string'&&uuid.test(value);}
async function key(secret:string){return crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function signVisit(sessionId:string,secret:string,now=Math.floor(Date.now()/1000)){
  const message=sessionId+'.'+(now+3600),signature=await crypto.subtle.sign('HMAC',await key(secret),new TextEncoder().encode(message));
  return message+'.'+Array.from(new Uint8Array(signature),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function verifyVisit(token:string|null,sessionId:string,secret:string|undefined,now=Math.floor(Date.now()/1000)){
  if(!token || !secret || token.length>140)return false;
  const parts=token.split('.');if(parts.length!==3)return false;
  const [id,expiry,signature]=parts;
  if(id!==sessionId || !validSessionId(id) || !/^\d{10}$/.test(expiry??'') || Number(expiry)<=now || Number(expiry)>now+3600 || !/^[a-f0-9]{64}$/.test(signature??''))return false;
  const bytes=Uint8Array.from(signature.match(/../g)!,part=>parseInt(part,16));
  return crypto.subtle.verify('HMAC',await key(secret),bytes,new TextEncoder().encode(id+'.'+expiry));
}
