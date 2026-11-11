import test from 'node:test';
import assert from 'node:assert/strict';

test('example identity, edited result, copy fallback and date-boundary labels', async () => {
  const nodes = new Map(); let focused;
  const el = id => {
    if (!nodes.has(id)) nodes.set(id, {id, value:'', hidden:true, handlers:{},
      addEventListener(t,f){(this.handlers[t]??=[]).push(f);},
      async fire(t){for(const f of this.handlers[t]||[]) await f({target:this,preventDefault(){}});},
      setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];},replaceChildren(){},
      focus(){focused=id;},select(){},closest(){return {open:false};}
    });
    return nodes.get(id);
  };
  el('check-form').reset=()=>['departureDate','departureTime','arrivalDate','arrivalTime','hotelDate','hotelTime'].forEach(id=>el(id).value='');
  globalThis.document={getElementById:el,createElement:()=>({textContent:''})};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async()=>{throw Error('denied');}}}});
  try {
    await import('../dist/app.mjs?result-ui');
    await el('sample-year').fire('click'); await el('check-form').fire('submit');
    assert.match(el('result-kind').textContent,/入力例の結果/);
    assert.match(el('timeline-output').textContent,/2027年1月1日.*01:10/);
    assert.equal(el('timeline-day').textContent,'翌日の暦日');
    await el('copy').fire('click');
    assert.match(el('copy-text').value,/^【入力例の確認メモ/);
    await el('edit-input').fire('click');
    assert.equal(focused,'departureDate'); assert.equal(el('result').hidden,true);
    assert.equal(el('calendar-save').hidden,true); assert.equal(el('copy-fallback').hidden,true);
    el('departureTime').value='00:20'; await el('check-form').fire('input'); await el('check-form').fire('submit');
    assert.equal(el('result-kind').textContent,'ご自身の入力結果');
    assert.equal(el('timeline-day').textContent,'同じ暦日');
    assert.match(el('timeline-output').textContent,/2026年12月31日.*00:20/);
    await el('show-memo').fire('click'); assert.doesNotMatch(el('copy-text').value,/入力例の確認メモ/);
    el('departureTime').value='24:60'; await el('check-form').fire('submit');
    assert.equal(el('result').hidden,true); assert.equal(focused,'departureTime');
  } finally { delete globalThis.document; delete globalThis.navigator; }
});
