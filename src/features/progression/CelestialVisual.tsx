import { useId } from 'react';
import type { CelestialObject } from './cosmic';

// Self-contained SVG keeps rewards visible in every lazy-loaded route.
export default function CelestialVisual({ object, small = false }: { object: CelestialObject; small?: boolean }) {
  const id = useId().replaceAll(':','');
  const seed = [...object.id].reduce((sum,c) => sum + c.charCodeAt(0), 0);
  const hue = seed % 360;
  const diffuse = /NEBULA|GALAXY|QUASAR|DEEP SPACE/.test(object.category);
  const blackHole = object.category === 'BLACK HOLE';
  const ringed = /ring|saturn|black|hole|neutron|pulsar/.test(object.id) || object.category === 'BLACK HOLE';
  const star = /STAR/.test(object.category);
  return <svg className={`aw-celestial ${small ? 'aw-celestial-small' : ''}`} viewBox="0 0 200 170" width="200" height="170" role="img" aria-label={`${object.name} illustration`}>
    <defs><radialGradient id={`planet-${id}`} cx="30%" cy="25%"><stop stopColor={`hsl(${hue} 60% 88%)`}/><stop offset=".42" stopColor={`hsl(${hue} 65% 58%)`}/><stop offset="1" stopColor={`hsl(${hue} 60% 12%)`}/></radialGradient><clipPath id={`clip-${id}`}><circle cx="100" cy="84" r="54"/></clipPath></defs>
    <circle cx="100" cy="84" r="68" fill={`hsl(${hue} 80% 65%)`} opacity=".07"/>
    {star&&<circle cx="100" cy="84" r="60" fill="none" stroke={`hsl(${hue} 80% 65%)`} strokeWidth="6" opacity=".25"/>}
    {ringed&&<ellipse cx="100" cy="88" rx="89" ry="23" transform="rotate(-20 100 88)" fill="none" stroke={`hsl(${hue} 65% 73%)`} strokeWidth="9" opacity=".6"/>}
    {diffuse ? <g fill="none" stroke={`hsl(${hue} 75% 75%)`}><ellipse cx="100" cy="84" rx="60" ry="34" transform="rotate(-30 100 84)" strokeWidth="19" opacity=".18"/><ellipse cx="100" cy="84" rx="44" ry="27" transform="rotate(30 100 84)" strokeWidth="13" opacity=".5"/><circle cx="100" cy="84" r="8" fill="#e6f2ff" strokeWidth="0"/></g> : <><circle cx="100" cy="84" r="54" fill={blackHole ? '#030713' : `url(#planet-${id})`}/>{!blackHole&&<g clipPath={`url(#clip-${id})`} opacity=".28" fill="none" stroke={`hsl(${hue+35} 65% 85%)`} strokeWidth="8"><path d="M35 60q65 22 130-1M30 91q70-20 140 0M34 115q65 20 133-8"/></g>}</>}
    {!diffuse&&!ringed&&!star&&<g fill="#0b1a32" opacity=".22"><ellipse cx="82" cy="62" rx="12" ry="8"/><ellipse cx="115" cy="102" rx="17" ry="11"/><circle cx="69" cy="103" r="6"/></g>}
    {ringed&&<path d="M18 113Q78 143 182 56" fill="none" stroke={`hsl(${hue} 65% 73%)`} strokeWidth="7" opacity=".85"/>}
    <circle cx="30" cy="35" r="2" fill="#fff"/><circle cx="173" cy="130" r="1.5" fill="#fff"/>
  </svg>;
}
