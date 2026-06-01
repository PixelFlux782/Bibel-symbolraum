# Symbolnetz UX Audit

## Kurzfazit

Das neue Symbolnetz funktioniert als ruhiger Einstieg in ein Bedeutungsnetz:
Wasser, Licht und Feuer sind als drei gleichwertige Symbole erkennbar, ihre
unmittelbaren Bedeutungsfelder leuchten beim Fokussieren auf, und der
Raumwechsel ist von den Bedeutungswegen getrennt.

Der Zweck wird aber erst teilweise erfüllt. Ein neuer Nutzer sieht, **dass**
die Symbole verbunden sind, versteht aber nicht immer, **warum**. Die
vorhandenen Graph-Daten enthalten mehr Erklärung, als die Oberfläche derzeit
zeigt. Besonders auf Mobile kippt das Netz von Entdeckung zurück in eine
Pfadliste.

## Prüfung

### 1. Warum sind Wasser, Licht und Feuer verbunden?

**Teilweise verständlich.** Die drei benannten Pfade geben eine erste
Orientierung. Nach Auswahl eines Pfads zeigt das Panel eine knappe Bewegung,
zum Beispiel `Tiefe → Offenbarung`.

Für einen neuen Nutzer bleiben die Begründungen jedoch zu dünn:

- `Schöpfung` ist mit `Genesis 1` plausibel, aber die Bewegung von Wasser zu
  Licht wird nicht ausformuliert.
- `Reinigung` zeigt `Reinigung → Reinigung`. Das belegt die Gemeinsamkeit,
  erklärt aber nicht die unterschiedliche Rolle von Wasser und Feuer.
- `Offenbarung` zeigt `Gegenwart → Orientierung` und `Exodus 13,21`. Das ist
  nachvollziehbar, wirkt semantisch aber eher wie Führung als wie
  Offenbarung.

### 2. Raum öffnen oder Verbindung folgen?

**Grundsätzlich sichtbar.** `Verbindungen folgen` ist ein eigener Bereich mit
kleinen Pfad-Aktionen. Die CTA `<Symbol>-Raum öffnen` steht separat und ist
visuell gewichtiger.

Unklar bleibt das Verhalten nach dem Folgen eines Pfads: Der Fokus springt
immer zum definierten Ziel des Pfads, nicht verlässlich zum jeweils anderen
Symbol. Wer einen Pfad vom Zielknoten aus auswählt, erlebt deshalb teilweise
keinen sichtbaren Ortswechsel. Das schwächt das Gefühl des Folgens.

### 3. Aleph zwischen אור und אש

**Sichtbar, aber noch nicht verständlich.** Die Desktop-Konstellation markiert
das gemeinsame Aleph zwischen Licht und Feuer. Nach Auswahl des passenden
Pfads steht zusätzlich, dass `אור` und `אש` Aleph teilen.

Es fehlt die Deutung, warum diese Gemeinsamkeit wichtig ist. Die vorhandenen
Raumdaten beschreiben Aleph bereits als Ursprung, Stille und verborgene
Gegenwart. Diese Bedeutung erreicht das Netz nicht. Auf Mobile fehlt die
Aleph-Markierung vollständig.

### 4. Sind die drei Pfade selbsterklärend?

**Unterschiedlich stark.**

| Pfad | Verständlichkeit | Grund |
| --- | --- | --- |
| Schöpfung | gut als Einstieg | `Genesis 1` und `Tiefe → Offenbarung` bilden eine erkennbare Bewegung. |
| Reinigung | schwach | `Reinigung → Reinigung` ist korrekt, aber tautologisch. |
| Offenbarung | mittel | `Exodus 13,21` und `Gegenwart → Orientierung` sind lesbar, erklären den Pfadnamen aber nur indirekt. |

### 5. Doppelt gezeigte Informationen

- Die Symbolauswahl erscheint als obere Buttons, große Graph-Knoten und
  Fokusdarstellung im Panel.
- Auf Mobile stehen die drei Pfade zuerst als Liste und danach teilweise
  erneut unter `Verbindungen folgen`.
