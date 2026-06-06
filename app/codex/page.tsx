"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { codexRegistry } from "@/lib/codex/codexRegistry";
import { getBridgeBySourceAndTarget } from "@/lib/meaning-bridges";
import { meaningNodes } from "@/lib/meaning/meaningNodes";
import { getCodexEntriesByType, resolveCodexEntry, searchCodexEntries } from "@/lib/codex/getCodexEntry";
import type { CodexEntry, CodexEntryType } from "@/lib/codex/types";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import type { HebrewWord } from "@/types/hebrew";

type CodexViewId =
  | "all"
  | "symbols"
  | "hebrew"
  | "letters"
  | "torah"
  | "gematria"
  | "meaning"
  | "journeys";

const CODEX_GROUPS: { type: CodexEntryType; label: string; optional?: boolean }[] = [
  { type: "symbol", label: "Symbole" },
  { type: "hebrew-letter", label: "Buchstaben" },
  { type: "scripture", label: "Bibelstellen" },
  { type: "meaning", label: "Bedeutung" },
  { type: "meaning-field", label: "Bedeutungsfelder", optional: true },
  { type: "number", label: "Zahlen", optional: true },
  { type: "journey", label: "Journeys", optional: true },
];

const CODEX_VIEWS: { id: CodexViewId; label: string; description: string }[] = [
  { id: "all", label: "Alle", description: "Alle Codex-Eintr&auml;ge" },
  { id: "symbols", label: "Symbole", description: "Symbolische Grundfiguren" },
  { id: "hebrew", label: "Hebr&auml;isch", description: "Eintr&auml;ge mit hebr&auml;ischer Spur" },
  { id: "letters", label: "Buchstaben", description: "Hebr&auml;ische Buchstaben" },
  { id: "torah", label: "Thora", description: "Schrift- und Versanker" },
  { id: "gematria", label: "Gematria", description: "Zahlen und Werte" },
  { id: "meaning", label: "Bedeutung", description: "Bedeutungsfelder" },
  { id: "journeys", label: "Journeys", description: "Gef&uuml;hrte Wege" },
];

const TORAH_SEQUENCE = [
  {
    id: "genesis-1",
    children: ["genesis-1-1", "genesis-1-2", "genesis-1-3"],
  },
] as const;

type CodexCardFocusProps = {
  activeCodexId: string | null;
  onActivateCodexEntry: (entryId: string) => void;
};

type ResonancePathStationKind =
  | "Symbol"
  | "Hebraeisch"
  | "Buchstabe"
  | "Zahl"
  | "Bedeutung"
  | "Thora"
  | "Journey";

type ResonancePathStation = {
  kind: ResonancePathStationKind;
  label: string;
  entry?: CodexEntry;
  lang?: "he";
  dir?: "rtl";
};

const CODEX_TYPE_RESONANCE_LABELS: Partial<Record<CodexEntryType, string>> = {
  symbol: "Symbol",
  "hebrew-word": "hebraeisches Wort",
  "hebrew-letter": "Buchstabe",
  number: "Zahl",
  scripture: "Schriftanker",
  meaning: "Bedeutung",
  "meaning-field": "Bedeutungsfeld",
  journey: "Weg",
};

const RESONANCE_PATH_PRIORITIES: Partial<Record<string, Partial<Record<ResonancePathStationKind, string[]>>>> = {
  wasser: {
    Buchstabe: ["mem"],
    Zahl: ["zahl-40", "zahl-90"],
    Bedeutung: ["tiefe"],
    Thora: ["genesis-1-2"],
    Journey: ["journey-wasser-geist"],
  },
  licht: {
    Buchstabe: ["aleph"],
    Zahl: ["zahl-1"],
    Bedeutung: ["offenbarung"],
    Thora: ["genesis-1-3"],
    Journey: ["journey-chaos-ordnung"],
  },
  feuer: {
    Buchstabe: ["aleph"],
    Zahl: ["zahl-1"],
    Bedeutung: ["wandlung", "offenbarung"],
    Journey: ["journey-wueste-offenbarung"],
  },
  wueste: {
    Buchstabe: ["mem"],
    Zahl: ["zahl-40"],
    Bedeutung: ["wandlung"],
    Journey: ["journey-wueste-offenbarung"],
  },
};

