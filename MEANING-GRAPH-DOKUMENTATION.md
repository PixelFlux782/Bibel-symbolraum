# Meaning Graph: Kurz-Dokumentation

## 1. Was ist der Meaning Graph?

Der Meaning Graph ist eine globale, UI-unabhaengige Datenebene fuer
wiederkehrende Bedeutungen. Er verbindet hebraeische Woerter, Symbole und
biblische Referenzen ueber gemeinsame Meaning Nodes.

Beispiel: Wasser, `מים` (`majim`) und Exodus 14 koennen ueber Bedeutungen wie
`depth` oder `transition` miteinander in Beziehung gesetzt werden.

## 2. Unterschied zu SymbolEngineData und Hebrew Codex

- `SymbolEngineData` beschreibt einen konkreten Erlebnisraum: Stationen,
  Bilder, Szenen, Navigation und Reflexionsfragen.
- Der Hebrew Codex beschreibt sprachliche Entitaeten: Buchstaben, Woerter,
  moegliche Wurzeln, Bedeutungsfelder und Bibelstellen.
- Der Meaning Graph beschreibt symboluebergreifende Bedeutungsknoten und ihre
  Beziehungen. Er verknuepft kuratierte Eintraege aus mehreren Urspruengen,
  ersetzt aber weder die Engine-Dramaturgie noch die sprachliche Codex-Ebene.

## 3. Was sind Meaning Nodes?

Ein `MeaningNode` ist eine kleine, wiederverwendbare Bedeutungseinheit:

```ts
{ id: "depth", label: "Tiefe", description: "..." }
```

Aktuell gibt es unter anderem `depth`, `chaos`, `birth`, `transition`,
`purification`, `life` und `hiddenness`.

## 4. Was sind Meaning Relations?

Eine `MeaningRelation` ist eine gerichtete Verbindung zwischen zwei Nodes:

```ts
{
  id: "chaos-transition",
  fromNodeId: "chaos",
  toNodeId: "transition",
  description: "..."
}
```

Relationen modellieren kuratierte Bedeutungsbewegungen, zum Beispiel von Chaos
zu Uebergang. Sie sind keine automatisch erzeugten Ableitungen.

## 5. Hebrew-, Symbol- und Biblical-Mappings

Mappings verbinden einen Ursprung mit Meaning Nodes:

- `HebrewMeaningLink`: verbindet ein HebrewWord wie `majim` mit Nodes.
- `SymbolMeaningLink`: verbindet einen Symbol-Slug wie `wasser` mit Nodes.
- `BiblicalMeaningLink`: verbindet eine stabile `BiblicalReference`-ID mit
  Nodes.

Mappings koennen optional auch konkrete `relationIds` referenzieren.

## 6. Warum stabile BiblicalReference-IDs wichtig sind

`BiblicalReference.id` ist der stabile technische Schluessel, zum Beispiel
`genesis-1-2`. Die sichtbare Schreibweise `Genesis 1,2` kann spaeter angepasst
werden, ohne bestehende Links umzubenennen. Biblical-Mappings referenzieren
deshalb die ID und nicht direkt den Anzeigetext.

Neue IDs sollten eindeutig, lesbar und nach ihrer Einfuehrung unveraendert
bleiben.

## 7. Wie `getMeaningProfile()` genutzt wird

`getMeaningProfile()` ist eine reine Analyse-Utility ohne UI-Abhaengigkeit:

```ts
import { getMeaningProfile } from "@/lib/meaning/meaningMappings";

const waterProfile = getMeaningProfile("wasser");
const majimProfile = getMeaningProfile("מים");
const completeGraph = getMeaningProfile();
```

Eine Query wird gegen IDs, Labels, Aliases und passende Referenztexte
abgeglichen. Das Ergebnis enthaelt:

- `origin`: passende Hebrew-, Symbol- und Biblical-Mappings
- `nodes`: dadurch erreichte Meaning Nodes
- `relations`: Relationen, deren Start- und Ziel-Node im Profil enthalten sind

Ohne Query liefert die Funktion das Profil aller vorhandenen Mappings.

## 8. Wie `validateMeaningGraph()` genutzt wird

Der Validator prueft den Standard-Datensatz:

```ts
import { validateMeaningGraph } from "@/lib/meaning/validateMeaningGraph";

const result = validateMeaningGraph();
console.dir(result, { depth: null });
```

`result.errors` enthaelt unter anderem doppelte IDs und unbekannte Referenzen.
`result.warnings` meldet unter anderem Zyklen, verwaiste Nodes, zu kleine
Symbol-Profile und Hebrew-/Symbol-Mappings ohne gemeinsamen Node.
`result.stats` fasst Nodes, Relationen und Mappings zusammen.

Fuer gezielte Tests koennen einzelne Datenbereiche per Override ersetzt werden:

```ts
const result = validateMeaningGraph({ nodes: testNodes });
```

## 9. Regeln fuer neue Meaning Nodes

1. Ein Node beschreibt genau eine kleine, wiederverwendbare Bedeutung.
2. Die `id` ist eindeutig, englisch, kurz und nach Einfuehrung stabil.
3. `label` und `description` bleiben klar und kuratiert.
4. Neue Nodes werden ueber mindestens ein Mapping oder eine Relation genutzt.
5. Relationen werden nur ergaenzt, wenn eine bewusste Bedeutungsbewegung
   beschrieben werden kann.
6. Neue Mappings referenzieren nur vorhandene Symbol-Slugs, HebrewWord-IDs,
   BiblicalReference-IDs, Node-IDs und Relation-IDs.
7. Nach Aenderungen wird `validateMeaningGraph()` ausgefuehrt.

## 10. Beispiel: Wasser / מים / Genesis / Exodus

Das Symbol-Mapping `symbol-water` verbindet `wasser` mit `depth`,
`transition` und `purification`.

Das Hebrew-Mapping `hebrew-majim` verbindet `מים` (`majim`) mit `depth`,
`birth` und `hiddenness`.

Die biblischen Mappings ergaenzen:

| Referenz | BiblicalReference-ID | Meaning Nodes |
| --- | --- | --- |
| Genesis 1,2 | `genesis-1-2` | `chaos`, `depth` |
| Exodus 14 | `exodus-14` | `transition` |

So bleibt nachvollziehbar, aus welchem Ursprung eine Bedeutung stammt, waehrend
gemeinsame Nodes die Verbindung zwischen Wort, Symbol und Bibelstelle sichtbar
machen.

## Dateien

```text
types/meaningGraph.ts
lib/meaning/meaningNodes.ts
lib/meaning/meaningRelations.ts
lib/meaning/meaningMappings.ts
lib/meaning/biblicalReferences.ts
lib/meaning/validateMeaningGraph.ts
```
