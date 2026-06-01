# Phase 5: Wueste aus dem Symbolnetz

## 1. Warum ist Wueste anders als Wasser, Licht und Feuer?

Wasser, Licht und Feuer sind elementare Symbole mit einer eigenen sichtbaren
Praesenz: Wasser traegt Tiefe und Uebergang, Licht macht sichtbar, Feuer
verwandelt und offenbart.

Wueste ist anders gebaut. Sie ist kein weiteres Element, sondern ein
Beziehungsraum. Ihre Bedeutung entsteht gerade dort, wo etwas fehlt oder nur
noch als Spur erfahrbar bleibt:

- fehlendes Wasser wird zu Mangel, Durst und Abhaengigkeit,
- Licht wird zur Orientierung fuer den naechsten Schritt,
- Feuer wird in der Nacht zur tragenden Feuersaeule,
- Stille wird zum Raum, in dem Stimme und Wort hoerbar werden.

Darum folgt der Wuestenraum nicht einer elementaren Steigerung, sondern einer
Reduktion: `Leere -> Pruefung -> Fuehrung -> Stimme`.

## 2. Wie wurde Wueste aus dem Symbolnetz geboren?

Wueste ist der erste neue Engine-Raum, der aus bereits sichtbaren Beziehungen
des Symbolnetzes entwickelt wurde. Sie war zuvor schon als Resonanzraum von
Wasser vorhanden. Phase 5 macht aus dieser Verbindung einen eigenen
`SymbolEngineData`-Datensatz und bindet ihn minimal unter `/raeume/wueste` ein.

Die Dramaturgie wurde nicht als isolierter Artikel erfunden, sondern aus dem
Netz abgeleitet:

| Station | Netzbewegung | Biblische Szene |
| --- | --- | --- |
| Die Leere | Mangel macht Abhaengigkeit sichtbar | Exodus 16 |
| Die Pruefung | Verborgenes tritt hervor | Deuteronomium 8 |
| Die Fuehrung | Wueste wird zum Raum der Orientierung | Exodus 13,21 |
| Die Stimme | Verborgenheit oeffnet sich fuer Stimme und Wort | Exodus 19 |

Damit gilt erstmals auch die Gegenrichtung: Das Symbolnetz verweist nicht nur
auf fertige Raeume. Es kann selbst den Bau eines neuen Raums begruenden.

## 3. Welche Verbindungen bestehen zu Wasser, Licht und Feuer?

| Verbindung | Bedeutung | Datenspur |
| --- | --- | --- |
| Wueste -> Wasser | `Mangel und Quelle`: Wo Wasser fehlt, werden Durst, Abhaengigkeit und Gabe sichtbar. | `lack -> dependence`, Exodus 16 |
| Wueste -> Licht | `Fuehrung`: Licht nimmt die Weite nicht fort, macht aber den naechsten Schritt lesbar. | `desert -> guidance`, Exodus 13,21 |
| Wueste -> Feuer | `Feuersaeule`: Feuer verbindet die dunkle Weite mit Gegenwart und Weg. | `guidance -> presence`, Exodus 13,21 |

Wasser, Licht und Feuer werden im Wuestenraum nicht wiederholt. Ihre Bedeutung
veraendert sich durch den Mangelraum: Aus Elementen werden notwendige Spuren.

## 4. Welche Hebrew-Codex-Erweiterungen wurden gemacht?

Die vorhandene Midbar-Grundlage `מדבר` / `midbar` wurde fuer den neuen Raum
vertieft. Die bereits vorhandenen Buchstaben `mem`, `dalet`, `bet` und `resh`,
die vorbereitete Wurzel `root-d-b-r` und das Symbol-Mapping
`symbol-wueste-midbar` konnten weiterverwendet werden.

Neu hinzugekommen sind vier Meaning Fields:

- `midbar-desert`
- `midbar-testing`
- `midbar-guidance`
- `midbar-word`

Die vorhandenen Fields `midbar-reduction` und `midbar-listening` bleiben Teil
des Profils. Ergaenzt wurden ausserdem drei biblische Referenzen:

- `midbar-exodus-16`
- `midbar-deuteronomy-8`
- `midbar-matthew-4`

Wichtig: Die Naehe von `midbar` zum Bedeutungsfeld von `davar` / Wort wird
bewusst als behutsame Spur dokumentiert, nicht als Gleichsetzung.

## 5. Welche Meaning-Graph-Nodes sind neu?

Der Meaning Graph wurde um acht Nodes erweitert:

- `desert` / Wueste
- `lack` / Mangel
- `testing` / Pruefung
- `dependence` / Abhaengigkeit
- `trust` / Vertrauen
- `voice` / Stimme
- `word` / Wort
- `path` / Weg

Hinzu kommen sieben Relationen:

- `lack-dependence`
- `dependence-trust`
- `testing-revelation`
- `desert-guidance`
- `hiddenness-voice`
- `voice-word`
- `guidance-path`

Das neue Meaning Field `desert` verbindet diese Nodes mit bereits vorhandenen
Nodes wie `transition`, `guidance`, `hiddenness` und `revelation`. Dadurch
bleibt Wueste Teil desselben Graphen und wird kein paralleler Datensilo.

## 6. Welche Validatoren sind gruen?

Direkt ausgefuehrt wurden:

- `validateSymbolEngineData(waterEngineData)`: keine Fehler
- `validateSymbolEngineData(lightEngineData)`: keine Fehler
- `validateSymbolEngineData(fireEngineData)`: keine Fehler
- `validateSymbolEngineData(wuesteEngineData)`: keine Fehler
- `validateHebrewCodex()`: keine Fehler
- `validateMeaningGraph()`: keine Fehler, keine Warnungen

Meaning-Graph-Stand: `23` Nodes, `19` Relationen, `19` Mappings.

Der optionale Produktions-Build wurde fuer diese reine Dokumentationsaufgabe
nicht erneut ausgefuehrt.

## 7. Welche Regel folgt daraus fuer zukuenftige Raeume?

Ein neuer Symbolraum braucht nicht zwingend ein isoliertes Element als
Ausgangspunkt. Er kann aus einer belastbaren Verdichtung bestehender
Netzbeziehungen entstehen.

Die Regel fuer kommende Raeume lautet:

1. Zuerst pruefen, ob der neue Raum bereits als wiederkehrende Beziehung im
   Symbolnetz sichtbar ist.
2. Diese Beziehung im Meaning Graph und Hebrew Codex ausdruecklich modellieren.
3. Daraus eine kurze dramaturgische Bewegung mit kuratierten Stationen bauen.
4. Den Raum als `<symbol>EngineData.ts` minimal ueber `SymbolEngineRoom`
   einbinden.
5. Keine neue UI und keinen zweiten Inhaltsbestand fuer Aussagen anlegen, die
   aus Meaning Graph, Hebrew Codex oder Symbol Engine ableitbar sind.

