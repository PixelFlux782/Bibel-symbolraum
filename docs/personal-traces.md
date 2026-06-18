# Personal Traces / Spurenkreislauf

## Prinzip

Der persoenliche Spurenkreislauf beschreibt die ruhige Rueckbewegung:

Raum -> Spur -> Mein Pfad -> Codex -> Raum

Eine persoenliche Spur ist eine gespeicherte Reflexion zu einem Symbol, Raum, Codex-Anker oder Journey-Schritt. Sie bleibt eine lokale Erinnerung des Besuchs und ist keine Progress-, Level- oder Historienlogik.

## Speicher

Spuren liegen im bestehenden LocalStorage-Format unter `REFLECTION_STORAGE_KEY`. Die zentrale Struktur ist `StoredReflection` in `lib/reflections.ts`.

Wichtige Felder:

- `id`: stabile Identifikation der gespeicherten Reflexion.
- `symbol` und `symbolSlug`: sichtbares Symbol und technische Symbolzuordnung.
- `sourceType`, `sourceId`, `source`, `sourceLabel`: Herkunft der Spur.
- `question`, `answer`, `text`: Reflexionsinhalt. `answer` ist das fuehrende Feld, `text` bleibt Legacy-Fallback.
- `codexHref`, `roomHref`: Rueckwege in Codex und Raum.
- `path`, `pathLabel`, `pathContext`: Journey- oder Ankerkontext mit lesbarer Beschriftung.
- `createdAt`: Sortierung und Auswahl der letzten Spur.

Keine Storage-Migration ohne bewusste Phase. Neue Phasen duerfen das bestehende Reflection-Format nicht stillschweigend ersetzen.

## Zentrale Helper

- `STORED_REFLECTIONS_UPDATED_EVENT`: lokales Refresh-Signal nach dem Speichern.
- `readStoredReflections`: liest LocalStorage browser-sicher und normalisiert alte Daten.
- `parseStoredReflections`: parst aktuelle Arrays und alte Wasser-Legacy-Daten.
- `isReflectionUsable`: prueft, ob eine Spur sichtbaren Inhalt hat.
- `getPersonalTraceForSymbol`: waehlt die persoenliche Symbolspur fuer Codex-Orte.
- `getLatestReflectionForSymbol`: waehlt die neueste gueltige Symbolspur.
- `getJourneyReflectionForStep`: bevorzugt Journey-Spuren fuer Journey-Schritte.
- `getRoomReflectionForSymbol`: waehlt die Rueckkehr-Spur fuer Symbolraeume.
- `getReflectionPreview`: erzeugt den sichtbaren Auszug aus `answer || text`.
- `getReflectionContextLabel`: erzeugt lesbare Herkunftstexte statt technischer IDs.
- `saveStoredReflection`: speichert eine Spur und loest das Refresh-Signal aus.

## Anzeigeorte

- `/mein-pfad`: zentrale Sammlung gespeicherter Spuren, Journey-Spuren und Rueckwege.
- Codex-Symbolseiten: `components/CodexPersonalTraceCard.tsx` zeigt die persoenliche Symbolspur.
- Symbolraeume: `components/rooms/engine/RoomPersonalTraceCard.tsx` zeigt die Rueckkehr-Karte.
- Symbolnetz-Inspector: zeigt Journey-Zugehoerigkeit und fuehrt in passende Symbolkontexte.

## Legacy-Verhalten

Alte Wasser-Daten aus frueheren LocalStorage-Objekten bleiben sichtbar. Alte Inhalte koennen ueber `answer`, `text` oder `reflection` kommen und werden auf `answer` normalisiert. Der sichtbare Preview nutzt weiter `answer || text`, damit alte Spuren nicht verschwinden.

Journey-Spuren duerfen bevorzugt werden, wenn der aktuelle Ort ein Journey-Kontext ist. Normale Symbol- und Raumspuren bleiben trotzdem gueltig und duerfen nicht durch Journey-Logik entwertet werden.

## Sichtbare Sprache

Erlaubte CTA- und Label-Sprache:

- `In Mein Pfad ansehen`
- `Raum erneut betreten`
- `Im Codex vertiefen`
- `Deine Spur`
- `Deine Spur zu diesem Symbol`
- `Du warst hier schon`
- `Aus dem Wasser-Raum`
- `Aus der Journey: Vom Wasser zum Brot`

Nicht erlaubt im sichtbaren UI:

- `symbolSlug`
- `sourceType`
- `from=journey`
- `journey-wasser-zum-brot`
- rohe Slugs wie `wueste`, wenn ein lesbares Label vorhanden ist
- Debug-Hinweise

Technische Werte duerfen in Props, Querystrings und gespeicherten Daten existieren. Sie duerfen aber nicht als sichtbarer Text oder rohe Kontextbeschriftung erscheinen.

## Invarianten

- Keine technischen IDs im UI.
- Keine rohen Querystrings im UI.
- Legacy-`answer` bleibt sichtbar; Legacy-`text` bleibt Fallback.
- Journey-Spuren duerfen bevorzugt werden, aber normale Symbolspuren bleiben gueltig.
- Keine Progress-, Level-, Timeline- oder Gamification-Logik.
- Keine neue Journey-Daten- oder Ontologie-Schicht durch Trace-Absicherung.
- Keine Storage-Migration ohne eigene Phase.
- Rueckwege bleiben echte Links in bestehende Orte: Mein Pfad, Codex, Raum, Symbolnetz.

## Smoke-Checkliste

Da keine Playwright-Struktur im Projekt liegt, bleibt der Smoke-Check vorerst manuell:

- `/mein-pfad`
- `/codex/wasser`
- `/raeume/wasser`
- `/raeume/feuer?from=journey&path=dornbusch&symbol=feuer`
- Mobile 390x844, falls UI-Dateien geaendert wurden
