import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodexPersonalTraceCard } from "@/components/CodexPersonalTraceCard";
import { CodexReflectionCard } from "@/components/CodexReflectionCard";
import { CodexVisitTracker } from "@/components/CodexVisitTracker";
import { codexEntryIds, codexRegistry } from "@/lib/codex/codexRegistry";
import { getSymbolCodexAnchorBridge, getSymbolCodexChipLinks, getWaterCodexChipLinks, resolveScriptureAnchorHref } from "@/lib/codex/linking";
import { resolveCodexEntry } from "@/lib/codex/resolveCodexEntry";
import { buildScriptureFoundationModel, type ScriptureFoundationLink, type ScriptureFoundationModel } from "@/lib/codex/scriptureFoundation";
import type { CodexEntry, CodexEntryType, CodexRelation } from "@/lib/codex/types";
import { breakdownHebrewWord } from "@/lib/hebrew/gematria";
import {
  getGenesisLetterProfile,
  getGenesisVerseLetterLayer,
  getGenesisWordMovement,
  getGenesisWordsForLetter,
} from "@/lib/hebrew/genesisLetterLayer";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { getRoomHebrewMovement, type RoomHebrewMovement } from "@/lib/hebrew/roomHebrewMovements";
import type { HebrewWord } from "@/types/hebrew";
import { biblicalReferences } from "@/lib/meaning/biblicalReferences";
import { meaningJourneys } from "@/lib/meaning/meaningJourneys";
import { meaningNodes } from "@/lib/meaning/meaningNodes";
import { getAllBridges, getBridgeBySourceAndTarget } from "@/lib/meaning-bridges";
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
import { getJourneysForNode, getResonanceJourney, getResonanceRoom } from "@/lib/resonance";
import { buildRoomHref, getPatternRoomStation, hasSymbolRoom } from "@/lib/rooms/roomContext";
import {
  getJourneysForSymbol,
  getSymbolJourney,
  SYMBOL_JOURNEY_OVERVIEW_HREF,
  type SymbolJourney,
  type SymbolJourneyStep,
} from "@/lib/symbols/symbolJourneys";
import { getKnownSymbolPathLabel, getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import type { BiblicalReference } from "@/types/meaningGraph";
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

type ReflectionSourceType = "symbol" | "pattern" | "journey" | "core" | "letter" | "scripture";
type CodexGenre =
  | "symbol"
  | "hebrew-word"
  | "hebrew-letter"
  | "scripture"
  | "journey"
  | "pattern"
  | "meaning"
  | "core"
  | "number";

type GenreCopy = {
  formula: string;
  threshold: string;
  essenceTitle: string;
  meaningFieldsTitle: string;
  waysTitle: string;
  relationsTitle: string;
  relationsLead: string;
  scriptureTitle: string;
  nearbyTitle: string;
};

const GENRE_COPY: Record<CodexGenre, GenreCopy> = {
  symbol: {
    formula: "Ort der Bedeutung",
    threshold: "Dieses Symbol wird als Raum betreten. Erst kommt die Atmosphaere, dann der hebräische Körper, dann die Beziehungen, die diesen Ort tragen.",
    essenceTitle: "Essenz",
    meaningFieldsTitle: "Bedeutungsraum",
    waysTitle: "Türen in Raum und Pfad",
    relationsTitle: "Drei tragende Beziehungen",
    relationsLead: "Welche Bedeutungen tragen diesen Raum?",
    scriptureTitle: "Kontextspuren",
    nearbyTitle: "Türen: Raum, Codex, Symbolnetz, Pfad",
  },
  "hebrew-word": {
    formula: "Sprachkörper",
    threshold: "Dieses hebräische Wort wird zuerst gehört. Klang, Schriftbild und Zahlkörper tragen die Bedeutung, bevor sie in Symbolräume weitergeht.",
    essenceTitle: "Bedeutungsschwelle",
    meaningFieldsTitle: "Innere Wortbedeutung",
    waysTitle: "Bewegung",
    relationsTitle: "Drei antwortende Sprachkörper",
    relationsLead: "Welche anderen Sprachkörper antworten diesem Wort?",
    scriptureTitle: "Kontextspuren",
    nearbyTitle: "Symbolräume",
  },
  "hebrew-letter": {
    formula: "Urzeichen",
    threshold: "Dieser Buchstabe wird angeschaut wie eine Urform. Zeichen, Name und Zahlenwert kommen vor den weiteren Resonanzen.",
    essenceTitle: "Urbild / Grundbewegung",
    meaningFieldsTitle: "Bedeutungsnähe",
    waysTitle: "Symbolische Nähe",
    relationsTitle: "Drei tragende Beziehungen",
    relationsLead: "Welche Wörter, Symbole und Zahlen werden von dieser Form berührt?",
    scriptureTitle: "Erste Schriftspur",
    nearbyTitle: "Nahe Zeichenräume",
  },
  scripture: {
    formula: "Szene",
    threshold: "Diese Bibelstelle wird als Szene betreten. Ein Moment öffnet sich, aus dem hebräische Schlüssel, Symbole und Bewegungen hervortreten.",
    essenceTitle: "Szene",
    meaningFieldsTitle: "Bedeutungen der Szene",
    waysTitle: "Weiterführende Resonanzen",
    relationsTitle: "Drei hervortretende Beziehungen",
    relationsLead: "Welche Bedeutungen treten in dieser Szene hervor?",
    scriptureTitle: "Szenenanker",
    nearbyTitle: "Weitere Szenentüren",
  },
  journey: {
    formula: "Weg",
    threshold: "Diese Journey will gegangen werden. Bedeutung entsteht nicht auf einmal, sondern von Station zu Station.",
    essenceTitle: "Ausgangspunkt",
    meaningFieldsTitle: "Was dieser Weg sammelt",
    waysTitle: "Verwandte Räume / Symbole",
    relationsTitle: "Wegbeziehungen",
    relationsLead: "Welche Stationen und Räume halten diesen Weg zusammen?",
    scriptureTitle: "Biblische Wegspuren",
    nearbyTitle: "Nahe Wege",
  },
  pattern: {
    formula: "Wiederkehrende Bewegung",
    threshold: "Dieses Muster zeigt Bedeutung als wiederkehrende Bewegung. Es fragt nicht nur, was etwas ist, sondern wo es immer wieder geschieht.",
    essenceTitle: "Musterformel",
    meaningFieldsTitle: "Musterfelder",
    waysTitle: "Verwandte Journeys",
    relationsTitle: "Wo diese Bewegung wiederkehrt",
    relationsLead: "Wo kehrt diese Bewegung wieder?",
    scriptureTitle: "Biblische Beispiele",
    nearbyTitle: "Nahe Muster",
  },
  meaning: {
    formula: "Bedeutungsfeld",
    threshold: "Dieses Bedeutungsfeld sammelt, ohne alles gleichzumachen. Symbole, Wörter und Stellen stehen hier in einem gemeinsamen Raum.",
    essenceTitle: "Kurze innere Definition",
    meaningFieldsTitle: "Bedeutungsfeld",
    waysTitle: "Bewegung innerhalb des Feldes",
    relationsTitle: "Drei tragende Beziehungen",
    relationsLead: "Welche Symbole, Wörter und Stellen sammeln sich in diesem Feld?",
    scriptureTitle: "Kontextspuren",
    nearbyTitle: "Nahe Bedeutungsfelder",
  },
  core: {
    formula: "Achse",
    threshold: "Diese Achse trägt mehrere Räume, ohne sie zu verschmelzen. Wer eintritt, erkennt, welche Bewegungen hier zusammenlaufen.",
    essenceTitle: "Achse benennen",
    meaningFieldsTitle: "Achsenfelder",
    waysTitle: "Bewegungen durch diese Achse",
    relationsTitle: "Achsenbeziehungen",
    relationsLead: "Welche Bewegungen laufen durch diese Achse?",
    scriptureTitle: "Verdichtende Bibelstellen",
    nearbyTitle: "Nahe Achsen",
  },
  number: {
    formula: "Rhythmus",
    threshold: "Diese Zahl wird als Rhythmus gelesen. Sie ordnet Bedeutungen durch Maß, Wiederkehr und hebräische Zahlkörper.",
    essenceTitle: "Symbolischer Rhythmus",
    meaningFieldsTitle: "Rhythmusfelder",
    waysTitle: "Welche Bewegung diese Zahl trägt",
    relationsTitle: "Drei tragende Beziehungen",
    relationsLead: "Welche Buchstaben, Wörter und Symbole werden durch diese Zahl geordnet?",
    scriptureTitle: "Biblische Zahlenspuren",
    nearbyTitle: "Nahe Rhythmen",
  },
};

function formatType(type: CodexEntryType) {
  const labels: Record<CodexEntryType, string> = {
    "hebrew-letter": "Hebräischer Buchstabe",
    "hebrew-word": "Hebräisches Wort",
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
    "contains-letter": "Trägt den Buchstaben",
    "continues-journey": "Führt weiter zu",
    contrasts: "Steht im Gegenüber zu",
    "carried-by": "getragen von",
    "moves-over": "bewegt sich über",
    "hovers-over": "schwebt über",
    carries: "trägt",
    "gives-voice-to": "gibt Stimme",
    "opens-to": "öffnet zu",
    "breathes-into": "haucht Atem in",
    "stirred-by": "bewegt durch",
    "moves-through": "bewegt sich durch",
    expresses: "Drückt aus",
    "expressed-through": "ausgedrückt durch",
    "echoes-within": "Erinnert an",
    "gives-rise-to": "Entspringt",
    "heard-within": "hörbar in",
    "has-hebrew-word": "Klingt hebräisch mit",
    "hidden-within": "verborgen in",
    "leads-to": "Führt weiter zu",
    "nourishes-as": "nährt als",
    precedes: "Bereitet vor",
    related: "Gehört zusammen",
    "revealed-at": "offenbart an",
    reveals: "Öffnet",
    "shares-meaning": "Gehört zusammen",
    "source-of": "Entspringt aus",
    symbolizes: "Macht sichtbar",
    transforms: "Führt weiter zu",
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

function normalizeRouteTerm(value: string) {
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

const CANONICAL_CODEX_ROUTE_IDS: Record<string, string> = {
  eretz: "erez",
  "chaos-ordnung": "journey-chaos-ordnung",
  "wasser-brot": "journey-wasser-zum-brot",
  "wasser-licht": "bridge-wasser-licht",
};

function getDefaultSymbolRoomPath(entry: CodexEntry) {
  if (entry.type === "scripture") {
    return entry.id;
  }

  if (!entry.symbolRoomSlug) {
    return undefined;
  }

  const scriptureAnchors = getSymbolPathConfig(entry.symbolRoomSlug)?.codexGates?.scriptureAnchors ?? [];

  return scriptureAnchors.length === 1 ? scriptureAnchors[0].id : undefined;
}

function buildCodexRoomHref(entry: CodexEntry) {
  if (!hasSymbolRoom(entry.symbolRoomSlug)) {
    return undefined;
  }

  return buildRoomHref(entry.symbolRoomSlug, {
    from: "codex",
    path: getDefaultSymbolRoomPath(entry),
    symbol: entry.symbolRoomSlug,
  });
}

function resolveSymbolSlugForCodexEntry(entry: CodexEntry) {
  if (entry.type !== "symbol") {
    return undefined;
  }

  return getSymbolPathConfig(entry.id)?.symbolId;
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

function codexEntryFromHebrewWord(word: HebrewWord): CodexEntry {
  return {
    id: word.id,
    type: "hebrew-word",
    title: word.germanMeaning,
    subtitle: `${word.hebrew} / ${word.transliteration}`,
    hebrew: word.hebrew,
    transliteration: word.transliteration,
    aliases: [word.germanMeaning, word.transliteration, word.hebrew, word.slug],
    searchTerms: [
      ...word.meaningFields.flatMap((field) => [field.label, ...field.experienceFields]),
      ...word.relatedSymbolSlugs,
    ],
    summary: word.meaningFields.slice(0, 3).map((field) => field.description).join(" "),
    meaningFields: [],
    relations: [
      ...word.relatedSymbolSlugs.map((targetId) => ({
        targetId,
        type: "has-hebrew-word" as const,
        label: `${word.transliteration} klingt in ${targetId} mit.`,
        source: "hebrew-word" as const,
      })),
      ...word.letterIds.map((targetId) => ({
        targetId,
        type: "contains-letter" as const,
        label: `Buchstabe ${targetId}`,
        source: "hebrew-word" as const,
      })),
    ],
    scriptureAnchors: word.biblicalReferences.map((reference) => ({
      id: reference.id,
      reference: reference.reference,
      label: reference.relation,
      note: reference.context,
      source: "hebrew-word",
    })),
    symbolRoomSlug: word.relatedSymbolSlugs[0] ?? null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["hebrew-word"],
      sourceIds: [word.id],
      tags: [word.slug, ...word.relatedSymbolSlugs],
    },
  };
}

function codexEntryFromBiblicalReference(reference: BiblicalReference, requestedId: string): CodexEntry {
  const label = getKnownSymbolPathLabel(requestedId) ?? reference.reference;

  return {
    id: requestedId,
    type: "scripture",
    title: label,
    subtitle: reference.label,
    hebrew: null,
    transliteration: null,
    aliases: [reference.reference, reference.label, ...(reference.aliases ?? [])],
    searchTerms: [reference.id, requestedId],
    summary: `${reference.reference} bleibt hier als biblischer Anker im Codex lesbar.`,
    meaningFields: [],
    relations: [],
    scriptureAnchors: [{
      id: reference.id,
      reference: reference.reference,
      label: reference.label,
      source: "scripture-reference",
    }],
    symbolRoomSlug: null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["scripture-reference"],
      sourceIds: [reference.id],
      tags: [requestedId],
    },
  };
}

function codexEntryFromKnownPathLabel(id: string, label: string): CodexEntry {
  const isScriptureLike = /^(Genesis|Exodus|Deuteronomium)\b/.test(label);

  return {
    id,
    type: isScriptureLike ? "scripture" : "meaning",
    title: label,
    subtitle: isScriptureLike ? "Bibelanker" : "Wüsten-Spur",
    hebrew: null,
    transliteration: null,
    aliases: [label],
    searchTerms: [id, label],
    summary: `${label} wird hier als kuratierter Anker des Symbolpfades lesbar.`,
    meaningFields: [],
    relations: [],
    scriptureAnchors: isScriptureLike
      ? [{ reference: label, label, source: "scripture-reference" }]
      : [],
    symbolRoomSlug: null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["meaning-graph"],
      sourceIds: [id],
      tags: [id],
    },
  };
}

function codexEntryFromMeaningBridge(id: string): CodexEntry | undefined {
  const bridge = getAllBridges().find((item) => item.id === id);

  if (!bridge) {
    return undefined;
  }

  return {
    id: bridge.id,
    type: "journey",
    title: bridge.title,
    subtitle: "Bedeutungsbrücke",
    hebrew: null,
    transliteration: null,
    aliases: [bridge.title, bridge.sourceId, bridge.targetId, ...(bridge.tags ?? [])],
    searchTerms: [bridge.id, bridge.title, bridge.summary, bridge.sourceId, bridge.targetId, ...(bridge.tags ?? [])],
    summary: bridge.summary,
    meaningFields: bridge.meaningFields,
    relations: [
      { targetId: bridge.sourceId, type: "shares-meaning", label: "Ausgangspunkt der Brücke.", source: "meaning-graph" },
      { targetId: bridge.targetId, type: "continues-journey", label: "Zielpunkt der Brücke.", source: "meaning-graph" },
      ...(bridge.hebrewConnections ?? []).flatMap((connection) => connection.hebrewWordId ? [{
        targetId: connection.hebrewWordId,
        type: "has-hebrew-word" as const,
        label: connection.meaning,
        source: "hebrew-word" as const,
      }] : []),
    ],
    scriptureAnchors: (bridge.scriptureAnchors ?? []).map((anchorId) => ({
      id: anchorId,
      reference: getKnownSymbolPathLabel(anchorId) ?? anchorId,
      label: "Bibelanker",
      source: "scripture-reference",
    })),
    symbolRoomSlug: null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["meaning-graph"],
      sourceIds: [bridge.id],
      tags: bridge.tags,
    },
  };
}

function codexEntryFromSymbolJourney(id: string): CodexEntry | undefined {
  const journey = getSymbolJourney(id);

  if (!journey) {
    return undefined;
  }

  return {
    id: journey.id,
    type: "journey",
    title: journey.title,
    subtitle: journey.subtitle,
    hebrew: null,
    transliteration: null,
    aliases: [journey.title, journey.subtitle, ...journey.steps.map((step) => step.label)],
    searchTerms: [journey.id, journey.title, journey.summary, ...journey.steps.flatMap((step) => [step.symbol, step.label, step.path ?? ""])],
    summary: journey.summary,
    meaningFields: [],
    relations: journey.steps.map((step) => ({
      targetId: step.symbol,
      type: "continues-journey" as const,
      label: step.text,
      source: "journey" as const,
    })),
    steps: journey.steps.map((step, index) => ({
      id: `${journey.id}-${index + 1}`,
      label: step.label,
      codexId: step.symbol,
      description: step.text,
    })),
    scriptureAnchors: journey.steps
      .filter((step) => step.path)
      .map((step) => ({
        id: step.path,
        reference: getKnownSymbolPathLabel(step.path) ?? step.path ?? "",
        label: step.label,
        source: "journey" as const,
      })),
    symbolRoomSlug: null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["journey"],
      sourceIds: [journey.id],
      tags: journey.steps.map((step) => step.symbol),
    },
  };
}

