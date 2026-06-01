import { hebrewLetters } from "./hebrewLetters";
import { hebrewWords } from "./hebrewWords";
import { symbolHebrewMappings } from "./symbolHebrewMappings";

export function getHebrewLetterById(id: string) {
  return hebrewLetters.find((letter) => letter.id === id);
}

export function getHebrewWordBySlug(slug: string) {
  return hebrewWords.find((word) => word.slug === slug);
}

export function getHebrewWordsByLetter(letterId: string) {
  return hebrewWords.filter((word) => word.letterIds.includes(letterId));
}

export function getSymbolsByHebrewLetter(letterId: string) {
  const wordIds = new Set(getHebrewWordsByLetter(letterId).map((word) => word.id));

  return symbolHebrewMappings
    .filter((mapping) => mapping.hebrewWordIds.some((wordId) => wordIds.has(wordId)))
    .map((mapping) => mapping.symbolSlug);
}

export function getMeaningFieldsByWord(wordId: string) {
  return hebrewWords.find((word) => word.id === wordId)?.meaningFields ?? [];
}
