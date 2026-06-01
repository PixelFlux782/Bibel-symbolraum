# Symbol-Engine: internes Entwickler-Handbuch

## Zielbild

Neue Symbolraeume werden nach dem Wasser-Vorbild gebaut: eine cineastische,
zustandsbasierte Reise durch wenige Stationen. Die Seite ist kein Artikel.
Bildraum, Bewegung und eine klare Handlung fuehren; Text erklaert nur knapp.

Wasser ist die Referenzimplementierung unter `/raeume/wasser`.

## 1. Wie funktioniert die Symbol-Engine?

Die Engine trennt Darstellung und Inhalt:

- `SymbolEngineRoom` ist die gemeinsame Oberflaeche fuer jedes Symbol.
- Ein `SymbolEngineData`-Objekt liefert Wort, Stationen, Szenen und Verbindungen.
- `useSymbolEngine` haelt den aktiven Zustand, die aktive Bedeutungsebene und
  den ausgewaehlten hebraeischen Buchstaben.
- `EngineStage` setzt pro Station Bild, Hintergrundbild, Schleier und
  Atmosphaerenwerte.
- Die rechte Ebene zeigt wahlweise `Hebraeisch`, `Bibelstelle` oder
  `Symbolnetz`. Die Reflexionsfrage bleibt sichtbar.

Beim Wechsel einer Station werden ihre referenzierten Buchstaben, Bibelszenen,
Symbolverbindungen und ihre visuelle Atmosphaere gemeinsam aktiviert.

Die drei Bedeutungsebenen sind feste Engine-Funktionen:

| Ebene | Quelle im Zustand | Darstellung |
| --- | --- | --- |
| Hebraeisch | `hebrewLetterIds`, `hebrewSummary` | Wort, Buchstaben und Deutung |
| Bibelstelle | `biblicalSceneIds` | referenzierte biblische Szenen |
| Symbolnetz | `connectionIds` | referenzierte Symbolverbindungen |

## 2. Zentrale Dateien

| Datei | Aufgabe |
| --- | --- |
| `types/engine.ts` | Verbindliche Typen der neuen Symbol-Engine |
| `components/rooms/engine/SymbolEngineRoom.tsx` | Gemeinsames Layout aller neuen Symbolraeume |
| `components/rooms/engine/useSymbolEngine.ts` | Auswahl- und Navigationslogik |
| `components/rooms/engine/EngineStage.tsx` | Visuelle Buehne und CSS-Hooks |
| `components/rooms/engine/EngineNavigation.tsx` | Stationsnavigation |
| `components/rooms/engine/HebrewLayer.tsx` | Hebraeische Bedeutungsebene |
| `components/rooms/engine/BiblicalSceneLayer.tsx` | Biblische Bedeutungsebene |
| `components/rooms/engine/SymbolConnectionPanel.tsx` | Symbolnetz-Ebene |
| `components/rooms/engine/ReflectionOverlay.tsx` | Eine Reflexionsfrage pro Station |
| `components/rooms/water/waterEngineData.ts` | Referenzdaten fuer Wasser |
| `app/engine.css` | Gemeinsame Bildsprache und optionale Atmosphaeren-Sonderfaelle |
| `app/raeume/wasser/page.tsx` | Minimale Einbindung eines Engine-Raums |

Wichtig: `components/rooms/types.ts` und `components/rooms/SymbolRoom.tsx`
gehoeren zur aelteren `SymbolRoomDefinition`-Raumgrammatik. Feuer und Licht
verwenden aktuell noch diese aeltere Struktur. Neue Engine-Raeume orientieren
sich an `types/engine.ts` und `waterEngineData.ts`.

## 3. Aufbau eines `SymbolEngineData`-Objekts

```ts
const symbolEngineData: SymbolEngineData = {
  id: "brot-engine",
  slug: "brot",
  title: "Brotraum",
  symbolLabel: "Brot",
  hebrew: {
    word: "...",
    transliteration: "...",
    translation: "Brot",
    summary: "...",
    letters: [
      { id: "...", letter: "...", name: "...", position: "...", meaning: "...", detail: "..." },
    ],
  },
  scenes: [
    { id: "...", reference: "...", title: "...", text: "...", meaning: "..." },
  ],
  connections: [
    { id: "...", label: "...", relation: "...", detail: "..." },
  ],
  states: [
    {
      id: "...",
      navigationLabel: "...",
      eyebrow: "...",
      title: "...",
      text: "...",
      inscription: "... / ... / ...",
      visual: {
        image: "/Visuals/...",
        backgroundImage: "/Visuals/...",
        alt: "...",
        atmosphere: { id: "...", mood: "...", motion: "...", light: "...", density: 0.5 },
        veilOpacity: 0.65,
        imageOpacity: 1,
      },
      hebrewLetterIds: ["..."],
      hebrewSummary: "...",
      biblicalSceneIds: ["..."],
      connectionIds: ["..."],
      reflection: { kicker: "Innere Erfahrung", question: "..." },
    },
  ],
};
```

Referenzregeln:

- IDs sind innerhalb des Objekts eindeutig und stabil.
- IDs in `hebrewLetterIds`, `biblicalSceneIds` und `connectionIds` muessen auf
  vorhandene Eintraege zeigen.