function resolveCodexRouteEntry(id: string) {
  const normalizedId = normalizeRouteTerm(id);
  const canonicalId = CANONICAL_CODEX_ROUTE_IDS[normalizedId] ?? id;
  const codexEntry = codexRegistry.find((entry) => entry.id === canonicalId);
  const ontologyEntity = codexEntry ? undefined : getOntologyEntity(canonicalId);
  const hebrewWord = codexEntry || ontologyEntity ? undefined : hebrewWords.find((word) => word.id === canonicalId || word.slug === canonicalId);
  const biblicalReference = codexEntry || ontologyEntity || hebrewWord
    ? undefined
    : biblicalReferences.find((reference) =>
      [reference.id, reference.reference, reference.label, ...(reference.aliases ?? [])].some((term) => normalizeRouteTerm(term) === normalizedId),
    );
  const knownPathLabel = codexEntry || ontologyEntity || hebrewWord || biblicalReference ? undefined : getKnownSymbolPathLabel(canonicalId);
  const meaningBridge = codexEntry || ontologyEntity || hebrewWord || biblicalReference || knownPathLabel ? undefined : codexEntryFromMeaningBridge(canonicalId);
  const symbolJourney = codexEntry || ontologyEntity || hebrewWord || biblicalReference || knownPathLabel || meaningBridge ? undefined : codexEntryFromSymbolJourney(canonicalId);
  const looseCodexEntry = codexEntry || ontologyEntity || hebrewWord || biblicalReference || knownPathLabel || meaningBridge || symbolJourney ? undefined : resolveCodexEntry(canonicalId);

  return codexEntry
    ?? (ontologyEntity ? codexEntryFromOntologyEntity(ontologyEntity) : undefined)
    ?? (hebrewWord ? codexEntryFromHebrewWord(hebrewWord) : undefined)
    ?? (biblicalReference ? codexEntryFromBiblicalReference(biblicalReference, id) : undefined)
    ?? (knownPathLabel ? codexEntryFromKnownPathLabel(canonicalId, knownPathLabel) : undefined)
    ?? meaningBridge
    ?? symbolJourney
    ?? looseCodexEntry;
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
        ? `Vom ${symbolLabel} aus öffnet sich diese Bewegung.`
        : `Du vertiefst jetzt die Spur von ${entry.title}.`,
      returnHref: symbol ? buildSymbolNetworkReturnHref({ symbol, lens: "story", path }) : "/symbolnetz",
      returnLabel: "Zum Symbolnetz zurückkehren",
    };
  }

  if (path && pathLabel && path !== entry.id) {
    const note = getExistingRelationText(path, entry.id, ["opens_into", "structures_journey"])
      || "Diese Bewegung sammelt sich in dieser Achse.";

    return {
      labels: [pathLabel, entry.title],
      note,
      returnHref: `/codex/${path}`,
      returnLabel: `Zurück zur Bewegung ${pathLabel}`,
    };
  }

  if (from && fromLabel && from !== entry.id) {
    const sourceEntity = getOntologyEntity(from);
    const note = getExistingRelationText(from, entry.id, ["contains_pattern", "opens_into", "structures_journey"])
      || (sourceEntity?.domain === "pattern"
        ? "Von dieser Bewegung aus führt der Weg hierher."
        : "Von hier aus öffnet sich diese Bewegung.");
    const isPatternSource = sourceEntity?.domain === "pattern";

    return {
      labels: [fromLabel, entry.title],
      note,
      returnHref: `/codex/${from}`,
      returnLabel: isPatternSource ? `Zurück zur Bewegung ${fromLabel}` : `Zurück zu ${fromLabel}`,
    };
  }

  return null;
}

function resolveReflectionSourceType(entry: CodexEntry, entity?: OntologyEntity): ReflectionSourceType | null {
  if (entity?.domain === "pattern") return "pattern";
  if (entity && isCoreConceptId(entity.id)) return "core";
  if (entry.type === "journey") return "journey";
  if (entry.type === "hebrew-letter") return "letter";
  if (entry.type === "scripture" && ["genesis-1-1", "genesis-1-2", "genesis-1-3"].includes(entry.id)) return "scripture";
  if (entry.type === "symbol" && ["wasser", "licht", "feuer", "wueste"].includes(entry.id)) return "symbol";

  return null;
}

function resolveCodexGenre(entry: CodexEntry, entity?: OntologyEntity): CodexGenre {
  if (entity?.domain === "pattern") return "pattern";
  if (entity && isCoreConceptId(entity.id)) return "core";
  if (entry.type === "meaning" || entry.type === "meaning-field") return "meaning";

  return entry.type;
}

