import {PUBLIC_PAGES} from '../../deployment/public-information.mjs';
import './information.css';
export type InformationKind=keyof typeof PUBLIC_PAGES;
export function InformationContent({kind,offline=false}:{kind:InformationKind;offline?:boolean}){
 const page=PUBLIC_PAGES[kind];
 return <article className="aw-information"><span className="aw-eyebrow">ALTWING / TRANSPARENCY</span><h1>{page.title}</h1><p className="aw-information-intro">{page.intro}</p><nav aria-label="Information pages">{Object.entries(PUBLIC_PAGES).map(([key,p])=><a key={key} href={'#/'+key} aria-current={kind===key?'page':undefined}>{p.title}</a>)}</nav>{page.sections.map(section=><section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(p=><p key={p}>{p}</p>)}{'references' in section&&section.references.map(ref=><p key={ref.url}><a href={ref.url} target="_blank" rel="noreferrer">{ref.name}</a><br/>{ref.use}</p>)}{'links' in section&&<ul>{section.links.map(link=><li key={link.href}>{offline&&!link.href.startsWith('https:')?<span>{link.label} · packaged with the review</span>:<a href={link.href}>{link.label}</a>}</li>)}</ul>}</section>)}</article>;
}
export default function InformationPage({kind}:{kind:InformationKind}){return <main><InformationContent kind={kind}/></main>;}
