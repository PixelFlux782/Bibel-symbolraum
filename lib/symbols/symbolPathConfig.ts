export type SymbolPathSource = "symbolnetz" | "codex" | "room";

export type SymbolPathConfig = {
  symbolId: string;
  label: string;
  hebrew: string;
  codexHref: string;
  roomHref: string;
  networkHref: string;
  symbolNetworkHref: string;
  returnToSymbolNetworkHref: string;
  roomLabel: string;
  traceLabel: string;
  returnLabel: string;
  pathLabel: string;
  reflectionSource: {
    sourceType: "room";
    sourceId: string;
    label: string;
    contextLabel: string;
  };
  ctaLabels: {
    codex: string;
    room: string;
    roomReturn: string;
    symbolNetworkReturn: string;
  };
  codexGates?: {
    meaningFields?: {
      id: string;
      meaningNodeId?: string;
      label: string;
      href?: string;
    }[];
    scriptureAnchors?: {
      id: string;
      reference: string;
      label: string;
      href?: string;
    }[];
  };
  codexAnchorBridge?: {
    anchorIds: string[];
    defaultContextLabel: string;
    contextLabels?: Record<string, string>;
    returnLabel: string;
    roomLabel: string;
    roomTraceLabel: string;
    personalPathLabel?: string;
  };
  movement: string[];
};

