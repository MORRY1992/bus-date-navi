import {convert, normalize, parseTime, dateLabel, clockLabel} from './core.mjs';

export function readSlip(notation, date, time, lead) {
  if (notation === 'unknown') return '日時は確定できません。予約詳細で乗車停留所の日付と「翌日」の基準を照合し、不明なら予約元へ確認してください。';
  if (!['extended', 'next', 'calendar'].includes(notation)) throw new Error('まず予約票の書き方を選んでください。');
  const maxHour = notation === 'extended' ? 29 : 23;
  const {h} = parseTime(time, maxHour);
  if (notation === 'extended' && h < 24) throw new Error('24〜29時台の出発時刻を入力するか、予約票に合う書き方を選んでください。');
  const departure = convert(date, time, maxHour).epoch + (notation === 'next' ? 86400000 : 0);
  const stamp = epoch => dateLabel(epoch) + ' ' + clockLabel(epoch);
  let message = '乗車地点の出発　' + stamp(departure) + '（日本時間）。';
  const minutes = normalize(lead);
  if (!minutes) return message + ' 集合日時は未計算です。予約元の集合案内を確認してください。';
  if (!/^\d{1,3}$/.test(minutes)) throw new Error('集合までの分数は0〜999の整数で入力してください。指定がなければ空欄にしてください。');
  const meeting = departure - Number(minutes) * 60000;
  message += ' 集合　' + stamp(meeting) + '（指定の' + Number(minutes) + '分前）。';
  if (dateLabel(meeting) !== dateLabel(departure)) message += ' 集合と出発の日付が異なります。';
  return message;
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('slip-form');
  const field = id => document.getElementById(id);
  const result = field('slip-result');
  const notation = field('notation');
  const update = () => {
    result.textContent = '';
    field('slip-fields').disabled = notation.value === 'unknown';
    field('slip-date-label').textContent = ({
      extended: '24〜29時台の時刻が載っている日付',
      next: '「翌日」の基準となる運行日',
      calendar: '乗車する停留所に明記された暦日'
    })[notation.value] || '予約票に書かれた日付';
  };
  form.addEventListener('input', update);
  form.addEventListener('submit', event => {
    event.preventDefault();
    try { result.textContent = readSlip(notation.value, field('slip-date').value, field('slip-time').value, field('lead-minutes').value); }
    catch (error) { result.textContent = error.message; }
  });
  update();
  form.hidden = false;
}
