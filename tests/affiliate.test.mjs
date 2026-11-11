import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ad=JSON.parse(read('content/affiliate-jalan.json'));
test('only the registered guide publishes the issued medium and untouched tracking pair',()=>{
 const guide=read('dist/guide.html');
 const issued=ad.originalCode.replace('自由テキスト',ad.text);
 assert.equal(guide.split(issued).length-1,1);
 assert.ok(guide.indexOf('アフィリエイト広告を掲載')<guide.indexOf('<h1>'));
 assert.match(guide, /id="hotel"[\s\S]*data-ad-placement="guide-hotel"/);
 const urls=[...issued.matchAll(/(?:href|src)="([^"]+)"/g)].map(m=>new URL(m[1],'https://bus-date-navi.pages.dev'));
 assert.deepEqual(urls.map(u=>u.hostname),['ck.jp.ap.valuecommerce.com','ad.jp.ap.valuecommerce.com']);
 for(const u of urls){assert.equal(u.searchParams.get('sid'),'3785973');assert.equal(u.searchParams.get('pid'),'892745985');}
 for(const page of readdirSync(new URL('../dist/',import.meta.url)).filter(p=>p.endsWith('.html')&&p!=='guide.html'))assert.doesNotMatch(read('dist/'+page),/servlet\/(?:referral|gifbanner)/);
});
test('the trip input page remains isolated from third-party ad scripts and event transmission',()=>{
 const html=read('dist/index.html');
 assert.doesNotMatch(html,/valuecommerce|adsbygoogle\.js/);
 assert.doesNotMatch(read('dist/app.mjs'),/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/);
 const csp=read('dist/_headers');
 for(const rule of ["script-src 'self'", "connect-src 'none'", "form-action 'none'", "object-src 'none'"])assert.ok(csp.includes(rule));
 assert.match(csp,/img-src 'self' data: https:\/\/ad\.jp\.ap\.valuecommerce\.com;/);
 assert.doesNotMatch(csp,/https:\/\/\*|unsafe-inline|unsafe-eval/);
 assert.match(read('dist/privacy.html'),/Cookie等/);
});
