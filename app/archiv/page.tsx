"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LetterOverlay } from "@/components/rooms/engine/LetterOverlay";
import { codexRegistry } from "@/lib/codex/codexRegistry";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { biblicalReferences } from "@/lib/meaning/biblicalReferences";
import { meaningJourneys } from "@/lib/meaning/meaningJourneys";
import { meaningNodes } from "@/lib/meaning/meaningNodes";
import {
  getArchiveDiscoveryState,
  migrateLegacyPathState,
  type ArchiveDiscoveryState,
  type ArchiveDiscoveryStatus,
  type PersonalPathTargetType,
} from "@/lib/personalPathState";
import { symbolPathConfigs } from "@/lib/symbols/symbolPathConfig";
import { visualAssets } from "@/lib/visualAssets";

type ArchiveFilter = "all" | PersonalPathTargetType;

type ArchiveEntity = {
  id: string;
  type: PersonalPathTargetType;
  label: string;
  href?: string;
  meta?: string;
  hint?: string;
};

type StatusFilter = "all" | ArchiveDiscoveryStatus;

const filterLabels: Array<{ key: ArchiveFilter; label: string }> = [
  { key: "all", label: "Alle" },
  { key: "room", label: "Raeume" },
  { key: "symbol", label: "Symbole" },
  { key: "word", label: "Woerter" },
  { key: "letter", label: "Buchstaben" },
  { key: "scripture", label: "Bibelstellen" },
  { key: "meaning", label: "Bedeutungsfelder" },
  { key: "journey", label: "Bewegungen" },
];

const statusFilterLabels: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "Alle Status" },
  { key: "read", label: "Gelesen" },
  { key: "discovered", label: "Entdeckt" },
  { key: "undiscovered", label: "Noch verborgen" },
];

const statusLabels: Record<ArchiveDiscoveryStatus, string> = {
  undiscovered: "Noch verborgen",
  discovered: "Entdeckt",
  read: "Gelesen",
};

const typeLabels: Record<PersonalPathTargetType, string> = {
  room: "Raum",
  symbol: "Symbol",
  word: "Hebraeisches Wort",
  letter: "Hebraeischer Buchstabe",
  scripture: "Bibelstelle",
  meaning: "Bedeutungsfeld",
  journey: "Bewegung",
};

function getStatusRank(status: ArchiveDiscoveryStatus) {
  if (status === "read") return 2;
  if (status === "discovered") return 1;
  return 0;
}

function getDiscoveryMap(states: ArchiveDiscoveryState[]) {
  return new Map(states.map((state) => [`${state.entityType}:${state.entityId}`, state]));
}

function getStateForEntity(entity: ArchiveEntity, discoveryMap: Map<string, ArchiveDiscoveryState>): ArchiveDiscoveryState {
  return discoveryMap.get(`${entity.type}:${entity.id}`) ?? {
    entityId: entity.id,
    entityType: entity.type,
    status: "undiscovered",
  };
}

function getCodexType(type: string): PersonalPathTargetType {
  if (type === "hebrew-letter") return "letter";
  if (type === "hebrew-word") return "word";
  if (type === "scripture") return "scripture";
  if (type === "journey") return "journey";
  if (type === "meaning" || type === "meaning-field") return "meaning";

  return "symbol";
}

function capitalize(value: string) {
  return value ? `${value.charAt(0).toLocaleUpperCase("de-DE")}${value.slice(1)}` : value;
}

