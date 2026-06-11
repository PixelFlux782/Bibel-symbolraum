import type {
  OntologyEntity,
  OntologyNeighbor,
  OntologyRegistry,
  OntologyRelation,
  OntologyRelationType,
} from "./types";

export const ONTOLOGY_RELATION_LABELS: Record<OntologyRelationType, string> = {
  is_expression_of: "ist Ausdruck von",
  is_threshold_to: "ist Schwelle zu",
  opens_into: "oeffnet in",
  contrasts_with: "steht in Spannung zu",
  contains_pattern: "enthaelt das Muster",
  fulfills_pattern_of: "erfuellt das Muster von",
  has_polarity: "traegt die Spannung",
  structures_journey: "strukturiert den Weg",
  passes_through: "fuehrt durch",
  emerges_from: "entsteht aus",
  transforms_into: "verwandelt sich in",
  reveals: "offenbart",
  nourishes: "naehrt",
  tests: "prueft",
  shares_letter: "teilt Buchstaben mit",
  shares_number: "teilt Zahl mit",
  appears_in_story: "erscheint in",
  belongs_to: "gehoert zu",
  resonates_with: "klingt mit",
  opposes: "steht entgegen",
  fulfills: "erfuellt",
};

const ONTOLOGY_RELATION_MARKER_LABELS: Record<OntologyRelationType, string> = {
  is_expression_of: "Ausdruck",
  is_threshold_to: "Schwelle",
  opens_into: "Schwelle",
  contrasts_with: "Spannung",
  contains_pattern: "Muster",
  fulfills_pattern_of: "Muster",
  has_polarity: "Spannung",
  structures_journey: "Wegspur",
  passes_through: "Wegspur",
  emerges_from: "Bedeutungsbeziehung",
  transforms_into: "Bedeutungsbeziehung",
  reveals: "Offenbarung",
  nourishes: "Bedeutungsbeziehung",
  tests: "Wegspur",
  shares_letter: "Hebraeisch",
  shares_number: "Zahl",
  appears_in_story: "Erzaehlspur",
  belongs_to: "Bedeutungsbeziehung",
  resonates_with: "Bedeutungsbeziehung",
  opposes: "Spannung",
  fulfills: "Bedeutungsbeziehung",
};

const ONTOLOGY_RELATION_PRIORITY: Partial<Record<OntologyRelationType, number>> = {
  is_expression_of: 1,
  opens_into: 2,
  is_threshold_to: 3,
  reveals: 4,
  contains_pattern: 5,
  emerges_from: 6,
  structures_journey: 7,
  passes_through: 8,
  shares_letter: 9,
  shares_number: 10,
  appears_in_story: 11,
  contrasts_with: 12,
  resonates_with: 13,
  belongs_to: 14,
};

