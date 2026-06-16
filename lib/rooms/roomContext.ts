import { getCodexEntry } from "@/lib/codex/getCodexEntry";
import { resolveCodexEntry } from "@/lib/codex/resolveCodexEntry";
import { getOntologyEntity } from "@/lib/ontology";
import { getResonanceJourney } from "@/lib/resonance";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";

export type RoomSearchParams = Promise<Record<string, string | string[] | undefined>>;
export type RoomContextSource = "codex" | "symbolnetz" | "pattern" | "journey" | "mein-pfad";
export type RoomContext = {
  source: RoomContextSource;
  symbolId: string;
  symbolLabel: string;
  pathId?: string;
  title: string;
  text: string;
  mobileTitle: string;
  mobileText: string;
  returnHref: string;
  returnLabel: string;
};

const roomLabels: Record<string, string> = {
  wasser: "Wasser",
  licht: "Licht",
  feuer: "Feuer",
  wueste: "Wueste",
  brot: "Brot",
};

const existingRoomIds = new Set(Object.keys(roomLabels));

const patternRoomStations: Record<string, { roomId: string; title: string; text: string }> = {
  "pattern-gabe-im-mangel": {
    roomId: "wueste",
    title: "In die Wueste eintreten",
    text: "Der Mangel wird hier nicht erklaert, sondern als Raum spuerbar.",
  },
  "pattern-pruefung-durch-entzug": {
    roomId: "wueste",
    title: "Wuesten-Raum betreten",
    text: "Der Entzug wird hier als Stille, Mangel und Pruefung erfahrbar.",
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
    title: "Wuesten-Raum betreten",
    text: "Der Weg wird hier als Pruefung und Reifung spuerbar.",
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

  return scriptureAnchor?.label ?? meaningField?.label ?? getTitle(pathId);
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

  if (from && (from === "symbolnetz" || from === "codex" || from === "mein-pfad" || getTitle(from))) {
    params.set("from", from);
  }

  if (path && getTitle(path)) {
    params.set("path", path);
  }

  if (symbol && hasSymbolRoom(symbol)) {
    params.set("symbol", symbol);
  }

  const query = params.toString();
  const roomHref = getSymbolPathConfig(safeSymbolId)?.roomHref ?? `/raeume/${safeSymbolId}`;

  return query ? `${roomHref}?${query}` : roomHref;
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
  const lens = getSingleSearchParam(searchParams.lens);
  const symbol = getSingleSearchParam(searchParams.symbol) ?? fallbackSymbolId;
  const symbolId = hasSymbolRoom(symbol) ? symbol : fallbackSymbolId;
  const symbolLabel = getRoomLabel(symbolId);
  const roomTitle = `${symbolLabel}-Raum`;
  const pathTitle = getPathContextLabel(symbolId, path);

  if (from === "symbolnetz") {
    const returnParams = new URLSearchParams({ symbol: symbolId });

    if (lens) returnParams.set("lens", lens);
    if (path) returnParams.set("path", path);

    return {
      source: "symbolnetz",
      symbolId,
      symbolLabel,
      pathId: path,
      title: "Eintritt",
      text: `Aus dem Symbolnetz kommend: Die Karte wird zum Raum.`,
      mobileTitle: `Symbolnetz -> ${roomTitle}`,
      mobileText: "Die Karte wird zum Raum.",
      returnHref: `/symbolnetz?${returnParams.toString()}`,
      returnLabel: getSymbolPathConfig(symbolId)?.ctaLabels.symbolNetworkReturn ?? "Zum Symbolnetz zurueckkehren",
    };
  }

  if (from === "codex") {
    return {
      source: "codex",
      symbolId,
      symbolLabel,
      pathId: path,
      title: "Eintritt",
      text: `Aus dem Codex kommend: ${symbolLabel} wird nun nicht nur gelesen, sondern betreten.`,
      mobileTitle: `Codex -> ${roomTitle}`,
      mobileText: `${symbolLabel} wird nun nicht nur gelesen, sondern betreten.`,
      returnHref: getSymbolPathConfig(symbolId)?.codexHref ?? `/codex/${symbolId}`,
      returnLabel: `Zurueck zu ${symbolLabel} im Codex`,
    };
  }

  if (from === "mein-pfad") {
    const personalPathMobileText = symbolId === "wasser"
      ? "Der Wasserraum oeffnet sich erneut von deinem Pfad her."
      : symbolId === "licht" && pathTitle
        ? `Deine Spur aus: ${pathTitle}`
        : symbolId === "licht"
          ? "Der Lichtraum oeffnet sich erneut von deinem Pfad her."
          : "Der Raum oeffnet sich erneut von deinem Pfad her.";
    const personalPathText = symbolId === "licht"
      ? "Du kommst aus deiner bewahrten Lichtspur. Der Lichtraum oeffnet sich erneut von deinem Pfad her."
      : "Du kommst aus deiner bewahrten Spur. Der Raum oeffnet sich erneut von deinem Pfad her.";

    return {
      source: "mein-pfad",
      symbolId,
      symbolLabel,
      pathId: path,
      title: "Rueckkehr",
      text: personalPathText,
      mobileTitle: `Mein Pfad -> ${roomTitle}`,
      mobileText: personalPathMobileText,
      returnHref: "/mein-pfad",
      returnLabel: "Zurueck zu Mein Pfad",
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
      title: "Eintritt",
      text: `${movement}. Du betrittst eine Station dieses Weges.`,
      mobileTitle: `${movement} -> ${roomTitle}`,
      mobileText: "Du betrittst eine Station dieses Weges.",
      returnHref: `/codex/${path}`,
      returnLabel: `Zurueck zum Weg ${pathTitle}`,
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
      returnLabel: `Zurueck zur Bewegung ${fromTitle}`,
    };
  }

  return undefined;
}
