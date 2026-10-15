# Changelog

All notable changes to this integration are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
uses [semantic versioning](https://semver.org/).

Describe each change under `## [Unreleased]` as you make it. The Release
workflow moves that section under the version it ships, and the section becomes
the notes of the version's GitHub Release.

## [Unreleased]

## [1.0.0] - 2026-10-15

### Added

- A "Formula 1" device for the dashboard and scene conditions: next Grand Prix, circuit and country,
  race, qualifying and sprint start in the time zone of Gladys, next session, days until the race,
  round, race weekend and race today, drivers' and constructors' leaders with their points, last
  winner and last podium.
- Optional favorite driver and team (code, number or name): position in the championship, points and
  last result.
- Dashboard widget "Formula 1": next Grand Prix with its countdown and the sessions of the weekend, favorites'
  positions, top 5 of the drivers' or constructors' championship, podium of the last race.
- Scene triggers "Session starting" (practice, sprint qualifying, sprint, qualifying or race, from
  2 hours before to the start) and "Race finished" (winner, podium, favorites' positions, a summary
  sentence).
- Scene actions "Read the next Grand Prix" and "Read the standings": sentences ready to send.
- A "Check" button on the Configuration screen.
- Data from Jolpica-F1, with a cache in `/data`: no account, a few requests a day.
- Texts and documentation in English, French, German and Spanish.

[Unreleased]: https://github.com/guim31/gladys-f1/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/guim31/gladys-f1/releases/tag/v1.0.0
