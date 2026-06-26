import {
  buildSymbolRoomHref,
  getCodexHref,
  getSymbolPathConfig,
  type ConfiguredSymbolId,
} from "@/lib/symbols/symbolPathConfig";
import { roomTransitions } from "@/lib/symbols/roomTransitions";

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

export type SymbolicGreatMovementStep = {
  symbol: ConfiguredSymbolId;
  label: string;
  text: string;
  href: string;
  targetSymbol?: ConfiguredSymbolId;
  targetLabel?: string;
  transitionTitle?: string;
  isNear?: boolean;
};

const WATER_TO_BREAD_JOURNEY_ID = "journey-wasser-zum-brot";
export const SYMBOL_JOURNEY_OVERVIEW_HREF = "/mein-pfad";

export const SYMBOLIC_GREAT_MOVEMENT: SymbolicGreatMovementStep[] = [
  ...roomTransitions.map((transition) => {
    const sourceConfig = getSymbolPathConfig(transition.sourceRoom);
    const targetConfig = getSymbolPathConfig(transition.targetRoom);

    return {
      symbol: transition.sourceRoom,
      label: sourceConfig?.label ?? transition.sourceRoom,
      targetSymbol: transition.targetRoom,
      targetLabel: targetConfig?.label ?? transition.targetRoom,
      transitionTitle: transition.title,
      text: transition.shortMeaning,
      href: sourceConfig?.roomHref ?? `/raeume/${transition.sourceRoom}`,
    };
  }),
];

export function getGreatMovement(touchedSymbols?: ReadonlySet<string>): SymbolicGreatMovementStep[] {
  return SYMBOLIC_GREAT_MOVEMENT.map((step) => ({
    ...step,
    isNear: touchedSymbols?.has(step.symbol) || undefined,
  }));
}

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
    subtitle: "Ein Weg von Ursprung, Licht und Prüfung zur Gabe",
    summary:
      "Die Spur führt von der Tiefe des Wassers über Licht, Feuer und Wüste bis zum Brot als empfangene Gabe.",
    steps: [
      buildJourneyStep({
        symbol: "wasser",
        text: "Die Spur beginnt in der Tiefe: Wasser als Ursprung, Bewegung und geöffneter Raum.",
      }),
      buildJourneyStep({
        symbol: "licht",
        path: "genesis-1-3",
        text: "Im Licht wird sichtbar, was vorher verborgen war: Scheidung, Ordnung und Erkenntnis.",
      }),
      buildJourneyStep({
        symbol: "feuer",
        path: "dornbusch",
        text: "Im Feuer wird der Ruf hörbar: Gegenwart, Wandlung und heilige Grenze.",
      }),
      buildJourneyStep({
        symbol: "wueste",
        path: "manna",
        text: "In der Wüste wird der Mangel zum Ort des Hörens und der Reifung.",
      }),
      buildJourneyStep({
        symbol: "brot",
        path: "lechem",
        text: "Im Brot wird das Unsichtbare empfangbar: Gabe, Nahrung und Wort.",
      }),
    ],
  },
];

export function getSymbolJourney(id: string | null | undefined): SymbolJourney | undefined {
  if (!id) return undefined;

  return symbolJourneys.find((journey) => journey.id === id);
}

export function getSymbolJourneyForSymbol(symbolId: string | null | undefined): SymbolJourney | undefined {
  if (!symbolId) return undefined;

  return symbolJourneys.find((journey) => journey.steps.some((step) => step.symbol === symbolId));
}

export function getJourneysForSymbol(symbolId: string | null | undefined): SymbolJourney[] {
  if (!symbolId) return [];

  return symbolJourneys.filter((journey) => journey.steps.some((step) => step.symbol === symbolId));
}

export function getJourneyStepForSymbol(
  journeyId: string | null | undefined,
  symbolId: string | null | undefined,
): SymbolJourneyStep | undefined {
  if (!journeyId || !symbolId) return undefined;

  return getSymbolJourney(journeyId)?.steps.find((step) => step.symbol === symbolId);
}

export function getPreviousJourneyStep(
  journeyId: string | null | undefined,
  symbolId: string | null | undefined,
): SymbolJourneyStep | undefined {
  if (!journeyId || !symbolId) return undefined;

  const steps = getSymbolJourney(journeyId)?.steps ?? [];
  const stepIndex = steps.findIndex((step) => step.symbol === symbolId);

  return stepIndex > 0 ? steps[stepIndex - 1] : undefined;
}

export function getNextJourneyStep(
  journeyId: string | null | undefined,
  symbolId: string | null | undefined,
): SymbolJourneyStep | undefined {
  if (!journeyId || !symbolId) return undefined;

  const steps = getSymbolJourney(journeyId)?.steps ?? [];
  const stepIndex = steps.findIndex((step) => step.symbol === symbolId);

  return stepIndex >= 0 && stepIndex < steps.length - 1 ? steps[stepIndex + 1] : undefined;
}
