# Formel 1

Verfolge die Formel-1-Saison in Gladys: den nächsten Grand Prix mit allen Sessions in deiner Ortszeit, die
Spitzenreiter der Meisterschaft, den letzten Sieger und, wenn du willst, deinen Lieblingsfahrer und dein
Lieblingsteam. Ein Dashboard-Widget zeigt den Countdown, das Wochenende und die Wertung; Szenen-Auslöser
melden sich vor einer Session und wenn die Ergebnisse da sind; Szenen-Aktionen liefern dir fertige Sätze
zum Senden.

Die Daten kommen von [Jolpica-F1](https://github.com/jolpica/jolpica-f1), dem freien und kostenlosen
Nachfolger der Ergast-API. Kein Konto, kein Schlüssel. Rückmeldungen sind im Gladys-Forum willkommen.

## Was du brauchst

- Gladys 5.1.0 oder neuer.
- Internetzugang für Gladys: Die Integration liest `api.jolpi.ca`.

## Konfiguration

Speichere nach der Installation einmal die Konfiguration, öffne dann den Tab **Entdecken** und füge das
Gerät **Formel 1** hinzu. Die Schaltfläche **Prüfen** liest Jolpica-F1 neu und zeigt die Saison, den
nächsten Grand Prix und deine Favoriten so, wie die Integration sie verstanden hat.

### Sprache

Die Sprache der Funktionsnamen, der Session-Namen und der Sätze der Szenen (Gladys teilt einer Integration
die Sprache ihrer Benutzer nicht mit). Die Funktionsnamen werden beim Hinzufügen des Geräts festgelegt: Um
sie zu ändern, lösche das Gerät und füge es erneut hinzu. Das Widget folgt der Sprache der Person, die es
ansieht. Namen von Grands Prix, Strecken, Fahrern und Teams bleiben so, wie Jolpica-F1 sie schreibt, auf
Englisch.

### Lieblingsfahrer und Lieblingsteam

Optional. Der Fahrer: sein Kürzel aus drei Buchstaben (`VER`), seine Startnummer (`16`), sein Nachname
(`Hamilton`) oder sein vollständiger Name. Das Team: sein Name (`Ferrari`, `Red Bull`, `McLaren`). Groß-
und Kleinschreibung sowie Akzente spielen keine Rolle. Ist einer gesetzt, bekommt das Gerät drei weitere
Funktionen (Position in der Meisterschaft, Punkte, letztes Ergebnis) und das Widget eine Kachel mit der
Position. Ein Name, der zu niemandem der laufenden Saison passt, wird im Verbindungsstatus gemeldet, und
**Prüfen** listet die Fahrer und Teams der Saison auf. Klicke nach dem Ändern eines Favoriten im Tab
Entdecken auf **Aktualisieren**, wenn Gladys es anbietet.

## Das Gerät Formel 1

| Funktion                              | Wert                                                           |
| ------------------------------------- | -------------------------------------------------------------- |
| Nächster Grand Prix                   | sein Name; „Saison … beendet“ nach dem letzten Rennen          |
| Strecke, Land                         | wo er stattfindet                                              |
| Rennstart, Start des Qualifyings      | Tag und Uhrzeit, in der Zeitzone von Gladys                    |
| Start des Sprints                     | Tag und Uhrzeit, oder „Kein Sprint“                            |
| Nächste Session                       | die nächste Session des Wochenendes, oder das Rennen „läuft“   |
| Tage bis zum Rennen                   | 0 am Renntag                                                   |
| Lauf                                  | der Lauf des nächsten Grand Prix                               |
| Rennwochenende                        | An vom Tag des ersten Trainings bis zum Renntag                |
| Rennen heute                          | An am Renntag                                                  |
| Fahrer- / Konstrukteurs-Spitzenreiter | Name und Punkte                                                |
| Letzter Sieger, Letztes Podium        | des letzten Rennens mit veröffentlichten Ergebnissen           |
| Lieblingsfahrer: …                    | Position, Punkte, letzter Grand Prix (0: nicht gewertet)       |
| Lieblingsteam: …                      | Position, Punkte, bestes Auto im letzten Grand Prix (0: keins) |

Ein Grand Prix bleibt bis drei Stunden nach seinem Start der „nächste“. Die Werte werden von der
Integration selbst aktualisiert (Gladys fragt dieses Gerät nicht ab) und zweimal am Tag neu veröffentlicht.

## Dashboard-Widget

Füge das Widget **Formel 1** zu einem Dashboard hinzu. Es zeigt den Namen des nächsten Grand Prix, den Countdown
bis zum Rennen („10 T 5 h“, am Renntag dann Stunden und Minuten, dann „Läuft“), den Lauf, die Positionen
deiner Favoriten, die Sessions des Wochenendes in deiner Ortszeit (die nächste hervorgehoben), die Top 5
der Fahrer- oder Konstrukteurswertung (eine Einstellung des Widgets) und das Podium des letzten Rennens.

## Szenen-Auslöser

### Session beginnt

Löst vor einer Session eines Grand-Prix-Wochenendes aus. Wähle die Sessions (1. bis 3. Freies Training,
Sprint-Qualifying, Sprint, Qualifying, Rennen; leer: alle) und wann: beim Start oder 5, 15, 30 Minuten,
1 oder 2 Stunden vorher. Die Szene kann den Namen der Session, den Grand Prix, die Strecke, die Startzeit,
die verbleibenden Minuten und den Lauf lesen.

### Rennen beendet

Löst aus, wenn die Ergebnisse eines Grand Prix auf Jolpica-F1 veröffentlicht werden, meist einige Stunden
nach der Zielflagge (die Integration prüft nach dem Rennen alle 10 Minuten). Die Szene kann einen
zusammenfassenden Satz lesen („Max Verstappen (Red Bull) gewinnt den Singapore Grand Prix vor …“), den
Grand Prix, den Sieger und sein Team, das Podium, die Position deines Lieblingsfahrers und die beste
Position deines Lieblingsteams (0: nicht gewertet oder nicht gewählt).

## Szenen-Aktionen

- **Nächsten Grand Prix lesen**: ein Satz wie „Nächster Grand Prix: United States Grand Prix, Lauf 18,
  Circuit of the Americas, Austin (Vereinigte Staaten). Rennen am Sonntag, 25. Oktober um 21:00, in
  10 Tagen.“, dazu der Name, der Rennstart und die verbleibenden Tage (-1, wenn die Saison vorbei ist).
- **Wertung lesen**: die Spitze der Fahrer- oder Konstrukteurswertung (1 bis 10 Plätze) als Satz, dazu der
  Spitzenreiter und seine Punkte.

## Beispiele für Szenen

- **Nie wieder den Start verpassen**: Auslöser „Session beginnt“, Sessions Qualifying und Rennen,
  15 Minuten vorher → eine Nachricht mit Session, Grand Prix und Startzeit senden und den Fernseher
  einschalten.
- **Bilanz am Sonntagabend**: Auslöser „Rennen beendet“ → den zusammenfassenden Satz als Nachricht senden.
- **Briefing am Montagmorgen**: jeden Montag um 8:00 → „Nächsten Grand Prix lesen“ und „Wertung lesen“ →
  beide Sätze senden.
- **Rennstimmung**: Auslöser „Session beginnt“, Rennen, beim Start → das Licht im Wohnzimmer auf Rot
  stellen.

## Fehlerbehebung

- **Das Gerät zeigt nichts an**: Füge es im Tab Entdecken hinzu und warte eine Minute. Sieh dir den
  Verbindungsstatus der Integration an: Er sagt, wenn Jolpica-F1 nicht erreichbar ist.
- **„Lieblingsfahrer nicht gefunden“**: Nutze **Prüfen**, das die Fahrer und Teams der Saison mit ihren
  Kürzeln auflistet.
- **Ein Auslöser hat nicht ausgelöst**: Eine Session ohne angekündigte Uhrzeit löst nichts aus; ein
  Neustart von Gladys oder der Integration von mehr als 10 Minuten verliert die Auslöser dieser Zeit.
- **Die Ergebnisse kommen spät**: Jolpica-F1 wird von Freiwilligen betrieben; die Ergebnisse erscheinen
  meist innerhalb weniger Stunden, manchmal am nächsten Tag. Die Integration prüft nach einem Rennen
  48 Stunden lang weiter.

## Grenzen

- Kein Live-Timing: Jolpica-F1 liefert Kalender, Ergebnisse und Wertungen, nicht das Geschehen während
  einer Session. Rote Flaggen und Safety-Cars bräuchten Live-Daten, die OpenF1 während einer Session nur
  zahlenden Nutzern gibt: Dafür gibt es keinen Auslöser.
- Sprint-Ergebnisse werden nicht verfolgt, nur die Ergebnisse der Grands Prix.
- Die Abrufe sind verteilt, um die Grenzen von Jolpica-F1 einzuhalten (4 Anfragen pro Sekunde, 500 pro
  Stunde): der Kalender einmal am Tag, Ergebnisse und Wertungen alle 6 Stunden, und nach einem Rennen alle
  10 Minuten bis zu ihrer Veröffentlichung. Die Antworten werden im Datenordner der Integration
  zwischengespeichert: Gerät und Widget funktionieren weiter, wenn die API ausfällt.
- Die Namen (Grands Prix, Strecken, Fahrer, Teams) sind auf Englisch, so wie Jolpica-F1 sie veröffentlicht.

## Daten und Danksagungen

Kalender, Ergebnisse und Wertungen: [Jolpica-F1](https://github.com/jolpica/jolpica-f1) (Code unter
Apache 2.0, Daten gemäß den Bedingungen des Projekts). Diese Integration ist weder mit der Formel 1 noch
mit der FIA oder Jolpica-F1 verbunden. Formula 1 und F1 sind Marken der Formula One Licensing B.V.
