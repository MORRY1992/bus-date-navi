// JST (+09:00) only. Never parse dates using host-local time or free-form Date strings.
const MINUTE = 60000, DAY = 86400000, JST = 9 * 60 * MINUTE;
export const normalize = value => String(value ?? '').normalize('NFKC').trim();
export class InputError extends Error { constructor(message, field) { super(message); this.name='InputError'; this.field=field; } }
export function parseDate(value, field='departureDate') {
  const s=normalize(value), m=/^(\d{4})([-/])(\d{1,2})\2(\d{1,2})$/.exec(s);
  if(!m) throw new InputError('日付を年4桁・月・日で入力してください（例：2026/11/07）。',field);
  const [y,mo,d]=[m[1],m[3],m[4]].map(Number);
  if(y<1900 || y>9998) throw new InputError('年は1900〜9998年の範囲で入力してください。',field);
  const ms=Date.UTC(y,mo-1,d), dt=new Date(ms);
  if(dt.getUTCFullYear()!==y || dt.getUTCMonth()!==mo-1 || dt.getUTCDate()!==d) throw new InputError('存在しない日付です。月末・うるう年を確認してください。',field);
  return {y,mo,d,ms,iso:`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`};
}
export function parseTime(value, maxHour=29, field='departureTime') {
  const s=normalize(value), m=/^(\d{1,2}):(\d{2})$/.exec(s);
  if(!m) throw new InputError(`時刻を「時:分」で入力してください（00:00〜${maxHour}:59）。`,field);
  const [h,min]=m.slice(1).map(Number);
  if(h>maxHour || min>59) throw new InputError(`時刻は00:00〜${maxHour}:59です。分は00〜59で入力してください。自動補正はしません。`,field);
  return {h,min,text:`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`};
}
export function parts(epoch) {
  const d=new Date(epoch+JST);
  return {y:d.getUTCFullYear(),mo:d.getUTCMonth()+1,d:d.getUTCDate(),h:d.getUTCHours(),min:d.getUTCMinutes(),weekday:'日月火水木金土'[d.getUTCDay()]};
}
export const dateLabel = epoch => { const p=parts(epoch); return `${p.y}年${p.mo}月${p.d}日（${p.weekday}）`; };
export const timeLabel = epoch => { const p=parts(epoch); return `${p.h<12?'午前':'午後'}${p.h%12}時${String(p.min).padStart(2,'0')}分`; };
export const clockLabel = epoch => {const p=parts(epoch);return `${String(p.h).padStart(2,'0')}:${String(p.min).padStart(2,'0')}`;};
export const fullLabel = epoch => `${dateLabel(epoch)} ${timeLabel(epoch)}［${clockLabel(epoch)}・日本時間］`;
export function convert(date,time,maxHour=29,dateField='departureDate',timeField='departureTime') {
  const d=parseDate(date,dateField),t=parseTime(time,maxHour,timeField);
  const epoch=d.ms-JST+(t.h*60+t.min)*MINUTE;
  return {epoch,date:d,time:t,dayOffset:Math.floor(t.h/24)};
}
function optional(date,time,prefix) {
  if(!normalize(date)&&!normalize(time)) return null;
  if(!normalize(date)||!normalize(time)) throw new InputError('任意の日程を確認するときは、日付と時刻を両方入力してください。不要なら両方を空欄にしてください。',!normalize(date)?`${prefix}Date`:`${prefix}Time`);
  return convert(date,time,23,`${prefix}Date`,`${prefix}Time`);
}
export const duration = minutes => {const a=Math.abs(minutes);return `${Math.floor(a/60)}時間${a%60?`${a%60}分`:''}`;};
export function calculate(input) {
  const departure=convert(input.departureDate,input.departureTime);
  const arrival=optional(input.arrivalDate,input.arrivalTime,'arrival');
  const hotel=optional(input.hotelDate,input.hotelTime,'hotel');
  const warnings=[];
  if(departure.time.h<24) warnings.push('00〜23時表記は、入力した日付の時刻として計算しています。予約サイト独自の「運行日」や「翌日」表示は判定できません。乗車停留所の実際の日付を予約元で確認してください。');
  else warnings.push('24時以降は入力日から翌日へ換算しています。この計算は予約すべき日付・便名上の運行日を確定するものではありません。');
  if(arrival&&arrival.epoch<departure.epoch) warnings.push('到着予定が出発の計算結果より前です。日付と時刻の入力・予約元の表記を再確認してください。予約ミスと断定するものではありません。');
  if(hotel&&!arrival) warnings.push('到着日時が未入力のため、ホテルまでの時間差は計算していません。');
  const gap=arrival&&hotel?(hotel.epoch-arrival.epoch)/MINUTE:null;
  if(gap!==null&&gap<0) warnings.push('ホテルのチェックイン予定が到着予定より前です。前泊などの意図した予定か、時系列を再確認してください。予約ミスとは断定できません。');
  const p=parts(departure.epoch);
  // 00:00–05:59: previous evening is an orientation aid, never a prescribed departure time.
  const prep=p.h<6?`${dateLabel(departure.epoch-DAY)}の夜から、日付が変わった後の出発に備える目安です。`:
    p.h>=18?`${dateLabel(departure.epoch)}の夜に出発する計算です。`:'日中・夕方の出発です。「準備する夜」は一律に決められません。';
  return {departure,arrival,hotel,gap,prep,warnings};
}
export function shareText(r) {
  return ['日付まちがい防止ナビ｜確認メモ',`予約画面の入力：${r.departure.date.iso} ${r.departure.time.text}発`,
    `乗車日時の計算結果：${fullLabel(r.departure.epoch)}`,`準備の目安：${r.prep}`,
    ...(r.arrival?[`到着予定：${fullLabel(r.arrival.epoch)}`]:[]),...(r.hotel?[`ホテルチェックイン予定：${fullLabel(r.hotel.epoch)}`]:[]),
    ...(r.gap!==null?[`ホテル予定は到着${r.gap<0?'より前':'から'} ${duration(r.gap)}${r.gap<0?'':'後'}`]:[]),...r.warnings,
    '予約元で乗車日・停留所・集合時刻・到着日を最終確認してください。運行会社の予約内容を保証するものではありません。'].join('\n');
}
export async function copyText(text, clipboard) {
  try { if(!clipboard?.writeText) return false; await clipboard.writeText(text); return true; } catch { return false; }
}
