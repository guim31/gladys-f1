# Jolpica-F1 answers

Real answers of [Jolpica-F1](https://github.com/jolpica/jolpica-f1), recorded on 15 October 2026 during
the 2026 season, minified, otherwise untouched (public data, nothing to anonymize):

| File                                | Request                                             |
| ----------------------------------- | --------------------------------------------------- |
| `schedule-2026.json`                | `/ergast/f1/2026.json?limit=100` (23 races)         |
| `results-2026-16.json`, `-17`       | `/ergast/f1/2026/<round>/results.json`              |
| `driverstandings-2026-16.json`, …   | `/ergast/f1/2026/<round>/driverstandings.json`      |
| `constructorstandings-2026-16.json` | `/ergast/f1/2026/<round>/constructorstandings.json` |

The integration requests the `current` / `current/last` forms of the same documents, which have the same
shape: `test/helpers/world.js` serves these files for them, "after round 16" or "after round 17".
Round 17 (Singapore) is a sprint weekend and has a retirement; round 18 (United States) is the next
Grand Prix on the recording day.
