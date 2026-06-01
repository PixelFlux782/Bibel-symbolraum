# Hebrew Codex Foundation

## Ziel

Der Hebrew Codex bereitet die sprachliche Tiefenlogik der Symbol-Engine vor. Die spätere Bewegungsrichtung lautet:

```text
Hebräischer Buchstabe
→ Wurzel
→ Wort
→ Symbol
→ Bibelstellen
→ Bedeutungsnetz
→ persönliche Erfahrung
```

Die Symbolräume bleiben kuratierte Erlebnisse. Der Codex schafft darunter eine globale, wiederverwendbare Datenebene für Buchstaben, Wörter, mögliche Wurzeln, biblische Referenzen und Erfahrungsfelder.

## Unterschied zur SymbolEngineData

`SymbolEngineData` beschreibt einen konkreten Symbolraum und seine Dramaturgie: Stationen, visuelle Zustände, Szenen, Verbindungen und Reflexionsfragen.

Der Hebrew Codex ist davon unabhängig. Er beschreibt globale sprachliche Entitäten:

- `HebrewLetter`: ein Buchstabe mit Form, Zahlenwert und kuratierten Deutungsfeldern
- `HebrewRoot`: eine mögliche konsonantische Wurzel mit semantischem Feld
- `HebrewWord`: ein konkretes hebräisches Wort mit Buchstabenfolge und möglichen Wurzeln
- `HebrewSymbolMapping`: die vorbereitete Verbindung zwischen einem Symbol-Slug und hebräischen Wörtern
- `HebrewMeaningField`: interpretative Bedeutungs- und Erfahrungsfelder
- `HebrewBiblicalReference`: nachvollziehbare biblische Bezugspunkte

Die neue Schicht verändert keine bestehende UI und keine Wasser-Daten.

## Trennung der Ebenen

Philologische Beziehungen und kontemplative Deutungen dürfen verbunden, aber nicht verwechselt werden. Deshalb tragen Bedeutungsfelder und biblische Referenzen eine Provenienz-Kennzeichnung:

- `textual`: direkt im Text sichtbar
- `semantic`: sprachlich plausibel
- `canonical`: durch wiederkehrende biblische Motive gestützt
- `interpretive`: redaktionelle Deutung
- `contemplative`: bewusst offene Reflexion

Buchstabensymbolik wird im Codex ausdrücklich als interpretative Ebene geführt. Sie ist keine automatische historische Wortableitung.

## Wasser und מים

Das Wort `מים` (`majim`, Wasser) wird als Buchstabenfolge modelliert:

```text
מ Mem
→ Wasser, Tiefe, Mutterleib, Ursprung, Meer, Verborgenheit

י Jod
→ Punkt, Same, Impuls

ם Final-Mem
→ geschlossene Form, bewahrte und verborgene Tiefe
```

Mem unterscheidet seine offene Form `מ` von der geschlossenen Schlussform `ם`. Seine Referenzen verweisen zunächst auf Genesis 1,2, Exodus 14 und Matthäus 3,13-17. Damit werden Urtiefe, Meer, Durchgang, Taufe und Neugeburt als kuratierbare Beziehungen vorbereitet.

`מים` wird bewusst nicht automatisch als gewöhnliche dreiradikalige Verbalwurzel behandelt. Wort und Wurzel bleiben getrennte Entitäten, damit sprachliche Sonderfälle später sauber belegt werden können.

## Erste Wörter und Mappings

Die Foundation enthält zunächst:

| Wort | Transliteration | Bedeutung | Symbol-Slug |
| --- | --- | --- | --- |
| `מים` | `majim` | Wasser | `wasser` |
| `אור` | `or` | Licht | `licht` |
| `אש` | `esch` | Feuer | `feuer` |
| `לחם` | `lechem` | Brot | `brot` |
| `מדבר` | `midbar` | Wüste | `wueste` |

Weitere Symbole können später auf dieselben globalen Buchstaben, Wörter und Bedeutungsfelder zugreifen. Ein Buchstabe oder Wort wird nicht für jeden Symbolraum neu beschrieben.

## Dateien

```text
types/hebrew.ts
lib/hebrew/hebrewLetters.ts
lib/hebrew/hebrewWords.ts
lib/hebrew/symbolHebrewMappings.ts
lib/hebrew/hebrewUtils.ts
lib/hebrew/getSymbolHebrewProfile.ts
lib/hebrew/validateHebrewCodex.ts
```

Der Validator prüft IDs, Buchstaben-Verweise, Wort-Mappings und die beiden Mem-Formen. Alle Utility-Funktionen arbeiten rein datenbasiert und haben keine React-Abhängigkeit.

## Wie prüft man das Hebrew-Profil eines Symbols?

Die reine Debug-/Analyse-Utility `getSymbolHebrewProfile` löst ein Symbol über
seinen Slug oder über ein vorhandenes `SymbolEngineData`-Objekt auf:

```ts
import { getSymbolHebrewProfile } from "@/lib/hebrew/getSymbolHebrewProfile";

const profile = getSymbolHebrewProfile("wasser");
console.dir(profile, { depth: null });
```

Für einen Engine-Datensatz kann dieselbe Funktion direkt verwendet werden:

```ts
const profile = getSymbolHebrewProfile(waterEngineData);
```

Das Profil enthält das `hebrewWord`, die aufgelösten `letters`, die
`meaningFields`, verbundene `relatedSymbolSlugs` und `warnings` für fehlende
Referenzen. Die Utility verändert keine Daten und hat keine UI-Abhängigkeit.

## Leitregel

Hebräisch ist in der künftigen Engine kein Zusatzinhalt. Es ist die Tiefenlogik, aus der kuratierbare Symbolräume hervorgehen.
