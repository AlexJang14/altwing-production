import { useSyncExternalStore } from 'react';
import { isMemoryOnly } from '../lib/storage';
function subscribe(callback:()=>void){window.addEventListener('altwing:storage-status',callback);return()=>window.removeEventListener('altwing:storage-status',callback);}
export default function StorageNotice(){const temporary=useSyncExternalStore(subscribe,isMemoryOnly);return temporary?<div className="storage-notice" role="alert">Browser storage is unavailable. Your latest changes are held in this tab only. Export your project record before closing or reloading.</div>:null;}
