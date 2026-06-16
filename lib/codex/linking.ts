import { biblicalReferences } from "@/lib/meaning/biblicalReferences";
import { meaningNodes } from "@/lib/meaning/meaningNodes";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";

import { resolveCodexEntry } from "./resolveCodexEntry";
import type { CodexEntry, CodexScriptureAnchor } from "./types";

export type CodexChipInput = {
  id?: string;
  label: string;
  href?: string;
};

export type CodexChipLink = Required<CodexChipInput>;

export type WaterCodexAnchorBridge = {
  anchorId: string;
  contextLabel: string;
  returnHref: string;
  returnLabel: string;
  roomHref: string;
  roomLabel: string;
  roomTraceLabel: string;
  personalPathHref?: string;
  personalPathLabel?: string;
};

export type SymbolCodexAnchorBridge = WaterCodexAnchorBridge & {
  symbolId: string;
  symbolNetworkHref?: string;
  symbolNetworkLabel?: string;
};

function normalizeCodexTerm(value: string) {
  return value
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

export function normalizeCodexChipKey(chip: Pick<CodexChipInput, "id" | "label">) {
  return normalizeCodexTerm(chip.id || chip.label);
}

export function dedupeCodexChips<T extends CodexChipInput>(chips: T[]) {
  const seen = new Set<string>();

  return chips.filter((chip) => {
    const keys = [chip.id, chip.label].filter((value): value is string => Boolean(value?.trim())).map(normalizeCodexTerm);
    const key = keys.find((candidate) => candidate && seen.has(candidate)) ?? keys[0];

    if (!key || seen.has(key)) {
      return false;
    }

    keys.forEach((candidate) => seen.add(candidate));
    return true;
  });
}

function getCuratedMeaningField(symbolId: string, value: string) {
  const normalizedValue = normalizeCodexTerm(value);

  return getSymbolPathConfig(symbolId)?.codexGates?.meaningFields?.find((field) =>
    [field.id, field.meaningNodeId, field.label].some((candidate) => candidate && normalizeCodexTerm(candidate) === normalizedValue),
  );
}

function getCuratedScriptureAnchor(symbolId: string, value: string) {
  const normalizedValue = normalizeCodexTerm(value);

  return getSymbolPathConfig(symbolId)?.codexGates?.scriptureAnchors?.find((anchor) =>
    [anchor.id, anchor.reference, anchor.label].some((candidate) => normalizeCodexTerm(candidate) === normalizedValue),
  );
}

function queryHref(key: "meaning" | "scripture", value: string) {
  return `/codex?${key}=${encodeURIComponent(value)}`;
}

export function resolveMeaningFieldHref(value: string, symbolId = "wasser") {
  const curated = getCuratedMeaningField(symbolId, value);
  const linkedEntry = resolveCodexEntry(curated?.id ?? value) ?? resolveCodexEntry(curated?.label ?? value);
  const curatedHref = curated && "href" in curated ? curated.href : undefined;

  return linkedEntry ? `/codex/${linkedEntry.id}` : curatedHref ?? queryHref("meaning", curated?.id ?? normalizeCodexTerm(value));
}

export function resolveScriptureAnchorHref(value: string, symbolId = "wasser") {
  const curated = getCuratedScriptureAnchor(symbolId, value);
  const linkedEntry =
    resolveCodexEntry(curated?.id ?? value) ??
    resolveCodexEntry(curated?.reference ?? value) ??
    resolveCodexEntry(curated?.label ?? value);
  const curatedHref = curated && "href" in curated ? curated.href : undefined;

  return curatedHref ?? (linkedEntry ? `/codex/${linkedEntry.id}` : queryHref("scripture", curated?.id ?? normalizeCodexTerm(value)));
}

export function getMeaningFieldFilter(value: string, symbolId = "wasser") {
  const curated = getCuratedMeaningField(symbolId, value);
  const normalizedValue = normalizeCodexTerm(value);
  const node = meaningNodes.find((candidate) =>
    [candidate.id, candidate.label].some((term) => normalizeCodexTerm(term) === normalizedValue),
  );

  return {
    slug: curated?.id ?? normalizedValue,
    label: curated?.label ?? node?.label ?? value,
    meaningNodeId: curated?.meaningNodeId ?? node?.id,
  };
}

export function getScriptureFilter(value: string, symbolId = "wasser") {
  const curated = getCuratedScriptureAnchor(symbolId, value);
  const normalizedValue = normalizeCodexTerm(value);
  const reference = biblicalReferences.find((candidate) =>
    [candidate.id, candidate.reference, candidate.label, ...(candidate.aliases ?? [])].some((term) => normalizeCodexTerm(term) === normalizedValue),
  );
  const linkedEntry =
    resolveCodexEntry(curated?.id ?? value) ??
    resolveCodexEntry(curated?.reference ?? value) ??
    resolveCodexEntry(reference?.id ?? value);

  return {
    slug: curated?.id ?? reference?.id ?? normalizedValue,
    label: curated?.label ?? reference?.reference ?? linkedEntry?.title ?? value,
    hasDetailEntry: Boolean(linkedEntry),
  };
}

function entryMatchesScripture(entry: CodexEntry, slug: string) {
  const normalizedSlug = normalizeCodexTerm(slug);
  const anchorValues = entry.scriptureAnchors.flatMap((anchor: CodexScriptureAnchor) => [
    anchor.id,
    anchor.reference,
    anchor.label,
  ]);
  const relationValues = entry.relations.flatMap((relation) => {
    const linkedEntry = resolveCodexEntry(relation.targetId);
    return [relation.targetId, linkedEntry?.title, ...(linkedEntry?.aliases ?? [])];
  });

  return [...anchorValues, ...relationValues]
    .filter((value): value is string => Boolean(value?.trim()))
    .some((value) => normalizeCodexTerm(value) === normalizedSlug);
}

export function filterCodexEntriesByMeaning(entries: CodexEntry[], value: string) {
  const filter = getMeaningFieldFilter(value);
  const normalizedSlug = normalizeCodexTerm(filter.slug);
  const normalizedLabel = normalizeCodexTerm(filter.label);
  const normalizedNode = filter.meaningNodeId ? normalizeCodexTerm(filter.meaningNodeId) : "";

  return entries.filter((entry) => {
    const entryTerms = [entry.id, entry.title, entry.subtitle, ...(entry.aliases ?? []), ...(entry.searchTerms ?? [])]
      .filter((term): term is string => Boolean(term?.trim()))
      .map(normalizeCodexTerm);
    const entryFields = entry.meaningFields.map(normalizeCodexTerm);
    const relationTerms = entry.relations
      .flatMap((relation) => {
        const linkedEntry = resolveCodexEntry(relation.targetId);
        return [relation.targetId, relation.label, linkedEntry?.title];
      })
      .filter((term): term is string => Boolean(term?.trim()))
      .map(normalizeCodexTerm);

    return [...entryTerms, ...entryFields, ...relationTerms].some((term) =>
      term === normalizedSlug || term === normalizedLabel || (normalizedNode ? term === normalizedNode : false),
    );
  });
}

export function filterCodexEntriesByScripture(entries: CodexEntry[], value: string) {
  const filter = getScriptureFilter(value);

  return entries.filter((entry) => entry.id === filter.slug || entryMatchesScripture(entry, filter.slug));
}

export function getSymbolCodexChipLinks(symbolId: string) {
  const bridge = getSymbolPathConfig(symbolId);
  const meaningFields = dedupeCodexChips(
    (bridge?.codexGates?.meaningFields ?? []).map((field) => ({
      id: field.id,
      label: field.label,
      href: resolveMeaningFieldHref(field.id, symbolId),
    })),
  ) as CodexChipLink[];
  const scriptureAnchors = dedupeCodexChips(
    (bridge?.codexGates?.scriptureAnchors ?? []).map((anchor) => ({
      id: anchor.id,
      label: anchor.label,
      href: resolveScriptureAnchorHref(anchor.id, symbolId),
    })),
  ) as CodexChipLink[];

  return { meaningFields, scriptureAnchors };
}

export function getWaterCodexChipLinks() {
  return getSymbolCodexChipLinks("wasser");
}

export function getSymbolCodexAnchorBridge(symbolId: string, anchorId: string): SymbolCodexAnchorBridge | undefined {
  const symbolBridge = getSymbolPathConfig(symbolId);
  const anchorBridge = symbolBridge?.codexAnchorBridge;

  if (!symbolBridge || !anchorBridge) {
    return undefined;
  }

  const anchorIds = new Set<string>(anchorBridge.anchorIds);
  const contextLabels: Record<string, string> = anchorBridge.contextLabels ?? {};
  const specificContextLabel = contextLabels[anchorId];
  const personalPathLabel = "personalPathLabel" in anchorBridge ? anchorBridge.personalPathLabel : undefined;

  if (!anchorIds.has(anchorId)) {
    return undefined;
  }

  return {
    symbolId: symbolBridge.symbolId,
    anchorId,
    contextLabel: specificContextLabel ?? anchorBridge.defaultContextLabel,
    returnHref: symbolBridge.codexHref,
    returnLabel: anchorBridge.returnLabel,
    roomHref: `${symbolBridge.roomHref}?from=codex&path=${encodeURIComponent(anchorId)}&symbol=${symbolBridge.symbolId}`,
    roomLabel: anchorBridge.roomLabel,
    roomTraceLabel: specificContextLabel ? anchorBridge.roomTraceLabel : anchorBridge.roomLabel,
    symbolNetworkHref: symbolBridge.symbolNetworkHref,
    symbolNetworkLabel: symbolId === "licht" ? "Licht im Symbolnetz ansehen" : undefined,
    personalPathHref: personalPathLabel ? "/mein-pfad" : undefined,
    personalPathLabel,
  };
}

export function getWaterCodexAnchorBridge(anchorId: string): WaterCodexAnchorBridge | undefined {
  return getSymbolCodexAnchorBridge("wasser", anchorId);
}
