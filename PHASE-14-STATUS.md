# Phase 14: Generative Codex

## 1. Was Generative Codex bedeutet

Generative Codex bedeutet: Der Hebrew Codex ist nicht mehr nur eine erklaerende
Schicht ueber bestehenden Symbolraeumen. Ein Buchstabe kann nun selbst zum
Ursprung einer sichtbaren Bedeutungsbewegung werden.

Die neue Bewegungsrichtung lautet:

```text
Hebraeischer Buchstabe
  -> Meaning Fields und Meaning Nodes
  -> Symbol-Auspraegungen
  -> betretbare Symbolraeume
```

Der Codex "generiert" dabei keine freien Inhalte und erfindet keine neuen
Deutungen. Generativ heisst hier: Bereits vorhandene Codex-, Meaning- und
Symbolnetz-Daten werden aus der Perspektive eines Buchstabens neu
zusammengefuehrt. Der Nutzer sieht dadurch, welche Bedeutungsfelder und welche
Symbolraeume aus demselben Buchstaben hervortreten.

## 2. Unterschied zu Phase 13

Phase 13 machte Buchstaben als lebende Bruecken sichtbar:

```text
Symbolraum -> gemeinsamer Buchstabe -> verbundener Symbolraum
```

Ein Buchstabe erklaerte dort vor allem, warum zwei vorhandene Symbolraeume
zusammenhaengen. Letter Bridges waren an konkrete Pfade wie Wasser -> Wueste
oder Licht -> Feuer gebunden.

Phase 14 dreht die Blickrichtung:

```text
Buchstabe -> passende Meaning-Felder -> mehrere Symbolraeume
```

Der Buchstabe ist nicht mehr nur ein verbindendes Detail zwischen zwei Raeumen.
Er wird selbst zum Fokus. Aus ihm werden alle passenden Symbol-Auspraegungen im
Netz sichtbar, inklusive der zugehoerigen Meaning Nodes.

Kurz:

- Phase 13: Der Buchstabe verbindet Symbolraeume.
- Phase 14: Der Buchstabe bringt Symbolraeume hervor.

## 3. Wie Letter-Fokus funktioniert

Im Symbolnetz wird `activeLetterId` als eigener Fokuszustand gefuehrt. Sobald
ein Buchstabe aktiv ist, wird aus den bestehenden Hebrew-Profilen ermittelt,
welche Symbolknoten diesen Buchstaben enthalten.

Die Ableitung geschieht ueber:

- `hebrewLetters`
- `getSymbolHebrewProfile()`
- `buildSymbolMeaningNetwork()`
- die vorhandenen Symbol- und Meaning-Mappings

Aus dem aktiven Buchstaben entstehen drei Filtermengen:

- `letterSymbolIds`: alle Symbolraeume, deren hebraeisches Wort den Buchstaben
  enthaelt
- `letterSymbols`: die sichtbaren Symbolknoten dieser Menge
- `letterMeaningIds`: die Meaning Nodes, die mit diesen Symbolen verbunden sind

Das Symbolnetz reagiert darauf unmittelbar:

- passende Symbolknoten werden aktiv dargestellt
- passende Meaning Nodes bleiben wach
- nicht passende Knoten treten zurueck
- passende Pfade zwischen den aktivierten Symbolen werden hervorgehoben
- der normale Symbolfokus wird erst wieder dominant, wenn die Letter-Ansicht
  beendet wird

## 4. Wie Symbol-Emergence funktioniert

Symbol-Emergence beschreibt die sichtbare Auspraegung mehrerer Symbolraeume aus
einem aktiven Buchstaben.

Auf Desktop werden passende Symbolknoten nicht nur hervorgehoben, sondern in
eine eigene Emergence-Anordnung gebracht. Der aktive Buchstabe steht als
Zentrum im Feld; die passenden Symbole erscheinen als Auspraegungen um ihn
herum. Die Reihenfolge wird ueber `emergenceIndex` und feste
`letterEmergencePositions` gesteuert.

Auf Mobile ersetzt eine kompakte Letter-Emergence-Ansicht die grosse
Graph-Darstellung. Der Buchstabe steht oben als Ursprung, darunter erscheinen
die passenden Symbolraeume als antippbare Auspraegungen.

Wichtig: Diese Emergence ist eine Projektion vorhandener Daten. Sie erzeugt
keine neuen Symbolraeume, sondern zeigt vorhandene Raeume aus einer neuen
Richtung.

## 5. Was im `LetterOverlay` neu ist

`components/rooms/engine/LetterOverlay.tsx` zeigt weiterhin Zeichen, Name,
Transkription, Zahlenwert, Kurzdeutung, Meaning Fields, Woerter und
Symbolraeume.

Neu ist die generative Lesart im Abschnitt:

```text
Was entsteht aus diesem Buchstaben?
```

Dafuer baut das Overlay eine `emergenceSequence`:

```text
Meaning Nodes des Buchstabens
  + Symbolraeume, die den Buchstaben enthalten
```

