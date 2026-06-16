import { resolveCodexEntry } from "@/lib/codex/resolveCodexEntry";
import { getOntologyEntity } from "@/lib/ontology";
import { getResonanceJourney } from "@/lib/resonance";

export type RoomSearchParams = Promise<Record<string, string | string[] | undefined>>;
export type RoomContextSource = "codex" | "symbolnetz" | "pattern" | "journey";
export type RoomContext = {
  source: RoomContextSource;
  symbolId: string;
  symbolLabel: string;
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
  return resolveCodexEntry(id)?.title ?? getOntologyEntity(id)?.title;
}

function getRoomLabel(symbolId: string) {
  return roomLabels[symbolId] ?? getTitle(symbolId) ?? symbolId;
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

  if (from && (from === "symbolnetz" || from === "codex" || getTitle(from))) {
    params.set("from", from);
  }

  if (path && getTitle(path)) {
    params.set("path", path);
  }

  if (symbol && hasSymbolRoom(symbol)) {
    params.set("symbol", symbol);
  }

  const query = params.toString();
  return query ? `/raeume/${safeSymbolId}?${query}` : `/raeume/${safeSymbolId}`;
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

  if (from === "symbolnetz") {
    const returnParams = new URLSearchParams({ symbol: symbolId });

    if (lens) returnParams.set("lens", lens);
    if (path) returnParams.set("path", path);

    return {
      source: "symbolnetz",
      symbolId,
      symbolLabel,
      title: "Eintritt",
      text: `Vom Symbolnetz aus oeffnet sich der ${roomTitle}. Die Landkarte wird zum Erfahrungsraum.`,
      mobileTitle: `Symbolnetz -> ${roomTitle}`,
      mobileText: "Die Landkarte wird hier zum Erfahrungsraum.",
      returnHref: `/symbolnetz?${returnParams.toString()}`,
      returnLabel: "Zurueck ins Symbolnetz",
    };
  }

  if (from === "codex") {
    return {
      source: "codex",
      symbolId,
      symbolLabel,
      title: "Eintritt",
      text: `Aus dem Codex kommst du in den ${roomTitle}. Hier wird ${symbolLabel} nicht erklaert, sondern erfahren.`,
      mobileTitle: `Codex -> ${roomTitle}`,
      mobileText: "Hier wird Bedeutung nicht erklaert, sondern erfahren.",
      returnHref: `/codex/${symbolId}`,
      returnLabel: `Zurueck zum Codex ${symbolLabel}`,
    };
  }

  const pathTitle = getTitle(path);
  const fromEntity = from ? getOntologyEntity(from) : undefined;
  const fromTitle = getTitle(from);

  if (path && pathTitle) {
    const journey = getResonanceJourney(path);
    const movement = journey?.nodePath.map(getRoomLabel).join(" -> ") ?? pathTitle;

    return {
      source: "journey",
      symbolId,
      symbolLabel,
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
