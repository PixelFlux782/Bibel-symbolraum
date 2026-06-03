# Phase 13: The Living Codex

## 1. Unterschied zwischen Phase 13A und 13B

Phase 13A macht die einzelnen Buchstaben des vorhandenen Hebrew Codex
navigierbar. Aus einem Symbolraum fuehrt der Weg ueber das hebraeische Wort
in seine Buchstaben und von dort in das gemeinsame `LetterOverlay`.

```text
Symbolraum -> hebraeisches Wort -> Buchstabe -> Codex-Kontext
```

Phase 13B bringt dieselben Buchstaben in das bestehende Symbolnetz. Wenn zwei
verbundene Symbolraeume einen real gemeinsamen Codex-Buchstaben besitzen, wird
dieser Buchstabe als Letter Bridge sichtbar und kann als Netzfilter wirken.

```text
Symbolraum -> gemeinsamer Buchstabe -> verbundener Symbolraum
```

Kurz: 13A erschliesst den Buchstaben als lebenden Codex-Eintrag. 13B macht ihn
zu einer aktiven Bruecke zwischen vorhandenen Raeumen.

## 2. Was `LetterOverlay` leistet

`components/rooms/engine/LetterOverlay.tsx` ist die gemeinsame Projektion des
Hebrew Codex fuer Engine-Raeume und Symbolnetz. Es zeigt fuer einen gewaehlten
Buchstaben:

- Zeichen, Name, Transkription und Zahlenwert
- vorhandene Kurzdeutungen und archetypische Bedeutungen
- Meaning Fields und Resonanzen aus dem Meaning Graph
- hebraeische Woerter, in denen der Buchstabe erscheint
- bestehende Symbolraeume, die ueber diesen Buchstaben erreichbar sind

Wird das Overlay ueber eine Letter Bridge geoeffnet, zeigt es zusaetzlich den
konkreten Raumkontext, etwa:

```text
Dieser Buchstabe verbindet Licht und Feuer.
```

Das Overlay ist damit kein neues Lexikonfenster, sondern eine orientierende
Codex-Schicht: Buchstabe, Bedeutung, Woerter und Symbolraeume liegen in einer
zusammenhaengenden Bewegung.

## 3. Was Letter Bridges leisten

Letter Bridges werden in `buildSymbolMeaningNetwork()` aus bestehenden
Symbolnetz-Pfaden abgeleitet. Fuer einen Pfad wird ueber
`getSymbolHebrewProfile()` geprueft, ob beide Symbolraeume denselben
Codex-Buchstaben enthalten.

Nur reale gemeinsame Buchstaben werden ausgegeben. Pfade ohne gemeinsamen
Buchstaben erhalten keine kuenstliche Bridge.

Im Symbolnetz werden Letter Bridges bewusst sparsam sichtbar:

- bei Hover oder Fokus einer Verbindung
- bei einer aktiven Verbindung
- waehrend einer Bewegung entlang des Pfads
- wenn ein Buchstabe als Filter aktiv ist
- mobil als kompakte Spur im aufgeklappten Verbindungselement

Ein Klick auf eine Letter Bridge oeffnet das bestehende `LetterOverlay` mit
dem passenden Verbindungskontext.

## 4. Buchstaben als Filter und Bruecken

Buchstaben wirken jetzt doppelt:

- Als Filter: Ein aktiver Buchstabe hebt alle Symbolknoten hervor, deren
  hebraeisches Wort diesen Buchstaben enthaelt. Andere Knoten treten visuell
  zurueck.
- Als Bruecke: Derselbe Buchstabe markiert reale Verbindungen zwischen
  Symbolraeumen und macht sichtbar, warum eine Bewegung im Netz plausibel ist.

Der Buchstabe ist dadurch nicht nur Information ueber ein Wort. Er wird zu
einem Wegzeichen im Raum: Er zeigt, wo er erscheint, welche Raeume er verbindet
und welche Pfade dadurch lesbar werden.

## 5. Beispiele

### Aleph: Licht <-> Feuer

Licht / `אור` und Feuer / `אש` teilen Aleph / `א`.

```text
Licht
  ↕
Aleph / א
  ↕
Feuer
```

Aleph macht die Verbindung zwischen Licht und Feuer als gemeinsame Spur des
Ursprungs sichtbar. Das passt zu den vorhandenen Codex-Deutungen: Licht beginnt
mit Aleph als stillem Anfang; Feuer beginnt ebenfalls mit Aleph, bevor die
verwandelnde Kraft sichtbar wird.

