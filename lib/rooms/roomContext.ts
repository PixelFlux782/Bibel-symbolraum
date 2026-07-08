import { getCodexEntry } from "@/lib/codex/getCodexEntry";
import { resolveCodexEntry } from "@/lib/codex/resolveCodexEntry";
import { getOntologyEntity } from "@/lib/ontology";
import { getResonanceJourney } from "@/lib/resonance";
import {
  buildSymbolRoomHref,
  getKnownSymbolPathLabel,
  getSymbolPathConfig,
  getSymbolNetworkHref,
  getSymbolTraceFallbackLabel,
} from "@/lib/symbols/symbolPathConfig";
import { getNextJourneyStep, getSymbolJourney, getSymbolJourneyForSymbol } from "@/lib/symbols/symbolJourneys";
import type { PersonalWay, PersonalWayOpening } from "@/lib/personalWay";

export type RoomSearchParams = Promise<Record<string, string | string[] | undefined>>;
export type RoomContextSource = "codex" | "symbolnetz" | "pattern" | "journey" | "mein-pfad";
export type RoomContext = {
  source: RoomContextSource;
  symbolId: string;
  symbolLabel: string;
  pathId?: string;
  pathLabel?: string;
  title: string;
  text: string;
  mobileTitle: string;
  mobileText: string;
  returnHref: string;
  returnLabel: string;
};

export type RoomWaymarkState = "visited-room" | "familiar-symbol" | "journey-arrival" | "next-opening";
export type RoomWaymark = {
  state: RoomWaymarkState;
  text: string;
};

const roomLabels: Record<string, string> = {
  wasser: "Wasser",
  licht: "Licht",
  feuer: "Feuer",
  wueste: "Wüste",
  brot: "Brot",
};

const existingRoomIds = new Set(Object.keys(roomLabels));

const patternRoomStations: Record<string, { roomId: string; title: string; text: string }> = {
  "pattern-gabe-im-mangel": {
    roomId: "wueste",
    title: "In die Wüste eintreten",
    text: "Der Mangel wird hier nicht erklärt, sondern als Raum spürbar.",
  },
  "pattern-pruefung-durch-entzug": {
    roomId: "wueste",
    title: "Wüstenraum betreten",
    text: "Der Entzug wird hier als Stille, Mangel und Prüfung erfahrbar.",
  },
  "pattern-schwelle-durch-wasser": {
    roomId: "wasser",
    title: "Wasser-Raum betreten",
    text: "Die Schwelle wird hier als Tiefe und Durchgang erfahrbar.",
  },
  "pattern-offenbarung-im-feuer": {
    roomId: "feuer",
    title: "Feuer-Raum betreten",
    text: "Das Brennen wird hier zur Spur der Offenbarung.",
  },
  "pattern-weg-der-reifung": {
    roomId: "wueste",
    title: "Wüstenraum betreten",
    text: "Der Weg wird hier als Prüfung und Reifung spürbar.",
  },
};

