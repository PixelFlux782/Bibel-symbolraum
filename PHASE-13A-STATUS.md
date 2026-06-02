# Phase 13A: The Living Letters

## 1. Ziel

Phase 13A macht die Buchstaben des vorhandenen Hebrew Codex navigierbar.
Es entstehen keine neuen Raeume, Meaning Nodes oder Datenmodelle.

Die sichtbare Tiefenbewegung lautet nun:

```text
Symbolraum
-> hebraeisches Wort
-> Buchstabe
-> Wo erscheint dieser Buchstabe?
```

## 2. Letter Overlay

Ein Klick auf einen Buchstaben im Living Codex oeffnet das gemeinsame Letter
Overlay. Der Zugang `Alle 22 Buchstaben erkunden` macht auch die noch nicht
mit dem aktuellen Symbolwort verbundenen Codex-Buchstaben erreichbar.

Fuer jeden Buchstaben zeigt das Overlay:

- Zeichen, Name, Transkription und Zahlenwert
- vorhandene Kurzdeutungen
- Meaning Fields und Meaning-Graph-Resonanzen
- verwandte Woerter
- verwandte Symbole

Woerter mit einem bestehenden Symbolraum und verwandte Symbole sind direkt
mit dem vorhandenen Raum verlinkt. Noch nicht kuratierte Codex-Buchstaben
bleiben sichtbar und werden als solche benannt; es werden keine neuen
Deutungen ergaenzt.

## 3. Datenquellen

Die Darstellung nutzt ausschliesslich vorhandene Daten:

- `lib/hebrew/hebrewLetters.ts`
- `lib/hebrew/hebrewWords.ts`
- `getSymbolHebrewProfile()`
- `getMeaningProfile()` aus dem Meaning Graph
- `buildSymbolMeaningNetwork()` fuer bestehende Raumlinks

## 4. Architektur

`components/rooms/engine/LetterOverlay.tsx` ist eine gemeinsame
UI-Projektion des Hebrew Codex. `HebrewLayer.tsx` bindet sie in alle
vorhandenen Engine-Raeume ein:

- Wasser
- Licht
- Feuer
- Wueste
- Brot

## 5. Validierung

Ausgefuehrt wurden:

- `npx eslint components/rooms/engine/LetterOverlay.tsx components/rooms/engine/HebrewLayer.tsx components/rooms/engine/SymbolEngineRoom.tsx`
- `npx tsc --noEmit`
- `git diff --check`
- `npm run build`
