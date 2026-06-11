import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { codexEntryIds, codexRegistry } from "@/lib/codex/codexRegistry";
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
  ontologyEntities,
  shouldShowOntologyExplanation,
  sortOntologyRelations,
} from "@/lib/ontology";
import type { OntologyEntity, OntologyRelation } from "@/lib/ontology";
import { getResonanceJourney } from "@/lib/resonance";
import type { MeaningNodeId } from "@/types/meaningGraph";

type CodexDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type CodexContextFocus = "overview" | "meaning" | "hebrew" | "gematria" | "story" | "spaces";
type SymbolNetworkReturnLens = "meaning" | "hebrew" | "gematria" | "story";

function formatType(type: CodexEntryType) {
  if (type === "meaning") {
    return "Bedeutung";
  }

  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatList(items: string[]) {
  return items.length > 0 ? items.join(", ") : "n/a";
}

function formatSourceKind(source: string) {
  return source
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSourceList(items: string[]) {
  return items.length > 0 ? items.map(formatSourceKind).join(", ") : "n/a";
}

function formatRelationType(type: CodexRelation["type"]) {
  const labels: Record<CodexRelation["type"], string> = {
    "anchors-scripture": "Bibelanker",
    "contains-letter": "Enthaelt Buchstaben",
    "continues-journey": "Fuehrt weiter",
    contrasts: "Kontrastiert",
    "has-hebrew-word": "Hebraeisches Wort",
    related: "Verwandt",
    "shares-meaning": "Teilt Bedeutung",
    symbolizes: "Symbolisiert",
    transforms: "Verwandelt",
  };

  return labels[type];
}

function relationTarget(relation: CodexRelation) {
  return relation.targetId || ("target" in relation && typeof relation.target === "string" ? relation.target : "");
}

function resolveLinkedCodexEntry(value: string | null | undefined) {
  return value ? resolveCodexEntry(value) : undefined;
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

  return sortOntologyRelations(Array.from(relationsById.values())).slice(0, 10).map((relation) => {
    const endpointId = relation.sourceId === entry.id ? relation.targetId : relation.sourceId;

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
    ?? target;
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
        label: linkedEntry?.title ?? hebrewWord?.transliteration ?? target,
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

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-t border-white/[0.06] py-4 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">{label}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-foreground-strong sm:text-base">{value}</dd>
    </div>
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
            <p className="symbol-kicker text-cyan-soft">{formatType(entry.type)}</p>
            <h1 className="mt-6 font-serif text-5xl italic leading-[0.98] text-foreground-strong md:text-7xl">
              {entry.title}
            </h1>
            {entry.subtitle ? (
              <p className="symbol-copy mt-6 max-w-3xl text-2xl italic text-gold/80 md:text-3xl">
                {entry.subtitle}
              </p>
            ) : null}
            <p className="symbol-copy mt-7 max-w-3xl text-lg md:text-xl">{entry.summary}</p>
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

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-5">
            <JourneyStepsSection entry={entry} activeContext={activeFocus === "story" ? "story" : undefined} />

            <DetailSection title="Bedeutungsfelder" activeContext={activeFocus === "meaning" ? "meaning" : undefined}>
              {entry.meaningFields.length > 0 ? (
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
              ) : (
                <p className="symbol-copy text-base italic text-muted-soft">Keine Bedeutungsfelder hinterlegt.</p>
              )}
            </DetailSection>

            <OntologyMetadataSection
              entity={ontologyEntity}
              activeContext={activeFocus === "meaning" ? "meaning" : undefined}
            />
            <MeaningResonanceSection entry={entry} activeContext={activeFocus === "meaning" ? "meaning" : undefined} />
            <OntologyResonanceSection entry={entry} activeContext={activeFocus === "meaning" ? "meaning" : undefined} />
            <LetterResonanceSection entry={entry} activeContext={activeFocus === "hebrew" ? "hebrew" : undefined} />
            <NumberResonanceSection entry={entry} activeContext={activeFocus === "gematria" ? "gematria" : undefined} />
            <SymbolicTrailSection entry={entry} activeContext={activeFocus === "story" ? "story" : undefined} />
            <RelationsSection entry={entry} activeContext={activeFocus === "spaces" ? "spaces" : undefined} />
            <ScriptureAnchorsSection entry={entry} activeContext={activeFocus === "story" ? "story" : undefined} />
          </div>

          <aside className="grid content-start gap-5">
            <DetailSection title="Einordnung">
              <dl>
                <FieldRow label="Typ" value={formatType(entry.type)} />
                {entry.symbolRoomSlug ? (
                  <FieldRow
                    label="Symbolraum"
                    value={
                      <Link
                        href={`/symbole/${entry.symbolRoomSlug}`}
                        className="font-serif italic text-gold/85 transition-colors duration-500 hover:text-gold"
                      >
                        {entry.title}
                      </Link>
                    }
                  />
                ) : null}
                {entry.journeyIds.length > 0 ? (
                  <FieldRow label="Pfadbezug" value="Kuratiert" />
                ) : null}
              </dl>
            </DetailSection>

            <DetailSection title="Quellen">
              <dl>
                <FieldRow label="Status" value={entry.meta.status} />
                <FieldRow label="Quellen" value={formatSourceList(entry.meta.source)} />
                {entry.meta.tags?.length ? <FieldRow label="Tags" value={formatList(entry.meta.tags)} /> : null}
                {entry.meta.notes ? <FieldRow label="Notizen" value={entry.meta.notes} /> : null}
              </dl>
            </DetailSection>

            <NearbyEntriesSection entry={entry} />
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
                <dt className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Zahlenwert</dt>
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

  return (
    <DetailSection title="Gefuehrter Pfad" activeContext={activeContext}>
      <ol className="grid gap-4">
        {entry.steps.map((step, index) => {
          const linkedEntry = resolveLinkedCodexEntry(step.codexId);

          return (
            <li key={step.id} className="grid gap-3">
              <div className="grid gap-3 border border-white/[0.065] bg-black/10 p-4 sm:grid-cols-[auto_1fr]">
                <span className="flex h-9 w-9 items-center justify-center border border-gold/20 font-serif text-lg text-gold/85">{index + 1}</span>
                <div>
                  {linkedEntry ? (
                    <Link href={`/codex/${linkedEntry.id}`} className="font-serif text-xl italic text-foreground-strong transition-colors duration-500 hover:text-gold">{step.label}</Link>
                  ) : (
                    <p className="font-serif text-xl italic text-foreground-strong">{step.label}</p>
                  )}
                  {step.description ? <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{step.description}</p> : null}
                  <p className="mt-3 text-[0.58rem] tracking-[0.24em] text-gold/60">{linkedEntry?.title ?? "Eintrag nicht gefunden"}</p>
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
        const label = linkedEntry?.title ?? target;

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
            Zahlenwert
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
              Zahlenwert {resonance.numericValue}
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
                    <p className="font-serif text-xl italic text-foreground-strong">{target}</p>
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
                  <p className="font-serif text-xl italic text-foreground-strong">{linkedEntry?.title ?? target}</p>
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

function OntologyResonanceSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  const resonance = getOntologyResonance(entry);

  if (resonance.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Mitschwingende Beziehungen" activeContext={activeContext}>
      <div className="grid gap-3">
        {resonance.map(({ relation, endpoint, label, markerLabel, note, explanation }, index) => (
          <div
            key={relation.id}
            className={`${index > 5 ? "hidden sm:grid" : "grid"} gap-3 border border-white/[0.06] bg-black/[0.1] p-4`}
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
      </div>
    </DetailSection>
  );
}

function RelationsSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  return (
    <DetailSection title="Relationen" activeContext={activeContext}>
      {entry.relations.length > 0 ? (
        <div className="grid gap-3">
          {entry.relations.map((relation, index) => {
            const target = relationTarget(relation);
            const linkedEntry = resolveLinkedCodexEntry(target);

            return (
              <article key={`${relation.type}-${target}-${index}`} className="border border-white/[0.06] bg-black/[0.12] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold/70">{formatRelationType(relation.type)}</p>
                  {linkedEntry ? (
                    <Link
                      href={`/codex/${linkedEntry.id}`}
                      className="font-mono text-xs text-gold/75 transition-colors duration-500 hover:text-gold"
                    >
                      {linkedEntry.title}
                    </Link>
                  ) : (
                    <p className="font-mono text-xs text-muted-soft">{relation.label || "nicht im Codex"}</p>
                  )}
                </div>
                {relation.label ? (
                  <p className="symbol-copy mt-4 text-sm italic text-muted-soft">{relation.label}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="symbol-copy text-base italic text-muted-soft">Keine Relationen hinterlegt.</p>
      )}
    </DetailSection>
  );
}

function ScriptureAnchorsSection({ entry, activeContext }: { entry: CodexEntry; activeContext?: CodexContextFocus }) {
  return (
    <DetailSection title="Bibelanker" activeContext={activeContext}>
      {entry.scriptureAnchors.length > 0 ? (
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
      ) : (
        <p className="symbol-copy text-base italic text-muted-soft">Keine Bibelanker hinterlegt.</p>
      )}
    </DetailSection>
  );
}

function NearbyEntriesSection({ entry }: { entry: CodexEntry }) {
  const nearbyEntries = getNearbyEntries(entry);

  if (nearbyEntries.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Nahe Eintr&auml;ge">
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
