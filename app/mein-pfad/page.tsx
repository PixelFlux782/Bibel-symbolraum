"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  persistStoredReflections,
  parseStoredReflections,
  REFLECTION_STORAGE_KEY,
  resolveReflectionReturnLinks,
  type ReflectionReturnLink,
  type StoredReflection,
} from "@/lib/reflections";
import { getSymbolPathConfigFromReflectionLike } from "@/lib/symbols/symbolPathConfig";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ohne Datum";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
  }).format(date);
}

function normalizeTraceText(value: string) {
  return value.toLocaleLowerCase("de-DE").replace(/\s+/g, " ").trim();
}

function cleanTraceLabel(value: string | undefined) {
  return value?.split(/[?#]/, 1)[0].replace(/\s*->\s*/g, " in ").trim();
}

function getTraceBaseTitle(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (bridge) {
    return bridge.label;
  }

  return reflection.title?.trim() || reflection.symbol.trim();
}

function getTouchedLabel(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  return bridge?.label || cleanTraceLabel(reflection.title) || cleanTraceLabel(reflection.symbol);
}

function getRoomContextLabel(reflection: StoredReflection) {
  const title = getTraceBaseTitle(reflection);
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (bridge && (reflection.sourceType === "room" || reflection.roomHref === bridge.roomHref)) {
    return bridge.reflectionSource.contextLabel;
  }

  if (reflection.sourceType === "room") {
    return `Aus dem ${title}-Raum`;
  }

  if (reflection.roomHref) {
    return `Aus dem ${title}-Raum`;
  }

  return undefined;
}

function getTraceContext(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (isConfiguredRoomReflection(reflection)) {
    return bridge?.pathLabel ?? bridge?.reflectionSource.contextLabel ?? "Spur aus dem Raum";
  }

  const roomContext = getRoomContextLabel(reflection);

  if (roomContext) {
    return reflection.stateTitle ? `${roomContext} / ${reflection.stateTitle}` : roomContext;
  }

  if (reflection.sourceType === "symbol") {
    return "Aus dem Symbolnetz";
  }

  if (
    reflection.sourceType === "pattern" ||
    reflection.sourceType === "journey" ||
    reflection.sourceType === "core" ||
    reflection.sourceType === "letter" ||
    reflection.codexHref
  ) {
    return "Aus dem Codex";
  }

  if (bridge?.symbolId === "wasser") {
    return "Wasser-Spur";
  }

  return "Aeltere Spur";
}

function getTraceTitle(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  if (isConfiguredRoomReflection(reflection)) {
    return bridge?.reflectionSource.label ?? "Spur aus dem Raum";
  }

  const title = getTraceBaseTitle(reflection);
  const pathLabel = cleanTraceLabel(reflection.pathLabel);

  if (pathLabel) {
    return normalizeTraceText(pathLabel).includes(normalizeTraceText(title))
      ? pathLabel
      : `${title} in ${pathLabel}`;
  }

  if (reflection.stateTitle) {
    return `${title} / ${reflection.stateTitle}`;
  }

  return title;
}

function isConfiguredRoomReflection(reflection: StoredReflection) {
  const bridge = getSymbolPathConfigFromReflectionLike(reflection);

  return Boolean(bridge && (reflection.sourceType === "room" || reflection.roomHref === bridge.roomHref));
}

type ReflectionGroupKey = "rooms" | "codex" | "network" | "older";

type ReflectionGroup = {
  key: ReflectionGroupKey;
  label: string;
  reflections: StoredReflection[];
};

const groupOrder: Array<{ key: ReflectionGroupKey; label: string }> = [
  { key: "rooms", label: "Spuren aus Raeumen" },
  { key: "codex", label: "Spuren aus dem Codex" },
  { key: "network", label: "Spuren aus dem Netz" },
  { key: "older", label: "Aeltere Spuren" },
];

function getReflectionGroupKey(reflection: StoredReflection): ReflectionGroupKey {
  if (reflection.sourceType === "room" || reflection.roomHref) return "rooms";
  if (reflection.sourceType === "symbol") return "network";
  if (
    reflection.sourceType === "pattern" ||
    reflection.sourceType === "journey" ||
    reflection.sourceType === "core" ||
    reflection.sourceType === "letter" ||
    reflection.codexHref
  ) {
    return "codex";
  }

  return "older";
}

function buildReflectionGroups(reflections: StoredReflection[]): ReflectionGroup[] {
  return groupOrder
    .map(({ key, label }) => ({
      key,
      label,
      reflections: reflections.filter((reflection) => getReflectionGroupKey(reflection) === key),
    }))
    .filter((group) => group.reflections.length > 0);
}

function getRepeatedTouches(reflections: StoredReflection[]) {
  const counts = new Map<string, { label: string; count: number }>();

  reflections.forEach((reflection) => {
    const label = getTouchedLabel(reflection);
    if (!label) return;

    const key = normalizeTraceText(label);
    const current = counts.get(key);

    counts.set(key, { label, count: current ? current.count + 1 : 1 });
  });

  return [...counts.values()]
    .filter((item) => item.count > 1)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "de-DE"))
    .slice(0, 3)
    .map((item) => item.label);
}

