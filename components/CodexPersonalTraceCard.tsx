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
import { derivePersonalWay, type PersonalWay, type PersonalWayOpening } from "@/lib/personalWay";

type CodexPersonalTraceCardProps = {
  entryId: string;
  symbolSlug?: string;
  roomHref?: string;
  journeyTitle?: string;
};

type PersonalWaymark = {
  text: string;
  opening?: PersonalWayOpening;
};

function getHrefId(href: string | null | undefined) {
  const normalizedHref = href?.split(/[?#]/, 1)[0];
  const match = normalizedHref?.match(/^\/(?:codex|raeume)\/([^/]+)$/);

  return match?.[1];
}

function getCandidateIds(entryId: string, symbolSlug?: string) {
  return Array.from(new Set([entryId, symbolSlug].filter(Boolean) as string[]));
}

function getMatchingOpening(personalWay: PersonalWay, candidateIds: string[]) {
  const anchorOpening = personalWay.nextOpenings.find((opening) =>
    candidateIds.some((id) => opening.source === "codex" && opening.id === `anchor-room-${id}`)
  );

  if (anchorOpening) {
    return anchorOpening;
  }

  return personalWay.nextOpenings.find((opening) =>
    candidateIds.some((id) => getHrefId(opening.href) === id || opening.id.endsWith(`-${id}`))
  );
}

function deriveCodexWaymark({
  entryId,
  personalWay,
  symbolSlug,
}: {
  entryId: string;
  personalWay: PersonalWay;
  symbolSlug?: string;
}): PersonalWaymark | null {
  const candidateIds = getCandidateIds(entryId, symbolSlug);
  const isTouched = candidateIds.some((id) => personalWay.touchedSymbols.includes(id) || personalWay.reflectedAnchors.includes(id));
  const isFamiliar = candidateIds.some((id) => personalWay.familiarSymbols.includes(id));
  const matchingOpening = getMatchingOpening(personalWay, candidateIds);

  if (matchingOpening?.source === "codex" && personalWay.reflectedAnchors.includes(entryId)) {
    return {
      text: "Von hier oeffnet sich ein naechster Raum.",
      opening: matchingOpening,
    };
  }

  if (isFamiliar) {
    return {
      text: "Dieses Zeichen ist dir nicht mehr fremd. Es kehrt auf deinem Weg wieder.",
    };
  }

  if (isTouched) {
    return {
      text: "Dieses Zeichen liegt bereits auf deinem Weg.",
    };
  }

  if (matchingOpening) {
    return {
      text: "Von hier oeffnet sich ein naechster Raum.",
      opening: matchingOpening,
    };
  }

  return null;
}

export function CodexPersonalTraceCard({
  entryId,
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
    if (!reflections || !symbolSlug) return undefined;

    return getPersonalTraceForSymbol(reflections, symbolSlug, { preferJourney: Boolean(journeyTitle) });
  }, [journeyTitle, reflections, symbolSlug]);

  const waymark = useMemo(() => {
    if (!reflections) return null;

    return deriveCodexWaymark({
      entryId,
      personalWay: derivePersonalWay({ reflections }),
      symbolSlug,
    });
  }, [entryId, reflections, symbolSlug]);

  if (!reflection && !waymark) {
    return null;
  }

  const preview = reflection ? getReflectionPreview(reflection) : "";
  const contextLabel = reflection ? getReflectionContextLabel(reflection) : "";
  const traceRoomHref = reflection?.roomHref ?? roomHref;

  return (
    <section className="codex-personal-trace" aria-label={reflection ? "Dein Nachklang zu diesem Zeichen" : "Wegmarke"}>
      {reflection ? (
        <>
          <p className="symbol-kicker text-cyan-soft">Auf deinem Weg</p>
          {contextLabel ? (
            <p className="codex-personal-trace__context">{contextLabel}</p>
          ) : null}
          {preview ? (
            <p className="codex-personal-trace__preview">&bdquo;{preview}&ldquo;</p>
          ) : null}
        </>
      ) : null}

      {waymark ? (
        <div className="codex-personal-trace__waymark">
          <p className="symbol-kicker text-gold/75">Wegmarke</p>
          <p>{waymark.text}</p>
          {waymark.opening ? (
            <Link href={waymark.opening.href} className="codex-personal-trace__waymark-link">
              {waymark.opening.label}
            </Link>
          ) : null}
        </div>
      ) : null}

      {reflection ? (
        <div className="codex-personal-trace__actions">
          <Link href="/mein-pfad" className="symbol-archive-action">
            Den Weg ansehen
          </Link>
          {traceRoomHref ? (
            <Link href={traceRoomHref} className="symbol-archive-action symbol-archive-action--quiet">
              In den Raum zurueckkehren
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
