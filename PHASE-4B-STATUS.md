# Phase 4B: Symbolnetz als Bedeutungsnetz

## Phase 1: Bestehender Stand vor der Aenderung

Das bisher sichtbare Symbolnetz wurde in `components/SymbolNetwork.tsx` aus
`waterSymbolGraph` in `lib/symbolism.ts` aufgebaut.

### Aktuelle Knoten

Der alte View enthielt `water`, `mayim`, `mem`, `yod`, `sea`, `well`,
`spring`, `baptism`, `spirit`, `desert`, `rock`, `light`, `genesis-1-2` und
`exodus-14`.

### Aktuelle Verbindungen

Die alten Kanten waren direkt im wasserzentrierten Graphen eingetragen. Sie
verbanden Wasser unter anderem mit Majim, Meer, Brunnen, Quelle, Taufe, Geist,
Wueste, Fels, Licht und den beiden Bibelstellen.

### Aktuelle Navigation

- Klick auf einen Knoten: Fokus und Detailpanel wechseln.
- Klick auf einen verbundenen Eintrag: Fokus springt zum Zielknoten.
- `Raum betreten`: vorhandenen Raum oeffnen, falls ein `roomHref` existiert.
- Der alte `Bibelpfad` kam aus statischen `primaryPaths` des Wasser-Graphen.

## Umsetzung

`lib/meaning/buildSymbolMeaningNetwork.ts` baut den neuen sichtbaren View als
reine Ableitung. Die Seite legt keine neue Engine und keinen neuen Datensilo an.

| Sichtbare Information | Quelle |
| --- | --- |
| Wasser, Licht, Feuer und Kurzdeutung | Meaning Graph |
| Abgedunkelte oder hervorgehobene Bedeutungs-Satelliten | Meaning Nodes der aktiven Symbol-Mappings |
| Hebraeische Woerter | Hebrew Codex |
| Gemeinsames Aleph von `אור` und `אש` | Hebrew Codex |
| Raumziele | vorhandene Symbol-Engine-Routen |
| Schoepfung: Wasser -> Licht | Meaning Graph plus Genesis-Referenzen des Hebrew Codex |
| Reinigung: Wasser -> Feuer | gemeinsamer Meaning Node `purification` |
| Offenbarung: Feuer -> Licht | Meaning Graph plus gemeinsame Exodus-Referenz des Hebrew Codex |

## Navigation

- Symbol fokussieren: direkte Verbindungen hervorheben, andere Knoten
  abdunkeln.
- Verbindung folgen: kurzen Bedeutungsweg im Overlay anzeigen.
- Raum oeffnen: getrennte CTA fuer den aktiven Symbolraum.

Damit bleiben Raum-Navigation und Bedeutungsweg strukturell getrennt, ohne
komplexe Animation.

## Validierungsregel

Neue sichtbare Aussagen werden aus Meaning Graph, Hebrew Codex oder Symbol
Engine abgeleitet. Die UI darf Bedeutungen nicht als zweiten Inhaltsbestand
duplizieren.

## Pruefstand

- `validateMeaningGraph()`: keine Fehler, keine Warnungen
- `validateHebrewCodex()`: keine Fehler
- `validateSymbolEngineData()`: Wasser, Licht und Feuer ohne Fehler
- `npm run build`: erfolgreich
