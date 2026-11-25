import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
/** Build-time only: share the selected tokens and licensed fonts with static docs. */
export function goldenDocumentStyles(){
 let fonts=read('src/design/blackGoldTokens.css');
 for(const name of ['manrope','spacegrotesk']){
  const filename=name+'-latin.woff2',bytes=fs.readFileSync(new URL('../src/assets/black-gold/fonts/'+filename,import.meta.url));
  fonts=fonts.replace("url('../assets/black-gold/fonts/"+filename+"')",`url('data:font/woff2;base64,${bytes.toString('base64')}')`);
 }
 return fonts+'\n'+read('src/design/golden-horizon/tokens.css')+`\n*{box-sizing:border-box}body{margin:0;background:var(--gh-bg);color:var(--gh-text);font:400 16px/1.85 var(--gh-font-body)}main{max-width:960px;margin:auto;padding:64px 28px 88px}h1,h2{font-family:var(--gh-font-display);font-weight:500;letter-spacing:-.04em;line-height:1.2;color:var(--gh-text)}h1{font-size:clamp(36px,6vw,58px);margin:32px 0 24px}h2{margin-top:48px;font-size:26px}p,li{color:var(--gh-text-muted);overflow-wrap:break-word}a{color:var(--gh-interactive);text-underline-offset:5px}a:focus-visible{outline:var(--gh-focus);outline-offset:4px}nav{display:flex;flex-wrap:wrap;gap:12px 24px;border-block:1px solid var(--gh-border);padding:20px 0;margin:28px 0 40px}section{margin-bottom:40px}footer{border-top:1px solid var(--gh-border);margin-top:48px;padding-top:20px;font-size:13px}.date{font-size:13px;color:var(--gh-text-muted)}@media(max-width:600px){main{padding:36px 20px 56px}nav a{min-height:44px;display:flex;align-items:center}}@media print{body,h1,h2,a,p,li{background:white;color:#152535}main{padding:0;max-width:none;font-size:11pt}nav{display:none}section{break-inside:avoid-page}h1{font-size:26pt}h2{font-size:17pt}}`;
}