function buildArchiveEntities(): ArchiveEntity[] {
  const entities = new Map<string, ArchiveEntity>();
  const codexIds = new Set(codexRegistry.map((entry) => entry.id));

  function add(entity: ArchiveEntity) {
    const key = `${entity.type}:${entity.id}`;
    const current = entities.get(key);

    entities.set(key, {
      ...current,
      ...entity,
      label: current?.label ?? entity.label,
      href: entity.href ?? current?.href,
      meta: current?.meta ?? entity.meta,
      hint: current?.hint ?? entity.hint,
    });
  }

  Object.values(symbolPathConfigs).forEach((config) => {
    add({
      id: config.symbolId,
      type: "room",
      label: config.roomLabel,
      href: config.codexHref,
      meta: "Raum",
      hint: config.label,
    });
    add({
      id: config.symbolId,
      type: "symbol",
      label: config.label,
      href: config.codexHref,
      meta: config.roomLabel,
      hint: "Symbol im SYMBOLRAUM",
    });
  });

  hebrewLetters.forEach((letter) => {
    add({
      id: letter.id,
      type: "letter",
      label: letter.name,
      href: codexIds.has(letter.id) ? `/codex/${letter.id}` : undefined,
      meta: `Zahlenwert ${letter.numericValue}`,
      hint: letter.glyph,
    });
  });

  hebrewWords.forEach((word) => {
    add({
      id: word.id,
      type: "word",
      label: capitalize(word.transliteration),
      href: codexIds.has(word.id) ? `/codex/${word.id}` : undefined,
      meta: word.germanMeaning,
      hint: word.hebrew,
    });
  });

  biblicalReferences.forEach((reference) => {
    add({
      id: reference.id,
      type: "scripture",
      label: reference.label,
      href: codexIds.has(reference.id) ? `/codex/${reference.id}` : undefined,
      meta: reference.reference,
      hint: "Bibelstelle",
    });
  });

  meaningNodes.forEach((node) => {
    add({
      id: node.id,
      type: "meaning",
      label: node.label,
      href: codexIds.has(node.id) ? `/codex/${node.id}` : undefined,
      meta: "Bedeutungsfeld",
      hint: node.description,
    });
  });

  meaningJourneys.forEach((journey) => {
    add({
      id: journey.id,
      type: "journey",
      label: journey.title,
      href: codexIds.has(journey.id) ? `/codex/${journey.id}` : undefined,
      meta: "Bewegung",
      hint: `${journey.symbolPath.length} Stationen`,
    });
  });

  codexRegistry.forEach((entry) => {
    const type = getCodexType(entry.type);

    add({
      id: entry.id,
      type,
      label: entry.title,
      href: `/codex/${entry.id}`,
      meta: entry.subtitle ?? undefined,
      hint: type === "meaning" ? "Bedeutungsfeld im Codex" : undefined,
    });
  });

  return Array.from(entities.values()).sort((a, b) => {
    const typeOrder: Record<PersonalPathTargetType, number> = {
      room: 0,
      symbol: 1,
      word: 2,
      letter: 3,
      scripture: 4,
      meaning: 5,
      journey: 6,
    };
    const typeCompare = typeOrder[a.type] - typeOrder[b.type];

    return typeCompare || a.label.localeCompare(b.label, "de-DE");
  });
}

function getProgress(entities: ArchiveEntity[], discoveryMap: Map<string, ArchiveDiscoveryState>, type: ArchiveFilter, status: StatusFilter) {
  const scoped = type === "all" ? entities : entities.filter((entity) => entity.type === type);
  const statusScoped = status === "all" ? scoped : scoped.filter((entity) => getStateForEntity(entity, discoveryMap).status === status);
  const discovered = scoped.filter((entity) => getStatusRank(getStateForEntity(entity, discoveryMap).status) > 0).length;
  const read = scoped.filter((entity) => getStateForEntity(entity, discoveryMap).status === "read").length;

  return { total: scoped.length, visible: statusScoped.length, discovered, read };
}

function getVisibleLetterIds(discoveryMap: Map<string, ArchiveDiscoveryState>) {
  return hebrewLetters
    .filter((letter) => getStatusRank(getStateForEntity({ id: letter.id, type: "letter", label: letter.name }, discoveryMap).status) > 0)
    .map((letter) => letter.id);
}

