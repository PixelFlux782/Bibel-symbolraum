import type { SymbolRoomDefinition } from "@/components/rooms/types";
import { waterSymbolGraph } from "@/lib/symbolism";
import { visualAssets } from "@/lib/visualAssets";

export const waterRoomDefinition: SymbolRoomDefinition = {
  id: "water-room",
  slug: "wasser",
  graph: waterSymbolGraph,
  centerNodeId: "water",
  entrance: {
    symbolNodeId: "water",
    kickerPrefix: "Raum",
    statement: "Wasser tr\u00e4gt. Wasser trennt. Wasser \u00f6ffnet.",
    ctaLabel: "In die Tiefe gehen",
    ctaHref: "#symbolreise",
    heroImage: {
      src: visualAssets.wasserHero,
      alt: "Ruhiger tiefer Wasserraum",
    },
    backgroundImage: {
      src: visualAssets.wasserInterface,
      alt: "Atmosph\u00e4rischer Wasserraum",
    },
  },
  encounters: [
    {
      id: "potential",
      symbolNodeId: "spirit",
      state: "potential",
      impulse: "Ein Atem \u00fcber dem Wasser.",
      experienceState: {
        mood: "expectant",
        motion: "hovering",
        light: "submerged-cyan",
        density: 0.34,
        transition: "gather",
      },
    },
    {
      id: "concentration",
      symbolNodeId: "well",
      state: "concentration",
      impulse: "Tiefe wird zug\u00e4nglich.",
      experienceState: {
        mood: "still",
        motion: "descending",
        light: "deep-cyan",
        density: 0.62,
        transition: "sink",
      },
    },
    {
      id: "emergence",
      symbolNodeId: "spring",
      state: "emergence",
      impulse: "Leben tritt hervor.",
      experienceState: {
        mood: "opening",
        motion: "rising",
        light: "cyan-gold",
        density: 0.48,
        transition: "surface",
      },
    },
    {
      id: "passage",
      symbolNodeId: "exodus-14",
      state: "passage",
      impulse: "Die Grenze \u00f6ffnet sich.",
      experienceState: {
        mood: "threshold",
        motion: "parting",
        light: "divided-gold",
        density: 0.72,
        transition: "cross",
      },
    },
    {
      id: "integration",
      symbolNodeId: "baptism",
      state: "integration",
      impulse: "Untertauchen wird Neubeginn.",
      experienceState: {
        mood: "release",
        motion: "ripple",
        light: "soft-gold",
        density: 0.42,
        transition: "settle",
      },
    },
  ],
  reveal: {
    kicker: "Mem",
    symbolNodeId: "mem",
    statement: "Mem \u00f6ffnet die Tiefe.",
  },
  decision: {
    kicker: "Reflexionsraum",
    reflectionQuestion:
      "Wo zeigt sich in deinem Leben gerade eine Grenze, die vielleicht auch ein \u00dcbergang werden kann?",
    textareaLabel: "Reflexion zum Wasserraum",
    placeholder: "Still notieren...",
    storageNotice: "Deine Reflexion bleibt nur auf diesem Ger\u00e4t gespeichert.",
    saveLabel: "Reflexion speichern",
    savedMessage: "Gespeichert. Du findest den Gedanken unter Mein Pfad.",
    emptyMessage: "Schreibe zuerst eine kurze Reflexion.",
  },
  transition: {
    symbolNodeId: "water",
  },
  echo: {
    inputPlaceholder: "Frage an den Raum...",
    inputLabel: "Frage an den Raum",
    submitLabel: "lauschen",
    idleKicker: "Das Wasser lauscht",
    answerKicker: "Der Raum antwortet",
    detailAnswerKicker: "Der Raum antwortet \u00fcber",
    idleStatement: "Bedeutung steigt als Licht aus der Tiefe.",
    inscriptionKicker: "Eine Inschrift steigt auf",
    rules: [
      {
        keywords: ["angst", "chaos", "tiefe", "verloren"],
        nodes: ["water", "sea", "mem"],
        interpretation: "Nicht jede Tiefe ist Ende. Manche Tiefe ist Ursprung.",
      },
      {
        keywords: ["reinigung", "neu", "taufe", "schuld"],
        nodes: ["baptism", "water", "mayim"],
        interpretation: "Was untergeht, muss nicht verloren sein. Manches steigt gereinigt wieder auf.",
      },
      {
        keywords: ["suche", "trocken", "mangel"],
        nodes: ["desert", "well", "spring"],
        interpretation: "Der Durst kennt den Weg, bevor die Quelle sichtbar wird.",
      },
      {
        keywords: ["geist", "bewegung", "atem"],
        nodes: ["spirit", "genesis-1-2"],
        interpretation: "Der Anfang ist manchmal nur ein Schweben \u00fcber dunklem Wasser.",
      },
      {
        keywords: ["befreiung", "weg", "durchbruch"],
        nodes: ["exodus-14", "sea", "light"],
        interpretation: "Der Weg erscheint nicht vor dem Wasser. Er \u00f6ffnet sich im Gehen.",
      },
      {
        keywords: ["quelle", "leben", "durst"],
        nodes: ["well", "spring", "water"],
        interpretation: "Leben beginnt oft verborgen, tief unter der trockenen Stelle.",
      },
    ],
    fallback: {
      keywords: [],
      nodes: ["water", "mayim", "mem"],
      interpretation: "Das Wasser antwortet leise. Erst Tiefe, dann Zeichen, dann Ursprung.",
    },
  },
  theme: {
    id: "water",
    colors: {
      background: "#02050b",
      accentRgb: "189, 160, 109",
      ambientRgb: "127, 184, 201",
      shadowRgb: "0, 1, 6",
      veilRgb: "1, 5, 12",
      depthRgb: "2, 8, 16",
    },
    atmosphereProfile: {
      id: "deep-mist",
      motion: "flow",
      particles: "mist",
      light: "refraction",
      materiality: "fluid-glass",
      rhythm: "tidal",
    },
    overlayStyle: {
      background:
        "radial-gradient(circle at 50% 12%, rgba(var(--symbol-room-ambient-rgb), 0.045), transparent 28%), radial-gradient(circle at 48% 52%, rgba(var(--symbol-room-accent-rgb), 0.035), transparent 38%), var(--symbol-room-background)",
    },
    encounterImage: {
      src: visualAssets.wasserInterface,
      alt: "Atmosph\u00e4rischer Wasserraum",
    },
    journeyKicker: "Symbolreise",
    journeyStatement: "F\u00fcnf Bewegungen im Wasser.",
    meaningQualityLabels: {
      origin: "Ursprung",
      depth: "Tiefe",
      chaos: "Chaos",
      birth: "Geburt",
      transition: "\u00dcbergang",
      purification: "Reinigung",
      "hidden-source": "verborgene Quelle",
      lack: "Mangel",
      revelation: "Offenbarung",
      life: "Leben",
      impulse: "Impuls",
      movement: "Bewegung",
      resistance: "Widerstand",
    },
    primaryMeaningQualities: ["purification", "transition", "depth"],
    fallbackQualities: ["Reinigung", "\u00dcbergang", "Tiefe"],
  },
};