- `Licht` und `Feuer` erscheinen jeweils als großes Symbol und als kleiner
  gleichnamiger Bedeutungsknoten. Ohne Erklärung der Ebenen wirkt das wie ein
  Duplikat.
- `Reinigung` erscheint zugleich als Pfadname und Bedeutungssatellit.

### 6. Verborgene Informationen aus dem Meaning Graph

- Die Beschreibungen der Bedeutungsknoten werden mitgebaut, aber an den
  Satelliten nicht gezeigt.
- Die kuratierten `MeaningRelation`-Texte bleiben vollständig unsichtbar,
  etwa `Licht zeigt eine Richtung für den nächsten Schritt`.
- Die Pfad-Zusammenfassung wird erzeugt, aber nicht angezeigt.
- Mehrere vorhandene Knoten erreichen die sichtbare Ableitung nicht:
  `Chaos`, `Geburt`, `Leben`, `Verborgenheit` und `Bewusstsein`.
- Biblische Ursprünge wie Taufe, Dornbusch, Johannes 1 und Maleachi 3 bleiben
  im Netz verborgen. Sichtbar sind nur die sehr knappen Pfad-Evidenzen.
- Die in den Raumdaten vorhandene Bedeutung des Aleph bleibt verborgen.

### 7. Wo fühlt sich das Netz wie Navigation an?

- Bei den oberen Symbol-Buttons und der Raum-CTA.
- Im rechten Panel, wenn Pfadnamen vor allem als auswählbare Liste erscheinen.
- Auf Mobile fast vollständig: Die Konstellation ist ausgeblendet, sichtbar
  bleiben Pfadkarten und Panel-Aktionen.

### 8. Wo fühlt sich das Netz wie Entdeckung an?

- Beim Wechsel des fokussierten Symbols: Zugehörige Satelliten und Linien
  treten hervor, andere sinken zurück.
- Beim sichtbaren Dreieck aus Wasser, Licht und Feuer.
- Beim gemeinsamen Aleph zwischen Licht und Feuer.
- Beim Öffnen eines Bedeutungswegs im Panel: Ein Pfad wird als semantische
  Bewegung statt nur als Zielroute lesbar.

## Stärken

- Klare Reduktion auf drei tragende Symbole statt eines überfüllten Graphen.
- Gute visuelle Trennung zwischen Fokus, Bedeutungsweg und Raumöffnung.
- Das Aufleuchten der Satelliten vermittelt Beziehungen ohne langen Text.
- Die drei Pfade geben dem freien Netz eine verständliche erste Dramaturgie.
- Das Aleph ist ein starker Moment echter Entdeckung, weil es nicht nur
  Navigation, sondern eine sprachliche Beziehung sichtbar macht.

## Schwächen

- Die Oberfläche zeigt Beziehungen häufiger als Linien denn als lesbare
  Begründungen.
- Zwei der drei Pfade sind in ihrer aktuellen Kurzform semantisch zu indirekt.
- Das Aleph wird markiert, aber nicht gedeutet.
- Die mobile Darstellung verliert den eigentlichen Netzcharakter.
- Vorhandene Graph-Texte und Relationsdaten werden nur unvollständig genutzt.

## Top 5 Verbesserungen

1. Die bereits erzeugte Pfad-Zusammenfassung im bestehenden Bedeutungsweg-Panel
   sichtbar machen, damit jeder Pfad eine kurze Begründung erhält.
2. `Reinigung` und `Offenbarung` sprachlich schärfen: Wasser und Feuer nicht
   nur über identische Begriffe, sondern über ihre unterschiedliche Bewegung
   lesbar machen.
3. Beim Aleph die vorhandene Kurzdeutung ergänzen: gemeinsamer Anfang,
   Ursprung, Stille und verborgene Gegenwart.
4. Die mobile Pfadliste so verdichten, dass Pfade nicht doppelt erscheinen und
   die drei Symbolbeziehungen trotz fehlender Konstellation als Netz lesbar
   bleiben.
5. Die Hierarchie der kleinen Satelliten deutlicher machen: Bedeutungsknoten
   sind Deutungsebenen der Symbole, keine weiteren navigierbaren Räume.

