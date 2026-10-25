import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,calendarFile} from '../dist/core.mjs';
test('calendar preserves JST instant across year end and has tentative 30-minute duration',()=>{
 const r=calculate({departureDate:'2026/12/31',departureTime:'25:10'});
 const ics=calendarFile(r,Date.UTC(2026,9,25));
 assert.match(ics,/DTSTART:20261231T161000Z\r\n/);
 assert.match(ics,/DTEND:20261231T164000Z\r\n/);
 assert.match(ics,/STATUS:TENTATIVE/);assert.match(ics,/TRANSP:TRANSPARENT/);
 const unfolded=ics.replace(/\r\n /g,'');assert.match(unfolded,/仮の乗車メモ/);assert.match(unfolded,/予約元で/);
 assert.doesNotMatch(ics,/BEGIN:VALARM|ATTENDEE|LOCATION/);
 assert.equal(ics.replaceAll('\r\n','').includes('\n'),false);
 for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
});
test('calendar handles leap day, maximum date and early morning without local-time parsing',()=>{
 for(const [date,time,expected] of [['2028/02/28','24:30','20280228T153000Z'],['9998/12/31','29:59','99981231T205900Z'],['2026/11/07','00:20','20261106T152000Z']]){
  assert.ok(calendarFile(calculate({departureDate:date,departureTime:time})).includes('DTSTART:'+expected));
 }
});
