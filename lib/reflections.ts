export const REFLECTION_STORAGE_KEY = "bibel-symbolraum-reflections";

export type StoredReflection = {
  id: string;
  symbol: string;
  symbolSlug?: string;
  hebrew: string;
  question: string;
  answer: string;
  stateId?: string;
  stateTitle?: string;
  roomHref?: string;
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
      return parsed.filter(isStoredReflection);
    }

    if (parsed && typeof parsed === "object") {
      const legacyWaterText = (parsed as Record<string, unknown>).wasser;

      if (typeof legacyWaterText === "string" && legacyWaterText.trim()) {
        return [
          {
            id: "legacy-wasser",
            symbol: "Wasser",
            symbolSlug: "wasser",
            hebrew: "מים",
            question: WATER_REFLECTION_QUESTION,
            answer: legacyWaterText,
            roomHref: "/raeume/wasser",
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

function isStoredReflection(value: unknown): value is StoredReflection {
  if (!value || typeof value !== "object") {
    return false;
  }

  const reflection = value as Record<string, unknown>;

  return (
    typeof reflection.id === "string" &&
    typeof reflection.symbol === "string" &&
    (reflection.symbolSlug === undefined || typeof reflection.symbolSlug === "string") &&
    typeof reflection.hebrew === "string" &&
    typeof reflection.question === "string" &&
    typeof reflection.answer === "string" &&
    (reflection.stateId === undefined || typeof reflection.stateId === "string") &&
    (reflection.stateTitle === undefined || typeof reflection.stateTitle === "string") &&
    (reflection.roomHref === undefined || typeof reflection.roomHref === "string") &&
    typeof reflection.createdAt === "string"
  );
}

export function saveStoredReflection(reflection: StoredReflection) {
  const reflections = parseStoredReflections(window.localStorage.getItem(REFLECTION_STORAGE_KEY));
  const next = [reflection, ...reflections.filter((item) => item.id !== reflection.id)];

  window.localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(next));
}
