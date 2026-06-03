"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  parseStoredReflections,
  REFLECTION_STORAGE_KEY,
  type StoredReflection,
} from "@/lib/reflections";

function formatReflectionDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ohne Datum";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
  }).format(date);
}

function createExcerpt(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= 132) {
    return normalized;
  }

  return `${normalized.slice(0, 129).trim()}...`;
}

export function PathPreview() {
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedReflections = parseStoredReflections(
        window.localStorage.getItem(REFLECTION_STORAGE_KEY)
      );

      setReflections(storedReflections);

      if (storedReflections.length > 0) {
        window.localStorage.setItem(
          REFLECTION_STORAGE_KEY,
          JSON.stringify(storedReflections)
        );
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const sortedReflections = useMemo(
    () =>
      [...(reflections ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [reflections]
  );

  const latestReflection = sortedReflections[0];

  return (
    <section className="symbol-section relative pb-32 pt-8 md:pb-40">
      <div className="scroll-reveal relative mx-auto max-w-5xl border-y border-gold/[0.08] py-12 sm:py-14">
        <div className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-[18%] bottom-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        {reflections === null ? (
          <p className="symbol-copy text-center font-serif text-xl italic text-muted-soft">
            Dein Pfad wird gelesen...
          </p>
        ) : latestReflection ? (
          <div className="grid gap-8 md:grid-cols-[0.82fr_1.18fr] md:items-center">
            <div className="text-center md:text-left">
              <p className="symbol-kicker">Dein Pfad beginnt</p>
              <p className="mt-5 font-serif text-3xl italic leading-tight text-foreground-strong sm:text-4xl">
                {sortedReflections.length} gespeicherte{" "}
                {sortedReflections.length === 1 ? "Reflexion" : "Reflexionen"}
              </p>
            </div>

            <div className="relative border-t border-white/[0.055] pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center justify-center gap-4 md:justify-start">
                    <span
                      className="font-serif text-4xl leading-none text-gold/80"
                      lang="he"
                      dir="rtl"
                    >
                      {latestReflection.hebrew}
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="symbol-kicker text-cyan-soft">
                        {latestReflection.symbol}
                      </p>
                      <p className="symbol-copy mt-1 text-sm text-muted-soft">
                        {formatReflectionDate(latestReflection.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="symbol-copy mt-6 text-center text-xl italic md:text-left">
                    {createExcerpt(latestReflection.answer)}
                  </p>
                </div>

                <Link
                  href="/mein-pfad"
                  className="symbol-cta mx-auto shrink-0 md:mx-0"
                >
                  Mein Pfad öffnen
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
            <p className="symbol-copy max-w-2xl text-xl italic">
              Noch keine gespeicherte Reflexion. Beginne im Symbolnetz und folge den Verbindungen.
            </p>
            <Link
              href="/symbolnetz"
              className="symbol-cta mx-auto shrink-0 md:mx-0"
            >
              Symbolnetz betreten
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