function formatType(type: CodexEntryType) {
  if (type === "meaning") {
    return "Bedeutung";
  }

  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getMeaningFieldLabel(fieldId: string) {
  return meaningNodes.find((node) => node.id === fieldId)?.label ?? fieldId;
}

function getScriptureAnchorLabel(anchorId: string) {
  const linkedEntry = resolveCodexEntry(anchorId);
  if (linkedEntry) {
    return linkedEntry.title;
  }

  return anchorId.replace(/-/g, " ").replace(/\b(genesis|exodus|leviticus|numbers|deuteronomy|thora|scripture)\b/gi, "$1").trim() || anchorId;
}

function uniqueLabels(labels: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return labels
    .map((label) => label?.trim())
    .filter((label): label is string => Boolean(label))
    .filter((label) => {
      const normalized = label.toLocaleLowerCase("de-DE");

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

function formatLabelSeries(labels: string[]) {
  if (labels.length <= 1) {
    return labels[0] ?? "";
  }

  return `${labels.slice(0, -1).join(", ")} und ${labels.at(-1)}`;
}

function getResonanceEntryLabel(entry: CodexEntry) {
  if (entry.type === "number") {
    return entry.title.match(/\d+/)?.[0] ?? entry.title;
  }

  return entry.title;
}

function getEntryRelationLabels(entry: CodexEntry) {
  const outgoingIds = entry.relations.map((relation) => relation.targetId);
  const incomingIds = codexRegistry
    .filter((candidate) => candidate.relations.some((relation) => relation.targetId === entry.id))
    .map((candidate) => candidate.id);

  return uniqueLabels(
    [...outgoingIds, ...incomingIds]
      .map((targetId) => codexRegistry.find((candidate) => candidate.id === targetId))
      .map((linkedEntry) => linkedEntry ? getResonanceEntryLabel(linkedEntry) : null),
  ).filter((label) => label !== entry.title).slice(0, 4);
}

function getEntryScriptureLabels(entry: CodexEntry) {
  const directAnchors = entry.scriptureAnchors.map((anchor) => anchor.label ?? anchor.reference);
  const linkedAnchors = entry.relations
    .map((relation) => codexRegistry.find((candidate) => candidate.id === relation.targetId && candidate.type === "scripture"))
    .map((linkedEntry) => linkedEntry?.title);
  const backlinkAnchors = codexRegistry
    .filter((candidate) => candidate.type === "scripture" && candidate.relations.some((relation) => relation.targetId === entry.id))
    .map((candidate) => candidate.title);

  return uniqueLabels([...directAnchors, ...linkedAnchors, ...backlinkAnchors]).slice(0, 2);
}

function getEntryJourneyLabels(entry: CodexEntry) {
  const directJourneys = entry.journeyIds
    .map((journeyId) => codexRegistry.find((candidate) => candidate.id === journeyId))
    .map((journey) => journey?.title);
  const stepJourneys = codexRegistry
    .filter((candidate) => candidate.type === "journey" && candidate.steps?.some((step) => step.codexId === entry.id))
    .map((candidate) => candidate.title);

  return uniqueLabels([...directJourneys, ...stepJourneys]).slice(0, 2);
}

function buildCodexResonanceTeaser(entry: CodexEntry) {
  const parts = uniqueLabels([
    CODEX_TYPE_RESONANCE_LABELS[entry.type],
    entry.hebrew ? `${entry.hebrew}${entry.transliteration ? ` / ${entry.transliteration}` : ""}` : null,
    ...getEntryRelationLabels(entry),
    ...entry.meaningFields.map(getMeaningFieldLabel),
    ...getEntryScriptureLabels(entry),
    ...getEntryJourneyLabels(entry).map((label) => `Weg ${label}`),
    entry.symbolRoomSlug ? `Symbolraum ${getConnectedEntryLabel(entry.symbolRoomSlug)}` : null,
  ]).slice(0, 6);

  if (parts.length === 0) {
    return `${entry.title} bleibt als aktiver Codex-Knoten durch die Ansichten hindurch erhalten.`;
  }

  return `${entry.title} erscheint im Codex als ${formatLabelSeries(parts)}.`;
}

function getCodexEntryById(entryId: string) {
  return codexRegistry.find((entry) => entry.id === entryId);
}

function uniqueCodexEntries(entries: Array<CodexEntry | null | undefined>) {
  const seen = new Set<string>();

  return entries.filter((entry): entry is CodexEntry => {
    if (!entry || seen.has(entry.id)) {
      return false;
    }

    seen.add(entry.id);
    return true;
  });
}

function getBacklinkEntries(entry: CodexEntry) {
  return codexRegistry.filter((candidate) =>
    candidate.relations.some((relation) => relation.targetId === entry.id) ||
    candidate.steps?.some((step) => step.codexId === entry.id),
  );
}

function getResonanceGraphEntries(entry: CodexEntry) {
  return uniqueCodexEntries([
    entry,
    ...entry.relations.map((relation) => getCodexEntryById(relation.targetId)),
    ...getBacklinkEntries(entry),
    ...entry.scriptureAnchors.map((anchor) => anchor.id ? getCodexEntryById(anchor.id) : undefined),
    ...entry.journeyIds.map(getCodexEntryById),
    entry.symbolRoomSlug ? getCodexEntryById(entry.symbolRoomSlug) : undefined,
    ...codexRegistry
      .filter((candidate) => candidate.type === "journey" && candidate.steps?.some((step) => step.codexId === entry.id)),
  ]);
}

function getPriorityIds(entry: CodexEntry, kind: ResonancePathStationKind) {
  return [
    ...(RESONANCE_PATH_PRIORITIES[entry.id]?.[kind] ?? []),
    ...(entry.symbolRoomSlug ? RESONANCE_PATH_PRIORITIES[entry.symbolRoomSlug]?.[kind] ?? [] : []),
  ];
}

function pickEntryByPriority(
  entry: CodexEntry,
  kind: ResonancePathStationKind,
  candidates: CodexEntry[],
) {
  const priorityIds = getPriorityIds(entry, kind);
  const preferredEntry = priorityIds
    .map((entryId) => candidates.find((candidate) => candidate.id === entryId))
    .find((candidate): candidate is CodexEntry => Boolean(candidate));

  return preferredEntry ?? candidates[0];
}

function getHebrewStationSource(entry: CodexEntry, graphEntries: CodexEntry[]) {
  return [entry, ...graphEntries].find((candidate) => Boolean(candidate.hebrew));
}

function getStationEntryLabel(entry: CodexEntry) {
  if (entry.type === "number") {
    return `Zahl ${getNumberValue(entry)}`;
  }

  return entry.title;
}

function buildResonancePath(entry: CodexEntry): ResonancePathStation[] {
  const graphEntries = getResonanceGraphEntries(entry);
  const symbolEntry = entry.type === "symbol"
    ? entry
    : pickEntryByPriority(entry, "Symbol", graphEntries.filter((candidate) => candidate.type === "symbol"));
  const hebrewSource = getHebrewStationSource(entry, graphEntries);
  const letterEntry = pickEntryByPriority(
    entry,
    "Buchstabe",
    graphEntries.filter((candidate) => candidate.type === "hebrew-letter"),
  );
  const numberEntry = pickEntryByPriority(
    entry,
    "Zahl",
    graphEntries.filter((candidate) => candidate.type === "number"),
  );
  const meaningCandidates = [
    ...graphEntries.filter((candidate) => candidate.type === "meaning" || candidate.type === "meaning-field"),
    ...getCodexEntriesByType("meaning").filter((candidate) =>
      candidate.meaningFields.some((field) => entry.meaningFields.includes(field)),
    ),
    ...getCodexEntriesByType("meaning-field").filter((candidate) =>
      candidate.meaningFields.some((field) => entry.meaningFields.includes(field)),
    ),
  ];
  const meaningEntry = pickEntryByPriority(entry, "Bedeutung", uniqueCodexEntries(meaningCandidates));
  const scriptureEntry = pickEntryByPriority(
    entry,
    "Thora",
    graphEntries.filter((candidate) => candidate.type === "scripture"),
  );
  const journeyEntry = pickEntryByPriority(
    entry,
    "Journey",
    graphEntries.filter((candidate) => candidate.type === "journey"),
  );

  const stations: Array<ResonancePathStation | null> = [
    symbolEntry ? { kind: "Symbol", label: symbolEntry.title, entry: symbolEntry } : null,
    hebrewSource?.hebrew
      ? {
          kind: "Hebraeisch",
          label: `${hebrewSource.hebrew}${hebrewSource.transliteration ? ` / ${hebrewSource.transliteration}` : ""}`,
          entry: hebrewSource,
          lang: "he" as const,
          dir: "rtl" as const,
        }
      : null,
    letterEntry ? { kind: "Buchstabe", label: letterEntry.title, entry: letterEntry } : null,
    numberEntry ? { kind: "Zahl", label: getStationEntryLabel(numberEntry), entry: numberEntry } : null,
    meaningEntry ? { kind: "Bedeutung", label: meaningEntry.title, entry: meaningEntry } : null,
    scriptureEntry ? { kind: "Thora", label: scriptureEntry.title, entry: scriptureEntry } : null,
    journeyEntry ? { kind: "Journey", label: `Journey ${journeyEntry.title}`, entry: journeyEntry } : null,
  ];

  return stations.filter((station): station is ResonancePathStation => Boolean(station?.label.trim()));
}

function CodexResonanceTeaser({ entry }: { entry: CodexEntry }) {
  return (
    <aside className="mt-5 border-l-2 border-gold/45 bg-black/[0.18] px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-md sm:px-6">
      <p className="symbol-kicker text-gold/70">Aktive Resonanz</p>
      <p className="symbol-copy mt-2 text-base italic leading-relaxed text-foreground-strong sm:text-lg">
        {buildCodexResonanceTeaser(entry)}
      </p>
    </aside>
  );
}

function CodexResonancePath({
  entry,
  onActivateCodexEntry,
}: {
  entry: CodexEntry;
  onActivateCodexEntry: (entryId: string) => void;
}) {
  const stations = buildResonancePath(entry);

  if (stations.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={`Resonanzpfad fuer ${entry.title}`}
      className="mt-4 overflow-hidden border border-gold/[0.13] bg-[linear-gradient(90deg,rgba(189,160,109,0.07),rgba(255,255,255,0.018)_46%,rgba(127,184,201,0.035))] px-4 py-4 shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-md sm:px-5"
    >
      <ol className="flex flex-wrap items-stretch gap-2 sm:gap-3">
        {stations.map((station, index) => {
          const isActive = station.entry?.id === entry.id;
          const stationClassName = `group flex min-h-16 min-w-36 flex-col justify-center border px-3 py-3 text-left outline-none transition-colors duration-500 sm:min-w-40 ${
            isActive
              ? "border-gold/45 bg-gold/[0.095] shadow-[0_0_34px_rgba(189,160,109,0.12)]"
              : "border-white/[0.075] bg-black/[0.14] hover:border-gold/24 hover:bg-gold/[0.045]"
          }`;
          const content = (
            <>
              <span className="text-[0.56rem] uppercase tracking-[0.22em] text-cyan-soft/80">
                {station.kind === "Hebraeisch" ? "Hebr\u00e4isch" : station.kind}
              </span>
              <span
                className={`mt-2 block leading-tight ${
                  station.lang === "he"
                    ? "font-serif text-xl text-gold/90"
                    : "font-serif text-lg italic text-foreground-strong"
                }`}
                lang={station.lang}
                dir={station.dir}
              >
                {station.label}
              </span>
            </>
          );

          return (
            <li key={`${station.kind}-${station.entry?.id ?? station.label}`} className="flex items-stretch gap-2 sm:gap-3">
              {index > 0 ? (
                <span
                  className="flex items-center text-gold/45"
                  aria-hidden="true"
                >
                  <span className="hidden h-px w-5 bg-gradient-to-r from-gold/20 to-gold/55 sm:block" />
                  <span className="font-serif text-xl leading-none">-&gt;</span>
                </span>
              ) : null}

              {station.entry ? (
                <Link
                  href={`/codex/${station.entry.id}`}
                  onClick={() => onActivateCodexEntry(station.entry?.id ?? entry.id)}
                  onFocus={() => onActivateCodexEntry(station.entry?.id ?? entry.id)}
                  className={stationClassName}
                  aria-current={isActive ? "true" : undefined}
                >
                  {content}
                </Link>
              ) : (
                <span className={stationClassName}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function filterEntriesByView(entries: CodexEntry[], viewId: CodexViewId) {
  switch (viewId) {
    case "symbols":
      return entries.filter((entry) => entry.type === "symbol");
    case "hebrew":
      return entries.filter((entry) => Boolean(entry.hebrew));
    case "letters":
      return entries.filter((entry) => entry.type === "hebrew-letter");
    case "torah":
      return entries.filter((entry) => entry.type === "scripture");
    case "gematria":
      return entries.filter((entry) => entry.type === "number");
    case "meaning":
      return entries.filter((entry) => entry.type === "meaning");
    case "journeys":
      return entries.filter((entry) => entry.type === "journey");
    case "all":
    default:
      return entries;
  }
}

function groupEntries(entries: CodexEntry[]) {
  return CODEX_GROUPS.map((group) => ({
    ...group,
    entries: entries.filter((entry) => entry.type === group.type),
  })).filter((group) => group.entries.length > 0 || !group.optional);
}

function getHebrewWordForEntry(entry: CodexEntry) {
  return hebrewWords.find((word) => (
    word.id === entry.id ||
    word.relatedSymbolSlugs.includes(entry.id) ||
    entry.relations.some((relation) => relation.type === "has-hebrew-word" && relation.targetId === word.id)
  ));
}

function getHebrewWordEntries(entries: CodexEntry[]) {
  return entries.filter((entry) => Boolean(entry.hebrew) && entry.type !== "hebrew-letter");
}

function HebrewLetterChip({
  glyph,
  letterId,
  index,
}: {
  glyph: string;
  letterId: string;
  index: number;
}) {
  const letter = hebrewLetters.find((candidate) => candidate.id === letterId);
  const codexLetterEntry = codexRegistry.find((entry) => entry.id === letterId && entry.type === "hebrew-letter");
  const chipClassName =
    "inline-flex h-9 min-w-9 items-center justify-center border px-2 font-serif text-2xl leading-none transition-colors duration-500";

  return codexLetterEntry ? (
    <Link
      href={`/codex/${codexLetterEntry.id}`}
      className={`${chipClassName} border-gold/20 bg-gold/[0.055] text-gold hover:border-gold/40 hover:bg-gold/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/25`}
      lang="he"
      dir="rtl"
      aria-label={`${letter?.name ?? letterId} im Codex ansehen`}
    >
      {glyph}
    </Link>
  ) : (
    <span
      className={`${chipClassName} border-white/[0.08] bg-white/[0.025] text-gold/45`}
      lang="he"
      dir="rtl"
      title={`${letter?.name ?? letterId} ist als Codex-Knoten vorbereitet`}
      aria-label={`${letter?.name ?? letterId} vorbereitet`}
    >
      {glyph || index + 1}
    </span>
  );
}

function HebrewWordCard({
  entry,
  word,
  activeCodexId,
  onActivateCodexEntry,
}: {
  entry: CodexEntry;
  word?: HebrewWord;
} & CodexCardFocusProps) {
  const glyphs = Array.from(word?.hebrew ?? entry.hebrew ?? "");
  const letterIds = word?.letterIds ?? [];
  const isActive = activeCodexId === entry.id;

  return (
    <article
      onClickCapture={() => onActivateCodexEntry(entry.id)}
      onFocusCapture={() => onActivateCodexEntry(entry.id)}
      className={`group relative flex h-full flex-col overflow-hidden border bg-[linear-gradient(180deg,rgba(189,160,109,0.055),rgba(255,255,255,0.018)_38%,rgba(0,0,0,0.08))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-md transition-colors duration-700 hover:border-gold/[0.28] sm:p-7 ${
        isActive ? "border-gold/45" : "border-gold/[0.12]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(189,160,109,0.13),transparent_34%),linear-gradient(90deg,rgba(127,184,201,0.045),transparent_36%)] opacity-70 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="symbol-kicker text-cyan-soft">Hebraeisches Wort</p>
            <h3 className="mt-4 font-serif text-3xl italic leading-tight text-foreground-strong">
              {entry.title}
            </h3>
            <p className="mt-3 text-[0.62rem] uppercase tracking-[0.26em] text-gold/65">
              {entry.transliteration ?? word?.transliteration ?? "Transliteration folgt"}
            </p>
          </div>

          {entry.hebrew ? (
            <p
              className="shrink-0 text-right font-serif text-7xl leading-none text-gold md:text-8xl"
              lang="he"
              dir="rtl"
            >
              {entry.hebrew}
            </p>
          ) : null}
        </div>

        <p className="symbol-copy mt-6 text-base italic">
          {entry.summary}
        </p>

        {glyphs.length > 0 ? (
          <div className="mt-7">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Buchstaben</p>
            <div className="mt-3 flex flex-wrap gap-2" dir="rtl" aria-label={`Buchstaben von ${entry.title}`}>
              {glyphs.map((glyph, index) => (
                <HebrewLetterChip
                  key={`${entry.id}-${glyph}-${index}`}
                  glyph={glyph}
                  letterId={letterIds[index] ?? glyph}
                  index={index}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-[0.58rem] uppercase tracking-[0.26em] text-muted-soft">Relationen</p>
            <p className="mt-2 font-serif text-2xl text-gold/85">{entry.relations.length}</p>
          </div>
          <div className="border-t border-white/[0.06] pt-4 text-right">
            <Link
              href={`/codex/${entry.id}`}
              className="inline-flex border border-gold/[0.18] bg-gold/[0.045] px-4 py-3 text-[0.58rem] uppercase tracking-[0.22em] text-gold/80 transition-colors duration-500 hover:border-gold/35 hover:bg-gold/[0.075] hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
            >
              Detail
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function HebrewLetterCard({ entry, activeCodexId, onActivateCodexEntry }: { entry: CodexEntry } & CodexCardFocusProps) {
  const isActive = activeCodexId === entry.id;

  return (
    <article
      onClickCapture={() => onActivateCodexEntry(entry.id)}
      onFocusCapture={() => onActivateCodexEntry(entry.id)}
      className={`group relative flex h-full flex-col overflow-hidden border bg-white/[0.025] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md transition-colors duration-700 hover:border-gold/[0.24] sm:p-7 ${
        isActive ? "border-gold/42" : "border-white/[0.075]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(189,160,109,0.09),transparent_38%)] opacity-70 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="symbol-kicker text-cyan-soft">Buchstaben-Knoten</p>
            <h3 className="mt-4 font-serif text-3xl italic leading-tight text-foreground-strong">
              {entry.title}
            </h3>
            {entry.transliteration ? (
              <p className="mt-3 text-[0.62rem] uppercase tracking-[0.26em] text-gold/65">
                {entry.transliteration}
              </p>
            ) : null}
          </div>

          {entry.hebrew ? (
            <p className="shrink-0 font-serif text-7xl leading-none text-gold/90" lang="he" dir="rtl">
              {entry.hebrew}
            </p>
          ) : null}
        </div>

        <p className="symbol-copy mt-6 text-base italic">
          {entry.summary}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-[0.58rem] uppercase tracking-[0.26em] text-muted-soft">Relationen</p>
            <p className="mt-2 font-serif text-2xl text-gold/80">{entry.relations.length}</p>
          </div>
          <div className="border-t border-white/[0.06] pt-4 text-right">
            <Link
              href={`/codex/${entry.id}`}
              className="inline-flex border border-gold/[0.18] bg-gold/[0.045] px-4 py-3 text-[0.58rem] uppercase tracking-[0.22em] text-gold/80 transition-colors duration-500 hover:border-gold/35 hover:bg-gold/[0.075] hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
            >
              Detail
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function HebrewGroupSection({
  title,
  kicker,
  count,
  children,
}: {
  title: string;
  kicker: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-gold/[0.12] pb-5">
        <div>
          <p className="symbol-kicker text-cyan-soft">{kicker}</p>
          <h2 className="mt-3 font-serif text-4xl italic leading-tight text-foreground-strong md:text-5xl">
            {title}
          </h2>
        </div>
        <p className="text-[0.62rem] uppercase tracking-[0.26em] text-gold/65">
          {count} Eintr&auml;ge
        </p>
      </div>
      {children}
    </section>
  );
}

function HebrewCodexView({ entries, activeCodexId, onActivateCodexEntry }: { entries: CodexEntry[] } & CodexCardFocusProps) {
  const wordEntries = getHebrewWordEntries(entries);
  const letterEntries = entries.filter((entry) => entry.type === "hebrew-letter");

  return (
    <div className="grid gap-16">
      <HebrewGroupSection
        title="Hebr&auml;ische W&ouml;rter"
        kicker="Wort-Ebene"
        count={wordEntries.length}
      >
        {wordEntries.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {wordEntries.map((entry) => (
              <HebrewWordCard
                key={entry.id}
                entry={entry}
                word={getHebrewWordForEntry(entry)}
                activeCodexId={activeCodexId}
                onActivateCodexEntry={onActivateCodexEntry}
              />
            ))}
          </div>
        ) : (
          <p className="symbol-copy text-base italic text-muted-soft">
            Keine hebr&auml;ischen W&ouml;rter zu dieser Suche gefunden.
          </p>
        )}
      </HebrewGroupSection>

      <HebrewGroupSection
        title="Buchstaben"
        kicker="Buchstaben-Knoten"
        count={letterEntries.length}
      >
        {letterEntries.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {letterEntries.map((entry) => (
              <HebrewLetterCard
                key={entry.id}
                entry={entry}
                activeCodexId={activeCodexId}
                onActivateCodexEntry={onActivateCodexEntry}
              />
            ))}
          </div>
        ) : (
          <p className="symbol-copy text-base italic text-muted-soft">
            Buchstaben-Knoten sind vorbereitet. Verkn&uuml;pfte Eintr&auml;ge erscheinen hier automatisch.
          </p>
        )}
      </HebrewGroupSection>
    </div>
  );
}

function CodexCard({ entry, activeCodexId, onActivateCodexEntry }: { entry: CodexEntry } & CodexCardFocusProps) {
  const isActive = activeCodexId === entry.id;

  return (
    <Link
      href={`/codex/${entry.id}`}
      onClick={() => onActivateCodexEntry(entry.id)}
      onFocus={() => onActivateCodexEntry(entry.id)}
      className={`group relative block h-full overflow-hidden border bg-white/[0.025] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] outline-none backdrop-blur-md transition-colors duration-700 hover:border-gold/20 focus-visible:border-gold/35 focus-visible:ring-2 focus-visible:ring-gold/20 sm:p-7 ${
        isActive ? "border-gold/42" : "border-white/[0.075]"
      }`}
      aria-label={`Codex-Eintrag ${entry.title} ansehen`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(189,160,109,0.075),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.028),transparent_34%)] opacity-70 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="symbol-kicker text-cyan-soft">{formatType(entry.type)}</p>
            <h3 className="mt-4 font-serif text-3xl italic leading-tight text-foreground-strong">
              {entry.title}
            </h3>
            {entry.subtitle ? (
              <p className="mt-2 font-serif text-base italic leading-relaxed text-muted-soft">
                {entry.subtitle}
              </p>
            ) : null}
          </div>

          {entry.hebrew ? (
            <p className="shrink-0 font-serif text-5xl leading-none text-gold/85" lang="he" dir="rtl">
              {entry.hebrew}
            </p>
          ) : null}
        </div>

        {entry.transliteration ? (
          <p className="mt-5 text-[0.62rem] uppercase tracking-[0.26em] text-gold/65">
            {entry.transliteration}
          </p>
        ) : null}

        <p className="symbol-copy mt-5 text-base italic">
          {entry.summary}
        </p>

        {entry.steps?.length ? (
          <ol className="mt-6 grid gap-2">
            {entry.steps.map((step, index) => (
              <li key={step.id} className="grid gap-2">
                <div className="flex items-center gap-3 border border-white/[0.055] bg-black/10 px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-gold/20 font-serif text-sm text-gold/80">{index + 1}</span>
                  <span className="text-sm leading-snug text-foreground-strong">{step.label}</span>
                </div>

                {/* Bridge between this step and next, if present */}
                {index < (entry.steps?.length ?? 0) - 1 ? (
                  (() => {
                    const next = entry.steps?.[index + 1];
                    if (!next) return null;
                    const bridge = getBridgeBySourceAndTarget(step.codexId, next.codexId) ?? getBridgeBySourceAndTarget(next.codexId, step.codexId);

                    return bridge ? (
                      <div className="mx-2 mt-1 rounded border border-gold/[0.14] bg-gold/[0.03] p-3 text-sm">
                        <div className="font-serif text-base italic text-gold/85">{bridge.title}</div>
                        <div className="symbol-copy mt-1 text-[0.85rem] text-foreground-strong">{bridge.summary}</div>
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
                  })()
                ) : null}
              </li>
            ))}
          </ol>
        ) : null}

        <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-[0.58rem] uppercase tracking-[0.26em] text-muted-soft">Relationen</p>
            <p className="mt-2 font-serif text-2xl text-gold/80">{entry.relations.length}</p>
          </div>
          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-[0.58rem] uppercase tracking-[0.26em] text-muted-soft">
              {entry.steps?.length ? "Schritte" : "Bibelanker"}
            </p>
            <p className="mt-2 font-serif text-2xl text-gold/80">
              {entry.steps?.length ?? entry.scriptureAnchors.length}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MeaningCard({ entry, activeCodexId, onActivateCodexEntry }: { entry: CodexEntry } & CodexCardFocusProps) {
  const isActive = activeCodexId === entry.id;
  const relationChips = entry.relations.slice(0, 6).map((relation) => ({
    id: `${relation.type}-${relation.targetId}`,
    targetId: relation.targetId,
    label: getConnectedEntryLabel(relation.targetId),
  }));
  const scriptureChips = entry.scriptureAnchors.map((anchor) => ({
    id: `${anchor.reference}-${anchor.label ?? ""}`,
    label: anchor.label ?? anchor.reference,
    targetId: anchor.id,
  }));

  return (
    <article
      onClickCapture={() => onActivateCodexEntry(entry.id)}
      onFocusCapture={() => onActivateCodexEntry(entry.id)}
      className={`group relative flex h-full flex-col overflow-hidden border bg-white/[0.022] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-md transition-colors duration-700 hover:border-gold/[0.22] sm:p-7 ${
        isActive ? "border-gold/42" : "border-white/[0.07]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(127,184,201,0.07),transparent_34%),radial-gradient(circle_at_86%_10%,rgba(189,160,109,0.075),transparent_38%)] opacity-70 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <p className="symbol-kicker text-cyan-soft">Bedeutungsfeld</p>
        <h3 className="mt-4 font-serif text-4xl italic leading-tight text-foreground-strong md:text-5xl">
          {entry.title}
        </h3>
        {entry.subtitle ? (
          <p className="mt-3 font-serif text-lg italic leading-relaxed text-gold/78">
            {entry.subtitle}
          </p>
        ) : null}

        <p className="symbol-copy mt-6 text-base italic text-foreground-strong">
          {entry.summary}
        </p>

        {relationChips.length > 0 || scriptureChips.length > 0 ? (
          <div className="mt-7 flex flex-wrap gap-2">
            {relationChips.map((chip) => {
              const linkedEntry = codexRegistry.find((candidate) => candidate.id === chip.targetId);
              const className = "border border-gold/15 bg-gold/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-gold/78 transition-colors duration-500";

              return linkedEntry ? (
                <Link key={chip.id} href={`/codex/${linkedEntry.id}`} className={`${className} hover:border-gold/30 hover:text-gold`}>
                  {chip.label}
                </Link>
              ) : (
                <span key={chip.id} className={className}>{chip.label}</span>
              );
            })}
            {scriptureChips.map((chip) => {
              const linkedEntry = chip.targetId ? codexRegistry.find((candidate) => candidate.id === chip.targetId) : undefined;
              const className = "border border-cyan-soft/15 bg-cyan-soft/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-soft/82 transition-colors duration-500";

              return linkedEntry ? (
                <Link key={chip.id} href={`/codex/${linkedEntry.id}`} className={`${className} hover:border-cyan-soft/30 hover:text-cyan-soft`}>
                  {chip.label}
                </Link>
              ) : (
                <span key={chip.id} className={className}>{chip.label}</span>
              );
            })}
          </div>
        ) : null}

        <div className="mt-auto pt-8">
          <Link
            href={`/codex/${entry.id}`}
            className="inline-flex border border-gold/[0.18] bg-gold/[0.045] px-4 py-3 text-[0.58rem] uppercase tracking-[0.22em] text-gold/80 transition-colors duration-500 hover:border-gold/35 hover:bg-gold/[0.075] hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
          >
            Resonanz
          </Link>
        </div>
      </div>
    </article>
  );
}

function getNumberValue(entry: CodexEntry) {
  return entry.title.match(/\d+/)?.[0] ?? entry.id.replace("zahl-", "");
}

function getConnectedEntryLabel(targetId: string) {
  return codexRegistry.find((entry) => entry.id === targetId)?.title
    ?? hebrewWords.find((word) => word.id === targetId)?.transliteration
    ?? targetId;
}

function GematriaNumberCard({ entry, activeCodexId, onActivateCodexEntry }: { entry: CodexEntry } & CodexCardFocusProps) {
  const isActive = activeCodexId === entry.id;
  const connectedEntries = entry.relations.map((relation) => ({
    id: relation.targetId,
    label: getConnectedEntryLabel(relation.targetId),
  }));

  return (
    <article
      onClickCapture={() => onActivateCodexEntry(entry.id)}
      onFocusCapture={() => onActivateCodexEntry(entry.id)}
      className={`group relative flex h-full flex-col overflow-hidden border bg-[linear-gradient(180deg,rgba(189,160,109,0.06),rgba(255,255,255,0.018)_36%,rgba(0,0,0,0.1))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-md transition-colors duration-700 hover:border-gold/[0.3] sm:p-7 ${
        isActive ? "border-gold/45" : "border-gold/[0.14]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_4%,rgba(189,160,109,0.16),transparent_34%),linear-gradient(90deg,rgba(127,184,201,0.045),transparent_42%)] opacity-75 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="symbol-kicker text-cyan-soft">Zahlenwert</p>
            <h3 className="mt-4 font-serif text-7xl italic leading-none text-gold md:text-8xl">
              {getNumberValue(entry)}
            </h3>
          </div>
          <p className="max-w-40 text-right font-serif text-lg italic leading-snug text-gold/75">
            {entry.subtitle}
          </p>
        </div>

        <div className="mt-7">
          <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">Essenz</p>
          <p className="symbol-copy mt-3 text-base italic text-foreground-strong">
            {entry.summary}
          </p>
        </div>

        {connectedEntries.length > 0 ? (
          <div className="mt-7">
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-muted-soft">
              Verbundene Buchstaben, W&ouml;rter und Symbole
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {connectedEntries.map((target) => (
                <span
                  key={`${entry.id}-${target.id}`}
                  className="border border-cyan-soft/15 bg-cyan-soft/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-soft/85"
                >
                  {target.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-auto pt-8">
          <Link
            href={`/codex/${entry.id}`}
            className="inline-flex border border-gold/[0.18] bg-gold/[0.045] px-4 py-3 text-[0.58rem] uppercase tracking-[0.22em] text-gold/80 transition-colors duration-500 hover:border-gold/35 hover:bg-gold/[0.075] hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
          >
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
}

function TorahSequence({ entries, activeCodexId, onActivateCodexEntry }: { entries: CodexEntry[] } & CodexCardFocusProps) {
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  const visibleIds = new Set(entries.map((entry) => entry.id));
  const chapters = TORAH_SEQUENCE.map((chapter) => ({
    entry: entryMap.get(chapter.id) ?? codexRegistry.find((entry) => entry.id === chapter.id),
    children: chapter.children
      .map((id) => entryMap.get(id) ?? codexRegistry.find((entry) => entry.id === id))
      .filter((entry): entry is CodexEntry => Boolean(entry)),
  })).filter(({ entry, children }) => {
    if (!entry) {
      return false;
    }

    return visibleIds.has(entry.id) || children.some((child) => visibleIds.has(child.id));
  });

  if (chapters.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4">
      {chapters.map(({ entry, children }) => entry ? (
        <article
          key={entry.id}
          className={`border bg-white/[0.025] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-md transition-colors duration-700 sm:p-6 ${
            activeCodexId === entry.id ? "border-gold/42" : "border-white/[0.075]"
          }`}
        >
          <Link
            href={`/codex/${entry.id}`}
            onClick={() => onActivateCodexEntry(entry.id)}
            onFocus={() => onActivateCodexEntry(entry.id)}
            className="group block outline-none focus-visible:ring-2 focus-visible:ring-gold/20"
          >
            <p className="symbol-kicker text-cyan-soft">Genesis</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-5">
              <div>
                <h3 className="font-serif text-4xl italic leading-tight text-foreground-strong transition-colors duration-500 group-hover:text-gold md:text-5xl">
                  {entry.title}
                </h3>
                <p className="symbol-copy mt-3 max-w-3xl text-base italic text-muted-soft">
                  {entry.summary}
                </p>
              </div>
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold/65">
                {children.length} Verse
              </p>
            </div>
          </Link>

          <div className="mt-4 grid gap-3">
            {children.map((child, index) => (
              <Link
                key={child.id}
                href={`/codex/${child.id}`}
                onClick={() => onActivateCodexEntry(child.id)}
                onFocus={() => onActivateCodexEntry(child.id)}
                className={`grid gap-3 border bg-black/[0.12] p-4 outline-none transition-colors duration-500 hover:border-gold/20 hover:bg-gold/[0.035] focus-visible:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/15 sm:grid-cols-[auto_1fr_auto] sm:items-center ${
                  activeCodexId === child.id ? "border-gold/40" : "border-white/[0.055]"
                }`}
              >
                <span className="font-serif text-2xl italic text-gold/80">{index + 1}</span>
                <span>
                  <span className="block font-serif text-2xl italic leading-tight text-foreground-strong">
                    {child.title}
                  </span>
                  <span className="symbol-copy mt-2 block text-sm italic text-muted-soft">
                    {child.summary}
                  </span>
                </span>
                <span className="text-[0.58rem] uppercase tracking-[0.22em] text-gold/65 sm:text-right">
                  Codex
                </span>
              </Link>
            ))}
          </div>
        </article>
      ) : null)}
    </div>
  );
}

export default function CodexPage() {
  const [query, setQuery] = useState("");
  const [activeViewId, setActiveViewId] = useState<CodexViewId>("all");
  const [activeCodexId, setActiveCodexId] = useState<string | null>(null);
  const trimmedQuery = query.trim();

  const activeViewEntries = useMemo(
    () => filterEntriesByView(codexRegistry, activeViewId),
    [activeViewId],
  );

  const visibleEntries = useMemo(() => {
    if (!trimmedQuery) {
      return activeViewEntries;
    }

    const activeIds = new Set(activeViewEntries.map((entry) => entry.id));
    return searchCodexEntries(trimmedQuery).filter((entry) => activeIds.has(entry.id));
  }, [activeViewEntries, trimmedQuery]);

  const groups = useMemo(
    () => activeViewId === "all" ? groupEntries(visibleEntries) : [],
    [activeViewId, visibleEntries],
  );

  const activeView = CODEX_VIEWS.find((view) => view.id === activeViewId) ?? CODEX_VIEWS[0];
  const activeCodexEntry = activeCodexId ? resolveCodexEntry(activeCodexId) : undefined;
  const hasPreparedEmptyView = activeViewEntries.length === 0;
  const hasSearchWithoutResults = !hasPreparedEmptyView && trimmedQuery && visibleEntries.length === 0;

  return (
    <main className="symbol-page symbol-section relative min-h-screen overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_8%,rgba(189,160,109,0.12),transparent_30%),radial-gradient(ellipse_at_78%_28%,rgba(127,184,201,0.055),transparent_28%),linear-gradient(180deg,rgba(2,5,12,0.18),rgba(2,5,12,0.82)_52%,rgba(2,5,12,0.96))]" />
        <div className="absolute inset-x-[8%] top-[23rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="max-w-5xl">
          <p className="symbol-kicker mb-8 text-gold/75">SYMBOLRAUM</p>
          <h1 className="font-serif text-6xl italic leading-[0.94] text-foreground-strong md:text-8xl">
            CODEX
          </h1>
          <p className="symbol-copy mt-7 max-w-3xl text-2xl italic text-gold/80 md:text-3xl">
            Das Ged&auml;chtnis des Bedeutungsuniversums
          </p>
          <p className="symbol-copy mt-7 max-w-3xl text-lg md:text-xl">
            Der Codex verbindet Symbole, hebr&auml;ische W&ouml;rter, Buchstaben, Zahlen, Bibelstellen und Bedeutungsfelder.
          </p>
        </header>

        <section className="mt-12">
          <div
            role="tablist"
            aria-label="Codex-Ansichten"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:thin] sm:mx-0 sm:px-0"
          >
            {CODEX_VIEWS.map((view) => {
              const isActive = view.id === activeViewId;
              const viewCount = filterEntriesByView(codexRegistry, view.id).length;

              return (
                <button
                  key={view.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveViewId(view.id)}
                  className={`shrink-0 border px-4 py-3 text-[0.62rem] uppercase tracking-[0.22em] outline-none transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-gold/25 ${
                    isActive
                      ? "border-gold/35 bg-gold/[0.075] text-gold shadow-[0_12px_42px_rgba(189,160,109,0.08)]"
                      : "border-white/[0.07] bg-white/[0.025] text-muted-soft hover:border-gold/20 hover:text-foreground"
                  }`}
                >
                  {view.label}
                  <span className="ml-2 text-gold/55">{viewCount}</span>
                </button>
              );
            })}
          </div>

          {activeCodexEntry ? (
            <>
              <CodexResonanceTeaser entry={activeCodexEntry} />
              <CodexResonancePath
                entry={activeCodexEntry}
                onActivateCodexEntry={setActiveCodexId}
              />
            </>
          ) : null}
        </section>

        <section className="mt-9 max-w-2xl">
          <label htmlFor="codex-search" className="symbol-kicker text-cyan-soft">
            Suche
          </label>
          <input
            id="codex-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Symbol, Buchstabe, Bibelstelle..."
            className="mt-4 w-full border border-white/[0.08] bg-white/[0.035] px-5 py-4 font-serif text-lg italic text-foreground outline-none backdrop-blur-md transition-colors duration-500 placeholder:text-muted/55 focus:border-gold/30"
          />
          {trimmedQuery ? (
            <p className="mt-4 text-[0.62rem] uppercase tracking-[0.24em] text-muted-soft">
              {visibleEntries.length} Treffer in {activeView.label}
            </p>
          ) : null}
        </section>

        <div className="mt-16 grid gap-16 md:mt-20">
          {activeViewId === "all" ? (
            groups.map((group) => (
              <section key={group.type}>
                <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.055] pb-5">
                  <div>
                    <p className="symbol-kicker text-cyan-soft">Codex-Typ</p>
                    <h2 className="mt-3 font-serif text-4xl italic leading-tight text-foreground-strong md:text-5xl">
                      {group.label}
                    </h2>
                  </div>
                  <p className="text-[0.62rem] uppercase tracking-[0.26em] text-gold/65">
                    {group.entries.length} Eintr&auml;ge
                  </p>
                </div>

                {group.entries.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {group.entries.map((entry) => (
                      <CodexCard
                        key={entry.id}
                        entry={entry}
                        activeCodexId={activeCodexId}
                        onActivateCodexEntry={setActiveCodexId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="symbol-copy text-base italic text-muted-soft">
                    Diese Ansicht ist vorbereitet. Eintr&auml;ge folgen.
                  </p>
                )}
              </section>
            ))
          ) : (
            <section>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.055] pb-5">
                <div>
                  <p className="symbol-kicker text-cyan-soft">{activeView.description}</p>
                  <h2 className="mt-3 font-serif text-4xl italic leading-tight text-foreground-strong md:text-5xl">
                    {activeView.label}
                  </h2>
                </div>
                <p className="text-[0.62rem] uppercase tracking-[0.26em] text-gold/65">
                  {visibleEntries.length} Eintr&auml;ge
                </p>
              </div>

              {visibleEntries.length > 0 ? (
                activeViewId === "torah" ? (
                  <TorahSequence
                    entries={visibleEntries}
                    activeCodexId={activeCodexId}
                    onActivateCodexEntry={setActiveCodexId}
                  />
                ) : activeViewId === "hebrew" ? (
                  <HebrewCodexView
                    entries={visibleEntries}
                    activeCodexId={activeCodexId}
                    onActivateCodexEntry={setActiveCodexId}
                  />
                ) : activeViewId === "meaning" ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleEntries.map((entry) => (
                      <MeaningCard
                        key={entry.id}
                        entry={entry}
                        activeCodexId={activeCodexId}
                        onActivateCodexEntry={setActiveCodexId}
                      />
                    ))}
                  </div>
                ) : activeViewId === "gematria" ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleEntries.map((entry) => (
                      <GematriaNumberCard
                        key={entry.id}
                        entry={entry}
                        activeCodexId={activeCodexId}
                        onActivateCodexEntry={setActiveCodexId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleEntries.map((entry) => (
                      <CodexCard
                        key={entry.id}
                        entry={entry}
                        activeCodexId={activeCodexId}
                        onActivateCodexEntry={setActiveCodexId}
                      />
                    ))}
                  </div>
                )
              ) : (
                <p className="symbol-copy text-base italic text-muted-soft">
                  {hasPreparedEmptyView
                    ? "Diese Ansicht ist vorbereitet. Eintr&auml;ge folgen."
                    : "Im aktuellen Codex ist zu dieser Suche noch kein Eintrag hinterlegt."}
                </p>
              )}
            </section>
          )}

          {hasSearchWithoutResults ? (
            <section className="border border-white/[0.065] bg-white/[0.025] p-8 text-center backdrop-blur-md">
              <p className="symbol-kicker text-cyan-soft">Keine Treffer</p>
              <p className="symbol-copy mt-4 text-xl italic">
                Im aktuellen Codex ist zu dieser Suche in {activeView.label} noch kein Eintrag hinterlegt.
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
