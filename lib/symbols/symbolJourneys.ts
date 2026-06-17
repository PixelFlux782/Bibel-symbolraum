import {
  buildSymbolRoomHref,
  getCodexHref,
  getSymbolPathConfig,
  type ConfiguredSymbolId,
} from "@/lib/symbols/symbolPathConfig";

export type SymbolJourneyStep = {
  symbol: ConfiguredSymbolId;
  label: string;
  path?: string;
  roomHref: string;
  codexHref: string;
  text: string;
};

export type SymbolJourney = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  steps: SymbolJourneyStep[];
};

const WATER_TO_BREAD_JOURNEY_ID = "journey-wasser-zum-brot";

function buildJourneyStep({
  symbol,
  path,
  text,
}: {
  symbol: ConfiguredSymbolId;
  path?: string;
  text: string;
}): SymbolJourneyStep {
  const config = getSymbolPathConfig(symbol);

  return {
    symbol,
    label: config?.label ?? symbol,
    path,
    roomHref: buildSymbolRoomHref(symbol, {
      from: "journey",
      path: path ?? WATER_TO_BREAD_JOURNEY_ID,
      symbol,
    }),
    codexHref: getCodexHref(symbol),
    text,
  };
}

export const symbolJourneys: SymbolJourney[] = [
  {
    id: WATER_TO_BREAD_JOURNEY_ID,
    title: "Vom Wasser zum Brot",
    subtitle: "Ein Weg von Ursprung, Licht und Pruefung zur Gabe",
    summary:
      "Die Spur fuehrt von der Tiefe des Wassers ueber Licht, Feuer und Wueste bis zum Brot als empfangene Gabe.",
    steps: [
      buildJourneyStep({
        symbol: "wasser",
        text: "Die Spur beginnt in der Tiefe: Wasser als Ursprung, Bewegung und geoeffneter Raum.",
      }),
      buildJourneyStep({
        symbol: "licht",
        path: "genesis-1-3",
        text: "Im Licht wird sichtbar, was vorher verborgen war: Scheidung, Ordnung und Erkenntnis.",
      }),
      buildJourneyStep({
        symbol: "feuer",
        path: "dornbusch",
        text: "Im Feuer wird der Ruf hoerbar: Gegenwart, Wandlung und heilige Grenze.",
      }),
      buildJourneyStep({
        symbol: "wueste",
        path: "manna",
        text: "In der Wueste wird der Mangel zum Ort des Hoerens und der Reifung.",
      }),
      buildJourneyStep({
        symbol: "brot",
        path: "lechem",
        text: "Im Brot wird das Unsichtbare empfangbar: Gabe, Nahrung und Wort.",
      }),
    ],
  },
];

export function getSymbolJourney(id: string | null | undefined) {
  if (!id) return undefined;

  return symbolJourneys.find((journey) => journey.id === id);
}

export function getSymbolJourneyForSymbol(symbolId: string | null | undefined) {
  if (!symbolId) return undefined;

  return symbolJourneys.find((journey) => journey.steps.some((step) => step.symbol === symbolId));
}
