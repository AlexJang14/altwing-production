'use client';
import { useEffect, useState, type ComponentType } from 'react';
export default function AltWingClient(){
  const [App,setApp]=useState<ComponentType|null>(null);
  useEffect(()=>{let live=true;void import('../src/App').then(module=>{if(live)setApp(()=>module.default);});return()=>{live=false;};},[]);
  if(App)return <App/>;
  return <main style={{minHeight:'100vh',display:'grid',placeContent:'center',textAlign:'center',background:'#0a1324',color:'#f5f6ed'}} role="status"><img src="/brand/altwing-penguin.png" alt="AltWing penguin guide" width="200" style={{margin:'auto'}}/><h1>Preparing your next discovery.</h1><p>You can take this at your own pace.</p></main>;
}
