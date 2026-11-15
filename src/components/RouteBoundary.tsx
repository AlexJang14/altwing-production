import { Component, type ReactNode } from 'react';
import { Penguin } from './SiteShell';
export default class RouteBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<main className="aw-loading"><Penguin/><h1>Let’s reopen this step.</h1><p>The page could not finish loading. Your saved work is still in this browser.</p><button className="aw-button" type="button" onClick={()=>window.location.reload()}>Reload this page →</button><a className="aw-inline-link" href="#/">Return home</a></main>:this.props.children;}
}
