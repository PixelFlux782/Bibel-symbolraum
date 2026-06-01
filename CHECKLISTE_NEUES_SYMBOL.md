# Checkliste: Neues Symbol

## Benoetigte Daten

- [ ] Ordner `components/rooms/<symbol>/` und Datei `<symbol>EngineData.ts` anlegen.
- [ ] `id`, `slug`, `title` und `symbolLabel` festlegen.
- [ ] IDs innerhalb des Objekts eindeutig und stabil halten.
- [ ] Reihenfolge der `states` als Dramaturgie der Reise pruefen.

## Benoetigte Bilder

- [ ] Pro Station ein dominantes Bild unter `public/Visuals/` ablegen.
- [ ] Optional pro Station ein dezentes `backgroundImage` ergaenzen.
- [ ] Fuer jedes Bild einen beschreibenden Alternativtext formulieren.

## Hebraeische Wortstruktur

- [ ] Wort, Transliteration, Uebersetzung und kurze Gesamtdeutung eintragen.
- [ ] Buchstaben mit `id`, Zeichen, Name, Position, Bedeutung und Detail anlegen.
- [ ] Pro Station mindestens eine gueltige Buchstaben-ID referenzieren.

## Biblische Szenen

- [ ] Kuratierte Szenen mit ID, Bibelstelle, Titel, Kurztext und Bedeutung anlegen.
- [ ] Pro Station nur die dramaturgisch passenden Szenen per ID referenzieren.

## Symbolverbindungen

- [ ] Verbindungen mit ID, Label, Relation und Detail anlegen.
- [ ] Pro Station nur passende Verbindungen per ID aktivieren.

## Reflexionsfragen

- [ ] Pro Station genau eine kurze Reflexionsfrage formulieren.
- [ ] Haupttext auf einen knappen Absatz mit idealerweise zwei bis drei Saetzen begrenzen.

## VisualStates

- [ ] Pro Station `image`, `alt`, `atmosphere` und `veilOpacity` setzen.
- [ ] Fuer jedes Atmosphaerenprofil `id`, `mood`, `motion`, `light` und `density` festlegen.
- [ ] `density`, `veilOpacity` und optional `imageOpacity` im Bereich `0` bis `1` halten.

## Build/Lint-Pruefung

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Desktop und Mobile pruefen: alle Stationen, drei Bedeutungsebenen, Rueckwaerts-Navigation und Neustart.
