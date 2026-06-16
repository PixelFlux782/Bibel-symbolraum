import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";

export const REFLECTION_STORAGE_KEY = "bibel-symbolraum-reflections";

export type StoredReflection = {
  id: string;
  symbol: string;
  symbolSlug?: string;
  hebrew: string;
  title?: string;
  sourceType?: "symbol" | "room" | "pattern" | "journey" | "core" | "letter";
  sourceId?: string;
  codexHref?: string;
  question: string;
  answer: string;
  stateId?: string;
  stateTitle?: string;
  roomHref?: string;
  pathLabel?: string;
  pathContext?: {
    from?: string;
    path?: string;
    symbol?: string;
  };
  createdAt: string;
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
  const answer = typeof reflection.answer === "string" ? reflection.answer.trim() : "";
  const symbol = typeof reflection.symbol === "string" && reflection.symbol.trim()
    ? reflection.symbol.trim()
    : typeof reflection.title === "string" && reflection.title.trim()
      ? reflection.title.trim()
      : typeof reflection.symbolSlug === "string" && reflection.symbolSlug.trim()
        ? reflection.symbolSlug.trim()
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
    symbolSlug: typeof reflection.symbolSlug === "string" ? reflection.symbolSlug : undefined,
    hebrew: typeof reflection.hebrew === "string" ? reflection.hebrew : "",
    title: typeof reflection.title === "string" ? reflection.title : symbol,
    sourceType,
    sourceId: typeof reflection.sourceId === "string" ? reflection.sourceId : undefined,
    codexHref: typeof reflection.codexHref === "string" ? reflection.codexHref : undefined,
    question,
    answer,
    stateId: typeof reflection.stateId === "string" ? reflection.stateId : undefined,
    stateTitle: typeof reflection.stateTitle === "string" ? reflection.stateTitle : undefined,
    roomHref: typeof reflection.roomHref === "string" ? reflection.roomHref : undefined,
    pathLabel: typeof reflection.pathLabel === "string" ? reflection.pathLabel : undefined,
    pathContext: normalizePathContext(reflection.pathContext),
    createdAt,
  };
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
