import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodexReflectionCard } from "@/components/CodexReflectionCard";
import { codexEntryIds, codexRegistry } from "@/lib/codex/codexRegistry";
import { getSymbolCodexAnchorBridge, getSymbolCodexChipLinks, getWaterCodexChipLinks, resolveScriptureAnchorHref } from "@/lib/codex/linking";
import { resolveCodexEntry } from "@/lib/codex/resolveCodexEntry";
import type { CodexEntry, CodexEntryType, CodexRelation } from "@/lib/codex/types";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { meaningNodes } from "@/lib/meaning/meaningNodes";
import { getBridgeBySourceAndTarget } from "@/lib/meaning-bridges";
import {
  getOntologyDisplayText,
  getOntologyEntity,
  getOntologyEntityTitle,
  getOntologyRelationLabel,
  getOntologyRelationMarkerLabel,
  getOntologyRegistry,
  getOntologyRelationsForEntity,
  getPatternsForEntity,
  getPatternsLeadingToCore,
  getTargetCoresForPattern,
  isCoreConceptId,
  ontologyEntities,
  shouldShowOntologyExplanation,
  sortOntologyRelations,
} from "@/lib/ontology";
import type { OntologyEntity, OntologyRelation, OntologyWayProjection } from "@/lib/ontology";
import { getResonanceJourney } from "@/lib/resonance";
import { buildRoomHref, getPatternRoomStation, hasSymbolRoom } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import type { MeaningNodeId } from "@/types/meaningGraph";

type CodexDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type CodexContextFocus = "overview" | "meaning" | "hebrew" | "gematria" | "story" | "spaces";
type SymbolNetworkReturnLens = "meaning" | "hebrew" | "gematria" | "story";

type PathContextLink = {
  from?: string;
  path?: string;
  symbol?: string;
};

type ResolvedPathContext = {
  labels: string[];
  note: string;
  returnHref: string;
  returnLabel: string;
};

type ReflectionSourceType = "symbol" | "pattern" | "journey" | "core" | "letter";

function formatType(type: CodexEntryType) {
  const labels: Record<CodexEntryType, string> = {
    "hebrew-letter": "Hebraeischer Buchstabe",
    "hebrew-word": "Hebraeisches Wort",
    journey: "Bedeutungspfad",
    meaning: "Bedeutungsfeld",
    "meaning-field": "Bedeutungsfeld",
    number: "Zahl",
    scripture: "Bibelstelle",
    symbol: "Symbol",
  };

  return labels[type];
}

function formatRelationType(type: CodexRelation["type"]) {
  const labels: Record<CodexRelation["type"], string> = {
    "anchors-scripture": "Bibelanker",
    "contains-letter": "traegt den Buchstaben",
    "continues-journey": "fuehrt weiter zu",
    contrasts: "steht im Gegenueber zu",
    "has-hebrew-word": "klingt hebraeisch mit",
    related: "steht nahe bei",
    "shares-meaning": "teilt Bedeutung mit",
    symbolizes: "macht sichtbar",
    transforms: "wandelt sich zu",
  };

  return labels[type];
}

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("de-DE")
    .trim()
    .replace(/\s+/g, " ");
}

function humanizeId(value: string) {
  return value
    .replace(/^(pattern|ontology|rel)-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("de-DE") + part.slice(1))
    .join(" ");
}

function isTechnicalVisibleText(value: string) {
  return [
    /_/,
    /\bderivedFromOntology\b/i,
    /\bsourceRelationId\b/i,
    /\bcoreConceptIds?\b/i,
    /\bcontains_pattern\b/i,
    /\bis_expression_of\b/i,
    /\bresonates_with\b/i,
  ].some((pattern) => pattern.test(value));
}

function getDisplayRelationNote(relation: CodexRelation, targetLabel: string) {
  const note = relation.label?.trim() ?? "";

  if (!note || isTechnicalVisibleText(note)) {
    return "";
  }

  return normalizeText(note) === normalizeText(targetLabel) ? "" : note;
}

function relationTarget(relation: CodexRelation) {
  return relation.targetId || ("target" in relation && typeof relation.target === "string" ? relation.target : "");
}

function resolveLinkedCodexEntry(value: string | null | undefined) {
  return value ? resolveCodexEntry(value) : undefined;
}

function buildCodexRoomHref(entry: CodexEntry) {
  if (!hasSymbolRoom(entry.symbolRoomSlug)) {
    return undefined;
  }

  return buildRoomHref(entry.symbolRoomSlug, {
    from: "codex",
    path: entry.type === "scripture" ? entry.id : undefined,
    symbol: entry.symbolRoomSlug,
  });
}

function isMeaningNodeId(value: string): value is MeaningNodeId {
  return meaningNodes.some((node) => node.id === value);
}

function codexTypeForOntologyEntity(entity: OntologyEntity): CodexEntryType {
  if (entity.type === "hebrew_word") return "hebrew-word";
  if (entity.type === "letter") return "hebrew-letter";
  if (entity.type === "number") return "number";
  if (entity.type === "story_anchor" || entity.type === "verse_anchor") return "scripture";
  if (entity.type === "concept" || entity.type === "meta") return "meaning";

  return "symbol";
}

function codexEntryFromOntologyEntity(entity: OntologyEntity): CodexEntry {
  return {
    id: entity.id,
    type: codexTypeForOntologyEntity(entity),
    title: entity.title,
    subtitle: entity.archetypalRole ?? null,
    hebrew: entity.hebrew ?? null,
    transliteration: entity.transliteration ?? null,
    aliases: entity.aliases,
    searchTerms: entity.tags,
    summary: entity.summary,
    meaningFields: entity.tags.filter(isMeaningNodeId),
    relations: [],
    scriptureAnchors: entity.firstMention
      ? [{
          reference: entity.firstMention.ref,
          label: entity.firstMention.ref,
          note: entity.firstMention.role,
          source: "meaning-graph",
        }]
      : [],
    symbolRoomSlug: null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["meaning-graph"],
      sourceIds: [entity.id],
      tags: entity.tags,
    },
  };
}

