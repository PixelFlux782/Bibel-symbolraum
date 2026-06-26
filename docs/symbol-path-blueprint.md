# Symbolpfad-Blueprint

## Zweck

Dieser Blueprint sichert den Wasserpfad als Referenz für spätere Symbolpfade. Er beschreibt die technische Weglogik, die Mindestbestandteile und die Prüfpunkte, ohne neue Symbolpfade auszurollen oder bestehende UI zu verändern.

Wasser ist der einzige verpflichtende Referenzpfad. Licht, Feuer, Wüste und Brot dürfen erst analog ergänzt werden, wenn sie kuratiert sind.

## Referenzpfad Wasser

Die vollständige Bewegung lautet:

Symbolnetz -> Codex -> Bedeutungsanker / Bibelstellenanker -> Raum -> persönliche Reflexion -> Mein Pfad -> Rückweg in Codex / Raum / Symbolnetz.

Der Pfad bleibt ruhig und kuratiert: sichtbare Tore führen entweder zu echten Codex-Ankern oder zu lesbaren Fallbacks im Codex. Reflexionen speichern Herkunft und Kontext, damit `/mein-pfad` Rückwege bilden kann.

## Beteiligte Dateien

- `components/SymbolNetwork.tsx`: Startpunkt im Symbolnetz. Baut Codex- und Raum-Links mit `from=symbolnetz`, `symbol`, `lens` und optional `path`.
- `app/codex/[id]/page.tsx`: Detailseite für Codex-Anker. Zeigt Wasser-Rückwegkarten über `getWaterCodexAnchorBridge` und verknüpft Bibelanker, Bedeutungsfelder und Raumwege.
- `app/codex/page.tsx`: Codex-Übersicht. Nutzt Query-Fallbacks wie `/codex?meaning=...` und `/codex?scripture=...`, wenn ein Tor noch keinen Detailanker hat.
- `app/mein-pfad/page.tsx`: Zeigt gespeicherte Reflexionen, gruppiert Spuren und rendert Rückwege über `resolveReflectionReturnLinks`.
- `components/rooms/engine/SymbolEngineRoom.tsx`: Raum-Engine. Liest `roomContext`, zeigt Eintrittsspur und bietet Weiterwege zu Mein Pfad, Codex und Symbolnetz.
- `components/rooms/engine/ReflectionOverlay.tsx`: Speichert Reflexionen mit `symbolSlug`, `codexHref`, `roomHref`, `pathLabel` und `pathContext`.
- `lib/symbols/symbolPathConfig.ts`: Zentrale Bridge-Konfiguration. Definiert Wasser-CTAs, Codex-Tore, Ankerliste, Rückwegtexte und Reflexionslabels.
- `lib/codex/linking.ts`: Löst Bedeutungs- und Bibelstellen-Chips auf. Bevorzugt echte Codex-Einträge und erzeugt Fallback-Queries.
- `lib/codex/codexRegistry.ts`: Enthalt die konkreten Codex-Einträge, darunter Wasser, Bedeutungsanker und Bibelstellenanker.
- `lib/reflections.ts`: Normalisiert alte und neue Reflexionen, speichert sie und erzeugt Rückwege aus `/mein-pfad`.
- `lib/rooms/roomContext.ts`: Baut Raum-Links mit Kontext und löst Eintritts-/Rückwegtexte für Codex, Symbolnetz und Mein Pfad.
- `scripts/validate-bridges.js`: Prüft Meaning Bridges und den verpflichtenden Wasser-Referenzpfad.

## Weglogik

1. Symbolnetz öffnet Wasser:
   `components/SymbolNetwork.tsx` liest `getSymbolPathConfig("wasser")` und baut Links nach `/codex/wasser?...` oder `/raeume/wasser?...`.

2. Codex-Mitte öffnet Tore:
   `/codex/wasser` nutzt die Wasser-Gates aus `symbolPathConfig.ts`. Bedeutungsfelder und Bibelstellen werden über `lib/codex/linking.ts` zu echten Codex-Routen oder Fallback-Queries.

3. Ankerseiten führen zurück:
   `app/codex/[id]/page.tsx` fragt `getWaterCodexAnchorBridge(anchorId)` ab. Nur konfigurierte Wasser-Anker erhalten Rückwegkarte, Raum-Link und optional Mein-Pfad-Link.

4. Raum übernimmt Kontext:
   Raum-Links tragen `from`, `path` und `symbol`. `lib/rooms/roomContext.ts` erzeugt daraus lesbare Eintrittstexte und Rückwege.

5. Reflexion bewahrt Kontext:
   `ReflectionOverlay.tsx` speichert die Antwort mit `pathContext: { from, path, symbol }`, damit später nachvollziehbar bleibt, welche Spur betreten wurde.

6. Mein Pfad baut Rückwege:
   `lib/reflections.ts` erzeugt für Wasser Rücklinks zur Codex-Spur, zum Wasser-Codex, zum Wasserraum mit `from=mein-pfad` und zum Symbolnetz.

## Mindestbestandteile

### A) Pflicht für einen vollständigen Referenzpfad

