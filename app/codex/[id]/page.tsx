import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { codexEntryIds, codexRegistry } from "@/lib/codex/codexRegistry";
import { resolveCodexEntry } from "@/lib/codex/resolveCodexEntry";
import type { CodexEntry, CodexEntryType, CodexRelation } from "@/lib/codex/types";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { meaningNodes } from "@/lib/meaning/meaningNodes";

type CodexDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
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

function formatList(items: string[]) {
  return items.length > 0 ? items.join(", ") : "n/a";
}

function relationTarget(relation: CodexRelation) {
  return relation.targetId || ("target" in relation && typeof relation.target === "string" ? relation.target : "");
}

function resolveLinkedCodexEntry(value: string | null | undefined) {
  return value ? resolveCodexEntry(value) : undefined;
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-white/[0.075] bg-white/[0.025] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-7">
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
  return codexEntryIds.map((id) => ({ id }));
}

export async function generateMetadata({ params }: CodexDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = resolveCodexEntry(id);

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

export default async function CodexDetailPage({ params }: CodexDetailPageProps) {
  const { id } = await params;
  const entry = resolveCodexEntry(id);

  if (!entry) {
    notFound();
  }

  return (
    <main className="symbol-page symbol-section relative min-h-screen overflow-hidden py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_8%,rgba(189,160,109,0.12),transparent_30%),radial-gradient(ellipse_at_82%_20%,rgba(127,184,201,0.05),transparent_28%),linear-gradient(180deg,rgba(2,5,12,0.16),rgba(2,5,12,0.82)_52%,rgba(2,5,12,0.96))]" />
        <div className="absolute inset-x-[8%] top-[24rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <Link
          href="/codex"
          className="symbol-kicker inline-flex text-gold/70 transition-colors duration-500 hover:text-gold"
        >
          Zurueck zum Codex
        </Link>

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
            <div className="border border-white/[0.075] bg-white/[0.025] px-8 py-7 text-left backdrop-blur-md lg:min-w-64">
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
            <JourneyStepsSection entry={entry} />

            <DetailSection title="Bedeutungsfelder">
              {entry.meaningFields.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {entry.meaningFields.map((field) => {
                    const linkedEntry = resolveLinkedCodexEntry(field);
                    const className =
                      "border border-gold/15 bg-gold/[0.045] px-3 py-2 text-xs uppercase tracking-[0.18em] text-gold/80 transition-colors duration-500";

                    return linkedEntry ? (
                      <Link
                        key={field}
                        href={`/codex/${linkedEntry.id}`}
                        className={`${className} hover:border-gold/30 hover:bg-gold/[0.075] hover:text-gold`}
                      >
                        {field}
                      </Link>
                    ) : (
                      <span key={field} className={className}>
                        {field}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="symbol-copy text-base italic text-muted-soft">Keine Bedeutungsfelder hinterlegt.</p>
              )}
            </DetailSection>

            <MeaningResonanceSection entry={entry} />
            <LetterResonanceSection entry={entry} />
            <NumberResonanceSection entry={entry} />
            <SymbolicTrailSection entry={entry} />
            <RelationsSection entry={entry} />
            <ScriptureAnchorsSection entry={entry} />
          </div>

          <aside className="grid content-start gap-5">
            <DetailSection title="Einordnung">
              <dl>
                <FieldRow label="ID" value={entry.id} />
                <FieldRow label="Typ" value={formatType(entry.type)} />
                {entry.symbolRoomSlug ? (
                  <FieldRow
                    label="Symbolraum"
                    value={
                      <Link
                        href={`/symbole/${entry.symbolRoomSlug}`}
                        className="font-serif italic text-gold/85 transition-colors duration-500 hover:text-gold"
                      >
                        {entry.symbolRoomSlug}
                      </Link>
                    }
                  />
                ) : null}
                {entry.journeyIds.length > 0 ? (
                  <FieldRow label="Journeys" value={formatList(entry.journeyIds)} />
                ) : null}
              </dl>
            </DetailSection>

            <DetailSection title="Quellen">
              <dl>
                <FieldRow label="Status" value={entry.meta.status} />
                <FieldRow label="Quellen" value={formatList(entry.meta.source)} />
                <FieldRow label="Quell-IDs" value={formatList(entry.meta.sourceIds)} />
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

function JourneyStepsSection({ entry }: { entry: CodexEntry }) {
  if (!entry.steps?.length) {
    return null;
  }

  return (
    <DetailSection title="Gefuehrter Pfad">
      <ol className="grid gap-4">
        {entry.steps.map((step, index) => {
          const linkedEntry = resolveLinkedCodexEntry(step.codexId);

          return (
            <li key={step.id} className="grid gap-3 border border-white/[0.065] bg-black/10 p-4 sm:grid-cols-[auto_1fr]">
              <span className="flex h-9 w-9 items-center justify-center border border-gold/20 font-serif text-lg text-gold/85">
                {index + 1}
              </span>
              <div>
                {linkedEntry ? (
                  <Link
                    href={`/codex/${linkedEntry.id}`}
                    className="font-serif text-xl italic text-foreground-strong transition-colors duration-500 hover:text-gold"
                  >
                    {step.label}
                  </Link>
                ) : (
                  <p className="font-serif text-xl italic text-foreground-strong">{step.label}</p>
                )}
                {step.description ? (
                  <p className="symbol-copy mt-2 text-sm italic text-muted-soft">{step.description}</p>
                ) : null}
                <p className="mt-3 text-[0.58rem] uppercase tracking-[0.24em] text-gold/60">
                  {linkedEntry?.title ?? step.codexId}
                </p>
              </div>
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

function MeaningResonanceSection({ entry }: { entry: CodexEntry }) {
  const resonance = getMeaningResonance(entry);

  if (!resonance) {
    return null;
  }

  return (
    <DetailSection title="Bedeutungs-Resonanz">
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

function NumberResonanceSection({ entry }: { entry: CodexEntry }) {
  const resonance = getNumberResonance(entry);

  if (!resonance) {
    return null;
  }

  return (
    <DetailSection title="Zahlen-Resonanz">
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

function LetterResonanceSection({ entry }: { entry: CodexEntry }) {
  const resonance = getLetterResonance(entry);

  if (!resonance) {
    return null;
  }

  return (
    <DetailSection title="Buchstaben-Resonanz">
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

function SymbolicTrailSection({ entry }: { entry: CodexEntry }) {
  if (entry.type !== "scripture") {
    return null;
  }

  const trail = getSymbolicTrail(entry);
  const hasTrail = trail.fields.length > 0 || trail.arising.length > 0 || trail.onward.length > 0;

  if (!hasTrail) {
    return null;
  }

  return (
    <DetailSection title="Symbolische Spur">
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

function RelationsSection({ entry }: { entry: CodexEntry }) {
  return (
    <DetailSection title="Relationen">
      {entry.relations.length > 0 ? (
        <div className="grid gap-3">
          {entry.relations.map((relation, index) => {
            const target = relationTarget(relation);
            const linkedEntry = resolveLinkedCodexEntry(target);

            return (
              <article key={`${relation.type}-${target}-${index}`} className="border border-white/[0.06] bg-black/[0.12] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-gold/70">{relation.type}</p>
                  {linkedEntry ? (
                    <Link
                      href={`/codex/${linkedEntry.id}`}
                      className="font-mono text-xs text-gold/75 transition-colors duration-500 hover:text-gold"
                    >
                      {target}
                    </Link>
                  ) : (
                    <p className="font-mono text-xs text-muted-soft">{target || "nicht im Codex"}</p>
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

function ScriptureAnchorsSection({ entry }: { entry: CodexEntry }) {
  return (
    <DetailSection title="Bibelanker">
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
