# Phase 7A: Journey Awareness Foundation

## 1. Was bedeutet Journey Awareness?

Journey Awareness ist die Grundlage dafuer, dass ein Symbolraum spaeter nicht
nur sein eigenes Symbol kennt. Er kann zusaetzlich wissen:

- aus welcher Meaning Journey die Person kommt,
- aus welchem Symbolraum sie kommt,
- welche Station im Zielraum als Einstieg sinnvoll ist,
- welche Meaning Nodes und Bibelstellen diesen Einstieg begruenden.

Ein Beispiel ist der Uebergang aus der Wueste in den Lichtraum. Innerhalb der
Journey `wilderness-path` ist nicht `before-light`, sondern
`light-on-the-way` der passende Einstieg.

## 2. Neue Daten- und Utility-Schicht

| Datei | Aufgabe |
| --- | --- |
| `types/journeyContext.ts` | Definiert `JourneyContext`, `JourneyEntryTarget` und `JourneyRouteHint`. |
| `lib/meaning/journeyEntryTargets.ts` | Ordnet bekannten Journeys und Zielraeumen vorhandene Engine-State-IDs zu. |
| `lib/meaning/getJourneyContext.ts` | Laedt die Journey, prueft den Zielraum und liefert den passenden Kontext oder `null`. |

`getJourneyContext()` ist UI-unabhaengig. Die Utility akzeptiert die stabilen
IDs aus `lib/meaning/meaningJourneys.ts` und zusaetzlich deutsche Route-Aliase:

| Route-Alias | Meaning-Journey-ID |
| --- | --- |
| `schoepfung` | `creation` |
| `reinigung` | `purification` |
| `offenbarung` | `revelation` |
| `weg-durch-die-wueste` | `wilderness-path` |

## 3. URL-Konvention

Eine spaetere Navigation darf Journey-Kontext als Query-Parameter an einen
bestehenden Raum uebergeben:

```text
/raeume/licht?journey=weg-durch-die-wueste&from=wueste
/raeume/licht?journey=weg-durch-die-wueste&from=wueste&state=light-on-the-way
```

Phase 7A liest diese Parameter in den Routen bewusst noch nicht aus. Sie
definiert die Konvention und stellt die passende Utility bereit.

## 4. Gemappte Einstiege

| Journey | Raum | Vorhandener State |
| --- | --- | --- |
| `creation` | `wasser` | `before-order` |
| `creation` | `licht` | `let-there-be-light` |
| `purification` | `wasser` | `cleansing` |
| `purification` | `feuer` | `refining-fire` |
| `revelation` | `feuer` | `burning-bush` |
| `revelation` | `licht` | `let-there-be-light` |
| `wilderness-path` | `wasser` | `source` |
| `wilderness-path` | `wueste` | `guidance` |
| `wilderness-path` | `licht` | `light-on-the-way` |
| `wilderness-path` | `feuer` | `pillar-of-fire` |

Alle IDs wurden gegen die bestehenden `state.id`-Werte der vier
`SymbolEngineData`-Dateien geprueft.

## 5. Vorbereitete Engine-Unterstuetzung

`useSymbolEngine(data, options?)` akzeptiert nun optional
`initialStateId`. `SymbolEngineRoom` reicht dieselbe optionale Prop weiter.
Bei einer unbekannten ID startet die Engine wie bisher mit dem ersten State.
Bestehende Raum-Routen bleiben unveraendert.

## 6. Bewusste Grenzen von Phase 7A

- Bestehende Navigationen werden noch nicht umgebaut.
- Raum-Routen lesen Query-Parameter noch nicht automatisch aus.
- Es gibt keine neuen Raeume, Engine-Komponenten oder UI-Aenderungen.
- Der Journey-Kontext wird noch nicht dauerhaft gespeichert.

# Phase 7B: URL-gesteuerte Raum-Einstiege

## 1. URL-Konvention

Die in Phase 7A vorbereitete Query-Konvention wird nun von den bestehenden
Raum-Routen gelesen:

```text
/raeume/licht?journey=weg-durch-die-wueste&from=wueste
/raeume/licht?journey=weg-durch-die-wueste&from=wueste&state=light-on-the-way
```

| Parameter | Aufgabe |
| --- | --- |
| `journey` | Meaning-Journey-ID oder deutscher Route-Alias. |
| `from` | Optionaler Slug des vorherigen Symbolraums. |
| `state` | Optionaler, expliziter Engine-State fuer den Zielraum. |

