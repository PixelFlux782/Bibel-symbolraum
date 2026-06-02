# Phase 13B: Letter Bridges

## 1. Ziel

Hebraeische Buchstaben werden im bestehenden Symbolnetz als aktive Bruecken
zwischen vorhandenen Symbolraeumen sichtbar. Die Ableitung bleibt im Hebrew
Codex und erzeugt keine neuen Raeume, Meaning Nodes oder Deutungen.

## 2. Datenbasierte Bridges

`buildSymbolMeaningNetwork()` leitet den gemeinsamen Buchstaben jedes
bestehenden Pfads weiterhin ueber `getSymbolHebrewProfile()` ab. Der Joint
traegt nun zusaetzlich die stabile Codex-ID des Buchstabens.

Sichtbar werden damit unter anderem:

- Aleph zwischen Licht und Feuer
- Mem zwischen Wasser und Wueste
- Mem zwischen Wasser und Brot
- Resh zwischen Licht und Wueste

Pfade ohne real gemeinsamen Codex-Buchstaben erhalten keine Letter Bridge.

## 3. Symbolnetz

Desktop zeigt den kleinen Brueckenbuchstaben nur an wachen, fokussierten oder
durch die Letter-Ansicht aktiven Verbindungen. Mobile zeigt denselben
Buchstaben als kompakte Spur im aufgeklappten Verbindungselement.

Ein Klick oeffnet das bestehende `LetterOverlay` mit Raumkontext. Solange ein
Buchstabe aktiv ist, leuchten alle passenden Symbolknoten; andere Knoten
treten zurueck und passende Pfade bleiben sichtbar.

## 4. Transition Scene

Wird einer Verbindung mit Letter Bridge gefolgt, zeigt
`MeaningTransitionScene` den gemeinsamen Buchstaben als Zentrum. Ein Kurztext
wird nur aus der vorhandenen Codex-Deutung abgeleitet.

## 5. Validierung

Ausgefuehrt wurden:

- `npx tsc --noEmit`
- `npx eslint components/SymbolNetwork.tsx components/MeaningTransitionScene.tsx components/rooms/engine/LetterOverlay.tsx lib/meaning/buildSymbolMeaningNetwork.ts`
- `git diff --check`
- `npm run build`
- Browser-Test `/symbolnetz` Desktop mit Headless Chrome
- Browser-Test `/symbolnetz` Mobile mit Headless Chrome
