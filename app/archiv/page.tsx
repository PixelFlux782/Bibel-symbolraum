"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LetterOverlay } from "@/components/rooms/engine/LetterOverlay";
import { codexRegistry } from "@/lib/codex/codexRegistry";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { biblicalReferences } from "@/lib/meaning/biblicalReferences";
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
};

const filterLabels: Array<{ key: ArchiveFilter; label: string }> = [
  { key: "all", label: "Alle" },
  { key: "letter", label: "Buchstaben" },
  { key: "word", label: "Woerter" },
  { key: "scripture", label: "Bibelstellen" },
  { key: "symbol", label: "Symbole" },
  { key: "meaning", label: "Bedeutung" },
  { key: "journey", label: "Wege" },
];

const statusLabels: Record<ArchiveDiscoveryStatus, string> = {
  undiscovered: "unentdeckt",
  discovered: "entdeckt",
  read: "gelesen",
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

function buildArchiveEntities(): ArchiveEntity[] {
  const entities = new Map<string, ArchiveEntity>();

  function add(entity: ArchiveEntity) {
    entities.set(`${entity.type}:${entity.id}`, entity);
  }

  Object.values(symbolPathConfigs).forEach((config) => {
    add({
      id: config.symbolId,
      type: "symbol",
      label: config.label,
      href: config.codexHref,
      meta: config.roomLabel,
    });
  });

  hebrewLetters.forEach((letter) => {
    add({
      id: letter.id,
      type: "letter",
      label: letter.name,
      href: `/codex/${letter.id}`,
      meta: `Zahlenwert ${letter.numericValue}`,
    });
  });

  hebrewWords.forEach((word) => {
    add({
      id: word.id,
      type: "word",
      label: word.germanMeaning,
      href: `/codex/${word.id}`,
      meta: `${word.hebrew} / ${word.transliteration}`,
    });
  });

  biblicalReferences.forEach((reference) => {
    add({
      id: reference.id,
      type: "scripture",
      label: reference.label,
      href: `/codex/${reference.id}`,
      meta: reference.reference,
    });
  });

  codexRegistry.forEach((entry) => {
    add({
      id: entry.id,
      type: getCodexType(entry.type),
      label: entry.title,
      href: `/codex/${entry.id}`,
      meta: entry.subtitle ?? undefined,
    });
  });

  return Array.from(entities.values()).sort((a, b) => {
    const typeCompare = a.type.localeCompare(b.type, "de-DE");

    return typeCompare || a.label.localeCompare(b.label, "de-DE");
  });
}

function getProgress(entities: ArchiveEntity[], discoveryMap: Map<string, ArchiveDiscoveryState>, type: ArchiveFilter) {
  const scoped = type === "all" ? entities : entities.filter((entity) => entity.type === type);
  const discovered = scoped.filter((entity) => getStatusRank(getStateForEntity(entity, discoveryMap).status) > 0).length;
  const read = scoped.filter((entity) => getStateForEntity(entity, discoveryMap).status === "read").length;

  return { total: scoped.length, discovered, read };
}

function getVisibleLetterIds(discoveryMap: Map<string, ArchiveDiscoveryState>) {
  return hebrewLetters
    .filter((letter) => getStatusRank(getStateForEntity({ id: letter.id, type: "letter", label: letter.name }, discoveryMap).status) > 0)
    .map((letter) => letter.id);
}

export default function ArchivPage() {
  const [discovery, setDiscovery] = useState<ArchiveDiscoveryState[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<ArchiveFilter>("all");
  const [overlayLetterId, setOverlayLetterId] = useState<string | null>(null);

  useEffect(() => {
    migrateLegacyPathState();
    window.queueMicrotask(() => setDiscovery(getArchiveDiscoveryState()));
  }, []);

  const entities = useMemo(() => buildArchiveEntities(), []);
  const discoveryMap = useMemo(() => getDiscoveryMap(discovery ?? []), [discovery]);
  const visibleEntities = useMemo(
    () => (activeFilter === "all" ? entities : entities.filter((entity) => entity.type === activeFilter)),
    [activeFilter, entities]
  );
  const progress = useMemo(() => getProgress(entities, discoveryMap, activeFilter), [activeFilter, discoveryMap, entities]);
  const visibleLetterIds = useMemo(() => getVisibleLetterIds(discoveryMap), [discoveryMap]);

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
            Fortschritt und Entdeckung
          </h1>
          <p className="symbol-copy mt-9 max-w-3xl text-xl italic md:text-2xl">
            Das Archiv zeigt, welche Buchstaben, Woerter, Bibelstellen, Symbole und Bedeutungsfelder unentdeckt, entdeckt oder gelesen sind.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/mein-pfad" className="symbol-archive-action">
              Mein Pfad
            </Link>
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
                    Davon {progress.read} gelesen. Der Status entsteht durch Besuche, geoeffnete Buchstaben und bewusste Markierungen.
                  </p>
                </div>
                <div className="symbol-path-filters" aria-label="Archiv filtern">
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
              </div>
            </section>

            <section className="symbol-path-section">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleEntities.map((entity) => {
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
                          {entity.type}
                        </p>
                        <p className={state.status === "read" ? "text-[10px] uppercase tracking-[0.22em] text-gold/75" : "text-[10px] uppercase tracking-[0.22em] text-muted-soft/65"}>
                          {statusLabels[state.status]}
                        </p>
                      </div>

                      <h3 className="mt-5 font-serif text-2xl italic text-foreground-strong">
                        {entity.label}
                      </h3>
                      {entity.meta ? (
                        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-cyan-soft/75">
                          {entity.meta}
                        </p>
                      ) : null}

                      <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.055] pt-5">
                        {entity.href ? (
                          <Link href={entity.href} className="symbol-archive-action">
                            Im Codex oeffnen
                          </Link>
                        ) : null}
                        {isLetter && statusRank > 0 ? (
                          <button type="button" onClick={() => setOverlayLetterId(entity.id)} className="symbol-archive-action">
                            Buchstabe ansehen
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
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
