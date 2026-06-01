import type { SymbolEngineData } from "@/types/engine";

/**
 * Vorlage fuer neue Symbolraeume nach dem Wasser-Vorbild.
 *
 * Diese Datei ist nur eine Autorenhilfe und wird nicht produktiv eingebunden.
 * Beim Anlegen eines Symbols:
 * 1. In `components/rooms/<symbol>/<symbol>EngineData.ts` kopieren.
 * 2. Exportnamen, IDs, Texte und Bildpfade ersetzen.
 * 3. Alle referenzierten IDs gegen `hebrew.letters`, `scenes` und
 *    `connections` pruefen.
 * 4. Die Dramaturgie durch weitere Eintraege in `states` ergaenzen.
 */
export const symbolEngineTemplate: SymbolEngineData = {
  id: "example-engine",
  slug: "beispiel",
  title: "Beispielraum",
  symbolLabel: "Beispiel",
  hebrew: {
    // Das hebraeische Wort immer in seiner tatsaechlichen Schreibrichtung anlegen.
    word: "\u05d0",
    transliteration: "alef",
    translation: "Beispiel",
    summary:
      "Die Wortstruktur knapp als Bewegung beschreiben: vom ersten Buchstaben ueber die Mitte bis zum Abschluss.",
    letters: [
      {
        // Die ID wird von `states[].hebrewLetterIds` referenziert.
        id: "example-letter",
        letter: "\u05d0",
        name: "Alef",
        position: "Anfang",
        meaning: "Kurze symbolische Bedeutung",
        detail: "Vertiefende Deutung des Buchstabens im Zusammenhang des Symbols.",
      },
    ],
  },
  scenes: [
    {
      // Die ID wird von `states[].biblicalSceneIds` referenziert.
      id: "example-scene",
      reference: "Buch 1,1",
      title: "Titel der biblischen Szene",
      text: "Knappe Beschreibung der Szene.",
      meaning: "Bedeutung der Szene fuer die aktuelle Symbolreise.",
    },
  ],
  connections: [
    {
      // Die ID wird von `states[].connectionIds` referenziert.
      id: "example-connection",
      label: "Verbundenes Symbol",
      relation: "Art der Verbindung",
      detail: "Kurze Erklaerung, wie beide Symbole zusammenhaengen.",
    },
  ],
  states: [
    {
      // Die Reihenfolge der States bestimmt die Dramaturgie der Reise.
      id: "example-state",
      navigationLabel: "Station",
      eyebrow: "Orientierung",
      title: "Ein visueller Zustand traegt die Station.",
      text: "Der Haupttext bleibt kurz. Zwei bis drei Saetze genuegen, weil Bild, Titel und Inschrift bereits die Bewegung der Station vermitteln.",
      inscription: "Motiv / Schwelle / Bewegung",
      visual: {
        // Pro Station ist ein dominantes Bild erforderlich.
        image: "/Visuals/example_station.png",
        // Optional: eine zweite, dezent eingeblendete Bildebene.
        backgroundImage: "/Visuals/example_background.png",
        alt: "Beschreibender Alternativtext fuer das Stationsbild",
        atmosphere: {
          // Kurze semantische Tokens; die Engine reicht sie als data-* Attribute weiter.
          id: "example-atmosphere",
          mood: "gesammelt",
          motion: "aufsteigend",
          light: "weichgold",
          density: 0.5,
        },
        // Konvention fuer Deckkraftwerte: 0 bis 1.
        veilOpacity: 0.65,
        imageOpacity: 1,
      },
      // Mindestens ein gueltiger Buchstabe pro Station; der erste wird aktiviert.
      hebrewLetterIds: ["example-letter"],
      hebrewSummary: "Kurze Deutung der aktiven Buchstaben in dieser Station.",
      biblicalSceneIds: ["example-scene"],
      connectionIds: ["example-connection"],
      // Genau eine Reflexionsfrage pro Station.
      reflection: {
        kicker: "Innere Erfahrung",
        question: "Welche Bewegung dieses Symbols beruehrt deine eigene Erfahrung?",
      },
    },
  ],
};
