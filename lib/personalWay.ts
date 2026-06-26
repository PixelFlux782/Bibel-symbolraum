import { getCodexEntry } from "@/lib/codex/getCodexEntry";
import { resolveCodexEntry } from "@/lib/codex/resolveCodexEntry";
import {
  PATH_ACTIVITY_STORAGE_KEY,
  parseStoredPathActivity,
  type StoredPathActivity,
} from "@/lib/pathActivity";
import {
  readStoredReflections,
  type StoredReflection,
} from "@/lib/reflections";
import { buildRoomHref, hasSymbolRoom } from "@/lib/rooms/roomContext";
import {
  getCodexHref,
  getKnownSymbolPathLabel,
  getSymbolPathConfig,
  getSymbolPathConfigFromReflectionLike,
  symbolPathConfigs,
  type ConfiguredSymbolId,
  type SymbolPathConfig,
} from "@/lib/symbols/symbolPathConfig";
import {
  getNextJourneyStep,
  getSymbolJourney,
  getSymbolJourneyForSymbol,
  symbolJourneys,
} from "@/lib/symbols/symbolJourneys";

export type PersonalWayOpeningSource = "reflection" | "room" | "journey" | "symbol" | "codex";

export type PersonalWayOpening = {
  id: string;
  label: string;
  href: string;
  reason: string;
  source?: PersonalWayOpeningSource;
};

export type PersonalWay = {
  touchedSymbols: string[];
  visitedRooms: string[];
  reflectedAnchors: string[];
  activeJourneys: string[];
  familiarSymbols: string[];
  nextOpenings: PersonalWayOpening[];
};

export type DerivePersonalWayInput = {
  reflections?: StoredReflection[];
  pathActivity?: StoredPathActivity;
};

type SymbolTouches = Map<string, Set<PersonalWayOpeningSource>>;

const MAX_NEXT_OPENINGS = 4;
const configuredSymbolPaths = Object.values(symbolPathConfigs) as SymbolPathConfig[];

function readExistingPathActivity(): StoredPathActivity {
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : undefined;

    return parseStoredPathActivity(storage?.getItem(PATH_ACTIVITY_STORAGE_KEY) ?? null);
  } catch {
    return parseStoredPathActivity(null);
  }
}

function pushUnique(values: string[], value: string | null | undefined) {
  if (value && !values.includes(value)) {
    values.push(value);
  }
}

