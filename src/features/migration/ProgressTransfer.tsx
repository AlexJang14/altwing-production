import {useState} from 'react';
import {createProgressBackup,parseProgressBackup,MAX_BACKUP_BYTES,type ProgressBackup} from '../../lib/progressBackup';
import {snapshotLocal,restoreLocalEntries,downloadText,readLocal} from '../../lib/storage';

export default function ProgressTransfer(){
  const [backup,setBackup]=useState<ProgressBackup|null>(null),[replace,setReplace]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  function exportHere(){
    setError('');try{const current=snapshotLocal();const value=createProgressBackup(current.entries,location.origin);downloadText('altwing-progress-backup.json',JSON.stringify(value),'application/json');setMessage(`${Object.keys(value.entries).length} saved items exported.${current.sessionOnly?' Some changes exist only in this open tab; keep the file before closing it.':''}`);}catch(e){setError((e as Error).message);}
  }
  async function choose(file?:File){
    setBackup(null);setMessage('');setError('');setReplace(false);if(!file)return;
    try{if(file.size>MAX_BACKUP_BYTES)throw Error('This backup exceeds the 8 MB limit.');setBackup(parseProgressBackup(await file.text()));}catch(e){setError((e as Error).message);}
  }
  function restore(){
    if(!backup)return;setError('');
    try{
      if(replace&&Object.keys(backup.entries).some(key=>readLocal(key)!==null)){
        const original=createProgressBackup(snapshotLocal().entries,location.origin);
        downloadText('altwing-before-restore.json',JSON.stringify(original),'application/json');
      }
      const result=restoreLocalEntries(backup.entries,replace);
      setBackup(null);setMessage(`${result.restored} saved items restored. ${result.kept?`${result.kept} existing items were kept. `:''}Open My Universe or your project to continue.`);
    }catch(e){setError((e as Error).message);}
  }
  const conflicts=backup?Object.keys(backup.entries).filter(key=>readLocal(key)!==null).length:0;
  return <main className="aw-analytics-page" data-private-transfer>
    <section className="aw-analytics-intro"><span className="aw-eyebrow">YOUR SAVED PROGRESS</span><h1>Bring your progress with you.</h1><p>Moving to altwing.org? Export from your original AltWing tab, then restore the file on the new website in the same browser or another device.</p></section>
    <section className="aw-analytics-panel"><h2>1. Save a backup</h2><p>Includes saved profiles, projects, lab notes, progress, collections and privacy preferences. This file can contain personal information and written reflections. Keep it private.</p><button type="button" className="aw-button" onClick={exportHere}>Download this browser’s progress</button><p>Accounts and sign-in sessions are not part of the backup. Your data is not uploaded to a server.</p></section>
    <section className="aw-analytics-panel"><h2>2. Restore on the new website</h2><label>Choose your AltWing backup <input type="file" accept="application/json,.json" onChange={e=>{void choose(e.target.files?.[0]);e.target.value='';}}/></label>
      {backup&&<div><p>{Object.keys(backup.entries).length} saved items from {backup.sourceOrigin}. {conflicts} items already exist in this browser.</p><label><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/> Replace overlapping items from this file. A backup of the current data downloads first.</label><p>When this is unchecked, existing items stay as they are.</p><button type="button" className="aw-button" onClick={restore}>Restore saved progress</button></div>}
    </section>
    {message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}
    <p><a href="#/universe">Open My Universe →</a> · <a href="#/projects">Open projects →</a></p>
    <p>Progress stored on another domain cannot be read from here automatically. Export before the domain changes. A recovery page on the original GitHub origin can also export previously saved browser data after cutover.</p>
  </main>;
}