- Symbolnetz-CTA zum Codex und zum Raum.
- Zentrale Bridge-Konfiguration in `lib/symbols/symbolPathConfig.ts`.
- Kuratierte Codex-Mitte als echte Route, z. B. `/codex/wasser`.
- Klickbare Bedeutungsfelder.
- Klickbare Bibelstellen.
- Fallbacks für noch nicht erschlossene Tore über `/codex?meaning=...` oder `/codex?scripture=...`.
- Echte Codex-Anker für zentrale Bedeutungsfelder.
- Echte Codex-Anker für zentrale Bibelstellen.
- Rückweg-Karte auf allen zentralen Ankerseiten.
- Raum-Link mit `from`, `path` und `symbol`, wo Kontext vorhanden ist.
- Reflexion mit Herkunfts- und Pfadkontext.
- Anzeige in `/mein-pfad`.
- Rückwege aus `/mein-pfad` in Codex, Raum und Symbolnetz.
- Validator-Prüfung für den Referenzpfad.

### B) Optional / später ausbaubar

- Weitere Story-, Journey-, Zahlen- oder Letter-Anker.
- Spezifische Kontextlabels pro Anker.
- Zusätzliche Resonanzpfade oder tiefer kuratierte Unterräume.
- Erweiterte Reflexionslabels für einzelne Stationen.
- Spezielle Raum-Kontexttexte pro Lens oder Journey.

### C) Nicht erzwingen, solange ein Symbol noch nicht vollständig kuratiert ist

- Keine Pflicht, jeden sichtbaren Chip eines unfertigen Symbols auf eine Detailseite zu zwingen.
- Keine Validatorpflicht für Licht, Feuer, Wüste oder Brot.
- Keine Rückwegkarte auf Ankerseiten, die noch nicht Teil eines vollständigen Pfads sind.
- Keine Raumlogik nur deshalb ändern, weil ein Symbol später einen Pfad bekommen könnte.
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

Die sichtbaren Codex-Gates liegen in `codexGates.meaningFields` und `codexGates.scriptureAnchors`. Die Rückwegfähigkeit der Detailanker liegt in `codexAnchorBridge.anchorIds`.

## Link-Auflösung

`lib/codex/linking.ts` ist die Auflösungsschicht.

- `resolveMeaningFieldHref(value, "wasser")` sucht zuerst ein kuratiertes Bedeutungsfeld, dann einen echten Codex-Eintrag. Gibt es einen Eintrag, entsteht `/codex/{id}`. Gibt es keinen Eintrag, entsteht `/codex?meaning={slug}`.
- `resolveScriptureAnchorHref(value, "wasser")` sucht kuratierte Bibelanker und bevorzugt konfigurierte `href`-Werte. Sonst wird ein echter Codex-Eintrag genutzt oder `/codex?scripture={slug}` erzeugt.
- `getWaterCodexChipLinks()` erzeugt die sichtbaren Chip-Links für Wasser.
- `getWaterCodexAnchorBridge(anchorId)` erzeugt Rückwegdaten für konfigurierte Wasser-Anker.

Fallbacks sind erlaubt, solange sie lesbar in den Codex führen und keine 404 erzeugen. Ein Fallback ist kein vollständiger Anker, sondern ein geordneter Zwischenzustand.

## Rückwege

Ankerseiten:

- Rückweg zum Wasser-Codex: `returnHref: /codex/wasser`.
- Raum-Link: `/raeume/wasser?from=codex&path={anchorId}&symbol=wasser`.
- Optionaler Link zu `/mein-pfad`.

Raum:

- `buildRoomHref` erzeugt Kontextlinks.
- `resolveRoomContext` liest `from=codex`, `from=symbolnetz` oder `from=mein-pfad` und erzeugt lesbare Eintritts- und Rückwegtexte.

Mein Pfad:

- `ReflectionOverlay.tsx` speichert `pathContext`.
- `resolveReflectionReturnLinks` baut aus Wasser-Reflexionen die Rückwege:
  – Spur zurück: `/codex/{path}` falls der Pfad ein Codex-Eintrag ist.
  – Wasser-Codex: `/codex/wasser`.
  – Wasserraum: `/raeume/wasser?from=mein-pfad&path={path}&symbol=wasser`.
  – Symbolnetz: `/symbolnetz?symbol=wasser`.

## Validator-Regeln

`scripts/validate-bridges.js` prüft:

- Wasser hat Codex- und Raum-Gate.
- Wasser-Chips sind dedupliziert und führen zu gültigen Codex-Routen oder Fallback-Queries.
- Genesis 1,2 und Exodus 14 sind genau einmal als Wasser-Bibelanker konfiguriert.
- Alle Pflichtanker sind in `codexAnchorBridge.anchorIds` enthalten.
- Jeder Wasser-Anker hat einen echten Codex-Eintrag und eine Rückweg-Bridge.
- Reflexionslinks aus `/mein-pfad` zeigen nicht auf fehlende Routen und zeigen keine technischen IDs als Label.
- Raumkontext für Codex, Symbolnetz und Mein Pfad bleibt lesbar.

Andere Symbole dürfen Hinweise erzeugen, sind aber nicht verpflichtend.

## Phase-30-Notiz

Nächster möglicher Ausbau: Lichtpfad nach Wasser-Blueprint.

Felder, die später analog ergänzt werden könnten:

- `codexHref`
- `roomHref`
- `meaningFields`
- `scriptureAnchors`
- `bridgeAnchors`
- `reflectionLabels`
- `roomContextLabels`

Noch nicht anlegen: Licht-Anker, Licht-Chips, Licht-Validatorpflicht oder Licht-Raumlogik.
