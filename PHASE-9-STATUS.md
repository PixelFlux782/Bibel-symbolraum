# Phase 9A: Narrative Journey Gate

## 1. Was ist `JourneyGate`?

`JourneyGate` ist eine kurze Bedeutungsschwelle vor einem bestehenden
Uebergang im Symbolnetz. Die Komponente zeigt fuer einen begrenzten Moment:

- den Titel des Uebergangs oder der Meaning Journey,
- vorhandenen Bridge Text und Journey Text,
- das hebraeische Wort des Zielsymbols,
- eine ueberspringbare Aktion.

Die Schwelle ist keine neue Raum- oder Journey-Architektur. Sie ist eine
schmale UI-Schicht vor den bereits vorhandenen Aktionen im Symbolnetz.

Die Standarddauer betraegt `2200 ms`. Bei aktivierter Einstellung
`prefers-reduced-motion: reduce` wird sie auf `700 ms` verkuerzt.

## 2. Warum sind Verbindungen jetzt Bedeutungsschwellen?

Vor Phase 9A wurde eine ausgewaehlte Verbindung im `MeaningBridge` erklaert.
Mit `Verbindung folgen` wechselte der Fokus danach unmittelbar zum verbundenen
Symbol.

Jetzt liegt zwischen Erklaerung und Fokuswechsel eine kurze Schwelle. Sie macht
noch einmal sichtbar, warum der naechste Schritt sinnvoll ist:

```text
Symbol A -> Symbol B
Bridge Text
Journey Text
hebraeisches Wort des Zielsymbols
```

Der Uebergang bleibt technisch derselbe. Seine Bedeutung wird jedoch vor dem
Vollzug noch einmal lesbar und erfahrbar.

## 3. Drei unterschiedliche Aktionen

| Aktion | Bedeutung | Verhalten nach Phase 9A |
| --- | --- | --- |
| `Verbindung folgen` | Einer ausgewaehlten Beziehung zwischen zwei Symbolen folgen. | Zeigt `JourneyGate` und setzt danach wie bisher den Fokus im Symbolnetz auf das verbundene Symbol. Es findet kein Routing statt. |
| `Reise beginnen` | Eine vorhandene Meaning Journey vom ersten Symbol aus betreten. | Zeigt `JourneyGate` und startet danach wie bisher die vorhandene Raum-Transition zum ersten Raum der Journey. |
| `Raum oeffnen` | Den aktuell fokussierten Symbolraum direkt betreten. | Bleibt unveraendert: Die vorhandene `RoomTransitionButton`-Navigation oeffnet den Raum direkt. Es wird bewusst kein `JourneyGate` vorgeschaltet. |

Damit bleibt der Unterschied zwischen Netz-Erkundung, narrativem Reisebeginn
und direktem Raumzugang sichtbar.

## 4. Genutzte Datenquellen

`JourneyGate` erfindet keine eigenen Inhalte. Die angezeigten Werte kommen aus
den bereits vorhandenen Datenprojektionen des Symbolnetzes:

| Angezeigter Inhalt | Bestehende Quelle |
| --- | --- |
| Titel einer Verbindung | `SymbolMeaningPath` aus `lib/meaning/buildSymbolMeaningNetwork.ts` |
| Bridge Text einer Verbindung | `SymbolMeaningPath.bridgeDescription`, aufgebaut aus `lib/meaning/meaningRelations.ts` |
| Ergaenzender Verbindungstext | `SymbolMeaningPath.summary`, aufgebaut aus Meaning Relations oder vorhandenen Hebrew Meaning Fields |
| Titel einer Reise | `MeaningJourney.title` aus `lib/meaning/meaningJourneys.ts` |
| Journey Text | `MeaningJourney.description` aus `lib/meaning/meaningJourneys.ts` |
| Hebraeisches Zielwort | `SymbolMeaningNetworkNode.hebrew`, aufgeloest ueber `getSymbolHebrewProfile()` und die vorhandenen Hebrew Profiles |
| Zielraum einer Reise | `SymbolMeaningJourney.firstRoomHref` aus dem bestehenden Symbolnetz |

Die vorhandene Journey-Context-Schicht mit `getJourneyContext()` und
`journeyEntryTargets.ts` bleibt unveraendert. Phase 9A fuegt keine neue
Routing-Logik und keine neuen Query-Parameter hinzu.

## 5. Warum wurden keine Texte dupliziert?

`JourneyGate` erhaelt nur bereits aufgeloeste Texte als Props. Die Komponente
enthaelt keine eigenen narrativen Saetze fuer einzelne Symbole, Verbindungen
oder Journeys.

Dadurch bleibt jede Bedeutung an ihrer bestehenden fachlichen Quelle:

- Relationsbeschreibungen bleiben in `meaningRelations.ts`.
- Journey-Beschreibungen bleiben in `meaningJourneys.ts`.
- Hebraeische Woerter bleiben in den Hebrew Profiles.
- Die vorhandene Netzprojektion fuehrt diese Daten fuer die UI zusammen.

Neue Texte muessen deshalb weiterhin nur an einer Stelle gepflegt werden.

## 6. Mobile-Verhalten

Auf mobilen Geraeten wird dieselbe Schwelle verwendet. Es gibt kein separates
Mobile-System.

Die Darstellung ist kompakter:

- geringere Innenabstaende,
- kleinere hebraeische Schrift,
- kleinere Titel- und Textgroessen,
- kuerzerer Abstand zur Ueberspringen-Aktion.

Die Vollflaechenwirkung, die dunkle Gestaltung, der Goldton und die
Ueberspringbarkeit bleiben erhalten.

## 7. Validierungsstatus

Fuer die Phase-9A-Implementierung wurden ausgefuehrt:

- `npm run build`: erfolgreich
- `npx eslint components/JourneyGate.tsx components/SymbolNetwork.tsx`: erfolgreich
- `git diff --check`: keine Whitespace-Fehler

Der vollstaendige Lauf `npm run lint` bleibt durch bereits vorhandene
`react-hooks/set-state-in-effect`-Treffer in anderen Dateien fehlerhaft. Die
neue `JourneyGate`-Komponente und ihre Einbindung erzeugen keine zusaetzlichen
Lint-Fehler.

Fuer diese Dokumentationsaufgabe wurde kein weiterer Build ausgefuehrt. Es
wurden keine UI-Dateien geaendert.

## 8. Was als naechstes geprueft werden sollte

Als naechster Schritt sollte die Schwelle im Browser auf Desktop und Mobile
gezielt erlebt und geprueft werden:

1. Ist die Dauer von `2200 ms` ruhig genug, ohne den Fluss auszubremsen?
2. Ist der Unterschied zwischen Bridge Text und ergaenzendem Journey Text
   lesbar, ohne Wiederholung zu erzeugen?
3. Ist `700 ms` bei `prefers-reduced-motion` ein sinnvoller Kompromiss?
4. Bleibt die Ueberspringen-Aktion per Tastatur gut erreichbar?
5. Soll `Raum oeffnen` bewusst der direkte Zugang ohne Bedeutungsschwelle
   bleiben?
6. Soll ein spaeterer Schritt beim Reisebeginn vorhandenen Journey Context als
   Query-Parameter an den Zielraum uebergeben?

Diese Punkte sind Pruefaufgaben. Phase 9A selbst aendert weder Routing noch
Journey-System oder Raumarchitektur.
