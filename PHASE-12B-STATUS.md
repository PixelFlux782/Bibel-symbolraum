# Phase 12B: Symbolnetz UX-Reparatur

## 1. Ziel

Phase 12B veraendert ausschliesslich Wahrnehmung und Tempo im bestehenden
Symbolnetz. Hebrew Codex, Meaning Graph, Symbol Engine, Journey Awareness,
Raeume und Meaning Nodes bleiben unveraendert.

## 2. Aleph als Ereignis

Die permanent sichtbaren Aleph-Fragmente wurden aus Desktop- und
Mobile-Ansicht entfernt.

Ein gemeinsamer Buchstabe erscheint nur noch innerhalb einer aktiv
fokussierten Verbindung. Der Bezug wird immer ausgeschrieben:

```text
Gemeinsames Aleph von Feuer und Licht
```

Beim Fokuswechsel auf ein anderes Symbol oder eine Journey verschwindet der
Hinweis wieder.

## 3. Nutzerbestimmtes Tempo

`JourneyGate` und `MeaningTransitionScene` besitzen keine zeitgesteuerte
Weiterleitung und keine automatische Ausblendung mehr.

Beide Schwellen warten auf die bewusste Aktion:

```text
Weiter
```

Direkte Verbindungen folgen damit dem Ablauf:

```text
Verbindung fokussieren
-> Bedeutung lesen
-> Verbindung folgen
-> Bedeutungsbewegung lesen
-> Weiter
-> Fokus wechseln
```

## 4. Reihenfolge

Die Living Map ist nun die primaere Buehne. Meaning Journeys stehen unterhalb
der Karte und der mobilen Verbindungskarten:

```text
Living Map
-> aktive Verbindung und Hinweise
-> Meaning Journeys
```

## 5. Validierung

Ausgefuehrt wurden:

- `npx eslint components/SymbolNetwork.tsx components/MeaningBridge.tsx components/JourneyGate.tsx components/MeaningTransitionScene.tsx`
- `npx tsc --noEmit`
- `git diff --check`
- `npm run build`
- Headless-Chrome-Browsertest fuer Desktop und Mobile

Der Browsertest bestaetigt:

- Desktop zeigt beim Einstieg kein stehendes Aleph.
- Feuer zu Licht zeigt das gemeinsame Aleph mit eindeutigem Kontext.
- Ein Fokuswechsel entfernt den Aleph-Hinweis.
- Journey Gate und Transition Scene bleiben ohne Klick bestehen.
- Mobile zeigt Verbindungskarten vor Meaning Journeys.
- Mobile zeigt Aleph erst nach Fokus der Feuer-Licht-Verbindung.
