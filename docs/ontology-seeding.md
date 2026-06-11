# SYMBOLRAUM Ontology Seeding Rules

## 1. Grundsatz

Die Hierarchie steuert Sichtbarkeit.
Die Ontologie beschreibt Bedeutung.

Validator-Warnings sind redaktionelle Hinweise. Sie werden entweder fachlich behoben oder bewusst als Uebergangszustand dokumentiert.

## 2. Neue Entity anlegen

Jede neue wichtige Entity braucht:

- id
- type
- title
- summary
- domain
- archetypalRole, wenn type archetype/symbol/concept ist
- tags
- optional: hebrew, transliteration, gematria, aliases, firstMention, polarity, imageSymbol, clusterId

Keine Entity nur anlegen, damit eine Warning verschwindet. Sie braucht einen tragenden Satz:

`X ist im SYMBOLRAUM eine Entity, weil ...`

## Core-Concepts

Core-Concepts sind keine Tags, sondern Bedeutungsachsen.

Sie werden nur angelegt, wenn mehrere bestehende Symbole, Unterraeume oder Relationen auf sie zulaufen.

Neue Core-Concepts brauchen:

- `type: "concept"`
- `domain`
- `archetypalRole`
- `summary`
- moeglichst `polarity`
- wenige starke Relationen, keine Flut

## 3. Neue Relation anlegen

Jede neue Relation braucht:

- id
- sourceId
- targetId
- type
- title
- shortResonance
- explanation, falls noetig
- strength
- scriptureAnchors oder hebrewAnchors bei starken Relationen

Keine kuenstlichen Anchors setzen. Wenn ein Anker fehlt, entweder die Relation schwaecher modellieren oder die Warning bewusst stehen lassen.

## 4. Relationstyp waehlen

Verwende praezise Typen vor `resonates_with`.

Bevor `resonates_with` genutzt wird, pruefe:

- is_expression_of
- opens_into
- is_threshold_to
- contains_pattern
- reveals
- emerges_from
- contrasts_with
- shares_letter
- shares_number
- appears_in_story

## 5. Pattern-Regel

`contains_pattern` darf nur auf Entities mit `domain: "pattern"` zeigen.

Pattern-Entities sind:

- type: "concept"
- domain: "pattern"
- mit archetypalRole
- moeglichst mit polarity

## 6. Polarity-Regel

Innere Spannungen gehoeren zuerst an `entity.polarity`.

`has_polarity` nur verwenden, wenn die Polaritaet selbst als Concept/Pattern-Entity existiert.

## 7. Sichtbarkeitsregel

Nicht jede Ontologie-Relation erscheint im Symbolnetz.

Overview bleibt kuratiert.
Fokus/Detail duerfen mehr zeigen.
Inspector erklaert.
Codex vertieft.

## 8. Unterraeume anbinden

Unterraeume aus der Hierarchie werden nicht automatisch zu ontologischer Wahrheit.

Wenn ein Unterraum ontologisch relevant ist, bekommt er:

- eine OntologyEntity
- `primaryHierarchyId`
- `domain`
- `archetypalRole`
- maximal 2-4 Kernrelationen
- bevorzugt `is_expression_of`, `opens_into`, `is_threshold_to`, `contains_pattern`

## 9. Qualitaetsschwelle

Keine Relation ohne guten Satz:

`X steht mit Y in Beziehung, weil ...`

Wenn dieser Satz schwach klingt, Relation nicht anlegen.

## 10. Bewusst akzeptierte Warnings

Eine Warning darf stehen bleiben, wenn sie einen legitimen Uebergangszustand markiert:

- Ein Begriff ist redaktionell wichtig, aber noch nicht als Entity modelliert.
- Ein Story- oder Versanker existiert noch nicht in der Ontologie.
- Eine starke symbolische Relation ist sinnvoll, aber noch nicht sicher biblisch oder hebraeisch verankert.
- `resonates_with` bleibt stehen, weil kein praeziserer Relationstyp fachlich passt.

Akzeptierte Warnings werden im Phasenbericht genannt und nicht stillschweigend ignoriert.

## 11. Validierung

Vor Abschluss ausfuehren:

```bash
npm run validate:ontology
npm run build
```
