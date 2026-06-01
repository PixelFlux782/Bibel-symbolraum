import type {
  HebrewBiblicalReference,
  HebrewMeaningField,
  HebrewRoot,
  HebrewWord,
} from "@/types/hebrew";

const meaningField = (
  id: string,
  label: string,
  description: string,
  experienceFields: string[],
): HebrewMeaningField => ({
  id,
  label,
  description,
  provenance: "interpretive",
  experienceFields,
});

const reference = (
  id: string,
  biblicalReference: string,
  context: string,
  relation: string,
): HebrewBiblicalReference => ({
  id,
  reference: biblicalReference,
  context,
  relation,
  provenance: "canonical",
});

export const hebrewRoots: HebrewRoot[] = [
  {
    id: "root-or",
    radicals: ["א", "ו", "ר"],
    letterIds: ["aleph", "vav", "resh"],
    rootType: "triliteral",
    coreSemanticField: "Licht, hell werden und erleuchten",
    meaningFields: [],
    relatedRootIds: [],
    sources: [],
  },
  {
    id: "root-l-ch-m",
    radicals: ["ל", "ח", "ם"],
    letterIds: ["lamed", "chet", "mem"],
    rootType: "triliteral",
    coreSemanticField: "Brot und Nahrung",
    meaningFields: [],
    relatedRootIds: [],
    sources: [],
  },
  {
    id: "root-d-b-r",
    radicals: ["ד", "ב", "ר"],
    letterIds: ["dalet", "bet", "resh"],
    rootType: "triliteral",
    coreSemanticField: "Sprechen und Wort",
    meaningFields: [],
    relatedRootIds: [],
    notes: "Die Beziehung zwischen מדבר und דבר wird später philologisch genauer belegt.",
    sources: [],
  },
];

export const hebrewWords: HebrewWord[] = [
  {
    id: "majim",
    slug: "majim",
    hebrew: "מים",
    transliteration: "majim",
    germanMeaning: "Wasser",
    letterIds: ["mem", "jod", "mem"],
    possibleRootIds: [],
    rootNote: "מים wird nicht automatisch als gewöhnliche dreiradikalige Verbalwurzel behandelt.",
    meaningFields: [
      meaningField("majim-depth", "Tiefe", "Wasser kann als sichtbare und verborgene Tiefe gelesen werden.", ["Unsicherheit", "Verborgenheit"]),
      meaningField("majim-transition", "Übergang", "Wasser kann Grenze und Durchgang zugleich sein.", ["Schwelle", "Befreiung"]),
      meaningField("majim-new-birth", "Neugeburt", "Wasser kann Reinigung und neuen Anfang tragen.", ["Erneuerung", "Neuorientierung"]),
    ],
    relatedSymbolSlugs: ["wasser", "meer", "tiefe", "taufe", "leben"],
    biblicalReferences: [
      reference("majim-genesis-1-2", "Genesis 1,2", "Wasser steht am Anfang der Schöpfung.", "Urtiefe und Chaos vor der Ordnung"),
      reference("majim-exodus-14", "Exodus 14", "Das Meer wird zum Durchgang aus der Enge.", "Grenze, Übergang und Befreiung"),
      reference("majim-matthew-3", "Matthäus 3,13-17", "Jesus wird im Jordan getauft.", "Taufe, Übergang und Neugeburt"),
    ],
  },
  {
    id: "or",
    slug: "or",
    hebrew: "אור",
    transliteration: "or",
    germanMeaning: "Licht",
    letterIds: ["aleph", "vav", "resh"],
    possibleRootIds: ["root-or"],
    meaningFields: [
      meaningField("or-orientation", "Orientierung", "Licht macht einen nächsten Schritt sichtbar.", ["Klarheit", "Hoffnung"]),
    ],
    relatedSymbolSlugs: ["licht"],
    biblicalReferences: [
      reference("or-genesis-1-3", "Genesis 1,3", "Gott spricht: Es werde Licht.", "Schöpfung, Unterscheidung und Orientierung"),
    ],
  },
  {
    id: "esh",
    slug: "esh",
    hebrew: "אש",
    transliteration: "esch",
    germanMeaning: "Feuer",
    letterIds: ["aleph", "shin"],
    possibleRootIds: [],
    rootNote: "Die lexikalische Einordnung wird in einer späteren Corpus-Phase ergänzt.",
    meaningFields: [
      meaningField("esh-transformation", "Verwandlung", "Feuer kann Wärme, Läuterung und Veränderung sichtbar machen.", ["Energie", "Läuterung"]),
    ],
    relatedSymbolSlugs: ["feuer"],
    biblicalReferences: [
      reference("esh-exodus-3", "Exodus 3,2", "Der Dornbusch brennt und verbrennt nicht.", "Gegenwart, Ruf und Verwandlung"),
    ],
  },
  {
    id: "lechem",
    slug: "lechem",
    hebrew: "לחם",
    transliteration: "lechem",
    germanMeaning: "Brot",
    letterIds: ["lamed", "chet", "mem"],
    possibleRootIds: ["root-l-ch-m"],
    meaningFields: [
      meaningField("lechem-nourishment", "Nahrung", "Brot steht für alltägliche Versorgung und geteilte Gabe.", ["Versorgung", "Gemeinschaft"]),
    ],
    relatedSymbolSlugs: ["brot"],
    biblicalReferences: [
      reference("lechem-exodus-16", "Exodus 16,4", "Brot vom Himmel begleitet Israel durch die Wüste.", "Versorgung im Mangel"),
    ],
  },
  {
    id: "midbar",
    slug: "midbar",
    hebrew: "מדבר",
    transliteration: "midbar",
    germanMeaning: "Wüste",
    letterIds: ["mem", "dalet", "bet", "resh"],
    possibleRootIds: ["root-d-b-r"],
    meaningFields: [
      meaningField("midbar-reduction", "Reduktion", "Die Wüste entzieht Gewohntes und macht Mangel erfahrbar.", ["Leere", "Prüfung"]),
      meaningField("midbar-listening", "Hören", "Die Wüste kann als Raum der Sammlung und des Hörens gelesen werden.", ["Stille", "Ausrichtung"]),
    ],
    relatedSymbolSlugs: ["wueste"],
    biblicalReferences: [
      reference("midbar-exodus-3", "Exodus 3,1", "Mose hütet die Herde jenseits der Wüste.", "Stille, Schwelle und Ruf"),
    ],
  },
];