export const symbolPathConfigs = {
  wasser: {
    symbolId: "wasser",
    label: "Wasser",
    hebrew: "\u05de\u05d9\u05dd",
    codexHref: "/codex/wasser",
    roomHref: "/raeume/wasser",
    networkHref: "/symbolnetz?symbol=wasser",
    symbolNetworkHref: "/symbolnetz?symbol=wasser",
    returnToSymbolNetworkHref: "/symbolnetz?symbol=wasser",
    roomLabel: "Wasserraum",
    traceLabel: "Wasser-Spur",
    returnLabel: "Zur Wasserspur zurückkehren",
    pathLabel: "Wasser · Tiefe / Ursprung / Übergang",
    reflectionSource: {
      sourceType: "room",
      sourceId: "wasser",
      label: "Spur aus dem Wasserraum",
      contextLabel: "Spur aus dem Wasserraum",
    },
    ctaLabels: {
      codex: "Wasser im Codex lesen",
      room: "Den Wasserraum betreten",
      roomReturn: "In den Wasserraum zurückkehren",
      symbolNetworkReturn: "Zum Symbolnetz zurückkehren",
    },
    codexGates: {
      meaningFields: [
        { id: "tiefe", meaningNodeId: "depth", label: "Tiefe", href: "/codex/tiefe" },
        { id: "uebergang", meaningNodeId: "transition", label: "Übergang" },
        { id: "reinigung", meaningNodeId: "purification", label: "Reinigung", href: "/codex/reinigung" },
        { id: "geburt", meaningNodeId: "birth", label: "Geburt" },
        { id: "verborgenheit", meaningNodeId: "hiddenness", label: "Verborgenheit" },
      ],
      scriptureAnchors: [
        { id: "genesis-1-2", reference: "Genesis 1,2", label: "Genesis 1,2", href: "/codex/genesis-1-2" },
        { id: "exodus-14", reference: "Exodus 14", label: "Exodus 14", href: "/codex/exodus-14" },
      ],
    },
    codexAnchorBridge: {
      anchorIds: [
        "wasser",
        "tiefe",
        "reinigung",
        "uebergang",
        "geburt",
        "verborgenheit",
        "genesis-1-2",
        "exodus-14",
      ],
      defaultContextLabel: "Teil der Wasserspur",
      contextLabels: {
        "genesis-1-2": "Wasser vor der Ordnung",
        "exodus-14": "Wasser als Schwelle",
      },
      returnLabel: "Zum Wasser-Codex zurückkehren",
      roomLabel: "Den Wasserraum betreten",
      roomTraceLabel: "Diese Spur im Wasserraum bewegen",
      personalPathLabel: "Meinen Pfad ansehen",
    },
    movement: ["Symbolnetz", "Codex", "Raum", "persönliche Spur", "Mein Pfad"],
  },
  licht: {
    symbolId: "licht",
    label: "Licht",
    hebrew: "\u05d0\u05d5\u05e8",
    codexHref: "/codex/licht",
    roomHref: "/raeume/licht",
    networkHref: "/symbolnetz?symbol=licht",
    symbolNetworkHref: "/symbolnetz?symbol=licht",
    returnToSymbolNetworkHref: "/symbolnetz?symbol=licht",
    roomLabel: "Lichtraum",
    traceLabel: "Licht-Spur",
    returnLabel: "Zur Lichtspur zurückkehren",
    pathLabel: "Lichtpfad",
    reflectionSource: {
      sourceType: "room",
      sourceId: "licht",
      label: "Spur aus dem Lichtraum",
      contextLabel: "Spur aus dem Lichtraum",
    },
    ctaLabels: {
      codex: "Licht im Codex lesen",
      room: "Den Lichtraum betreten",
      roomReturn: "In den Lichtraum zurückkehren",
      symbolNetworkReturn: "Zum Symbolnetz zurückkehren",
    },
    codexGates: {
      meaningFields: [
        { id: "or", meaningNodeId: "light", label: "Or / Licht", href: "/codex/or" },
        { id: "raah", meaningNodeId: "awareness", label: "Raah / Sehen", href: "/codex/raah" },
        { id: "tov", meaningNodeId: "life", label: "Tov / Gut", href: "/codex/tov" },
        { id: "offenbarung", meaningNodeId: "revelation", label: "Offenbarung", href: "/codex/offenbarung" },
        { id: "ordnung", meaningNodeId: "guidance", label: "Ordnung", href: "/codex/ordnung" },
        { id: "erkenntnis", meaningNodeId: "awareness", label: "Erkenntnis", href: "/codex/erkenntnis" },
        { id: "glanz", meaningNodeId: "light", label: "Glanz", href: "/codex/glanz" },
        { id: "auge", meaningNodeId: "awareness", label: "Auge", href: "/codex/auge" },
        { id: "himmel", meaningNodeId: "guidance", label: "Himmel", href: "/codex/himmel" },
      ],
      scriptureAnchors: [
        { id: "genesis-1-3", reference: "Genesis 1,3", label: "Genesis 1,3", href: "/codex/genesis-1-3" },
        { id: "genesis-1-4", reference: "Genesis 1,4", label: "Genesis 1,4", href: "/codex/genesis-1-4" },
      ],
    },
    codexAnchorBridge: {
      anchorIds: [
        "licht",
        "or",
        "raah",
        "tov",
        "offenbarung",
        "ordnung",
        "erkenntnis",
        "glanz",
        "auge",
        "himmel",
        "genesis-1-3",
        "genesis-1-4",
      ],
      defaultContextLabel: "Teil der Lichtspur",
      contextLabels: {
        "genesis-1-3": "Licht als erstes Sichtbarwerden",
        "genesis-1-4": "Licht als leise Schwelle von Sehen und Gut",
        or: "Licht als hebraeischer Klang",
        raah: "Sehen als Folgeschwelle des Lichts",
        tov: "Gut als erkannte Qualitaet",
      },
      returnLabel: "Zum Licht-Codex zurückkehren",
      roomLabel: "Den Lichtraum betreten",
      roomTraceLabel: "Diese Spur im Lichtraum bewegen",
      personalPathLabel: "Meinen Lichtpfad ansehen",
    },
    movement: ["Finsternis", "Ruf", "Licht", "Scheidung", "Ordnung", "Erkenntnis"],
  },
  feuer: {
    symbolId: "feuer",
    label: "Feuer",
    hebrew: "\u05d0\u05e9",
    codexHref: "/codex/feuer",
    roomHref: "/raeume/feuer",
    networkHref: "/symbolnetz?symbol=feuer",
    symbolNetworkHref: "/symbolnetz?symbol=feuer",
    returnToSymbolNetworkHref: "/symbolnetz?symbol=feuer",
    roomLabel: "Feuerraum",
    traceLabel: "Feuer-Spur",
    returnLabel: "Zur Feuerspur zurückkehren",
    pathLabel: "Feuerpfad",
    reflectionSource: {
      sourceType: "room",
      sourceId: "feuer",
      label: "Spur aus dem Feuerraum",
      contextLabel: "Spur aus dem Feuerraum",
    },
    ctaLabels: {
      codex: "Feuer im Codex lesen",
      room: "Den Feuerraum betreten",
      roomReturn: "In den Feuerraum zurückkehren",
      symbolNetworkReturn: "Zum Symbolnetz zurückkehren",
    },
    codexGates: {
      meaningFields: [
        { id: "offenbarung", meaningNodeId: "revelation", label: "Offenbarung", href: "/codex/offenbarung" },
        { id: "laeuterung", meaningNodeId: "purification", label: "Läuterung", href: "/codex/laeuterung" },
        { id: "wandlung", meaningNodeId: "transformation", label: "Wandlung", href: "/codex/wandlung" },
        { id: "ruf", meaningNodeId: "calling", label: "Ruf", href: "/codex/ruf" },
        { id: "gegenwart", meaningNodeId: "presence", label: "Gegenwart", href: "/codex/gegenwart" },
      ],
      scriptureAnchors: [
        { id: "exodus-3-2", reference: "Exodus 3,2", label: "Exodus 3,2", href: "/codex/exodus-3-2" },
        { id: "pattern-offenbarung-im-feuer", reference: "Offenbarung im Feuer", label: "Offenbarung im Feuer", href: "/codex/pattern-offenbarung-im-feuer" },
      ],
    },
    codexAnchorBridge: {
      anchorIds: [
        "feuer",
        "esch",
        "flamme",
        "glut",
        "dornbusch",
        "altar",
        "laeuterung",
        "offenbarung-im-feuer",
        "pattern-offenbarung-im-feuer",
        "exodus-3",
        "exodus-3-2",
        "brennender-dornbusch",
      ],
      defaultContextLabel: "Teil der Feuerspur",
      contextLabels: {
        esch: "Feuer als hebräischer Klang",
        flamme: "Feuer als sichtbare Bewegung",
        glut: "Feuer als innere Gegenwart",
        dornbusch: "Feuer als Ruf am Dornbusch",
        altar: "Feuer als geordnete Hingabe",
        laeuterung: "Feuer als klärende Wandlung",
        "offenbarung-im-feuer": "Feuer als Offenbarung",
        "pattern-offenbarung-im-feuer": "Feuer als Offenbarung",
        "exodus-3": "Feuer als Ruf im Exodus",
        "exodus-3-2": "Feuer im brennenden Dornbusch",
        "brennender-dornbusch": "Feuer im brennenden Dornbusch",
      },
      returnLabel: "Zum Feuer-Codex zurückkehren",
      roomLabel: "Den Feuerraum betreten",
      roomTraceLabel: "Diese Spur im Feuerraum bewegen",
      personalPathLabel: "Meinen Feuerpfad ansehen",
    },
    movement: ["Ruf", "Flamme", "Grenze", "Gegenwart", "Läuterung", "Wandlung"],
  },
  wueste: {
    symbolId: "wueste",
    label: "Wüste",
    hebrew: "\u05de\u05d3\u05d1\u05e8",
    codexHref: "/codex/wueste",
    roomHref: "/raeume/wueste",
    networkHref: "/symbolnetz?symbol=wueste",
    symbolNetworkHref: "/symbolnetz?symbol=wueste",
    returnToSymbolNetworkHref: "/symbolnetz?symbol=wueste",
    roomLabel: "Wüstenraum",
    traceLabel: "Wüsten-Spur",
    returnLabel: "Zur Wüstenspur zurückkehren",
    pathLabel: "Wüstenpfad",
    reflectionSource: {
      sourceType: "room",
      sourceId: "wueste",
      label: "Spur aus dem Wüstenraum",
      contextLabel: "Spur aus dem Wüstenraum",
    },
    ctaLabels: {
      codex: "Wüste im Codex lesen",
      room: "Den Wüstenraum betreten",
      roomReturn: "In den Wüstenraum zurückkehren",
      symbolNetworkReturn: "Zum Symbolnetz zurückkehren",
    },
    codexGates: {
      meaningFields: [
        { id: "midbar", meaningNodeId: "desert", label: "Midbar", href: "/codex/midbar" },
        { id: "leere", meaningNodeId: "lack", label: "Leere", href: "/codex/leere" },
        { id: "pruefung", meaningNodeId: "testing", label: "Prüfung", href: "/codex/pruefung" },
        { id: "stimme", meaningNodeId: "voice", label: "Stimme", href: "/codex/stimme" },
        { id: "weg", meaningNodeId: "guidance", label: "Weg", href: "/codex/weg" },
        { id: "manna", meaningNodeId: "gift", label: "Manna", href: "/codex/manna" },
      ],
      scriptureAnchors: [
        { id: "exodus-16", reference: "Exodus 16", label: "Exodus 16", href: "/codex/exodus-16" },
        { id: "exodus-16-4", reference: "Exodus 16,4", label: "Exodus 16,4", href: "/codex/exodus-16-4" },
        { id: "deuteronomium-8", reference: "Deuteronomium 8", label: "Deuteronomium 8", href: "/codex/deuteronomium-8" },
        { id: "deuteronomium-8-2", reference: "Deuteronomium 8,2", label: "Deuteronomium 8,2", href: "/codex/deuteronomium-8-2" },
      ],
    },
    codexAnchorBridge: {
      anchorIds: [
        "midbar",
        "leere",
        "pruefung",
        "stimme",
        "weg",
        "manna",
        "pattern-gabe-im-mangel",
        "pattern-pruefung-durch-entzug",
        "pattern-weg-der-reifung",
        "exodus-16",
        "exodus-16-4",
        "deuteronomium-8",
        "deuteronomium-8-2",
        "deuteronomy-8",
        "deuteronomy-8-2",
        "deuteronomy-8-3",
      ],
      defaultContextLabel: "Teil der Wüstenspur",
      contextLabels: {
        midbar: "Wüste als hebräischer Klang",
        leere: "Wüste als Raum der Leere",
        pruefung: "Wüste als Prüfung",
        stimme: "Wüste als Raum des Hörens",
        weg: "Wüste als Weg der Reifung",
        manna: "Wüste als Gabe im Mangel",
        "pattern-gabe-im-mangel": "Wüste als Gabe im Mangel",
        "pattern-pruefung-durch-entzug": "Wüste als Prüfung durch Entzug",
        "pattern-weg-der-reifung": "Wüste als Weg der Reifung",
        "exodus-16": "Wüste als Manna-Erzählung",
        "exodus-16-4": "Wüste als tägliche Gabe",
        "deuteronomium-8": "Wüste als erinnerter Reifungsweg",
        "deuteronomium-8-2": "Wüste als Prüfung des Herzens",
        "deuteronomy-8": "Wüste als erinnerter Reifungsweg",
        "deuteronomy-8-2": "Wüste als Prüfung des Herzens",
        "deuteronomy-8-3": "Wüste als Brot-und-Wort-Spur",
      },
      returnLabel: "Zum Wüsten-Codex zurückkehren",
      roomLabel: "Den Wüstenraum betreten",
      roomTraceLabel: "Diese Spur im Wüstenraum bewegen",
      personalPathLabel: "Meinen Pfad ansehen",
    },
    movement: ["Leere", "Prüfung", "Entzug", "Hören", "Stimme", "Weg", "Manna", "Reifung"],
  },
  brot: {
    symbolId: "brot",
    label: "Brot",
    hebrew: "\u05dc\u05d7\u05dd",
    codexHref: "/codex/brot",
    roomHref: "/raeume/brot",
    networkHref: "/symbolnetz?symbol=brot",
    symbolNetworkHref: "/symbolnetz?symbol=brot",
    returnToSymbolNetworkHref: "/symbolnetz?symbol=brot",
    roomLabel: "Brotraum",
    traceLabel: "Brot-Spur",
    returnLabel: "Zur Brotspur zurückkehren",
    pathLabel: "Brotpfad",
    reflectionSource: {
      sourceType: "room",
      sourceId: "brot",
      label: "Spur aus dem Brotraum",
      contextLabel: "Spur aus dem Brotraum",
    },
    ctaLabels: {
      codex: "Brot im Codex lesen",
      room: "Den Brotraum betreten",
      roomReturn: "In den Brotraum zurückkehren",
      symbolNetworkReturn: "Zum Symbolnetz zurückkehren",
    },
    codexGates: {
      meaningFields: [
        { id: "lechem", meaningNodeId: "gift", label: "Lechem", href: "/codex/lechem" },
        { id: "manna", meaningNodeId: "gift", label: "Manna", href: "/codex/manna" },
        { id: "gabe", meaningNodeId: "gift", label: "Gabe", href: "/codex/gabe" },
        { id: "nahrung", meaningNodeId: "life", label: "Nahrung", href: "/codex/nahrung" },
        { id: "speise", meaningNodeId: "life", label: "Speise", href: "/codex/speise" },
        { id: "saettigung", meaningNodeId: "life", label: "Sättigung", href: "/codex/saettigung" },
        { id: "teilen", meaningNodeId: "community", label: "Teilen", href: "/codex/teilen" },
        { id: "wort", meaningNodeId: "word", label: "Wort", href: "/codex/wort" },
        { id: "pattern-gabe-im-mangel", meaningNodeId: "gift", label: "Gabe im Mangel", href: "/codex/pattern-gabe-im-mangel" },
      ],
      scriptureAnchors: [
        { id: "exodus-16", reference: "Exodus 16", label: "Exodus 16", href: "/codex/exodus-16" },
        { id: "exodus-16-4", reference: "Exodus 16,4", label: "Exodus 16,4", href: "/codex/exodus-16-4" },
        { id: "deuteronomium-8", reference: "Deuteronomium 8", label: "Deuteronomium 8", href: "/codex/deuteronomium-8" },
        { id: "deuteronomium-8-3", reference: "Deuteronomium 8,3", label: "Deuteronomium 8,3", href: "/codex/deuteronomium-8-3" },
        { id: "brot-vom-himmel", reference: "Exodus 16,4", label: "Brot vom Himmel", href: "/codex/brot-vom-himmel" },
        { id: "manna-in-der-wueste", reference: "Exodus 16", label: "Manna in der Wüste", href: "/codex/manna-in-der-wueste" },
      ],
    },
    codexAnchorBridge: {
      anchorIds: [
        "lechem",
        "manna",
        "gabe",
        "nahrung",
        "speise",
        "saettigung",
        "teilen",
        "wort",
        "gabe-im-mangel",
        "pattern-gabe-im-mangel",
        "exodus-16",
        "exodus-16-4",
        "deuteronomium-8",
        "deuteronomium-8-3",
        "deuteronomy-8",
        "deuteronomy-8-3",
        "brot-vom-himmel",
        "manna-in-der-wueste",
      ],
      defaultContextLabel: "Teil der Brotspur",
      contextLabels: {
        lechem: "Brot als hebräischer Klang",
        manna: "Brot als Gabe im Mangel",
        gabe: "Brot als empfangene Gabe",
        nahrung: "Brot als Nahrung",
        speise: "Brot als Speise",
        saettigung: "Brot als Sättigung",
        teilen: "Brot als geteilte Gabe",
        wort: "Brot als Spur des Wortes",
        "gabe-im-mangel": "Brot als Gabe im Mangel",
        "pattern-gabe-im-mangel": "Brot als Gabe im Mangel",
        "exodus-16": "Brot als Manna-Erzählung",
        "exodus-16-4": "Brot als Gabe vom Himmel",
        "deuteronomium-8": "Brot als erinnerter Lernweg",
        "deuteronomium-8-3": "Brot als Wort-und-Nahrung-Spur",
        "deuteronomy-8": "Brot als erinnerter Lernweg",
        "deuteronomy-8-3": "Brot als Wort-und-Nahrung-Spur",
        "brot-vom-himmel": "Brot als Gabe vom Himmel",
        "manna-in-der-wueste": "Brot als Manna in der Wüste",
      },
      returnLabel: "Zum Brot-Codex zurückkehren",
      roomLabel: "Den Brotraum betreten",
      roomTraceLabel: "Diese Spur im Brotraum bewegen",
      personalPathLabel: "Meinen Pfad ansehen",
    },
    movement: ["Mangel", "Empfang", "Gabe", "Sättigung", "Teilen", "Wort", "Wandlung"],
  },
} as const satisfies Record<string, SymbolPathConfig>;

