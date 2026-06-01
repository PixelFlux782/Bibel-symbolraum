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
  letters: HebrewLetter[];
  meaningFields: HebrewMeaningField[];
  relatedSymbolSlugs: string[];
  warnings: string[];
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
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
    warnings.push(`Kein HebrewSymbolMapping fuer Symbol-Slug "${symbolSlug}" gefunden.`);
  }

  const hebrewWordId = engineData?.hebrew.hebrewWordId ?? mapping?.primaryHebrewWordId;

  if (!hebrewWordId) {
    warnings.push(`Kein HebrewWord fuer Symbol-Slug "${symbolSlug}" referenziert.`);
  }

  const hebrewWord = hebrewWords.find((word) => word.id === hebrewWordId);

  if (hebrewWordId && !hebrewWord) {
    warnings.push(`HebrewWord "${hebrewWordId}" fuer Symbol-Slug "${symbolSlug}" fehlt.`);
  }

  const letterIds = engineData?.hebrew.hebrewLetterIds ?? hebrewWord?.letterIds ?? [];
  const letters = letterIds.flatMap((letterId) => {
    const letter = hebrewLetters.find((candidate) => candidate.id === letterId);

    if (!letter) {
      warnings.push(`HebrewLetter "${letterId}" fuer Symbol-Slug "${symbolSlug}" fehlt.`);
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
            `HebrewMeaningField "${meaningFieldId}" fuer Symbol-Slug "${symbolSlug}" fehlt.`,
          );
          return [];
        }

        return [meaningField];
      })
    : availableMeaningFields;

  return {
    hebrewWord,
    letters,
    meaningFields,
    relatedSymbolSlugs: unique([
      ...(hebrewWord?.relatedSymbolSlugs ?? []),
      ...letters.flatMap((letter) => letter.relatedSymbolSlugs),
    ]),
    warnings,
  };
}