export const ontologyEntities: OntologyEntity[] = [
  {
    id: "quelle",
    type: "symbol",
    title: "Quelle",
    summary: "Die Quelle zeigt Wasser als Ursprung, Hervortreten und erste Gabe.",
    primaryHierarchyId: "quelle",
    domain: "place",
    archetypalRole: "Ursprung, Hervortreten und Gabe des Anfangs",
    aliases: ["Quelle", "Ursprung", "Wasserquelle"],
    imageSymbol: "dunkle Quelle mit feiner Lichtachse",
    clusterId: "cluster-wasser-ursprung",
    tags: ["wasser", "ursprung", "quelle", "anfang"],
  },
  {
    id: "brunnen",
    type: "symbol",
    title: "Brunnen",
    primaryHierarchyId: "brunnen",
    tags: ["wasser", "unterraum", "tiefe", "begegnung"],
    summary: "Brunnen bindet Wasser an verborgene Tiefe, Schoepfen und Begegnung.",
    aliases: ["Brunnen", "Quelle in der Tiefe", "Wasserstelle"],
    archetypalRole: "Zugang zur Tiefe und Ort der Begegnung",
    domain: "place",
    imageSymbol: "tiefer Brunnen im Halbdunkel mit Licht ueber dem Wasser",
    polarity: {
      axis: "Tiefe und Begegnung",
      visiblePole: "Wasserstelle",
      hiddenPole: "verborgene Tiefe",
      note: "Der Brunnen macht das Verborgene erreichbar und wird zum Ort der Begegnung.",
    },
    clusterId: "cluster-wasser-ursprung",
  },
  {
    id: "meer",
    type: "symbol",
    title: "Meer",
    summary: "Das Meer zeigt Wasser als Grenze, Tiefe, Chaos und Durchgang.",
    primaryHierarchyId: "meer",
    domain: "element",
    archetypalRole: "Grenze, Tiefe, Gefahr und Uebergang",
    aliases: ["Meer", "See", "Wasserweite", "Tiefe"],
    imageSymbol: "weite dunkle Wasserflaeche mit fernem Licht",
    polarity: {
      axis: "Chaos und Durchgang",
      visiblePole: "Gefahr und Grenze",
      hiddenPole: "Weg in Freiheit",
      note: "Das Meer erscheint als bedrohliche Tiefe und zugleich als Schwelle zu neuem Leben.",
    },
    clusterId: "cluster-wasser-ursprung",
    tags: ["wasser", "meer", "tiefe", "grenze", "durchgang"],
  },
  {
    id: "fluss",
    type: "symbol",
    title: "Fluss",
    summary: "Der Fluss zeigt Wasser als Bewegung, Richtung und lebendigen Strom.",
    primaryHierarchyId: "fluss",
    domain: "element",
    archetypalRole: "Bewegung, Richtung und lebendiger Strom",
    aliases: ["Fluss", "Strom", "Wasserlauf"],
    imageSymbol: "dunkler Strom mit leuchtender Bewegung",
    clusterId: "cluster-wasser-ursprung",
    tags: ["wasser", "fluss", "bewegung", "leben", "strom"],
  },
  {
    id: "manna",
    type: "symbol",
    title: "Manna",
    primaryHierarchyId: "manna",
    tags: ["brot", "wueste", "gabe", "versorgung"],
    summary: "Manna liest Brot als taegliche Gabe im Raum der Wueste.",
    hebrew: "מן",
    transliteration: "man",
    gematria: 90,
    aliases: ["Manna", "Man", "מן", "Himmelsbrot"],
    archetypalRole: "Nahrung aus dem Himmel im Raum des Mangels",
    domain: "word",
    imageSymbol: "helle Koerner auf Tau in dunkler Wueste",
    firstMention: {
      ref: "Exodus 16",
      role: "Manna erscheint als Gabe im Mangel der Wueste.",
    },
    polarity: {
      axis: "Mangel und Gabe",
      visiblePole: "Nahrung",
      hiddenPole: "Vertrauen",
      note: "Manna naehrt nur im taeglichen Empfangen und kann nicht angehaeuft werden.",
    },
    clusterId: "cluster-wueste-pruefung",
  },
  {
    id: "leere",
    type: "concept",
    title: "Leere",
    summary: "Die Leere ist der Raum des Entzugs, in dem Hoeren und Pruefung moeglich werden.",
    primaryHierarchyId: "leere",
    domain: "concept",
    archetypalRole: "Entzug, Offenheit und Vorbereitung des Hoerens",
    aliases: ["Leere", "Entzug", "Raum ohne Sicherheiten"],
    imageSymbol: "weite dunkle Flaeche mit fernem Lichtpunkt",
    polarity: {
      axis: "Entzug und Offenheit",
      visiblePole: "Mangel",
      hiddenPole: "Bereitschaft",
      note: "Die Leere nimmt Fuelle weg, damit Empfang moeglich wird.",
    },
    clusterId: "cluster-wueste-pruefung",
    tags: ["wueste", "leere", "entzug", "hoeren"],
  },
  {
    id: "dornbusch",
    type: "symbol",
    title: "Dornbusch",
    primaryHierarchyId: "dornbusch",
    tags: ["feuer", "wueste", "ruf", "offenbarung"],
    summary: "Dornbusch verbindet Feuer, Stimme und Gegenwart ohne Verzehrung.",
    aliases: ["Dornbusch", "brennender Dornbusch", "סנה"],
    archetypalRole: "Ort der Offenbarung, an dem Feuer nicht verzehrt",
    domain: "place",
    imageSymbol: "brennender Dornbusch in dunkler Wueste",
    firstMention: {
      ref: "Exodus 3:2",
      role: "Der Dornbusch brennt und wird doch nicht verzehrt.",
    },
    polarity: {
      axis: "Brennen und Nicht-Verzehren",
      visiblePole: "Feuer",
      hiddenPole: "Gegenwart ohne Vernichtung",
      note: "Der Dornbusch zeigt Feuer als Offenbarung, nicht als blosse Zerstoerung.",
    },
    clusterId: "cluster-feuer-offenbarung",
  },
  {
    id: "flamme",
    type: "symbol",
    title: "Flamme",
    summary: "Die Flamme zeigt Feuer als sichtbare Bewegung, Naehe und aufsteigende Gegenwart.",
    primaryHierarchyId: "flamme",
    domain: "element",
    archetypalRole: "sichtbare Bewegung des Feuers und Zeichen der Gegenwart",
    aliases: ["Flamme", "Feuerzunge", "brennendes Licht"],
    imageSymbol: "schmale goldene Flamme in dunklem Raum",
    clusterId: "cluster-feuer-offenbarung",
    tags: ["feuer", "flamme", "licht", "bewegung"],
  },
  {
    id: "glut",
    type: "symbol",
    title: "Glut",
    summary: "Die Glut zeigt Feuer als verborgene Waerme und innere Wandlungskraft.",
    primaryHierarchyId: "glut",
    domain: "element",
    archetypalRole: "verborgenes Feuer, Waerme und Wandlung im Inneren",
    aliases: ["Glut", "Kohle", "verborgenes Feuer"],
    imageSymbol: "dunkle Glut mit rotem Kernlicht",
    clusterId: "cluster-feuer-offenbarung",
    tags: ["feuer", "glut", "innenraum", "wandlung"],
  },
  {
    id: "altar",
    type: "symbol",
    title: "Altarfeuer",
    summary: "Das Altarfeuer zeigt Feuer als Hingabe, Annaeherung und geordnete Schwelle.",
    primaryHierarchyId: "altar",
    domain: "ritual",
    archetypalRole: "Hingabe, Annaeherung und rituelle Schwelle",
    aliases: ["Altarfeuer", "Altar", "Feuer der Hingabe"],
    imageSymbol: "ruhiges Feuer auf einem dunklen Altarstein",
    clusterId: "cluster-feuer-offenbarung",
    tags: ["feuer", "altar", "ritual", "hingabe"],
  },
  {
    id: "laeuterung",
    type: "concept",
    title: "Laeuterung",
    summary: "Laeuterung zeigt Feuer als innere Klaerung, Pruefung und Verwandlung.",
    primaryHierarchyId: "laeuterung",
    domain: "concept",
    archetypalRole: "Klaerung, Pruefung und Verwandlung durch Feuer",
    aliases: ["Laeuterung", "Reinigung durch Feuer", "Klaerung"],
    imageSymbol: "helles Feuer, das dunkles Metall klaert",
    polarity: {
      axis: "Schmerz und Klaerung",
      visiblePole: "Brennen",
      hiddenPole: "Reinigung",
      note: "Laeuterung ist Feuer als Verwandlung, nicht als blosse Vernichtung.",
    },
    clusterId: "cluster-feuer-offenbarung",
    tags: ["feuer", "laeuterung", "pruefung", "wandlung"],
  },
  {
    id: "weg",
    type: "symbol",
    title: "Weg",
    primaryHierarchyId: "weg",
    tags: ["wueste", "bewegung", "pruefung", "erzaehlung"],
    summary: "Weg macht Bewegung durch das Unbekannte als Pruefung und Erzaehlung sichtbar.",
    aliases: ["Weg", "Pfad", "Gang", "Reise"],
    archetypalRole: "Bewegung durch Pruefung zur Verwandlung",
    domain: "threshold",
    imageSymbol: "schmaler Pfad durch dunkle Weite",
    polarity: {
      axis: "Aufbruch und Pruefung",
      visiblePole: "Bewegung",
      hiddenPole: "Verwandlung",
      note: "Der Weg ist nicht nur Strecke, sondern innere Reifung.",
    },
    clusterId: "cluster-wueste-pruefung",
  },
  {
    id: "wasser",
    type: "archetype",
    title: "Wasser",
    primaryHierarchyId: "wasser",
    tags: ["archetyp", "tiefe", "leben", "reinigung"],
    summary: "Wasser traegt Tiefe, Leben, Reinigung, Grenze und Uebergang.",
    hebrew: "מים",
    transliteration: "majim",
    gematria: 90,
    aliases: ["Wasser", "Majim", "Mayim", "מים"],
    archetypalRole: "Ursprung, Tiefe, Reinigung und Schwelle",
    domain: "element",
    imageSymbol: "dunkles Wasser mit warmer Lichtachse",
    firstMention: {
      ref: "Genesis 1:2",
      role: "Wasser erscheint als Tiefe unter dem Geist.",
    },
    polarity: {
      axis: "Tiefe und Reinigung",
      visiblePole: "Reinigung",
      hiddenPole: "Chaos, Ursprung und Mutterleib",
      note: "Wasser traegt zugleich Geborgenheit, Gefahr und neues Werden.",
    },
    clusterId: "cluster-wasser-ursprung",
  },
  {
    id: "wueste",
    type: "archetype",
    title: "Wueste",
    primaryHierarchyId: "wueste",
    tags: ["archetyp", "mangel", "pruefung", "hoeren"],
    summary: "Wueste ist der Bedeutungsraum von Reduktion, Mangel, Stille und Pruefung.",
    hebrew: "מדבר",
    transliteration: "midbar",
    gematria: 246,
    aliases: ["Wueste", "Midbar", "מדבר", "Wildnis"],
    archetypalRole: "Entzug, Pruefung, Weg und Stimme",
    domain: "place",
    imageSymbol: "weite dunkle Leere mit fernem Licht",
    firstMention: {
      ref: "Exodus",
      role: "Die Wueste wird zum Raum der Pruefung, Fuehrung und Offenbarung.",
    },
    polarity: {
      axis: "Leere und Stimme",
      visiblePole: "Mangel und Entzug",
      hiddenPole: "Fuehrung und Offenbarung",
      note: "Die Wueste nimmt Sicherheiten, damit das Hoeren entstehen kann.",
    },
    clusterId: "cluster-wueste-pruefung",
  },
  {
    id: "brot",
    type: "archetype",
    title: "Brot",
    primaryHierarchyId: "brot",
    tags: ["archetyp", "nahrung", "gabe", "gemeinschaft"],
    summary: "Brot deutet Nahrung, Gabe, Alltag, Teilung und Gemeinschaft.",
    hebrew: "לחם",
    transliteration: "lechem",
    gematria: 78,
    aliases: ["Brot", "Lechem", "לחם", "Nahrung"],
    archetypalRole: "Nahrung, Gabe, Teilung und Wort",
    domain: "ritual",
    imageSymbol: "einfaches Brot im warmen Licht",
    polarity: {
      axis: "Mangel und Gabe",
      visiblePole: "Nahrung",
      hiddenPole: "Abhaengigkeit und Vertrauen",
      note: "Brot zeigt Leben als empfangene Gabe.",
    },
    clusterId: "cluster-brot-nahrung",
  },
  {
    id: "feuer",
    type: "archetype",
    title: "Feuer",
    primaryHierarchyId: "feuer",
    tags: ["archetyp", "gegenwart", "ruf", "wandlung"],
    summary: "Feuer sammelt Gegenwart, Ruf, Fuehrung, Laeuterung und Verwandlung.",
    hebrew: "אש",
    transliteration: "esch",
    gematria: 301,
    aliases: ["Feuer", "Esch", "אש", "Flamme"],
    archetypalRole: "Gegenwart, Laeuterung und verzehrende Naehe",
    domain: "element",
    imageSymbol: "ruhiges goldenes Feuer in dunkler Tiefe",
    polarity: {
      axis: "Gegenwart und Verzehrung",
      visiblePole: "Licht und Waerme",
      hiddenPole: "Gericht und Laeuterung",
      note: "Feuer ist Naehe, die offenbart und verwandelt.",
    },
    clusterId: "cluster-feuer-offenbarung",
  },
  {
    id: "licht",
    type: "archetype",
    title: "Licht",
    primaryHierarchyId: "licht",
    tags: ["archetyp", "offenbarung", "orientierung", "klarheit"],
    summary: "Licht macht Klarheit, Offenbarung, Orientierung und Schoepfungsanfang lesbar.",
    hebrew: "אור",
    transliteration: "or",
    gematria: 207,
    aliases: ["Licht", "Or", "Ohr", "אור"],
    archetypalRole: "Offenbarung, Bewusstsein und Orientierung",
    domain: "element",
    imageSymbol: "warme Lichtachse im dunklen Raum",
    firstMention: {
      ref: "Genesis 1:3",
      role: "Licht erscheint als erstes gesprochenes Werden.",
    },
    polarity: {
      axis: "Offenbarung und Verborgenheit",
      visiblePole: "Erkenntnis",
      hiddenPole: "Ursprung im Unsichtbaren",
      note: "Licht macht sichtbar, kommt aber selbst aus dem verborgenen Wort.",
    },
    clusterId: "cluster-genesis-1",
  },
  {
    id: "tau",
    type: "symbol",
    title: "Tau",
    primaryHierarchyId: "tau",
    tags: ["wasser", "himmel", "manna", "gabe"],
    summary: "Tau ist Wasser des Himmels und Schwelle, aus der Manna sichtbar wird.",
    hebrew: "טל",
    transliteration: "tal",
    gematria: 39,
    aliases: ["Tau", "Tal", "טל", "Morgentau"],
    archetypalRole: "feine Gabe des Morgens und Uebergang zwischen Himmel und Erde",
    domain: "element",
    imageSymbol: "leuchtender Tau auf dunklem Grund",
    polarity: {
      axis: "Himmel und Erde",
      visiblePole: "Feuchtigkeit",
      hiddenPole: "leise Gabe von oben",
      note: "Tau erscheint ungreifbar und doch naehrend.",
    },
    clusterId: "cluster-wasser-ursprung",
  },
  {
    id: "morgenlicht",
    type: "symbol",
    title: "Morgenlicht",
    summary: "Morgenlicht zeigt Licht als Beginn, Erwachen und erste Orientierung.",
    primaryHierarchyId: "morgenlicht",
    domain: "time",
    archetypalRole: "Erwachen, Beginn und erste Orientierung",
    aliases: ["Morgenlicht", "Morgen", "Fruehes Licht"],
    imageSymbol: "erste warme Lichtachse in dunklem Blau",
    clusterId: "cluster-genesis-1",
    tags: ["licht", "morgen", "anfang", "orientierung"],
  },
  {
    id: "leuchte",
    type: "symbol",
    title: "Leuchte",
    summary: "Die Leuchte zeigt Licht als getragenes, geordnetes und weitergegebenes Licht.",
    primaryHierarchyId: "leuchte",
    domain: "ritual",
    archetypalRole: "getragenes Licht, Ordnung und Dienst",
    aliases: ["Leuchte", "Lampe", "Lichttraeger"],
    imageSymbol: "kleine goldene Leuchte im dunklen Raum",
    clusterId: "cluster-genesis-1",
    tags: ["licht", "leuchte", "ordnung", "dienst"],
  },
  {
    id: "stern",
    type: "symbol",
    title: "Stern",
    summary: "Der Stern zeigt Licht als Orientierung in der Nacht und als Zeichen am Himmel.",
    primaryHierarchyId: "stern",
    domain: "element",
    archetypalRole: "Orientierung, Zeichen und himmlische Ordnung",
    aliases: ["Stern", "Himmelslicht", "Zeichen am Himmel"],
    imageSymbol: "ferner Stern im tiefen Nachtblau",
    clusterId: "cluster-genesis-1",
    tags: ["licht", "stern", "himmel", "orientierung"],
  },
  {
    id: "glanz",
    type: "concept",
    title: "Glanz",
    summary: "Glanz zeigt Licht als Ausstrahlung, Wuerde und sichtbare Gegenwart.",
    primaryHierarchyId: "glanz",
    domain: "concept",
    archetypalRole: "Ausstrahlung, Wuerde und sichtbare Gegenwart",
    aliases: ["Glanz", "Strahlen", "Herrlichkeit"],
    imageSymbol: "sanfter goldener Schimmer in dunkler Tiefe",
    clusterId: "cluster-genesis-1",
    tags: ["licht", "glanz", "herrlichkeit", "gegenwart"],
  },
  {
    id: "auge",
    type: "symbol",
    title: "Auge",
    summary: "Das Auge verbindet Licht mit Wahrnehmung, Erkenntnis und innerer Ausrichtung.",
    primaryHierarchyId: "auge",
    domain: "body",
    archetypalRole: "Wahrnehmung, Erkenntnis und innere Ausrichtung",
    aliases: ["Auge", "Sehen", "Blick"],
    imageSymbol: "ruhiges Auge als dunkle Spiegelung von Licht",
    clusterId: "cluster-genesis-1",
    tags: ["licht", "auge", "sehen", "erkenntnis"],
  },
  {
    id: "stimme",
    type: "symbol",
    title: "Stimme",
    primaryHierarchyId: "stimme",
    tags: ["wueste", "wort", "ruf", "offenbarung"],
    summary: "Stimme macht das Wort im stillen Raum hoerbar.",
    aliases: ["Stimme", "Ruf", "Sprechen", "Wort"],
    archetypalRole: "Ruf aus dem Verborgenen und Ursprung von Orientierung",
    domain: "divine",
    imageSymbol: "unsichtbare Stimme als Lichtwelle im dunklen Raum",
    polarity: {
      axis: "Schweigen und Ruf",
      visiblePole: "hoerbares Wort",
      hiddenPole: "verborgener Ursprung",
      note: "Die Stimme kommt aus dem Unsichtbaren und ruft in eine Richtung.",
    },
    clusterId: "cluster-offenbarung",
  },
  {
    id: "pruefung",
    type: "symbol",
    title: "Pruefung",
    primaryHierarchyId: "pruefung",
    tags: ["wueste", "weg", "mensch", "innenraum"],
    summary: "Pruefung ist der Weg, auf dem das Innere sichtbar wird.",
    aliases: ["Pruefung", "Bewaehrung", "Test", "Erprobung"],
    archetypalRole: "Raum der Klaerung, in dem Verborgenes sichtbar wird",
    domain: "concept",
    imageSymbol: "enge Schwelle zwischen Dunkelheit und Licht",
    polarity: {
      axis: "Entzug und Bewaehrung",
      visiblePole: "Mangel",
      hiddenPole: "Reifung",
      note: "Pruefung nimmt nicht nur weg, sondern macht die innere Gestalt sichtbar.",
    },
    clusterId: "cluster-wueste-pruefung",
  },
  {
    id: "tiefe",
    type: "concept",
    title: "Tiefe",
    tags: ["wasser", "verborgenheit", "anfang", "unterraum"],
    summary: "Tiefe bezeichnet den verborgenen Raum unter der Oberflaeche, in dem Ursprung und Wandlung liegen.",
    hebrew: "×ª×”×•×",
    transliteration: "tehom",
    aliases: ["Tiefe", "Urtiefe", "Tehom", "×ª×”×•×"],
    archetypalRole: "Verborgenes Anfangsfeld unter dem Sichtbaren",
    domain: "concept",
    imageSymbol: "dunkle Wassertiefe unter einer ruhigen Oberflaeche",
    firstMention: {
      ref: "Genesis 1:2",
      role: "Die Tiefe erscheint als ungeformter Anfangsraum.",
    },
    polarity: {
      axis: "Verborgenheit und Ursprung",
      visiblePole: "Dunkelheit unter der Oberflaeche",
      hiddenPole: "ungeformter Anfang",
      note: "Tiefe ist nicht Leere, sondern verborgene Moeglichkeit.",
    },
    clusterId: "cluster-wasser-ursprung",
  },
  {
    id: "begegnung",
    type: "concept",
    title: "Begegnung",
    tags: ["brunnen", "weg", "ruf", "schwelle"],
    summary: "Begegnung beschreibt den Moment, in dem Wege, Mangel und Ruf an einer Schwelle zusammenkommen.",
    aliases: ["Begegnung", "Treffpunkt", "Zusammentreffen"],
    archetypalRole: "Schwellenmoment, in dem getrennte Wege Bedeutung gewinnen",
    domain: "concept",
    imageSymbol: "zwei Wege treffen sich an einer Wasserstelle",
    polarity: {
      axis: "Fremdheit und Erkennen",
      visiblePole: "Zusammentreffen",
      hiddenPole: "Ruf und Entscheidung",
      note: "Begegnung ist mehr als Kontakt: Sie kann Richtung und Berufung sichtbar machen.",
    },
    clusterId: "cluster-wasser-ursprung",
  },
  {
    id: "exodus-wilderness",
    type: "story_anchor",
    title: "Exodus 16",
    tags: ["exodus", "wueste", "manna", "versorgung"],
    summary: "Exodus 16 verankert Manna als Gabe im Raum der Wueste.",
    aliases: ["Exodus 16", "Israel in der Wueste", "Manna in der Wueste"],
    domain: "story",
    clusterId: "cluster-wueste-pruefung",
  },
  {
    id: "exodus-3-2",
    type: "verse_anchor",
    title: "Exodus 3:2",
    primaryHierarchyId: "exodus-3-2",
    tags: ["exodus", "dornbusch", "feuer", "offenbarung"],
    summary: "Exodus 3:2 verankert den brennenden Dornbusch als Feuer, das nicht verzehrt.",
    aliases: ["Exodus 3:2", "Exodus 3,2", "Brennender Dornbusch"],
    domain: "story",
    clusterId: "cluster-feuer-offenbarung",
  },
  {
    id: "pattern-gabe-im-mangel",
    type: "concept",
    title: "Gabe im Mangel",
    summary: "Ein Muster, in dem Nahrung, Hilfe oder Leben gerade im Raum des Mangels erscheint.",
    domain: "pattern",
    aliases: ["Gabe im Mangel", "Versorgung im Entzug", "Himmelsgabe"],
    archetypalRole: "Empfangen statt Besitzen",
    imageSymbol: "helle Gabe in dunkler Leere",
    polarity: {
      axis: "Mangel und Gabe",
      visiblePole: "Mangel",
      hiddenPole: "Gabe",
      note: "Der Mangel wird zum Ort, an dem Empfang sichtbar wird.",
    },
    clusterId: "cluster-brot-nahrung",
    tags: ["pattern", "mangel", "gabe", "brot", "manna", "wueste"],
  },
  {
    id: "pattern-pruefung-durch-entzug",
    type: "concept",
    title: "Pruefung durch Entzug",
    summary: "Ein Muster, in dem aeussere Sicherheiten weggenommen werden, damit innere Wahrheit sichtbar wird.",
    domain: "pattern",
    aliases: ["Pruefung durch Entzug", "Bewaehrung im Mangel", "Wuestenpruefung"],
    archetypalRole: "Klaerung durch Leere",
    imageSymbol: "enge Schwelle zwischen Dunkelheit und Licht",
    polarity: {
      axis: "Entzug und Bewaehrung",
      visiblePole: "Entzug",
      hiddenPole: "Reifung",
      note: "Der Entzug ist nicht nur Verlust, sondern ein Raum der Offenlegung.",
    },
    clusterId: "cluster-wueste-pruefung",
    tags: ["pattern", "pruefung", "wueste", "weg", "mangel"],
  },
  {
    id: "pattern-schwelle-durch-wasser",
    type: "concept",
    title: "Schwelle durch Wasser",
    summary: "Ein Muster, in dem Wasser Grenze, Durchgang, Reinigung und Neuwerdung zugleich ist.",
    domain: "pattern",
    aliases: ["Schwelle durch Wasser", "Durchgang durch Wasser", "Wasser als Uebergang"],
    archetypalRole: "Uebergang durch Tiefe",
    imageSymbol: "dunkles Wasser als Grenze mit Licht jenseits davon",
    polarity: {
      axis: "Grenze und Geburt",
      visiblePole: "Gefahr und Grenze",
      hiddenPole: "Neuwerdung",
      note: "Wasser trennt und traegt zugleich in einen neuen Zustand.",
    },
    clusterId: "cluster-wasser-ursprung",
    tags: ["pattern", "wasser", "schwelle", "reinigung", "geburt"],
  },
  {
    id: "pattern-offenbarung-im-feuer",
    type: "concept",
    title: "Offenbarung im Feuer",
    summary: "Ein Muster, in dem Feuer nicht nur verzehrt, sondern Gegenwart und Stimme sichtbar macht.",
    domain: "pattern",
    aliases: ["Offenbarung im Feuer", "Feuer als Gegenwart", "brennende Offenbarung"],
    archetypalRole: "Gegenwart, die verwandelt",
    imageSymbol: "ruhiges goldenes Feuer in dunklem Raum",
    polarity: {
      axis: "Verzehrung und Gegenwart",
      visiblePole: "Brennen",
      hiddenPole: "Offenbarung",
      note: "Feuer ist nicht bloss Zerstoerung, sondern Naehe, die das Verborgene zeigt.",
    },
    clusterId: "cluster-feuer-offenbarung",
    tags: ["pattern", "feuer", "offenbarung", "stimme", "dornbusch"],
  },
  {
    id: "pattern-weg-der-reifung",
    type: "concept",
    title: "Weg der Reifung",
    summary: "Ein Muster, in dem Bewegung, Pruefung und Fuehrung zu innerer Verwandlung werden.",
    domain: "pattern",
    aliases: ["Weg der Reifung", "Reifungsweg", "innerer Weg"],
    archetypalRole: "Verwandlung durch Gang",
    imageSymbol: "schmaler Pfad durch dunkle Weite",
    polarity: {
      axis: "Aufbruch und Verwandlung",
      visiblePole: "Weg",
      hiddenPole: "Reifung",
      note: "Der Weg ist nicht nur Strecke, sondern Wandlung des Gehenden.",
    },
    clusterId: "cluster-wueste-pruefung",
    tags: ["pattern", "weg", "wueste", "pruefung", "verwandlung"],
  },
];

