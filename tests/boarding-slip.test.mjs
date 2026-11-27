import test from 'node:test';
import assert from 'node:assert/strict';
import {readSlip} from '../dist/boarding-slip.mjs';

test('three explicit notations resolve to the same New Year departure and prior evening meeting', () => {
  const choices = [['extended','2026-12-31','24:10'],['next','2026-12-31','0:10'],['calendar','2027-01-01','0:10']];
  for (const choice of choices) {
    const result = readSlip(...choice,'２０');
    assert.match(result,/2027年1月1日（金） 00:10/);
    assert.match(result,/集合　2026年12月31日（木） 23:50/);
  }
});
test('no assumption for unknown dates or missing lead; invalid combinations rejected', () => {
  assert.match(readSlip('unknown','','',''),/確定できません/);
  assert.match(readSlip('next','2028-02-28','01:00',''),/2月29日.*集合日時は未計算/);
  assert.throws(() => readSlip('extended','2026-12-31','00:10','0'));
  assert.throws(() => readSlip('next','2026-12-31','24:10','0'));
  assert.throws(() => readSlip('calendar','2026-02-29','00:10',''));
  assert.throws(() => readSlip('calendar','2026-12-31','00:10','-1'));
  assert.match(readSlip('calendar','2026-12-31','00:10','0'),/指定の0分前/);
});
