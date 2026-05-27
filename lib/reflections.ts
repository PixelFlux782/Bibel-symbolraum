export const REFLECTION_STORAGE_KEY = "bibel-symbolraum-reflections";

export type StoredReflection = {
  id: string;
  symbol: string;
  hebrew: string;
  question: string;
  answer: string;
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
            hebrew: "מים",
            question: WATER_REFLECTION_QUESTION,
            answer: legacyWaterText,
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
    typeof reflection.hebrew === "string" &&
    typeof reflection.question === "string" &&
    typeof reflection.answer === "string" &&
    typeof reflection.createdAt === "string"
  );
}
