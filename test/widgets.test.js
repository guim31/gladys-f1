// -----------------------------------------------------------------------------
// The "F1" widget: content within the core vocabulary and budget
// (validateWidgetContent of the SDK), localized by the language of the viewer.
// -----------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateWidgetContent } from '@gladysassistant/integration-sdk';
import { createWorld, fakeJolpica } from './helpers/world.js';

async function content(world, request) {
  const ack = await world.gladys.fake.widgetGet('f1', request);
  assert.equal(ack.success, true, ack.error);
  return ack.data.content;
}

const byType = (widget, type) => widget.components.filter((component) => component.type === type);

test('next Grand Prix, countdown, sessions, top 5 and podium, within budget, in four languages', async (t) => {
  const world = await createWorld({ config: { favorite_driver: 'HAM', favorite_team: 'Ferrari' } });
  t.after(() => world.app.stop());
  for (const language of ['en', 'fr', 'de', 'es']) {
    const widget = await content(world, { settings: {}, language, units: 'metric' });
    assert.deepEqual(validateWidgetContent(widget), [], language);
    assert.ok(widget.components.length <= 8, language);
    assert.ok(byType(widget, 'text').length <= 2, language);
  }
  const fr = await content(world, { settings: {}, language: 'fr' });
  assert.equal(byType(fr, 'text')[0].text, 'United States Grand Prix');
  assert.deepEqual(
    byType(fr, 'value').map((tile) => [tile.label, tile.value]),
    [
      ['Course dans', '10 j 10 h'],
      ['Manche', '18 / 23'],
      ['Hamilton', 'P3'],
      ['Ferrari', 'P2'],
    ],
  );
  const [status] = byType(fr, 'status');
  assert.deepEqual(status.items[0], {
    label: 'Essais libres 1',
    value: 'ven. 23 oct. · 19:30',
    color: 'primary',
  });
  assert.equal(status.items.length, 5);
  const [list] = byType(fr, 'card-list');
  assert.deepEqual(
    list.items.map((item) => [item.title, item.badge.text]),
    [
      ['1. Andrea Kimi Antonelli', '340 pts'],
      ['2. George Russell', '238 pts'],
      ['3. Lewis Hamilton', '229 pts'],
      ['4. Max Verstappen', '221 pts'],
      ['5. Charles Leclerc', '215 pts'],
    ],
  );
  assert.equal(
    byType(fr, 'text')[1].text,
    'Dernier GP, Singapore Grand Prix : 1. Max Verstappen · 2. Charles Leclerc · 3. Andrea Kimi Antonelli',
  );
  const teams = await content(world, {
    settings: { championship: 'constructors' },
    language: 'es',
  });
  assert.equal(byType(teams, 'card-list')[0].items[0].title, '1. Mercedes');
});

test('race day: hours and minutes, then "now"; the clock refreshes the widget', async (t) => {
  const world = await createWorld({ at: '2026-10-25T17:30:00Z' });
  t.after(() => world.app.stop());
  let widget = await content(world, { settings: {}, language: 'en' });
  assert.equal(byType(widget, 'value')[0].value, '2 h 30 min');
  const refreshes = world.gladys.fake.widgetRefreshes.length;
  await world.runUntil('2026-10-25T20:10:00Z');
  assert.ok(world.gladys.fake.widgetRefreshes.length > refreshes);
  widget = await content(world, { settings: {}, language: 'en' });
  assert.equal(byType(widget, 'value')[0].value, 'Now');
  assert.ok(byType(widget, 'status')[0].items.every((item) => item.color !== 'primary'));
});

test('season over, and before any data', async (t) => {
  const over = await createWorld({ at: '2026-12-20T10:00:00Z' });
  t.after(() => over.app.stop());
  const widget = await content(over, { settings: {}, language: 'de' });
  assert.deepEqual(validateWidgetContent(widget), []);
  assert.equal(byType(widget, 'text')[0].text, 'Saison 2026 beendet');
  assert.deepEqual(byType(widget, 'status'), []);

  const empty = await createWorld({ api: fakeJolpica({ fail: true }) });
  t.after(() => empty.app.stop());
  const nothing = await content(empty, { settings: {}, language: 'es' });
  assert.deepEqual(validateWidgetContent(nothing), []);
  assert.match(byType(nothing, 'text')[0].text, /aún no están disponibles/);
});
