import { getCodexEntry } from "@/lib/codex/getCodexEntry";
import { resolveCodexEntry } from "@/lib/codex/resolveCodexEntry";
import { buildRoomHref } from "@/lib/rooms/roomContext";
import { getSymbolJourney } from "@/lib/symbols/symbolJourneys";
import {
  getCodexHref,
  getKnownSymbolPathLabel,
  getSymbolNetworkHref,
  getSymbolPathConfig,
  getSymbolPathConfigFromReflectionLike,
  getSymbolTraceFallbackLabel,
} from "@/lib/symbols/symbolPathConfig";

export const REFLECTION_STORAGE_KEY = "bibel-symbolraum-reflections";
// Shared browser event for trace cards that need to refresh after a local save.
export const STORED_REFLECTIONS_UPDATED_EVENT = "bibel-symbolraum-reflections:updated";

export type StoredReflection = {
  id: string;
  symbol: string;
  symbolSlug?: string;
  room?: string;
  hebrew: string;
  title?: string;
  sourceType?: "symbol" | "room" | "pattern" | "journey" | "core" | "letter";
  sourceId?: string;
  source?: string;
  sourceLabel?: string;
  codexHref?: string;
  question: string;
  answer: string;
  text?: string;
  stateId?: string;
  stateTitle?: string;
  roomHref?: string;
  pathLabel?: string;
  from?: string;
  path?: string;
  pathContext?: {
    from?: string;
    path?: string;
    symbol?: string;
  };
  createdAt: string;
};

export type ReflectionReturnLink = {
  key: "trace" | "codex" | "room" | "symbol-network";
  label: string;
  href: string;
};

type JourneyReflectionStep = {
  symbol: string;
};

export const WATER_REFLECTION_QUESTION =
  "Wo begegnet dir Wasser gerade in deinem Leben?";

export function parseStoredReflections(raw: string | null): StoredReflection[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      return parsed
        .map(normalizeStoredReflection)
        .filter((reflection): reflection is StoredReflection => Boolean(reflection));
    }

    if (parsed && typeof parsed === "object") {
      const legacyWaterText = (parsed as Record<string, unknown>).wasser;
      const waterBridge = getSymbolPathConfig("wasser");

      if (typeof legacyWaterText === "string" && legacyWaterText.trim()) {
        return [
          {
            id: "legacy-wasser",
            symbol: waterBridge?.label ?? "Wasser",
            symbolSlug: waterBridge?.symbolId ?? "wasser",
            hebrew: waterBridge?.hebrew ?? "\u05de\u05d9\u05dd",
            title: waterBridge?.label ?? "Wasser",
            sourceType: waterBridge?.reflectionSource.sourceType ?? "room",
            sourceId: waterBridge?.reflectionSource.sourceId ?? "wasser",
            codexHref: waterBridge?.codexHref ?? "/codex/wasser",
            question: WATER_REFLECTION_QUESTION,
            answer: legacyWaterText,
            roomHref: waterBridge?.roomHref ?? "/raeume/wasser",
            createdAt: new Date().toISOString(),
          },
        ];
      }
    }
  } catch {
    return [];
  }

  return [];
}

export function readStoredReflections(storage?: Storage | null): StoredReflection[] {
  try {
    const source = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);

    return source ? parseStoredReflections(source.getItem(REFLECTION_STORAGE_KEY)) : [];
  } catch {
    return [];
  }
}