function normalizeId(value: string | null | undefined) {
  return value?.split(/[?#]/, 1)[0];
}

function getHrefId(href: string | null | undefined) {
  const normalizedHref = normalizeId(href);
  const match = normalizedHref?.match(/^\/(?:codex|raeume)\/([^/]+)$/);

  return match?.[1];
}

function isConfiguredSymbolId(value: string | null | undefined): value is ConfiguredSymbolId {
  return Boolean(value && getSymbolPathConfig(value));
}

function getReflectionSymbolId(reflection: StoredReflection) {
  return getSymbolPathConfigFromReflectionLike(reflection)?.symbolId;
}

function addTouch(touches: SymbolTouches, symbolId: string | null | undefined, source: PersonalWayOpeningSource) {
  if (!isConfiguredSymbolId(symbolId)) return;

  const symbolTouches = touches.get(symbolId) ?? new Set<PersonalWayOpeningSource>();
  symbolTouches.add(source);
  touches.set(symbolId, symbolTouches);
}

function getReflectionPathId(reflection: StoredReflection) {
  return normalizeId(reflection.pathContext?.path ?? reflection.path);
}

function isAnchorId(anchorId: string | null | undefined) {
  if (!anchorId || getSymbolJourney(anchorId)) return false;
  if (getKnownSymbolPathLabel(anchorId) || getCodexEntry(anchorId) || resolveCodexEntry(anchorId)) return true;

  return configuredSymbolPaths.some((config) => (
    config.codexGates?.meaningFields?.some((field) => field.id === anchorId) ||
    config.codexGates?.scriptureAnchors?.some((anchor) => anchor.id === anchorId) ||
    config.codexAnchorBridge?.anchorIds.includes(anchorId)
  ));
}

function getReflectionAnchorIds(reflection: StoredReflection) {
  const anchors: string[] = [];
  const pathId = getReflectionPathId(reflection);
  const codexId = getHrefId(reflection.codexHref);

  if (isAnchorId(pathId)) {
    pushUnique(anchors, pathId);
  }

  if (isAnchorId(reflection.sourceId)) {
    pushUnique(anchors, reflection.sourceId);
  }

  if (isAnchorId(codexId)) {
    pushUnique(anchors, codexId);
  }

  return anchors;
}

function getJourneyIdsFromReflection(reflection: StoredReflection) {
  const journeyIds: string[] = [];
  const pathId = getReflectionPathId(reflection);
  const sourceId = reflection.sourceId;
  const symbolId = getReflectionSymbolId(reflection);

  pushUnique(journeyIds, getSymbolJourney(pathId)?.id);
  pushUnique(journeyIds, getSymbolJourney(sourceId)?.id);

  if (reflection.source === "journey" || reflection.sourceType === "journey" || reflection.from === "journey") {
    pushUnique(journeyIds, getSymbolJourneyForSymbol(symbolId)?.id);
  }

  return journeyIds;
}

function getJourneyStepIndex(journeyId: string, symbolId: string) {
  return getSymbolJourney(journeyId)?.steps.findIndex((step) => step.symbol === symbolId) ?? -1;
}

function getMostRecentTouchedJourneySymbol(journeyId: string, touchedSymbols: string[]) {
  return touchedSymbols
    .map((symbolId) => ({ symbolId, stepIndex: getJourneyStepIndex(journeyId, symbolId) }))
    .filter((item) => item.stepIndex >= 0)
    .sort((a, b) => b.stepIndex - a.stepIndex)[0]?.symbolId;
}

function getSymbolForAnchor(anchorId: string) {
  return configuredSymbolPaths.find((config) => (
    config.symbolId === anchorId ||
    config.codexGates?.meaningFields?.some((field) => field.id === anchorId) ||
    config.codexGates?.scriptureAnchors?.some((anchor) => anchor.id === anchorId) ||
    config.codexAnchorBridge?.anchorIds.includes(anchorId)
  ))?.symbolId;
}

function getOpeningKey(opening: PersonalWayOpening) {
  return opening.href;
}

function pushOpening(openings: PersonalWayOpening[], opening: PersonalWayOpening | undefined) {
  if (!opening || openings.some((candidate) => getOpeningKey(candidate) === getOpeningKey(opening))) {
    return;
  }

  openings.push(opening);
}

function buildJourneyOpenings(personalWay: Omit<PersonalWay, "nextOpenings">) {
  const openings: PersonalWayOpening[] = [];
  const journeyIds = personalWay.activeJourneys.length
    ? personalWay.activeJourneys
    : symbolJourneys
      .filter((journey) => journey.steps.some((step) => personalWay.touchedSymbols.includes(step.symbol)))
      .map((journey) => journey.id);

  for (const journeyId of journeyIds) {
    const currentSymbol = getMostRecentTouchedJourneySymbol(journeyId, personalWay.touchedSymbols);
    const nextStep = getNextJourneyStep(journeyId, currentSymbol);

    if (!nextStep || personalWay.touchedSymbols.includes(nextStep.symbol)) {
      continue;
    }

    const currentConfig = getSymbolPathConfig(currentSymbol);

    pushOpening(openings, {
      id: `journey-${journeyId}-${nextStep.symbol}`,
      label: `${nextStep.label} betreten`,
      href: nextStep.roomHref,
      reason: currentConfig
        ? `Nach ${currentConfig.label} öffnet sich von hier ${nextStep.label}.`
        : `${nextStep.label} öffnet sich von hier.`,
      source: "journey",
    });
  }

  return openings;
}

function buildReturnOpenings(personalWay: Omit<PersonalWay, "nextOpenings">) {
  const openings: PersonalWayOpening[] = [];

  for (const anchorId of personalWay.reflectedAnchors) {
    const symbolId = getSymbolForAnchor(anchorId);
    const config = getSymbolPathConfig(symbolId);

    if (!config || personalWay.visitedRooms.includes(config.symbolId) || !hasSymbolRoom(config.symbolId)) {
      continue;
    }

    pushOpening(openings, {
      id: `anchor-room-${anchorId}`,
      label: config.ctaLabels.room,
      href: buildRoomHref(config.symbolId, {
        from: "codex",
        path: anchorId,
        symbol: config.symbolId,
      }),
      reason: `Diese Codex-Spur führt weiter; der ${config.roomLabel} nimmt deine Spur auf.`,
      source: "codex",
    });
  }

  for (const symbolId of personalWay.visitedRooms) {
    const config = getSymbolPathConfig(symbolId);

    if (!config) {
      continue;
    }

    pushOpening(openings, {
      id: `room-codex-${symbolId}`,
      label: `${config.label} im Codex lesen`,
      href: getCodexHref(symbolId),
      reason: `Der ${config.roomLabel} liegt hinter dir; im Codex kehrt die Spur wieder.`,
      source: "room",
    });
  }

  return openings;
}

function deriveFamiliarSymbols(touches: SymbolTouches, reflections: StoredReflection[], visitedRooms: string[]) {
  return Array.from(touches.entries())
    .filter(([symbolId, sources]) => {
      const reflectionCount = reflections.filter((reflection) => getReflectionSymbolId(reflection) === symbolId).length;

      return sources.size > 1 || reflectionCount > 1 || (reflectionCount > 0 && visitedRooms.includes(symbolId));
    })
    .map(([symbolId]) => symbolId);
}

function deriveNextOpenings(personalWay: Omit<PersonalWay, "nextOpenings">) {
  const openings: PersonalWayOpening[] = [];

  for (const opening of buildJourneyOpenings(personalWay)) {
    pushOpening(openings, opening);
  }

  for (const opening of buildReturnOpenings(personalWay)) {
    pushOpening(openings, opening);
  }

  return openings.slice(0, MAX_NEXT_OPENINGS);
}

export function derivePersonalWay(input: DerivePersonalWayInput = {}): PersonalWay {
  const reflections = input.reflections ?? readStoredReflections();
  const pathActivity = input.pathActivity ?? readExistingPathActivity();
  const touches: SymbolTouches = new Map();
  const touchedSymbols: string[] = [];
  const visitedRooms: string[] = [];
  const reflectedAnchors: string[] = [];
  const activeJourneys: string[] = [];

  for (const reflection of reflections) {
    const symbolId = getReflectionSymbolId(reflection);

    addTouch(touches, symbolId, "reflection");
    pushUnique(touchedSymbols, symbolId);

    for (const anchorId of getReflectionAnchorIds(reflection)) {
      pushUnique(reflectedAnchors, anchorId);
    }

    for (const journeyId of getJourneyIdsFromReflection(reflection)) {
      pushUnique(activeJourneys, journeyId);
    }

    const roomId = getHrefId(reflection.roomHref) ?? reflection.room;

    if (isConfiguredSymbolId(roomId)) {
      addTouch(touches, roomId, "room");
      pushUnique(visitedRooms, roomId);
      pushUnique(touchedSymbols, roomId);
    }
  }

  for (const visit of pathActivity.roomVisits) {
    addTouch(touches, visit.symbolId, "room");
    pushUnique(visitedRooms, visit.symbolId);
    pushUnique(touchedSymbols, visit.symbolId);
  }

  for (const journeyStart of pathActivity.journeyStarts) {
    pushUnique(activeJourneys, journeyStart.journeyId);
  }

  for (const activation of pathActivity.activatedLetters) {
    addTouch(touches, activation.symbolId, "symbol");
    pushUnique(touchedSymbols, activation.symbolId);

    if (isAnchorId(activation.pathId)) {
      pushUnique(reflectedAnchors, activation.pathId);
    }
  }

  const familiarSymbols = deriveFamiliarSymbols(touches, reflections, visitedRooms);
  const wayWithoutOpenings = {
    touchedSymbols,
    visitedRooms,
    reflectedAnchors,
    activeJourneys,
    familiarSymbols,
  };

  return {
    ...wayWithoutOpenings,
    nextOpenings: deriveNextOpenings(wayWithoutOpenings),
  };
}
