import { useEffect, useState } from 'react';
import { CELESTIAL_OBJECTS, COSMIC_DISCOVERY_EVENT, readCosmicCollection } from './cosmic';
import { COSMIC_PACK_AWARDED_EVENT, COSMIC_PACK_OPENED_EVENT, readCosmicPackInventory } from './cosmic-packs';
import CosmicAtlas from './CosmicAtlas';
import CosmicPackVault from './CosmicPackVault';
import './my-universe.css';
export default function MyUniversePanel(){
  const [inventory,setInventory]=useState(readCosmicPackInventory);
  const [collection,setCollection]=useState(readCosmicCollection);
  const [tab,setTab]=useState<'packs'|'collection'>(()=>readCosmicPackInventory().packs.some(p=>!p.openedAt)?'packs':readCosmicCollection().discoveredIds.length?'collection':'packs');
  useEffect(()=>{const refresh=()=>{setInventory(readCosmicPackInventory());setCollection(readCosmicCollection());};const events=[COSMIC_PACK_AWARDED_EVENT,COSMIC_PACK_OPENED_EVENT,COSMIC_DISCOVERY_EVENT];events.forEach(event=>window.addEventListener(event,refresh));return()=>events.forEach(event=>window.removeEventListener(event,refresh));},[]);
  const unopened=inventory.packs.filter(p=>!p.openedAt).length;
  return <section className="aw-universe-rewards" id="universe-rewards"><div className="aw-section-heading"><div><span className="aw-eyebrow">A LITTLE WONDER FOR YOUR EXPLORATION</span><h2>Packs & planet discoveries</h2></div><p>These are collectibles, not a grade or a measure of ability. Open a pack to reveal illustrated space objects.</p></div><nav className="aw-reward-tabs" aria-label="Universe rewards"><button type="button" aria-pressed={tab==='packs'} onClick={()=>setTab('packs')}>Open packs <b>{unopened} ready</b></button><button type="button" aria-pressed={tab==='collection'} onClick={()=>setTab('collection')}>My planet collection <b>{collection.discoveredIds.length}/{CELESTIAL_OBJECTS.length}</b></button></nav>{tab==='packs'?<CosmicPackVault onViewCollection={()=>setTab('collection')}/>:<CosmicAtlas/>}<div className="aw-rewards-next"><h3>What would you like to try next?</h3><a className="aw-inline-link" href="#/projects">Try another project →</a><a className="aw-inline-link" href="#/colleges">Compare colleges →</a><a className="aw-inline-link" href="#/programs">Find student programs →</a></div></section>;
}