function getSingleSearchParam(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string" || !value) {
    return undefined;
  }

  return value.split(/[?#]/, 1)[0] || undefined;
}

function getTitle(id: string | undefined) {
  if (!id) return undefined;
  return getCodexEntry(id)?.title ?? resolveCodexEntry(id)?.title ?? getOntologyEntity(id)?.title;
}

function getRoomLabel(symbolId: string) {
  return getSymbolPathConfig(symbolId)?.label ?? roomLabels[symbolId] ?? getTitle(symbolId) ?? symbolId;
}

function getPathContextLabel(symbolId: string, pathId: string | undefined) {
  if (!pathId) return undefined;

  const bridge = getSymbolPathConfig(symbolId);
  const scriptureAnchor = bridge?.codexGates?.scriptureAnchors?.find((anchor) => anchor.id === pathId);
  const meaningField = bridge?.codexGates?.meaningFields?.find((field) => field.id === pathId);

  return getKnownSymbolPathLabel(pathId) ?? scriptureAnchor?.label ?? meaningField?.label ?? getTitle(pathId) ?? getSymbolTraceFallbackLabel(symbolId);
}

function getPathTraceText(pathLabel: string | undefined) {
  return pathLabel ? `Deine Spur aus: ${pathLabel}` : undefined;
}

function getPersonalTracePhrase(symbolId: string) {
  if (symbolId === "wasser") return "bewahrten Spur";
  if (symbolId === "licht") return "bewahrten Lichtspur";

  const traceLabel = getSymbolPathConfig(symbolId)?.traceLabel;

  return traceLabel ? `bewahrten ${traceLabel}` : "bewahrten Spur";
}

function getOpeningHrefSymbol(opening: PersonalWayOpening) {
  const normalizedHref = opening.href.split(/[?#]/, 1)[0];
  const match = normalizedHref.match(/^\/raeume\/([^/]+)$/);

  return match?.[1];
}

function getNaturalNextOpening(personalWay: PersonalWay, symbolId: string) {
  const journey = getSymbolJourneyForSymbol(symbolId);
  const nextStep = getNextJourneyStep(journey?.id, symbolId);

  if (!nextStep) {
    return undefined;
  }

  return personalWay.nextOpenings.find((opening) => getOpeningHrefSymbol(opening) === nextStep.symbol);
}

export function deriveRoomWaymark({
  personalWay,
  roomContext,
  symbolId,
}: {
  personalWay: PersonalWay;
  roomContext?: RoomContext;
  symbolId: string;
}): RoomWaymark | null {
  if (roomContext?.source === "journey") {
    if (symbolId === "licht") {
      return {
        state: "journey-arrival",
        text: "Du kommst aus der Tiefe. Von hier hebt sich Licht.",
      };
    }

    return {
      state: "journey-arrival",
      text: "Du kommst aus einer Spur. Von hier öffnet sich der Raum.",
    };
  }

  if (personalWay.familiarSymbols.includes(symbolId)) {
    return {
      state: "familiar-symbol",
      text: "Dieses Zeichen kehrt in deiner Spur wieder.",
    };
  }

  const naturalNextOpening = getNaturalNextOpening(personalWay, symbolId);

  if (naturalNextOpening) {
    return {
      state: "next-opening",
      text: "Von hier führt der Weg weiter.",
    };
  }

  if (personalWay.visitedRooms.includes(symbolId)) {
    return {
      state: "visited-room",
      text: "Dieser Raum ist dir nicht mehr fremd.",
    };
  }

  return null;
}

export function hasSymbolRoom(symbolId: string | null | undefined): symbolId is string {
  return Boolean(symbolId && existingRoomIds.has(symbolId));
}

export function buildRoomHref(symbolId: string, context?: { from?: string; path?: string; symbol?: string }) {
  const params = new URLSearchParams();
  const safeSymbolId = hasSymbolRoom(symbolId) ? symbolId : undefined;
  const from = context?.from;
  const path = context?.path;
  const symbol = context?.symbol;

  if (!safeSymbolId) {
    return "/symbolnetz";
  }

  if (from && (from === "symbolnetz" || from === "codex" || from === "mein-pfad" || from === "journey" || getTitle(from))) {
    params.set("from", from);
  }

  if (path && (getKnownSymbolPathLabel(path) || getSymbolJourney(path) || getTitle(path))) {
    params.set("path", path);
  }

  if (symbol && hasSymbolRoom(symbol)) {
    params.set("symbol", symbol);
  }

  return buildSymbolRoomHref(safeSymbolId, {
    from: params.get("from") ?? undefined,
    path: params.get("path") ?? undefined,
    symbol: params.get("symbol") ?? undefined,
  });
}

export function getPatternRoomStation(patternId: string) {
  const station = patternRoomStations[patternId];

  return station && hasSymbolRoom(station.roomId) ? station : undefined;
}

export function resolveRoomContext(
  searchParams: Awaited<RoomSearchParams>,
  fallbackSymbolId: string,
): RoomContext | undefined {
  const from = getSingleSearchParam(searchParams.from);
  const path = getSingleSearchParam(searchParams.path);
  const symbol = getSingleSearchParam(searchParams.symbol) ?? fallbackSymbolId;
  const symbolId = hasSymbolRoom(symbol) ? symbol : fallbackSymbolId;
  const symbolLabel = getRoomLabel(symbolId);
  const roomTitle = `${symbolLabel}-Raum`;
  const pathTitle = getPathContextLabel(symbolId, path);
  const pathDisplayLabel = pathTitle ?? (path ? "einer bewahrten Spur" : undefined);
  const pathTraceText = getPathTraceText(pathDisplayLabel);

  if (from === "symbolnetz") {
    const returnParams = new URLSearchParams({ symbol: symbolId });

    return {
      source: "symbolnetz",
      symbolId,
      symbolLabel,
      pathId: path,
      pathLabel: pathDisplayLabel,
      title: "Eintritt",
      text: pathTraceText
        ? `Aus dem Symbolnetz kommend. ${pathTraceText}. Die Karte wird zum Raum.`
        : `Aus dem Symbolnetz kommend: Die Karte wird zum Raum.`,
      mobileTitle: `Symbolnetz -> ${roomTitle}`,
      mobileText: pathTraceText ?? "Die Karte wird zum Raum.",
      returnHref: returnParams.toString() ? `/symbolnetz?${returnParams.toString()}` : getSymbolNetworkHref(symbolId),
      returnLabel: getSymbolPathConfig(symbolId)?.ctaLabels.symbolNetworkReturn ?? "Zum Symbolnetz zurückkehren",
    };
  }

  if (from === "codex") {
    return {
      source: "codex",
      symbolId,
      symbolLabel,
      pathId: path,
      pathLabel: pathDisplayLabel,
      title: "Eintritt",
      text: pathTraceText
        ? `Aus dem Codex kommend. ${pathTraceText}. ${symbolLabel} wird nun nicht nur gelesen, sondern betreten.`
        : `Aus dem Codex kommend: ${symbolLabel} wird nun nicht nur gelesen, sondern betreten.`,
      mobileTitle: `Codex -> ${roomTitle}`,
      mobileText: pathTraceText ?? `${symbolLabel} wird nun nicht nur gelesen, sondern betreten.`,
      returnHref: getSymbolPathConfig(symbolId)?.codexHref ?? `/codex/${symbolId}`,
      returnLabel: `Zurück zu ${symbolLabel} im Codex`,
    };
  }

  if (from === "mein-pfad") {
    const bridge = getSymbolPathConfig(symbolId);
    const roomLabel = bridge?.roomLabel ?? roomTitle;
    const tracePhrase = getPersonalTracePhrase(symbolId);
    const personalPathMobileText = symbolId === "wasser"
      ? "Der Wasserraum öffnet sich erneut von deinem Pfad her."
      : symbolId === "licht" && pathTraceText
        ? pathTraceText
        : symbolId === "licht"
          ? "Der Lichtraum öffnet sich erneut von deinem Pfad her."
          : "Der Raum öffnet sich erneut von deinem Pfad her.";
    const personalPathText = pathTraceText
      ? `Du kommst aus deiner ${tracePhrase}. ${pathTraceText}. Der ${roomLabel} öffnet sich erneut von deinem Pfad her.`
      : `Du kommst aus deiner ${tracePhrase}. Der ${roomLabel} öffnet sich erneut von deinem Pfad her.`;

    return {
      source: "mein-pfad",
      symbolId,
      symbolLabel,
      pathId: path,
      pathLabel: pathDisplayLabel,
      title: "Rückkehr",
      text: personalPathText,
      mobileTitle: `Mein Pfad -> ${roomTitle}`,
      mobileText: personalPathMobileText,
      returnHref: "/mein-pfad",
      returnLabel: "Zurück zu Mein Pfad",
    };
  }

  if (from === "journey") {
    const journey = getSymbolJourney(path) ?? getSymbolJourneyForSymbol(symbolId);
    const journeyTitle = journey?.title ?? "Vom Wasser zum Brot";
    const journeyTraceText = `Aus der Spur: ${journeyTitle}`;
    const pathText = pathTraceText && path !== journey?.id ? `${pathTraceText}. ` : "";

    return {
      source: "journey",
      symbolId,
      symbolLabel,
      pathId: path,
      pathLabel: pathDisplayLabel,
      title: "Eintritt",
      text: `${pathText}${journeyTraceText}.`,
      mobileTitle: `Spur -> ${roomTitle}`,
      mobileText: pathTraceText && path !== journey?.id ? `${pathTraceText}. ${journeyTraceText}.` : journeyTraceText,
      returnHref: "/mein-pfad",
      returnLabel: "Zurück zu Mein Pfad",
    };
  }

  const fromEntity = from ? getOntologyEntity(from) : undefined;
  const fromTitle = getTitle(from);

  if (path && pathTitle) {
    const journey = getResonanceJourney(path);
    const movement = journey?.nodePath.map(getRoomLabel).join(" -> ") ?? pathTitle;

    return {
      source: "journey",
      symbolId,
      symbolLabel,
      pathId: path,
      pathLabel: pathDisplayLabel,
      title: "Eintritt",
      text: pathTraceText ? `${pathTraceText}. Du betrittst einen Raum dieser Spur.` : `${movement}. Du betrittst einen Raum dieser Spur.`,
      mobileTitle: `${movement} -> ${roomTitle}`,
      mobileText: pathTraceText ?? "Du betrittst einen Raum dieser Spur.",
      returnHref: `/codex/${path}`,
      returnLabel: `Zurück zur Spur ${pathTitle}`,
    };
  }

  if (from && fromEntity?.domain === "pattern" && fromTitle) {
    return {
      source: "pattern",
      symbolId,
      symbolLabel,
      title: "Eintritt",
      text: `${fromTitle} -> ${symbolLabel}. Diese Bewegung wird hier als Raum erfahrbar.`,
      mobileTitle: `${fromTitle} -> ${roomTitle}`,
      mobileText: "Diese Bewegung wird hier als Raum erfahrbar.",
      returnHref: `/codex/${from}`,
      returnLabel: `Zurück zur Bewegung ${fromTitle}`,
    };
  }

  return undefined;
}