export type ConfiguredSymbolId = keyof typeof symbolPathConfigs;

export const knownSymbolPathLabels: Record<string, string> = {
  "genesis-1-3": "Genesis 1,3",
  "genesis-1-4": "Genesis 1,4",
  "genesis-1-2": "Genesis 1,2",
  "exodus-3": "Exodus 3",
  "exodus-3-2": "Exodus 3,2",
  wasser: "Wasser",
  licht: "Licht",
  or: "Or",
  raah: "Raah",
  tov: "Tov",
  feuer: "Feuer",
  esch: "Esch",
  flamme: "Flamme",
  glut: "Glut",
  dornbusch: "Dornbusch",
  altar: "Altar",
  laeuterung: "Läuterung",
  "offenbarung-im-feuer": "Offenbarung im Feuer",
  "pattern-offenbarung-im-feuer": "Offenbarung im Feuer",
  "brennender-dornbusch": "Brennender Dornbusch",
  ordnung: "Ordnung",
  offenbarung: "Offenbarung",
  erkenntnis: "Erkenntnis",
  tiefe: "Tiefe",
  geist: "Geist",
  wueste: "Wüste",
  brot: "Brot",
  lechem: "Lechem",
  gabe: "Gabe",
  nahrung: "Nahrung",
  speise: "Speise",
  saettigung: "Sättigung",
  teilen: "Teilen",
  wort: "Wort",
  "gabe-im-mangel": "Gabe im Mangel",
  midbar: "Midbar",
  leere: "Leere",
  pruefung: "Prüfung",
  stimme: "Stimme",
  weg: "Weg",
  manna: "Manna",
  "pattern-gabe-im-mangel": "Gabe im Mangel",
  "pattern-pruefung-durch-entzug": "Prüfung durch Entzug",
  "pattern-weg-der-reifung": "Weg der Reifung",
  "exodus-16": "Exodus 16",
  "exodus-16-4": "Exodus 16,4",
  "deuteronomium-8": "Deuteronomium 8",
  "deuteronomium-8-2": "Deuteronomium 8,2",
  "deuteronomium-8-3": "Deuteronomium 8,3",
  "deuteronomy-8": "Deuteronomium 8",
  "deuteronomy-8-2": "Deuteronomium 8,2",
  "deuteronomy-8-3": "Deuteronomium 8,3",
  "brot-vom-himmel": "Brot vom Himmel",
  "manna-in-der-wueste": "Manna in der Wüste",
};