export default function ArchivPage() {
  const [discovery, setDiscovery] = useState<ArchiveDiscoveryState[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<ArchiveFilter>("all");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [overlayLetterId, setOverlayLetterId] = useState<string | null>(null);

  useEffect(() => {
    migrateLegacyPathState();
    window.queueMicrotask(() => setDiscovery(getArchiveDiscoveryState()));
  }, []);

  const entities = useMemo(() => buildArchiveEntities(), []);
  const discoveryMap = useMemo(() => getDiscoveryMap(discovery ?? []), [discovery]);
  const visibleEntities = useMemo(
    () =>
      entities.filter((entity) => {
        const matchesType = activeFilter === "all" || entity.type === activeFilter;
        const matchesStatus = activeStatus === "all" || getStateForEntity(entity, discoveryMap).status === activeStatus;

        return matchesType && matchesStatus;
      }),
    [activeFilter, activeStatus, discoveryMap, entities]
  );
  const progress = useMemo(() => getProgress(entities, discoveryMap, activeFilter, activeStatus), [activeFilter, activeStatus, discoveryMap, entities]);
  const visibleLetterIds = useMemo(() => getVisibleLetterIds(discoveryMap), [discoveryMap]);
  const groupedEntities = useMemo(
    () =>
      filterLabels
        .filter((filter) => filter.key !== "all")
        .map((filter) => ({
          ...filter,
          entities: visibleEntities.filter((entity) => entity.type === filter.key),
        }))
        .filter((group) => group.entities.length > 0),
    [visibleEntities]
  );

  return (
    <main className="symbol-page symbol-section relative min-h-screen overflow-hidden py-40 md:py-36">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={visualAssets.archivHero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="sacred-drift object-cover opacity-[0.32]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(189,160,109,0.1),transparent_28%),linear-gradient(180deg,rgba(2,5,12,0.5),rgba(2,5,12,0.82)_48%,rgba(2,5,12,0.97))]" />
        <div className="absolute inset-x-[8%] top-[24rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="symbol-fade-in mb-16 max-w-5xl">
          <p className="symbol-kicker mb-8 text-gold/75">Archivraum</p>
          <h1 className="max-w-5xl font-serif text-6xl italic leading-[0.96] text-foreground-strong md:text-8xl">
            Entdeckungen im SYMBOLRAUM
          </h1>
          <p className="symbol-copy mt-9 max-w-3xl text-xl italic md:text-2xl">
            Ein ruhiger Ueberblick ueber Raeume, Symbole, Woerter, Buchstaben, Bibelstellen und Bedeutungsfelder.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/codex" className="symbol-archive-action">
              Codex
            </Link>
          </div>
        </header>

        {discovery === null ? (
          <section className="symbol-path-empty scroll-reveal mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Archiv wird gelesen</p>
            <p className="mt-6 font-serif text-3xl italic text-foreground-strong">
              Der Entdeckungsstatus tritt hervor.
            </p>
          </section>
        ) : (
          <div className="grid gap-10">
            <section className="symbol-path-section">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="symbol-kicker text-cyan-soft">Fortschritt</p>
                  <h2 className="mt-4 font-serif text-4xl italic leading-tight text-foreground-strong md:text-5xl">
                    {progress.discovered} von {progress.total} entdeckt
                  </h2>
                  <p className="symbol-copy mt-4 max-w-xl text-sm">
                    Davon {progress.read} gelesen. Sichtbar im aktuellen Filter: {progress.visible}.
                  </p>
                </div>
                <div className="symbol-archive-filter-stack">
                  <div className="symbol-path-filters" aria-label="Archiv nach Kategorie filtern">
                    {filterLabels.map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        className={activeFilter === filter.key ? "is-active" : undefined}
                        aria-pressed={activeFilter === filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="symbol-path-filters symbol-path-filters--status" aria-label="Archiv nach Status filtern">
                    {statusFilterLabels.map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        className={activeStatus === filter.key ? "is-active" : undefined}
                        aria-pressed={activeStatus === filter.key}
                        onClick={() => setActiveStatus(filter.key)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-8">
              {(activeFilter === "all" ? groupedEntities : [{ key: activeFilter, label: filterLabels.find((filter) => filter.key === activeFilter)?.label ?? "Archiv", entities: visibleEntities }]).map((group) => (
                <div key={group.key} className="symbol-archive-category">
                  <div className="symbol-archive-category__head">
                    <p className="symbol-kicker text-cyan-soft">{group.label}</p>
                    <p>{group.entities.length} Eintraege</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.entities.map((entity) => {
                  const state = getStateForEntity(entity, discoveryMap);
                  const statusRank = getStatusRank(state.status);
                  const isLetter = entity.type === "letter";

                  return (
                    <article
                      key={`${entity.type}-${entity.id}`}
                      className={`symbol-archive-fragment p-5 transition-opacity duration-700 ${
                        statusRank > 0 ? "opacity-100" : "opacity-[0.38]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-soft">
                          {typeLabels[entity.type]}
                        </p>
                        <p className={state.status === "read" ? "text-[10px] uppercase tracking-[0.22em] text-gold/75" : state.status === "discovered" ? "text-[10px] uppercase tracking-[0.22em] text-cyan-soft/75" : "text-[10px] uppercase tracking-[0.22em] text-muted-soft/65"}>
                          {statusLabels[state.status]}
                        </p>
                      </div>

                      <h3 className="mt-4 font-serif text-2xl italic leading-tight text-foreground-strong">
                        {entity.label}
                      </h3>
                      {entity.meta ? (
                        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-cyan-soft/75">
                          {entity.meta}
                        </p>
                      ) : null}
                      {entity.hint ? (
                        <p className="symbol-copy mt-3 line-clamp-2 text-sm italic">
                          {entity.hint}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.055] pt-4">
                        {entity.href ? (
                          <Link href={entity.href} className="symbol-archive-action">
                            Codex
                          </Link>
                        ) : null}
                        {isLetter && statusRank > 0 ? (
                          <button type="button" onClick={() => setOverlayLetterId(entity.id)} className="symbol-archive-action">
                            Ansehen
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                    })}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>

      {overlayLetterId ? (
        <LetterOverlay
          initialLetterId={overlayLetterId}
          visibleLetterIds={visibleLetterIds}
          onActiveLetterChange={setOverlayLetterId}
          onClose={() => setOverlayLetterId(null)}
        />
      ) : null}
    </main>
  );
}
