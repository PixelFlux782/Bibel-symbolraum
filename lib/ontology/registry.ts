import type {
  OntologyEntity,
  OntologyNeighbor,
  OntologyRegistry,
  OntologyRelation,
  OntologyRelationType,
} from "./types";

export const ontologyEntities: OntologyEntity[] = [
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
    targetId: "exodus-16",
    type: "appears_in_story",
    title: "Manna in Exodus 16",
    shortResonance: "Exodus 16 verankert Manna als Gabe in der Wueste.",
    explanation: "Die Erzaehlung der Wueste gibt Manna seinen Ort.",
    scriptureAnchors: ["exodus-16"],
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
