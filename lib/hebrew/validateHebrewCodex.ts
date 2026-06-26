import type { HebrewSymbolMapping, HebrewWord } from "@/types/hebrew";

import { hebrewLetters } from "./hebrewLetters";
import { hebrewRoots, hebrewWords } from "./hebrewWords";
import { symbolHebrewMappings } from "./symbolHebrewMappings";

function findDuplicateIds(items: { id: string }[], label: string): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }

    seen.add(item.id);
  }

  return Array.from(duplicates, (id) => `${label}: doppelte ID "${id}".`);
}

function validateWord(
  word: HebrewWord,
  letterIds: Set<string>,
  rootIds: Set<string>,
): string[] {
  const errors: string[] = [];

  if (word.germanMeaning.trim() === "") {
    errors.push(`HebrewWord "${word.id}" benötigt eine deutsche Grundbedeutung.`);
  }

  if (word.meaningThreshold.trim() === "") {
    errors.push(`HebrewWord "${word.id}" benötigt eine kurze Bedeutungsschwelle.`);
  }

  const sentenceCount = word.meaningThreshold
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;

  if (sentenceCount > 2) {
    errors.push(`HebrewWord "${word.id}" darf höchstens zwei Sätze als Bedeutungsschwelle führen.`);
  }

  for (const letterId of word.letterIds) {
    if (!letterIds.has(letterId)) {
      errors.push(`HebrewWord "${word.id}" referenziert den unbekannten Buchstaben "${letterId}".`);
    }
  }

  for (const rootId of word.possibleRootIds) {
    if (!rootIds.has(rootId)) {
      errors.push(`HebrewWord "${word.id}" referenziert die unbekannte Wurzel "${rootId}".`);
    }
  }

  return errors;
}

function validateMapping(mapping: HebrewSymbolMapping, wordIds: Set<string>): string[] {
  const errors: string[] = [];

  if (typeof mapping.symbolSlug !== "string" || mapping.symbolSlug.trim() === "") {
    errors.push(`HebrewSymbolMapping "${mapping.id}" benötigt einen Symbol-Slug als String.`);
  }

  for (const wordId of mapping.hebrewWordIds) {
    if (!wordIds.has(wordId)) {
      errors.push(`HebrewSymbolMapping "${mapping.id}" referenziert das unbekannte Wort "${wordId}".`);
    }
  }

  if (!wordIds.has(mapping.primaryHebrewWordId)) {
    errors.push(`HebrewSymbolMapping "${mapping.id}" referenziert das unbekannte Hauptwort "${mapping.primaryHebrewWordId}".`);
  }

  if (!mapping.hebrewWordIds.includes(mapping.primaryHebrewWordId)) {
    errors.push(`HebrewSymbolMapping "${mapping.id}" muss sein Hauptwort auch in hebrewWordIds aufführen.`);
  }

  return errors;
}

export function validateHebrewCodex(): string[] {
  const errors = [
    ...findDuplicateIds(hebrewLetters, "HebrewLetter"),
    ...findDuplicateIds(hebrewRoots, "HebrewRoot"),
    ...findDuplicateIds(hebrewWords, "HebrewWord"),
    ...findDuplicateIds(symbolHebrewMappings, "HebrewSymbolMapping"),
  ];
  const letterIds = new Set(hebrewLetters.map((letter) => letter.id));
  const rootIds = new Set(hebrewRoots.map((root) => root.id));
  const wordIds = new Set(hebrewWords.map((word) => word.id));

  for (const root of hebrewRoots) {
    for (const letterId of root.letterIds) {
      if (!letterIds.has(letterId)) {
        errors.push(`HebrewRoot "${root.id}" referenziert den unbekannten Buchstaben "${letterId}".`);
      }
    }
  }

  for (const word of hebrewWords) {
    errors.push(...validateWord(word, letterIds, rootIds));
  }

  for (const mapping of symbolHebrewMappings) {
    errors.push(...validateMapping(mapping, wordIds));
  }

  const mem = hebrewLetters.find((letter) => letter.id === "mem");

  if (!mem) {
    errors.push('HebrewLetter "mem" fehlt.');
  } else {
    if (mem.glyph !== "מ" || mem.openForm !== "מ") {
      errors.push('HebrewLetter "mem" muss "מ" als offene Form führen.');
    }

    if (mem.closedForm !== "ם" || mem.finalForm !== "ם") {
      errors.push('HebrewLetter "mem" muss "ם" als geschlossene Schlussform führen.');
    }

    if (mem.openForm === mem.closedForm) {
      errors.push('HebrewLetter "mem" muss offene und geschlossene Form unterscheiden.');
    }
  }

  return errors;
}
