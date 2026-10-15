# Formula 1 for Gladys Assistant

An external integration for [Gladys Assistant](https://gladysassistant.com) that follows the Formula 1
season: the next Grand Prix with every session in the local time of Gladys, the championship leaders,
the last winner and podium, and an optional favorite driver and team. Data from
[Jolpica-F1](https://github.com/jolpica/jolpica-f1), the open successor of the Ergast API: no account,
no key.

Feedback welcome on the [Gladys forum](https://community.gladysassistant.com).

## Features

- **A "Formula 1" device** for the dashboard and scene conditions: next Grand Prix, circuit, country,
  race / qualifying / sprint start, next session, days until the race, round, "race weekend" and "race
  today", drivers' and constructors' leaders with their points, last winner, last podium; with a
  favorite driver or team, their position, points and last result.
- **Dashboard widget "Formula 1"**: next Grand Prix with a countdown and the sessions of the weekend, the
  favorites' positions, the top 5 of the drivers' or constructors' championship, the last podium.
- **Scene triggers**: "Session starting" (practice, sprint qualifying, sprint, qualifying, race; at the
  start or 5 minutes to 2 hours before) and "Race finished" (winner, podium, favorites' positions, a
  summary sentence), fired once even across restarts.
- **Scene actions**: "Read the next Grand Prix" and "Read the standings", sentences ready to send.
- Texts in English, French, German and Spanish.

## Requirements

- Gladys Assistant 5.1.0 or later.
- Internet access from Gladys (`api.jolpi.ca`, HTTPS).

## Installation

1. In Gladys, open **Integrations → Install from GitHub** and enter
   `https://github.com/guim31/gladys-f1`.
2. In the **Configuration** tab, choose the language of the texts and, if you like, a favorite driver
   (`VER`, `16`, `Hamilton`) and team (`Ferrari`). Save.
3. In the **Discover** tab, add the Formula 1 device; add the **Formula 1** widget to a dashboard.

The full user documentation is in [English](docs/en.md), [French](docs/fr.md), [German](docs/de.md)
and [Spanish](docs/es.md).

## How it works

- Four documents of the current season are read from Jolpica-F1: the calendar (once a day), the last
  results and both standings (every 6 hours, and every 10 minutes from 90 minutes after a race start
  until they are published, 48 hours at most). Requests are spaced by 400 ms; the published anonymous
  limits are 4 requests per second and 500 per hour. A failure is retried after 10 minutes.
- The answers are kept in `/data/cache.json`: the device and the widget keep working when the API is
  down, and the connection status says so.
- The device is published with `should_poll: false`: a clock in the container ticks every minute,
  publishes the states that changed (all of them twice a day, so Gladys never shows them as outdated)
  and fires the scene triggers. "Session starting" carries the session and the lead time as filters;
  the last check is stored in `/data/triggers.json`, so a restart fires each trigger once and catches up
  10 minutes at most. "Race finished" fires when the results of a new race appear, for a race of the
  last three days only.
- Times are shown in the time zone Gladys gives the container (`TZ`).

## Limitations

- No live timing, hence no red-flag or safety-car trigger: OpenF1 gives live session data to paying
  users only (free 30 minutes after a session ends), and Jolpica-F1 has no live data.
- Grand Prix results only (sprint results are not followed).
- Names of Grands Prix, circuits, drivers and teams are in English, as Jolpica-F1 publishes them.
- Results arrive when Jolpica-F1's volunteers publish them: usually within a few hours.

## Development

Node.js 22+, ESM, no build step. One runtime dependency:
[`@gladysassistant/integration-sdk`](https://github.com/GladysAssistant/integration-sdk-js).

```bash
npm install
npm test              # node --test, against the SDK's fake Gladys; no network
npm run lint
npm run format:check
npx -y github:GladysAssistant/integration-store --skip-image-check .   # store validator
```

```
index.js              SDK wiring (src/app.js registers the handlers)
src/app.js            every SDK handler -> the service, the "Check" action
src/service.js        the clock: readings, cache, states, scene triggers, status
src/jolpica.js        Jolpica-F1 client and parsers
src/season.js         next race, next session, favorites, country names
src/device.js         the Formula 1 device and its states
src/widgets.js        "Formula 1" dashboard widget
src/scenes.js         "Read the next Grand Prix", "Read the standings"
src/i18n.js           every text of the code, in four languages
src/time.js           instants in the time zone of Gladys
src/config.js         DEFAULT_CONFIG (mirrors the manifest) + normalization
src/store.js          JSON files in /data
test/fixtures/        Gladys feature table, recorded answers of Jolpica-F1 (2026 season)
```

To run it outside Gladys:

```bash
GLADYS_HOST_API_URL="http://localhost:1443" \
GLADYS_INTEGRATION_TOKEN="<token>" \
GLADYS_INTEGRATION_SELECTOR="f1" \
F1_DATA_DIR=./data \
TZ=Europe/Paris \
npm start
```

Releases are made by the **Release** workflow (Actions → Release); never edit the versions by hand. See
[`CLAUDE.md`](CLAUDE.md) for the project rules.

## Credits

- [Jolpica-F1](https://github.com/jolpica/jolpica-f1) (Apache 2.0), which keeps the Ergast API alive,
  for the calendar, results and standings. The tests replay answers recorded from it during the 2026
  season.
- The idea comes from the Home Assistant community integration "F1 Sensor"; no code was taken from it.
- Started from the official
  [integration-template-js](https://github.com/GladysAssistant/integration-template-js).

## Disclaimer

This integration is not affiliated with, endorsed by or connected to Formula 1, the FIA or Jolpica-F1.
Formula 1 and F1 are trademarks of Formula One Licensing B.V.

## License

[Apache-2.0](LICENSE)