Der Nutzer sieht dadurch nicht nur, wo der Buchstabe vorkommt. Er sieht eine
kleine Sequenz aus Bedeutungsfeldern und Symbolraeumen, die aus diesem
Buchstaben heraus lesbar werden.

Wenn das Overlay ueber eine Letter Bridge geoeffnet wird, bleibt ausserdem der
konkrete Brueckenkontext sichtbar. Wechselt der Nutzer im Overlay zu einem
anderen Buchstaben, wird der aktive Letter-Fokus im Symbolnetz synchronisiert.

## 6. `MeaningTransitionScene`: Buchstabe -> Symbol-Auspraegungen

`components/MeaningTransitionScene.tsx` kann jetzt fuer Letter Bridges eine
eigene Darstellung nutzen. Wenn `letterBridge` vorhanden ist, wird nicht mehr
der klassische Ablauf Symbol -> Meaning Nodes -> Symbol gezeigt.

Stattdessen steht der Buchstabe selbst am Anfang:

```text
Buchstabe
  -> Symbol-Auspraegung A
  -> Symbol-Auspraegung B
```

Die Szene rendert dazu:

- den gemeinsamen Buchstaben mit Glyph und Namen
- eine Gruppe emergierender Symbole
- pro Symbol das hebraeische Wort und das Label
- eine leichte zeitliche Staffelung ueber `animationDelay`
- den aus vorhandenen Codex-Daten abgeleiteten Letter-Text

Damit wird die Transition nicht nur als Wechsel zwischen zwei Symbolen
erlebbar. Sie zeigt, dass beide Symbolraeume Auspraegungen eines gemeinsamen
Buchstabens sein koennen.

## 7. Desktop/Mobile-Verhalten

Desktop:

- Die grosse ReactFlow-Konstellation bleibt die Hauptansicht.
- Bei aktivem Buchstaben erscheint ein zentrales Letter-Feld im Graph.
- Passende Symbolknoten werden in Emergence-Positionen um den Buchstaben
  angeordnet.
- Passende Pfade und Meaning-Verbindungen bleiben sichtbar.
- Die rechte Detailspalte wechselt auf `Letter-Ursprung` und zeigt:

```text
Was entsteht aus diesem Buchstaben?
Meaning Nodes -> Symbolraeume
```

Mobile:

- Die grosse Graph-Ansicht wird nicht verwendet.
- Bei normalem Zustand erscheinen die Symbolbuttons als kompakte Auswahl.
- Bei aktivem Buchstaben erscheint eine mobile Emergence-Ansicht:

```text
Buchstabe als Ursprung
  -> passende Symbolraeume
```

- Die passenden Symbolraeume sind direkt antippbar.
- Verbindungskarten bleiben kompakt und markieren passende Letter Bridges.
- Das LetterOverlay bleibt als Dialog innerhalb des mobilen Viewports nutzbar.

## 8. Validierungsstatus

Phase 14 ist in diesem Schritt als Statusdokumentation festgehalten.

Bereits dokumentierte Pruefungen aus Phase 13B:

- `npx tsc --noEmit`
- `npx eslint components/SymbolNetwork.tsx components/MeaningTransitionScene.tsx components/rooms/engine/LetterOverlay.tsx lib/meaning/buildSymbolMeaningNetwork.ts`
- `git diff --check`
- `npm run build`
- Browser-Test `/symbolnetz` Desktop mit Headless Chrome
- Browser-Test `/symbolnetz` Mobile mit Headless Chrome

Fuer diese Statusdatei wurden keine UI-Dateien, keine Datenmodelle und keine
Styles geaendert.

Build in diesem Schritt: optional und nicht ausgefuehrt.

## 9. Warum der Nutzer jetzt erleben kann: Buchstabe -> Meaning-Felder -> Symbolraeume

Der Nutzer kann jetzt eine echte dreistufige Bedeutungsbewegung erleben:

```text
Hebraeischer Buchstabe
  -> Meaning-Felder
  -> Symbolraeume
```

Der Buchstabe ist der Ausgangspunkt. Die Meaning-Felder zeigen, welche
archetypischen oder semantischen Raeume mit ihm verbunden sind. Die
Symbolraeume zeigen, wie diese Felder in Wasser, Licht, Feuer, Wueste, Brot
oder anderen vorhandenen Raeumen Gestalt annehmen.

Dadurch wird der Hebrew Codex zu einer generativen Orientierungsschicht:

- Buchstaben sind nicht nur Bestandteile von Woertern.
- Woerter sind nicht nur Labels fuer Symbolraeume.
- Meaning-Felder sind nicht nur Erklaertexte.
- Symbolraeume erscheinen als Auspraegungen tieferer Buchstaben- und
  Bedeutungsstrukturen.

Die erfahrbare Logik lautet jetzt:

```text
Ein Buchstabe wird fokussiert.
Seine Meaning-Felder werden sichtbar.
Aus diesen Feldern treten Symbolraeume hervor.
Der Nutzer kann von dort in den Raum eintreten.
```

Damit ist Phase 14 der Schritt vom Living Codex zum Generative Codex:
Buchstaben erklaeren den Symbolraum nicht nur. Sie lassen ihn sichtbar
entstehen.
