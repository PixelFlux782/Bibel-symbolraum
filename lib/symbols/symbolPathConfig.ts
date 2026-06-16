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
    movement: ["Symbolnetz", "Codex", "Raum", "persoenliche Spur", "Mein Pfad"],
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
