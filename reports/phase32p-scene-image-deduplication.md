# Phase 32P - Szenenbild-Deduplizierung

Pruefung: `visual.image` der Raum-Zustaende fuer Wasser, Licht, Feuer, Wueste und Brot.

Regel: Innerhalb eines Raumes soll keine Station dasselbe Szenenbild wie eine andere Station verwenden. Vorzustand liest sich als Schwelle, Hauptzustand als Erfahrung, Nachzustand als Integration.

## Gefundene Duplikate

| Raum | Stationen | Duplikat |
| --- | --- | --- |
| Wasser | Vor der Ordnung + Tiefe | `/Visuals/wasser_tiefenbild.png` |
| Wasser | Grenze + Reinigung | `/Visuals/wasser_makro.png` |
| Wasser | Tiefe + Quelle | `/Visuals/wasser_tiefenbild.png` |
| Licht | Vor dem Licht + Licht auf dem Weg | `/Visuals/licht_morgenlinie_ordung.png` |
| Brot | Manna + Brot des Lebens | `/Visuals/brot_tau_manna.png` |
| Feuer | Keine | - |
| Wueste | Keine | - |

## Neue Zuordnung

### Wasser

| Station | Szenenbild | Status |
| --- | --- | --- |
| Vor der Ordnung | `/Visuals/wasser_cinema_hero.png` | neu zugeordnet |
| Tiefe | `/Visuals/wasser_tiefenbild.png` | beibehalten |
| Grenze | `/Visuals/wasser_makro.png` | beibehalten |
| Exodus | `/Visuals/wasser_szenenbild.png` | beibehalten |
| Reinigung | `/Visuals/wasser_karte.png` | neu zugeordnet |
| Taufe | `/Visuals/wasser_hebr_symbl.png` | beibehalten |
| Lebendiges Wasser | `/Visuals/wasser_interface_backround.png` | beibehalten |
| Quelle | `/Visuals/wasser_hero.png` | neu zugeordnet |

Begruendung: Die Schwelle nutzt nun ein cineastisches Anfangsbild, die Erfahrung der Tiefe bleibt im Tiefenbild, die Integration der Quelle bekommt mit dem Hero-Bild eine eigene, hellere Gestalt. Reinigung nutzt das Kartenbild als Neuordnung nach der Flut.

### Licht

| Station | Szenenbild | Status |
| --- | --- | --- |
| Vor dem Licht | `/Visuals/cinem_lichtraum_backround.png` | neu zugeordnet |
| Es werde Licht | `/Visuals/licht_raum_hero.png` | beibehalten |
| Licht auf dem Weg | `/Visuals/licht_morgenlinie_ordung.png` | beibehalten |
| Licht in dir | `/Visuals/licht_spiegel_erkenntnis.png` | beibehalten |

Begruendung: Die Schwelle vor dem Licht erhaelt das dunklere Raum-Bild; die Morgenlinie bleibt der Weg- und Orientierungserfahrung vorbehalten.

### Feuer

| Station | Szenenbild | Status |
| --- | --- | --- |
| Verborgenes Feuer | `/Visuals/feuer_ritzen_glut.png` | beibehalten |
| Dornbusch | `/Visuals/feuer_glut_raum.png` | beibehalten |
| Feuersaeule | `/Visuals/feuer_rauch_spur.png` | beibehalten |
| Laeuterndes Feuer | `/Visuals/feuer_asche_makro.png` | beibehalten |

Begruendung: Keine Duplikate im Szenenbild; die Folge bleibt Schwelle, Erfahrung und Integration klar getrennt.

### Wueste

| Station | Szenenbild | Status |
| --- | --- | --- |
| Die Leere | `/Visuals/wueste_nacht_raum.png` | beibehalten |
| Die Pruefung | `/Visuals/wueste_staubreise.png` | beibehalten |
| Die Fuehrung | `/Visuals/wueste_pfadschatten.png` | beibehalten |
| Die Stimme | `/Visuals/wueste_hebrew_sand.png` | beibehalten |

Begruendung: Keine Duplikate im Szenenbild; die Stationen behalten ihre eigene visuelle Identitaet.

### Brot

| Station | Szenenbild | Status |
| --- | --- | --- |
| Korn | `/Visuals/brot_korn_staub.png` | beibehalten |
| Manna | `/Visuals/brot_tau_manna.png` | beibehalten |
| Brechen | `/Visuals/brot_krumenweg.png` | beibehalten |
| Brot des Lebens | `/Visuals/brot_manna_gabe.png` | neu zugeordnet |

Begruendung: Manna behaelt das Tau-/Manna-Bild als Gabe fuer den Tag; Brot des Lebens nutzt das groessere Gabebild und wird dadurch zur Integration statt zur Wiederholung.

## Ergebnis

Nach der Neuzuordnung gibt es in den geprueften Raeumen keine doppelten Szenenbilder innerhalb eines Raumes und keine aufeinanderfolgenden Szenenbild-Duplikate.
