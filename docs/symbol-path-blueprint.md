# Symbolpfad-Blueprint

## Zweck

Dieser Blueprint sichert den Wasserpfad als Referenz fuer spaetere Symbolpfade. Er beschreibt die technische Weglogik, die Mindestbestandteile und die Pruefpunkte, ohne neue Symbolpfade auszurollen oder bestehende UI zu veraendern.

Wasser ist der einzige verpflichtende Referenzpfad. Licht, Feuer, Wueste und Brot duerfen erst analog ergaenzt werden, wenn sie kuratiert sind.

## Referenzpfad Wasser

Die vollstaendige Bewegung lautet:

Symbolnetz -> Codex -> Bedeutungsanker / Bibelstellenanker -> Raum -> persoenliche Reflexion -> Mein Pfad -> Rueckweg in Codex / Raum / Symbolnetz.

Der Pfad bleibt ruhig und kuratiert: sichtbare Tore fuehren entweder zu echten Codex-Ankern oder zu lesbaren Fallbacks im Codex. Reflexionen speichern Herkunft und Kontext, damit `/mein-pfad` Rueckwege bilden kann.

## Beteiligte Dateien

- `components/SymbolNetwork.tsx`: Startpunkt im Symbolnetz. Baut Codex- und Raum-Links mit `from=symbolnetz`, `symbol`, `lens` und optional `path`.
- `app/codex/[id]/page.tsx`: Detailseite fuer Codex-Anker. Zeigt Wasser-Rueckwegkarten ueber `getWaterCodexAnchorBridge` und verknuepft Bibelanker, Bedeutungsfelder und Raumwege.
- `app/codex/page.tsx`: Codex-Uebersicht. Nutzt Query-Fallbacks wie `/codex?meaning=...` und `/codex?scripture=...`, wenn ein Tor noch keinen Detailanker hat.
- `app/mein-pfad/page.tsx`: Zeigt gespeicherte Reflexionen, gruppiert Spuren und rendert Rueckwege ueber `resolveReflectionReturnLinks`.
- `components/rooms/engine/SymbolEngineRoom.tsx`: Raum-Engine. Liest `roomContext`, zeigt Eintrittsspur und bietet Weiterwege zu Mein Pfad, Codex und Symbolnetz.
- `components/rooms/engine/ReflectionOverlay.tsx`: Speichert Reflexionen mit `symbolSlug`, `codexHref`, `roomHref`, `pathLabel` und `pathContext`.
- `lib/symbols/symbolPathConfig.ts`: Zentrale Bridge-Konfiguration. Definiert Wasser-CTAs, Codex-Tore, Ankerliste, Rueckwegtexte und Reflexionslabels.
- `lib/codex/linking.ts`: Loest Bedeutungs- und Bibelstellen-Chips auf. Bevorzugt echte Codex-Eintraege und erzeugt Fallback-Queries.
- `lib/codex/codexRegistry.ts`: Enthalt die konkreten Codex-Eintraege, darunter Wasser, Bedeutungsanker und Bibelstellenanker.
- `lib/reflections.ts`: Normalisiert alte und neue Reflexionen, speichert sie und erzeugt Rueckwege aus `/mein-pfad`.
- `lib/rooms/roomContext.ts`: Baut Raum-Links mit Kontext und loest Eintritts-/Rueckwegtexte fuer Codex, Symbolnetz und Mein Pfad.
- `scripts/validate-bridges.js`: Prueft Meaning Bridges und den verpflichtenden Wasser-Referenzpfad.

## Weglogik

1. Symbolnetz oeffnet Wasser:
   `components/SymbolNetwork.tsx` liest `getSymbolPathConfig("wasser")` und baut Links nach `/codex/wasser?...` oder `/raeume/wasser?...`.

2. Codex-Mitte oeffnet Tore:
   `/codex/wasser` nutzt die Wasser-Gates aus `symbolPathConfig.ts`. Bedeutungsfelder und Bibelstellen werden ueber `lib/codex/linking.ts` zu echten Codex-Routen oder Fallback-Queries.

3. Ankerseiten fuehren zurueck:
   `app/codex/[id]/page.tsx` fragt `getWaterCodexAnchorBridge(anchorId)` ab. Nur konfigurierte Wasser-Anker erhalten Rueckwegkarte, Raum-Link und optional Mein-Pfad-Link.

4. Raum uebernimmt Kontext:
   Raum-Links tragen `from`, `path` und `symbol`. `lib/rooms/roomContext.ts` erzeugt daraus lesbare Eintrittstexte und Rueckwege.

5. Reflexion bewahrt Kontext:
   `ReflectionOverlay.tsx` speichert die Antwort mit `pathContext: { from, path, symbol }`, damit spaeter nachvollziehbar bleibt, welche Spur betreten wurde.

6. Mein Pfad baut Rueckwege:
   `lib/reflections.ts` erzeugt fuer Wasser Ruecklinks zur Codex-Spur, zum Wasser-Codex, zum Wasserraum mit `from=mein-pfad` und zum Symbolnetz.

## Mindestbestandteile

### A) Pflicht fuer einen vollstaendigen Referenzpfad

- Symbolnetz-CTA zum Codex und zum Raum.
- Zentrale Bridge-Konfiguration in `lib/symbols/symbolPathConfig.ts`.
- Kuratierte Codex-Mitte als echte Route, z. B. `/codex/wasser`.
- Klickbare Bedeutungsfelder.
- Klickbare Bibelstellen.
- Fallbacks fuer noch nicht erschlossene Tore ueber `/codex?meaning=...` oder `/codex?scripture=...`.
- Echte Codex-Anker fuer zentrale Bedeutungsfelder.
- Echte Codex-Anker fuer zentrale Bibelstellen.
- Rueckweg-Karte auf allen zentralen Ankerseiten.
- Raum-Link mit `from`, `path` und `symbol`, wo Kontext vorhanden ist.
- Reflexion mit Herkunfts- und Pfadkontext.
- Anzeige in `/mein-pfad`.
- Rueckwege aus `/mein-pfad` in Codex, Raum und Symbolnetz.
- Validator-Pruefung fuer den Referenzpfad.

