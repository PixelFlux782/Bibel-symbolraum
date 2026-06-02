# Phase 6: Meaning Journeys und Meaningful Bridges

## 1. Was sind Meaning Journeys?

Meaning Journeys sind kuratierte Wege durch mehrere Symbolraeume. Sie
beschreiben nicht nur, welche Symbole zusammenhaengen, sondern welche
Bedeutungsbewegung beim Durchqueren des Netzes lesbar wird.

Eine Journey besitzt:

- eine stabile `id`,
- einen Titel und eine kurze Begruendung,
- einen `symbolPath`,
- einen parallelen `meaningNodePath`,
- kuratierte biblische Referenzen.

Aktuell sind vier Journeys modelliert:

| Journey | Symbolpfad | Bedeutungspfad |
| --- | --- | --- |
| Schoepfung | `wasser -> licht` | `depth -> revelation` |
| Reinigung | `wasser -> feuer` | `purification -> transformation` |
| Offenbarung | `feuer -> licht` | `presence -> revelation` |
| Weg durch die Wueste | `wasser -> wueste -> licht -> feuer` | `transition -> desert -> guidance -> presence` |

Die Journeys liegen als UI-unabhaengige Daten in
`lib/meaning/meaningJourneys.ts`. Das Symbolnetz hebt beim Auswaehlen einer
Journey den zugehoerigen Weg und seine Meaning Nodes hervor.

## 2. Was sind Meaningful Bridges?

Meaningful Bridges sind erklaerende Uebergaenge zwischen zwei direkt
verbundenen Symbolen. Eine Verbindung wird nicht sofort ausgefuehrt. Zuerst
oeffnet sich eine `MeaningBridge`, die beantwortet:

- Welche beiden Symbole werden verbunden?
- Warum besteht diese Verbindung?
- Welche Bedeutungsrelation traegt den Uebergang?
- Gibt es eine gemeinsame hebraeische Spur, etwa das Aleph bei Feuer und
  Licht?

Danach kann die Person entweder der Verbindung folgen oder im Netz bleiben.
Die Bridge ist damit keine neue Inhaltsquelle. Sie macht die bereits
modellierte Relation lesbar, bevor sich der Fokus im Netz verschiebt.

## 3. Wie unterscheiden sich Symbol, Verbindung und Reise?

| Ebene | Bedeutung | Beispiel |
| --- | --- | --- |
| Symbol | Ein einzelner Bedeutungsraum mit Hebrew-Profil und eigenem Raum-Link. | `wasser` |
| Verbindung | Eine kuratierte direkte Kante zwischen zwei Symbolen. Sie besitzt Meaning Nodes, Relation und Evidenz. | `wueste -> licht`: Fuehrung |
| Reise | Eine kuratierte Folge mehrerer Symbole und Meaning Nodes. Sie zeigt eine groessere Bewegung durch das Netz. | `wasser -> wueste -> licht -> feuer` |

Kurz gesagt: Das Symbol ist ein Ort, die Verbindung ist ein begruendeter
Uebergang und die Reise ist ein lesbarer Weg aus mehreren Orten und
Uebergaengen.

## 4. Warum macht Phase 6 das Symbolnetz vom Menue zur Landkarte?

Vor Phase 6 konnte das Symbolnetz vor allem einzelne Raeume und direkte
Nachbarschaften sichtbar machen. Phase 6 fuegt zwei Orientierungsebenen hinzu:

1. Meaningful Bridges erklaeren eine Kante, bevor ihr gefolgt wird.
2. Meaning Journeys markieren einen groesseren, kuratierten Pfad durch mehrere
   Symbole und Meaning Nodes.

Damit ist das Netz nicht mehr nur eine Auswahl vorhandener Raeume. Es zeigt,
warum ein Uebergang sinnvoll ist, welche Stationen zusammen einen Weg bilden
und an welchem Einstiegspunkt eine Reise beginnen kann. Das Symbolnetz wird
zur Landkarte: Orte, Wege und Routen sind voneinander unterscheidbar.

## 5. Welche Dateien sind zentral?

| Datei | Aufgabe |
| --- | --- |
| `types/meaningGraph.ts` | Definiert `MeaningJourney` und die bestehenden Meaning-Graph-Typen. |
| `lib/meaning/meaningJourneys.ts` | Enthaelt die vier kuratierten Journeys. |
| `lib/meaning/buildSymbolMeaningNetwork.ts` | Fuehrt Symbole, Meaning Nodes, direkte Pfade und Journeys fuer das Symbolnetz zusammen. |
| `lib/meaning/validateMeaningGraph.ts` | Validiert jetzt auch Journey-IDs sowie referenzierte Symbol-Slugs, Meaning Nodes und BiblicalReference-IDs. |
| `components/MeaningBridge.tsx` | Zeigt die erklaerende Bridge vor dem Folgen einer direkten Verbindung. |
| `components/SymbolNetwork.tsx` | Bindet Journeys, Pfad-Hervorhebung und Meaning Bridges in das bestehende Symbolnetz ein. |

Wichtige Grundlagen bleiben:

```text
lib/meaning/meaningNodes.ts
lib/meaning/meaningRelations.ts
lib/meaning/meaningMappings.ts
lib/meaning/biblicalReferences.ts
lib/hebrew/hebrewWords.ts
lib/hebrew/symbolHebrewMappings.ts
```

## 6. Welche Validierungen sind gruen?

Direkt ausgefuehrt wurden:

- `validateSymbolEngineData(waterEngineData)`: keine Fehler
- `validateSymbolEngineData(lightEngineData)`: keine Fehler
- `validateSymbolEngineData(fireEngineData)`: keine Fehler
- `validateSymbolEngineData(wuesteEngineData)`: keine Fehler
- `validateHebrewCodex()`: keine Fehler
- `validateMeaningGraph()`: keine Fehler, keine Warnungen

Meaning-Graph-Stand:

| Bereich | Anzahl |
| --- | ---: |
| Nodes | `23` |
| Relationen | `19` |
| Mappings | `19` |
| Journeys | `4` |

Zusaetzlich wurde `npm run lint` ausgefuehrt. Der Repo-weite Lint ist nicht
gruen: Er meldet bereits bestehende, phasefremde
`react-hooks/set-state-in-effect`-Fehler unter anderem in `app/impuls`,
`app/mein-pfad`, `components/home` und `hooks`. Die fuer Phase 6 zentralen
Dateien sind nicht als Fehlerquelle aufgefuehrt.

Der optionale Produktions-Build wurde fuer diese reine Dokumentationsaufgabe
nicht ausgefuehrt.

## 7. Was ist der naechste sinnvolle Raum?

Der naechste sinnvolle Raum ist Brot / `לחם` (`lechem`).

Brot ist bereits vorbereitet:

- `lib/hebrew/hebrewWords.ts` enthaelt `lechem` mit dem Meaning Field
  `lechem-nourishment`.
- `lib/hebrew/symbolHebrewMappings.ts` verbindet `brot` mit `lechem`.
- `lib/symbols.ts` kennt Brot bereits als Symbol und als Beziehungsspur.
- Exodus 16 verbindet Brot unmittelbar mit der bereits entwickelten Wueste:
  Versorgung wird gerade im Mangel sichtbar.

Damit waere Brot kein isoliertes neues Element. Der Raum koennte aus dem
bestehenden Netz wachsen: `wueste -> mangel -> versorgung -> brot`.

Der sinnvolle naechste Schritt waere, Brot in Meaning Graph, Biblical
References und Symbolnetz ausdruecklich zu modellieren und daraus erst danach
einen eigenen Engine-Raum abzuleiten.
