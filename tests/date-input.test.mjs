import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {japanDate,pickerDate,arrivalDateHint,calculate,shareText} from '../dist/core.mjs';
test('Japan today/tomorrow works at UTC date boundary, month end, and leap year',()=>{
 const before=Date.UTC(2026,9,24,14,59),after=Date.UTC(2026,9,24,15);
 assert.equal(japanDate(0,before),'2026-10-24');assert.equal(japanDate(0,after),'2026-10-25');assert.equal(japanDate(1,after),'2026-10-26');
 assert.equal(japanDate(1,Date.UTC(2026,11,31,12)),'2027-01-01');assert.equal(japanDate(1,Date.UTC(2028,1,28,12)),'2028-02-29');
 assert.equal(pickerDate('２０２６/１１/７'),'2026-11-07');assert.equal(pickerDate('2026/2/29'),'');assert.equal(pickerDate(''),'');
});
test('date hints use actual departure date and never infer hotel reservation day',()=>{
 assert.equal(arrivalDateHint('2026/12/31','25:10'),'2027-01-01');assert.equal(arrivalDateHint('2026/11/7','00:20'),'2026-11-07');assert.throws(()=>arrivalDateHint('2026/11/7','30:00'));
});
test('journey duration is separate from hotel waiting time, including reversed schedules',()=>{
 const r=calculate({departureDate:'2026/11/7',departureTime:'24:20',arrivalDate:'2026/11/8',arrivalTime:'07:00',hotelDate:'2026/11/8',hotelTime:'15:00'});
 assert.equal(r.journeyMinutes,400);assert.equal(r.gap,480);assert.match(shareText(r),/出発から到着まで：6時間40分/);
 const reversed=calculate({departureDate:'2026/11/8',departureTime:'10:00',arrivalDate:'2026/11/8',arrivalTime:'07:00'});assert.equal(reversed.journeyMinutes,-180);assert.doesNotMatch(shareText(reversed),/出発から到着まで：/);assert.ok(reversed.warnings.length);
});
test('date shortcuts are independent of device timezone',()=>{
 const path=new URL('../dist/core.mjs',import.meta.url).href;
 for(const TZ of ['UTC','Asia/Tokyo','America/Los_Angeles','Pacific/Kiritimati']){
  const text=execFileSync(process.execPath,['--input-type=module','-e',`import {japanDate} from ${JSON.stringify(path)};console.log(japanDate(0,Date.UTC(2026,9,24,15)));`],{env:{...process.env,TZ},encoding:'utf8'});assert.equal(text.trim(),'2026-10-25');
 }
});
