import type { SymbolEngineData } from "@/types/engine";
import type {
  HebrewLetter,
  HebrewMeaningField,
  HebrewWord,
} from "@/types/hebrew";

import { hebrewLetters } from "./hebrewLetters";
import { hebrewWords } from "./hebrewWords";
import { symbolHebrewMappings } from "./symbolHebrewMappings";

export interface SymbolHebrewProfile {
  hebrewWord?: HebrewWord;
  relatedHebrewWords: HebrewWord[];
  letters: HebrewLetter[];
  meaningFields: HebrewMeaningField[];
  relatedSymbolSlugs: string[];
  warnings: string[];
}

const ROOM_HEBREW_PRIORITIES: Record<string, string[]> = {
  wasser: ["majim", "mem", "tehom", "ruach", "mikwe", "jordan", "jam"],
  licht: ["or", "aleph", "panim", "kavod", "chokma", "bina", "schamajim"],
  feuer: ["esch", "aleph", "mizbeach", "korban", "ruach"],
  wueste: ["midbar", "mem", "derech", "nes", "sinai", "manna"],
  brot: ["lechem", "mem", "manna", "dagan", "shever", "seudah"],
};

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function sortMappedHebrewWordIds(symbolSlug: string, mapping?: { hebrewWordIds: string[]; primaryHebrewWordId: string }) {
  const priority = ROOM_HEBREW_PRIORITIES[symbolSlug] ?? [];
  const priorityIndex = new Map(priority.map((id, index) => [id, index]));
  const mappedIds = mapping?.hebrewWordIds ?? [];

  return unique([
    ...(mapping?.primaryHebrewWordId ? [mapping.primaryHebrewWordId] : []),
    ...priority.filter((id) => id !== "mem" && id !== "aleph"),
    ...mappedIds,
  ]).sort((left, right) => {
    const leftPriority = priorityIndex.get(left) ?? 100;
    const rightPriority = priorityIndex.get(right) ?? 100;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return mappedIds.indexOf(left) - mappedIds.indexOf(right);
  });
}

export function getSymbolHebrewProfile(
  symbol: string | SymbolEngineData,
): SymbolHebrewProfile {
  const symbolSlug = typeof symbol === "string" ? symbol : symbol.slug;
  const engineData = typeof symbol === "string" ? undefined : symbol;
  const warnings: string[] = [];
  const mapping = symbolHebrewMappings.find(
    (candidate) => candidate.symbolSlug === symbolSlug,
  );

  if (!mapping) {
    warnings.push(`Kein HebrewSymbolMapping für Symbol-Slug "${symbolSlug}" gefunden.`);
  }

  const hebrewWordId = engineData?.hebrew.hebrewWordId ?? mapping?.primaryHebrewWordId;

  if (!hebrewWordId) {
    warnings.push(`Kein HebrewWord für Symbol-Slug "${symbolSlug}" referenziert.`);
  }

  const hebrewWord = hebrewWords.find((word) => word.id === hebrewWordId);
  const relatedHebrewWords = sortMappedHebrewWordIds(symbolSlug, mapping)
    .flatMap((wordId) => {
      const word = hebrewWords.find((candidate) => candidate.id === wordId);

      if (!word) {
        warnings.push(`HebrewWord "${wordId}" aus Mapping "${symbolSlug}" fehlt.`);
        return [];
      }

      return [word];
    })
    .slice(0, 7);

  if (hebrewWordId && !hebrewWord) {
    warnings.push(`HebrewWord "${hebrewWordId}" für Symbol-Slug "${symbolSlug}" fehlt.`);
  }

  const letterIds = engineData?.hebrew.hebrewLetterIds ?? hebrewWord?.letterIds ?? [];
  const letters = letterIds.flatMap((letterId) => {
    const letter = hebrewLetters.find((candidate) => candidate.id === letterId);

    if (!letter) {
      warnings.push(`HebrewLetter "${letterId}" für Symbol-Slug "${symbolSlug}" fehlt.`);
      return [];
    }

    return [letter];
  });

  const availableMeaningFields = hebrewWord?.meaningFields ?? [];
  const meaningFieldIds = engineData?.hebrew.hebrewMeaningFieldIds;
  const meaningFields = meaningFieldIds
    ? meaningFieldIds.flatMap((meaningFieldId) => {
        const meaningField = availableMeaningFields.find(
          (candidate) => candidate.id === meaningFieldId,
        );

        if (!meaningField) {
          warnings.push(
            `HebrewMeaningField "${meaningFieldId}" für Symbol-Slug "${symbolSlug}" fehlt.`,
          );
          return [];
        }

        return [meaningField];
      })
    : availableMeaningFields;

  return {
    hebrewWord,
    relatedHebrewWords,
    letters,
    meaningFields,
    relatedSymbolSlugs: unique([
      ...(hebrewWord?.relatedSymbolSlugs ?? []),
      ...letters.flatMap((letter) => letter.relatedSymbolSlugs),
    ]),
    warnings,
  };
}
