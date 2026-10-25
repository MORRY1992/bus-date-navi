import {calculate,dateLabel,timeLabel,clockLabel,fullLabel,duration,shareText,copyText,calendarFile,pickerDate,japanDate,arrivalDateHint} from './core.mjs';
import {initToolShare} from './tool-share.mjs';
const $=id=>document.getElementById(id);
initToolShare({button:$('share-tool'),show:$('show-tool-share'),status:$('tool-share-status'),fallback:$('tool-share-fallback'),text:$('tool-share-text')});
const form=$('check-form'); let result=null,revision=0,calendarURL=null;
const fields=['departureDate','departureTime','arrivalDate','arrivalTime','hotelDate','hotelTime'];
function invalidate(){revision++;syncPickers();$('date-input-status').textContent='';if(calendarURL){URL.revokeObjectURL(calendarURL);calendarURL=null;}$('calendar-save').hidden=true;$('calendar-save').removeAttribute('href');$('calendar-status').textContent='';result=null;$('result').hidden=true;$('empty-result').hidden=false;$('copy-fallback').hidden=true;$('copy-status').textContent='';$('form-error').hidden=true;fields.forEach(id=>$(id).removeAttribute('aria-invalid'));}
form.addEventListener('input',event=>{if(!event.target?.id?.endsWith('-picker'))invalidate();});
$('sample').addEventListener('click',()=>{form.reset();invalidate();$('departureDate').value='2026/11/07';$('departureTime').value='24:20';syncPickers();$('sample-notice').hidden=false;$('departureDate').focus();});
form.addEventListener('input',()=>{$('sample-notice').hidden=true;});
$('clear-input').addEventListener('click',()=>{form.reset();invalidate();$('sample-notice').hidden=true;$('departureDate').focus();});
form.addEventListener('submit',event=>{
  event.preventDefault(); invalidate();
  try{
    result=calculate(Object.fromEntries(fields.map(id=>[id,$(id).value])));
    $('input-summary').textContent=`${result.departure.date.iso.replaceAll('-','/')}  ${result.departure.time.text} 発`;
    $('actual-date').textContent=dateLabel(result.departure.epoch);$('actual-time').textContent=timeLabel(result.departure.epoch);
    $('actual-clock').textContent=`${clockLabel(result.departure.epoch)} ／ 日本時間（JST）`;
    $('rollover').textContent=result.departure.dayOffset?'カレンダーでは翌日':'入力した日付として計算';
    $('prep').textContent=result.prep;
    $('journey-duration').hidden=result.journeyMinutes===null;
    if(result.journeyMinutes!==null)$('journey-duration').textContent=result.journeyMinutes>=0?'出発から到着まで '+duration(result.journeyMinutes):'到着予定が出発より前です。日付と時刻を再確認してください。';
    $('warnings').replaceChildren(...result.warnings.map(t=>{const p=document.createElement('p');p.textContent=t;return p;}));
    $('schedule').hidden=!result.arrival&&!result.hotel;
    $('arrival-row').hidden=!result.arrival;$('hotel-row').hidden=!result.hotel;
    if(result.arrival) $('arrival-summary').textContent=fullLabel(result.arrival.epoch);
    if(result.hotel) $('hotel-summary').textContent=fullLabel(result.hotel.epoch);
    $('gap').hidden=result.gap===null;
    if(result.gap!==null)$('gap').textContent=result.gap<0?`チェックイン予定は到着より ${duration(result.gap)} 前です`:result.gap===0?'到着予定とチェックイン予定は同時刻です':`到着からチェックイン予定まで ${duration(result.gap)}`;
    try{calendarURL=URL.createObjectURL(new Blob([calendarFile(result)],{type:'text/calendar;charset=utf-8'}));$('calendar-save').href=calendarURL;$('calendar-save').hidden=false;}catch{$('calendar-status').textContent='この環境では予定ファイルを作成できません。確認メモをご利用ください。';}
    $('empty-result').hidden=true;$('result').hidden=false;$('result-title').focus();
  }catch(error){$('form-error').textContent=error.message;$('form-error').hidden=false;if(error.field&&$(error.field)){$(error.field).setAttribute('aria-invalid','true');const details=$(error.field).closest('details');if(details)details.open=true;$(error.field).focus();}}
});
$('copy').addEventListener('click',async()=>{
  if(!result)return; const copyRevision=revision, text=shareText(result);$('copy').disabled=true;
  const success=await copyText(text,navigator.clipboard);$('copy').disabled=false;
  if(revision!==copyRevision)return;
  if(success){$('copy-status').textContent='確認メモをコピーしました。予約元での最終確認もお願いします。';$('copy-fallback').hidden=true;}
  else {$('copy-status').textContent='自動コピーができませんでした。下の確認メモを選択してコピーしてください。';$('copy-fallback').hidden=false;$('copy-text').value=text;$('copy-text').focus();$('copy-text').select();}
});
$('show-memo').addEventListener('click',()=>{if(!result)return;$('copy-fallback').hidden=false;$('copy-text').value=shareText(result);$('copy-text').focus();$('copy-text').select();});


function example(values){form.reset();invalidate();for(const [id,v] of Object.entries(values))$(id).value=v;$('sample-notice').hidden=false;syncPickers();if(values.arrivalDate)$('arrivalDate').closest('details').open=true;$('departureDate').focus();}
$('sample-year').addEventListener('click',()=>example({departureDate:'2026/12/31',departureTime:'25:10'}));
$('sample-hotel').addEventListener('click',()=>example({departureDate:'2026/11/07',departureTime:'24:20',arrivalDate:'2026/11/08',arrivalTime:'07:00',hotelDate:'2026/11/08',hotelTime:'15:00'}));

const dateFields=['departureDate','arrivalDate','hotelDate'];
function syncPickers(){for(const id of ['departureDate','arrivalDate','hotelDate'])$(id+'-picker').value=pickerDate($(id).value);}
function useDate(id,date,message){$(id).value=date;invalidate();$('sample-notice').hidden=true;$('date-input-status').textContent=message;$(id).focus();}
for(const id of dateFields){
 $(id).addEventListener('input',()=>{$(id+'-picker').value=pickerDate($(id).value);});
 $(id+'-picker').addEventListener('input',()=>{const date=$(id+'-picker').value;useDate(id,date,date?'選んだ日付を反映しました。予約画面の表記と照合してください。':'日付を消しました。');});
}
$('use-today').addEventListener('click',()=>useDate('departureDate',japanDate(),'日本時間の今日を入力しました。予約の出発日と照合してください。'));
$('use-tomorrow').addEventListener('click',()=>useDate('departureDate',japanDate(1),'日本時間の明日を入力しました。予約の出発日と照合してください。'));
$('arrival-use-departure').addEventListener('click',()=>{try{useDate('arrivalDate',arrivalDateHint($('departureDate').value,$('departureTime').value),'換算後の出発日を到着日に仮入力しました。翌日以降に到着する場合は修正してください。');}catch(e){$('date-input-status').textContent=e.message;$(e.field||'departureDate').focus();}});
$('hotel-use-arrival').addEventListener('click',()=>{const date=pickerDate($('arrivalDate').value);if(!date){$('date-input-status').textContent='先に到着予定日を入力してください。';$('arrivalDate').focus();return;}useDate('hotelDate',date,'到着日をホテル予定日に仮入力しました。前泊・翌日泊の場合は修正してください。');});
syncPickers();