export const ontologyRelations: OntologyRelation[] = [
  {
    id: "ontology-quelle-is-expression-of-wasser",
    sourceId: "quelle",
    targetId: "wasser",
    type: "is_expression_of",
    title: "Quelle ist Ausdruck von Wasser",
    shortResonance: "In der Quelle tritt Wasser als Ursprung hervor.",
    explanation: "Die Quelle zeigt Wasser nicht als Flaeche, sondern als ersten Austritt und Gabe.",
    strength: 0.9,
  },
  {
    id: "ontology-quelle-contains-pattern-schwelle-durch-wasser",
    sourceId: "quelle",
    targetId: "pattern-schwelle-durch-wasser",
    type: "contains_pattern",
    title: "Quelle enthaelt das Muster der Schwelle durch Wasser",
    shortResonance: "Die Quelle macht Wasser als Anfang einer Schwelle sichtbar.",
    explanation: "Wo Wasser hervortritt, beginnt ein Uebergang vom Verborgenen ins Sichtbare.",
    strength: 0.75,
  },
  {
    id: "ontology-brunnen-is-expression-of-wasser",
    sourceId: "brunnen",
    targetId: "wasser",
    type: "is_expression_of",
    title: "Brunnen ist Ausdruck von Wasser",
    shortResonance: "Die Tiefe des Brunnens ist ein Wasserraum.",
    explanation: "Im Brunnen sammelt sich Wasser als verborgene Tiefe.",
    strength: 1,
  },
  {
    id: "ontology-brunnen-is-threshold-to-begegnung",
    sourceId: "brunnen",
    targetId: "begegnung",
    type: "is_threshold_to",
    title: "Brunnen ist Schwelle zur Begegnung",
    shortResonance: "Am Brunnen wird Tiefe zum Ort der Begegnung.",
    explanation: "Wo Wasser geschoepft wird, koennen Wege einander begegnen.",
    strength: 0.75,
  },
  {
    id: "ontology-brunnen-opens-into-tiefe",
    sourceId: "brunnen",
    targetId: "tiefe",
    type: "opens_into",
    title: "Brunnen oeffnet in die Tiefe",
    shortResonance: "Der Brunnen macht verborgene Tiefe erreichbar.",
    explanation: "Der Brunnen fuehrt unter die Oberflaeche.",
    strength: 0.9,
  },
  {
    id: "ontology-meer-is-expression-of-wasser",
    sourceId: "meer",
    targetId: "wasser",
    type: "is_expression_of",
    title: "Meer ist Ausdruck von Wasser",
    shortResonance: "Im Meer wird Wasser zu Grenze, Tiefe und Weite.",
    explanation: "Das Meer zeigt Wasser als ueberwaeltigende Tiefe und als Schwelle des Durchgangs.",
    strength: 0.9,
  },
  {
    id: "ontology-meer-opens-into-tiefe",
    sourceId: "meer",
    targetId: "tiefe",
    type: "opens_into",
    title: "Meer oeffnet in die Tiefe",
    shortResonance: "Das Meer fuehrt in die unermessliche Tiefe.",
    explanation: "Die Weite des Meeres macht die verborgene Tiefe des Wassers spuerbar.",
    strength: 0.85,
  },
  {
    id: "ontology-meer-contains-pattern-schwelle-durch-wasser",
    sourceId: "meer",
    targetId: "pattern-schwelle-durch-wasser",
    type: "contains_pattern",
    title: "Meer enthaelt das Muster der Schwelle durch Wasser",
    shortResonance: "Das Meer ist Grenze und Durchgang zugleich.",
    explanation: "Am Meer wird Wasser zur gefaehrlichen Grenze und zum moeglichen Weg in Freiheit.",
    strength: 0.8,
  },
  {
    id: "ontology-meer-contrasts-with-wueste",
    sourceId: "meer",
    targetId: "wueste",
    type: "contrasts_with",
    title: "Meer steht in Spannung zur Wueste",
    shortResonance: "Wasserfuelle und Wasserentzug spiegeln einander.",
    explanation: "Meer und Wueste markieren gegensaetzliche Erfahrungsraeume von Wasser: Uebermass und Mangel.",
    strength: 0.7,
  },
  {
    id: "ontology-fluss-is-expression-of-wasser",
    sourceId: "fluss",
    targetId: "wasser",
    type: "is_expression_of",
    title: "Fluss ist Ausdruck von Wasser",
    shortResonance: "Im Fluss wird Wasser zu Bewegung und Richtung.",
    explanation: "Der Fluss zeigt Wasser als lebendigen Strom, der einen Weg bildet.",
    strength: 0.85,
  },
  {
    id: "ontology-fluss-structures-journey-weg",
    sourceId: "fluss",
    targetId: "weg",
    type: "structures_journey",
    title: "Fluss strukturiert den Weg",
    shortResonance: "Der Fluss gibt Bewegung eine Richtung.",
    explanation: "Ein Fluss ist Wasser, das nicht steht, sondern einen Weg durch den Raum zeichnet.",
    strength: 0.75,
  },
  {
    id: "ontology-manna-is-expression-of-brot",
    sourceId: "manna",
    targetId: "brot",
    type: "is_expression_of",
    title: "Manna ist Ausdruck von Brot",
    shortResonance: "Manna ist Brot als Gabe im Mangel.",
    explanation: "Manna zeigt Brot als taegliche Gabe auf dem Weg.",
    strength: 1,
  },
  {
    id: "ontology-manna-is-threshold-to-wueste",
    sourceId: "manna",
    targetId: "wueste",
    type: "is_threshold_to",
    title: "Manna ist Schwelle zur Wueste",
    shortResonance: "Im Mangel wird Versorgung als Gabe sichtbar.",
    explanation: "Die Wueste macht Manna als unerwartete Versorgung lesbar.",
    strength: 0.95,
  },
  {
    id: "ontology-manna-emerges-from-tau",
    sourceId: "manna",
    targetId: "tau",
    type: "emerges_from",
    title: "Manna aus dem Tau",
    shortResonance: "Die Gabe erscheint auf der Schwelle des Taus.",
    explanation: "Aus der feinen Feuchte des Morgens tritt die Gabe hervor.",
    strength: 0.85,
  },
  {
    id: "ontology-manna-appears-in-exodus-16",
    sourceId: "manna",
    targetId: "exodus-wilderness",
    type: "appears_in_story",
    title: "Manna in Exodus 16",
    shortResonance: "Exodus 16 verankert Manna als Gabe in der Wueste.",
    explanation: "Die Erzaehlung der Wueste gibt Manna seinen Ort.",
    scriptureAnchors: ["exodus-wilderness"],
  },
  {
    id: "ontology-tau-is-expression-of-wasser",
    sourceId: "tau",
    targetId: "wasser",
    type: "is_expression_of",
    title: "Tau ist Ausdruck von Wasser",
    shortResonance: "Tau zeigt Wasser als leise Gabe von oben.",
    explanation: "Im Tau erscheint Wasser fein, morgendlich und empfangen.",
    strength: 0.85,
  },
  {
    id: "ontology-tau-is-threshold-to-manna",
    sourceId: "tau",
    targetId: "manna",
    type: "is_threshold_to",
    title: "Tau ist Schwelle zu Manna",
    shortResonance: "Aus dem Tau wird die Gabe sichtbar.",
    explanation: "Der Tau bildet die morgendliche Schwelle, auf der Manna hervortritt.",
    strength: 0.8,
  },
  {
    id: "ontology-tau-contains-pattern-gabe-im-mangel",
    sourceId: "tau",
    targetId: "pattern-gabe-im-mangel",
    type: "contains_pattern",
    title: "Tau enthaelt das Muster der Gabe im Mangel",
    shortResonance: "Tau bereitet die Gabe im Mangel vor.",
    explanation: "In der Wueste wird die feine Feuchte des Taus zum Vorraum unerwarteter Versorgung.",
    strength: 0.7,
  },
  {
    id: "ontology-dornbusch-is-expression-of-feuer",
    sourceId: "dornbusch",
    targetId: "feuer",
    type: "is_expression_of",
    title: "Dornbusch ist Ausdruck von Feuer",
    shortResonance: "Der Dornbusch ist Feuer als rufende Gegenwart.",
    explanation: "Im Dornbusch brennt Feuer als Gegenwart, die ruft.",
    strength: 1,
  },
  {
    id: "ontology-dornbusch-reveals-stimme",
    sourceId: "dornbusch",
    targetId: "stimme",
    type: "reveals",
    title: "Dornbusch offenbart Stimme",
    shortResonance: "Im Feuer wird die Stimme hoerbar.",
    explanation: "Im Feuer wird die Stimme hoerbar.",
    strength: 0.9,
  },
  {
    id: "ontology-dornbusch-appears-in-exodus-3-2",
    sourceId: "dornbusch",
    targetId: "exodus-3-2",
    type: "appears_in_story",
    title: "Dornbusch in Exodus 3:2",
    shortResonance: "Der brennende Dornbusch verankert Feuer als nicht verzehrende Gegenwart.",
    explanation: "Exodus 3:2 zeigt Feuer als Gegenwart, die brennt und nicht verzehrt.",
    scriptureAnchors: ["exodus-3-2"],
    strength: 1,
  },
  {
    id: "ontology-dornbusch-contains-pattern-offenbarung-im-feuer",
    sourceId: "dornbusch",
    targetId: "pattern-offenbarung-im-feuer",
    type: "contains_pattern",
    title: "Dornbusch enthaelt das Muster der Offenbarung im Feuer",
    shortResonance: "Im Dornbusch wird Feuer zur Offenbarung ohne Verzehrung.",
    explanation: "Der Dornbusch traegt das Muster, in dem Feuer Gegenwart und Stimme sichtbar macht.",
    strength: 0.95,
  },
  {
    id: "ontology-flamme-is-expression-of-feuer",
    sourceId: "flamme",
    targetId: "feuer",
    type: "is_expression_of",
    title: "Flamme ist Ausdruck von Feuer",
    shortResonance: "Die Flamme macht Feuer sichtbar und beweglich.",
    explanation: "In der Flamme erscheint Feuer als aufsteigende, lebendige Bewegung.",
    strength: 0.9,
  },
  {
    id: "ontology-flamme-reveals-licht",
    sourceId: "flamme",
    targetId: "licht",
    type: "reveals",
    title: "Flamme offenbart Licht",
    shortResonance: "Die Flamme laesst Feuer als Licht erscheinen.",
    explanation: "In der Flamme wird die leuchtende Seite des Feuers sichtbar.",
    strength: 0.75,
  },
  {
    id: "ontology-glut-is-expression-of-feuer",
    sourceId: "glut",
    targetId: "feuer",
    type: "is_expression_of",
    title: "Glut ist Ausdruck von Feuer",
    shortResonance: "Glut ist Feuer als verborgene Waerme.",
    explanation: "Die Glut zeigt, dass Feuer auch verborgen weiterwirken kann.",
    strength: 0.85,
  },
  {
    id: "ontology-glut-opens-into-laeuterung",
    sourceId: "glut",
    targetId: "laeuterung",
    type: "opens_into",
    title: "Glut oeffnet in Laeuterung",
    shortResonance: "Verborgene Hitze wird zur inneren Klaerung.",
    explanation: "Glut traegt die stille Kraft des Feuers, die verwandeln und klaeren kann.",
    strength: 0.75,
  },
  {
    id: "ontology-altar-is-expression-of-feuer",
    sourceId: "altar",
    targetId: "feuer",
    type: "is_expression_of",
    title: "Altarfeuer ist Ausdruck von Feuer",
    shortResonance: "Am Altar wird Feuer zur geordneten Hingabe.",
    explanation: "Das Altarfeuer bindet die Energie des Feuers an Ritual, Naehe und Gabe.",
    strength: 0.85,
  },
  {
    id: "ontology-altar-is-threshold-to-dornbusch",
    sourceId: "altar",
    targetId: "dornbusch",
    type: "is_threshold_to",
    title: "Altarfeuer ist Schwelle zum Dornbusch",
    shortResonance: "Rituelles Feuer bereitet die Lesbarkeit heiliger Gegenwart vor.",
    explanation: "Altarfeuer und Dornbusch teilen Feuer als Ort der Annaeherung an Gegenwart.",
    strength: 0.7,
  },
  {
    id: "ontology-laeuterung-is-expression-of-feuer",
    sourceId: "laeuterung",
    targetId: "feuer",
    type: "is_expression_of",
    title: "Laeuterung ist Ausdruck von Feuer",
    shortResonance: "Laeuterung zeigt Feuer als klaerende Verwandlung.",
    explanation: "In der Laeuterung brennt Feuer nicht nur, sondern macht das Innere klarer.",
    strength: 0.85,
  },
  {
    id: "ontology-laeuterung-passes-through-pruefung",
    sourceId: "laeuterung",
    targetId: "pruefung",
    type: "passes_through",
    title: "Laeuterung fuehrt durch Pruefung",
    shortResonance: "Klaerung geschieht durch Erprobung.",
    explanation: "Laeuterung ist eine Form der Pruefung, in der Verborgenes sichtbar und verwandelt wird.",
    strength: 0.75,
  },
  {
    id: "ontology-weg-is-threshold-to-wueste",
    sourceId: "weg",
    targetId: "wueste",
    type: "is_threshold_to",
    title: "Weg ist Schwelle zur Wueste",
    shortResonance: "Der Weg fuehrt durch den Raum der Reduktion.",
    explanation: "In der Wueste wird der Weg zur Pruefung und Erzaehlung.",
    strength: 1,
  },
  {
    id: "ontology-weg-contains-pattern-weg-der-reifung",
    sourceId: "weg",
    targetId: "pattern-weg-der-reifung",
    type: "contains_pattern",
    title: "Weg enthaelt das Muster der Reifung",
    shortResonance: "Der Weg wird zur Form innerer Reifung.",
    explanation: "Auf dem Weg werden Bewegung, Pruefung und Fuehrung zu innerer Verwandlung.",
    strength: 0.8,
  },
  {
    id: "ontology-weg-passes-through-pruefung",
    sourceId: "weg",
    targetId: "pruefung",
    type: "passes_through",
    title: "Weg fuehrt durch Pruefung",
    shortResonance: "Der Weg macht sichtbar, was im Inneren traegt.",
    explanation: "Auf dem Weg zeigt sich, was im Inneren traegt.",
    strength: 0.85,
  },
  {
    id: "ontology-manna-contains-pattern-gabe-im-mangel",
    sourceId: "manna",
    targetId: "pattern-gabe-im-mangel",
    type: "contains_pattern",
    title: "Manna enthaelt das Muster der Gabe im Mangel",
    shortResonance: "Manna macht Gabe im Raum des Mangels sichtbar.",
    explanation: "Im Manna erscheint Nahrung nicht aus Vorrat, sondern als taeglich empfangene Gabe.",
    strength: 1,
  },
  {
    id: "ontology-leere-is-expression-of-wueste",
    sourceId: "leere",
    targetId: "wueste",
    type: "is_expression_of",
    title: "Leere ist Ausdruck von Wueste",
    shortResonance: "Leere zeigt die Wueste als Raum des Entzugs.",
    explanation: "In der Leere wird der Wuestenraum als Verlust von Sicherheiten erfahrbar.",
    strength: 0.9,
  },
  {
    id: "ontology-leere-contains-pattern-pruefung-durch-entzug",
    sourceId: "leere",
    targetId: "pattern-pruefung-durch-entzug",
    type: "contains_pattern",
    title: "Leere enthaelt das Muster der Pruefung durch Entzug",
    shortResonance: "Leere prueft durch das Wegnehmen von Sicherheiten.",
    explanation: "Die Leere macht Entzug zu einem Raum, in dem innere Wahrheit sichtbar wird.",
    strength: 0.8,
  },
  {
    id: "ontology-leere-opens-into-stimme",
    sourceId: "leere",
    targetId: "stimme",
    type: "opens_into",
    title: "Leere oeffnet in Stimme",
    shortResonance: "Im entleerten Raum kann Stimme hoerbar werden.",
    explanation: "Wo aeussere Sicherheiten schweigen, entsteht Raum fuer den Ruf.",
    strength: 0.75,
  },
  {
    id: "ontology-pruefung-contains-pattern-pruefung-durch-entzug",
    sourceId: "pruefung",
    targetId: "pattern-pruefung-durch-entzug",
    type: "contains_pattern",
    title: "Pruefung enthaelt das Muster der Pruefung durch Entzug",
    shortResonance: "Pruefung klaert durch Entzug.",
    explanation: "Pruefung wird in der Wueste als Weg erfahrbar, auf dem Sicherheiten wegfallen.",
    strength: 0.85,
  },
  {
    id: "ontology-stimme-emerges-from-leere",
    sourceId: "stimme",
    targetId: "leere",
    type: "emerges_from",
    title: "Stimme entsteht aus Leere",
    shortResonance: "Aus der Stille der Leere wird der Ruf hoerbar.",
    explanation: "Die Stimme braucht den entleerten Raum, in dem sie nicht von anderen Sicherheiten verdeckt wird.",
    strength: 0.75,
  },
  {
    id: "ontology-stimme-reveals-licht",
    sourceId: "stimme",
    targetId: "licht",
    type: "reveals",
    title: "Stimme offenbart Licht",
    shortResonance: "Die Stimme gibt Orientierung wie Licht.",
    explanation: "Der Ruf aus der Wueste macht Richtung und Erkenntnis sichtbar.",
    strength: 0.7,
  },
  {
    id: "ontology-wueste-contains-pattern-pruefung-durch-entzug",
    sourceId: "wueste",
    targetId: "pattern-pruefung-durch-entzug",
    type: "contains_pattern",
    title: "Wueste enthaelt das Muster der Pruefung durch Entzug",
    shortResonance: "Die Wueste prueft durch Reduktion und Mangel.",
    explanation: "In der Wueste werden aeussere Sicherheiten entzogen, damit innere Wahrheit sichtbar wird.",
    strength: 1,
  },
  {
    id: "ontology-wasser-contains-pattern-schwelle-durch-wasser",
    sourceId: "wasser",
    targetId: "pattern-schwelle-durch-wasser",
    type: "contains_pattern",
    title: "Wasser enthaelt das Muster der Schwelle",
    shortResonance: "Wasser wird Grenze, Durchgang und Neuwerdung.",
    explanation: "Wasser trennt und traegt zugleich: Es markiert Gefahr, Reinigung und Geburt.",
    strength: 1,
  },
  {
    id: "ontology-feuer-contains-pattern-offenbarung-im-feuer",
    sourceId: "feuer",
    targetId: "pattern-offenbarung-im-feuer",
    type: "contains_pattern",
    title: "Feuer enthaelt das Muster der Offenbarung",
    shortResonance: "Feuer macht Gegenwart und Stimme sichtbar.",
    explanation: "Feuer erscheint nicht nur als Verzehrung, sondern als Naehe, die das Verborgene zeigt.",
    strength: 0.95,
  },
  {
    id: "ontology-morgenlicht-is-expression-of-licht",
    sourceId: "morgenlicht",
    targetId: "licht",
    type: "is_expression_of",
    title: "Morgenlicht ist Ausdruck von Licht",
    shortResonance: "Morgenlicht zeigt Licht als Anfang und Erwachen.",
    explanation: "Im Morgenlicht wird Licht zur ersten Orientierung nach der Dunkelheit.",
    strength: 0.85,
  },
  {
    id: "ontology-leuchte-is-expression-of-licht",
    sourceId: "leuchte",
    targetId: "licht",
    type: "is_expression_of",
    title: "Leuchte ist Ausdruck von Licht",
    shortResonance: "Die Leuchte traegt Licht im Raum.",
    explanation: "In der Leuchte wird Licht geordnet, bewahrt und weitergegeben.",
    strength: 0.85,
  },
  {
    id: "ontology-stern-is-expression-of-licht",
    sourceId: "stern",
    targetId: "licht",
    type: "is_expression_of",
    title: "Stern ist Ausdruck von Licht",
    shortResonance: "Der Stern zeigt Licht als Orientierung in der Nacht.",
    explanation: "Der Stern macht Licht als fernes Zeichen und himmlische Ordnung lesbar.",
    strength: 0.85,
  },
  {
    id: "ontology-glanz-is-expression-of-licht",
    sourceId: "glanz",
    targetId: "licht",
    type: "is_expression_of",
    title: "Glanz ist Ausdruck von Licht",
    shortResonance: "Glanz zeigt Licht als Ausstrahlung.",
    explanation: "Im Glanz wird Licht zu sichtbarer Gegenwart und Wuerde.",
    strength: 0.8,
  },
  {
    id: "ontology-auge-is-threshold-to-licht",
    sourceId: "auge",
    targetId: "licht",
    type: "is_threshold_to",
    title: "Auge ist Schwelle zum Licht",
    shortResonance: "Das Auge macht Licht zur Wahrnehmung.",
    explanation: "Durch das Auge wird Licht nicht nur hell, sondern gesehen und gedeutet.",
    strength: 0.8,
  },
];

