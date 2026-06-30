import { codexRegistry } from "./codexRegistry";
import type { CodexEntry, CodexEntryType } from "./types";

function normalizeCodexTerm(term: string): string {
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

function entryTerms(entry: CodexEntry): string[] {
  return [
    entry.id,
    entry.title,
    entry.subtitle,
    entry.hebrew,
    entry.transliteration,
    ...entry.aliases ?? [],
    ...entry.searchTerms ?? [],
    ...entry.scriptureAnchors.flatMap((anchor) => [anchor.id, anchor.reference, anchor.label]),
    ...entry.meta.tags ?? [],
  ].filter((term): term is string => Boolean(term?.trim()));
}

const CANONICAL_CODEX_LOOKUP_IDS: Record<string, string> = {
  wasser: "majim",
  licht: "or",
  feuer: "esch",
  esh: "esch",
  eretz: "erez",
  wueste: "midbar",
  wuste: "midbar",
  brot: "lechem",
  tiefe: "tehom",
  wort: "davar",
  stimme: "qol",
  "chaos-ordnung": "journey-chaos-ordnung",
  "wasser-brot": "journey-wasser-zum-brot",
  "wasser-licht": "bridge-wasser-licht",
};

function uniqueEntries(entries: CodexEntry[]): CodexEntry[] {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.id)) {
      return false;
    }

    seen.add(entry.id);
    return true;
  });
}

export function resolveCodexEntry(input: string): CodexEntry | undefined {
  const normalizedInput = normalizeCodexTerm(input);

  if (!normalizedInput) {
    return undefined;
  }

  const canonicalId = CANONICAL_CODEX_LOOKUP_IDS[normalizedInput];
  const canonicalMatch = canonicalId ? codexRegistry.find((entry) => entry.id === canonicalId) : undefined;

  if (canonicalMatch) {
    return canonicalMatch;
  }

  const exactIdMatch = codexRegistry.find((entry) => normalizeCodexTerm(entry.id) === normalizedInput);

  if (exactIdMatch) {
    return exactIdMatch;
  }

  return codexRegistry.find((entry) =>
    entryTerms(entry).some((term) => normalizeCodexTerm(term) === normalizedInput),
  );
}

export function searchCodexEntries(query: string): CodexEntry[] {
  const normalizedQuery = normalizeCodexTerm(query);

  if (!normalizedQuery) {
    return [];
  }

  const canonicalId = CANONICAL_CODEX_LOOKUP_IDS[normalizedQuery];
  const canonicalMatch = canonicalId ? codexRegistry.find((entry) => entry.id === canonicalId) : undefined;

  return uniqueEntries([
    canonicalMatch,
    ...(
    codexRegistry.filter((entry) =>
      entryTerms(entry).some((term) => {
        const normalizedTerm = normalizeCodexTerm(term);
        return normalizedTerm === normalizedQuery || normalizedTerm.includes(normalizedQuery);
      }),
    )
    ),
  ].filter((entry): entry is CodexEntry => Boolean(entry)));
}

export function getCodexEntriesByType(type: CodexEntryType): CodexEntry[] {
  return codexRegistry.filter((entry) => entry.type === type);
}
