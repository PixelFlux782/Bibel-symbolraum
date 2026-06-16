export type SymbolPathSource = "symbolnetz" | "codex" | "room";

export type SymbolPathConfig = {
  symbolId: string;
  label: string;
  hebrew: string;
  codexHref: string;
  roomHref: string;
  symbolNetworkHref: string;
  returnToSymbolNetworkHref: string;
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
    symbolNetworkHref: "/symbolnetz?symbol=wasser",
    returnToSymbolNetworkHref: "/symbolnetz?symbol=wasser",
    pathLabel: "Wasser · Tiefe / Ursprung / Uebergang",
    reflectionSource: {
      sourceType: "room",
      sourceId: "wasser",
      label: "Spur aus dem Wasserraum",
      contextLabel: "Spur aus dem Wasserraum",
    },
    ctaLabels: {
      codex: "Wasser im Codex lesen",
      room: "Den Wasserraum betreten",
      roomReturn: "Wasserraum erneut betreten",
      symbolNetworkReturn: "Zum Symbolnetz zurueckkehren",
    },
    codexGates: {
      meaningFields: [
        { id: "tiefe", meaningNodeId: "depth", label: "Tiefe", href: "/codex/tiefe" },
        { id: "uebergang", meaningNodeId: "transition", label: "Uebergang" },
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
      defaultContextLabel: "Teil des Wasserpfades",
      contextLabels: {
        "genesis-1-2": "Wasser vor der Ordnung",
        "exodus-14": "Wasser als Schwelle",
      },
      returnLabel: "Zurueck zum Wasser-Codex",
      roomLabel: "Den Wasserraum betreten",
      roomTraceLabel: "Diese Spur im Wasserraum bewegen",
      personalPathLabel: "Meinen Pfad ansehen",
    },
    movement: ["Symbolnetz", "Codex", "Raum", "persoenliche Spur", "Mein Pfad"],
  },
  licht: {
    symbolId: "licht",
    label: "Licht",
    hebrew: "\u05d0\u05d5\u05e8",
    codexHref: "/codex/licht",
    roomHref: "/raeume/licht",
    symbolNetworkHref: "/symbolnetz?symbol=licht",
    returnToSymbolNetworkHref: "/symbolnetz?symbol=licht",
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
      roomReturn: "Lichtraum erneut betreten",
      symbolNetworkReturn: "Zum Symbolnetz zurueckkehren",
    },
    codexGates: {
      meaningFields: [
        { id: "offenbarung", meaningNodeId: "revelation", label: "Offenbarung", href: "/codex/offenbarung" },
        { id: "ordnung", meaningNodeId: "guidance", label: "Ordnung", href: "/codex/ordnung" },
        { id: "erkenntnis", meaningNodeId: "awareness", label: "Erkenntnis", href: "/codex/erkenntnis" },
        { id: "glanz", meaningNodeId: "light", label: "Glanz", href: "/codex/glanz" },
        { id: "auge", meaningNodeId: "awareness", label: "Auge", href: "/codex/auge" },
        { id: "himmel", meaningNodeId: "guidance", label: "Himmel", href: "/codex/himmel" },
      ],
      scriptureAnchors: [
        { id: "genesis-1-3", reference: "Genesis 1,3", label: "Genesis 1,3", href: "/codex/genesis-1-3" },
      ],
    },
    codexAnchorBridge: undefined,
    movement: ["Finsternis", "Ruf", "Licht", "Scheidung", "Ordnung", "Erkenntnis"],
  },
} as const satisfies Record<string, SymbolPathConfig>;

export type ConfiguredSymbolId = keyof typeof symbolPathConfigs;

export function getSymbolPathConfig(symbolId: string | null | undefined) {
  if (!symbolId) return undefined;

  return symbolPathConfigs[symbolId as ConfiguredSymbolId];
}

export function getSymbolPathConfigFromReflectionLike(reflection: {
  symbolSlug?: string;
  sourceId?: string;
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