function getTouchedSummary(reflections: StoredReflection[]) {
  const labels: string[] = [];
  const seen = new Set<string>();

  reflections.forEach((reflection) => {
    const label = getTouchedLabel(reflection);
    if (!label) return;

    const key = normalizeTraceText(label);
    if (seen.has(key)) return;

    seen.add(key);
    labels.push(label);
  });

  return labels.slice(0, 3);
}

function getTraceCountLabel(count: number) {
  return count === 1 ? "1 Spur" : `${count} Spuren`;
}

export default function MeinPfadPage() {
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);

  useEffect(() => {
    let storedReflections: StoredReflection[] = [];

    try {
      storedReflections = parseStoredReflections(
        window.localStorage.getItem(REFLECTION_STORAGE_KEY)
      );
    } catch {
      storedReflections = [];
    }

    persistStoredReflections(storedReflections);
    window.queueMicrotask(() => setReflections(storedReflections));
  }, []);

  const sortedReflections = useMemo(
    () => [...(reflections ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reflections]
  );
  const reflectionGroups = useMemo(() => buildReflectionGroups(sortedReflections), [sortedReflections]);
  const showGroups = sortedReflections.length >= 4 && reflectionGroups.length > 1;
  const repeatedTouches = useMemo(() => getRepeatedTouches(sortedReflections), [sortedReflections]);
  const touchedSummary = useMemo(() => getTouchedSummary(sortedReflections), [sortedReflections]);

  function handleRemoveReflection(id: string) {
    setReflections((current) => {
      const next = (current ?? []).filter((reflection) => reflection.id !== id);

      persistStoredReflections(next);
      return next;
    });
  }

  return (
    <div className="symbol-page symbol-section min-h-screen py-36 md:py-40">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="sacred-drift absolute inset-[-8%] bg-[radial-gradient(circle_at_50%_18%,rgba(189,160,109,0.1),transparent_26%),radial-gradient(circle_at_28%_68%,rgba(91,152,174,0.075),transparent_30%)]" />
        <div className="absolute inset-x-[8%] top-[22rem] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.18),rgba(2,5,12,0.76)_48%,rgba(2,5,12,0.94))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="symbol-fade-in mb-14 text-center">
          <p className="symbol-kicker mb-7">Mein Pfad</p>
          <h1 className="mx-auto max-w-4xl font-serif text-5xl italic leading-[0.98] text-foreground-strong md:text-7xl">
            Bewahrte Spuren
          </h1>
          <p className="symbol-copy mx-auto mt-8 max-w-2xl text-xl italic md:text-2xl">
            Hier sammeln sich die Spuren, die du im SYMBOLRAUM bewahrt hast.
          </p>
        </header>

        {reflections === null ? (
          <div className="symbol-path-empty mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Der Pfad wird still</p>
            <p className="mt-6 font-serif text-3xl italic text-foreground-strong">
              Die bewahrten Spuren oeffnen sich gerade.
            </p>
          </div>
        ) : sortedReflections.length === 0 ? (
          <div className="symbol-path-empty mx-auto max-w-3xl text-center">
            <p className="symbol-kicker">Noch ist dein Pfad still.</p>
            <p className="mt-6 font-serif text-3xl italic leading-tight text-foreground-strong md:text-4xl">
              Betritt einen Raum oder oeffne einen Codex-Eintrag, um eine erste Spur aufzunehmen.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/symbolnetz" className="symbol-cta">
                Zum Symbolnetz
              </Link>
              <Link href="/codex" className="symbol-cta symbol-cta-secondary">
                Zum Codex
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="symbol-path-summary mx-auto mb-10 max-w-3xl text-center" aria-label="Pfadverdichtung">
              <p className="symbol-copy text-xl italic md:text-2xl">
                Dein Pfad sammelt keine Antworten.
                <br />
                Er bewahrt die Stellen, an denen etwas in dir nachklang.
              </p>
              <p className="symbol-path-summary__meta mt-5">
                {[getTraceCountLabel(sortedReflections.length), ...touchedSummary].join(" / ")}
              </p>
              {repeatedTouches.length > 0 ? (
                <p className="symbol-path-resonance mt-4">
                  Mehrfach beruehrt: {repeatedTouches.join(", ")}
                </p>
              ) : null}
            </section>

            {showGroups ? (
              <div className="grid gap-10" aria-label="Bewahrte Spuren">
                {reflectionGroups.map((group) => (
                  <section key={group.key} className="symbol-path-group">
                    <h2 className="symbol-path-group__title">{group.label}</h2>
                    <div className="symbol-path-list grid gap-5">
                      {group.reflections.map((reflection) => (
                        <ReflectionArticle
                          key={reflection.id}
                          reflection={reflection}
                          returnLinks={resolveReflectionReturnLinks(reflection)}
                          onRemove={handleRemoveReflection}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <section className="symbol-path-list grid gap-5" aria-label="Bewahrte Spuren">
                {sortedReflections.map((reflection) => (
                  <ReflectionArticle
                    key={reflection.id}
                    reflection={reflection}
                    returnLinks={resolveReflectionReturnLinks(reflection)}
                    onRemove={handleRemoveReflection}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReflectionArticle({
  reflection,
  returnLinks,
  onRemove,
}: {
  reflection: StoredReflection;
  returnLinks: ReflectionReturnLink[];
  onRemove: (id: string) => void;
}) {
  return (
    <article className="symbol-path-fragment px-5 py-5 sm:px-6 sm:py-6">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className="symbol-kicker text-cyan-soft">{getTraceContext(reflection)}</p>
          <h3 className="mt-4 font-serif text-2xl italic leading-tight text-foreground-strong md:text-3xl">
            {getTraceTitle(reflection)}
          </h3>
          <p className="symbol-copy mt-3 text-base italic text-gold/75">
            {reflection.question}
          </p>
          <p className="symbol-copy mt-5 whitespace-pre-line break-words text-lg italic">
            {reflection.answer}
          </p>
        </div>
        <p className="symbol-copy text-xs uppercase tracking-[0.2em] text-muted-soft sm:text-right">
          {formatDate(reflection.createdAt)}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4">
        {returnLinks.map((link) => (
          <Link key={`${link.key}-${link.href}`} href={link.href} className="symbol-archive-action">
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => onRemove(reflection.id)}
          className="symbol-archive-action"
        >
          Spur entfernen
        </button>
      </div>
    </article>
  );
}
