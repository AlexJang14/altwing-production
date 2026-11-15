// A blocked or full browser store must never prevent exploration.
const memory = new Map<string, string>();
let memoryOnly=false;
// A storage event from another tab must invalidate cached privacy choices.
export function invalidateCachedLocal(key:string){memory.delete(key);}
export function isMemoryOnly(){return memoryOnly;}
export function readLocal(key: string): string | null {
  try { return memory.get(key) ?? localStorage.getItem(key); }
  catch { return memory.get(key) ?? null; }
}
export function writeLocal(key: string, value: string): boolean {
  memory.set(key, value);
  try { localStorage.setItem(key, value); return true; }
  catch { if(!memoryOnly){memoryOnly=true; if(typeof window!=="undefined") window.dispatchEvent(new Event("altwing:storage-status"));} return false; }
}
export function readJSON<T>(key: string, fallback: T): T {
  try { const raw = readLocal(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
export function downloadText(name: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// The active app may have newer session-only changes than localStorage.
export function snapshotLocal() {
  const entries: Record<string, string> = Object.create(null);
  let unavailable = false;
  try {
    for (let i=0;i<localStorage.length;i++) {
      const key=localStorage.key(i);
      if(key){const value=localStorage.getItem(key);if(value!==null)entries[key]=value;}
    }
  } catch { unavailable=true; }
  for(const [key,value]of memory)entries[key]=value;
  if(unavailable && memory.size===0)throw Error('Browser storage is unavailable. Export any open project records before closing this tab.');
  return {entries,sessionOnly:memoryOnly||unavailable};
}

export function restoreLocalEntries(entries: Record<string,string>, replace=false) {
  const pending=Object.entries(entries).filter(([key])=>replace||readLocal(key)===null);
  const before=new Map<string,string|null>();
  const applied:string[]=[];
  try {
    // Read every original value before making the first change.
    for(const [key]of pending)before.set(key,localStorage.getItem(key));
    for(const [key,value]of pending){localStorage.setItem(key,value);applied.push(key);}
  } catch {
    // Free space written by this attempt before restoring original values.
    let rollbackFailed=false;
    for(const key of applied)try{localStorage.removeItem(key);}catch{rollbackFailed=true;}
    for(const key of applied){const value=before.get(key);if(value!==null&&value!==undefined)try{localStorage.setItem(key,value);}catch{rollbackFailed=true;}}
    if(rollbackFailed)throw Error('Browser storage became unavailable during restore. Some items may have changed. Keep both backup files, enable storage, and restore again.');
    throw Error('This browser could not save the backup. Nothing was imported; keep the original file and enable browser storage.');
  }
  for(const [key,value]of pending)memory.set(key,value);
  return {restored:pending.length,kept:Object.keys(entries).length-pending.length};
}
