# Formula 1

Follow the Formula 1 season in Gladys: the next Grand Prix with every session in your local time, the
championship leaders, the last winner and, if you like, your favorite driver and team. A dashboard widget
shows the countdown, the weekend and the standings; scene triggers warn you before a session and when the
results are out; scene actions give you sentences ready to send.

The data comes from [Jolpica-F1](https://github.com/jolpica/jolpica-f1), the free and open successor of the
Ergast API. No account, no key. Feedback welcome on the Gladys forum.

## What you need

- Gladys 5.1.0 or later.
- Internet access from Gladys: the integration reads `api.jolpi.ca`.

## Configuration

After installing, save the configuration once, then open the **Discover** tab and add the **Formula 1**
device. The **Check** button reads Jolpica-F1 again and shows the season, the next Grand Prix and your
favorites as the integration understood them.

### Language

The language of the feature names, of the session names and of the sentences of the scenes (Gladys does
not tell an integration the language of its users). Feature names are set when the device is added: to
change them, delete the device and add it again. The widget follows the language of the person looking
at it. Grand Prix, circuit, driver and team names stay as Jolpica-F1 writes them, in English.

### Favorite driver and team

Optional. The driver: their three-letter code (`VER`), car number (`16`), family name (`Hamilton`) or
full name. The team: its name (`Ferrari`, `Red Bull`, `McLaren`). Case and accents do not matter. When
one is set, the device gets three more features (position in the championship, points, last result), and
the widget a tile with the position. A name that matches nobody of the current season is reported in the
connection status, and **Check** lists the drivers and teams of the season. After changing a favorite,
click **Update** on the device in the Discover tab when Gladys offers it.

## The Formula 1 device

| Feature                         | Value                                                       |
| ------------------------------- | ----------------------------------------------------------- |
| Next Grand Prix                 | its name; "Season … over" after the last race               |
| Circuit, Country                | where it takes place                                        |
| Race start, Qualifying start    | day and time, in the time zone of Gladys                    |
| Sprint start                    | day and time, or "No sprint"                                |
| Next session                    | the next session of the weekend, or the race "now"          |
| Days until the race             | 0 on race day                                               |
| Round                           | the round of the next Grand Prix                            |
| Race weekend                    | On from the day of the first practice to race day           |
| Race today                      | On on race day                                              |
| Drivers' / Constructors' leader | name and points                                             |
| Last winner, Last podium        | of the last race whose results are published                |
| Favorite driver: …              | position, points, last Grand Prix (0: not classified)       |
| Favorite team: …                | position, points, best car in the last Grand Prix (0: none) |

A Grand Prix stays "next" until three hours after its start. The values are refreshed by the integration
itself (Gladys does not poll this device), and published again twice a day.

## Dashboard widget

Add the **Formula 1** widget to a dashboard. It shows the name of the next Grand Prix, the countdown to the race
("10 d 5 h", then hours and minutes on race day, then "Now"), the round, your favorites' positions, the
sessions of the weekend in your local time (the next one highlighted), the top 5 of the drivers' or
constructors' championship (a setting of the widget), and the podium of the last race.

## Scene triggers

### Session starting

Fires before a session of a Grand Prix weekend. Choose the sessions (practice 1 to 3, sprint qualifying,
sprint, qualifying, race; empty: every session) and when: at the start, or 5, 15, 30 minutes, 1 or
2 hours before. The scene can read the session name, the Grand Prix, the circuit, the start time, the
minutes left and the round.

### Race finished

Fires when the results of a Grand Prix are published on Jolpica-F1, usually within a few hours of the
chequered flag (the integration checks every 10 minutes after the race). The scene can read a summary
sentence ("Max Verstappen (Red Bull) wins the Singapore Grand Prix, ahead of …"), the Grand Prix, the
winner and their team, the podium, the position of your favorite driver and the best position of your
favorite team (0: not classified or not chosen).

## Scene actions

- **Read the next Grand Prix**: a sentence such as "Next Grand Prix: United States Grand Prix, round 18,
  Circuit of the Americas, Austin (United States). Race on Sunday, October 25 at 21:00, in 10 days.",
  plus the name, the race start and the days left (-1 when the season is over).
- **Read the standings**: the top of the drivers' or constructors' championship (1 to 10 positions), as a
  sentence, plus the leader and their points.

## Scene examples

- **Never miss the start**: trigger "Session starting", sessions Qualifying and Race, 15 minutes before →
  send a message with the Session, the Grand Prix and the Start time, and turn on the TV.
- **Sunday evening report**: trigger "Race finished" → send the summary sentence by message.
- **Monday morning briefing**: every Monday at 8:00 → "Read the next Grand Prix" and "Read the
  standings" → send both sentences.
- **Race lights**: trigger "Session starting", Race, at the start → set the living room lights to red.

## Troubleshooting

- **The device shows nothing**: add it from the Discover tab, then wait a minute. Check the connection
  status of the integration: it says when Jolpica-F1 cannot be reached.
- **"Favorite driver not found"**: use **Check**, which lists the drivers and teams of the season with
  their codes.
- **A trigger did not fire**: a session whose time is not announced yet fires nothing; a trigger missed
  while Gladys or the integration is unavailable is sent late for 10 minutes at most, then lost. Right
  after the installation, nothing is caught up.
- **The results come late**: Jolpica-F1 is maintained by volunteers; results are usually published within
  a few hours, sometimes the next day. The integration keeps checking for 48 hours after a race.

## Limits

- No live timing: Jolpica-F1 has calendars, results and standings, not what happens during a session.
  Red flags and safety cars would need live data, which OpenF1 only gives to paying users during a
  session: there is no trigger for them.
- Sprint results are not followed, only Grand Prix results.
- Readings are spaced to respect the limits of Jolpica-F1 (4 requests per second, 500 per hour): the
  calendar once a day, results and standings every 6 hours, and every 10 minutes after a race until they
  are published. The answers are kept in a cache in the integration's data folder: the device and the
  widget keep working when the API is down.
- Names (Grand Prix, circuits, drivers, teams) are in English, as Jolpica-F1 publishes them.
- After the last race of the season, "Next Grand Prix" and "Next session" say the season is over, while
  the other features of the next race keep the values of the last Grand Prix until the next calendar.
- A session whose time is not announced yet is placed at noon UTC: far from Europe, its day may be off
  by one until the time is published.

## Data and credits

Calendar, results and standings: [Jolpica-F1](https://github.com/jolpica/jolpica-f1) (Apache 2.0 code,
data under the terms of the project). This integration is not affiliated with Formula 1, the FIA or
Jolpica-F1. Formula 1 and F1 are trademarks of Formula One Licensing B.V.