function getSearchParamValue(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function sanitizePathContextValue(value: string | undefined) {
  if (!value) return undefined;
  if (value === "symbolnetz" || isResolvableCodexContextId(value)) return value;

  return undefined;
}

function getCodexTitleById(id: string | undefined) {
  if (!id) return undefined;

  return resolveLinkedCodexEntry(id)?.title ?? getOntologyEntity(id)?.title;
}

function isResolvableCodexContextId(id: string | undefined) {
  return Boolean(id && getCodexTitleById(id));
}

function withPathContext(href: string, context: PathContextLink) {
  const [pathname, query = ""] = href.split("?");
  const params = new URLSearchParams(query);

  if (context.from && isResolvableCodexContextId(context.from)) {
    params.set("from", context.from);
  } else if (context.from === "symbolnetz") {
    params.set("from", "symbolnetz");
  }

  if (context.path && isResolvableCodexContextId(context.path)) {
    params.set("path", context.path);
  }

  if (context.symbol && isResolvableCodexContextId(context.symbol)) {
    params.set("symbol", context.symbol);
  }

  const serializedParams = params.toString();
  return serializedParams ? `${pathname}?${serializedParams}` : pathname;
}

function getExistingRelationText(sourceId: string, targetId: string, types?: OntologyRelation["type"][]) {
  const typeSet = types ? new Set(types) : undefined;
  const relation = sortOntologyRelations(getOntologyRelationsForEntity(sourceId))
    .find((candidate) => (
      candidate.sourceId === sourceId &&
      candidate.targetId === targetId &&
      (!typeSet || typeSet.has(candidate.type))
    ));

  return relation ? getOntologyDisplayText(relation) || relation.shortResonance : "";
}

function compactPathLabels(items: { id: string; label: string }[]) {
  const seen = new Set<string>();

  return items
    .filter((item) => item.id !== "symbolnetz")
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .map((item) => item.label);
}

function resolvePathContext({
  entry,
  params,
}: {
  entry: CodexEntry;
  params: Record<string, string | string[] | undefined>;
}): ResolvedPathContext | null {
  const from = getSearchParamValue(params, "from");
  const path = getSearchParamValue(params, "path");
  const symbol = getSearchParamValue(params, "symbol");
  const symbolLabel = getCodexTitleById(symbol);
  const fromLabel = getCodexTitleById(from);
  const pathLabel = getCodexTitleById(path);

  if (from === "symbolnetz") {
    const labels = ["Symbolnetz", ...compactPathLabels([
      ...(symbol && symbolLabel ? [{ id: symbol, label: symbolLabel }] : []),
      { id: entry.id, label: entry.title },
    ])];

    if (labels.length < 2) return null;

    return {
      labels,
      note: symbolLabel
        ? `Vom ${symbolLabel} aus oeffnet sich diese Bewegung.`
        : `Du vertiefst jetzt die Spur von ${entry.title}.`,
      returnHref: symbol ? buildSymbolNetworkReturnHref({ symbol, lens: "story", path }) : "/symbolnetz",
      returnLabel: "Zum Symbolnetz zurueckkehren",
    };
  }

  if (path && pathLabel && path !== entry.id) {
    const note = getExistingRelationText(path, entry.id, ["opens_into", "structures_journey"])
      || "Diese Bewegung sammelt sich in dieser Achse.";

    return {
      labels: [pathLabel, entry.title],
      note,
      returnHref: `/codex/${path}`,
      returnLabel: `Zurueck zur Bewegung ${pathLabel}`,
    };
  }

  if (from && fromLabel && from !== entry.id) {
    const sourceEntity = getOntologyEntity(from);
    const note = getExistingRelationText(from, entry.id, ["contains_pattern", "opens_into", "structures_journey"])
      || (sourceEntity?.domain === "pattern"
        ? "Von dieser Bewegung aus fuehrt der Weg hierher."
        : "Von hier aus oeffnet sich diese Bewegung.");
    const isPatternSource = sourceEntity?.domain === "pattern";

    return {
      labels: [fromLabel, entry.title],
      note,
      returnHref: `/codex/${from}`,
      returnLabel: isPatternSource ? `Zurueck zur Bewegung ${fromLabel}` : `Zurueck zu ${fromLabel}`,
    };
  }

  return null;
}

function resolveReflectionSourceType(entry: CodexEntry, entity?: OntologyEntity): ReflectionSourceType | null {
  if (entity?.domain === "pattern") return "pattern";
  if (entity && isCoreConceptId(entity.id)) return "core";
  if (entry.type === "journey") return "journey";
  if (entry.type === "hebrew-letter" && (entry.id === "aleph" || entry.id === "mem")) return "letter";
  if (entry.type === "symbol" && ["wasser", "licht", "feuer", "wueste"].includes(entry.id)) return "symbol";

  return null;
}

function getReflectionQuestionForEntry(sourceType: ReflectionSourceType) {
  if (sourceType === "pattern" || sourceType === "journey") {
    return "Was bewegt sich in dir auf diesem Weg?";
  }

  if (sourceType === "core") {
    return "Welche Spur fuehrt dich zu dieser Achse?";
  }

  return "Welche Frage oeffnet sich dir hier?";
}

function normalizeCodexContextFocus(value: string | undefined): CodexContextFocus {
  if (
    value === "meaning" ||
    value === "hebrew" ||
    value === "gematria" ||
    value === "story" ||
    value === "spaces"
  ) {
    return value;
  }

  return "overview";
}

function normalizeSymbolNetworkReturnLens(value: string | undefined): SymbolNetworkReturnLens | undefined {
  if (value === "meaning" || value === "hebrew" || value === "gematria" || value === "story") {
    return value;
  }

  if (value === "journey") {
    return "story";
  }

  return undefined;
}

function buildSymbolNetworkReturnHref({
  symbol,
  lens,
  path,
}: {
  symbol: string;
  lens?: SymbolNetworkReturnLens;
  path?: string;
}) {
  const params = new URLSearchParams({ symbol });

  if (lens) {
    params.set("lens", lens);
  }

  if (path) {
    params.set("path", path);
  }

  return `/symbolnetz?${params.toString()}`;
}

function sharedScriptureAnchorIds(entry: CodexEntry) {
  return new Set(
    entry.scriptureAnchors.flatMap((anchor) => [anchor.id, anchor.reference, anchor.label].filter(Boolean) as string[]),
  );
}

function getNearbyEntries(entry: CodexEntry) {
  const directRelationIds = new Set(entry.relations.map(relationTarget).filter(Boolean));
  const meaningFields = new Set(entry.meaningFields);
  const scriptureAnchors = sharedScriptureAnchorIds(entry);
  const scoredEntries = codexRegistry
    .filter((candidate) => candidate.id !== entry.id)
    .map((candidate) => {
      const directRelation = directRelationIds.has(candidate.id) || candidate.relations.some((relation) => relationTarget(relation) === entry.id);
      const sharedMeaning = candidate.meaningFields.some((field) => meaningFields.has(field));
      const candidateScriptureAnchors = sharedScriptureAnchorIds(candidate);
      const sharedScripture = Array.from(candidateScriptureAnchors).some((anchor) => scriptureAnchors.has(anchor));
      const score = (directRelation ? 3 : 0) + (sharedMeaning ? 2 : 0) + (sharedScripture ? 1 : 0);

      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title, "de-DE"));

  return scoredEntries.slice(0, 6).map(({ candidate }) => candidate);
}

function getMeaningFieldLabel(fieldId: string) {
  return meaningNodes.find((field) => field.id === fieldId)?.label ?? fieldId;
}

function getScriptureAnchorLabel(anchorId: string) {
  const linkedEntry = resolveCodexEntry(anchorId);
  return linkedEntry?.title ?? anchorId.replace(/-/g, " ");
}

function resolveOntologyEndpoint(id: string) {
  const linkedEntry = resolveLinkedCodexEntry(id);
  const ontologyEntity = getOntologyEntity(id);

  return {
    id,
    label: linkedEntry?.title ?? getOntologyEntityTitle(id),
    linkedEntry,
    href: linkedEntry ? `/codex/${linkedEntry.id}` : ontologyEntity ? `/codex/${id}` : undefined,
  };
}

function getOntologyChildEntityIds(entryId: string) {
  const registry = getOntologyRegistry();
  const childIds = new Set<string>();

  registry.entities.forEach((entity) => {
    if (entity.id !== entryId && entity.primaryHierarchyId === entryId) {
      childIds.add(entity.id);
    }
  });

  registry.relations.forEach((relation) => {
    if (relation.type === "belongs_to" && relation.targetId === entryId) {
      childIds.add(relation.sourceId);
    }
  });

  return Array.from(childIds);
}

function getOntologyResonance(entry: CodexEntry) {
  const relationsById = new Map<string, OntologyRelation>();

  getOntologyRelationsForEntity(entry.id).forEach((relation) => {
    relationsById.set(relation.id, relation);
  });

  getOntologyChildEntityIds(entry.id).forEach((childId) => {
    getOntologyRelationsForEntity(childId).forEach((relation) => {
      relationsById.set(relation.id, relation);
    });
  });

  return buildOntologyRelationItems(entry.id, sortOntologyRelations(Array.from(relationsById.values())).slice(0, 10));
}

function buildOntologyRelationItems(entryId: string, relations: OntologyRelation[]) {
  return relations.map((relation) => {
    const endpointId = relation.sourceId === entryId ? relation.targetId : relation.sourceId;

    return {
      relation,
      endpoint: resolveOntologyEndpoint(endpointId),
      label: getOntologyRelationLabel(relation.type),
      markerLabel: getOntologyRelationMarkerLabel(relation.type),
      note: getOntologyDisplayText(relation),
      explanation: shouldShowOntologyExplanation(relation.shortResonance, relation.explanation)
        ? relation.explanation
        : "",
    };
  });
}

function getPatternCarriers(entity: OntologyEntity) {
  const registry = getOntologyRegistry();

  return sortOntologyRelations(registry.relationsByTarget.get(entity.id) ?? [])
    .filter((relation) => relation.type === "contains_pattern")
    .map((relation) => ({
      relation,
      endpoint: resolveOntologyEndpoint(relation.sourceId),
    }))
    .filter(({ endpoint }) => getOntologyEntity(endpoint.id));
}

function getPatternFallbackMovement(entity: OntologyEntity): string[] {
  if (entity.movementSteps?.length) {
    return entity.movementSteps;
  }

  return [entity.polarity?.visiblePole, entity.polarity?.hiddenPole].filter(Boolean) as string[];
}

function getPatternDestinations(entity: OntologyEntity) {
  const registry = getOntologyRegistry();
  const destinationRelations = sortOntologyRelations(registry.relationsBySource.get(entity.id) ?? [])
    .filter((relation) => relation.type === "opens_into" || relation.type === "structures_journey");
  const relationDestinations = destinationRelations.map((relation) => ({
    relation,
    endpoint: resolveOntologyEndpoint(relation.targetId),
  }));
  const relationLabels = new Set(relationDestinations.map(({ endpoint }) => normalizeText(endpoint.label)));
  const textDestinations = (entity.leadsTo ?? [])
    .filter((label) => !relationLabels.has(normalizeText(label)))
    .map((label) => {
      const normalizedLabel = normalizeText(label);
      const linkedEntry =
        resolveLinkedCodexEntry(label) ??
        ontologyEntities.find((candidate) => normalizeText(candidate.title) === normalizedLabel);

      return {
        label,
        href: linkedEntry ? `/codex/${linkedEntry.id}` : undefined,
      };
    });

  return {
    relationDestinations,
    textDestinations,
  };
}

function getMovementLine(steps: string[]) {
  return steps.join(" -> ");
}

function getJourneysForEntity(entityId: string) {
  return codexRegistry
    .filter((candidate) => candidate.type === "journey")
    .filter((journey) => (
      journey.steps?.some((step) => step.codexId === entityId) ||
      journey.journeyIds.includes(entityId) ||
      journey.relations.some((relation) => relationTarget(relation) === entityId) ||
      journey.meta.sourceIds.includes(entityId)
    ));
}

function scoreJourneyForPattern(journey: CodexEntry, pattern: OntologyEntity, carrierIds: string[]) {
  const journeyIds = new Set([
    ...journey.meta.sourceIds,
    ...(journey.steps?.map((step) => step.codexId) ?? []),
    ...journey.relations.map(relationTarget),
  ]);

  return [
    ...carrierIds,
    ...pattern.tags,
    ...(pattern.leadsTo ?? []).map((label) => label.toLocaleLowerCase("de-DE")),
  ].reduce((score, value) => score + (journeyIds.has(value) || journey.meaningFields.includes(value as MeaningNodeId) ? 1 : 0), 0);
}

function getJourneysForPattern(pattern: OntologyEntity, carriers: ReturnType<typeof getPatternCarriers>) {
  const carrierIds = carriers.map(({ endpoint }) => endpoint.id);

  return codexRegistry
    .filter((candidate) => candidate.type === "journey")
    .map((journey) => ({ journey, score: scoreJourneyForPattern(journey, pattern, carrierIds) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.journey.title.localeCompare(right.journey.title, "de-DE"))
    .map(({ journey }) => journey);
}

function getJourneyExit(entry: CodexEntry) {
  const directTarget = entry.relations
    .map((relation) => relationTarget(relation))
    .map((targetId) => getOntologyEntity(targetId))
    .find((entity) => entity && isCoreConceptId(entity.id));

  if (directTarget) {
    return directTarget;
  }

  const lastStepId = entry.steps?.at(-1)?.codexId;
  const lastStepEntity = lastStepId ? getOntologyEntity(lastStepId) : undefined;

  return lastStepEntity && isCoreConceptId(lastStepEntity.id) ? lastStepEntity : undefined;
}

function getRelatedPatternsForJourney(entry: CodexEntry) {
  const stepIds = new Set(entry.steps?.map((step) => step.codexId) ?? []);
  const sourceIds = new Set(entry.meta.sourceIds);
  const patternsById = new Map<string, OntologyWayProjection>();

  for (const entityId of new Set([...stepIds, ...sourceIds])) {
    getPatternsForEntity(entityId).forEach((pattern) => patternsById.set(pattern.id, pattern));
  }

  return Array.from(patternsById.values()).slice(0, 3);
}

function getSymbolWayRelationIds(entryId: string) {
  return getPatternsForEntity(entryId).flatMap((pattern) => pattern.carrierRelationIds);
}

function getPatternResonance(entry: CodexEntry, excludedRelationIds: Set<string>) {
  return getOntologyResonance(entry).filter(({ relation }) => !excludedRelationIds.has(relation.id));
}

function getLetterResonance(entry: CodexEntry) {
  if (entry.type !== "hebrew-letter") {
    return null;
  }

  const letter = hebrewLetters.find((candidate) => candidate.id === entry.id);

  if (!letter) {
    return null;
  }

  const relationTargets = new Set(entry.relations.map(relationTarget).filter(Boolean));
  const words = hebrewWords.filter((word) => letter.relatedWordIds.includes(word.id) || relationTargets.has(word.id));
  const symbolRelations = entry.relations.filter((relation) => relation.type === "symbolizes");
  const essence = entry.summary || letter.symbolism[0]?.description || letter.archetypalMeanings.join(", ");

  return {
    letter,
    glyph: entry.hebrew ?? letter.glyph,
    transliteration: entry.transliteration ?? letter.transcription,
    numericValue: letter.numericValue,
    words,
    symbolRelations,
    essence,
  };
}

function getNumberValue(entry: CodexEntry) {
  return entry.title.match(/\d+/)?.[0] ?? entry.id.replace("zahl-", "");
}

function getNumberResonance(entry: CodexEntry) {
  if (entry.type !== "number") {
    return null;
  }

  const relationItems = entry.relations
    .map((relation, index) => {
      const target = relationTarget(relation);
      const linkedEntry = resolveLinkedCodexEntry(target);

      return {
        id: `${relation.type}-${target}-${index}`,
        relation,
        target,
        linkedEntry,
      };
    })
    .filter(({ target }) => Boolean(target));

  return {
    value: getNumberValue(entry),
    letters: relationItems.filter(({ relation, linkedEntry }) => (
      relation.type === "contains-letter" || linkedEntry?.type === "hebrew-letter"
    )),
    words: relationItems.filter(({ relation, linkedEntry }) => (
      relation.type === "has-hebrew-word" || linkedEntry?.type === "hebrew-word"
    )),
    symbols: relationItems.filter(({ relation, linkedEntry }) => (
      relation.type !== "contains-letter" &&
      relation.type !== "has-hebrew-word" &&
      relation.type !== "anchors-scripture" &&
      linkedEntry?.type !== "scripture"
    )),
    essence: entry.summary,
  };
}

type NumberResonanceItem = NonNullable<ReturnType<typeof getNumberResonance>>["letters"][number];

function resolveTargetLabel(target: string) {
  return resolveLinkedCodexEntry(target)?.title
    ?? hebrewWords.find((word) => word.id === target)?.transliteration
    ?? getOntologyEntityTitle(target)
    ?? humanizeId(target);
}

function getMeaningResonance(entry: CodexEntry) {
  if (entry.type !== "meaning") {
    return null;
  }

  const relationItems = entry.relations
    .map((relation, index) => {
      const target = relationTarget(relation);
      const linkedEntry = resolveLinkedCodexEntry(target);
      const hebrewWord = hebrewWords.find((word) => word.id === target);

      return {
        id: `${relation.type}-${target}-${index}`,
        relation,
        target,
        linkedEntry,
        hebrewWord,
        label: linkedEntry?.title ?? hebrewWord?.transliteration ?? resolveTargetLabel(target),
      };
    })
    .filter(({ target }) => Boolean(target));

  const scriptureTargetIds = new Set(entry.scriptureAnchors.map((anchor) => anchor.id).filter(Boolean));

  return {
    essence: entry.summary,
    symbols: relationItems.filter(({ linkedEntry }) => linkedEntry?.type === "symbol"),
    scripture: [
      ...entry.scriptureAnchors.map((anchor, index) => ({
        id: `${anchor.reference}-${index}`,
        target: anchor.id,
        label: anchor.label ?? anchor.reference,
        note: anchor.note,
      })),
      ...relationItems
        .filter(({ linkedEntry, target }) => linkedEntry?.type === "scripture" && !scriptureTargetIds.has(target))
        .map(({ id, target, label, relation }) => ({ id, target, label, note: relation.label })),
    ],
    hebrewNodes: relationItems.filter(({ relation, linkedEntry, hebrewWord }) => (
      Boolean(hebrewWord) ||
      relation.type === "has-hebrew-word" ||
      relation.type === "contains-letter" ||
      linkedEntry?.type === "hebrew-letter" ||
      linkedEntry?.type === "number"
    )),
    onward: relationItems.filter(({ relation, linkedEntry }) => (
      relation.type === "continues-journey" ||
      relation.type === "transforms" ||
      linkedEntry?.type === "meaning" ||
      linkedEntry?.type === "meaning-field"
    )),
  };
}

type MeaningResonanceItem = NonNullable<ReturnType<typeof getMeaningResonance>>["symbols"][number];

function getSymbolicTrail(entry: CodexEntry) {
  const relationItems = entry.relations
    .map((relation, index) => {
      const target = relationTarget(relation);
      const linkedEntry = resolveLinkedCodexEntry(target);

      return {
        id: `${relation.type}-${target}-${index}`,
        relation,
        target,
        linkedEntry,
      };
    })
    .filter(({ target }) => Boolean(target));

  return {
    fields: entry.meaningFields,
    arising: relationItems.filter(({ relation }) => relation.type !== "continues-journey"),
    onward: relationItems.filter(({ relation }) => relation.type === "continues-journey"),
  };
}

function DetailSection({
  title,
  children,
  activeContext,
}: {
  title: string;
  children: React.ReactNode;
  activeContext?: CodexContextFocus;
}) {
  return (
    <section
      data-active-context={activeContext}
      className={`border bg-white/[0.025] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-7 ${
        activeContext
          ? "border-gold/35 shadow-[0_24px_80px_rgba(189,160,109,0.12)]"
          : "border-white/[0.075]"
      }`}
    >
      <h2 className="symbol-kicker text-cyan-soft">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function PathContextCard({ context }: { context: ResolvedPathContext | null }) {
  if (!context) {
    return null;
  }

  return (
    <section className="mt-8 max-w-3xl border border-gold/[0.16] bg-gold/[0.035] px-4 py-4 backdrop-blur-md sm:px-5">
      <p className="symbol-kicker text-cyan-soft">Pfadspur</p>
      <p className="mt-3 flex flex-wrap items-center gap-2 font-serif text-xl italic leading-snug text-foreground-strong sm:text-2xl">
        {context.labels.map((label, index) => (
          <span key={`${label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? <span className="text-gold/45" aria-hidden="true">-&gt;</span> : null}
            <span>{label}</span>
          </span>
        ))}
      </p>
      <p className="symbol-copy mt-2 text-sm italic text-muted-soft sm:text-base">{context.note}</p>
      <Link
        href={context.returnHref}
        className="mt-4 inline-flex border border-gold/20 bg-black/[0.12] px-3 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-gold/80 transition-colors duration-500 hover:border-gold/35 hover:text-gold"
      >
        {context.returnLabel}
      </Link>
    </section>
  );
}

function SymbolAnchorReturnCard({ entryId }: { entryId: string }) {
  const bridge = getSymbolCodexAnchorBridge("wasser", entryId) ?? getSymbolCodexAnchorBridge("licht", entryId);

  if (!bridge || entryId === bridge.symbolId) {
    return null;
  }

  return (
    <section className="mt-8 max-w-3xl border border-cyan-soft/[0.14] bg-cyan-soft/[0.025] px-4 py-4 backdrop-blur-md sm:px-5">
      <p className="symbol-kicker text-cyan-soft">{bridge.contextLabel}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={bridge.returnHref}
          className="border border-gold/20 bg-black/[0.12] px-3 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-gold/80 transition-colors duration-500 hover:border-gold/35 hover:text-gold"
        >
          {bridge.returnLabel}
        </Link>
        <Link
          href={bridge.roomHref}
          className="border border-cyan-soft/20 bg-black/[0.12] px-3 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-cyan-soft/80 transition-colors duration-500 hover:border-cyan-soft/35 hover:text-cyan-soft"
        >
          {bridge.symbolId === "licht" ? bridge.roomLabel : bridge.roomTraceLabel}
        </Link>
        {bridge.personalPathHref && bridge.personalPathLabel ? (
          <Link
            href={bridge.personalPathHref}
            className="border border-white/[0.08] bg-black/[0.1] px-3 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-muted-soft transition-colors duration-500 hover:border-gold/20 hover:text-gold/85"
          >
            {bridge.personalPathLabel}
          </Link>
        ) : null}
        {bridge.symbolNetworkHref && bridge.symbolNetworkLabel ? (
          <Link
            href={bridge.symbolNetworkHref}
            className="border border-white/[0.08] bg-black/[0.1] px-3 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-muted-soft transition-colors duration-500 hover:border-cyan-soft/25 hover:text-cyan-soft/85"
          >
            {bridge.symbolNetworkLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

const WATER_CODEX_ESSENCE =
  "Wasser steht im SYMBOLRAUM fuer Tiefe, Ursprung, Reinigung und Uebergang. Es erscheint vor der Ordnung und traegt das Leben, bevor es sichtbar wird.";

const WATER_CODEX_MOVEMENT = [
  { label: "Tiefe", text: "Wasser bewahrt das Verborgene unter dem Sichtbaren." },
  { label: "Ursprung", text: "Aus der Tiefe tritt Leben hervor, bevor es eine feste Gestalt hat." },
  { label: "Reinigung", text: "Wasser loest, klaert und laesst einen neuen Anfang moeglich werden." },
  { label: "Uebergang", text: "Es markiert die Schwelle zwischen altem Zustand und neuem Weg." },
  { label: "Leben", text: "Was in der Tiefe beginnt, wird zur Quelle und traegt Frucht." },
];

const WATER_SCRIPTURE_TRACE = [
  {
    id: "genesis-1-2",
    reference: "Genesis 1,2",
    title: "Wasser vor der Ordnung",
    note: "Die Wasser stehen am Anfang als Tiefe, ueber der Geist und Moeglichkeit schweben.",
  },
  {
    id: "exodus-14",
    reference: "Exodus 14",
    title: "Wasser als Uebergang",
    note: "Das Meer wird nicht ausgelassen, sondern zur Schwelle der Befreiung.",
  },
  {
    id: "john-4-14",
    reference: "Johannes 4",
    title: "Lebendiges Wasser",
    note: "Wasser wird zur inneren Quelle, die Durst in Leben verwandelt.",
  },
];

function WaterCodexReferenceSection() {
  const waterBridge = getSymbolPathConfig("wasser");
  const waterChipLinks = getWaterCodexChipLinks();
  const waterRoomHref = buildRoomHref(waterBridge?.symbolId ?? "wasser", { from: "codex", symbol: waterBridge?.symbolId ?? "wasser" });
  const journeyHref = "/symbolnetz?symbol=wasser&lens=story&path=journey-wasser-wueste-brot";

  return (
    <DetailSection title="Kuratierte Mitte">
      <div className="grid gap-8">
        <section>
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Essenz</p>
          <p className="symbol-copy mt-3 max-w-3xl font-serif text-2xl italic leading-relaxed text-foreground-strong">
            {WATER_CODEX_ESSENCE}
          </p>
        </section>

        <section className="border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Symbolische Bewegung</p>
          <ol className="mt-4 grid gap-3">
            {WATER_CODEX_MOVEMENT.map((station, index) => (
              <li key={station.label} className="grid gap-2 border border-white/[0.06] bg-black/[0.1] p-4 sm:grid-cols-[auto_1fr] sm:items-start">
                <span className="font-serif text-xl italic text-gold/80">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong className="block font-serif text-2xl italic text-foreground-strong">{station.label}</strong>
                  <span className="symbol-copy mt-2 block text-sm italic text-muted-soft">{station.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {waterChipLinks.meaningFields.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bedeutungsfelder</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {waterChipLinks.meaningFields.map((field) => (
                <Link
                  key={field.id}
                  href={field.href}
                  className="border border-gold/15 bg-gold/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold/80 transition-colors duration-500 hover:border-gold/30 hover:bg-gold/[0.075] hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
                >
                  {field.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {waterChipLinks.scriptureAnchors.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bibelstellen</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {waterChipLinks.scriptureAnchors.map((anchor) => (
                <Link
                  key={anchor.id}
                  href={anchor.href}
                  className="border border-cyan-soft/15 bg-cyan-soft/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-soft/85 transition-colors duration-500 hover:border-cyan-soft/30 hover:text-cyan-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-soft/20"
                >
                  {anchor.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 border-t border-white/[0.06] pt-6 md:grid-cols-2">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebraeischer Koerper</p>
            <p className="mt-4 font-serif text-5xl leading-none text-gold/85" lang="he" dir="rtl">{"\u05de\u05d9\u05dd"}</p>
            <p className="mt-3 text-[0.62rem] uppercase tracking-[0.22em] text-gold/65">majim / Mem - Jod - Mem</p>
            <p className="symbol-copy mt-4 text-base italic text-muted-soft">
              Das Wort beginnt und endet mit Mem. In der Mitte steht Jod: ein Ursprungspunkt in der Tiefe.
            </p>
          </div>
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zahl</p>
            <p className="mt-4 font-serif text-3xl italic text-foreground-strong">{"\u05de\u05d9\u05dd"} = 40 + 10 + 40 = 90</p>
            <p className="symbol-copy mt-4 text-base italic text-muted-soft">
              Die Zahl 90 sammelt die Bewegung von Tiefe - Punkt - Tiefe.
            </p>
          </div>
        </section>

        <section className="border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Biblische Spur</p>
          <div className="mt-4 grid gap-3">
            {WATER_SCRIPTURE_TRACE.map((anchor) => {
              const href = resolveScriptureAnchorHref(anchor.id, "wasser");
              const title = `${anchor.reference} - ${anchor.title}`;

              return (
                <article key={anchor.id} className="border border-white/[0.06] bg-black/[0.1] p-4">
                  <Link href={href} className="font-serif text-xl italic text-foreground-strong transition-colors duration-500 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20">
                    {title}
                  </Link>
                  <p className="symbol-copy mt-3 text-sm italic text-muted-soft">{anchor.note}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Weitergehen</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={waterRoomHref} className="symbol-cta">{waterBridge?.ctaLabels.room ?? "Den Wasserraum betreten"}</Link>
            <Link href={journeyHref} className="symbol-cta symbol-cta-secondary">Erzaehlspur Wasser - Wueste - Brot ansehen</Link>
            <a href="#spur-aufnehmen" className="symbol-cta symbol-cta-secondary">Diese Spur bewahren</a>
          </div>
        </section>
      </div>
    </DetailSection>
  );
}

const LIGHT_CODEX_ESSENCE =
  "Licht ist nicht nur Helligkeit. Es ist das erste Sichtbarwerden von Ordnung: ein Ruf, durch den Kontur, Richtung und Erkenntnis hervortreten.";

const LIGHT_CODEX_MOVEMENT = [
  { label: "Finsternis", text: "Noch ist Wirklichkeit da, aber sie ist nicht lesbar." },
  { label: "Ruf", text: "Das Wort oeffnet einen ersten Spalt von Richtung." },
  { label: "Licht", text: "Was verborgen war, tritt in Sichtbarkeit." },
  { label: "Scheidung", text: "Licht macht Unterscheidung moeglich, ohne die Tiefe zu verwerfen." },
  { label: "Ordnung", text: "Konturen werden zu einer tragenden Gestalt." },
  { label: "Erkenntnis", text: "Sichtbarkeit wird innerlich wahrgenommen und deutbar." },
];

function LightCodexReferenceSection() {
  const lightBridge = getSymbolPathConfig("licht");
  const lightChipLinks = getSymbolCodexChipLinks("licht");
  const lightRoomHref = buildRoomHref(lightBridge?.symbolId ?? "licht", { from: "codex", symbol: lightBridge?.symbolId ?? "licht" });

  return (
    <DetailSection title="Kuratierte Mitte">
      <div className="grid gap-8">
        <section>
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Essenz</p>
          <p className="symbol-copy mt-3 max-w-3xl font-serif text-2xl italic leading-relaxed text-foreground-strong">
            {LIGHT_CODEX_ESSENCE}
          </p>
        </section>

        <section className="border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bewegungsfolge</p>
          <ol className="mt-4 grid gap-3">
            {LIGHT_CODEX_MOVEMENT.map((station, index) => (
              <li key={station.label} className="grid gap-2 border border-white/[0.06] bg-black/[0.1] p-4 sm:grid-cols-[auto_1fr] sm:items-start">
                <span className="font-serif text-xl italic text-gold/80">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong className="block font-serif text-2xl italic text-foreground-strong">{station.label}</strong>
                  <span className="symbol-copy mt-2 block text-sm italic text-muted-soft">{station.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-5 border-t border-white/[0.06] pt-6 md:grid-cols-2">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebraeischer Koerper</p>
            <p className="mt-4 font-serif text-5xl leading-none text-gold/85" lang="he" dir="rtl">{"\u05d0\u05d5\u05e8"}</p>
            <p className="mt-3 text-[0.62rem] uppercase tracking-[0.22em] text-gold/65">Or / Aleph - Waw - Resch</p>
            <p className="symbol-copy mt-4 text-base italic text-muted-soft">
              Or traegt den stillen Anfang des Aleph, eine verbindende Mitte und das Hervortreten in Sichtbarkeit.
            </p>
          </div>
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zahl / Symbolik</p>
            <p className="mt-4 font-serif text-3xl italic text-foreground-strong">{"\u05d0\u05d5\u05e8"} = 1 + 6 + 200 = 207</p>
            <p className="symbol-copy mt-4 text-base italic text-muted-soft">
              Die Zahl bleibt hier eine Resonanzspur: Anfang, Verbindung und sichtbarer Durchbruch.
            </p>
          </div>
        </section>

        {lightChipLinks.meaningFields.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bedeutungsfelder</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {lightChipLinks.meaningFields.map((field) => (
                <Link
                  key={field.id}
                  href={field.href}
                  className="border border-gold/15 bg-gold/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold/80 transition-colors duration-500 hover:border-gold/30 hover:bg-gold/[0.075] hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
                >
                  {field.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {lightChipLinks.scriptureAnchors.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bibelanker</p>
            <div className="mt-4 grid gap-3">
              {lightChipLinks.scriptureAnchors.map((anchor) => (
                <article key={anchor.id} className="border border-white/[0.06] bg-black/[0.1] p-4">
                  <Link
                    href={anchor.href}
                    className="font-serif text-xl italic text-foreground-strong transition-colors duration-500 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
                  >
                    {anchor.label} - Es werde Licht
                  </Link>
                  <p className="symbol-copy mt-3 text-sm italic text-muted-soft">
                    In Genesis 1,3 wird Licht gerufen: nicht als Dekoration der Welt, sondern als erstes Sichtbarwerden von Ordnung.
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Weitergehen</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={lightRoomHref} className="symbol-cta">{lightBridge?.ctaLabels.room ?? "Den Lichtraum betreten"}</Link>
            <Link href={lightBridge?.symbolNetworkHref ?? "/symbolnetz?symbol=licht"} className="symbol-cta symbol-cta-secondary">
              Licht im Symbolnetz ansehen
            </Link>
          </div>
        </section>
      </div>
    </DetailSection>
  );
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-t border-white/[0.06] py-4 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">{label}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-foreground-strong sm:text-base">{value}</dd>
    </div>
  );
}

function VisibleHiddenSection({
  entity,
  activeContext,
}: {
  entity: OntologyEntity;
  activeContext?: CodexContextFocus;
}) {
  if (!entity.visibleHidden) {
    return null;
  }

  return (
    <DetailSection title="Sichtbar / Verborgen" activeContext={activeContext}>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="border border-white/[0.06] bg-black/[0.1] p-4">
          <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Sichtbar</dt>
          <dd className="mt-3 font-serif text-xl italic text-foreground-strong">{entity.visibleHidden.visible}</dd>
        </div>
        <div className="border border-gold/15 bg-gold/[0.035] p-4">
          <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-gold/70">Verborgen</dt>
          <dd className="mt-3 font-serif text-xl italic text-gold/85">{entity.visibleHidden.hidden}</dd>
        </div>
      </dl>
    </DetailSection>
  );
}

export function generateStaticParams() {
  return Array.from(new Set([
    ...codexEntryIds,
    ...ontologyEntities.map((entity) => entity.id),
  ])).map((id) => ({ id }));
}

export async function generateMetadata({ params }: CodexDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const codexEntry = resolveCodexEntry(id);
  const ontologyEntity = codexEntry ? undefined : getOntologyEntity(id);
  const entry = codexEntry ?? (ontologyEntity ? codexEntryFromOntologyEntity(ontologyEntity) : undefined);

  if (!entry) {
    return {
      title: "Codex",
    };
  }

  return {
    title: `${entry.title} | Codex`,
    description: entry.summary,
  };
}

export default async function CodexDetailPage({ params, searchParams }: CodexDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const from = getSearchParamValue(resolvedSearchParams, "from");
  const isFromSymbolNetwork = from === "symbolnetz";
  const activeFocus = isFromSymbolNetwork
    ? normalizeCodexContextFocus(getSearchParamValue(resolvedSearchParams, "focus"))
    : null;
  const activePathId = isFromSymbolNetwork ? getSearchParamValue(resolvedSearchParams, "path") : undefined;
  const activeResonanceJourney = activePathId ? getResonanceJourney(activePathId) : undefined;
  const activePathLabel = activeResonanceJourney?.title;
  const codexEntry = resolveCodexEntry(id);
  const ontologyRouteEntity = codexEntry ? undefined : getOntologyEntity(id);
  const entry = codexEntry ?? (ontologyRouteEntity ? codexEntryFromOntologyEntity(ontologyRouteEntity) : undefined);

  if (!entry) {
    notFound();
  }

  const ontologyEntity = getOntologyEntity(entry.id);
  const isWaterEntry = entry.id === "wasser";
  const isLightEntry = entry.id === "licht";
  const isPatternEntity = ontologyEntity?.domain === "pattern";
  const isCoreConceptEntity = ontologyEntity ? isCoreConceptId(ontologyEntity.id) : false;
  const codexRoomHref = buildCodexRoomHref(entry);
  const codexRoomLabel = hasSymbolRoom(entry.symbolRoomSlug) ? getOntologyEntityTitle(entry.symbolRoomSlug) : undefined;
  const pathContext = resolvePathContext({ entry, params: resolvedSearchParams });
  const reflectionSourceType = resolveReflectionSourceType(entry, ontologyEntity);
  const reflectionPathContext = {
    from: sanitizePathContextValue(getSearchParamValue(resolvedSearchParams, "from")),
    path: sanitizePathContextValue(getSearchParamValue(resolvedSearchParams, "path")),
    symbol: sanitizePathContextValue(getSearchParamValue(resolvedSearchParams, "symbol")),
  };
  const reflectionPathContextHasValue = Object.values(reflectionPathContext).some(Boolean);
  const symbolWayRelationIds = !isPatternEntity && !isCoreConceptEntity ? new Set(getSymbolWayRelationIds(entry.id)) : new Set<string>();
  const symbolNetworkReturnLens =
    normalizeSymbolNetworkReturnLens(getSearchParamValue(resolvedSearchParams, "lens"))
    ?? normalizeSymbolNetworkReturnLens(activeFocus ?? undefined);
  const symbolNetworkReturnHref = buildSymbolNetworkReturnHref({
    symbol: getSearchParamValue(resolvedSearchParams, "symbol") ?? entry.id,
    lens: activeResonanceJourney ? "story" : symbolNetworkReturnLens,
    path: activeResonanceJourney?.id,
  });

  return (
    <main className="symbol-page symbol-section relative min-h-screen overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_8%,rgba(189,160,109,0.12),transparent_30%),radial-gradient(ellipse_at_82%_20%,rgba(127,184,201,0.05),transparent_28%),linear-gradient(180deg,rgba(2,5,12,0.16),rgba(2,5,12,0.82)_52%,rgba(2,5,12,0.96))]" />
        <div className="absolute inset-x-[8%] top-[24rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/codex"
            className="symbol-kicker inline-flex text-gold/70 transition-colors duration-500 hover:text-gold"
          >
            Zurueck zum Codex
          </Link>
          {isFromSymbolNetwork ? (
            <Link
              href={symbolNetworkReturnHref}
              className="symbol-kicker inline-flex border-l border-gold/25 pl-4 text-gold/80 transition-colors duration-500 hover:text-gold"
            >
              Aus dem Symbolnetz
            </Link>
          ) : null}
        </div>

        {isFromSymbolNetwork && activePathLabel ? (
          <p className="mt-5 max-w-2xl border-l border-gold/35 pl-4 text-[0.62rem] uppercase tracking-[0.22em] text-gold/70">
            Resonanzpfad: {activePathLabel}
          </p>
        ) : null}

        <header className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="symbol-kicker text-cyan-soft">
              {isPatternEntity ? "Bewegungsmuster" : isCoreConceptEntity ? "Bedeutungsachse" : formatType(entry.type)}
            </p>
            <h1 className="mt-6 font-serif text-5xl italic leading-[0.98] text-foreground-strong md:text-7xl">
              {entry.title}
            </h1>
            {entry.subtitle ? (
              <p className="symbol-copy mt-6 max-w-3xl text-2xl italic text-gold/80 md:text-3xl">
                {entry.subtitle}
              </p>
            ) : null}
            <p className="symbol-copy mt-7 max-w-3xl text-lg md:text-xl">{isWaterEntry ? WATER_CODEX_ESSENCE : entry.summary}</p>
          </div>

          {entry.hebrew ? (
            <div
              data-active-context={activeFocus === "hebrew" ? "hebrew" : undefined}
              className={`border bg-white/[0.025] px-8 py-7 text-left backdrop-blur-md lg:min-w-64 ${
                activeFocus === "hebrew"
                  ? "border-gold/35 shadow-[0_20px_70px_rgba(189,160,109,0.12)]"
                  : "border-white/[0.075]"
              }`}
            >
              <p className="font-serif text-6xl leading-none text-gold/85" lang="he" dir="rtl">
                {entry.hebrew}
              </p>
              {entry.transliteration ? (
                <p className="mt-5 text-[0.62rem] uppercase tracking-[0.26em] text-gold/65">
                  {entry.transliteration}
                </p>
              ) : null}
            </div>
          ) : null}
        </header>

        <PathContextCard context={pathContext} />
        <SymbolAnchorReturnCard entryId={entry.id} />

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-5">
            {isWaterEntry ? <WaterCodexReferenceSection /> : null}
            {isLightEntry ? <LightCodexReferenceSection /> : null}
            {!isWaterEntry ? <JourneyStepsSection entry={entry} activeContext={activeFocus === "story" ? "story" : undefined} /> : null}
            {isPatternEntity ? (
              <PatternCodexSection
                entity={ontologyEntity}
                entry={entry}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}
            {!isPatternEntity && isCoreConceptEntity && ontologyEntity ? (
              <CoreConceptCodexSection
                entity={ontologyEntity}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}

            {!isWaterEntry && !isPatternEntity && !isCoreConceptEntity && ontologyEntity?.visibleHidden ? (
              <VisibleHiddenSection
                entity={ontologyEntity}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}

            {!isWaterEntry && !isPatternEntity && !isCoreConceptEntity ? (
              <WaysBeginningSection
                entry={entry}
                activeContext={activeFocus === "story" ? "story" : undefined}
              />
            ) : null}

            {!isWaterEntry && !isLightEntry && !isPatternEntity && !isCoreConceptEntity && entry.meaningFields.length > 0 ? (
              <DetailSection title="Bedeutungsfelder" activeContext={activeFocus === "meaning" ? "meaning" : undefined}>
                <div className="flex flex-wrap gap-2">
                  {entry.meaningFields.map((field) => {
                    const linkedEntry = resolveLinkedCodexEntry(field);
                    const className =
                      "border border-gold/15 bg-gold/[0.045] px-3 py-2 text-xs tracking-[0.18em] text-gold/80 transition-colors duration-500";
                    const label = getMeaningFieldLabel(field);

                    return linkedEntry ? (
                      <Link
                        key={field}
                        href={`/codex/${linkedEntry.id}`}
                        className={`${className} hover:border-gold/30 hover:bg-gold/[0.075] hover:text-gold`}
                      >
                        {label}
                      </Link>
                    ) : (
                      <span key={field} className={className}>
                        {label}
                      </span>
                    );
                  })}
                </div>
              </DetailSection>
            ) : null}

            {!isWaterEntry && !isPatternEntity && !isCoreConceptEntity ? (
              <OntologyMetadataSection
                entity={ontologyEntity}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}
            {!isWaterEntry && !isPatternEntity && !isCoreConceptEntity ? (
              <MeaningResonanceSection entry={entry} activeContext={activeFocus === "meaning" ? "meaning" : undefined} />
            ) : null}
            {!isWaterEntry && !isPatternEntity && !isCoreConceptEntity ? (
              <OntologyResonanceSection
                entry={entry}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
                excludedRelationIds={symbolWayRelationIds}
              />
            ) : null}
            {!isWaterEntry ? <LetterResonanceSection entry={entry} activeContext={activeFocus === "hebrew" ? "hebrew" : undefined} /> : null}
            {!isWaterEntry ? <NumberResonanceSection entry={entry} activeContext={activeFocus === "gematria" ? "gematria" : undefined} /> : null}
            {!isWaterEntry ? <SymbolicTrailSection entry={entry} activeContext={activeFocus === "story" ? "story" : undefined} /> : null}
            {!isWaterEntry && !isCoreConceptEntity ? (
              <RelationsSection entry={entry} activeContext={activeFocus === "spaces" ? "spaces" : undefined} />
            ) : null}
            {!isWaterEntry && !isLightEntry ? <ScriptureAnchorsSection entry={entry} activeContext={activeFocus === "story" ? "story" : undefined} /> : null}
            {reflectionSourceType ? (
              <div id="spur-aufnehmen">
              <CodexReflectionCard
                title={entry.title}
                hebrew={entry.hebrew}
                question={getReflectionQuestionForEntry(reflectionSourceType)}
                sourceType={reflectionSourceType}
                sourceId={entry.id}
                codexHref={`/codex/${entry.id}`}
                roomHref={codexRoomHref}
                pathLabel={pathContext?.labels.join(" -> ")}
                pathContext={reflectionPathContextHasValue ? reflectionPathContext : undefined}
              />
              </div>
            ) : null}
          </div>

          <aside className="grid content-start gap-5">
            <DetailSection title="Einordnung">
              <dl>
                <FieldRow label="Typ" value={isPatternEntity ? "Bewegungsmuster" : isCoreConceptEntity ? "Bedeutungsachse" : formatType(entry.type)} />
                {codexRoomHref && codexRoomLabel ? (
                  <FieldRow
                    label="Symbolraum"
                    value={
                      <Link
                        href={codexRoomHref}
                        className="font-serif italic text-gold/85 transition-colors duration-500 hover:text-gold"
                      >
                        {codexRoomLabel}-Raum betreten
                      </Link>
                    }
                  />
                ) : null}
                {entry.journeyIds.length > 0 ? (
                  <FieldRow label="Pfadbezug" value="Kuratiert" />
                ) : null}
              </dl>
            </DetailSection>

            {!isWaterEntry && !isCoreConceptEntity ? <NearbyEntriesSection entry={entry} /> : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function OntologyMetadataSection({
  entity,
  activeContext,
}: {
  entity?: OntologyEntity;
  activeContext?: CodexContextFocus;
}) {
  if (!entity) {
    return null;
  }

  const hasPrimaryValues =
    Boolean(entity.hebrew) ||
    Boolean(entity.transliteration) ||
    entity.gematria !== undefined ||
    Boolean(entity.archetypalRole) ||
    Boolean(entity.firstMention) ||
    Boolean(entity.polarity) ||
    Boolean(entity.imageSymbol) ||
    Boolean(entity.aliases?.length);

  if (!hasPrimaryValues) {
    return null;
  }

  return (
    <DetailSection title="Symbolische Identitaet" activeContext={activeContext}>
      <div className="grid gap-6">
        {entity.hebrew || entity.transliteration || entity.gematria !== undefined ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            {entity.hebrew ? (
              <div className="border border-gold/15 bg-gold/[0.035] p-4">
                <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebraeisch</dt>
                <dd className="mt-3 font-serif text-4xl leading-none text-gold/90" lang="he" dir="rtl">
                  {entity.hebrew}
                </dd>
              </div>
            ) : null}
            {entity.transliteration ? (
              <div className="border border-white/[0.06] bg-black/[0.12] p-4">
                <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Umschrift</dt>
                <dd className="mt-3 text-sm uppercase tracking-[0.18em] text-foreground-strong">
                  {entity.transliteration}
                </dd>
              </div>
            ) : null}
            {entity.gematria !== undefined ? (
              <div className="border border-white/[0.06] bg-black/[0.12] p-4">
                <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zahlkoerper</dt>
                <dd className="mt-3 font-serif text-4xl italic leading-none text-gold/85">
                  {entity.gematria}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <dl className="divide-y divide-white/[0.06]">
          {entity.archetypalRole ? (
            <FieldRow label="Archetypische Rolle" value={entity.archetypalRole} />
          ) : null}
          {entity.firstMention ? (
            <FieldRow
              label="Erste Erwaehnung"
              value={
                <span>
                  <span className="font-serif italic text-gold/85">{entity.firstMention.ref}</span>
                  <span className="text-muted-soft"> - {entity.firstMention.role}</span>
                </span>
              }
            />
          ) : null}
          {entity.polarity ? (
            <FieldRow
              label="Innere Spannung"
              value={
                <span>
                  <span className="font-serif italic text-foreground-strong">{entity.polarity.axis}</span>
                  {entity.polarity.visiblePole || entity.polarity.hiddenPole ? (
                    <span className="mt-2 block text-sm text-muted-soft">
                      {[entity.polarity.visiblePole, entity.polarity.hiddenPole].filter(Boolean).join(" / ")}
                    </span>
                  ) : null}
                  {entity.polarity.note ? (
                    <span className="mt-2 block text-sm italic text-muted-soft">{entity.polarity.note}</span>
                  ) : null}
                </span>
              }
            />
          ) : null}
          {entity.imageSymbol ? <FieldRow label="Bildsymbol" value={entity.imageSymbol} /> : null}
          {entity.aliases?.length ? (
            <FieldRow
              label="Weitere Namen"
              value={
                <span className="flex flex-wrap gap-2">
                  {entity.aliases.map((alias) => (
                    <span
                      key={alias}
                      className="border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted-soft"
                    >
                      {alias}
                    </span>
                  ))}
                </span>
              }
            />
          ) : null}
        </dl>
      </div>
    </DetailSection>
  );
}

function JourneyStepsSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  if (!entry.steps?.length) {
    return null;
  }

  const entryStep = entry.steps[0];
  const exitCore = getJourneyExit(entry);
  const relatedPatterns = getRelatedPatternsForJourney(entry);

  return (
    <DetailSection title="Weg" activeContext={activeContext}>
      {entryStep ? (
        <div className="mb-5 border border-gold/15 bg-gold/[0.035] px-4 py-4">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Eintritt</p>
          <p className="mt-3 font-serif text-2xl italic text-foreground-strong">{entryStep.label}</p>
          {entryStep.description ? <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{entryStep.description}</p> : null}
        </div>
      ) : null}

      <div className="mb-5 border border-white/[0.065] bg-black/10 px-4 py-4">
        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Stationen</p>
        <ol className="mt-3 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          {entry.steps.map((step, index) => (
            <li key={`trail-${step.id}`} className="flex items-center gap-2">
              <span className="font-serif text-lg italic text-foreground-strong">{step.label}</span>
              {index < entry.steps!.length - 1 ? (
                <span className="text-gold/55" aria-hidden="true">
                  <span className="sm:hidden">&darr;</span>
                  <span className="hidden sm:inline">-&gt;</span>
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <ol className="grid gap-4">
        {entry.steps.map((step, index) => {
          const linkedEntry = resolveLinkedCodexEntry(step.codexId);

          return (
            <li key={step.id} className="grid gap-3">
              <div className="grid gap-3 border border-white/[0.065] bg-black/10 p-4 sm:grid-cols-[auto_1fr]">
                <span className="flex h-9 w-9 items-center justify-center border border-gold/20 font-serif text-lg text-gold/85">{index + 1}</span>
                <div>
                  {linkedEntry ? (
                    <Link
                      href={withPathContext(`/codex/${linkedEntry.id}`, { from: entry.id })}
                      className="font-serif text-xl italic text-foreground-strong transition-colors duration-500 hover:text-gold"
                    >
                      {step.label}
                    </Link>
                  ) : (
                    <p className="font-serif text-xl italic text-foreground-strong">{step.label}</p>
                  )}
                  {step.description ? <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{step.description}</p> : null}
                  {linkedEntry ? (
                    <p className="mt-3 text-[0.58rem] tracking-[0.24em] text-gold/60">{linkedEntry.title}</p>
                  ) : null}
                  {linkedEntry && hasSymbolRoom(linkedEntry.symbolRoomSlug) ? (
                    <Link
                      href={buildRoomHref(linkedEntry.symbolRoomSlug, { path: entry.id, symbol: linkedEntry.symbolRoomSlug })}
                      className="mt-3 inline-flex text-[0.58rem] uppercase tracking-[0.2em] text-cyan-soft/75 transition-colors duration-500 hover:text-cyan-soft"
                    >
                      {getOntologyEntityTitle(linkedEntry.symbolRoomSlug)}-Raum betreten
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Bridge between this step and the next, if found */}
              {entry.steps && index < entry.steps.length - 1 ? (() => {
                const next = entry.steps![index + 1];
                const bridge = getBridgeBySourceAndTarget(step.codexId, next.codexId) ?? getBridgeBySourceAndTarget(next.codexId, step.codexId);

                return bridge ? (
                  <div className="mx-2 mt-2 rounded border border-gold/[0.14] bg-gold/[0.03] p-3">
                    <div className="font-serif text-lg italic text-gold/85">{bridge.title}</div>
                    <p className="symbol-copy mt-1 text-sm text-foreground-strong">{bridge.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {bridge.meaningFields.map((f) => (
                        <span key={f} className="inline-flex border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs leading-tight text-muted-soft">{getMeaningFieldLabel(f)}</span>
                      ))}
                      {bridge.scriptureAnchors?.map((a) => (
                        <span key={a} className="inline-flex border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs leading-tight text-muted-soft">{getScriptureAnchorLabel(a)}</span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })() : null}
            </li>
          );
        })}
      </ol>

      {exitCore ? (
        <div className="mt-6 border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Dieser Weg oeffnet sich zu</p>
          <WayLinkCard
            href={withPathContext(`/codex/${exitCore.id}`, { path: entry.id })}
            title={exitCore.title}
            note={exitCore.summary}
            movementSteps={entry.steps.map((step) => step.label)}
            className="mt-4"
          />
        </div>
      ) : null}

      {relatedPatterns.length > 0 ? (
        <div className="mt-6 border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verwandte Muster</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPatterns.map((way) => (
              <WayProjectionCard key={way.id} way={way} context={{ from: entry.id }} />
            ))}
          </div>
        </div>
      ) : null}
    </DetailSection>
  );
}

function ResonanceLinkList({
  items,
  emptyText,
}: {
  items: NumberResonanceItem[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="symbol-copy mt-3 text-sm italic text-muted-soft">{emptyText}</p>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map(({ id, target, linkedEntry }) => {
        const label = linkedEntry?.title ?? resolveTargetLabel(target);

        return linkedEntry ? (
          <Link
            key={id}
            href={`/codex/${linkedEntry.id}`}
            className="border border-cyan-soft/15 bg-cyan-soft/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-soft/85 transition-colors duration-500 hover:border-cyan-soft/30 hover:text-cyan-soft"
          >
            {label}
          </Link>
        ) : (
          <span
            key={id}
            className="border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-soft"
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

function MeaningResonanceLinkList({
  items,
  emptyText,
}: {
  items: MeaningResonanceItem[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="symbol-copy mt-3 text-sm italic text-muted-soft">{emptyText}</p>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map(({ id, target, linkedEntry, label }) => {
        const className = "border border-gold/15 bg-gold/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold/80 transition-colors duration-500";

        return linkedEntry ? (
          <Link key={id} href={`/codex/${linkedEntry.id}`} className={`${className} hover:border-gold/30 hover:text-gold`}>
            {label}
          </Link>
        ) : (
          <span key={id} className={className}>
            {resolveTargetLabel(target)}
          </span>
        );
      })}
    </div>
  );
}

function MeaningResonanceSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  const resonance = getMeaningResonance(entry);

  if (!resonance) {
    return null;
  }

  return (
    <DetailSection title="Bedeutungs-Resonanz" activeContext={activeContext}>
      <div className="grid gap-6">
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Essenz</p>
          <p className="symbol-copy mt-3 text-lg italic text-foreground-strong">
            {resonance.essence}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Symbole</p>
            <MeaningResonanceLinkList items={resonance.symbols} emptyText="Noch keine Symbole verbunden." />
          </div>

          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebr&auml;ische Knoten</p>
            <MeaningResonanceLinkList items={resonance.hebrewNodes} emptyText="Noch keine hebr&auml;ischen Knoten verbunden." />
          </div>
        </div>

        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Thora- und Scripture-Anker</p>
          {resonance.scripture.length > 0 ? (
            <div className="mt-3 grid gap-3">
              {resonance.scripture.map((anchor) => {
                const linkedEntry = anchor.target ? resolveLinkedCodexEntry(anchor.target) : undefined;

                return linkedEntry ? (
                  <Link
                    key={anchor.id}
                    href={`/codex/${linkedEntry.id}`}
                    className="block border border-cyan-soft/15 bg-cyan-soft/[0.04] p-4 transition-colors duration-500 hover:border-cyan-soft/30 hover:bg-cyan-soft/[0.065]"
                  >
                    <p className="font-serif text-xl italic text-foreground-strong">{anchor.label}</p>
                    {anchor.note ? <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{anchor.note}</p> : null}
                  </Link>
                ) : (
                  <article key={anchor.id} className="border border-cyan-soft/15 bg-cyan-soft/[0.04] p-4">
                    <p className="font-serif text-xl italic text-foreground-strong">{anchor.label}</p>
                    {anchor.note ? <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{anchor.note}</p> : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="symbol-copy mt-3 text-sm italic text-muted-soft">Noch keine Scripture-Anker verbunden.</p>
          )}
        </div>

        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Moegliche Weiterwege</p>
          <MeaningResonanceLinkList items={resonance.onward} emptyText="Noch keine Weiterwege verbunden." />
        </div>
      </div>
    </DetailSection>
  );
}

function NumberResonanceSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  const resonance = getNumberResonance(entry);

  if (!resonance) {
    return null;
  }

  return (
    <DetailSection title="Zahlen-Resonanz" activeContext={activeContext}>
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
        <div className="border border-gold/15 bg-gold/[0.045] px-8 py-7 text-center">
          <p className="font-serif text-8xl italic leading-none text-gold">
            {resonance.value}
          </p>
          <p className="mt-4 text-[0.58rem] uppercase tracking-[0.22em] text-muted-soft">
            Zahlkoerper
          </p>
        </div>

        <div className="grid gap-5">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Symbolische Essenz</p>
            <p className="symbol-copy mt-3 text-base italic text-foreground-strong">
              {resonance.essence}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Buchstaben</p>
              <ResonanceLinkList items={resonance.letters} emptyText="Noch keine Buchstaben verbunden." />
            </div>

            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene W&ouml;rter</p>
              <ResonanceLinkList items={resonance.words} emptyText="Noch keine W&ouml;rter verbunden." />
            </div>

            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Symbole</p>
              <ResonanceLinkList items={resonance.symbols} emptyText="Noch keine Symbole verbunden." />
            </div>
          </div>
        </div>
      </div>
    </DetailSection>
  );
}

function LetterResonanceSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  const resonance = getLetterResonance(entry);

  if (!resonance) {
    return null;
  }

  return (
    <DetailSection title="Buchstaben-Resonanz" activeContext={activeContext}>
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
        <div className="border border-gold/15 bg-gold/[0.045] px-8 py-7 text-center">
          <p className="font-serif text-8xl leading-none text-gold" lang="he" dir="rtl">
            {resonance.glyph}
          </p>
          {resonance.transliteration ? (
            <p className="mt-5 text-[0.62rem] uppercase tracking-[0.26em] text-gold/70">
              {resonance.transliteration}
            </p>
          ) : null}
          {resonance.numericValue ? (
            <p className="mt-3 text-[0.58rem] uppercase tracking-[0.22em] text-muted-soft">
              Zahlkoerper {resonance.numericValue}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Symbolische Essenz</p>
            <p className="symbol-copy mt-3 text-base italic text-foreground-strong">
              {resonance.essence}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene W&ouml;rter</p>
              {resonance.words.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {resonance.words.map((word) => {
                    const linkedEntry = resolveLinkedCodexEntry(word.id);

                    return linkedEntry ? (
                      <Link
                        key={word.id}
                        href={`/codex/${linkedEntry.id}`}
                        className="border border-cyan-soft/15 bg-cyan-soft/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-soft/85 transition-colors duration-500 hover:border-cyan-soft/30 hover:text-cyan-soft"
                      >
                        {word.transliteration}
                      </Link>
                    ) : (
                      <span key={word.id} className="border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-soft">
                        {word.transliteration}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="symbol-copy mt-3 text-sm italic text-muted-soft">Noch keine W&ouml;rter verbunden.</p>
              )}
            </div>

            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Symbole</p>
              {resonance.symbolRelations.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {resonance.symbolRelations.map((relation) => {
                    const linkedEntry = resolveLinkedCodexEntry(relation.targetId);
                    const label = linkedEntry?.title ?? relation.targetId;

                    return linkedEntry ? (
                      <Link
                        key={`${relation.type}-${relation.targetId}`}
                        href={`/codex/${linkedEntry.id}`}
                        className="border border-gold/15 bg-gold/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold/80 transition-colors duration-500 hover:border-gold/30 hover:text-gold"
                      >
                        {label}
                      </Link>
                    ) : (
                      <span key={`${relation.type}-${relation.targetId}`} className="border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-soft">
                        {label}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="symbol-copy mt-3 text-sm italic text-muted-soft">Noch keine Symbole verbunden.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DetailSection>
  );
}

function SymbolicTrailSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  if (entry.type !== "scripture") {
    return null;
  }

  const trail = getSymbolicTrail(entry);
  const hasTrail = trail.fields.length > 0 || trail.arising.length > 0 || trail.onward.length > 0;

  if (!hasTrail) {
    return null;
  }

  return (
    <DetailSection title="Symbolische Spur" activeContext={activeContext}>
      <div className="grid gap-5">
        {trail.fields.length > 0 ? (
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bedeutungsfelder</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {trail.fields.map((field) => (
                <span key={field} className="border border-cyan-soft/15 bg-cyan-soft/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-soft/85">
                  {getMeaningFieldLabel(field)}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {trail.arising.length > 0 ? (
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Aus dem Vers</p>
            <div className="mt-3 grid gap-3">
              {trail.arising.map(({ id, relation, target, linkedEntry }) => (
                <article key={id} className="border border-white/[0.06] bg-black/[0.12] p-4">
                  {linkedEntry ? (
                    <Link
                      href={`/codex/${linkedEntry.id}`}
                      className="font-serif text-xl italic text-foreground-strong transition-colors duration-500 hover:text-gold"
                    >
                      {linkedEntry.title}
                    </Link>
                  ) : (
                    <p className="font-serif text-xl italic text-foreground-strong">{resolveTargetLabel(target)}</p>
                  )}
                  {relation.label ? <p className="symbol-copy mt-3 text-sm italic text-muted-soft">{relation.label}</p> : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {trail.onward.length > 0 ? (
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Weitergehen</p>
            <div className="mt-3 grid gap-3">
              {trail.onward.map(({ id, relation, target, linkedEntry }) => (
                <Link
                  key={id}
                  href={linkedEntry ? `/codex/${linkedEntry.id}` : `/codex/${target}`}
                  className="block border border-gold/15 bg-gold/[0.035] p-4 transition-colors duration-500 hover:border-gold/30 hover:bg-gold/[0.06]"
                >
                  <p className="font-serif text-xl italic text-foreground-strong">{linkedEntry?.title ?? resolveTargetLabel(target)}</p>
                  {relation.label ? <p className="symbol-copy mt-3 text-sm italic text-gold/75">{relation.label}</p> : null}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </DetailSection>
  );
}

function WaysBeginningSection({
  entry,
  activeContext,
}: {
  entry: CodexEntry;
  activeContext?: CodexContextFocus;
}) {
  const patternWays = getPatternsForEntity(entry.id);
  const journeyWays = getJourneysForEntity(entry.id);
  const hasWays = patternWays.length > 0 || journeyWays.length > 0;

  if (!hasWays) {
    return null;
  }

  return (
    <DetailSection title="Wege, die hier beginnen" activeContext={activeContext}>
      <div className="grid gap-3 sm:grid-cols-2">
        {patternWays.slice(0, 3).map((way, index) => (
          <WayProjectionCard
            key={way.id}
            way={way}
            context={{ from: entry.id }}
            className={index > 2 ? "hidden sm:block" : ""}
          />
        ))}
        {journeyWays.slice(0, Math.max(0, 3 - patternWays.slice(0, 3).length)).map((journey) => (
          <WayLinkCard
            key={journey.id}
            href={withPathContext(`/codex/${journey.id}`, { from: entry.id })}
            title={journey.title}
            note={journey.summary}
            movementSteps={journey.steps?.map((step) => step.label) ?? []}
          />
        ))}
      </div>
    </DetailSection>
  );
}

function OntologyEndpointLink({
  endpoint,
  className = "",
}: {
  endpoint: ReturnType<typeof resolveOntologyEndpoint>;
  className?: string;
}) {
  if (!endpoint.href) {
    return <span className={`font-serif text-lg italic text-foreground-strong ${className}`}>{endpoint.label}</span>;
  }

  return (
    <Link
      href={endpoint.href}
      className={`font-serif text-lg italic text-foreground-strong transition-colors duration-500 hover:text-gold ${className}`}
    >
      {endpoint.label}
    </Link>
  );
}

function WayMovement({ steps }: { steps: string[] }) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <p className="mt-2 text-[0.58rem] uppercase tracking-[0.2em] text-gold/65">
      {getMovementLine(steps)}
    </p>
  );
}

function WayLinkCard({
  href,
  title,
  note,
  movementSteps = [],
  className = "",
}: {
  href: string;
  title: string;
  note: string;
  movementSteps?: string[];
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`block border border-gold/15 bg-gold/[0.035] p-4 transition-colors duration-500 hover:border-gold/30 hover:bg-gold/[0.06] ${className}`}
    >
      <p className="font-serif text-xl italic text-foreground-strong">{title}</p>
      <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{note}</p>
      <WayMovement steps={movementSteps} />
    </Link>
  );
}

function WayProjectionCard({
  way,
  note,
  context,
  className = "",
}: {
  way: OntologyWayProjection;
  note?: string;
  context?: PathContextLink;
  className?: string;
}) {
  return (
    <WayLinkCard
      href={context ? withPathContext(way.href, context) : way.href}
      title={way.title}
      note={note ?? way.summary}
      movementSteps={way.movementSteps}
      className={className}
    />
  );
}

function PatternCodexSection({
  entity,
  entry,
  activeContext,
}: {
  entity: OntologyEntity;
  entry: CodexEntry;
  activeContext?: CodexContextFocus;
}) {
  const movement = getPatternFallbackMovement(entity);
  const carriers = getPatternCarriers(entity);
  const destinations = getPatternDestinations(entity);
  const targetCores = getTargetCoresForPattern(entity.id);
  const relatedJourneys = getJourneysForPattern(entity, carriers);
  const destinationRelationIds = destinations.relationDestinations.map(({ relation }) => relation.id);
  const excludedRelationIds = new Set([
    ...carriers.map(({ relation }) => relation.id),
    ...destinationRelationIds,
  ]);
  const resonance = getPatternResonance(entry, excludedRelationIds);
  const hasPolarity = Boolean(entity.polarity);
  const nextCarriers = carriers.slice(0, 1);
  const nextCores = targetCores.slice(0, 1);
  const nextJourneys = relatedJourneys.slice(0, Math.max(0, 3 - nextCarriers.length - nextCores.length));
  const roomStation = getPatternRoomStation(entity.id);
  const hasNextWays = Boolean(roomStation) || nextCarriers.length > 0 || nextCores.length > 0 || nextJourneys.length > 0 || destinations.textDestinations.length > 0;

  if (movement.length === 0 && !hasPolarity && !hasNextWays && resonance.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Musterraum" activeContext={activeContext}>
      <div className="grid gap-7">
        {movement.length > 0 ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Musterbewegung</p>
              <span className="border border-gold/20 bg-gold/[0.045] px-3 py-1 text-[0.56rem] uppercase tracking-[0.18em] text-gold/75">
                Muster
              </span>
            </div>
            <ol className="mt-4 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
              {movement.map((step, index) => (
                <li key={`${step}-${index}`} className="grid justify-items-start gap-2 sm:flex sm:items-center sm:gap-3">
                  <span className="min-w-32 border border-gold/15 bg-black/[0.14] px-4 py-3 font-serif text-xl italic text-foreground-strong">
                    {step}
                  </span>
                  {index < movement.length - 1 ? (
                    <span className="pl-5 text-sm text-cyan-soft/70 sm:pl-0" aria-hidden="true">
                      <span className="sm:hidden">&darr;</span>
                      <span className="hidden sm:inline">-&gt;</span>
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {entity.polarity ? (
          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Innere Spannung</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              {entity.polarity.visiblePole ? (
                <p className="font-serif text-2xl italic text-foreground-strong">{entity.polarity.visiblePole}</p>
              ) : null}
              {entity.polarity.visiblePole && entity.polarity.hiddenPole ? (
                <span className="text-center text-sm text-gold/55" aria-hidden="true">/</span>
              ) : null}
              {entity.polarity.hiddenPole ? (
                <p className="font-serif text-2xl italic text-gold/85">{entity.polarity.hiddenPole}</p>
              ) : null}
            </div>
            <p className="symbol-copy mt-3 text-sm uppercase tracking-[0.16em] text-cyan-soft/70">
              {entity.polarity.axis}
            </p>
            {entity.polarity.note ? (
              <p className="symbol-copy mt-3 text-base italic text-muted-soft">{entity.polarity.note}</p>
            ) : null}
          </div>
        ) : null}

        {hasNextWays ? (
          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Weitergehen</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {roomStation ? (
                <WayLinkCard
                  href={buildRoomHref(roomStation.roomId, { from: entity.id, symbol: roomStation.roomId })}
                  title={roomStation.title}
                  note={roomStation.text}
                  movementSteps={movement}
                />
              ) : null}
              {nextCarriers.map(({ relation, endpoint }) => (
                endpoint.href ? (
                  <WayLinkCard
                    key={relation.id}
                    href={withPathContext(endpoint.href, { from: entity.id })}
                    title={endpoint.label}
                    note={relation.shortResonance}
                    movementSteps={movement}
                  />
                ) : null
              ))}
              {nextCores.map(({ relation, entity: core }) => (
                <WayLinkCard
                  key={relation.id}
                  href={withPathContext(`/codex/${core.id}`, { path: entity.id })}
                  title={`Zur Achse ${core.title}`}
                  note={relation.shortResonance}
                  movementSteps={movement}
                />
              ))}
              {nextJourneys.map((journey) => (
                <WayLinkCard
                  key={journey.id}
                  href={withPathContext(`/codex/${journey.id}`, { from: entity.id })}
                  title="Weg betreten"
                  note={journey.steps?.map((step) => step.label).join(" -> ") ?? journey.summary}
                  movementSteps={journey.steps?.map((step) => step.label) ?? []}
                />
              ))}
              {destinations.textDestinations.map((destination) => {
                if (!destination.href || nextCores.some(({ entity: core }) => normalizeText(core.title) === normalizeText(destination.label))) {
                  return null;
                }

                return (
                  <WayLinkCard
                    key={destination.label}
                    href={withPathContext(destination.href, { path: entity.id })}
                    title={destination.label}
                    note="Diese Bewegung oeffnet sich in diese Richtung."
                    movementSteps={movement}
                    className="hidden md:block"
                  />
                );
              })}
            </div>
          </div>
        ) : null}

        {resonance.length > 0 ? (
          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Resonanzbeziehungen</p>
            <div className="mt-4 grid gap-3">
              {resonance.map(({ relation, endpoint, label, markerLabel, note, explanation }, index) => (
                <article key={relation.id} className={`${index > 2 ? "hidden sm:block" : "block"} border border-white/[0.06] bg-black/[0.1] p-4`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="text-[0.58rem] uppercase tracking-[0.22em] text-gold/70">{label}</span>
                    <span className="border border-cyan-soft/15 bg-cyan-soft/[0.035] px-2 py-1 text-[0.56rem] uppercase tracking-[0.16em] text-cyan-soft/75">
                      {markerLabel}
                    </span>
                  </div>
                  <OntologyEndpointLink endpoint={endpoint} className="mt-3 block text-2xl" />
                  {note ? <p className="symbol-copy mt-3 text-sm italic text-muted-soft">{note}</p> : null}
                  {explanation ? <p className="symbol-copy mt-3 text-sm leading-relaxed text-foreground-strong/78">{explanation}</p> : null}
                </article>
              ))}
              {resonance.length > 3 ? (
                <details className="border border-gold/15 bg-gold/[0.025] p-4 sm:hidden">
                  <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.2em] text-gold/80">
                    Weitere Resonanzen oeffnen
                  </summary>
                  <div className="mt-4 grid gap-3">
                    {resonance.slice(3).map(({ relation, endpoint, label, markerLabel, note, explanation }) => (
                      <article key={`mobile-${relation.id}`} className="border border-white/[0.06] bg-black/[0.1] p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                          <span className="text-[0.58rem] uppercase tracking-[0.22em] text-gold/70">{label}</span>
                          <span className="border border-cyan-soft/15 bg-cyan-soft/[0.035] px-2 py-1 text-[0.56rem] uppercase tracking-[0.16em] text-cyan-soft/75">
                            {markerLabel}
                          </span>
                        </div>
                        <OntologyEndpointLink endpoint={endpoint} className="mt-3 block text-2xl" />
                        {note ? <p className="symbol-copy mt-3 text-sm italic text-muted-soft">{note}</p> : null}
                        {explanation ? <p className="symbol-copy mt-3 text-sm leading-relaxed text-foreground-strong/78">{explanation}</p> : null}
                      </article>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </DetailSection>
  );
}

function CoreConceptCodexSection({
  entity,
  activeContext,
}: {
  entity: OntologyEntity;
  activeContext?: CodexContextFocus;
}) {
  const leadingPatterns = getPatternsLeadingToCore(entity.id);
  const hasContent =
    Boolean(entity.polarity) ||
    leadingPatterns.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <DetailSection title="Bedeutungsachse" activeContext={activeContext}>
      <div className="grid gap-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="symbol-copy max-w-2xl text-base italic text-foreground-strong">
            {entity.summary}
          </p>
          <span className="border border-gold/20 bg-gold/[0.045] px-3 py-1 text-[0.56rem] uppercase tracking-[0.18em] text-gold/75">
            Bedeutungsachse
          </span>
        </div>

        {entity.polarity ? (
          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Innere Spannung</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              {entity.polarity.visiblePole ? (
                <p className="font-serif text-2xl italic text-foreground-strong">{entity.polarity.visiblePole}</p>
              ) : null}
              {entity.polarity.visiblePole && entity.polarity.hiddenPole ? (
                <span className="text-center text-sm text-gold/55" aria-hidden="true">/</span>
              ) : null}
              {entity.polarity.hiddenPole ? (
                <p className="font-serif text-2xl italic text-gold/85">{entity.polarity.hiddenPole}</p>
              ) : null}
            </div>
            <p className="symbol-copy mt-3 text-sm uppercase tracking-[0.16em] text-cyan-soft/70">
              {entity.polarity.axis}
            </p>
            {entity.polarity.note ? (
              <p className="symbol-copy mt-3 text-base italic text-muted-soft">{entity.polarity.note}</p>
            ) : null}
          </div>
        ) : null}

        {leadingPatterns.length > 0 ? (
          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zulaufende Bewegungen</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {leadingPatterns.map((way, index) => (
                <WayProjectionCard
                  key={way.id}
                  way={way}
                  note={way.summary}
                  context={{ from: entity.id }}
                  className={index > 2 ? "hidden sm:block" : ""}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </DetailSection>
  );
}

function OntologyResonanceSection({
  entry,
  activeContext,
  excludedRelationIds = new Set<string>(),
}: {
  entry: CodexEntry;
  activeContext?: CodexContextFocus;
  excludedRelationIds?: Set<string>;
}) {
  const resonance = getOntologyResonance(entry).filter(({ relation }) => !excludedRelationIds.has(relation.id));

  if (resonance.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Mitschwingende Beziehungen" activeContext={activeContext}>
      <div className="grid gap-3">
        {resonance.map(({ relation, endpoint, label, markerLabel, note, explanation }, index) => (
          <div
            key={relation.id}
            className={`${index > 2 ? "hidden sm:grid" : "grid"} gap-3 border border-white/[0.06] bg-black/[0.1] p-4`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="text-[0.58rem] uppercase tracking-[0.22em] text-gold/70">
                {label}
              </span>
              <span className="border border-cyan-soft/15 bg-cyan-soft/[0.035] px-2 py-1 text-[0.56rem] uppercase tracking-[0.16em] text-cyan-soft/75">
                {markerLabel}
              </span>
            </div>
            <OntologyEndpointLink endpoint={endpoint} className="text-2xl" />
            {note ? <p className="symbol-copy text-sm italic text-muted-soft">{note}</p> : null}
            {explanation ? <p className="symbol-copy text-sm leading-relaxed text-foreground-strong/78">{explanation}</p> : null}
          </div>
        ))}
        {resonance.length > 3 ? (
          <details className="border border-gold/15 bg-gold/[0.025] p-4 sm:hidden">
            <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.2em] text-gold/80">
              Weitere Resonanzen oeffnen
            </summary>
            <div className="mt-4 grid gap-3">
              {resonance.slice(3).map(({ relation, endpoint, label, markerLabel, note, explanation }) => (
                <div key={`mobile-${relation.id}`} className="grid gap-3 border border-white/[0.06] bg-black/[0.1] p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="text-[0.58rem] uppercase tracking-[0.22em] text-gold/70">
                      {label}
                    </span>
                    <span className="border border-cyan-soft/15 bg-cyan-soft/[0.035] px-2 py-1 text-[0.56rem] uppercase tracking-[0.16em] text-cyan-soft/75">
                      {markerLabel}
                    </span>
                  </div>
                  <OntologyEndpointLink endpoint={endpoint} className="text-2xl" />
                  {note ? <p className="symbol-copy text-sm italic text-muted-soft">{note}</p> : null}
                  {explanation ? <p className="symbol-copy text-sm leading-relaxed text-foreground-strong/78">{explanation}</p> : null}
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </DetailSection>
  );
}

function getVisibleCodexRelations(entry: CodexEntry) {
  const ontologyResonance = getOntologyResonance(entry);
  const ontologyTargetIds = new Set(ontologyResonance.map(({ endpoint }) => endpoint.id));
  const ontologyTexts = new Set(
    ontologyResonance
      .flatMap(({ note, explanation }) => [note, explanation])
      .filter((value): value is string => Boolean(value?.trim()))
      .map(normalizeText),
  );
  const seenRelationKeys = new Set<string>();

  return entry.relations.filter((relation) => {
    const target = relationTarget(relation);
    const normalizedNote = normalizeText(relation.label ?? "");
    const relationKey = `${entry.id}:${target}:${relation.type}:${normalizedNote}`;

    if (!target || seenRelationKeys.has(relationKey)) {
      return false;
    }

    if (ontologyTargetIds.has(target)) {
      return false;
    }

    if (normalizedNote && ontologyTexts.has(normalizedNote)) {
      return false;
    }

    seenRelationKeys.add(relationKey);
    return true;
  });
}

function RelationsSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  const visibleRelations = getVisibleCodexRelations(entry);

  if (visibleRelations.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Nahe Resonanz" activeContext={activeContext}>
      <div className="grid gap-3">
        {visibleRelations.map((relation, index) => {
          const target = relationTarget(relation);
          const linkedEntry = resolveLinkedCodexEntry(target);
          const targetLabel = linkedEntry?.title ?? resolveTargetLabel(target);
          const relationNote = getDisplayRelationNote(relation, targetLabel);

          return (
            <article key={`${relation.type}-${target}-${index}`} className={`${index > 2 ? "hidden sm:block" : "block"} border border-white/[0.06] bg-black/[0.12] p-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold/70">{formatRelationType(relation.type)}</p>
                {linkedEntry ? (
                  <Link
                    href={`/codex/${linkedEntry.id}`}
                    className="font-serif text-lg italic text-foreground-strong transition-colors duration-500 hover:text-gold"
                  >
                    {targetLabel}
                  </Link>
                ) : (
                  <p className="font-serif text-lg italic text-foreground-strong">{targetLabel}</p>
                )}
              </div>
              {relationNote ? (
                <p className="symbol-copy mt-4 text-sm italic text-muted-soft">{relationNote}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </DetailSection>
  );
}

function ScriptureAnchorsSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  if (entry.scriptureAnchors.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Bibelanker" activeContext={activeContext}>
      <div className="grid gap-3">
        {entry.scriptureAnchors.map((anchor, index) => {
          const linkedEntry =
            resolveLinkedCodexEntry(anchor.id) ??
            resolveLinkedCodexEntry(anchor.reference) ??
            resolveLinkedCodexEntry(anchor.label);

          return (
            <article key={`${anchor.reference}-${index}`} className="border border-white/[0.06] bg-black/[0.12] p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Stelle</p>
                  {linkedEntry ? (
                    <Link
                      href={`/codex/${linkedEntry.id}`}
                      className="mt-2 inline-block font-serif text-xl italic text-foreground-strong transition-colors duration-500 hover:text-gold"
                    >
                      {anchor.reference}
                    </Link>
                  ) : (
                    <p className="mt-2 font-serif text-xl italic text-foreground-strong">{anchor.reference}</p>
                  )}
                </div>
                {anchor.label ? (
                  <div className="sm:text-right">
                    <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Rolle</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gold/75">{anchor.label}</p>
                  </div>
                ) : null}
              </div>
              {anchor.note ? (
                <p className="symbol-copy mt-4 text-sm italic text-muted-soft">{anchor.note}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </DetailSection>
  );
}

function NearbyEntriesSection({ entry }: { entry: CodexEntry }) {
  const nearbyEntries = getNearbyEntries(entry);

  if (nearbyEntries.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Nahe Resonanz">
      <div className="grid gap-3">
        {nearbyEntries.map((nearbyEntry) => (
          <Link
            key={nearbyEntry.id}
            href={`/codex/${nearbyEntry.id}`}
            className="block border border-white/[0.06] bg-black/[0.12] p-4 transition-colors duration-500 hover:border-gold/20 hover:bg-gold/[0.035]"
          >
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-cyan-soft">{formatType(nearbyEntry.type)}</p>
            <p className="mt-2 font-serif text-xl italic text-foreground-strong">{nearbyEntry.title}</p>
            <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{nearbyEntry.subtitle ?? nearbyEntry.id}</p>
          </Link>
        ))}
      </div>
    </DetailSection>
  );
}