- `states[0]` muss mindestens einen gueltigen `hebrewLetterIds`-Eintrag haben.
- Auch jede weitere Station sollte mindestens einen Buchstaben referenzieren:
  Der Hook aktiviert beim Stationswechsel den ersten Eintrag.
- Die Reihenfolge in `states` ist die Dramaturgie der Reise.

## 4. Feuer, Licht, Brot oder Wueste hinzufuegen

1. Ordner `components/rooms/<symbol>/` anlegen.
2. Nach `waterEngineData.ts` eine Datei `<symbol>EngineData.ts` mit einem
   vollstaendigen `SymbolEngineData`-Objekt erstellen.
3. Pro Station passende Assets unter `public/Visuals/` ablegen.
4. Route `app/raeume/<symbol>/page.tsx` anlegen oder umstellen:

```tsx
import { SymbolEngineRoom } from "@/components/rooms/engine/SymbolEngineRoom";
import { breadEngineData } from "@/components/rooms/bread/breadEngineData";

export default function BrotRaumPage() {
  return <SymbolEngineRoom data={breadEngineData} />;
}
```

5. Mit `npm run lint` und `npm run build` pruefen.
6. Reise im Browser auf Desktop und Mobile durchklicken: alle Stationen, alle
   drei Ebenen, Rueckwaerts-Navigation und Neustart an der letzten Station.

Feuer und Licht muessen fuer den Wechsel auf das Wasser-Vorbild aus ihrer
aktuellen `SymbolRoomDefinition` in je ein `SymbolEngineData`-Objekt uebertragen
werden. Brot und Wueste starten direkt mit der neuen Struktur.

## 5. Regeln gegen eine Textseite

- Jede Station ist zuerst ein visueller Zustand, erst danach ein Textblock.
- Eine Station traegt genau eine Bewegung oder Schwelle, keine vollstaendige
  Abhandlung.
- Haupttext kurz halten: ein knapper Absatz, idealerweise zwei bis drei Saetze.
- `title`, `inscription` und Bild muessen die Station bereits ohne Langtext
  tragen koennen.
- Vertiefung bleibt in den drei umschaltbaren Ebenen und wird nicht unter den
  Haupttext gestapelt.
- Pro Station genau eine Reflexionsfrage.
- Bibelszenen und Symbolverbindungen werden per ID kuratiert. Nicht jede
  vorhandene Information wird in jeder Station gezeigt.
- Auf Mobile kuerzt das gemeinsame CSS Haupttext und Detailansichten bewusst.
  Neue Sonderregeln duerfen diese Verdichtung nicht aufheben.
- Neue Symbole verwenden `SymbolEngineRoom`; keine eigene lange Seitenkomponente
  mit wiederholten Erklaerabschnitten bauen.

Prueffrage: Funktioniert die Station noch als Bildraum, wenn man nur Titel,
Inschrift, Bild und Aktion wahrnimmt? Falls nein, ist zu viel Bedeutung in den
Fliesstext gerutscht.

## 6. `VisualState`- und `AtmosphereProfile`-Regeln

Ein `VisualState` gehoert immer genau zu einer Station:

```ts
type VisualState = {
  image: string;             // Pflicht: dominantes Stationsbild
  alt: string;               // Pflicht: beschreibender Alternativtext
  backgroundImage?: string;  // Optional: zweite, dezent eingeblendete Ebene
  atmosphere: AtmosphereProfile;
  veilOpacity: number;       // Konvention: 0 bis 1
  imageOpacity?: number;     // Optional, Standardwert: 1; Konvention: 0 bis 1
};
```

Das Engine-`AtmosphereProfile` aus `types/engine.ts` ist stationsbezogen:

```ts
type AtmosphereProfile = {
  id: string;
  mood: string;
  motion: string;
  light: string;
  density: number; // Konvention: 0 bis 1
};
```

Regeln:

- Jede Station bekommt ein bewusst gewaehltes Profil. Atmosphaere ist Teil der
  Dramaturgie, keine Dekoration nach Fertigstellung.
- `density` steuert die Intensitaet des gemeinsamen visuellen Felds.
- `veilOpacity` sichert Lesbarkeit vor dem Bild. Dichte oder helle Bilder
  brauchen meist einen staerkeren Schleier.
- `id`, `mood`, `motion` und `light` werden als `data-*`-Attribute an die
  Buehne gegeben. Sie bleiben kurze semantische Tokens wie `depth`,
  `stroemend` oder `weichgold`.
- Das gemeinsame CSS reagiert generisch auf `density`. Fuer besondere visuelle
  Ereignisse darf `app/engine.css` gezielte Regeln fuer
  `[data-atmosphere="<id>"]` erhalten.
- Solche CSS-Sonderfaelle sparsam einsetzen: zuerst die gemeinsame Bildsprache
  nutzen, dann nur dramaturgisch wichtige Stationen hervorheben.

Achtung: Die aeltere Raumgrammatik besitzt ebenfalls einen Typ namens
`AtmosphereProfile` in `components/rooms/types.ts`. Dieser beschreibt ein
globales Raumthema mit `particles`, `materiality` und `rhythm`. Er ist nicht der
stationsbezogene Engine-Typ und darf beim Bau neuer Wasser-Vorbild-Raeume nicht
verwendet werden.

