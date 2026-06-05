import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { biblicalReferences } from "@/lib/meaning/biblicalReferences";
import { meaningJourneys } from "@/lib/meaning/meaningJourneys";
import { meaningNodes } from "@/lib/meaning/meaningNodes";
import { SYMBOLS, SYMBOL_NETWORK } from "@/lib/symbols";

import { codexRegistry } from "./codexRegistry";
import type { CodexEntry } from "./types";

export interface CodexValidationResult {
  errors: string[];
  warnings: string[];
  stats: {
    entries: number;
    relations: number;
    scriptureAnchors: number;
  };
}

function duplicateIds(entries: CodexEntry[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry.id)) {
      duplicates.add(entry.id);
    }

    seen.add(entry.id);
  }

  return Array.from(duplicates, (id) => `CodexEntry: doppelte ID "${id}".`);
}

function normalizeCodexLookupTerm(term: string): string {
  return term
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u0591-\u05c7]/g, "")
    .replace(/[\s:_,.;/\\]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function duplicateLookupTerms(entries: CodexEntry[]): string[] {
  return entries.flatMap((entry) => {
    const localTerms = new Set<string>();
    const duplicates = new Set<string>();

    for (const term of [...entry.aliases ?? [], ...entry.searchTerms ?? []]) {
      const normalizedTerm = normalizeCodexLookupTerm(term);

      if (!normalizedTerm) {
        continue;
      }

      if (localTerms.has(normalizedTerm)) {
        duplicates.add(`CodexEntry "${entry.id}": doppelter Alias/SearchTerm "${term}".`);
      }

      localTerms.add(normalizedTerm);
    }

    return Array.from(duplicates);
  });
}

function sharedLookupTerms(entries: CodexEntry[]): string[] {
  const ownersByTerm = new Map<string, string>();
  const duplicates = new Set<string>();

  for (const entry of entries) {
    for (const term of [...entry.aliases ?? [], ...entry.searchTerms ?? []]) {
      const normalizedTerm = normalizeCodexLookupTerm(term);

      if (!normalizedTerm) {
        continue;
      }

      const ownerId = ownersByTerm.get(normalizedTerm);

      if (ownerId && ownerId !== entry.id) {
        duplicates.add(`CodexEntry: geteilter Alias/SearchTerm "${term}" bei "${ownerId}" und "${entry.id}".`);
        continue;
      }

      ownersByTerm.set(normalizedTerm, entry.id);
    }
  }

  return Array.from(duplicates);
}

export function validateCodex(entries: CodexEntry[] = codexRegistry): CodexValidationResult {
  const errors = [...duplicateIds(entries), ...duplicateLookupTerms(entries)];
  const warnings: string[] = [...sharedLookupTerms(entries)];
  const entryIds = new Set(entries.map((entry) => entry.id));
  const meaningNodeIds = new Set(meaningNodes.map((node) => node.id));
  const journeyIds = new Set(meaningJourneys.map((journey) => journey.id));
  const scriptureReferenceIds = new Set(biblicalReferences.map((reference) => reference.id));
  const externalCodexTargetIds = new Set([
    ...hebrewLetters.map((letter) => letter.id),
    ...hebrewWords.map((word) => word.id),
    ...biblicalReferences.map((reference) => reference.id),
  ]);
  const symbolSlugs = new Set([
    ...SYMBOL_NETWORK.map((symbol) => symbol.id),
    ...SYMBOLS.map((symbol) => symbol.slug),
  ]);

  for (const entry of entries) {
    if (!entry.id.trim()) {
      errors.push("CodexEntry benoetigt eine id.");
    }

    if (!entry.title.trim()) {
      errors.push(`CodexEntry "${entry.id}" benoetigt einen title.`);
    }

    if (!entry.summary.trim()) {
      warnings.push(`CodexEntry "${entry.id}" besitzt noch keine summary.`);
    }

    for (const nodeId of entry.meaningFields) {
      if (!meaningNodeIds.has(nodeId)) {
        errors.push(`CodexEntry "${entry.id}" referenziert den unbekannten MeaningNode "${nodeId}".`);
      }
    }

    for (const relation of entry.relations) {
      if (!entryIds.has(relation.targetId) && !symbolSlugs.has(relation.targetId) && !externalCodexTargetIds.has(relation.targetId)) {
        warnings.push(`CodexEntry "${entry.id}" verknuepft Ziel "${relation.targetId}", das noch kein CodexEntry ist.`);
      }
    }

    for (const anchor of entry.scriptureAnchors) {
      if (anchor.id && !scriptureReferenceIds.has(anchor.id)) {
        errors.push(`CodexEntry "${entry.id}" referenziert die unbekannte BiblicalReference-ID "${anchor.id}".`);
      }

      if (!anchor.reference.trim()) {
        errors.push(`CodexEntry "${entry.id}" besitzt einen ScriptureAnchor ohne reference.`);
      }
    }

    if (entry.symbolRoomSlug && !symbolSlugs.has(entry.symbolRoomSlug)) {
      errors.push(`CodexEntry "${entry.id}" referenziert den unbekannten Symbolraum "${entry.symbolRoomSlug}".`);
    }

    for (const journeyId of entry.journeyIds) {
      if (!journeyIds.has(journeyId)) {
        errors.push(`CodexEntry "${entry.id}" referenziert die unbekannte Journey "${journeyId}".`);
      }
    }
  }

  return {
    errors,
    warnings,
    stats: {
      entries: entries.length,
      relations: entries.flatMap((entry) => entry.relations).length,
      scriptureAnchors: entries.flatMap((entry) => entry.scriptureAnchors).length,
    },
  };
}