function normalizeStoredReflection(value: unknown): StoredReflection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const reflection = value as Record<string, unknown>;
  // Keep old `text`/`reflection` payloads visible while normalizing new traces to `answer`.
  const answer = getFirstString(reflection.answer, reflection.text, reflection.reflection)?.trim() ?? "";
  const room = getFirstString(reflection.room);
  const symbolSlug = getFirstString(reflection.symbolSlug, reflection.symbolId);
  const sourceId = getFirstString(reflection.sourceId);
  const codexHref = getHrefString(reflection.codexHref);
  const roomHref = getHrefString(reflection.roomHref);
  const symbol = typeof reflection.symbol === "string" && reflection.symbol.trim()
    ? reflection.symbol.trim()
    : typeof reflection.title === "string" && reflection.title.trim()
      ? reflection.title.trim()
      : symbolSlug
        ? symbolSlug
        : room
          ? room
          : "";

  if (!answer || !symbol) {
    return null;
  }

  const question = typeof reflection.question === "string" && reflection.question.trim()
    ? reflection.question.trim()
    : "Welche Spur blieb dir hier?";
  const createdAt = typeof reflection.createdAt === "string" && !Number.isNaN(new Date(reflection.createdAt).getTime())
    ? reflection.createdAt
    : new Date().toISOString();
  const sourceType = normalizeSourceType(reflection.sourceType);
  const bridge = getSymbolPathConfigFromReflectionLike({
    symbol,
    title: typeof reflection.title === "string" ? reflection.title : undefined,
    symbolSlug,
    sourceId,
    room,
    codexHref,
    roomHref,
  });
  const pathContext = normalizeReflectionPathContext(reflection);
  const path = getFirstString(reflection.path, pathContext?.path);
  const pathLabel = getReflectionPathLabel({
    explicitLabel: getFirstString(reflection.pathLabel),
    pathId: path,
    symbolId: bridge?.symbolId ?? symbolSlug ?? room,
  });

  return {
    id: typeof reflection.id === "string" && reflection.id.trim()
      ? reflection.id
      : `legacy-${symbol.toLocaleLowerCase("de-DE").replace(/\s+/g, "-")}-${createdAt}`,
    symbol,
    symbolSlug: bridge?.symbolId ?? symbolSlug,
    room,
    hebrew: typeof reflection.hebrew === "string" ? reflection.hebrew : bridge?.hebrew ?? "",
    title: bridge?.label ?? (typeof reflection.title === "string" ? reflection.title : symbol),
    sourceType,
    sourceId,
    source: typeof reflection.source === "string" ? reflection.source : undefined,
    sourceLabel: typeof reflection.sourceLabel === "string" ? reflection.sourceLabel : undefined,
    codexHref: codexHref ?? bridge?.codexHref,
    question,
    answer,
    text: answer,
    stateId: typeof reflection.stateId === "string" ? reflection.stateId : undefined,
    stateTitle: typeof reflection.stateTitle === "string" ? reflection.stateTitle : undefined,
    roomHref: roomHref ?? bridge?.roomHref,
    pathLabel,
    from: typeof reflection.from === "string" ? reflection.from : undefined,
    path,
    pathContext,
    createdAt,
  };
}

function getFirstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && Boolean(value.trim()))?.trim();
}

function getHrefString(value: unknown) {
  const href = getFirstString(value);

  return href?.startsWith("/") ? href : undefined;
}

function normalizeSourceType(value: unknown): StoredReflection["sourceType"] {
  if (
    value === "symbol" ||
    value === "room" ||
    value === "pattern" ||
    value === "journey" ||
    value === "core" ||
    value === "letter"
  ) {
    return value;
  }

  return undefined;
}

function normalizePathContext(value: unknown): StoredReflection["pathContext"] {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const context = value as Record<string, unknown>;
  const pathContext = {
    from: typeof context.from === "string" ? context.from : undefined,
    path: typeof context.path === "string" ? context.path : undefined,
    symbol: typeof context.symbol === "string" ? context.symbol : undefined,
  };

  return Object.values(pathContext).some(Boolean) ? pathContext : undefined;
}

function normalizeReflectionPathContext(reflection: Record<string, unknown>): StoredReflection["pathContext"] {
  const pathContext = normalizePathContext(reflection.pathContext);
  const legacyContext = normalizePathContext({
    from: reflection.from ?? reflection.source,
    path: reflection.path ?? reflection.anchor,
    symbol: reflection.symbolSlug ?? reflection.symbol,
  });

  return pathContext ?? legacyContext;
}

function looksTechnicalLabel(value: string) {
  return /_|->/.test(value) || /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(value);
}

function getCuratedPathLabel(symbolId: string | undefined, pathId: string | undefined) {
  if (!symbolId || !pathId) return undefined;

  const bridge = getSymbolPathConfig(symbolId);
  const scriptureAnchor = bridge?.codexGates?.scriptureAnchors?.find((anchor) => anchor.id === pathId);
  const meaningField = bridge?.codexGates?.meaningFields?.find((field) => field.id === pathId);

  return getKnownSymbolPathLabel(pathId) ?? scriptureAnchor?.label ?? meaningField?.label;
}

