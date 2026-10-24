import test from 'node:test';
import assert from 'node:assert/strict';
import {toolShareData,toolShareText,initToolShare} from '../dist/tool-share.mjs';

function setup(nav) {
  const element=()=>({hidden:true,disabled:false,textContent:'',value:'',handlers:{},
    addEventListener(type,fn){this.handlers[type]=fn;},focus(){this.focused=true;},select(){this.selected=true;}});
  const ui=Object.fromEntries(['button','show','status','fallback','text'].map(key=>[key,element()]));
  initToolShare(ui,nav);
  return {...ui,click:()=>ui.button.handlers.click()};
}
test('紹介文は固定のサービス名・説明・正式URLだけ',()=>{
  assert.deepEqual(toolShareData(),{
    title:'日付まちがい防止ナビ',
    text:'夜行バスの24時・25時表記を実際の日本時間の日付・時刻に変換。到着とホテルの予定も比較できる無料ツールです。',
    url:'https://bus-date-navi.pages.dev/'
  });
  assert.equal(toolShareText(),Object.values(toolShareData()).join('\n'));
  const changed=toolShareData();changed.url='https://example.com/?departureDate=private';
  assert.equal(toolShareData().url,'https://bus-date-navi.pages.dev/');
});
test('Web Shareをクリック中に呼び、コピーしない',async()=>{
  let called=false;const nav={share(data){assert.equal(this,nav);assert.deepEqual(data,toolShareData());called=true;return Promise.resolve();},clipboard:{writeText(){assert.fail('no copy');}}};
  const ui=setup(nav),pending=ui.click();assert.equal(called,true);assert.equal(ui.button.disabled,true);
  await pending;assert.equal(ui.button.disabled,false);assert.match(ui.status.textContent,/共有先/);
});
test('キャンセルはコピーせず、再試行できる',async()=>{
  let calls=0;const ui=setup({share(){calls++;return Promise.reject({name:'AbortError'});},clipboard:{writeText(){assert.fail('no copy on cancel');}}});
  await ui.click();assert.match(ui.status.textContent,/中止/);assert.equal(ui.fallback.hidden,true);assert.equal(ui.button.disabled,false);
  await ui.click();assert.equal(calls,2);
});
test('未対応なら紹介文をコピー',async()=>{
  let copied;const ui=setup({clipboard:{async writeText(t){copied=t;}}});
  await ui.click();assert.equal(copied,toolShareText());assert.match(ui.status.textContent,/コピーしました/);
});
test('共有の権限拒否はコピーに切り替える',async()=>{
  let copied;const ui=setup({share(){throw {name:'NotAllowedError'};},clipboard:{async writeText(t){copied=t;}}});
  await ui.click();assert.equal(copied,toolShareText());assert.equal(ui.button.disabled,false);
});
for(const nav of [{},{clipboard:{async writeText(){throw {name:'NotAllowedError'};}}}])
test(`コピー不可・拒否時は手動選択を表示（API ${!!nav.clipboard}）`,async()=>{
  const ui=setup(nav);await ui.click();assert.equal(ui.fallback.hidden,false);assert.equal(ui.text.value,toolShareText());
  assert.equal(ui.text.focused,true);assert.equal(ui.text.selected,true);assert.equal(ui.button.disabled,false);assert.match(ui.status.textContent,/できません/);
});
test('連打で複数の共有を起動しない',async()=>{
  let finish,calls=0;const ui=setup({share(){calls++;return new Promise(resolve=>{finish=resolve;});}});
  const first=ui.click();await ui.click();assert.equal(calls,1);finish();await first;assert.equal(ui.button.disabled,false);
});
test('手動表示は共有・コピーを実行しない',()=>{
  const ui=setup({share(){assert.fail('no share');},clipboard:{writeText(){assert.fail('no copy');}}});
  ui.show.handlers.click();assert.equal(ui.fallback.hidden,false);assert.equal(ui.text.value,toolShareText());assert.equal(ui.text.selected,true);
});
