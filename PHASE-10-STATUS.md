# Phase 10A: Meaning Transition Scene

## 1. Was ist `MeaningTransitionScene`?

`MeaningTransitionScene` ist eine kurze, vollflaechige Bedeutungsszene zwischen
`JourneyGate` und der bereits vorhandenen Folgeaktion. Sie zeigt nicht nur,
welches Symbol als naechstes erreicht wird, sondern welche Bedeutungsbewegung
den Uebergang traegt:

```text
Symbol A
|
v
Meaning Node
|
v
Symbol B
```

Wenn ein bestehender Uebergang mehrere relevante Meaning Nodes besitzt, werden
diese innerhalb derselben vertikalen Bewegung untereinander angezeigt.

Die Szene erhaelt:

- `fromSymbol`
- `toSymbol`
- `bridgeText`
- `journeyText`
- `meaningNodes`
- `onComplete`

Sie dauert standardmaessig `1800 ms`, kann mit `Szene ueberspringen` vorzeitig
beendet werden und ruft danach ausschliesslich die bereits vorhandene
Folgeaktion auf.

## 2. Unterschied zu `JourneyGate`

`JourneyGate` und `MeaningTransitionScene` haben unterschiedliche Aufgaben:

| Komponente | Aufgabe |
| --- | --- |
| `JourneyGate` | Benennt und erklaert die Bedeutungsschwelle vor dem Vollzug. Es zeigt Titel, vorhandene Texte und das hebraeische Zielwort. |
| `MeaningTransitionScene` | Visualisiert nach der Schwelle die Bedeutungsbewegung selbst: Ausgangssymbol, vorhandene Meaning Nodes und Zielsymbol. |

Die Reihenfolge lautet:

```text
MeaningBridge oder Meaning Journey
-> JourneyGate
-> MeaningTransitionScene
-> bestehende Folgeaktion
```

Damit beantwortet die neue Szene staerker die Frage:

> Warum veraendert sich mein Weg?

## 3. Wann wird die Szene ausgeloest?

Die Szene wird in zwei bestehenden Ablaeufen des Symbolnetzes genutzt:

| Aktion | Ablauf nach Phase 10A |
| --- | --- |
| `Verbindung folgen` | `MeaningBridge` -> `JourneyGate` -> `MeaningTransitionScene` -> vorhandener Fokuswechsel zum verbundenen Symbol |
| `Reise beginnen` | `JourneyGate` -> `MeaningTransitionScene` -> vorhandene `RoomTransition` zum ersten Raum der Journey |

Beim Folgen einer Verbindung werden die Meaning Nodes in der tatsaechlich
erlebten Laufrichtung angezeigt. Wird eine Bridge rueckwaerts betreten, dreht
sich deshalb auch ihre sichtbare Meaning-Node-Reihenfolge um.

Der direkte Zugang ueber `Raum oeffnen` bleibt unveraendert und erhaelt keine
zusaetzliche Szene.

## 4. Genutzte Datenquellen

`MeaningTransitionScene` erfindet keine neuen Bedeutungen und enthaelt keine
symbolbezogenen narrativen Texte. Sie erhaelt bereits aufgeloeste Daten aus
dem bestehenden Symbolnetz:

| Angezeigter Inhalt | Bestehende Quelle |
| --- | --- |
| Symbolnamen | `SymbolMeaningNetworkNode.label` aus `buildSymbolMeaningNetwork()` |
| Hebraeische Symbolwoerter | `SymbolMeaningNetworkNode.hebrew`, aufgeloest ueber `getSymbolHebrewProfile()` und die vorhandenen Hebrew Profiles |
| Meaning Nodes einer direkten Bridge | `SymbolMeaningPath.fromMeaning` und `SymbolMeaningPath.toMeaning` |
| Bridge Text einer direkten Bridge | `SymbolMeaningPath.bridgeDescription`, aufgebaut aus `MeaningRelation.description` |
| Ergaenzender Bridge Text | `SymbolMeaningPath.summary`, aufgebaut aus Meaning Relations oder vorhandenen Hebrew Meaning Fields |
| Journey Text | `MeaningJourney.description` aus `lib/meaning/meaningJourneys.ts` |
| Meaning Nodes beim Journey-Start | `JourneyContext.meaningNodeIds`, mit Fallback auf `MeaningJourney.meaningNodePath` |
| Bridge Text beim Journey-Start | `JourneyContext.bridgeText`, aufgeloest ueber `getJourneyContext()` |

