import test from 'node:test';import assert from 'node:assert/strict';
test('calendar link follows valid result and is cleared on edits or invalid input; fallback survives copy rejection',async()=>{
 const nodes=new Map();let focused;
 const el=id=>{if(!nodes.has(id))nodes.set(id,{id,value:'',hidden:false,handlers:{},addEventListener(t,f){(this.handlers[t]??=[]).push(f);},async fire(t){for(const f of this.handlers[t]||[])await f({preventDefault(){}});},setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];},replaceChildren(){},focus(){focused=id;},select(){},closest(){return {open:false};}});return nodes.get(id);};
 const fields=['departureDate','departureTime','arrivalDate','arrivalTime','hotelDate','hotelTime'];
 el('check-form').reset=()=>fields.forEach(id=>el(id).value='');
 globalThis.document={getElementById:el,createElement:()=>({textContent:''})};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async()=>{throw Error('permission denied');}}}});
 await import('../dist/app.mjs?workflow-test');
 el('departureDate').value='2026/12/31';el('departureTime').value='25:10';
 await el('check-form').fire('submit');assert.equal(el('result').hidden,false);assert.match(el('calendar-save').href,/^blob:/);assert.equal(el('calendar-save').hidden,false);
 const file=await (await fetch(el('calendar-save').href)).text();assert.match(file,/DTSTART:20261231T161000Z/);
 await el('copy').fire('click');assert.equal(el('copy-fallback').hidden,false);assert.match(el('copy-text').value,/2027年1月1日/);
 await el('check-form').fire('input');assert.equal(el('result').hidden,true);assert.equal(el('calendar-save').hidden,true);assert.equal(el('calendar-save').href,undefined);
 el('departureTime').value='30:00';await el('check-form').fire('submit');assert.equal(el('result').hidden,true);assert.equal(focused,'departureTime');
 await el('sample-hotel').fire('click');await el('check-form').fire('submit');assert.match(el('gap').textContent,/8時間/);
 delete globalThis.document;delete globalThis.navigator;
});
