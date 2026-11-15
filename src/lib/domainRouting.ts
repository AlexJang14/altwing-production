export function cleanHomeAddress(hash:string,pathname:string,search:string) {
  return hash==='#/'||hash==='#/home'||hash==='#' ? pathname+search : null;
}
export function normalizeHomeAddress() {
  const next=cleanHomeAddress(window.location.hash,window.location.pathname,window.location.search);
  if(next===null)return false;
  window.history.replaceState(window.history.state,'',next);
  return true;
}
