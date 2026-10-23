import {readFileSync,readdirSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../dist/',import.meta.url);let checks=0;
for(const file of readdirSync(root).filter(f=>f.endsWith('.html'))){
 const html=readFileSync(new URL(file,root),'utf8');
 for(const pattern of [/<html lang="ja">/,/name="viewport"/,/<title>[^<]+<\/title>/,/name="description"/,/rel="canonical"/,/<h1>/]){assert.match(html,pattern,file);checks++;}
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size,`${file} duplicate ids`);checks++;
 for(const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https?:|mailto:)/.test(link))continue;
  const [path,hash]=link.split('#');const target=path===''?file:path==='/'?'index.html':path.replace(/^\//,'');
  assert.ok(existsSync(new URL(target,root)),`${file}: missing ${link}`);checks++;
  if(hash){assert.ok(readFileSync(new URL(target,root),'utf8').includes(`id="${hash}"`),`${file}: missing anchor ${link}`);checks++;}
 }
 assert.ok(!html.includes('adsbygoogle.js'),'ad serving must not be enabled');checks++;
}
const app=readFileSync(new URL('app.mjs',root),'utf8');assert.ok(!/innerHTML|fetch\(|localStorage|sessionStorage/.test(app));checks++;
const index=readFileSync(new URL('index.html',root),'utf8');assert.ok(!/id="(?:reset|submit|action|method)"/.test(index));checks++;
assert.equal(readFileSync(new URL('ads.txt',root),'utf8').trim(),'google.com, pub-2422278081062267, DIRECT, f08c47fec0942fa0');checks++;
console.log(`Static checks: ${checks} passed, 0 failed`);
