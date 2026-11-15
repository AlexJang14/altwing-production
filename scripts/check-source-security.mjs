import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const patterns=[
 ['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
 ['GitHub credential',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/],
 ['AWS access key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
 ['OpenAI credential',/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}\b/],
 ['credential in URL',/https?:\/\/[^\s/@:]+:[^\s/@]+@/],
];
const findings=[];
function inspect(name,buffer){
 if(buffer.includes(0))return;
 const text=buffer.toString('utf8');
 for(const [rule,pattern]of patterns)if(pattern.test(text))findings.push({file:name,rule});
}
const paths=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z']).toString().split('\0').filter(Boolean);
for(const file of paths){
 if(/(?:^|\/)\.env(?:\.|$)/.test(file)&&!file.endsWith('.env.example')){findings.push({file,rule:'environment file must not be committed'});continue;}
 inspect(file,readFileSync(file));
}
let historical=0;
if(process.argv.includes('--history')){
 const objects=execFileSync('git',['rev-list','--objects','--all'],{maxBuffer:16*1024*1024}).toString().trim().split('\n');
 for(const line of objects){
  const split=line.indexOf(' ');if(split<0)continue;
  const sha=line.slice(0,split),file=line.slice(split+1);
  const type=execFileSync('git',['cat-file','-t',sha]).toString().trim();if(type!=='blob')continue;
  inspect(`history:${sha.slice(0,8)}/${file}`,execFileSync('git',['cat-file','blob',sha],{maxBuffer:32*1024*1024}));historical++;
 }
}
if(findings.length){console.error(JSON.stringify({potentialCredentials:findings},null,2));process.exit(1);}
console.log(`PASS: ${paths.length} source files and ${historical} historical blobs checked for common credential patterns; values are never printed. This is a pattern scan, not a guarantee against every secret format.`);