function getReflectionQuestionForEntry(sourceType: ReflectionSourceType) {
  if (sourceType === "scripture") {
    return "Was beruehrt dich am Anfang dieser Bewegung?";
  }

  if (sourceType === "pattern" || sourceType === "journey") {
    return "Was bewegt sich in dir auf diesem Weg?";
  }

  if (sourceType === "core") {
    return "Welche Spur führt dich zu dieser Achse?";
  }

  return "Welche Frage öffnet sich dir hier?";
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

type OntologyRelationItem = ReturnType<typeof buildOntologyRelationItems>[number];

type CuratedRelationItem =
  | {
      kind: "ontology";
      key: string;
      endpointId: string;
      endpointLabel: string;
      endpointHref?: string;
      relationLabel: string;
      markerLabel: string;
      sentence: string;
      explanation: string;
      journeyHint?: string;
      score: number;
      relation: OntologyRelation;
    }
  | {
      kind: "codex";
      key: string;
      endpointId: string;
      endpointLabel: string;
      endpointHref?: string;
      relationLabel: string;
      markerLabel: string;
      sentence: string;
      explanation: string;
      journeyHint?: string;
      score: number;
      relation: CodexRelation;
    };

type ScriptureSceneModel = {
  formula: string;
  threshold: string;
  sceneSentences: string[];
  meaningFields: { id: string; label: string }[];
  contemplativeTrace?: string;
  foundation: ScriptureFoundationModel | null;
  hebrewKeys: HebrewWord[];
  movementSteps: { id: string; label: string; href?: string }[];
  journeyTitle?: string;
  symbols: { id: string; label: string; href?: string }[];
  rooms: { id: string; label: string; href?: string; note: string }[];
  verseLetters: {
    id: string;
    glyph: string;
    name: string;
    note: string;
    href?: string;
  }[];
  verseLetterNote?: string;
  relations: CuratedRelationItem[];
};

type ScriptureSceneFormula = {
  formula: string;
  threshold: string;
  sceneSentences: string[];
  movementSteps: { id: string; label: string; href?: string }[];
  symbols: { id: string; label: string; href?: string }[];
  roomNotes?: Record<string, string>;
  meaningFieldIds?: MeaningNodeId[];
  contemplativeTrace?: string;
};

const SCRIPTURE_SCENE_FORMULAS: Record<string, ScriptureSceneFormula> = {
  "genesis-1-1": {
    formula: "Ursprung",
    threshold: "Der Anfang setzt einen Horizont. Himmel und Erde stehen einander gegenueber; die Ordnung ist noch leise.",
    sceneSentences: [
      "Vor der Tiefe steht die erste Setzung.",
      "Himmel und Erde oeffnen den Raum, in dem alles Weitere lesbar wird.",
      "Die naechste Schwelle fuehrt hinab in Wasser, Dunkel und schwebenden Geist.",
    ],
    movementSteps: [
      { id: "anfang", label: "Anfang", href: "/codex/anfang" },
      { id: "himmel", label: "Himmel", href: "/codex/himmel" },
      { id: "erde", label: "Erde", href: "/codex/erde" },
      { id: "genesis-1-2", label: "Tiefe", href: "/codex/genesis-1-2" },
    ],
    symbols: [
      { id: "anfang", label: "Anfang", href: "/codex/anfang" },
      { id: "himmel", label: "Himmel", href: "/codex/himmel" },
      { id: "erde", label: "Erde", href: "/codex/erde" },
      { id: "ordnung", label: "Ordnung", href: "/codex/ordnung" },
    ],
    meaningFieldIds: ["birth", "hiddenness", "life"],
    contemplativeTrace: "Bleib einen Atemzug beim Anfang, bevor du wissen willst, was aus ihm wird.",
    roomNotes: {
      "genesis-1-2": "Aus dem Ursprung oeffnet sich die Tiefe als naechster Moment der Genesis-Achse.",
    },
  },
  "genesis-1-2": {
    formula: "Tiefe",
    threshold: "Die gesetzte Erde liegt noch ungeformt. Ueber Tiefe, Wasser und Dunkel bewegt sich die Ruach.",
    sceneSentences: [
      "Aus der ersten Setzung wird eine Schwelle aus Tiefe.",
      "Das Ungeformte ist nicht bedeutungslos; es ist beruehrte Moeglichkeit.",
      "Der naechste Ruf wird Licht sagen, aber noch schweigt die Szene.",
    ],
    movementSteps: [
      { id: "tehom", label: "Tiefe", href: "/codex/tehom" },
      { id: "majim", label: "Wasser", href: "/codex/majim" },
      { id: "ruach", label: "Ruach", href: "/codex/ruach" },
      { id: "genesis-1-3", label: "Licht", href: "/codex/genesis-1-3" },
    ],
    symbols: [
      { id: "tehom", label: "Tiefe", href: "/codex/tehom" },
      { id: "majim", label: "Wasser", href: "/codex/majim" },
      { id: "ruach", label: "Geist", href: "/codex/ruach" },
      { id: "verborgenheit", label: "Verborgenheit", href: "/codex/verborgenheit" },
      { id: "uebergang", label: "Schwelle", href: "/codex/uebergang" },
    ],
    meaningFieldIds: ["depth", "chaos", "hiddenness", "transition", "presence", "birth"],
    contemplativeTrace: "Nimm die Tiefe nicht als Mangel. Hoere, wie ueber ihr schon Bewegung ist.",
    roomNotes: {
      wasser: "Diese Stelle oeffnet den Wasser-Raum: Tiefe, Majim und Ruach werden zur zentralen Bibelwurzel.",
      "genesis-1-3": "Aus dem beruehrten Ungeformten fuehrt die Achse zum gerufenen Licht.",
    },
  },
  "genesis-1-3": {
    formula: "Licht",
    threshold: "Aus der beruehrten Tiefe tritt das Wort hervor. Licht wird gerufen, und das Erste erscheint.",
    sceneSentences: [
      "Die Tiefe bleibt der Herkunftsraum.",
      "Das Sprechen wird Ereignis: Jehi or, und Licht wird.",
      "Mit dem Licht beginnt Unterscheidung, Orientierung und Offenbarung.",
    ],
    movementSteps: [
      { id: "davar", label: "Wort", href: "/codex/davar" },
      { id: "or", label: "Licht", href: "/codex/or" },
      { id: "offenbarung", label: "Offenbarung", href: "/codex/offenbarung" },
      { id: "ordnung", label: "Trennung", href: "/codex/ordnung" },
    ],
    symbols: [
      { id: "davar", label: "Wort", href: "/codex/davar" },
      { id: "or", label: "Licht", href: "/codex/or" },
      { id: "offenbarung", label: "Offenbarung", href: "/codex/offenbarung" },
      { id: "ordnung", label: "Ordnung", href: "/codex/ordnung" },
      { id: "erkenntnis", label: "Erkenntnis", href: "/codex/erkenntnis" },
    ],
    meaningFieldIds: ["word", "light", "revelation", "awareness", "guidance", "presence"],
    contemplativeTrace: "Lass das Licht zuerst erscheinen, bevor du es erklaerst.",
    roomNotes: {
      licht: "Diese Stelle oeffnet den Licht-Raum: Wort, Jehi und Or werden zur zentralen Bibelwurzel.",
    },
  },
  "exodus-14": {
    formula: "Schwelle",
    threshold: "Das Wasser wird zur Schwelle. Der Weg entsteht dort, wo kein Weg war.",
    sceneSentences: [
      "Das Wasser steht vor den Fliehenden wie eine Grenze.",
      "Angst, Tiefe und Rettung liegen im selben Raum.",
      "Der Weg entsteht dort, wo kein Weg war.",
    ],
    movementSteps: [
      { id: "majim", label: "Wasser", href: "/codex/majim" },
      { id: "schilfmeer", label: "Schwelle", href: "/codex/schilfmeer" },
      { id: "offenbarung", label: "Rettung", href: "/codex/offenbarung" },
      { id: "midbar", label: "Freie Weite", href: "/codex/midbar" },
    ],
    symbols: [
      { id: "majim", label: "Wasser", href: "/codex/majim" },
      { id: "schilfmeer", label: "Schwelle", href: "/codex/schilfmeer" },
      { id: "midbar", label: "Wuestenweg", href: "/codex/midbar" },
    ],
    roomNotes: {
      wasser: "Der Wasser-Raum wird hier zur Schwelle zwischen Angst und Rettung.",
      midbar: "Hinter dem Wasser beginnt der freie, offene Weg.",
    },
  },
};


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

  return buildOntologyRelationItems(entry.id, sortOntologyRelations(Array.from(relationsById.values())));
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

function compactSentence(value: string) {
  const text = value.replace(/\s+/g, " ").trim();

  if (!text) return "";

  const sentence = text.match(/^[^.!?]+[.!?]/)?.[0] ?? text;
  return sentence.length > 150 ? `${sentence.slice(0, 147).trim()}...` : sentence;
}

function includesMeaningText(container: string | null | undefined, value: string | null | undefined) {
  return Boolean(container?.trim() && value?.trim() && normalizeText(container).includes(normalizeText(value)));
}

function formatJourneyMovement(ids: string[]) {
  return ids.map((id) => getOntologyEntityTitle(id)).join(" -> ");
}

function getJourneyHintForRelation(sourceId: string, targetId: string) {
  const resonanceJourney = getJourneysForNode(sourceId).find((journey) => journey.nodePath.includes(targetId));

  if (resonanceJourney) {
    return `Teil der Bewegung ${formatJourneyMovement(resonanceJourney.nodePath)}`;
  }

  const codexJourney = codexRegistry
    .filter((entry) => entry.type === "journey" && entry.steps?.length)
    .find((journey) => {
      const stepIds = journey.steps?.map((step) => step.codexId) ?? [];
      return stepIds.includes(sourceId) && stepIds.includes(targetId);
    });

  if (codexJourney?.steps?.length) {
    return `Teil der Bewegung ${codexJourney.steps.map((step) => step.label).join(" -> ")}`;
  }

  return undefined;
}

const ONTOLOGY_CURATION_TYPE_WEIGHT: Partial<Record<OntologyRelation["type"], number>> = {
  opens_into: 30,
  reveals: 28,
  emerges_from: 26,
  source_of: 25,
  gives_rise_to: 25,
  structures_journey: 24,
  contains_pattern: 22,
  is_threshold_to: 21,
  is_expression_of: 19,
  appears_in_story: 18,
  shares_letter: 16,
  shares_number: 16,
  resonates_with: 14,
  belongs_to: 10,
};

const CODEX_CURATION_TYPE_WEIGHT: Partial<Record<CodexRelation["type"], number>> = {
  "continues-journey": 30,
  "anchors-scripture": 28,
  "has-hebrew-word": 26,
  "contains-letter": 24,
  symbolizes: 23,
  reveals: 22,
  "shares-meaning": 20,
  "gives-rise-to": 20,
  "source-of": 20,
  "leads-to": 18,
  transforms: 18,
  related: 10,
};

function sharedMeaningFieldScore(entry: CodexEntry, targetId: string) {
  const targetEntry = resolveLinkedCodexEntry(targetId);

  if (!targetEntry) return 0;

  const entryFields = new Set(entry.meaningFields);
  return targetEntry.meaningFields.some((field) => entryFields.has(field)) ? 12 : 0;
}

function scoreOntologyRelation(entry: CodexEntry, item: OntologyRelationItem) {
  const strength = item.relation.strength ? item.relation.strength * 100 : 0;
  const sourceBonus = item.relation.sourceId === entry.id ? 8 : 0;
  const journeyBonus = getJourneyHintForRelation(entry.id, item.endpoint.id) ? 18 : 0;
  const roomBonus = entry.symbolRoomSlug && [item.relation.sourceId, item.relation.targetId].includes(entry.symbolRoomSlug) ? 10 : 0;
  const directEntityBonus = getOntologyEntity(entry.id) ? 8 : 0;

  return strength + (ONTOLOGY_CURATION_TYPE_WEIGHT[item.relation.type] ?? 0) + sourceBonus + journeyBonus + roomBonus + directEntityBonus;
}

function scoreCodexRelation(entry: CodexEntry, relation: CodexRelation) {
  const target = relationTarget(relation);
  const strength = relation.strength ? relation.strength * 100 : 0;
  const journeyBonus = getJourneyHintForRelation(entry.id, target) ? 18 : 0;
  const roomBonus = target === entry.symbolRoomSlug ? 10 : 0;

  return strength
    + (CODEX_CURATION_TYPE_WEIGHT[relation.type] ?? 0)
    + sharedMeaningFieldScore(entry, target)
    + journeyBonus
    + roomBonus;
}

function buildCuratedRelationItems(
  entry: CodexEntry,
  excludedRelationIds: Set<string> = new Set<string>(),
): CuratedRelationItem[] {
  const ontologyItems = getOntologyResonance(entry)
    .filter(({ relation }) => !excludedRelationIds.has(relation.id))
    .map((item): CuratedRelationItem => ({
      kind: "ontology",
      key: `ontology-${item.relation.id}`,
      endpointId: item.endpoint.id,
      endpointLabel: item.endpoint.label,
      endpointHref: item.endpoint.href,
      relationLabel: item.label,
      markerLabel: item.markerLabel,
      sentence: compactSentence(item.note || item.explanation || item.relation.shortResonance || item.relation.title),
      explanation: item.explanation,
      journeyHint: getJourneyHintForRelation(entry.id, item.endpoint.id),
      score: scoreOntologyRelation(entry, item),
      relation: item.relation,
    }));

  const codexItems = getVisibleCodexRelations(entry).map((relation, index): CuratedRelationItem => {
    const target = relationTarget(relation);
    const linkedEntry = resolveLinkedCodexEntry(target);
    const targetLabel = linkedEntry?.title ?? resolveTargetLabel(target);
    const relationNote = getDisplayRelationNote(relation, targetLabel);

    return {
      kind: "codex",
      key: `codex-${relation.type}-${target}-${index}`,
      endpointId: target,
      endpointLabel: targetLabel,
      endpointHref: linkedEntry ? `/codex/${linkedEntry.id}` : undefined,
      relationLabel: formatRelationType(relation.type),
      markerLabel: relation.source === "journey" ? "Wegspur" : relation.source === "hebrew-letter" || relation.source === "hebrew-word" ? "Hebräisch" : "Resonanz",
      sentence: compactSentence(relationNote || relation.label || `${entry.title} gehört mit ${targetLabel} zusammen.`),
      explanation: "",
      journeyHint: getJourneyHintForRelation(entry.id, target),
      score: scoreCodexRelation(entry, relation),
      relation,
    };
  });

  return [...ontologyItems, ...codexItems]
    .sort((left, right) => right.score - left.score || left.endpointLabel.localeCompare(right.endpointLabel, "de-DE"));
}

function getScriptureReferenceTerms(entry: CodexEntry) {
  return new Set([
    entry.id,
    entry.title,
    entry.subtitle,
    ...entry.scriptureAnchors.flatMap((anchor) => [anchor.id, anchor.reference, anchor.label]),
  ].filter((value): value is string => Boolean(value)));
}

function getSceneSentences(entry: CodexEntry) {
  return entry.summary
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function getHebrewKeysForScripture(entry: CodexEntry) {
  const referenceTerms = getScriptureReferenceTerms(entry);
  const relationTargets = new Set(entry.relations.map(relationTarget));
  const words = hebrewWords.filter((word) => (
    relationTargets.has(word.id) ||
    word.biblicalReferences.some((reference) => (
      referenceTerms.has(reference.id) ||
      referenceTerms.has(reference.reference) ||
      referenceTerms.has(reference.relation)
    ))
  ));
  const relationOrder = new Map(entry.relations.map((relation, index) => [relationTarget(relation), index]));

  return words
    .sort((left, right) => (
      (relationOrder.get(left.id) ?? 99) - (relationOrder.get(right.id) ?? 99) ||
      left.transliteration.localeCompare(right.transliteration, "de-DE")
    ))
    .slice(0, 8);
}

function getScriptureJourneys(entry: CodexEntry) {
  const codexJourneys = codexRegistry
    .filter((candidate) => candidate.type === "journey" && (
      entry.journeyIds.includes(candidate.id) ||
      candidate.meta.sourceIds.includes(entry.id) ||
      candidate.relations.some((relation) => relationTarget(relation) === entry.id) ||
      candidate.scriptureAnchors.some((anchor) => anchor.id === entry.id)
    ))
    .map((journey) => ({
      id: journey.id,
      title: journey.title,
      steps: journey.steps?.map((step) => ({ id: step.codexId, label: step.label, href: `/codex/${step.codexId}` })) ?? [],
      score: (journey.steps?.length ?? 0) + (journey.meta.sourceIds.includes(entry.id) ? 5 : 0),
    }));
  const meaningJourneyItems = meaningJourneys
    .filter((journey) => entry.journeyIds.includes(journey.id) || journey.biblicalReferences.includes(entry.id))
    .map((journey) => ({
      id: journey.id,
      title: journey.title,
      steps: journey.symbolPath.map((symbolId) => ({
        id: symbolId,
        label: resolveTargetLabel(symbolId),
        href: resolveLinkedCodexEntry(symbolId) ? `/codex/${symbolId}` : undefined,
      })),
      score: journey.symbolPath.length,
    }));

  return [...codexJourneys, ...meaningJourneyItems]
    .filter((journey) => journey.steps.length > 0)
    .sort((left, right) => right.score - left.score || right.steps.length - left.steps.length);
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function getScriptureSymbols(entry: CodexEntry, relations: CuratedRelationItem[]) {
  return uniqueById([
    ...relations.map((item) => ({
      id: item.endpointId,
      label: item.endpointLabel,
      href: item.endpointHref,
    })),
    ...entry.relations.map((relation) => {
      const target = relationTarget(relation);
      const linkedEntry = resolveLinkedCodexEntry(target);

      return {
        id: target,
        label: linkedEntry?.title ?? resolveTargetLabel(target),
        href: linkedEntry ? `/codex/${linkedEntry.id}` : undefined,
      };
    }),
  ]).slice(0, 5);
}


function getPreparedRoomsForScripture(entry: CodexEntry, journeys: ReturnType<typeof getScriptureJourneys>) {
  const formula = SCRIPTURE_SCENE_FORMULAS[entry.id];
  const fromJourney = journeys.flatMap((journey) => journey.steps);
  const fromRoom = entry.symbolRoomSlug
    ? [{
        id: entry.symbolRoomSlug,
        label: resolveTargetLabel(entry.symbolRoomSlug),
        href: hasSymbolRoom(entry.symbolRoomSlug)
          ? buildRoomHref(entry.symbolRoomSlug, { from: "codex", path: entry.id, symbol: entry.symbolRoomSlug })
          : `/codex/${entry.symbolRoomSlug}`,
      }]
    : [];

  return uniqueById([...fromRoom, ...fromJourney])
    .filter((item) => item.id !== entry.id)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      note: formula?.roomNotes?.[item.id] ?? `${entry.title} oeffnet diesen Raum als naechste Spur der Szene.`,
    }));
}

