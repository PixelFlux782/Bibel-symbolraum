"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getPersonalTraceForSymbol,
  getReflectionContextLabel,
  getReflectionPreview,
  readStoredReflections,
  STORED_REFLECTIONS_UPDATED_EVENT,
  type StoredReflection,
} from "@/lib/reflections";

type CodexPersonalTraceCardProps = {
  symbolSlug: string;
  roomHref?: string;
  journeyTitle?: string;
};

export function CodexPersonalTraceCard({
  symbolSlug,
  roomHref,
  journeyTitle,
}: CodexPersonalTraceCardProps) {
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);

  useEffect(() => {
    function refreshReflections() {
      setReflections(readStoredReflections());
    }

    window.queueMicrotask(refreshReflections);
    window.addEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshReflections);

    return () => {
      window.removeEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshReflections);
    };
  }, []);

  const reflection = useMemo(() => {
    if (!reflections) return undefined;

    return getPersonalTraceForSymbol(reflections, symbolSlug, { preferJourney: Boolean(journeyTitle) });
  }, [journeyTitle, reflections, symbolSlug]);

  if (!reflection) {
    return null;
  }

  const preview = getReflectionPreview(reflection);
  const contextLabel = getReflectionContextLabel(reflection);
  const traceRoomHref = reflection.roomHref ?? roomHref;

  return (
    <section className="codex-personal-trace" aria-label="Deine Spur zu diesem Symbol">
      <p className="symbol-kicker text-cyan-soft">Deine Spur zu diesem Symbol</p>
      {contextLabel ? (
        <p className="codex-personal-trace__context">{contextLabel}</p>
      ) : null}
      {preview ? (
        <p className="codex-personal-trace__preview">&bdquo;{preview}&ldquo;</p>
      ) : null}
      <div className="codex-personal-trace__actions">
        <Link href="/mein-pfad" className="symbol-archive-action">
          In Mein Pfad ansehen
        </Link>
        {traceRoomHref ? (
          <Link href={traceRoomHref} className="symbol-archive-action symbol-archive-action--quiet">
            Raum erneut betreten
          </Link>
        ) : null}
      </div>
    </section>
  );
}
