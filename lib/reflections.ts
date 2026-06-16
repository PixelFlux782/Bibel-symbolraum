import { getCodexEntry } from "@/lib/codex/getCodexEntry";
import { resolveCodexEntry } from "@/lib/codex/resolveCodexEntry";
import { buildRoomHref } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig, getSymbolPathConfigFromReflectionLike } from "@/lib/symbols/symbolPathConfig";

export const REFLECTION_STORAGE_KEY = "bibel-symbolraum-reflections";

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

function normalizeStoredReflection(value: unknown): StoredReflection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const reflection = value as Record<string, unknown>;
  const answer = getFirstString(reflection.answer, reflection.text, reflection.reflection)?.trim() ?? "";
  const symbol = typeof reflection.symbol === "string" && reflection.symbol.trim()
    ? reflection.symbol.trim()
    : typeof reflection.title === "string" && reflection.title.trim()
      ? reflection.title.trim()
      : typeof reflection.symbolSlug === "string" && reflection.symbolSlug.trim()
        ? reflection.symbolSlug.trim()
        : typeof reflection.room === "string" && reflection.room.trim()
          ? reflection.room.trim()
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

  return {
    id: typeof reflection.id === "string" && reflection.id.trim()
      ? reflection.id
      : `legacy-${symbol.toLocaleLowerCase("de-DE").replace(/\s+/g, "-")}-${createdAt}`,
    symbol,
    symbolSlug: getFirstString(reflection.symbolSlug, reflection.symbolId),
    room: typeof reflection.room === "string" ? reflection.room : undefined,
    hebrew: typeof reflection.hebrew === "string" ? reflection.hebrew : "",
    title: typeof reflection.title === "string" ? reflection.title : symbol,
    sourceType,
    sourceId: typeof reflection.sourceId === "string" ? reflection.sourceId : undefined,
    source: typeof reflection.source === "string" ? reflection.source : undefined,
    sourceLabel: typeof reflection.sourceLabel === "string" ? reflection.sourceLabel : undefined,
    codexHref: getHrefString(reflection.codexHref),
    question,
    answer,
    text: answer,
    stateId: typeof reflection.stateId === "string" ? reflection.stateId : undefined,
    stateTitle: typeof reflection.stateTitle === "string" ? reflection.stateTitle : undefined,
    roomHref: getHrefString(reflection.roomHref),
    pathLabel: typeof reflection.pathLabel === "string" ? reflection.pathLabel : undefined,
    from: typeof reflection.from === "string" ? reflection.from : undefined,
    path: typeof reflection.path === "string" ? reflection.path : undefined,
    pathContext: normalizeReflectionPathContext(reflection),
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

function getReflectionPathId(reflection: StoredReflection) {
  return (reflection.pathContext?.path ?? reflection.path)?.split(/[?#]/, 1)[0];
}

function getReflectionTraceHref(reflection: StoredReflection) {
  const pathId = getReflectionPathId(reflection);

  if (!pathId) {
    return undefined;
  }

  const entry = getCodexEntry(pathId) ?? resolveCodexEntry(pathId);

  return entry ? `/codex/${entry.id}` : undefined;
}

function pushUniqueLink(links: ReflectionReturnLink[], link: ReflectionReturnLink | undefined) {
  if (!link || links.some((existingLink) => existingLink.href === link.href && existingLink.label === link.label)) {
    return;
  }

  links.push(link);
}

export function resolveReflectionReturnLinks(reflection: StoredReflection): ReflectionReturnLink[] {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (!bridge) {
    const links: ReflectionReturnLink[] = [];

    if (reflection.codexHref) {
      pushUniqueLink(links, { key: "codex", label: "Codex oeffnen", href: reflection.codexHref });
    }

    if (reflection.roomHref) {
      pushUniqueLink(links, { key: "room", label: "Raum erneut betreten", href: reflection.roomHref });
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
  const isWater = bridge.symbolId === "wasser";
  const links: ReflectionReturnLink[] = [];

  pushUniqueLink(links, traceHref ? {
    key: "trace",
    label: isWater ? "Zur Spur zurueckkehren" : `Zur ${bridge.label}spur zurueckkehren`,
    href: traceHref,
  } : undefined);
  pushUniqueLink(links, { key: "codex", label: `Zum ${bridge.label}-Codex`, href: bridge.codexHref });
  pushUniqueLink(links, {
    key: "room",
    label: `Den ${bridge.label}raum erneut betreten`,
    href: roomHref,
  });
  pushUniqueLink(links, { key: "symbol-network", label: `${bridge.label} im Symbolnetz ansehen`, href: bridge.symbolNetworkHref });

  return links;
}

export function saveStoredReflection(reflection: StoredReflection) {
  const reflections = parseStoredReflections(window.localStorage.getItem(REFLECTION_STORAGE_KEY));
  const next = [reflection, ...reflections.filter((item) => item.id !== reflection.id)];

  persistStoredReflections(next);
}

export function persistStoredReflections(reflections: StoredReflection[]) {
  try {
    window.localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(reflections));
  } catch {
    // Storage can be unavailable or full; the current page should stay usable.
  }
}
