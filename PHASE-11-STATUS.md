# Phase 11: Living Map und Living Connections

## 1. Was bedeutet Living Map?

Living Map bezeichnet das Symbolnetz als lebendige Bedeutungslandschaft. Das
Netz zeigt nicht nur statische Knoten und Kanten, sondern reagiert auf Fokus,
Auswahl und Reisevorschau:

- Ein fokussiertes Symbol weckt seine direkten Verbindungen.
- Eine ausgewaehlte Verbindung wird als lesbarer Bedeutungsweg hervorgehoben.
- Beim Ueberfahren, Fokussieren oder Beruehren einer Meaning Journey leuchtet
  ihre gesamte Spur im Netz auf.
- Beim Folgen einer Verbindung wird die ausgewaehlte Kante auf Desktop kurz
  selbst zur sichtbaren Bewegung.

Die Living Map ist keine neue Graph- oder Routing-Architektur. Sie ist die
direktere Darstellung der bereits vorhandenen Symbole, Meaning Nodes,
Meaning Relations und Meaning Journeys in `components/SymbolNetwork.tsx`.

## 2. Was sind Living Connections?

Living Connections sind die direkten Kanten zwischen zwei Symbolen. Sie
werden nicht mehr nur als Linien dargestellt, sondern tragen ihren
kuratierten Relationstext unmittelbar im Netz.

Technisch verwendet React Flow fuer diese Kanten den eigenen Edge-Typ
`living`. `LivingConnectionEdge` zeichnet:

- die vorhandene Bezier-Kante,
- ein `foreignObject` am Mittelpunkt der Kante,
- den Relationstext,
- die Aktion `Verbindung folgen`.

Eine Kante wird lesbar, sobald sie ausgewaehlt wird. Auf Desktop kann bereits
das Ueberfahren einer Kante die Vorschau aktivieren. Ausgewaehlte Pfade
pulsieren ruhig; beim tatsaechlichen Folgen wird die Bewegung fuer `450 ms`
deutlicher markiert.

## 3. Wie erscheinen Relation-Texte direkt im Netz?

Die Texte werden nicht neu in der UI gepflegt. Jede direkte Verbindung
bezieht ihren Text weiterhin aus der bestehenden Meaning Relation:

```text
lib/meaning/meaningRelations.ts
-> buildSymbolMeaningNetwork()
-> SymbolMeaningPath.bridgeDescription
-> LivingConnectionEdge
```

`buildSymbolMeaningNetwork()` setzt fuer direkte Netzpfade jetzt sowohl
`summary` als auch `bridgeDescription` bewusst auf
`MeaningRelation.description`. Damit erscheint der kuratierte Relationstext
konsistent an der Kante, in der mobilen Verbindungskarte und im Detailpanel.

## 4. Wie funktionieren Journey-Spuren?

Meaning Journeys bleiben kuratierte Wege durch mehrere Symbolraeume. Neu ist,
dass ihre Spur bereits bei der Vorschau als zusammenhaengender Weg im Netz
sichtbar wird.

Eine Journey-Karte setzt bei `mouseenter`, Tastaturfokus oder `touchstart`
eine temporaere Vorschau. Daraus werden die beteiligten Symbol-IDs,
Meaning-Node-IDs und Kanten abgeleitet. Die Living Map hebt diese Pfade hervor
und dimmt nicht beteiligte Knoten.

Ein Klick auf die Journey selbst waehlt sie dauerhaft aus. Auf Mobile ist das
React-Flow-Netz ausgeblendet; dort macht die kompakte Stationsnavigation den
ausgewaehlten Journey-Pfad sichtbar.

## 5. Warum sind `MeaningBridge` und `JourneyGate` beim Verbindung-Folgen nicht mehr noetig?

Bei einer direkten Verbindung ist der Relationstext nun bereits an der Kante
lesbar. Ein separates `MeaningBridge`-Overlay wuerde denselben Inhalt erneut
zeigen. Auch `JourneyGate` ist fuer diesen kurzen Netzschritt nicht mehr
noetig, weil die Kante selbst zur Bedeutungsschwelle geworden ist.