let registry: OntologyRegistry | null = null;

const technicalOntologyTextPatterns = [
  /existiert bereits/i,
  /als Unterraum/i,
  /semantisch erreicht/i,
  /\btarget\b/i,
  /Ontology/i,
  /CodexEntry/i,
  /\bID\b/,
  /Fallback/i,
  /extern/i,
  /interner/i,
  /modelliert/i,
  /TODO/i,
  /Semantic Zoom/i,
];

function normalizeOntologyText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeOntologyTextForComparison(value: string) {
  return normalizeOntologyText(value)
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function isUserFacingOntologyText(value: string) {
  const text = normalizeOntologyText(value);

  return text.length > 0 && !technicalOntologyTextPatterns.some((pattern) => pattern.test(text));
}

function areOntologyTextsNearDuplicate(left: string, right: string) {
  const normalizedLeft = normalizeOntologyTextForComparison(left);
  const normalizedRight = normalizeOntologyTextForComparison(right);

  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;
  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) return true;

  const leftWords = new Set(normalizedLeft.split(/\s+/));
  const rightWords = new Set(normalizedRight.split(/\s+/));
  const sharedWords = Array.from(leftWords).filter((word) => rightWords.has(word)).length;
  const unionSize = new Set([...leftWords, ...rightWords]).size;

  return unionSize > 0 && sharedWords / unionSize >= 0.82;
}