### B) Optional / spaeter ausbaubar

- Weitere Story-, Journey-, Zahlen- oder Letter-Anker.
- Spezifische Kontextlabels pro Anker.
- Zusaetzliche Resonanzpfade oder tiefer kuratierte Unterraeume.
- Erweiterte Reflexionslabels fuer einzelne Stationen.
- Spezielle Raum-Kontexttexte pro Lens oder Journey.

### C) Nicht erzwingen, solange ein Symbol noch nicht vollstaendig kuratiert ist

- Keine Pflicht, jeden sichtbaren Chip eines unfertigen Symbols auf eine Detailseite zu zwingen.
- Keine Validatorpflicht fuer Licht, Feuer, Wueste oder Brot.
- Keine Rueckwegkarte auf Ankerseiten, die noch nicht Teil eines vollstaendigen Pfads sind.
- Keine Raumlogik nur deshalb aendern, weil ein Symbol spaeter einen Pfad bekommen koennte.
- Keine neuen Codex-Anker ohne kuratorische Entscheidung.

## Wasser-Bridge

Die Wasser-Bridge ist in `lib/symbols/symbolPathConfig.ts` unter `symbolPathConfigs.wasser` konfiguriert.

Aktuelle Wasser-Anker:

- `wasser`
- `tiefe`
- `reinigung`
- `uebergang`
- `geburt`
- `verborgenheit`
- `genesis-1-2`
- `exodus-14`

Die sichtbaren Codex-Gates liegen in `codexGates.meaningFields` und `codexGates.scriptureAnchors`. Die Rueckwegfaehigkeit der Detailanker liegt in `codexAnchorBridge.anchorIds`.

## Link-Aufloesung

`lib/codex/linking.ts` ist die Aufloesungsschicht.

- `resolveMeaningFieldHref(value, "wasser")` sucht zuerst ein kuratiertes Bedeutungsfeld, dann einen echten Codex-Eintrag. Gibt es einen Eintrag, entsteht `/codex/{id}`. Gibt es keinen Eintrag, entsteht `/codex?meaning={slug}`.
- `resolveScriptureAnchorHref(value, "wasser")` sucht kuratierte Bibelanker und bevorzugt konfigurierte `href`-Werte. Sonst wird ein echter Codex-Eintrag genutzt oder `/codex?scripture={slug}` erzeugt.
- `getWaterCodexChipLinks()` erzeugt die sichtbaren Chip-Links fuer Wasser.
- `getWaterCodexAnchorBridge(anchorId)` erzeugt Rueckwegdaten fuer konfigurierte Wasser-Anker.

Fallbacks sind erlaubt, solange sie lesbar in den Codex fuehren und keine 404 erzeugen. Ein Fallback ist kein vollstaendiger Anker, sondern ein geordneter Zwischenzustand.

## Rueckwege

Ankerseiten:

- Rueckweg zum Wasser-Codex: `returnHref: /codex/wasser`.
- Raum-Link: `/raeume/wasser?from=codex&path={anchorId}&symbol=wasser`.
- Optionaler Link zu `/mein-pfad`.

Raum:

- `buildRoomHref` erzeugt Kontextlinks.
- `resolveRoomContext` liest `from=codex`, `from=symbolnetz` oder `from=mein-pfad` und erzeugt lesbare Eintritts- und Rueckwegtexte.

Mein Pfad:

- `ReflectionOverlay.tsx` speichert `pathContext`.
- `resolveReflectionReturnLinks` baut aus Wasser-Reflexionen die Rueckwege:
  - Spur zurueck: `/codex/{path}` falls der Pfad ein Codex-Eintrag ist.
  - Wasser-Codex: `/codex/wasser`.
  - Wasserraum: `/raeume/wasser?from=mein-pfad&path={path}&symbol=wasser`.
  - Symbolnetz: `/symbolnetz?symbol=wasser`.

## Validator-Regeln

`scripts/validate-bridges.js` prueft:

- Wasser hat Codex- und Raum-Gate.
- Wasser-Chips sind dedupliziert und fuehren zu gueltigen Codex-Routen oder Fallback-Queries.
- Genesis 1,2 und Exodus 14 sind genau einmal als Wasser-Bibelanker konfiguriert.
- Alle Pflichtanker sind in `codexAnchorBridge.anchorIds` enthalten.
- Jeder Wasser-Anker hat einen echten Codex-Eintrag und eine Rueckweg-Bridge.
- Reflexionslinks aus `/mein-pfad` zeigen nicht auf fehlende Routen und zeigen keine technischen IDs als Label.
- Raumkontext fuer Codex, Symbolnetz und Mein Pfad bleibt lesbar.

Andere Symbole duerfen Hinweise erzeugen, sind aber nicht verpflichtend.

## Phase-30-Notiz

Naechster moeglicher Ausbau: Lichtpfad nach Wasser-Blueprint.

Felder, die spaeter analog ergaenzt werden koennten:

- `codexHref`
- `roomHref`
- `meaningFields`
- `scriptureAnchors`
- `bridgeAnchors`
- `reflectionLabels`
- `roomContextLabels`

Noch nicht anlegen: Licht-Anker, Licht-Chips, Licht-Validatorpflicht oder Licht-Raumlogik.