### Mem: Wasser <-> Wueste <-> Brot

Wasser / `מים`, Wueste / `מדבר` und Brot / `לחם` teilen Mem / `מ` bzw. das
finale Mem / `ם`.

```text
Wasser
  ↕
Mem / מ
  ↕
Wueste
  ↕
Mem / ם
  ↕
Brot
```

In der aktiven Mem-Ansicht leuchten Wasser, Wueste und Brot. Wasser traegt Mem
als Tiefe und Ursprung, Wueste als Tiefe der Leere, Brot als verborgene
Innenseite der Gabe. Die vorhandenen Verbindungen bleiben sichtbar, waehrend
nicht passende Raeume zuruecktreten.

## 6. `MeaningTransitionScene` mit Buchstaben im Zentrum

Wird einer Verbindung mit Letter Bridge gefolgt, nutzt
`components/MeaningTransitionScene.tsx` den gemeinsamen Buchstaben als Zentrum
der Bewegung. Statt nur Meaning Nodes zwischen Start- und Zielsymbol zu zeigen,
kann die Szene den Buchstaben selbst in die Mitte setzen:

```text
Licht
  ↓
א / Aleph
  ↓
Feuer
```

Der begleitende Text wird aus vorhandenen Codex-Deutungen abgeleitet. Dadurch
zeigt die Transition nicht nur, dass ein Raumwechsel stattfindet, sondern
welcher Buchstabe diese Bewegung traegt.

## 7. Datenquellen

Phase 13 verwendet bestehende Daten und Projektionen:

- `lib/hebrew/hebrewLetters.ts`
- `lib/hebrew/hebrewWords.ts`
- `lib/hebrew/symbolHebrewMappings.ts`
- `lib/hebrew/getSymbolHebrewProfile.ts`
- `lib/meaning/buildSymbolMeaningNetwork.ts`
- `lib/meaning/meaningMappings.ts`
- Meaning Graph und bestehende Meaning Profiles
- bestehende Symbolraeume und Engine-Daten
- bestehende `HebrewLayer`- und `LetterOverlay`-Logik

Es wurden keine neuen Symbolraeume, Meaning Nodes oder frei erfundenen
Bedeutungsbeziehungen eingefuehrt.

## 8. Validierungsstatus

Phase 13A wurde mit folgenden Pruefungen dokumentiert:

- `npx eslint components/rooms/engine/LetterOverlay.tsx components/rooms/engine/HebrewLayer.tsx components/rooms/engine/SymbolEngineRoom.tsx`
- `npx tsc --noEmit`
- `git diff --check`
- `npm run build`

Phase 13B wurde mit folgenden Pruefungen dokumentiert:

- `npx eslint components/SymbolNetwork.tsx components/MeaningTransitionScene.tsx components/rooms/engine/LetterOverlay.tsx lib/meaning/buildSymbolMeaningNetwork.ts`
- `npx tsc --noEmit`
- `git diff --check`
- `npm run build`
- Browser-Test `/symbolnetz` Desktop mit Headless Chrome
- Browser-Test `/symbolnetz` Mobile mit Headless Chrome

Der dokumentierte Desktop-Test bestaetigt, dass Mem die passenden Raeume
Wasser, Wueste und Brot aktiviert und die zugehoerigen Verbindungen sichtbar
haelt. Der dokumentierte Mobile-Test bestaetigt, dass die kompakte Spur lesbar
bleibt und das Overlay innerhalb des Viewports liegt.

Build in diesem Schritt: optional und nicht erneut ausgefuehrt, da nur diese
Statusdokumentation geaendert wurde.

## 9. Warum dies den Hebrew Codex vom Lexikon zum lebenden Codex macht

Vor Phase 13 konnte der Hebrew Codex Buchstaben, Woerter und vorhandene
Deutungen bereitstellen. Nach Phase 13 werden diese Daten zu einer
erfahrbaren Navigation:

```text
Ein Buchstabe wird sichtbar.
Ein Buchstabe zeigt, wo er erscheint.
Ein Buchstabe filtert das Netz.
Ein Buchstabe verbindet Raeume.
Ein Buchstabe traegt den Uebergang.
```

Damit ist der Hebrew Codex nicht mehr nur ein Nachschlagewerk im Hintergrund.
Er wird zu einer lebenden Orientierungsschicht des Symbolraums: Buchstaben
erklaeren nicht nur Bedeutung, sie bewegen den Raum.
