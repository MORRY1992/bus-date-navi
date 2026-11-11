const frame=document.querySelector('#preview'), report=document.querySelector('#report');
const doc=()=>frame.contentDocument, win=()=>frame.contentWindow, el=id=>doc().getElementById(id);
const input=(id,value)=>{el(id).value=value;el(id).dispatchEvent(new win().Event('input',{bubbles:true}));};
const submit=()=>el('check-form').requestSubmit();
const wait=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
const fresh=async()=>{const ready=new Promise(resolve=>frame.onload=resolve);frame.srcdoc=document.querySelector('#home-source').content.textContent;await ready;await wait();};
document.querySelector('#width').onchange=e=>frame.style.width=e.target.value+'px';
document.querySelector('#guide').onclick=()=>frame.srcdoc=document.querySelector('#guide-source').content.textContent;
document.querySelector('#home').onclick=fresh;
document.querySelector('#zoom').onclick=()=>doc().documentElement.style.zoom='2';
document.querySelector('#result-view').onclick=()=>{input('departureDate','2026/11/07');input('departureTime','24:20');submit();};
document.querySelector('#error-view').onclick=()=>{input('departureTime','24:60');submit();};
document.querySelector('#run').onclick=async()=>{
 const results=[];let failed=0;
 const check=(condition,label)=>{results.push((condition?'PASS ':'FAIL ')+label);if(!condition)failed++;report.textContent=results.join('\n');};
 const overflow=()=>doc().documentElement.scrollWidth<=doc().documentElement.clientWidth;
 try{
  await fresh();
  for(const width of [320,375,390,1280]){
   frame.style.width=width+'px';await wait();check(overflow(),width+' initial overflow');
   for(const [d,t,want] of [['2026/11/07','24:20','2026年11月8日'],['2026/11/30','24:00','2026年12月1日'],['2026/12/31','25:10','2027年1月1日'],['2028/02/28','24:30','2028年2月29日'],['2027/02/28','24:30','2027年3月1日'],['２０２６／１１／０７','２４：２０','2026年11月8日'],['2026/11/07','00:20','2026年11月7日'],['9998/12/31','29:59','9999年1月1日']]){
    input('departureDate',d);input('departureTime',t);submit();
    check(!el('result').hidden&&el('actual-date').textContent.includes(want),width+' '+d+' '+t);
    check(overflow(),width+' result overflow');
   }
   input('departureTime','24:60');submit();check(el('result').hidden&&el('form-error').textContent.includes('分は00〜59')&&doc().activeElement.id==='departureTime',width+' error and focus');check(overflow(),width+' error overflow');
  }
  el('sample-year').click();submit();check(el('result-kind').textContent.includes('入力例'), 'example label');
  el('edit-input').click();check(el('result').hidden&&doc().activeElement.id==='departureDate','edit hides stale result and focuses field');
  input('departureDate','2026/11/07');input('departureTime','24:20');submit();check(el('result-kind').textContent==='ご自身の入力結果','user label after edit');
  Object.defineProperty(win().navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('QA denial')}}});
  el('copy').click();await new Promise(r=>setTimeout(r,30));check(!el('copy-fallback').hidden&&doc().activeElement.id==='copy-text'&&el('copy-text').selectionEnd===el('copy-text').value.length,'copy denial selects memo');
  el('sample-hotel').click();submit();check(el('gap').textContent.includes('8時間')&&el('journey-duration').textContent.includes('6時間40分'),'hotel and journey');
  input('hotelTime','24:00');submit();check(el('result').hidden&&doc().activeElement.id==='hotelTime','optional invalid time');
  el('clear-input').click();submit();check(el('result').hidden&&doc().activeElement.id==='departureDate','empty input');
  frame.style.width='1280px';doc().documentElement.style.zoom='2';input('departureDate','2026/11/07');input('departureTime','24:20');submit();await wait();check(overflow(),'200% CSS layout zoom');
  report.textContent=failed+' failed\n'+results.join('\n');
 }catch(error){report.textContent+='\nERROR '+error.message;}
};