function buildScriptureSceneModel(entry: CodexEntry): ScriptureSceneModel | null {
  if (entry.type !== "scripture") {
    return null;
  }

  const relations = buildCuratedRelationItems(entry);
  const journeys = getScriptureJourneys(entry);
  const primaryJourney = journeys[0];
  const formula = SCRIPTURE_SCENE_FORMULAS[entry.id];
  const verseLayer = getGenesisVerseLetterLayer(entry.id);

  return {
    formula: formula?.formula ?? "Szene",
    threshold: formula?.threshold ?? getCodexThresholdText(entry),
    sceneSentences: formula?.sceneSentences ?? getSceneSentences(entry),
    meaningFields: (formula?.meaningFieldIds ?? entry.meaningFields)
      .slice(0, 6)
      .map((id) => ({ id, label: getMeaningFieldLabel(id) })),
    contemplativeTrace: formula?.contemplativeTrace,
    foundation: buildScriptureFoundationModel(entry),
    hebrewKeys: getHebrewKeysForScripture(entry),
    movementSteps: formula?.movementSteps ?? primaryJourney?.steps.slice(0, 6) ?? relations.slice(0, 4).map((item) => ({
      id: item.endpointId,
      label: item.endpointLabel,
      href: item.endpointHref,
    })),
    journeyTitle: primaryJourney?.title,
    symbols: formula?.symbols ?? getScriptureSymbols(entry, relations),
    rooms: getPreparedRoomsForScripture(entry, journeys),
    verseLetters: verseLayer?.focusLetterIds.slice(0, 8).map((letterId) => {
      const letter = hebrewLetters.find((candidate) => candidate.id === letterId);
      const linkedEntry = resolveLinkedCodexEntry(letterId);

      return {
        id: letterId,
        glyph: letter?.glyph ?? letterId,
        name: letter?.name ?? humanizeId(letterId),
        note: getGenesisLetterProfile(letterId)?.shortEssence ?? letter?.archetypalMeanings.slice(0, 2).join(" / ") ?? "",
        href: linkedEntry ? `/codex/${linkedEntry.id}` : undefined,
      };
    }) ?? [],
    verseLetterNote: verseLayer?.note,
    relations,
  };
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
  const genesisWords = getGenesisWordsForLetter(letter.id);
  const words = [
    ...hebrewWords.filter((word) => letter.relatedWordIds.includes(word.id) || relationTargets.has(word.id)),
    ...genesisWords,
  ].filter((word, index, allWords) => allWords.findIndex((candidate) => candidate.id === word.id) === index);
  const symbolRelations = entry.relations.filter((relation) => relation.type === "symbolizes");
  const genesisProfile = getGenesisLetterProfile(letter.id);
  const essence = entry.summary || letter.symbolism[0]?.description || letter.archetypalMeanings.join(", ");
  const movement = genesisProfile && !includesMeaningText(entry.summary, genesisProfile.deeperMeaning)
    ? genesisProfile.deeperMeaning
    : "";

  return {
    letter,
    glyph: entry.hebrew ?? letter.glyph,
    transliteration: entry.transliteration ?? letter.transcription,
    numericValue: letter.numericValue,
    words,
    symbolRelations,
    genesisProfile,
    genesisWords,
    essence,
    movement,
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

function getCodexThresholdText(entry: CodexEntry, entity?: OntologyEntity) {
  const scriptureFormula = SCRIPTURE_SCENE_FORMULAS[entry.id];

  if (scriptureFormula) {
    return scriptureFormula.threshold;
  }

  if (entry.type === "hebrew-word") {
    return hebrewWords.find((word) => word.id === entry.id)?.meaningThreshold
      ?? "Dieses hebräische Wort öffnet einen Bedeutungsraum, der Klang, Schrift und Erfahrung zusammenführt.";
  }

  if (resolveCodexGenre(entry, entity)) return GENRE_COPY[resolveCodexGenre(entry, entity)].threshold;

  if (entity?.domain === "pattern") {
    return "Dieses Muster lohnt sich, weil es Bedeutung nicht als Begriff zeigt, sondern als Bewegung. Wer eintritt, sieht, wodurch ein Raum zum nächsten Raum wird.";
  }

  if (entity && isCoreConceptId(entity.id)) {
    return "Diese Achse sammelt mehrere Wege, ohne sie zu verschmelzen. Wer eintritt, erkennt, welche Bewegungen hier zusammenlaufen und wohin sie weiterführen.";
  }

  const texts: Record<CodexEntryType, string> = {
    "hebrew-letter": "Dieser Buchstabe ist klein, aber nicht schmal. Wer ihn betritt, begegnet einem Zeichenkörper, in dem Zahl, Wort und Symbol leise zusammenklingen.",
    "hebrew-word": "Dieses hebräische Wort öffnet einen Bedeutungsraum, der Klang, Schrift und Erfahrung zusammenführt.",
    journey: "Diese Spur will nicht erklären, sondern führen. Wer eintritt, geht von Station zu Station und merkt, welche Bedeutung unterwegs Gestalt gewinnt.",
    meaning: "Dieses Bedeutungsfeld ist ein stiller Sammlungsraum. Wer eintritt, sieht, welche Symbole, Worte und Stellen hier aufeinander antworten.",
    "meaning-field": "Dieses Bedeutungsfeld ist ein stiller Sammlungsraum. Wer eintritt, sieht, welche Symbole, Worte und Stellen hier aufeinander antworten.",
    number: "Diese Zahl ist hier kein Rechenwert, sondern ein Resonanzkörper. Wer eintritt, sieht, welche Buchstaben, Worte und Symbole durch sie berührt werden.",
    scripture: "Diese Stelle ist keine isolierte Referenz. Wer eintritt, steht in einer Szene, aus der hebräische Schlüssel, Symbole und Bewegungen hervortreten.",
    symbol: "Dieses Symbol lohnt sich, weil es mehr ist als ein Bild. Wer es betritt, folgt einer inneren Bewegung durch Hebräisch, Thora und nahe Resonanzen.",
  };

  return texts[entry.type];
}

function ThresholdSection({ entry, entity }: { entry: CodexEntry; entity?: OntologyEntity }) {
  const genre = resolveCodexGenre(entry, entity);
  const scriptureFormula = entry.type === "scripture" ? SCRIPTURE_SCENE_FORMULAS[entry.id] : undefined;

  return (
    <section className="mt-8 max-w-3xl border-l border-gold/35 pl-5">
      <p className="symbol-kicker text-gold/70">
        {scriptureFormula ? "Szenenschwelle" : "Schwelle"} / {scriptureFormula?.formula ?? GENRE_COPY[genre].formula}
      </p>
      <p className="symbol-copy mt-3 text-lg italic leading-relaxed text-foreground-strong md:text-xl">
        {getCodexThresholdText(entry, entity)}
      </p>
    </section>
  );
}

function EssenceSection({
  entry,
  entity,
  activeContext,
}: {
  entry: CodexEntry;
  entity?: OntologyEntity;
  activeContext?: CodexContextFocus;
}) {
  if (!entry.summary) {
    return null;
  }

  const title = GENRE_COPY[resolveCodexGenre(entry, entity)].essenceTitle;

  return (
    <DetailSection title={title} activeContext={activeContext}>
      <p className="symbol-copy max-w-3xl font-serif text-2xl italic leading-relaxed text-foreground-strong">
        {entry.summary}
      </p>
    </DetailSection>
  );
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
  const bridge =
    getSymbolCodexAnchorBridge("wasser", entryId) ??
    getSymbolCodexAnchorBridge("licht", entryId) ??
    getSymbolCodexAnchorBridge("feuer", entryId) ??
    getSymbolCodexAnchorBridge("wueste", entryId) ??
    getSymbolCodexAnchorBridge("brot", entryId);

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

function SymbolJourneyNoticeSection({
  journey,
  step,
}: {
  journey: SymbolJourney;
  step: SymbolJourneyStep;
}) {
  return (
    <DetailSection title="Teil einer Spur">
      <div className="grid gap-4">
        <p className="symbol-copy text-base italic text-muted-soft">
          Dieses Symbol liegt in der Spur: {journey.title}.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={SYMBOL_JOURNEY_OVERVIEW_HREF} className="symbol-archive-action">
            In Mein Pfad ansehen
          </Link>
          <Link href={step.roomHref} className="symbol-archive-action symbol-archive-action--quiet">
            Den Raum dieser Spur betreten
          </Link>
        </div>
      </div>
    </DetailSection>
  );
}

const WATER_CODEX_ESSENCE =
  "Wasser steht im SYMBOLRAUM für Tiefe, Ursprung, Reinigung und Übergang. Es erscheint vor der Ordnung und trägt das Leben, bevor es sichtbar wird.";

const WATER_CODEX_MOVEMENT = [
  { label: "Tiefe", text: "Wasser bewahrt das Verborgene unter dem Sichtbaren." },
  { label: "Ursprung", text: "Aus der Tiefe tritt Leben hervor, bevor es eine feste Gestalt hat." },
  { label: "Reinigung", text: "Wasser löst, klärt und lässt einen neuen Anfang möglich werden." },
  { label: "Übergang", text: "Es markiert die Schwelle zwischen altem Zustand und neuem Weg." },
  { label: "Leben", text: "Was in der Tiefe beginnt, wird zur Quelle und trägt Frucht." },
];

const WATER_SCRIPTURE_TRACE = [
  {
    id: "genesis-1-2",
    reference: "Genesis 1,2",
    title: "Wasser vor der Ordnung",
    note: "Die Wasser stehen am Anfang als Tiefe, über der Geist und Möglichkeit schweben.",
  },
  {
    id: "exodus-14",
    reference: "Exodus 14",
    title: "Wasser als Übergang",
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

        <ResonanceRoomInline symbolId="wasser" />

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
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebräischer Körper</p>
            <p className="mt-4 font-serif text-5xl leading-none text-gold/85" lang="he" dir="rtl">{"\u05de\u05d9\u05dd"}</p>
            <p className="mt-3 text-[0.62rem] uppercase tracking-[0.22em] text-gold/65">majim / Mem – Jod – Mem</p>
            <p className="symbol-copy mt-4 text-base italic text-muted-soft">
              Das Wort beginnt und endet mit Mem. In der Mitte steht Jod: ein Ursprungspunkt in der Tiefe.
            </p>
          </div>
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zahl</p>
            <p className="mt-4 font-serif text-3xl italic text-foreground-strong">{"\u05de\u05d9\u05dd"} = 40 + 10 + 40 = 90</p>
            <p className="symbol-copy mt-4 text-base italic text-muted-soft">
              Die Zahl 90 sammelt die Bewegung von Tiefe – Punkt – Tiefe.
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
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Aus dieser Tiefe</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={waterRoomHref} className="symbol-cta">Den Wasser-Raum betreten</Link>
            <Link href={journeyHref} className="symbol-cta symbol-cta-secondary">Erzählspur Wasser – Wüste – Brot ansehen</Link>
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
  { label: "Ruf", text: "Das Wort öffnet einen ersten Spalt von Richtung." },
  { label: "Licht", text: "Was verborgen war, tritt in Sichtbarkeit." },
  { label: "Scheidung", text: "Licht macht Unterscheidung möglich, ohne die Tiefe zu verwerfen." },
  { label: "Ordnung", text: "Konturen werden zu einer tragenden Gestalt." },
  { label: "Erkenntnis", text: "Sichtbarkeit wird innerlich wahrgenommen und deutbar." },
];

function LightCodexReferenceSection() {
  const lightBridge = getSymbolPathConfig("licht");
  const lightChipLinks = getSymbolCodexChipLinks("licht");
  const lightSymbolId = lightBridge?.symbolId ?? "licht";
  const lightAnchorId = lightBridge?.codexGates?.scriptureAnchors?.[0]?.id;
  const lightRoomHref = buildRoomHref(lightSymbolId, { from: "codex", path: lightAnchorId, symbol: lightSymbolId });

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
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebräischer Körper</p>
            <p className="mt-4 font-serif text-5xl leading-none text-gold/85" lang="he" dir="rtl">{"\u05d0\u05d5\u05e8"}</p>
            <p className="mt-3 text-[0.62rem] uppercase tracking-[0.22em] text-gold/65">Or / Aleph – Waw – Resch</p>
            <p className="symbol-copy mt-4 text-base italic text-muted-soft">
              Or trägt den stillen Anfang des Aleph, eine verbindende Mitte und das Hervortreten in Sichtbarkeit.
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

        <ResonanceRoomInline symbolId="licht" />

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
                    {anchor.label} – Es werde Licht
                  </Link>
                  <p className="symbol-copy mt-3 text-sm italic text-muted-soft">
                    Erste Lichtspur: Licht wird gerufen, nicht als Dekoration der Welt, sondern als erstes Sichtbarwerden von Ordnung.
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Aus diesem Licht</p>
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

const FIRE_CODEX_ESSENCE =
  "Feuer ist im SYMBOLRAUM die brennende Grenze zwischen Sichtbarem und Unsichtbarem: Offenbarung, Ruf, Gegenwart und klärende Wandlung.";

const FIRE_CODEX_MOVEMENT = [
  { label: "Ruf", text: "Feuer zieht nicht in Aktion, sondern in Aufmerksamkeit." },
  { label: "Flamme", text: "Was sichtbar brennt, weist auf eine tiefere Gegenwart." },
  { label: "Grenze", text: "Das Feuer markiert den Ort, an dem Nähe und Abstand zugleich wahr werden." },
  { label: "Gegenwart", text: "Im Brennen wird etwas anwesend, ohne sich verfügbar zu machen." },
  { label: "Läuterung", text: "Feuer klärt, ohne das Wesentliche auszulöschen." },
  { label: "Wandlung", text: "Was durch das Feuer geht, kehrt verwandelt in die Welt zurück." },
];

function FireCodexReferenceSection() {
  const fireBridge = getSymbolPathConfig("feuer");
  const fireChipLinks = getSymbolCodexChipLinks("feuer");
  const fireSymbolId = fireBridge?.symbolId ?? "feuer";
  const fireAnchorId = "dornbusch";
  const fireRoomHref = buildRoomHref(fireSymbolId, { from: "codex", path: fireAnchorId, symbol: fireSymbolId });

  return (
    <DetailSection title="Kuratierte Mitte">
      <div className="grid gap-8">
        <section>
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Essenz</p>
          <p className="symbol-copy mt-3 max-w-3xl font-serif text-2xl italic leading-relaxed text-foreground-strong">
            {FIRE_CODEX_ESSENCE}
          </p>
        </section>

        <section className="border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bewegungsfolge</p>
          <ol className="mt-4 grid gap-3">
            {FIRE_CODEX_MOVEMENT.map((station, index) => (
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
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebräischer Körper</p>
            <p className="mt-4 font-serif text-5xl leading-none text-gold/85" lang="he" dir="rtl">{"\u05d0\u05e9"}</p>
            <p className="mt-3 text-[0.62rem] uppercase tracking-[0.22em] text-gold/65">Esch / Aleph – Schin</p>
            <p className="symbol-copy mt-4 text-base italic text-muted-soft">
              Esch verbindet den stillen Anfang des Aleph mit dem brennenden Zeichen des Schin.
            </p>
          </div>
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zahl / Symbolik</p>
            <p className="mt-4 font-serif text-3xl italic text-foreground-strong">{"\u05d0\u05e9"} = 1 + 300 = 301</p>
            <p className="symbol-copy mt-4 text-base italic text-muted-soft">
              Die Zahl bleibt hier eine Resonanzspur: Anfang und brennende Wandlung.
            </p>
          </div>
        </section>

        {fireChipLinks.meaningFields.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bedeutungsfelder</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {fireChipLinks.meaningFields.map((field) => (
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

        <ResonanceRoomInline symbolId="feuer" />

        {fireChipLinks.scriptureAnchors.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bibelanker</p>
            <div className="mt-4 grid gap-3">
              {fireChipLinks.scriptureAnchors.map((anchor) => (
                <article key={anchor.id} className="border border-white/[0.06] bg-black/[0.1] p-4">
                  <Link
                    href={anchor.href}
                    className="font-serif text-xl italic text-foreground-strong transition-colors duration-500 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
                  >
                    {anchor.label}
                  </Link>
                  <p className="symbol-copy mt-3 text-sm italic text-muted-soft">
                    Feuer erscheint hier als Ort der Offenbarung: nicht Spektakel, sondern Gegenwart an einer Grenze.
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-white/[0.06] pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Aus diesem Feuer</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={fireRoomHref} className="symbol-cta">{fireBridge?.ctaLabels.room ?? "Den Feuerraum betreten"}</Link>
            <Link href={fireBridge?.symbolNetworkHref ?? "/symbolnetz?symbol=feuer"} className="symbol-cta symbol-cta-secondary">
              Feuer im Symbolnetz ansehen
            </Link>
          </div>
        </section>
      </div>
    </DetailSection>
  );
}

function ResonanceRoomInline({ symbolId }: { symbolId: string }) {
  const resonanceRoom = getResonanceRoom(symbolId);
  const hebrewMovement = getRoomHebrewMovement(symbolId);

  if (resonanceRoom.statements.length === 0 && !hebrewMovement) {
    return null;
  }

  return (
    <section className="border-t border-white/[0.06] pt-6">
      {hebrewMovement ? <CodexHebrewMovement movement={hebrewMovement} /> : null}
      {resonanceRoom.statements.length > 0 ? (
        <>
          <p className={hebrewMovement ? "mt-6 text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft" : "text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft"}>Resonanzraum</p>
          <ul className="mt-4 grid gap-3">
            {resonanceRoom.statements.map((statement) => (
              <li key={`${statement.type}-${statement.text}`}>
                {statement.href ? (
                  <Link
                    href={statement.href}
                    className="symbol-copy block border-l border-gold/25 pl-4 text-base italic text-foreground-strong transition-colors duration-500 hover:border-gold/45 hover:text-gold"
                  >
                    {statement.text}
                  </Link>
                ) : (
                  <p className="symbol-copy border-l border-gold/25 pl-4 text-base italic text-foreground-strong">
                    {statement.text}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function ResonanceRoomSection({ symbolId }: { symbolId: string }) {
  const resonanceRoom = getResonanceRoom(symbolId);
  const hebrewMovement = getRoomHebrewMovement(symbolId);

  if (resonanceRoom.statements.length === 0 && !hebrewMovement) {
    return null;
  }

  return (
    <DetailSection title="Resonanzraum">
      {hebrewMovement ? <CodexHebrewMovement movement={hebrewMovement} /> : null}
      {resonanceRoom.statements.length > 0 ? (
        <ul className={hebrewMovement ? "mt-6 grid gap-3" : "grid gap-3"}>
          {resonanceRoom.statements.map((statement) => (
            <li key={`${statement.type}-${statement.text}`}>
              {statement.href ? (
                <Link
                  href={statement.href}
                  className="symbol-copy block border-l border-gold/25 pl-4 text-base italic text-foreground-strong transition-colors duration-500 hover:border-gold/45 hover:text-gold"
                >
                  {statement.text}
                </Link>
              ) : (
                <p className="symbol-copy border-l border-gold/25 pl-4 text-base italic text-foreground-strong">
                  {statement.text}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </DetailSection>
  );
}

function CodexHebrewMovement({ movement }: { movement: RoomHebrewMovement }) {
  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">{movement.title}</p>
        <p className="symbol-copy mt-3 max-w-3xl font-serif text-lg italic text-gold/80">{movement.summary}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-5">
        {movement.stations.map((station, index) => (
          <Link
            key={station.id}
            href={`/codex/${station.codexId}`}
            className="group border-l border-gold/20 bg-white/[0.018] px-3 py-3 transition-colors duration-500 hover:border-gold/45 hover:bg-gold/[0.04]"
          >
            <span className="block text-[0.54rem] uppercase tracking-[0.2em] text-cyan-soft/65">{String(index + 1).padStart(2, "0")}</span>
            <span className="mt-2 block font-serif text-3xl leading-none text-gold/85" lang="he" dir="rtl">{station.hebrew}</span>
            <strong className="mt-2 block font-serif text-lg italic text-foreground-strong transition-colors duration-500 group-hover:text-gold">{station.label}</strong>
            <span className="symbol-copy mt-2 block text-sm italic text-muted-soft">{station.meaning}</span>
          </Link>
        ))}
      </div>
    </div>
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

function MeaningFieldsSection({
  entry,
  title,
  activeContext,
}: {
  entry: CodexEntry;
  title: string;
  activeContext?: CodexContextFocus;
}) {
  if (entry.meaningFields.length === 0) {
    return null;
  }

  return (
    <DetailSection title={title} activeContext={activeContext}>
      <div className="flex flex-wrap gap-2">
        {entry.meaningFields.slice(0, 6).map((field) => {
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
  const entry = resolveCodexRouteEntry(id);

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
  const entry = resolveCodexRouteEntry(id);

  if (!entry) {
    notFound();
  }

  const ontologyEntity = getOntologyEntity(entry.id);
  const activeHebrewWord = entry.type === "hebrew-word"
    ? hebrewWords.find((word) => word.id === entry.id)
    : undefined;
  const isWaterEntry = entry.id === "wasser";
  const isLightEntry = entry.id === "licht";
  const isFireEntry = entry.id === "feuer";
  const isWuesteEntry = entry.id === "wueste";
  const isBreadEntry = entry.id === "brot";
  const isScriptureEntry = entry.type === "scripture";
  const isCuratedSymbolEntry = isWaterEntry || isLightEntry || isFireEntry;
  const shouldShowStandaloneResonanceRoom = isWuesteEntry || isBreadEntry;
  const scriptureSceneModel = buildScriptureSceneModel(entry);
  const isPatternEntity = ontologyEntity?.domain === "pattern";
  const isCoreConceptEntity = ontologyEntity ? isCoreConceptId(ontologyEntity.id) : false;
  const genre = resolveCodexGenre(entry, ontologyEntity);
  const genreCopy = GENRE_COPY[genre];
  const symbolJourney = getJourneysForSymbol(entry.id)[0];
  const symbolJourneyStep = symbolJourney?.steps.find((step) => step.symbol === entry.id);
  const codexRoomHref = buildCodexRoomHref(entry);
  const codexRoomLabel = hasSymbolRoom(entry.symbolRoomSlug) ? getOntologyEntityTitle(entry.symbolRoomSlug) : undefined;
  const personalTraceSymbolSlug = resolveSymbolSlugForCodexEntry(entry);
  const personalTraceSymbolConfig = getSymbolPathConfig(personalTraceSymbolSlug);
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
  const showGenericSections = !isCuratedSymbolEntry && !isScriptureEntry && !isPatternEntity && !isCoreConceptEntity;
  const showMeaningFieldSection = !isCuratedSymbolEntry && !isScriptureEntry && !isPatternEntity && !isCoreConceptEntity;

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
            Zurück zum Codex
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
            Resonanzspur: {activePathLabel}
          </p>
        ) : null}

        <header className={`mt-10 grid gap-10 ${entry.type === "hebrew-word" ? "" : "lg:grid-cols-[1fr_auto] lg:items-start"} ${scriptureSceneModel ? "codex-scripture-hero" : ""}`}>
          <div>
            <p className="symbol-kicker text-cyan-soft">
              {scriptureSceneModel
                ? `Thora-Fundament / ${scriptureSceneModel.formula}`
                : `${isPatternEntity ? "Bewegungsmuster" : isCoreConceptEntity ? "Bedeutungsachse" : formatType(entry.type)} / ${genreCopy.formula}`}
            </p>
            {entry.type === "hebrew-word" && entry.hebrew ? (
              <>
                <h1 className="mt-6 font-serif text-6xl leading-none text-gold/90 md:text-8xl" lang="he" dir="rtl">
                  {entry.hebrew}
                </h1>
                {entry.transliteration ? (
                  <p className="mt-5 text-[0.68rem] uppercase tracking-[0.28em] text-gold/70">
                    {entry.transliteration}
                  </p>
                ) : null}
                <p className="symbol-copy mt-4 max-w-3xl font-serif text-2xl italic leading-snug text-foreground-strong md:text-3xl">
                  {activeHebrewWord?.germanMeaning ?? entry.title}
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-6 font-serif text-5xl italic leading-[0.98] text-foreground-strong md:text-7xl">
                  {scriptureSceneModel?.formula ?? entry.title}
                </h1>
                {scriptureSceneModel ? (
                  <p className="symbol-copy mt-6 max-w-3xl text-2xl italic text-gold/80 md:text-3xl">
                    {entry.title}
                    {entry.subtitle ? ` / ${entry.subtitle}` : ""}
                  </p>
                ) : entry.subtitle ? (
                  <p className="symbol-copy mt-6 max-w-3xl text-2xl italic text-gold/80 md:text-3xl">
                    {entry.subtitle}
                  </p>
                ) : null}
              </>
            )}
          </div>

          {entry.hebrew && entry.type !== "hebrew-word" ? (
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

        <ThresholdSection entry={entry} entity={ontologyEntity} />

        {!isScriptureEntry ? <PathContextCard context={pathContext} /> : null}
        {!isScriptureEntry ? <SymbolAnchorReturnCard entryId={entry.id} /> : null}

        <div className="mt-14 grid gap-5">
          <div className="grid gap-5">
            <CodexVisitTracker
              entryId={entry.id}
              entryType={entry.type}
              label={entry.title}
              roomId={entry.symbolRoomSlug}
            />
            {isWaterEntry ? <WaterCodexReferenceSection /> : null}
            {isLightEntry ? <LightCodexReferenceSection /> : null}
            {isFireEntry ? <FireCodexReferenceSection /> : null}
            {scriptureSceneModel ? <ScriptureSceneSection model={scriptureSceneModel} /> : null}
            {isScriptureEntry ? <PathContextCard context={pathContext} /> : null}
            {isScriptureEntry ? <SymbolAnchorReturnCard entryId={entry.id} /> : null}
            {entry.type === "hebrew-letter" ? <LetterResonanceSection entry={entry} activeContext={activeFocus === "hebrew" ? "hebrew" : undefined} /> : null}
            {entry.type === "number" ? <NumberResonanceSection entry={entry} activeContext={activeFocus === "gematria" ? "gematria" : undefined} /> : null}
            {isPatternEntity ? (
              <PatternCodexSection
                entity={ontologyEntity}
                entry={entry}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}
            {!isCuratedSymbolEntry && !isScriptureEntry && !isPatternEntity && entry.type !== "hebrew-letter" && entry.type !== "number" ? (
              <EssenceSection
                entry={entry}
                entity={ontologyEntity}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}
            {entry.type === "hebrew-word" ? (
              <HebrewWordIdentitySection entry={entry} activeContext={activeFocus === "hebrew" ? "hebrew" : activeFocus === "gematria" ? "gematria" : undefined} />
            ) : null}
            {!isCuratedSymbolEntry && !isScriptureEntry && entry.type !== "hebrew-letter" ? <LetterResonanceSection entry={entry} activeContext={activeFocus === "hebrew" ? "hebrew" : undefined} /> : null}
            {!isCuratedSymbolEntry && !isScriptureEntry && entry.type !== "number" ? <NumberResonanceSection entry={entry} activeContext={activeFocus === "gematria" ? "gematria" : undefined} /> : null}
            {!isCuratedSymbolEntry && !isScriptureEntry ? <JourneyStepsSection entry={entry} activeContext={activeFocus === "story" ? "story" : undefined} /> : null}
            {!isPatternEntity && isCoreConceptEntity && ontologyEntity ? (
              <CoreConceptCodexSection
                entity={ontologyEntity}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}

            {showGenericSections && ontologyEntity?.visibleHidden ? (
              <VisibleHiddenSection
                entity={ontologyEntity}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}

            {showGenericSections ? (
              <WaysBeginningSection
                entry={entry}
                activeContext={activeFocus === "story" ? "story" : undefined}
              />
            ) : null}

            {showMeaningFieldSection ? (
              <MeaningFieldsSection
                entry={entry}
                title={genreCopy.meaningFieldsTitle}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}

            {shouldShowStandaloneResonanceRoom ? <ResonanceRoomSection symbolId={entry.id} /> : null}

            {showGenericSections ? (
              <MeaningResonanceSection entry={entry} activeContext={activeFocus === "meaning" ? "meaning" : undefined} />
            ) : null}
            {entry.id === "davar" ? <DavarMidbarResonanceSection /> : null}
            {entry.id === "qol" ? (
              <DetailSection title="Die Stimme in der Wüste">
                <div className="grid gap-5">
                  <div className="grid max-w-sm gap-3 border border-gold/15 bg-gold/[0.035] p-5 text-right font-serif text-5xl leading-none text-gold" lang="he" dir="rtl">
                    <p>מדבר</p>
                    <p>קול</p>
                  </div>
                  <div className="symbol-copy grid gap-3 text-base italic text-muted-soft">
                    <p>Die Wüste erscheint äußerlich leer.</p>
                    <p>Gerade deshalb wird die Stimme hörbar.</p>
                    <p>Midbar ist nicht nur Ort des Mangels. Sie wird zum Raum des Hörens.</p>
                  </div>
                </div>
              </DetailSection>
            ) : null}
            {!isCuratedSymbolEntry && !isScriptureEntry ? <SymbolicTrailSection entry={entry} activeContext={activeFocus === "story" ? "story" : undefined} /> : null}
            {showGenericSections ? (
              <CuratedRelationsSection
                entry={entry}
                title={genreCopy.relationsTitle}
                lead={genreCopy.relationsLead}
                activeContext={activeFocus === "meaning" || activeFocus === "spaces" ? activeFocus : undefined}
                excludedRelationIds={symbolWayRelationIds}
              />
            ) : null}
            {!isCuratedSymbolEntry && !isScriptureEntry ? (
              <ScriptureAnchorsSection
                entry={entry}
                title={genreCopy.scriptureTitle}
                activeContext={activeFocus === "story" ? "story" : undefined}
              />
            ) : null}
            {symbolJourney && symbolJourneyStep ? (
              <SymbolJourneyNoticeSection journey={symbolJourney} step={symbolJourneyStep} />
            ) : null}
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
            <CodexPersonalTraceCard
              entryId={entry.id}
              symbolSlug={personalTraceSymbolSlug}
              roomHref={personalTraceSymbolConfig?.roomHref}
              journeyTitle={symbolJourney?.title}
            />
            {showGenericSections ? (
              <OntologyMetadataSection
                entity={ontologyEntity}
                activeContext={activeFocus === "meaning" ? "meaning" : undefined}
              />
            ) : null}
          </div>

          <aside className="grid content-start gap-5 md:grid-cols-2">
            <DetailSection title="Archiv">
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
                        Den {codexRoomLabel}-Raum betreten
                      </Link>
                    }
                  />
                ) : null}
                {entry.journeyIds.length > 0 ? (
                  <FieldRow label="Pfadbezug" value="Kuratiert" />
                ) : null}
              </dl>
            </DetailSection>

            {!isCuratedSymbolEntry && !isCoreConceptEntity ? <NearbyEntriesSection entry={entry} title={genreCopy.nearbyTitle} /> : null}
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
    <DetailSection title="Symbolische Identität" activeContext={activeContext}>
      <div className="grid gap-6">
        {entity.hebrew || entity.transliteration || entity.gematria !== undefined ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            {entity.hebrew ? (
              <div className="border border-gold/15 bg-gold/[0.035] p-4">
                <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebräisch</dt>
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
                <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zahlkörper</dt>
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
              label="Erste Erwähnung"
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
    <DetailSection title="Spur" activeContext={activeContext}>
      {entryStep ? (
        <div className="mb-5 border border-gold/15 bg-gold/[0.035] px-4 py-4">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Eintritt</p>
          <p className="mt-3 font-serif text-2xl italic text-foreground-strong">{entryStep.label}</p>
          {entryStep.description ? <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{entryStep.description}</p> : null}
        </div>
      ) : null}

      <div className="mb-5 border border-white/[0.065] bg-black/10 px-4 py-4">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Spurenfolge</p>
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
                      Den {getOntologyEntityTitle(linkedEntry.symbolRoomSlug)}-Raum betreten
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
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Diese Spur öffnet sich zu</p>
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

function HebrewWordIdentitySection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  if (!entry.hebrew) {
    return null;
  }

  const breakdown = breakdownHebrewWord(entry.hebrew);
  const word = hebrewWords.find((candidate) => candidate.id === entry.id);
  const movement = getGenesisWordMovement(entry.id);

  return (
    <DetailSection title="Hebräischer Körper" activeContext={activeContext}>
      <div className="grid gap-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="border border-gold/15 bg-gold/[0.035] p-4">
            <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebräisch</dt>
            <dd className="mt-3 font-serif text-4xl leading-none text-gold/90" lang="he" dir="rtl">
              {entry.hebrew}
            </dd>
          </div>
          <div className="border border-white/[0.06] bg-black/[0.12] p-4">
            <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Umschrift</dt>
            <dd className="mt-3 text-sm uppercase tracking-[0.18em] text-foreground-strong">
              {entry.transliteration}
            </dd>
          </div>
          <div className="border border-white/[0.06] bg-black/[0.12] p-4">
            <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zahlkörper</dt>
            <dd className="mt-3 font-serif text-4xl italic leading-none text-gold/85">
              {breakdown.value}
            </dd>
          </div>
        </dl>

        {breakdown.letters.length > 0 ? (
          <div className="border-t border-white/[0.06] pt-5">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Buchstabenbewegung</p>
            {movement ? (
              <p className="symbol-copy mt-3 max-w-3xl font-serif text-xl italic leading-relaxed text-foreground-strong">
                {movement.movement}
              </p>
            ) : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-3" dir="rtl">
              {breakdown.letters.map((letterBreakdown, index) => {
                const letterId = movement?.letters[index]?.letterId ?? word?.letterIds[index];
                const letter = letterId ? hebrewLetters.find((candidate) => candidate.id === letterId) : undefined;
                const meanings = letter?.archetypalMeanings.length ? letter.archetypalMeanings : letter?.experienceFields ?? [];
                const role = movement?.letters[index]?.role;
                const displayedGlyph = movement?.letters[index]?.form ?? letterBreakdown.letter;
                const linkedEntry = letterId ? resolveLinkedCodexEntry(letterId) : undefined;
                const card = (
                  <article className="h-full border border-white/[0.06] bg-black/[0.12] p-4 transition-colors duration-500" dir="ltr">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">{letter?.name ?? letterId ?? "Buchstabe"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gold/70">{letterBreakdown.value}</p>
                      </div>
                      <p className="font-serif text-4xl leading-none text-gold" lang="he" dir="rtl">{displayedGlyph}</p>
                    </div>
                    {role ? (
                      <p className="symbol-copy mt-4 text-sm italic text-foreground-strong/82">{role}</p>
                    ) : null}
                    {meanings.length > 0 ? (
                      <p className="symbol-copy mt-4 text-sm italic text-muted-soft">{meanings.slice(0, 3).join(" / ")}</p>
                    ) : null}
                  </article>
                );

                return linkedEntry ? (
                  <Link
                    key={`${entry.id}-${letterBreakdown.letter}-${index}`}
                    href={`/codex/${linkedEntry.id}`}
                    className="block hover:[&>article]:border-gold/30 hover:[&>article]:bg-gold/[0.035]"
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={`${entry.id}-${letterBreakdown.letter}-${index}`}>{card}</div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </DetailSection>
  );
}

function DavarMidbarResonanceSection() {
  return (
    <DetailSection title="Das Wort in der Wüste">
      <div className="grid gap-5">
        <div className="grid max-w-sm gap-3 border border-gold/15 bg-gold/[0.035] p-5 text-right font-serif text-5xl leading-none text-gold" lang="he" dir="rtl">
          <p>מדבר</p>
          <p>דבר</p>
        </div>
        <div className="symbol-copy grid gap-3 text-base italic text-muted-soft">
          <p>Im hebräischen Wort Midbar (Wüste) erscheint Davar (Wort) fast vollständig.</p>
          <p>Die Wüste ist deshalb nicht nur ein Ort der Leere.</p>
          <p>Sie ist der Raum, in dem das Wort hörbar wird.</p>
        </div>
      </div>
    </DetailSection>
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
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Symbole</p>
            <MeaningResonanceLinkList items={resonance.symbols.slice(0, 4)} emptyText="Noch keine Symbole verbunden." />
          </div>

          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebräische Knoten</p>
            <MeaningResonanceLinkList items={resonance.hebrewNodes.slice(0, 4)} emptyText="Noch keine hebräischen Knoten verbunden." />
          </div>
        </div>

        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Thora- und Scripture-Anker</p>
          {resonance.scripture.length > 0 ? (
            <div className="mt-3 grid gap-3">
              {resonance.scripture.slice(0, 4).map((anchor) => {
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
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Mögliche Resonanzen</p>
          <MeaningResonanceLinkList items={resonance.onward.slice(0, 6)} emptyText="Noch keine Resonanzen verbunden." />
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
            Zahlkörper
          </p>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Buchstaben</p>
              <ResonanceLinkList items={resonance.letters.slice(0, 4)} emptyText="Noch keine Buchstaben verbunden." />
            </div>

            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Wörter</p>
              <ResonanceLinkList items={resonance.words.slice(0, 4)} emptyText="Noch keine Wörter verbunden." />
            </div>

            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Symbole</p>
              <ResonanceLinkList items={resonance.symbols.slice(0, 4)} emptyText="Noch keine Symbole verbunden." />
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

  const roomRelations = (resonance.genesisProfile?.roomIds ?? []).map((targetId) => ({
    targetId,
    type: "symbolizes" as const,
    label: "Tragender Buchstabe dieses Raums.",
    source: "hebrew-letter" as const,
  }));
  const symbolAndRoomRelations = [...resonance.symbolRelations, ...roomRelations]
    .filter((relation, index, relations) => relations.findIndex((candidate) => candidate.targetId === relation.targetId) === index);

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
              Zahlkörper {resonance.numericValue}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Symbolische Essenz</p>
            <p className="symbol-copy mt-3 text-base italic text-foreground-strong">
              {resonance.essence}
            </p>
            {resonance.genesisProfile ? (
              <div className="symbol-copy mt-4 grid gap-2 text-sm italic leading-relaxed text-muted-soft">
                {resonance.movement ? <p>{resonance.movement}</p> : null}
                <p><span className="text-gold/72">Spur in Genesis 1,1-3:</span> {resonance.genesisProfile.genesisRole}</p>
                <p className="text-gold/78">{resonance.genesisProfile.contemplative}</p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Wörter</p>
              <p className="mt-2 text-[0.58rem] uppercase tracking-[0.24em] text-gold/70">Erste Schriftspur</p>
              {resonance.words.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {resonance.words.slice(0, 4).map((word) => {
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
                <p className="symbol-copy mt-3 text-sm italic text-muted-soft">Noch keine Wörter verbunden.</p>
              )}
            </div>

            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verbundene Symbole</p>
              {symbolAndRoomRelations.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {symbolAndRoomRelations.slice(0, 4).map((relation, index) => {
                    const linkedEntry = resolveLinkedCodexEntry(relation.targetId);
                    const label = linkedEntry?.title ?? relation.targetId;

                    return linkedEntry ? (
                      <Link
                        key={`${relation.type}-${relation.targetId}-${index}`}
                        href={`/codex/${linkedEntry.id}`}
                        className="border border-gold/15 bg-gold/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold/80 transition-colors duration-500 hover:border-gold/30 hover:text-gold"
                      >
                        {label}
                      </Link>
                    ) : (
                      <span key={`${relation.type}-${relation.targetId}-${index}`} className="border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-soft">
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
          {resonance.genesisProfile ? (
            <div className="border-t border-white/[0.06] pt-5">
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bedeutungsfelder und Nachbarzeichen</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {resonance.genesisProfile.meaningFieldLabels.slice(0, 3).map((label) => (
                  <span key={label} className="border border-cyan-soft/15 bg-cyan-soft/[0.035] px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-soft/78">
                    {label}
                  </span>
                ))}
                {resonance.genesisProfile.relatedLetterIds.slice(0, Math.max(0, 6 - resonance.genesisProfile.meaningFieldLabels.slice(0, 3).length)).map((letterId) => {
                  const letter = hebrewLetters.find((candidate) => candidate.id === letterId);
                  const linkedEntry = resolveLinkedCodexEntry(letterId);
                  const label = letter?.name ?? humanizeId(letterId);

                  return linkedEntry ? (
                    <Link
                      key={letterId}
                      href={`/codex/${linkedEntry.id}`}
                      className="border border-gold/15 bg-gold/[0.035] px-3 py-2 text-xs uppercase tracking-[0.16em] text-gold/78 transition-colors duration-500 hover:border-gold/30 hover:text-gold"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span key={letterId} className="border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted-soft">
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}
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
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Was hier sichtbar wird</p>
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
    <DetailSection title="Spuren, die sich hier öffnen" activeContext={activeContext}>
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
    <ol className="mt-3 grid gap-1 text-[0.58rem] uppercase tracking-[0.2em] text-gold/65 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
      {steps.map((step, index) => (
        <li key={`${step}-${index}`} className="flex items-center gap-2">
          <span>{step}</span>
          {index < steps.length - 1 ? (
            <span className="text-cyan-soft/60" aria-hidden="true">
              <span className="sm:hidden">&darr;</span>
              <span className="hidden sm:inline">-&gt;</span>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
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
  const primaryResonance = resonance.slice(0, 3);
  const archiveResonance = resonance.slice(3);
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
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Was hier sichtbar wird</p>
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
                  title="Spur öffnen"
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
                    note="Diese Bewegung öffnet sich in diese Richtung."
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
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Die drei nächsten Beziehungen</p>
            <div className="mt-4 grid gap-3">
              {primaryResonance.map(({ relation, endpoint, label, markerLabel, note, explanation }) => (
                <article key={relation.id} className="border border-white/[0.06] bg-black/[0.1] p-4">
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
              {archiveResonance.length > 0 ? (
                <details className="border border-gold/15 bg-gold/[0.025] p-4">
                  <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.2em] text-gold/80">
                    Weitere Resonanzen öffnen
                  </summary>
                  <div className="mt-4 grid gap-3">
                    {archiveResonance.map(({ relation, endpoint, label, markerLabel, note, explanation }) => (
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

function CuratedRelationCard({ item, spacious = false }: { item: CuratedRelationItem; spacious?: boolean }) {
  const endpoint = item.endpointHref ? (
    <Link
      href={item.endpointHref}
      className="font-serif text-2xl italic text-foreground-strong transition-colors duration-500 hover:text-gold md:text-3xl"
    >
      {item.endpointLabel}
    </Link>
  ) : (
    <p className="font-serif text-2xl italic text-foreground-strong md:text-3xl">{item.endpointLabel}</p>
  );

  return (
    <article className={`border border-white/[0.07] bg-black/[0.12] ${spacious ? "p-5 sm:p-6" : "p-4"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="text-[0.58rem] uppercase tracking-[0.22em] text-gold/75">{item.relationLabel}</span>
        <span className="border border-cyan-soft/15 bg-cyan-soft/[0.035] px-2 py-1 text-[0.56rem] uppercase tracking-[0.16em] text-cyan-soft/75">
          {item.markerLabel}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {endpoint}
        {item.sentence ? (
          <p className="symbol-copy text-base italic leading-relaxed text-foreground-strong/82">{item.sentence}</p>
        ) : null}
        {item.explanation && item.explanation !== item.sentence ? (
          <p className="symbol-copy text-sm leading-relaxed text-muted-soft">{item.explanation}</p>
        ) : null}
        {item.journeyHint ? (
          <p className="text-[0.56rem] uppercase tracking-[0.18em] text-cyan-soft/65">{item.journeyHint}</p>
        ) : null}
      </div>
    </article>
  );
}

function CuratedRelationsSection({
  entry,
  activeContext,
  excludedRelationIds = new Set<string>(),
  title = "Bedeutende Beziehungen",
  lead = "Die drei wichtigsten Beziehungen",
}: {
  entry: CodexEntry;
  activeContext?: CodexContextFocus;
  excludedRelationIds?: Set<string>;
  title?: string;
  lead?: string;
}) {
  const relations = buildCuratedRelationItems(entry, excludedRelationIds);
  const primaryRelations = relations.slice(0, 3);
  const archiveRelations = relations.slice(3);

  if (relations.length === 0) {
    return null;
  }

  return (
    <DetailSection title={title} activeContext={activeContext}>
      <div className="grid gap-8">
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">{lead}</p>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {primaryRelations.map((item) => (
              <CuratedRelationCard key={item.key} item={item} spacious />
            ))}
          </div>
        </div>

        {archiveRelations.length > 0 ? (
          <details className="border border-gold/15 bg-gold/[0.025] p-4 sm:p-5">
            <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.2em] text-gold/80">
              Weitere Resonanzen öffnen
            </summary>
            <div className="mt-5 grid gap-3">
              {archiveRelations.map((item) => (
                <CuratedRelationCard key={`archive-${item.key}`} item={item} />
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </DetailSection>
  );
}

function SceneMovement({ steps }: { steps: ScriptureSceneModel["movementSteps"] }) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <ol className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
      {steps.map((step, index) => (
        <li key={`${step.id}-${index}`} className="grid justify-items-start gap-2 sm:flex sm:items-center sm:gap-3">
          {step.href ? (
            <Link
              href={step.href}
              className="border border-gold/15 bg-black/[0.14] px-4 py-3 font-serif text-xl italic text-foreground-strong transition-colors duration-500 hover:border-gold/35 hover:text-gold"
            >
              {step.label}
            </Link>
          ) : (
            <span className="border border-gold/15 bg-black/[0.14] px-4 py-3 font-serif text-xl italic text-foreground-strong">
              {step.label}
            </span>
          )}
          {index < steps.length - 1 ? (
            <span className="pl-5 text-sm text-cyan-soft/70 sm:pl-0" aria-hidden="true">
              <span className="sm:hidden">&darr;</span>
              <span className="hidden sm:inline">-&gt;</span>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function FoundationPillLink({ item }: { item: ScriptureFoundationLink }) {
  const className = "border border-gold/15 bg-gold/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-gold/80 transition-colors duration-500";

  return item.href ? (
    <Link href={item.href} className={`${className} hover:border-gold/35 hover:bg-gold/[0.075] hover:text-gold`}>
      {item.label}
    </Link>
  ) : (
    <span className={`${className} opacity-70`}>{item.label}</span>
  );
}

function FoundationConnectionGroup({ title, items }: { title: string; items: ScriptureFoundationLink[] }) {
  if (items.length === 0) {
    return null;
  }

  const primaryItems = items.slice(0, 3);
  const archiveItems = items.slice(3);

  return (
    <section className="border-t border-white/[0.06] pt-4">
      <p className="text-[0.56rem] uppercase tracking-[0.22em] text-muted-soft">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {primaryItems.map((item) => (
          <FoundationPillLink key={`${title}-${item.id}`} item={item} />
        ))}
      </div>
      {archiveItems.length > 0 ? (
        <details className="mt-3 border border-white/[0.055] bg-black/[0.08] px-3 py-2">
          <summary className="cursor-pointer text-[0.54rem] uppercase tracking-[0.18em] text-gold/68">
            Weitere Spuren
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {archiveItems.map((item) => (
              <FoundationPillLink key={`${title}-archive-${item.id}`} item={item} />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function FoundationWordCard({ word }: { word: ScriptureFoundationModel["words"][number] }) {
  const title = (
    <>
      <span className="block font-serif text-4xl leading-none text-gold/90" lang="he" dir="rtl">{word.hebrew}</span>
      <strong className="mt-3 block font-serif text-2xl italic text-foreground-strong">{word.transliteration}</strong>
    </>
  );
  const isPassive = word.layer === "passive";
  const movement = word.existingWord ? getGenesisWordMovement(word.existingWord.id) : undefined;

  return (
    <article className={`border p-4 sm:p-5 ${isPassive ? "border-white/[0.055] bg-white/[0.018]" : "border-white/[0.07] bg-black/[0.12]"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        {word.codexHref ? (
          <Link href={word.codexHref} className="group block transition-colors duration-500 hover:text-gold">
            {title}
          </Link>
        ) : (
          <div>{title}</div>
        )}
        {isPassive ? (
          <span className="border border-cyan-soft/15 bg-cyan-soft/[0.025] px-2 py-1 text-[0.52rem] uppercase tracking-[0.14em] text-cyan-soft/62">
            vorbereitet
          </span>
        ) : null}
      </div>
      <p className="symbol-copy mt-2 text-base italic text-muted-soft">{word.meaning}</p>
      {word.note ? <p className="symbol-copy mt-3 text-sm leading-relaxed text-foreground-strong/72">{word.note}</p> : null}
      {movement ? (
        <p className="symbol-copy mt-3 border-l border-gold/20 pl-3 text-sm italic leading-relaxed text-gold/78">
          {movement.movement}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {word.letters.map((letter, index) => {
          const step = movement?.letters[index];
          const content = (
            <>
              <span className="font-serif text-2xl leading-none text-gold/85" lang="he" dir="rtl">{step?.form ?? letter.glyph}</span>
              <span className="text-[0.5rem] uppercase tracking-[0.12em] text-muted-soft">{letter.label}</span>
              {letter.meaning ? (
                <span className="max-w-20 text-center text-[0.56rem] leading-tight text-foreground-strong/62">{letter.meaning}</span>
              ) : null}
              {step?.role ? (
                <span className="max-w-24 text-center text-[0.54rem] leading-tight text-gold/68">{step.role}</span>
              ) : null}
            </>
          );

          return letter.href ? (
            <Link
              key={`${word.transliteration}-${letter.label}-${index}`}
              href={letter.href}
              className="grid min-w-14 justify-items-center gap-1 border border-gold/20 bg-gold/[0.035] px-2 py-2 transition-colors duration-500 hover:border-gold/40 hover:bg-gold/[0.07]"
            >
              {content}
            </Link>
          ) : (
            <span key={`${word.transliteration}-${letter.label}-${index}`} className="grid min-w-14 justify-items-center gap-1 border border-white/[0.06] bg-white/[0.025] px-2 py-2 opacity-70">
              {content}
            </span>
          );
        })}
      </div>
      {word.gematria ? (
        <p className="mt-4 text-[0.56rem] uppercase tracking-[0.18em] text-cyan-soft/70">Gematria {word.gematria}</p>
      ) : null}
      {[...word.symbols, ...word.rooms, ...word.meaningFields, ...word.numbers].length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {[...word.symbols, ...word.rooms, ...word.meaningFields, ...word.numbers].map((item, index) => (
            <FoundationPillLink key={`${word.transliteration}-${item.id}-${index}`} item={item} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function ScriptureFoundationSection({ model }: { model: ScriptureFoundationModel }) {
  const coreWords = model.words.filter((word) => word.layer === "core");
  const passiveWords = model.words.filter((word) => word.layer === "passive");
  const symbolNetworkHref = model.id === "genesis-1-3"
    ? "/symbolnetz?symbol=licht&path=erste-bewegung"
    : "/symbolnetz?symbol=wasser&path=erste-bewegung";

  return (
    <section className="grid gap-8">
      <section className="grid gap-5 border border-gold/20 bg-gold/[0.035] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold/78">{model.label}</p>
          <span className="border border-cyan-soft/15 bg-cyan-soft/[0.035] px-3 py-1 text-[0.56rem] uppercase tracking-[0.16em] text-cyan-soft/75">
            {model.foundationTitle}
          </span>
        </div>
        <p className="symbol-copy max-w-3xl font-serif text-xl italic leading-relaxed text-foreground-strong sm:text-2xl md:text-3xl">
          {model.foundationSubtitle}
        </p>
        <div className="grid gap-5 border-t border-gold/15 pt-6">
          <p className="text-center font-serif text-3xl leading-relaxed text-gold/90 sm:text-4xl md:text-5xl" lang="he" dir="rtl">
            {model.hebrewText}
          </p>
          <p className="symbol-copy mx-auto max-w-3xl text-center font-serif text-xl italic leading-relaxed text-foreground-strong sm:text-2xl">
            {model.germanText}
          </p>
          <p className="symbol-copy mx-auto max-w-3xl border-t border-gold/10 pt-5 text-center text-sm leading-relaxed text-muted-soft">
            {model.sceneSummary}
          </p>
        </div>
      </section>

      <section className="border-t border-white/[0.06] pt-6">
        <div className="grid gap-2">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebraeische Schwellen</p>
          <p className="symbol-copy max-w-2xl text-sm italic leading-relaxed text-muted-soft">
            Von hier aus laesst sich die Stelle in Wort, Buchstabe, Symbol, Raum und Bedeutung betreten.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {coreWords.map((word) => (
            <FoundationWordCard key={`${word.transliteration}-${word.meaning}`} word={word} />
          ))}
        </div>
        {passiveWords.length > 0 ? (
          <details className="mt-4 border border-white/[0.06] bg-black/[0.08] p-4 sm:p-5">
            <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.2em] text-cyan-soft/70">
              Leise Tiefen dieser Stelle
            </summary>
            <p className="symbol-copy mt-3 max-w-2xl text-sm italic leading-relaxed text-muted-soft">
              Diese Spuren bleiben bewusst vorbereitet: sichtbar genug zum Wandern, aber noch nicht als eigene Hauptraeume ausgebaut.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {passiveWords.map((word) => (
                <FoundationWordCard key={`passive-${word.transliteration}-${word.meaning}`} word={word} />
              ))}
            </div>
          </details>
        ) : null}
      </section>

      {model.growingRooms.length > 0 ? (
        <section className="border-t border-white/[0.06] pt-6">
          <div className="grid gap-2">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Rueckwege und naechste Raeume</p>
            <p className="symbol-copy max-w-2xl text-sm italic leading-relaxed text-muted-soft">
              Die Stelle bleibt kein Endpunkt: sie fuehrt zurueck in den Codex, hinein in Raeume und weiter entlang der Genesis-Bewegung.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href={symbolNetworkHref}
              className="block border border-gold/15 bg-gold/[0.035] p-4 transition-colors duration-500 hover:border-gold/30 hover:bg-gold/[0.06]"
            >
              <p className="font-serif text-xl italic text-foreground-strong">Im Symbolnetz ansehen</p>
              <p className="symbol-copy mt-2 text-sm italic text-muted-soft">Zur ersten Bewegung: Ursprung, Tiefe und Licht.</p>
            </Link>
            {model.growingRooms.map((room) => (
              room.href ? (
                <Link
                  key={room.id}
                  href={room.href}
                  className="block border border-gold/15 bg-gold/[0.035] p-4 transition-colors duration-500 hover:border-gold/30 hover:bg-gold/[0.06]"
                >
                  <p className="font-serif text-xl italic text-foreground-strong">{room.label}</p>
                  <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{room.note}</p>
                </Link>
              ) : (
                <article key={room.id} className="border border-white/[0.07] bg-black/[0.1] p-4 opacity-80">
                  <p className="font-serif text-xl italic text-foreground-strong">{room.label}</p>
                  <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{room.note}</p>
                </article>
              )
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-white/[0.06] pt-6">
        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Archivspuren dieser Stelle</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FoundationConnectionGroup title="Woerter" items={model.connections.words} />
          <FoundationConnectionGroup title="Raeume" items={model.connections.rooms} />
          <FoundationConnectionGroup title="Symbole" items={model.connections.symbols} />
          <FoundationConnectionGroup title="Buchstaben" items={model.connections.letters} />
          <FoundationConnectionGroup title="Bedeutungsfelder" items={model.connections.meaningFields} />
          <FoundationConnectionGroup title="Journeys" items={model.connections.journeys} />
          <FoundationConnectionGroup title="Pattern" items={model.connections.patterns} />
          <FoundationConnectionGroup title="Zahlen" items={model.connections.numbers} />
        </div>
      </section>

    </section>
  );
}

function ScriptureSceneSection({ model }: { model: ScriptureSceneModel }) {
  const primaryRelations = model.relations.slice(0, 3);
  const archiveRelations = model.relations.slice(3);

  return (
    <DetailSection title="Ursprungskammer">
      <div className="grid gap-8">
        {model.foundation ? <ScriptureFoundationSection model={model.foundation} /> : null}

        {!model.foundation ? (
          <section className="grid gap-3">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold/70">Der Vers als Ursprungskammer / {model.formula}</p>
            <p className="symbol-copy max-w-3xl font-serif text-2xl italic leading-relaxed text-foreground-strong">
              {model.threshold}
            </p>
          </section>
        ) : null}

        {model.sceneSentences.length > 0 ? (
          <div className="symbol-copy grid max-w-3xl gap-2 border-t border-white/[0.06] pt-6 font-serif text-2xl italic leading-relaxed text-foreground-strong">
            {model.sceneSentences.map((sentence) => (
              <p key={sentence}>{sentence}</p>
            ))}
          </div>
        ) : null}

        {model.hebrewKeys.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Hebräische Schlüssel</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {model.hebrewKeys.map((word) => (
                <Link
                  key={word.id}
                  href={`/codex/${word.id}`}
                  className="group border border-white/[0.06] bg-black/[0.1] p-4 transition-colors duration-500 hover:border-gold/25 hover:bg-gold/[0.035]"
                >
                  <span className="block font-serif text-4xl leading-none text-gold/85" lang="he" dir="rtl">{word.hebrew}</span>
                  <strong className="mt-3 block font-serif text-xl italic text-foreground-strong transition-colors duration-500 group-hover:text-gold">{word.transliteration}</strong>
                  <span className="symbol-copy mt-2 block text-sm italic text-muted-soft">{word.germanMeaning}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {model.movementSteps.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Die Bewegung</p>
              {model.journeyTitle ? (
                <span className="border border-cyan-soft/15 bg-cyan-soft/[0.035] px-3 py-1 text-[0.56rem] uppercase tracking-[0.16em] text-cyan-soft/75">
                  {model.journeyTitle}
                </span>
              ) : null}
            </div>
            <div className="mt-4">
              <SceneMovement steps={model.movementSteps} />
            </div>
            {model.journeyTitle ? (
              <p className="symbol-copy mt-4 text-sm italic text-muted-soft">
                Diese Szene gehört zur Bewegung {model.movementSteps.map((step) => step.label).join(" -> ")}.
              </p>
            ) : null}
          </section>
        ) : null}

        {model.meaningFields.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Bedeutungsfelder</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {model.meaningFields.map((field) => (
                <Link
                  key={field.id}
                  href={`/codex/${field.id}`}
                  className="border border-cyan-soft/15 bg-cyan-soft/[0.035] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-soft/78 transition-colors duration-500 hover:border-cyan-soft/30 hover:bg-cyan-soft/[0.065] hover:text-cyan-soft"
                >
                  {field.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {model.verseLetters.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zeichen dieses Verses</p>
            {model.verseLetterNote ? (
              <p className="symbol-copy mt-3 max-w-3xl text-sm italic leading-relaxed text-muted-soft">
                {model.verseLetterNote}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {model.verseLetters.map((letter) => {
                const content = (
                  <>
                    <span className="font-serif text-2xl leading-none text-gold/88" lang="he" dir="rtl">{letter.glyph}</span>
                    <span className="text-[0.52rem] uppercase tracking-[0.14em] text-cyan-soft/72">{letter.name}</span>
                    <span className="max-w-28 text-center text-[0.56rem] leading-tight text-muted-soft">{letter.note}</span>
                  </>
                );

                return letter.href ? (
                  <Link
                    key={letter.id}
                    href={letter.href}
                    className="grid min-w-20 justify-items-center gap-1 border border-gold/18 bg-gold/[0.035] px-3 py-3 transition-colors duration-500 hover:border-gold/35 hover:bg-gold/[0.065]"
                  >
                    {content}
                  </Link>
                ) : (
                  <span key={letter.id} className="grid min-w-20 justify-items-center gap-1 border border-white/[0.06] bg-white/[0.025] px-3 py-3">
                    {content}
                  </span>
                );
              })}
            </div>
          </section>
        ) : null}

        {model.contemplativeTrace ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Kontemplative Spur</p>
            <p className="symbol-copy mt-3 max-w-3xl font-serif text-2xl italic leading-relaxed text-foreground-strong">
              {model.contemplativeTrace}
            </p>
          </section>
        ) : null}

        {model.symbols.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Welche Symbole erscheinen?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {model.symbols.map((symbol) => (
                symbol.href ? (
                  <Link
                    key={symbol.id}
                    href={symbol.href}
                    className="border border-gold/15 bg-gold/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold/80 transition-colors duration-500 hover:border-gold/30 hover:bg-gold/[0.075] hover:text-gold"
                  >
                    {symbol.label}
                  </Link>
                ) : (
                  <span key={symbol.id} className="border border-gold/15 bg-gold/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold/80">
                    {symbol.label}
                  </span>
                )
              ))}
            </div>
          </section>
        ) : null}

        {model.rooms.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Diese Szene öffnet</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {model.rooms.map((room) => (
                room.href ? (
                  <Link
                    key={room.id}
                    href={room.href}
                    className="block border border-gold/15 bg-gold/[0.035] p-4 transition-colors duration-500 hover:border-gold/30 hover:bg-gold/[0.06]"
                  >
                    <p className="font-serif text-xl italic text-foreground-strong">{room.label}</p>
                    <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{room.note}</p>
                  </Link>
                ) : (
                  <article key={room.id} className="border border-gold/15 bg-gold/[0.035] p-4">
                    <p className="font-serif text-xl italic text-foreground-strong">{room.label}</p>
                    <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{room.note}</p>
                  </article>
                )
              ))}
            </div>
          </section>
        ) : null}

        {primaryRelations.length > 0 ? (
          <section className="border-t border-white/[0.06] pt-6">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Verwandte Journeys / Pattern</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {primaryRelations.map((item) => (
                <CuratedRelationCard key={item.key} item={item} spacious />
              ))}
            </div>
          </section>
        ) : null}

        {archiveRelations.length > 0 ? (
          <details className="border border-gold/15 bg-gold/[0.025] p-4 sm:p-5">
            <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.2em] text-gold/80">
              Weiterführende Resonanzen öffnen
            </summary>
            <div className="mt-5 grid gap-3">
              {archiveRelations.map((item) => (
                <CuratedRelationCard key={`scripture-archive-${item.key}`} item={item} />
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

function ScriptureAnchorsSection({
  entry,
  activeContext,
  title = "Bibelanker",
}: {
  entry: CodexEntry;
  activeContext?: CodexContextFocus;
  title?: string;
}) {
  if (entry.scriptureAnchors.length === 0) {
    return null;
  }

  return (
    <DetailSection title={title} activeContext={activeContext}>
      <div className="grid gap-3">
        {entry.scriptureAnchors.slice(0, 4).map((anchor, index) => {
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

function NearbyEntriesSection({ entry, title = "Weitere TÃ¼ren" }: { entry: CodexEntry; title?: string }) {
  const nearbyEntries = getNearbyEntries(entry);
  const primaryEntries = nearbyEntries.slice(0, 3);
  const archiveEntries = nearbyEntries.slice(3);

  if (nearbyEntries.length === 0) {
    return null;
  }

  return (
    <DetailSection title={title}>
      <div className="grid gap-3">
        {primaryEntries.map((nearbyEntry) => (
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
        {archiveEntries.length > 0 ? (
          <details className="border border-gold/15 bg-gold/[0.025] p-4">
            <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.2em] text-gold/80">
              Weitere Resonanzen öffnen
            </summary>
            <div className="mt-4 grid gap-3">
              {archiveEntries.map((nearbyEntry) => (
                <Link
                  key={`archive-${nearbyEntry.id}`}
                  href={`/codex/${nearbyEntry.id}`}
                  className="block border border-white/[0.06] bg-black/[0.12] p-4 transition-colors duration-500 hover:border-gold/20 hover:bg-gold/[0.035]"
                >
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-cyan-soft">{formatType(nearbyEntry.type)}</p>
                  <p className="mt-2 font-serif text-xl italic text-foreground-strong">{nearbyEntry.title}</p>
                  <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{nearbyEntry.subtitle ?? nearbyEntry.id}</p>
                </Link>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </DetailSection>
  );
}
