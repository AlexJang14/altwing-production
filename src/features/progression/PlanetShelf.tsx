import { useEffect, useState } from 'react';
import { CELESTIAL_OBJECTS, COSMIC_DISCOVERY_EVENT, readCosmicCollection } from './cosmic';
import { COSMIC_PACK_OPENED_EVENT } from './cosmic-packs';
import CelestialVisual from './CelestialVisual';
import { Penguin } from '../../components/SiteShell';

export default function PlanetShelf() {
  const [collection,setCollection]=useState(readCosmicCollection);
  useEffect(()=>{
    const refresh=()=>setCollection(readCosmicCollection());
    window.addEventListener(COSMIC_PACK_OPENED_EVENT,refresh);
    window.addEventListener(COSMIC_DISCOVERY_EVENT,refresh);
    return ()=>{window.removeEventListener(COSMIC_PACK_OPENED_EVENT,refresh);window.removeEventListener(COSMIC_DISCOVERY_EVENT,refresh);};
  },[]);
  const discovered=collection.discoveredIds.flatMap(id=>{const object=CELESTIAL_OBJECTS.find(o=>o.id===id);return object?[object]:[];}).slice(-6);
  return <section aria-label="Your latest space discoveries"><div className="aw-universe-intro"><Penguin/><div><span className="aw-eyebrow">PROGRESS YOU CAN COME BACK TO</span><h2>Your discoveries live here.</h2><p>Complete Find My Wing or save a completed project to earn a pack. Open it in the reward area below to reveal illustrated planets and space objects. Your collection stays here after you close the reveal.</p><p>Project records and saved universities or programs are separate from collectible rewards. Everything is stored in this browser.</p></div></div>
    {discovered.length>0?<div className="aw-reward-worlds">{discovered.map(object=><article key={object.id}><CelestialVisual object={object}/><h3>{object.name}</h3><small>{object.shortType} · Collected</small></article>)}</div>:<div className="aw-universe-empty"><strong>Your first world is waiting to be discovered.</strong><p>Already finished Find My Wing? Your unopened pack is in the rewards area below. Otherwise, begin with the quiz or explore a project.</p><div><a className="aw-inline-link" href="#/match">Start Find My Wing →</a><a className="aw-inline-link" href="#/projects">Try a project →</a></div></div>}
  </section>;
}
