import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {pagesTarget} from '../deployment/domain.mjs';

const args=process.argv.slice(2);
if(args.length>1||args.some(arg=>!['--legacy','--preview'].includes(arg)))throw Error('Use no flag, --legacy, or --preview.');
const name=args.includes('--legacy')?'legacy':args.includes('--preview')?'preview':'custom';
const target=pagesTarget(name);
const build=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/vite/bin/vite.js',import.meta.url)),'build','--config','vite.pages.config.ts'],{
  stdio:'inherit',env:{...process.env,ALTWING_PAGES_TARGET:name},
});
if(build.error)throw build.error;
if(build.status!==0)process.exit(build.status??1);
writeFileSync(`${target.outDir}/.nojekyll`,'');
if(target.domain)writeFileSync(`${target.outDir}/CNAME`,`${target.domain}\n`);
writeFileSync(`${target.outDir}/robots.txt`,`User-agent: *\n${target.noindex?'Disallow: /':'Allow: /'}\nSitemap: ${target.canonical}sitemap.xml\n`);
writeFileSync(`${target.outDir}/sitemap.xml`,`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${target.canonical}</loc></url><url><loc>${target.canonical}privacy.html</loc></url></urlset>\n`);
const privacy=readFileSync(`${target.outDir}/privacy.html`,'utf8').replace('</title>','</title>'+[
  `<link rel="canonical" href="${target.canonical}privacy.html">`,
  '<meta name="description" content="How AltWing protects browser-local progress and respects your privacy choices.">',
  '<meta property="og:type" content="website">',
  '<meta property="og:title" content="Privacy · AltWing">',
  `<meta property="og:url" content="${target.canonical}privacy.html">`,
  `<meta property="og:image" content="${target.canonical}brand/altwing-penguin.png">`,
  '<meta name="twitter:card" content="summary_large_image">',
].join(''));
writeFileSync(`${target.outDir}/privacy.html`,privacy);
console.log(`Prepared ${name} Pages build: ${target.outDir} (${target.base})`);
