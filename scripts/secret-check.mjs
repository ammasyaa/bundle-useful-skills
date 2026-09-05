import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root=process.cwd();
const skip=new Set(['.git','node_modules']);
const files=[];
function walk(dir){for(const n of readdirSync(dir)){if(skip.has(n))continue;const p=join(dir,n);const st=statSync(p);st.isDirectory()?walk(p):files.push(p)}}
walk(root);
const rules=[
  ['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['GitHub token',/gh[pousr]_[A-Za-z0-9]{30,}/],
  ['AWS key',/AKIA[0-9A-Z]{16}/],
  ['generic secret assignment',/(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"'\s]{12,}["']/i],
  ['local Windows user path',/[A-Za-z]:\\Users\\[^\\\s]+\\/],
  ['private chat transcript',/ChatGPT conversation transcript/i]
];
const findings=[];
for(const file of files){const rel=relative(root,file).replaceAll('\\','/');if(rel==='scripts/secret-check.mjs')continue;let body;try{body=readFileSync(file,'utf8')}catch{continue}for(const [name,re] of rules)if(re.test(body))findings.push(`${rel}: ${name}`)}
if(findings.length){console.error(findings.join('\n'));process.exitCode=1}else console.log(`Privacy/secret scan clean across ${files.length} files.`);
