import test from 'node:test';
import assert from 'node:assert/strict';

test('native date editing preserves focus and partial input while invalidating all old results', async t => {
  const nodes = new Map();
  let focused;
  const el = id => {
    if (!nodes.has(id)) {
      let value = '';
      nodes.set(id, {
        id, hidden: false, writes: 0, handlers: {},
        get value() { return value; },
        set value(next) { value = next; this.writes++; },
        addEventListener(type, handler) { (this.handlers[type] ??= []).push(handler); },
        async fire(type) {
          const event = {target: this, preventDefault() {}};
          for (const handler of this.handlers[type] || []) await handler(event);
          if (type === 'input' && id !== 'check-form') {
            for (const handler of el('check-form').handlers.input || []) await handler(event);
          }
        },
        setAttribute(key, next) { this[key] = next; },
        removeAttribute(key) { delete this[key]; },
        replaceChildren() {}, focus() { focused = id; }, select() {},
        closest() { return {open: false}; }
      });
    }
    return nodes.get(id);
  };
  globalThis.document = {getElementById: el, createElement: () => ({textContent: ''})};
  try {
    await import('../dist/app.mjs?native-picker-regression');
    for (const id of ['departureDate', 'arrivalDate', 'hotelDate']) {
      await t.test(id, async () => {
        el('departureDate').value = '2026/11/07';
        el('departureTime').value = '24:20';
        el('arrivalDate').value = '2026/11/08';
        el('arrivalTime').value = '07:00';
        el('hotelDate').value = '2026/11/08';
        el('hotelTime').value = '15:00';
        await el('check-form').fire('submit');
        await el('show-memo').fire('click');
        const oldURL = el('calendar-save').href;
        assert.equal(el('result').hidden, false);
        assert.equal(el('copy-fallback').hidden, false);

        const picker = el(id + '-picker');
        picker.focus();
        picker.value = '2026-11-09';
        picker.writes = 0;
        await picker.fire('input');
        assert.equal(el(id).value, '2026-11-09');
        assert.equal(focused, picker.id, 'must not move focus out of the native editor');
        assert.equal(picker.writes, 0, 'must not reset the current native date segment');
        assert.equal(el('result').hidden, true);
        assert.equal(el('empty-result').hidden, false);
        assert.equal(el('copy-fallback').hidden, true);
        assert.equal(el('calendar-save').hidden, true);
        assert.equal(el('calendar-save').href, undefined);
        await assert.rejects(fetch(oldURL), /fetch failed/);

        // Native date inputs expose an empty value while a date is only partly typed.
        picker.value = '';
        picker.writes = 0;
        await picker.fire('input');
        assert.equal(el(id).value, '');
        assert.equal(focused, picker.id);
        assert.equal(picker.writes, 0, 'must not erase an unfinished native date');
      });
    }
    await t.test('shortcut buttons still focus the text field and synchronize its picker', async () => {
      await el('use-tomorrow').fire('click');
      assert.equal(focused, 'departureDate');
      assert.equal(el('departureDate-picker').value, el('departureDate').value);
    });
  } finally {
    await el('check-form').fire('input');
    delete globalThis.document;
  }
});