function formatOntologyExternalLabel(id: string) {
  const scriptureLikeId = id.match(/^([a-z]+)-(\d+)(?:-(\d+))?$/);

  if (scriptureLikeId) {
    const [, book, chapter, verse] = scriptureLikeId;
    const bookLabel = book.charAt(0).toUpperCase() + book.slice(1);

    return verse ? `${bookLabel} ${chapter}:${verse}` : `${bookLabel} ${chapter}`;
  }

  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getOntologyRelationLabel(type: OntologyRelationType): string {
  return ONTOLOGY_RELATION_LABELS[type];
}

export function getOntologyRelationMarkerLabel(type: OntologyRelationType): string {
  return ONTOLOGY_RELATION_MARKER_LABELS[type];
}

export function getOntologyEntityTitle(id: string): string {
  return getOntologyEntity(id)?.title ?? formatOntologyExternalLabel(id);
}

export function normalizeOntologyStrength(strength?: number): number {
  if (!strength) return 0;
  return strength <= 1 ? strength * 100 : strength;
}

export function sortOntologyRelations(relations: OntologyRelation[]): OntologyRelation[] {
  return [...relations].sort((left, right) => {
    const leftPriority = ONTOLOGY_RELATION_PRIORITY[left.type] ?? 99;
    const rightPriority = ONTOLOGY_RELATION_PRIORITY[right.type] ?? 99;

    return leftPriority - rightPriority
      || normalizeOntologyStrength(right.strength) - normalizeOntologyStrength(left.strength)
      || left.id.localeCompare(right.id, "de-DE");
  });
}

export function shouldShowOntologyExplanation(
  shortResonance?: string,
  explanation?: string,
): boolean {
  const shortText = normalizeOntologyText(shortResonance ?? "");
  const explanationText = normalizeOntologyText(explanation ?? "");

  if (!isUserFacingOntologyText(explanationText)) return false;
  if (!shortText) return true;
  if (areOntologyTextsNearDuplicate(shortText, explanationText)) return false;
  if (explanationText.length <= shortText.length + 18 && areOntologyTextsNearDuplicate(shortText, explanationText)) return false;

  return true;
}

export function getOntologyDisplayText(relation: OntologyRelation): string {
  const shortResonance = normalizeOntologyText(relation.shortResonance);
  const explanation = normalizeOntologyText(relation.explanation);
  const hasShortResonance = isUserFacingOntologyText(shortResonance);
  const hasExplanation = isUserFacingOntologyText(explanation);

  if (hasShortResonance) {
    return shortResonance;
  }

  if (hasExplanation && !areOntologyTextsNearDuplicate(shortResonance, explanation)) {
    return explanation;
  }

  return "";
}

function createRegistry(): OntologyRegistry {
  const byId = new Map<string, OntologyEntity>();
  const relationsBySource = new Map<string, OntologyRelation[]>();
  const relationsByTarget = new Map<string, OntologyRelation[]>();
  const relationsByType = new Map<OntologyRelationType, OntologyRelation[]>();
  const entitiesByTag = new Map<string, OntologyEntity[]>();

  ontologyEntities.forEach((entity) => {
    byId.set(entity.id, entity);

    entity.tags.forEach((tag) => {
      const taggedEntities = entitiesByTag.get(tag) ?? [];
      taggedEntities.push(entity);
      entitiesByTag.set(tag, taggedEntities);
    });
  });

  ontologyRelations.forEach((relation) => {
    const sourceRelations = relationsBySource.get(relation.sourceId) ?? [];
    sourceRelations.push(relation);
    relationsBySource.set(relation.sourceId, sourceRelations);

    const targetRelations = relationsByTarget.get(relation.targetId) ?? [];
    targetRelations.push(relation);
    relationsByTarget.set(relation.targetId, targetRelations);

    const typeRelations = relationsByType.get(relation.type) ?? [];
    typeRelations.push(relation);
    relationsByType.set(relation.type, typeRelations);
  });

  return {
    entities: ontologyEntities,
    relations: ontologyRelations,
    byId,
    relationsBySource,
    relationsByTarget,
    relationsByType,
    entitiesByTag,
  };
}

export function getOntologyRegistry(): OntologyRegistry {
  registry ??= createRegistry();
  return registry;
}

export function getOntologyEntity(id: string): OntologyEntity | undefined {
  return getOntologyRegistry().byId.get(id);
}

export function getOntologyRelationsForEntity(id: string): OntologyRelation[] {
  const registry = getOntologyRegistry();

  return [
    ...(registry.relationsBySource.get(id) ?? []),
    ...(registry.relationsByTarget.get(id) ?? []),
  ];
}

export function getOntologyRelationsByType(type: OntologyRelationType): OntologyRelation[] {
  return getOntologyRegistry().relationsByType.get(type) ?? [];
}

export function getOntologyNeighbors(id: string): OntologyNeighbor[] {
  const registry = getOntologyRegistry();
  const sourceNeighbors = (registry.relationsBySource.get(id) ?? [])
    .flatMap((relation): OntologyNeighbor[] => {
      const entity = registry.byId.get(relation.targetId);

      return entity ? [{ entity, relation, direction: "target" }] : [];
    });
  const targetNeighbors = (registry.relationsByTarget.get(id) ?? [])
    .flatMap((relation): OntologyNeighbor[] => {
      const entity = registry.byId.get(relation.sourceId);

      return entity ? [{ entity, relation, direction: "source" }] : [];
    });

  return [...sourceNeighbors, ...targetNeighbors];
}

export function getOntologyEntitiesByTag(tag: string): OntologyEntity[] {
  return getOntologyRegistry().entitiesByTag.get(tag) ?? [];
}