## 2. `resolveRoomInitialStateId`

`lib/meaning/resolveRoomInitialStateId.ts` buendelt die serverseitige
Aufloesung des Raum-Einstiegs. Die Utility:

1. liest einen expliziten `state`,
2. akzeptiert ihn nur, wenn er im Zielraum vorhanden ist,
3. liest andernfalls den Journey-Kontext ueber `getJourneyContext()`,
4. akzeptiert auch den vorgeschlagenen Journey-State nur, wenn er im
   Zielraum vorhanden ist,
5. liefert sonst `undefined`.

`SymbolEngineRoom` reicht die aufgeloeste ID als `initialStateId` an
`useSymbolEngine()` weiter. Bei `undefined` oder einer unbekannten ID bleibt
das bestehende Verhalten erhalten: Die Engine startet mit ihrem ersten State.

## 3. Betroffene Routen

| Route | Ziel-Slug | Engine-Daten |
| --- | --- | --- |
| `/raeume/wasser` | `wasser` | `waterEngineData` |
| `/raeume/licht` | `licht` | `lightEngineData` |
| `/raeume/feuer` | `feuer` | `fireEngineData` |
| `/raeume/wueste` | `wueste` | `wuesteEngineData` |

Alle vier Routen lesen `searchParams`, validieren gegen ihre eigenen
`state.id`-Werte und uebergeben nur den aufgeloesten Start-State an die
bestehende Engine. Es wurden keine UI-Komponenten visuell veraendert.

## 4. Prioritaet des Einstiegs

Die Reihenfolge ist bewusst eindeutig:

```text
gueltiger state > gueltiger Journey-Kontext > erster Engine-State als Default
```

Ein expliziter gueltiger `state` kann damit einen Journey-Vorschlag
ueberschreiben. Ein unbekannter `state` blockiert die Journey nicht, sondern
faellt auf deren gemappten Einstieg zurueck. Ohne brauchbaren Parameter greift
weiterhin der bisherige Default des jeweiligen Raums.

## 5. Smoke-Test-Ergebnisse

Direkt ausgefuehrt wurden:

- `npm run build`: erfolgreich; die vier `/raeume/*`-Seiten werden als
  dynamische servergerenderte Routen gebaut.
- HTTP-Smoke-Tests gegen `next start`: alle geprueften URLs liefern Status
  `200` und den erwarteten `initialStateId`.
- `npm run lint`: weiterhin nicht gruen wegen bereits bestehender,
  phasefremder Fehler und Warnungen. Die Phase-7B-Dateien werden nicht als
  Fehlerquelle aufgefuehrt.

| Smoke-Test | Erwarteter Einstieg | Ergebnis |
| --- | --- | --- |
| `/raeume/licht` | Default `before-light` | erfolgreich |
| `/raeume/licht?journey=weg-durch-die-wueste&from=wueste` | `light-on-the-way` | erfolgreich |
| `/raeume/licht?journey=weg-durch-die-wueste&from=wueste&state=let-there-be-light` | explizit `let-there-be-light` | erfolgreich |
| `/raeume/licht?journey=weg-durch-die-wueste&from=wueste&state=does-not-exist` | Journey-Fallback `light-on-the-way` | erfolgreich |
| `/raeume/wasser?journey=reinigung` | `cleansing` | erfolgreich |
| `/raeume/wueste?journey=weg-durch-die-wueste&from=wasser` | `guidance` | erfolgreich |
| `/raeume/feuer?journey=weg-durch-die-wueste&from=licht` | `pillar-of-fire` | erfolgreich |

## 6. Warum ermoeglicht das raumuebergreifende Navigation?

Ein Link zu einem Symbolraum muss nun nicht mehr nur den Zielraum benennen.
Er kann die Bedeutung des Uebergangs mitgeben und dadurch einen passenden
Einstieg innerhalb des Zielraums waehlen. Der Lichtraum beginnt nach der
Wueste beispielsweise bei `light-on-the-way` statt immer bei
`before-light`.

Damit koennen spaetere Navigationen aus Symbolnetz, Meaning Bridges oder
anderen Raeumen dieselben bestehenden Raumseiten verwenden und trotzdem den
jeweiligen Wegkontext erhalten. Phase 7B baut noch keine neue Navigation in
die UI ein; sie stellt die URL-gesteuerte Grundlage dafuer bereit.