function getReflectionPathLabel({
  explicitLabel,
  pathId,
  symbolId,
}: {
  explicitLabel?: string;
  pathId?: string;
  symbolId?: string;
}) {
  if (explicitLabel && !looksTechnicalLabel(explicitLabel)) {
    return explicitLabel;
  }

  const normalizedPathId = pathId?.split(/[?#]/, 1)[0];
  const curatedLabel = getCuratedPathLabel(symbolId, normalizedPathId);
  const linkedEntry = normalizedPathId ? getCodexEntry(normalizedPathId) ?? resolveCodexEntry(normalizedPathId) : undefined;

  if (curatedLabel) return curatedLabel;
  if (linkedEntry?.title) return linkedEntry.title;

  const bridge = getSymbolPathConfig(symbolId);

  if (normalizedPathId && bridge) {
    return getSymbolTraceFallbackLabel(bridge.symbolId);
  }

  return normalizedPathId ? getSymbolTraceFallbackLabel(symbolId) : undefined;
}

function getReflectionPathId(reflection: StoredReflection) {
  return (reflection.pathContext?.path ?? reflection.path)?.split(/[?#]/, 1)[0];
}

function getReflectionTraceHref(reflection: StoredReflection) {
  const pathId = getReflectionPathId(reflection);

  if (!pathId) {
    return undefined;
  }

  if (getKnownSymbolPathLabel(pathId)) {
    return `/codex/${pathId}`;
  }

  const entry = getCodexEntry(pathId) ?? resolveCodexEntry(pathId);

  if (entry) {
    return `/codex/${entry.id}`;
  }

  return undefined;
}

function pushUniqueLink(links: ReflectionReturnLink[], link: ReflectionReturnLink | undefined) {
  if (!link || links.some((existingLink) => existingLink.href === link.href && existingLink.label === link.label)) {
    return;
  }

  links.push(link);
}

function getReflectionCodexReturnLabel(symbolId: string, label: string) {
  return symbolId === "wueste" ? "Zum Wüsten-Codex" : `Zum ${label}-Codex`;
}

export function resolveReflectionReturnLinks(reflection: StoredReflection): ReflectionReturnLink[] {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (!bridge) {
    const links: ReflectionReturnLink[] = [];

    if (reflection.codexHref) {
      pushUniqueLink(links, { key: "codex", label: "Codex oeffnen", href: reflection.codexHref });
    }

    if (reflection.roomHref) {
      pushUniqueLink(links, { key: "room", label: "In den Raum zurueckkehren", href: reflection.roomHref });
    }

    pushUniqueLink(links, { key: "symbol-network", label: "Symbolnetz oeffnen", href: "/symbolnetz" });

    return links;
  }

  const pathId = getReflectionPathId(reflection);
  const traceHref = getReflectionTraceHref(reflection);
  const roomHref = buildRoomHref(bridge.symbolId, {
    from: "mein-pfad",
    path: pathId,
    symbol: bridge.symbolId,
  });
  const links: ReflectionReturnLink[] = [];

  pushUniqueLink(links, traceHref ? {
    key: "trace",
    label: bridge.returnLabel,
    href: traceHref,
  } : undefined);
  pushUniqueLink(links, { key: "codex", label: getReflectionCodexReturnLabel(bridge.symbolId, bridge.label), href: getCodexHref(bridge.symbolId) });
  pushUniqueLink(links, {
    key: "room",
    label: `In den ${bridge.roomLabel} zurueckkehren`,
    href: roomHref,
  });
  pushUniqueLink(links, { key: "symbol-network", label: `${bridge.label} im Symbolnetz ansehen`, href: getSymbolNetworkHref(bridge.symbolId) });

  return links;
}

function getReflectionTime(reflection: StoredReflection) {
  const time = new Date(reflection.createdAt).getTime();

  return Number.isNaN(time) ? 0 : time;
}

export function getReflectionPreview(reflection: StoredReflection) {
  // `text` is the legacy fallback; do not remove it without a storage migration phase.
  return (reflection.answer || reflection.text || "").replace(/\s+/g, " ").trim();
}

export function isReflectionUsable(reflection: StoredReflection) {
  return Boolean(getReflectionPreview(reflection));
}

export function getReflectionContextLabel(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);
  const sourceLabel = reflection.sourceLabel?.trim();
  const pathLabel = reflection.pathLabel?.trim();
  const pathId = getReflectionPathId(reflection);
  const journey = getSymbolJourney(pathId) ?? getSymbolJourney(reflection.sourceId);

  if (sourceLabel && !looksTechnicalLabel(sourceLabel)) {
    return normalizeReflectionSourceLabel(reflection, sourceLabel);
  }

  if (isJourneyReflection(reflection)) {
    return journey ? `Aus der Spur: ${journey.title}` : "Aus einer Spur";
  }

  if (pathLabel && !looksTechnicalLabel(pathLabel)) {
    return `Deine Spur aus: ${pathLabel}`;
  }

  if (bridge && (reflection.sourceType === "room" || reflection.room || reflection.roomHref)) {
    return `Aus dem ${bridge.label}-Raum`;
  }

  if (reflection.sourceType === "room") {
    return `Aus dem ${reflection.title ?? reflection.symbol}-Raum`;
  }

  if (journey) {
    return `Aus der Spur: ${journey.title}`;
  }

  return undefined;
}

function reflectionMatchesSymbol(reflection: StoredReflection, symbolSlug: string) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  return bridge?.symbolId === symbolSlug || reflection.symbolSlug === symbolSlug || reflection.room === symbolSlug;
}

function isJourneyReflection(reflection: StoredReflection) {
  return reflection.source === "journey" || reflection.sourceType === "journey" || reflection.from === "journey";
}

function normalizeReflectionSourceLabel(reflection: StoredReflection, sourceLabel: string) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (bridge && /^Spur aus dem .+raum$/i.test(sourceLabel)) {
    return `Aus dem ${bridge.label}-Raum`;
  }

  return sourceLabel;
}

export function getLatestReflectionForSymbol(reflections: StoredReflection[], symbolSlug: string) {
  return reflections
    .filter((reflection) => reflectionMatchesSymbol(reflection, symbolSlug) && isReflectionUsable(reflection))
    .sort((a, b) => getReflectionTime(b) - getReflectionTime(a))[0];
}

export function getJourneyReflectionForStep(reflections: StoredReflection[], step: JourneyReflectionStep) {
  const symbolReflections = reflections
    .filter((reflection) => reflectionMatchesSymbol(reflection, step.symbol) && isReflectionUsable(reflection))
    .sort((a, b) => {
      const journeyWeight = Number(isJourneyReflection(b)) - Number(isJourneyReflection(a));

      return journeyWeight || getReflectionTime(b) - getReflectionTime(a);
    });

  return symbolReflections[0];
}

export function getRoomReflectionForSymbol(
  reflections: StoredReflection[],
  symbolSlug: string,
  options?: { preferJourney?: boolean },
) {
  // Rooms may prefer Journey context, but ordinary symbol traces remain valid fallbacks.
  const symbolReflections = reflections
    .filter((reflection) => reflectionMatchesSymbol(reflection, symbolSlug) && isReflectionUsable(reflection))
    .sort((a, b) => getReflectionTime(b) - getReflectionTime(a));

  if (options?.preferJourney) {
    const journeyReflection = symbolReflections.find(isJourneyReflection);

    if (journeyReflection) {
      return journeyReflection;
    }
  }

  return symbolReflections.find((reflection) => reflection.symbolSlug === symbolSlug)
    ?? symbolReflections.find((reflection) => reflection.room === symbolSlug)
    ?? symbolReflections[0];
}

export function getPersonalTraceForSymbol(
  reflections: StoredReflection[],
  symbolSlug: string,
  options?: { preferJourney?: boolean },
) {
  // Codex symbol pages use the same preference rule without changing stored data.
  if (options?.preferJourney) {
    return getJourneyReflectionForStep(reflections, { symbol: symbolSlug }) ?? getLatestReflectionForSymbol(reflections, symbolSlug);
  }

  return getLatestReflectionForSymbol(reflections, symbolSlug);
}

function dispatchStoredReflectionsUpdated() {
  try {
    window.dispatchEvent(new Event(STORED_REFLECTIONS_UPDATED_EVENT));
  } catch {
    // Older browsers can ignore the live refresh; persistence already happened.
  }
}

export function saveStoredReflection(reflection: StoredReflection) {
  const reflections = readStoredReflections();
  const next = [reflection, ...reflections.filter((item) => item.id !== reflection.id)];

  persistStoredReflections(next);
  dispatchStoredReflectionsUpdated();
}

export function persistStoredReflections(reflections: StoredReflection[]) {
  try {
    window.localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(reflections));
  } catch {
    // Storage can be unavailable or full; the current page should stay usable.
  }
}