export function getSymbolPathConfig(symbolId: string | null | undefined) {
  if (!symbolId) return undefined;

  return symbolPathConfigs[symbolId as ConfiguredSymbolId];
}

export function getCodexHref(symbolId: string) {
  return getSymbolPathConfig(symbolId)?.codexHref ?? `/codex/${symbolId}`;
}

export function getSymbolNetworkHref(symbolId: string) {
  return getSymbolPathConfig(symbolId)?.networkHref ?? `/symbolnetz?symbol=${encodeURIComponent(symbolId)}`;
}

export function buildSymbolRoomHref(symbolId: string, context?: { from?: string; path?: string; symbol?: string }) {
  const params = new URLSearchParams();
  const roomHref = getSymbolPathConfig(symbolId)?.roomHref ?? `/raeume/${symbolId}`;

  if (context?.from) {
    params.set("from", context.from);
  }

  if (context?.path) {
    params.set("path", context.path);
  }

  if (context?.symbol) {
    params.set("symbol", context.symbol);
  }

  const query = params.toString();

  return query ? `${roomHref}?${query}` : roomHref;
}

export function getKnownSymbolPathLabel(pathId: string | null | undefined) {
  if (!pathId) return undefined;

  return knownSymbolPathLabels[pathId.split(/[?#]/, 1)[0]];
}

export function getSymbolTraceFallbackLabel(symbolId: string | null | undefined) {
  return getSymbolPathConfig(symbolId)?.traceLabel ?? "Symbol-Spur";
}

export function getSymbolPathConfigFromReflectionLike(reflection: {
  symbolSlug?: string;
  sourceId?: string;
  room?: string;
  roomHref?: string;
  codexHref?: string;
  symbol?: string;
  title?: string;
}) {
  const symbolText = reflection.symbol?.toLocaleLowerCase("de-DE");
  const titleText = reflection.title?.toLocaleLowerCase("de-DE");

  return (
    getSymbolPathConfig(reflection.symbolSlug) ??
    getSymbolPathConfig(reflection.sourceId) ??
    getSymbolPathConfig(reflection.room) ??
    Object.values(symbolPathConfigs).find((config) => (
      reflection.roomHref === config.roomHref ||
      reflection.codexHref === config.codexHref ||
      symbolText === config.symbolId ||
      titleText === config.symbolId ||
      reflection.symbol === config.label ||
      reflection.title === config.label
    ))
  );
}
