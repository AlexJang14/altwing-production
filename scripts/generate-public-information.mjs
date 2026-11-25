import {goldenDocumentStyles} from './golden-document-style.mjs';
import {PUBLIC_PAGES,COPYRIGHT_NOTICE,NO_ENDORSEMENT} from '../deployment/public-information.mjs';
import fs from 'node:fs';
const escape=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function writePublicInformation(directory,canonical='https://altwing.org/',noindex=false){
 const nav=Object.entries(PUBLIC_PAGES).map(([key,p])=>`<a href="${key}.html">${escape(p.title)}</a>`).join('');
 for(const [key,page]of Object.entries(PUBLIC_PAGES)){
  const content=page.sections.map(s=>`<section><h2>${escape(s.heading)}</h2>${s.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}${(s.references??[]).map(r=>`<p><a href="${escape(r.url)}">${escape(r.name)}</a><br>${escape(r.use)}</p>`).join('')}${s.links?'<ul>'+s.links.map(l=>`<li><a href="${escape(l.href)}">${escape(l.label)}</a></li>`).join('')+'</ul>':''}</section>`).join('');
  fs.writeFileSync(`${directory}/${key}.html`,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)} · AltWing</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${canonical}${key}.html"><meta property="og:type" content="website"><meta property="og:title" content="${escape(page.title)} · AltWing"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${canonical}${key}.html"><meta property="og:image" content="${canonical}brand/altwing-penguin.png"><meta name="twitter:card" content="summary_large_image">${noindex?'<meta name="robots" content="noindex,nofollow">':''}<style>${goldenDocumentStyles()}</style></head><body><main><a href="./">AltWing home</a><h1>${escape(page.title)}</h1><p>${escape(page.intro)}</p><nav aria-label="Information pages">${nav}<a href="privacy.html">Privacy</a></nav>${content}<footer><p>${escape(NO_ENDORSEMENT)}</p><p>${escape(COPYRIGHT_NOTICE)}</p></footer></main></body></html>\n`);
 }
}
