# Phase 12A: Living Codex

## 1. Ziel

Phase 12A macht die tiefste vorhandene Ebene innerhalb der bestehenden
Symbol-Engine sichtbar. Es entstehen keine neuen Raeume, Meaning Nodes oder
Datenmodelle.

Die Hebrew-Ebene zeigt nun als zusammenhaengende Bewegung:

```text
Symbol
-> hebraeisches Wort
-> Buchstaben
-> Bedeutungsfelder
-> Bibelstellen
-> verbundene Symbole
```

## 2. Datenquellen

Der Living Codex projiziert ausschliesslich vorhandene Daten:

- `getSymbolHebrewProfile(data)` liefert HebrewWord, Meaning Fields und
  Codex-Referenzen.
- `getMeaningProfile()` liefert vorhandene Meaning Nodes fuer Symbol und
  HebrewWord.
- `buildSymbolMeaningNetwork()` liefert die bereits kuratierten direkten
  Symbolverbindungen.
- Der aktive Engine-Zustand begrenzt Bedeutungsfelder und Bibelstellen auf
  die gegenwaertig lesbare Station.

## 3. Darstellung

`components/rooms/engine/HebrewLayer.tsx` bleibt die gemeinsame Hebrew-Ebene
aller vorhandenen Engine-Raeume. Innerhalb dieser Ebene fuehrt eine ruhige
vertikale Lichtspur durch die Bedeutungsschichten.

Die Buchstaben bleiben interaktiv. Beim Wechsel eines Buchstabens bleibt die
vorhandene Engine-Deutung sichtbar. Meaning Nodes erscheinen als cyanfarbene
Resonanzen neben den Hebrew Meaning Fields. Verbundene Symbole fuehren direkt
in die bereits vorhandenen Raeume.

## 4. Betroffene Raeume

Da die gemeinsame Engine-Komponente erweitert wurde, ist der Living Codex in
allen vorhandenen Engine-Raeumen sichtbar:

- Wasser
- Licht
- Feuer
- Wueste
- Brot

## 5. Validierung

Ausgefuehrt wurden:

- `npx eslint components/rooms/engine/HebrewLayer.tsx components/rooms/engine/SymbolEngineRoom.tsx`
- `npx tsc --noEmit`
- `git diff --check`
- `npm run build`

Alle Pruefungen waren erfolgreich. Unter Windows weist Git weiterhin darauf
hin, dass `LF` bei spaeteren Schreibvorgaengen durch `CRLF` ersetzt werden
kann. Das ist kein Whitespace-Fehler.
