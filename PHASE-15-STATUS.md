# Phase 15: Mein Pfad als Reise

## 1. Ziel

Phase 15 nimmt `Mein Pfad` bewusst weiter aus der Logbuch-Anmutung heraus.
Die Seite soll nicht wie eine Liste technischer Aktivitaeten wirken, sondern
wie eine persoenliche Reise im Symbolraum.

Die Grundrichtung lautet:

```text
Nicht: Meine Aktivitaeten
Sondern: Meine Reise im Symbolraum
```

Dabei wurden keine Tracking-Logik, keine Speicherstruktur und keine neue
Architektur eingefuehrt. Die Seite liest weiterhin nur die vorhandenen lokalen
Spuren aus:

- besuchte Raeume
- aktivierte Buchstaben
- gestartete Journeys
- gespeicherte Reflexionen

## 2. Sprachliche Feinjustierung

Der Seitentitel wurde von einer kartografischen Lesart zu einer
Reise-Lesart verschoben:

```text
Meine Reise im Symbolraum
```

Auch die Einleitung spricht nun von einer `Spur` statt von einer
Aktivitaetsuebersicht. Damit fuehlt sich `Mein Pfad` weniger wie ein technisches
Protokoll und staerker wie ein persoenlicher Bedeutungsweg an.

## 3. Raumtitel in der Chronik

Chronik-Eintraege fuer betretene Raeume wurden enttechnisiert.

Vorher:

```text
Wasser-Raum geoeffnet
```

Jetzt:

```text
Im Raum: Wasser
```

Die Formulierung bleibt konkret, wirkt aber weniger wie ein Systemereignis.

## 4. Chronik als Archiv

Die Reisechronik bleibt vorhanden, wird aber weiter zurueckgenommen:

- Umbenennung zu `Archiv der Reise`
- Anzeige-Button spricht von `Archiv anzeigen`
- kompaktere Abstaende
- schmalere Darstellung
- reduzierte visuelle Dominanz

Die Chronik ist damit weiterhin auffindbar, aber nicht mehr der Hauptinhalt
der Seite.

## 5. Sortierung der Chronik

Die Chronik ist jetzt als Archiv nach neuestem Eintrag zuerst sortiert.

Vorher:

```text
Aelteste Spur oben
Neueste Spur unten
```

Jetzt:

```text
Neueste Spur oben
Aeltere Spuren darunter
```

Das entspricht eher dem Archiv-Verhalten und macht aktuelle Reisebewegungen
schneller sichtbar.

## 6. Statischer Insight-Platzhalter

Ein neuer Abschnitt bereitet eine spaetere Insight-Ebene vor, ohne KI und ohne
generative Texte:

```text
Deine Spur deutet auf ...
```

Die Aussage wird ausschliesslich aus vorhandenen lokalen Daten
zusammengefasst:

- haeufigster aktivierter Buchstabe
- haeufigster besuchter Raum
- zuletzt gestartete Journey
- Anzahl gespeicherter Reflexionen

Beispielhafte Struktur:

```text
Deine Spur deutet auf Buchstabe: Mem, Raum: Wasser, Journey: ...
```

Wichtig: Dieser Abschnitt deutet nicht frei. Er zaehlt und benennt nur, was
bereits vorhanden ist.

## 7. Unveraendert geblieben

Nicht geaendert wurden:

- `localStorage`-Keys
- Parser fuer gespeicherte Pfadaktivitaeten
- Parser fuer Reflexionen
- Tracking-Funktionen in den Raeumen
- Datenmodell von `StoredPathActivity`
- Datenmodell von `StoredReflection`
- Meaning Network
- Hebrew Codex Daten

Phase 15 ist damit eine bewusste UX- und Sprachschicht auf vorhandenen Daten.

## 8. Validierung

Ausgefuehrt wurden:

- `npx eslint app/mein-pfad/page.tsx`
- `npm run build`

Beide Pruefungen liefen erfolgreich durch.

## 9. Ergebnis

`Mein Pfad` wirkt nun staerker wie:

```text
Meine Reise im Symbolraum
```

und weniger wie:

```text
Meine Aktivitaeten
```

Die Seite zeigt weiterhin dieselben gespeicherten Spuren, aber die Lesart hat
sich verschoben: von Protokoll zu Weg, von Ereignislisten zu persoenlicher
Symbolraum-Reise.