Der Ablauf fuer direkte Verbindungen lautet jetzt:

```text
Kante auswaehlen
-> Relationstext direkt im Netz lesen
-> Verbindung folgen
-> Kante fuer 450 ms als Bewegung markieren
-> MeaningTransitionScene fuer 750 ms
-> Fokus auf das verbundene Symbol setzen
```

`JourneyGate` bleibt bewusst fuer `Reise beginnen` erhalten. Der Start einer
ganzen Meaning Journey fuehrt weiterhin in einen Raum und besitzt deshalb
weiterhin die ausfuehrlichere narrative Schwelle:

```text
Reise beginnen
-> JourneyGate
-> MeaningTransitionScene
-> vorhandene RoomTransition
```

`MeaningBridge.tsx` bleibt als vorhandene Komponente im Projekt bestehen, ist
aber im aktuellen `SymbolNetwork` nicht mehr eingebunden.

## 6. Mobile-Verhalten

Mobile verwendet dieselben Daten und dieselbe Folgelogik, aber keine
`foreignObject`-Interaktion als primaeren Zugang. Unterhalb des Netzes stehen
kompakte Verbindungskarten:

- Die Karte zeigt direkt `bridgeDescription`.
- Antippen waehlt die Verbindung aus.
- Nur die ausgewaehlte Karte zeigt `Verbindung folgen`.
- Danach laufen derselbe `450 ms` lange Uebergangsvorlauf und dieselbe
  `750 ms` lange `MeaningTransitionScene`.

Das React-Flow-Netz und damit die animierte Kante selbst sind unterhalb des
`md`-Breakpoints ausgeblendet. Journey-Karten reagieren dennoch auf
`touchstart`, sodass Journey-Kontext und mobile Stationsnavigation aktiviert
werden koennen. Bei `prefers-reduced-motion: reduce` werden die neuen Puls-
und Spur-Animationen abgeschaltet. Die kurze Verbindungs-Transition wird auf
hoechstens `600 ms` begrenzt.

## 7. Validierungsstatus

Fuer die Phase-11-Dokumentation wurden ausgefuehrt:

- `npx eslint components/SymbolNetwork.tsx components/MeaningTransitionScene.tsx lib/meaning/buildSymbolMeaningNetwork.ts`: erfolgreich
- `git diff --check`: keine Whitespace-Fehler
- `npm run lint`: weiterhin fehlerhaft durch bereits vorhandene Treffer
  ausserhalb der Phase-11-Dateien

Der optionale Produktions-Build wurde fuer diese Dokumentationsaufgabe nicht
ausgefuehrt. Es wurden keine UI-Dateien geaendert.

## 8. Bekannte nicht-blockierende Warnungen

Der vollstaendige Lint-Lauf meldet weiterhin bestehende
`react-hooks/set-state-in-effect`-Treffer in:

- `app/impuls/page.tsx`
- `app/mein-pfad/page.tsx`
- `app/symbole/[slug]/SymbolDetailClient.tsx`
- `components/experiments/symbolraum-3d/Symbolraum3DPrototype.tsx`
- `components/home/PathPreview.tsx`
- `hooks/useRoomTransition.ts`
- `hooks/useSoundPreference.ts`

Zusaetzlich bestehen bereits vorhandene `@typescript-eslint/no-unused-vars`-
Warnungen in einzelnen Symbol- und Experiment-Dateien.

`git diff --check` weist unter Windows ausserdem darauf hin, dass Git bei den
bereits geaenderten Phase-11-Dateien spaeter `LF` durch `CRLF` ersetzen kann.
Das sind keine Whitespace-Fehler und keine Blocker.

`SymbolNetwork` besitzt weiterhin einen Entwicklungs-Fallback fuer zukuenftig
hinzukommende Nodes ohne feste Kartenposition. Falls eine Position fehlt,
wird einmalig eine `console.warn`-Meldung ausgegeben und die zentrale
Fallback-Position verwendet. Fuer die aktuell projizierten Nodes sind feste
Positionen vorhanden.
