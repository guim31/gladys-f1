// -----------------------------------------------------------------------------
// Scene actions: sentences ready to send, in the language of the
// configuration, and their values.
// -----------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, fakeJolpica } from './helpers/world.js';

async function run(world, key, fields = {}) {
  const ack = await world.gladys.fake.sceneAction(key, fields);
  assert.equal(ack.success, true, ack.error);
  return ack.data.outputs;
}

test('"Read the next Grand Prix" in four languages', async (t) => {
  const expected = {
    en: 'Next Grand Prix: United States Grand Prix, round 18, Circuit of the Americas, Austin (United States). Race on Sunday, October 25 at 21:00, in 10 days.',
    fr: 'Prochain Grand Prix : United States Grand Prix, manche 18, Circuit of the Americas, Austin (États-Unis). Course dimanche 25 octobre à 21:00, dans 10 jours.',
    de: 'Nächster Grand Prix: United States Grand Prix, Lauf 18, Circuit of the Americas, Austin (Vereinigte Staaten). Rennen am Sonntag, 25. Oktober um 21:00, in 10 Tagen.',
    es: 'Próximo Gran Premio: United States Grand Prix, ronda 18, Circuit of the Americas, Austin (Estados Unidos). Carrera el domingo, 25 de octubre a las 21:00, dentro de 10 días.',
  };
  for (const [language, sentence] of Object.entries(expected)) {
    const world = await createWorld({ config: { language } });
    t.after(() => world.app.stop());
    const outputs = await run(world, 'read_next_grand_prix');
    assert.equal(outputs.sentence, sentence);
    assert.equal(outputs.grand_prix, 'United States Grand Prix');
    assert.equal(outputs.days_until_race, 10);
  }
});

test('race day, race running, season over, no data', async (t) => {
  const world = await createWorld({ at: '2026-10-24T22:30:00Z' });
  t.after(() => world.app.stop());
  // 00:30 in Paris on race day.
  assert.match(
    (await run(world, 'read_next_grand_prix')).sentence,
    /Course aujourd'hui à 21:00\.$/,
  );
  world.clock.set('2026-10-25T20:30:00Z');
  assert.equal(
    (await run(world, 'read_next_grand_prix')).sentence,
    'Le United States Grand Prix est en cours.',
  );
  world.clock.set('2026-12-20T10:00:00Z');
  const over = await run(world, 'read_next_grand_prix');
  assert.deepEqual(over, {
    sentence: 'La saison 2026 est terminée.',
    grand_prix: '',
    race_start: '',
    days_until_race: -1,
  });
  const empty = await createWorld({ api: fakeJolpica({ fail: true }) });
  t.after(() => empty.app.stop());
  assert.equal(
    (await run(empty, 'read_standings')).sentence,
    "Le championnat n'a pas encore commencé.",
  );
});

test('"Read the standings": drivers by default, constructors, count clamped', async (t) => {
  const world = await createWorld({ config: { language: 'en' } });
  t.after(() => world.app.stop());
  assert.deepEqual(await run(world, 'read_standings'), {
    sentence:
      "Drivers' championship after round 17: 1. Andrea Kimi Antonelli, 340 points; 2. George Russell, 238 points; 3. Lewis Hamilton, 229 points.",
    leader: 'Andrea Kimi Antonelli',
    leader_points: 340,
  });
  const teams = await run(world, 'read_standings', { championship: 'constructors', count: 1 });
  assert.equal(
    teams.sentence,
    "Constructors' championship after round 17: 1. Mercedes, 578 points.",
  );
  const many = await run(world, 'read_standings', { count: 50 });
  assert.equal(many.sentence.split('; ').length, 10);
});