Damit bleiben Relationsbeschreibungen, Journey-Beschreibungen, Hebrew-Profile
und Journey Context an ihren bisherigen fachlichen Stellen gepflegt.

## 5. Warum war keine neue Architektur noetig?

Phase 10A fuegt nur eine schmale UI-Schicht in die bestehende Kette ein.

Es wurden bewusst nicht angelegt:

- keine neuen Raeume,
- keine neuen Meaning Nodes,
- keine neue Journey-Art,
- keine neue Routing-Logik,
- keine neuen Query-Parameter,
- keine neuen Context-Typen.

`SymbolNetwork` verwaltet lediglich einen zusaetzlichen lokalen
`MeaningTransitionSceneState`. Nach Abschluss der Szene wird der bestehende
Callback ausgefuehrt:

- bei einer Bridge weiterhin `followPath(path)`,
- bei einer Journey weiterhin `startRoomTransition({ href })`.

Die vorhandenen Systeme `JourneyGate`, Meaning Bridges, Meaning Journeys und
Journey Context bleiben die Grundlage.

## 6. Mobile-Verhalten

Desktop und Mobile verwenden dieselbe Komponente und dieselbe Logik. Es gibt
kein separates Mobile-System.

Auf kleinen Bildschirmen ist die Darstellung kompakter:

- geringere Innenabstaende,
- kleinere hebraeische Symbolwoerter,
- kleinere Pfeile und Meaning Nodes,
- kompaktere Bridge- und Journey-Texte,
- kuerzerer Abstand zur Ueberspringen-Aktion.

Die Szene bleibt vollflaechig, dunkel und ruhig. Sie verwendet das bereits
vorhandene Asset `/Visuals/symbolnetz_backround.png` sowie goldene und
cyanfarbene Akzente aus dem bestehenden SYMBOLRAUM-Stil.

Bei `prefers-reduced-motion: reduce` entfaellt die Ankunftsanimation und die
Dauer wird von `1800 ms` auf `600 ms` reduziert.

## 7. Validierungsstatus

Fuer die Phase-10A-Implementierung wurden ausgefuehrt:

- `npm run build`: erfolgreich
- `npx eslint components/MeaningTransitionScene.tsx components/SymbolNetwork.tsx`: erfolgreich
- `git diff --check`: keine Whitespace-Fehler

Fuer diese Dokumentationsaufgabe wurde kein weiterer Build ausgefuehrt. Es
wurde ausschliesslich `PHASE-10-STATUS.md` angelegt; UI-Dateien wurden dabei
nicht veraendert.

## 8. Was als naechstes geprueft werden sollte

Als naechster Schritt sollte die Bedeutungsszene im Browser auf Desktop und
Mobile gezielt erlebt werden:

1. Ist die Gesamtabfolge `JourneyGate` plus `MeaningTransitionScene` ruhig
   genug, ohne den Weg auszubremsen?
2. Sind `1800 ms` fuer die Standardszene und `600 ms` bei reduzierter Bewegung
   passend?
3. Bleibt bei direkten Bridges die Laufrichtung der Meaning Nodes intuitiv,
   auch wenn eine Verbindung rueckwaerts betreten wird?
4. Sind Journeys mit mehreren Meaning Nodes auf kleinen Displays gut lesbar?
5. Wirken Bridge Text und Journey Text ergaenzend, ohne Wiederholungen zu
   erzeugen?
6. Bleibt `Szene ueberspringen` per Tastatur und auf Touch-Geraeten gut
   erreichbar?
7. Soll der direkte Zugang `Raum oeffnen` weiterhin bewusst ohne
   Bedeutungsszene bleiben?
